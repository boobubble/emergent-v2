import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function dmChannelFor(meId: string, peerId: string): string {
  return "dm:" + [meId, peerId].sort().join(":");
}

export const createWatchSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("watch.session")])
  .inputValidator((raw) =>
    z
      .object({
        peerId: z.string().uuid(),
        providerVideoId: z.string().regex(YOUTUBE_ID_RE),
      })
      .parse(raw),
  )
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
      .select(
        "id, channel_id, host_id, status, media_kind, provider, provider_video_id, started_at, ends_at",
      )
      .eq("channel_id", channelId)
      .eq("status", "active")
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      throw new Error("A Watch Together session is already active in this DM.");
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("watch_sessions")
      .insert({
        channel_id: channelId,
        host_id: userId,
        status: "active",
        media_kind: "youtube",
        provider: "youtube",
        provider_video_id: data.providerVideoId,
      })
      .select(
        "id, channel_id, host_id, status, media_kind, provider, provider_video_id, started_at, ends_at",
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

    const { error: updateError } = await supabaseAdmin
      .from("watch_sessions")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
      })
      .eq("id", data.sessionId)
      .eq("host_id", userId)
      .eq("status", "active");

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { ok: true, alreadyEnded: false };
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
        "id, channel_id, host_id, status, media_kind, provider, provider_video_id, started_at, ended_at, ends_at, created_at",
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
