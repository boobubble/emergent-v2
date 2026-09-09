import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";
import {
  authorizeChatImageAssetAccess,
  denyImageAccessResponse,
  isRegistryAssetExpired,
  type ChatImageAssetRecord,
} from "./chat-image-access";
import {
  CHAT_IMAGES_BUCKET,
  CHAT_IMAGE_CLEANUP_BATCH,
  CHAT_IMAGE_ORPHAN_GRACE_MS,
  buildChatImageStoragePath,
  validateChatImageStoragePath,
} from "./chat-image-retention";
import type { Attachment } from "./chat-types";
import { isRemoteDmChannel, isUuid } from "./dm-utils";

export { authorizeChatImageAssetAccess } from "./chat-image-access";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function fromBase64(dataUrlOrB64: string): Uint8Array {
  const b64 = dataUrlOrB64.includes(",")
    ? dataUrlOrB64.slice(dataUrlOrB64.indexOf(",") + 1)
    : dataUrlOrB64;
  const bin = Buffer.from(b64, "base64");
  return new Uint8Array(bin.buffer, bin.byteOffset, bin.byteLength);
}

function assertCanUploadToChannel(channelId: string, userId: string) {
  if (!channelId || channelId.length > 200) throw new Error("Invalid channel");
  if (channelId === "lobby" || channelId === "games") return;
  if (channelId.startsWith("dm:")) {
    if (!isRemoteDmChannel(channelId, userId)) throw new Error("Forbidden");
    return;
  }
}

async function signedUrlForPath(path: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(CHAT_IMAGES_BUCKET)
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error(error?.message || "Could not sign image URL");
  return data.signedUrl;
}

async function loadAsset(assetId: string): Promise<ChatImageAssetRecord | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("chat_image_assets")
    .select("id, storage_path, uploader_id, channel_id, message_id, image_seen_at, image_expires_at, image_expired")
    .eq("id", assetId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ChatImageAssetRecord;
}

