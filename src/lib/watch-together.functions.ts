import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";
import { isRemoteDmChannel } from "./dm-utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function dmChannelFor(meId: string, peerId: string): string {
  return "dm:" + [meId, peerId].sort().join(":");
}

const createSessionInput = z
  .object({
    peerId: z.string().uuid(),
    sourceType: z.enum(["youtube", "upload"]),
    providerVideoId: z.string().regex(YOUTUBE_ID_RE).optional(),
    uploadStoragePath: z.string().min(1).max(512).optional(),
    uploadFilename: z.string().min(1).max(200).optional(),
    uploadMime: z.string().min(3).max(120).optional(),
    sourceTitle: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "youtube") {
      if (!data.providerVideoId) {
        ctx.addIssue({ code: "custom", message: "YouTube video id required." });
      }
    } else if (!data.uploadStoragePath || !data.uploadFilename || !data.uploadMime) {
      ctx.addIssue({ code: "custom", message: "Upload metadata required." });
    }
  });

async function insertWatchTogetherInviteMessage(args: {
  supabaseAdmin: Awaited<ReturnType<typeof import("@/integrations/supabase/client.server")>>["supabaseAdmin"];
  channelId: string;
  hostId: string;
  sessionId: string;
  sourceType: "youtube" | "upload";
  providerVideoId?: string | null;
  uploadFilename?: string | null;
  sourceTitle?: string | null;
}) {
  const title =
    args.sourceTitle ||
    (args.sourceType === "upload" ? args.uploadFilename : args.providerVideoId) ||
    "Watch Together";

  const inviteText =
    args.sourceType === "upload"
      ? "sent a video to watch together"
      : "invited you to watch a YouTube video together";

  const attachment = {
    __watchTogetherInvite: {
      sessionId: args.sessionId,
      sourceType: args.sourceType,
      providerVideoId: args.providerVideoId ?? undefined,
      uploadFilename: args.uploadFilename ?? undefined,
      sourceTitle: title,
      hostId: args.hostId,
    },
  };

  await args.supabaseAdmin.from("messages").insert({
    channel_id: args.channelId,
    author_id: args.hostId,
    text: inviteText,
    kind: "watch-together-invite",
    attachment: attachment as never,
    reply_to_id: null,
  });
}

async function endSessionById(
  supabaseAdmin: Awaited<ReturnType<typeof import("@/integrations/supabase/client.server")>>["supabaseAdmin"],
  sessionId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("watch_sessions")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export const createWatchSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("watch.session")])
  .inputValidator((raw) => createSessionInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };

    if (!isUuid(userId)) {
      throw new Error("Unauthorized");
    }

    if (data.peerId === userId) {
      throw new Error("You cannot start Watch Together with yourself.");
    }

    const channelId = dmChannelFor(userId, data.peerId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("watch_sessions")
      .select("id")
      .eq("channel_id", channelId)
      .eq("status", "active")
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      throw new Error("A Watch Together session is already active in this DM.");
    }

    const insertRow =
      data.sourceType === "youtube"
        ? {
            channel_id: channelId,
            host_id: userId,
            status: "active" as const,
            media_kind: "youtube" as const,
            provider: "youtube" as const,
            provider_video_id: data.providerVideoId!,
            source_title: data.sourceTitle ?? null,
          }
        : {
            channel_id: channelId,
            host_id: userId,
            status: "active" as const,
            media_kind: "upload" as const,
            provider: "upload" as const,
            provider_video_id: null,
            upload_storage_path: data.uploadStoragePath!,
            upload_filename: data.uploadFilename!,
            upload_mime: data.uploadMime!,
            source_title: data.sourceTitle ?? data.uploadFilename ?? null,
          };

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("watch_sessions")
      .insert(insertRow)
      .select(
        "id, channel_id, host_id, status, media_kind, provider, provider_video_id, upload_storage_path, upload_filename, upload_mime, source_title, started_at, ends_at",
      )
      .single();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    const { data: playback, error: playbackError } = await supabaseAdmin.rpc(
      "create_watch_playback_state",
      {
        _session_id: session.id,
        _host_id: userId,
      },
    );

    if (playbackError) {
      await supabaseAdmin
        .from("watch_sessions")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      throw new Error(playbackError.message);
    }

    try {
      await insertWatchTogetherInviteMessage({
        supabaseAdmin,
        channelId,
        hostId: userId,
        sessionId: session.id,
        sourceType: data.sourceType,
        providerVideoId: session.provider_video_id,
        uploadFilename: session.upload_filename,
        sourceTitle: session.source_title,
      });
    } catch (err) {
      console.error("[watch-together] invite message insert failed", err);
    }

    return {
      ok: true,
      session,
      playback,
    };
  });

