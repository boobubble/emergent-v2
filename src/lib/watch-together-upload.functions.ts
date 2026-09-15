import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";
import { isRemoteDmChannel, isUuid } from "./dm-utils";

export const WATCH_TOGETHER_VIDEOS_BUCKET = "watch-together-media";
export const MAX_WATCH_UPLOAD_BYTES = 100 * 1024 * 1024;
export const ALLOWED_WATCH_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

function fromBase64(dataUrlOrB64: string): Uint8Array {
  const b64 = dataUrlOrB64.includes(",")
    ? dataUrlOrB64.slice(dataUrlOrB64.indexOf(",") + 1)
    : dataUrlOrB64;
  const bin = Buffer.from(b64, "base64");
  return new Uint8Array(bin.buffer, bin.byteOffset, bin.byteLength);
}

function buildWatchUploadPath(channelId: string, assetId: string, fileName: string): string {
  const safeChannel = channelId.replace(/[^a-zA-Z0-9:_-]+/g, "_").slice(0, 200);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "video.mp4";
  return `dm/${safeChannel}/${assetId}/${safeName}`;
}

export const uploadWatchTogetherVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("watch.session")])
  .inputValidator((raw) =>
    z
      .object({
        channelId: z.string().min(1).max(200),
        name: z.string().min(1).max(200),
        mime: z.string().min(3).max(120),
        size: z.number().int().positive().max(MAX_WATCH_UPLOAD_BYTES),
        dataBase64: z.string().min(1),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    if (!isUuid(userId)) throw new Error("Unauthorized");
    if (!isRemoteDmChannel(data.channelId, userId)) throw new Error("Forbidden");
    if (!ALLOWED_WATCH_VIDEO_MIMES.includes(data.mime as (typeof ALLOWED_WATCH_VIDEO_MIMES)[number])) {
      throw new Error("Unsupported video format. Use MP4, WebM, or MOV.");
    }

    const bytes = fromBase64(data.dataBase64);
    if (bytes.byteLength > MAX_WATCH_UPLOAD_BYTES) throw new Error("Video too large (max 100 MB).");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assetId = crypto.randomUUID();
    const storagePath = buildWatchUploadPath(data.channelId, assetId, data.name);

    const { error: upErr } = await supabaseAdmin.storage
      .from(WATCH_TOGETHER_VIDEOS_BUCKET)
      .upload(storagePath, bytes, {
        contentType: data.mime,
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message);

    return {
      storagePath,
      filename: data.name,
      mime: data.mime,
      size: data.size,
    };
  });

export const resolveWatchTogetherVideoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((raw) =>
    z
      .object({
        sessionId: z.string().uuid(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    if (!isUuid(userId)) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session, error } = await supabaseAdmin
      .from("watch_sessions")
      .select("id, channel_id, media_kind, upload_storage_path, status, ends_at")
      .eq("id", data.sessionId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!session || session.status !== "active") throw new Error("Watch session not found.");
    if (session.media_kind !== "upload" || !session.upload_storage_path) {
      throw new Error("Session has no uploaded video.");
    }

    const channelId = session.channel_id as string;
    if (!isRemoteDmChannel(channelId, userId)) throw new Error("Forbidden");

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(WATCH_TOGETHER_VIDEOS_BUCKET)
      .createSignedUrl(session.upload_storage_path as string, 3600);

    if (signErr || !signed?.signedUrl) {
      throw new Error(signErr?.message || "Could not resolve video URL.");
    }

    return { url: signed.signedUrl };
  });