export const uploadChatImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((raw) =>
    z.object({
      channelId: z.string().min(1).max(200),
      name: z.string().min(1).max(120),
      mime: z.string().min(3).max(120),
      size: z.number().int().positive().max(MAX_IMAGE_BYTES),
      dataBase64: z.string().min(1),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    if (!data.mime.startsWith("image/")) throw new Error("Only images are supported");
    if (!isUuid(context.userId)) throw new Error("Unauthorized");
    assertCanUploadToChannel(data.channelId, context.userId);

    const bytes = fromBase64(data.dataBase64);
    if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("Image too large");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assetId = crypto.randomUUID();
    const storagePath = buildChatImageStoragePath(data.channelId, assetId, data.name);
    if (!validateChatImageStoragePath(storagePath)) throw new Error("Invalid storage path");

    const { error: rowErr } = await supabaseAdmin.from("chat_image_assets").insert({
      id: assetId,
      storage_path: storagePath,
      uploader_id: context.userId,
      channel_id: data.channelId,
    } as never);
    if (rowErr) throw new Error(rowErr.message);

    const { error: upErr } = await supabaseAdmin.storage
      .from(CHAT_IMAGES_BUCKET)
      .upload(storagePath, bytes, {
        contentType: data.mime,
        upsert: false,
      });
    if (upErr) {
      await supabaseAdmin.from("chat_image_assets").delete().eq("id", assetId);
      throw new Error(upErr.message);
    }

    const attachment: Attachment = {
      kind: "image",
      name: data.name,
      mime: data.mime,
      size: data.size,
      dataUrl: "",
      assetId,
    };
    return { assetId, attachment };
  });

export const resolveChatImageUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((raw) =>
    z.object({
      assetId: z.string().uuid(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    if (!isUuid(context.userId)) return denyImageAccessResponse();

    const asset = await loadAsset(data.assetId);
    if (!asset) return denyImageAccessResponse();

    if (!(await authorizeChatImageAssetAccess(context.supabase, context.userId, asset))) {
      return denyImageAccessResponse();
    }

    if (isRegistryAssetExpired(asset)) {
      return { url: null, expired: true, forbidden: false as const };
    }

    if (!validateChatImageStoragePath(asset.storage_path)) {
      return denyImageAccessResponse();
    }

    const url = await signedUrlForPath(asset.storage_path);
    return { url, expired: false, forbidden: false as const };
  });

async function deleteRegistryObject(asset: ChatImageAssetRecord): Promise<{ ok: boolean; error?: string }> {
  if (!validateChatImageStoragePath(asset.storage_path)) {
    return { ok: false, error: `invalid path ${asset.id}` };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: rmErr } = await supabaseAdmin.storage
    .from(CHAT_IMAGES_BUCKET)
    .remove([asset.storage_path]);
  if (rmErr && !/not found|does not exist/i.test(rmErr.message)) {
    return { ok: false, error: rmErr.message };
  }
  return { ok: true };
}

async function markAssetExpired(assetId: string, messageId: string | null): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("chat_image_assets")
    .update({ image_expired: true } as never)
    .eq("id", assetId);

  if (!messageId) return;

  const { data: row } = await supabaseAdmin
    .from("messages")
    .select("attachment")
    .eq("id", messageId)
    .maybeSingle();

  const att = (row?.attachment ?? null) as Attachment | null;
  if (!att?.assetId || att.assetId !== assetId) return;

  await supabaseAdmin
    .from("messages")
    .update({
      attachment: {
        ...att,
        dataUrl: "",
        imageExpired: true,
      } as never,
    })
    .eq("id", messageId);
}

export async function cleanupExpiredChatImages(): Promise<{
  scanned: number;
  deleted: number;
  marked: number;
  errors: string[];
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const errors: string[] = [];
  let scanned = 0;
  let deleted = 0;
  let marked = 0;
  const nowIso = new Date().toISOString();

  while (true) {
    const { data: rows, error } = await supabaseAdmin
      .from("chat_image_assets")
      .select("id, storage_path, message_id, image_expired, image_expires_at")
      .eq("image_expired", false)
      .not("image_expires_at", "is", null)
      .lte("image_expires_at", nowIso)
      .limit(CHAT_IMAGE_CLEANUP_BATCH);

    if (error) {
      errors.push(error.message);
      break;
    }

    const batch = (rows ?? []) as ChatImageAssetRecord[];
    if (batch.length === 0) break;

    scanned += batch.length;
    for (const asset of batch) {
      const del = await deleteRegistryObject(asset);
      if (!del.ok) {
        errors.push(`delete ${asset.id}: ${del.error}`);
        continue;
      }
      deleted += 1;
      try {
        await markAssetExpired(asset.id, asset.message_id);
        marked += 1;
      } catch (err) {
        errors.push(`mark ${asset.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (batch.length < CHAT_IMAGE_CLEANUP_BATCH) break;
  }

  return { scanned, deleted, marked, errors };
}

export async function cleanupOrphanChatImages(): Promise<{
  scanned: number;
  deleted: number;
  errors: string[];
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cutoff = new Date(Date.now() - CHAT_IMAGE_ORPHAN_GRACE_MS).toISOString();
  const errors: string[] = [];
  let scanned = 0;
  let deleted = 0;

  while (true) {
    const { data: rows, error } = await supabaseAdmin
      .from("chat_image_assets")
      .select("id, storage_path, message_id, image_expired, image_expires_at")
      .is("message_id", null)
      .eq("image_expired", false)
      .lt("created_at", cutoff)
      .limit(CHAT_IMAGE_CLEANUP_BATCH);

    if (error) {
      errors.push(error.message);
      break;
    }

    const batch = (rows ?? []) as ChatImageAssetRecord[];
    if (batch.length === 0) break;

    scanned += batch.length;
    for (const asset of batch) {
      const del = await deleteRegistryObject(asset);
      if (!del.ok) {
        errors.push(`orphan delete ${asset.id}: ${del.error}`);
        continue;
      }
      const { error: rmRow } = await supabaseAdmin
        .from("chat_image_assets")
        .delete()
        .eq("id", asset.id);
      if (rmRow) {
        errors.push(`orphan row ${asset.id}: ${rmRow.message}`);
        continue;
      }
      deleted += 1;
    }

    if (batch.length < CHAT_IMAGE_CLEANUP_BATCH) break;
  }

  return { scanned, deleted, errors };
}