export const endWatchSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("watch.session")])
  .inputValidator((raw) =>
    z
      .object({
        sessionId: z.string().uuid(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };

    if (!isUuid(userId)) {
      throw new Error("Unauthorized");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("watch_sessions")
      .select("id, host_id, status")
      .eq("id", data.sessionId)
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      throw new Error("Watch session not found.");
    }

    if (session.host_id !== userId) {
      throw new Error("Only the Watch Together host can end the session.");
    }

    if (session.status === "ended") {
      return { ok: true, alreadyEnded: true };
    }

    const ended = await endSessionById(supabaseAdmin, data.sessionId);
    return { ok: true, alreadyEnded: !ended };
  });

export const declineWatchSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("watch.session")])
  .inputValidator((raw) =>
    z
      .object({
        sessionId: z.string().uuid(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };

    if (!isUuid(userId)) {
      throw new Error("Unauthorized");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("watch_sessions")
      .select("id, host_id, channel_id, status")
      .eq("id", data.sessionId)
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      return { ok: true, alreadyEnded: true, unavailable: true };
    }

    if (session.status === "ended") {
      return { ok: true, alreadyEnded: true, unavailable: true };
    }

    if (session.host_id === userId) {
      throw new Error("The host cannot decline their own Watch Together invite.");
    }

    if (!isRemoteDmChannel(session.channel_id as string, userId)) {
      throw new Error("Forbidden");
    }

    const ended = await endSessionById(supabaseAdmin, data.sessionId);
    return { ok: true, alreadyEnded: !ended, unavailable: false };
  });

export const getWatchSessionById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        sessionId: z.string().uuid(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };

    if (!isUuid(userId)) {
      throw new Error("Unauthorized");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("watch_sessions")
      .select(
        "id, channel_id, host_id, status, media_kind, provider, provider_video_id, upload_storage_path, upload_filename, upload_mime, source_title, started_at, ended_at, ends_at, created_at",
      )
      .eq("id", data.sessionId)
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      return { ok: true, session: null, playback: null };
    }

    if (!isRemoteDmChannel(session.channel_id as string, userId)) {
      throw new Error("Forbidden");
    }

    if (session.status !== "active" || new Date(session.ends_at as string).getTime() <= Date.now()) {
      return { ok: true, session: null, playback: null };
    }

    const { data: playback, error: playbackError } = await supabaseAdmin
      .from("watch_playback_state")
      .select(
        "session_id, playing, position_ms, playback_rate, updated_at, updated_by, host_clock_ms",
      )
      .eq("session_id", session.id)
      .maybeSingle();

    if (playbackError) {
      throw new Error(playbackError.message);
    }

    return {
      ok: true,
      session,
      playback: playback ?? null,
    };
  });

export const updateWatchPlayback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("watch.playback")])
  .inputValidator((raw) =>
    z
      .object({
        sessionId: z.string().uuid(),
        playing: z.boolean(),
        positionMs: z.number().int().min(0),
        playbackRate: z.number().min(0.25).max(2),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };

    if (!isUuid(userId)) {
      throw new Error("Unauthorized");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("watch_sessions")
      .select("id, host_id, status, ends_at")
      .eq("id", data.sessionId)
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      throw new Error("Watch session not found.");
    }

    if (session.status !== "active") {
      throw new Error("Watch session is not active.");
    }

    if (session.host_id !== userId) {
      throw new Error("Only the Watch Together host can control playback.");
    }

    if (new Date(session.ends_at).getTime() <= Date.now()) {
      throw new Error("Watch session has expired.");
    }

    const { data: playback, error: playbackError } = await supabaseAdmin
      .from("watch_playback_state")
      .update({
        playing: data.playing,
        position_ms: data.positionMs,
        playback_rate: data.playbackRate,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("session_id", data.sessionId)
      .select(
        "session_id, playing, position_ms, playback_rate, updated_at, updated_by, host_clock_ms",
      )
      .single();

    if (playbackError) {
      throw new Error(playbackError.message);
    }

    return {
      ok: true,
      playback,
    };
  });

export const getActiveWatchSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        peerId: z.string().uuid(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };

    if (!isUuid(userId)) {
      throw new Error("Unauthorized");
    }

    if (data.peerId === userId) {
      throw new Error("Invalid Watch Together peer.");
    }

    const channelId = dmChannelFor(userId, data.peerId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("watch_sessions")
      .select(
        "id, channel_id, host_id, status, media_kind, provider, provider_video_id, upload_storage_path, upload_filename, upload_mime, source_title, started_at, ended_at, ends_at, created_at",
      )
      .eq("channel_id", channelId)
      .eq("status", "active")
      .gt("ends_at", new Date().toISOString())
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      return { ok: true, session: null, playback: null };
    }

    const { data: playback, error: playbackError } = await supabaseAdmin
      .from("watch_playback_state")
      .select(
        "session_id, playing, position_ms, playback_rate, updated_at, updated_by, host_clock_ms",
      )
      .eq("session_id", session.id)
      .maybeSingle();

    if (playbackError) {
      throw new Error(playbackError.message);
    }

    return {
      ok: true,
      session,
      playback: playback ?? null,
    };
  });
