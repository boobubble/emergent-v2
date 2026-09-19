import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";
import {
  denyImageAccessResponse,
  isRegistryAssetExpired,
  type ChatImageAssetRecord,
} from "./chat-image-access";
import { CHAT_IMAGES_BUCKET } from "./chat-image-retention";
import {
  IRC_CHAT_ATTACHMENT_MAX_BYTES,
  buildIrcAttachmentStoragePath,
  classifyIrcAttachmentMime,
  ircChatAttachmentChannelId,
  sanitizeAttachmentDisplayName,
  validateIrcAttachmentStoragePath,
} from "./irc-chat/irc-attachment-retention";
import { authorizeIrcChatAttachmentAccess } from "./irc-chat/irc-attachment-access";
import { isUuid } from "./dm-utils";

function fromBase64(dataUrlOrB64: string): Uint8Array {
  const b64 = dataUrlOrB64.includes(",")
    ? dataUrlOrB64.slice(dataUrlOrB64.indexOf(",") + 1)
    : dataUrlOrB64;
  const bin = Buffer.from(b64, "base64");
  return new Uint8Array(bin.buffer, bin.byteOffset, bin.byteLength);
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

async function signedUrlForPath(path: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(CHAT_IMAGES_BUCKET)
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error(error?.message || "Could not sign attachment URL");
  return data.signedUrl;
}

export const uploadIrcChatAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .inputValidator((raw) =>
    z.object({
      roomId: z.string().min(1).max(64),
      name: z.string().min(1).max(120),
      mime: z.string().min(3).max(120),
      size: z.number().int().positive().max(IRC_CHAT_ATTACHMENT_MAX_BYTES),
      dataBase64: z.string().min(1),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    if (!isUuid(context.userId)) throw new Error("Unauthorized");
    const room = data.roomId.trim();
    const kind = classifyIrcAttachmentMime(data.mime);
    if (!kind) throw new Error("Unsupported file type");

    const bytes = fromBase64(data.dataBase64);
    if (bytes.byteLength > IRC_CHAT_ATTACHMENT_MAX_BYTES) throw new Error("File too large");

    const channelId = ircChatAttachmentChannelId(room);
    const safeName = sanitizeAttachmentDisplayName(data.name);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assetId = crypto.randomUUID();
    const storagePath = buildIrcAttachmentStoragePath(room, assetId, safeName);
    if (!validateIrcAttachmentStoragePath(storagePath)) throw new Error("Invalid storage path");

    const { error: rowErr } = await supabaseAdmin.from("chat_image_assets").insert({
      id: assetId,
      storage_path: storagePath,
      uploader_id: context.userId,
      channel_id: channelId,
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

    return {
      assetId,
      contentType: kind,
      attachment: {
        id: assetId,
        mimeType: data.mime,
        fileName: safeName,
        size: data.size,
      },
    };
  });

export const resolveIrcChatAttachmentUrl = createServerFn({ method: "POST" })
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
    if (!authorizeIrcChatAttachmentAccess(context.userId, asset)) {
      return denyImageAccessResponse();
    }
    if (isRegistryAssetExpired(asset)) {
      return { url: null, expired: true, forbidden: false as const };
    }
    try {
      const url = await signedUrlForPath(asset.storage_path);
      return { url, expired: false, forbidden: false as const };
    } catch {
      return denyImageAccessResponse();
    }
  });
