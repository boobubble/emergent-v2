import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useServerFn } from "@tanstack/react-start";
import {
  createWatchSession,
  declineWatchSession,
  endWatchSession,
  getActiveWatchSession,
  getWatchSessionById,
  updateWatchPlayback,
} from "@/lib/watch-together.functions";
import { resolveWatchTogetherVideoUrl } from "@/lib/watch-together-upload.functions";
import {
  clearWatchInviteResolution,
  registerWatchTogetherInviteHandlers,
  setWatchInviteResolution,
  type WatchTogetherInviteActionArgs,
} from "@/lib/watch-together-actions";
import { isRemoteDmChannel, parseDmChannel } from "@/lib/dm-utils";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import {
  useYouTubePlayer,
  type YouTubePlaybackAction,
} from "@/components/chat/youtube-player-context";
import {
  classifyDrift,
  computeDriftSeconds,
  expectedFromBroadcast,
  expectedFromPlayback,
  wtDebugLog,
  WATCH_RT_EVENT_PARTICIPANT_DECLINED,
  WATCH_RT_EVENT_PARTICIPANT_JOINED,
  WATCH_RT_EVENT_PLAYBACK,
  WATCH_SYNC_HOST_BROADCAST_MS,
  WATCH_SYNC_PERSIST_MS,
  WATCH_SYNC_VIEWER_DRIFT_INTERVAL_MS,
  type WatchParticipantDeclinedPayload,
  type WatchParticipantJoinedPayload,
  type WatchSyncPayload,
} from "@/lib/watch-together-sync";

export type WatchSession = {
  id: string;
  channel_id: string;
  host_id: string;
  status: "active" | "ended";
  media_kind: "youtube" | "upload";
  provider: "youtube" | "upload";
  provider_video_id: string | null;
  upload_storage_path?: string | null;
  upload_filename?: string | null;
  upload_mime?: string | null;
  source_title?: string | null;
  started_at: string;
  ended_at?: string | null;
  ends_at: string;
  created_at?: string;
};

export type WatchPlayback = {
  session_id: string;
  playing: boolean;
  position_ms: number;
  playback_rate: number;
  updated_at: string;
  updated_by: string;
  host_clock_ms?: number | null;
};

export type StartWatchTogetherInput =
  | { sourceType: "youtube"; providerVideoId: string; sourceTitle?: string }
  | {
      sourceType: "upload";
      uploadStoragePath: string;
      uploadFilename: string;
      uploadMime: string;
      sourceTitle?: string;
    };

export type WatchTogetherPhase = "idle" | "waiting" | "watching" | "ended";

function positionMsFromSeconds(seconds: number): number {
  return Math.max(0, Math.round(seconds * 1000));
}

export type UseWatchTogetherArgs = {
  channelId: string | null;
  authUserId?: string | null;
  peerName?: string;
};

export function useWatchTogether(
  channelIdOrOpts: string | null | UseWatchTogetherArgs,
  authUserIdArg?: string | null,
) {
  const channelId =
    channelIdOrOpts && typeof channelIdOrOpts === "object"
      ? channelIdOrOpts.channelId
      : channelIdOrOpts;
  const authUserId =
    channelIdOrOpts && typeof channelIdOrOpts === "object"
      ? channelIdOrOpts.authUserId ?? authUserIdArg
      : authUserIdArg;
  const peerNameArg =
    channelIdOrOpts && typeof channelIdOrOpts === "object"
      ? channelIdOrOpts.peerName ?? "your friend"
      : "your friend";

  const player = useYouTubePlayer();
  const resolveUploadUrlFn = useServerFn(resolveWatchTogetherVideoUrl);
  const declineSessionFn = useServerFn(declineWatchSession);
  const getSessionByIdFn = useServerFn(getWatchSessionById);
  const {
    playerControlRef,
    setPlaybackControlPolicy,
    setPlaying,
    closePlayer,
    openPlayer,
    openUploadPlayer,
    restorePlayer,
    setPresentationMode,
    isPlaying,
    currentTime,
  } = player;

  const [session, setSession] = useState<WatchSession | null>(null);
  const [playback, setPlayback] = useState<WatchPlayback | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [joining, setJoining] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<WatchTogetherPhase>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [peerJoined, setPeerJoined] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const realtimeSubscribedRef = useRef(false);
  const sessionRef = useRef<WatchSession | null>(null);
  const isHostRef = useRef(false);
  const lastPersistRef = useRef(0);
  const applyingRemoteRef = useRef(false);
  const hostActionInProgressRef = useRef(false);
  const lastLocalActionRef = useRef<{ action: string; at: number } | null>(null);
  const openedSessionRef = useRef<string | null>(null);
  const lastHostSyncRef = useRef<WatchSyncPayload | null>(null);
  const joinedUsersRef = useRef<Set<string>>(new Set());
  const resolvedInviteRef = useRef<Set<string>>(new Set());
  const playerSnapshotRef = useRef({ isPlaying: false, currentTime: 0 });
  const playerApiRef = useRef(player);
  const peerIdRef = useRef<string | null>(null);
  const phaseRef = useRef<WatchTogetherPhase>("idle");

  playerSnapshotRef.current = { isPlaying, currentTime };
  playerApiRef.current = player;
  phaseRef.current = phase;

  const remoteDmEnabled = Boolean(
    channelId && authUserId && isRemoteDmChannel(channelId, authUserId),
  );

  useEffect(() => {
    sessionRef.current = session;
    isHostRef.current = Boolean(session && authUserId && session.host_id === authUserId);
  }, [session, authUserId]);

  const readLocalPositionSeconds = useCallback((): number => {
    const controls = playerApiRef.current.playerControlRef.current;
    if (controls?.getCurrentTime) {
      return Math.max(0, controls.getCurrentTime());
    }
    return Math.max(0, playerSnapshotRef.current.currentTime || 0);
  }, []);

  const readLocalPlaying = useCallback((): boolean => {
    const controls = playerApiRef.current.playerControlRef.current;
    if (controls?.isPlayerPlaying) {
      return controls.isPlayerPlaying();
    }
    return playerSnapshotRef.current.isPlaying;
  }, []);

  const silent = { silent: true as const };

  const pausePlayerAt = useCallback((seconds = 0) => {
    const controls = playerApiRef.current.playerControlRef.current;
    applyingRemoteRef.current = true;
    controls?.seek(seconds, silent);
    controls?.pause(silent);
    playerApiRef.current.setPlaying(false);
    applyingRemoteRef.current = false;
  }, []);

  const applyRemoteSync = useCallback(
    (payload: WatchSyncPayload, opts?: { forceSeek?: boolean }) => {
      if (phaseRef.current !== "watching" && !isHostRef.current) return;

      const controls = playerApiRef.current.playerControlRef.current;
      if (!controls) return;

      const expected = expectedFromBroadcast(
        payload.positionSeconds,
        payload.playing,
        payload.sentAt,
      );
      const current = readLocalPositionSeconds();
      const drift = computeDriftSeconds(expected, current);
      const driftKind = classifyDrift(drift);
      const shouldSeek =
        opts?.forceSeek || driftKind === "hard" || driftKind === "soft" || payload.action === "seek";

      wtDebugLog("receive", {
        role: isHostRef.current ? "host" : "receiver",
        sessionId: payload.sessionId,
        action: payload.action,
        position: payload.positionSeconds,
        expected,
        current,
        drift,
        driftKind,
      });

      applyingRemoteRef.current = true;

      if (shouldSeek) {
        controls.seek(expected, silent);
      }

      if (payload.playing) {
        controls.play(silent);
      } else {
        controls.pause(silent);
      }

      playerApiRef.current.setPlaying(payload.playing);
      applyingRemoteRef.current = false;
      lastHostSyncRef.current = payload;

      if (!isHostRef.current && payload.playing) {
        playerApiRef.current.setPresentationMode("cinematic");
      }

      if (driftKind !== "none") {
        wtDebugLog("correction", {
          role: isHostRef.current ? "host" : "receiver",
          sessionId: payload.sessionId,
          expected,
          current,
          drift,
          driftKind,
        });
      }
    },
    [readLocalPositionSeconds],
  );

  const broadcastSync = useCallback(
    async (action: WatchSyncPayload["action"], playingOverride?: boolean, positionOverride?: number) => {
      const ch = channelRef.current;
      const currentSession = sessionRef.current;
      if (!ch || !currentSession || !isHostRef.current || applyingRemoteRef.current) {
        return;
      }
      if (phaseRef.current !== "watching") return;
      if (hostActionInProgressRef.current && action === "heartbeat") return;

      const playing = playingOverride ?? readLocalPlaying();
      const positionSeconds = positionOverride ?? readLocalPositionSeconds();

      const payload: WatchSyncPayload = {
        sessionId: currentSession.id,
        action,
        positionSeconds,
        playing,
        sentAt: Date.now(),
      };

      wtDebugLog("broadcast", {
        role: "host",
        sessionId: currentSession.id,
        action,
        position: positionSeconds,
        playing,
      });

      await ch.send({
        type: "broadcast",
        event: WATCH_RT_EVENT_PLAYBACK,
        payload,
      });
      lastHostSyncRef.current = payload;
    },
    [readLocalPlaying, readLocalPositionSeconds],
  );

  const persistPlayback = useCallback(async (force = false) => {
    const currentSession = sessionRef.current;
    if (!currentSession || !isHostRef.current || applyingRemoteRef.current) return;
    if (phaseRef.current !== "watching") return;

    const now = Date.now();
    if (!force && now - lastPersistRef.current < WATCH_SYNC_PERSIST_MS) return;

    lastPersistRef.current = now;

    try {
      const result = await updateWatchPlayback({
        data: {
          sessionId: currentSession.id,
          playing: readLocalPlaying(),
          positionMs: positionMsFromSeconds(readLocalPositionSeconds()),
          playbackRate: 1,
        },
      });

      if (result?.playback) {
        setPlayback(result.playback as WatchPlayback);
      }
    } catch (err) {
      console.error("[watch-together] playback persistence failed", err);
    }
  }, [readLocalPlaying, readLocalPositionSeconds]);

  const beginSyncedPlayback = useCallback(async () => {
    if (phaseRef.current === "watching") return;
    setPhase("watching");
    setStatusMessage(`${peerNameArg} joined • Watching together`);
    setPeerJoined(true);

    playerApiRef.current.setPresentationMode("cinematic");
    try {
      await playerApiRef.current.waitForCinematicMount();
    } catch (err) {
      console.warn("[watch-together] cinematic mount wait failed, continuing", err);
    }

    const controls = playerApiRef.current.playerControlRef.current;
    applyingRemoteRef.current = true;
    hostActionInProgressRef.current = true;
    controls?.seek(0, silent);
    controls?.play(silent);
    playerApiRef.current.setPlaying(true);
    applyingRemoteRef.current = false;
    hostActionInProgressRef.current = false;

    wtDebugLog("host action", {
      role: "host",
      sessionId: sessionRef.current?.id,
      action: "beginSyncedPlayback",
      position: 0,
    });

    setPlayback((prev) =>
      prev
        ? { ...prev, playing: true, position_ms: 0, updated_at: new Date().toISOString() }
        : prev,
    );

    await persistPlayback(true);
    await broadcastSync("play", true, 0);
  }, [broadcastSync, peerNameArg, persistPlayback]);

  const finishHostAction = useCallback(() => {
    window.setTimeout(() => {
      hostActionInProgressRef.current = false;
    }, 150);
  }, []);

  const handleLocalAction = useCallback(
    (action: YouTubePlaybackAction) => {
      if (applyingRemoteRef.current || hostActionInProgressRef.current) return;
      if (phaseRef.current !== "watching") return;
      const currentSession = sessionRef.current;
      if (!currentSession || !channelRef.current || !isHostRef.current) return;

      hostActionInProgressRef.current = true;
      lastLocalActionRef.current = { action: action.type, at: Date.now() };

      const publish = () => {
        const position =
          action.type === "seek"
            ? action.seconds
            : readLocalPositionSeconds();
        const playing =
          action.type === "play"
            ? true
            : action.type === "pause"
              ? false
              : readLocalPlaying();

        wtDebugLog("host action", {
          role: "host",
          sessionId: currentSession.id,
          action: action.type,
          position,
          playing,
        });

        if (action.type === "play") {
          void broadcastSync("play", true, position);
        } else if (action.type === "pause") {
          void broadcastSync("pause", false, position);
        } else if (action.type === "seek") {
          void broadcastSync("seek", playing, position);
        }

        void persistPlayback(true).finally(finishHostAction);
      };

      // Read player state after the iframe API has applied play/pause/seek.
      if (action.type === "play" || action.type === "pause") {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(publish);
        });
      } else {
        publish();
      }
    },
    [broadcastSync, finishHostAction, persistPlayback, readLocalPlaying, readLocalPositionSeconds],
  );

  const teardownSession = useCallback((message?: string | null) => {
    setSession(null);
    setPlayback(null);
    openedSessionRef.current = null;
    joinedUsersRef.current.clear();
    setPeerJoined(false);
    setPhase("ended");
    setStatusMessage(message ?? null);
    playerApiRef.current.setPlaybackControlPolicy(null);
    playerApiRef.current.setPresentationMode("floating");
    playerApiRef.current.closePlayer();
    window.setTimeout(() => {
      setPhase("idle");
      if (!message) setStatusMessage(null);
    }, 4000);
  }, []);

  const refreshSession = useCallback(async () => {
    const peerId = peerIdRef.current;
    if (!peerId) return null;

    const result = await getActiveWatchSession({ data: { peerId } });
    const nextSession = result?.session as WatchSession | null;
    const nextPlayback = result?.playback as WatchPlayback | null;
    setSession(nextSession);
    setPlayback(nextPlayback);
    if (!nextSession) {
      openedSessionRef.current = null;
      setPhase("idle");
    }
    return { session: nextSession, playback: nextPlayback };
  }, []);

  const loadSessionById = useCallback(
    async (sessionId: string) => {
      const result = await getSessionByIdFn({ data: { sessionId } });
      const nextSession = result?.session as WatchSession | null;
      const nextPlayback = result?.playback as WatchPlayback | null;
      if (!nextSession) {
        setWatchInviteResolution(sessionId, "expired");
        throw new Error("This Watch Together session is no longer available.");
      }
      setSession(nextSession);
      setPlayback(nextPlayback);
      sessionRef.current = nextSession;
      return { session: nextSession, playback: nextPlayback };
    },
    [getSessionByIdFn],
  );

  const openSessionPlayer = useCallback(
    async (nextSession: WatchSession, autoplay = false) => {
      const title = nextSession.source_title || "Watch Together";

      playerApiRef.current.setPresentationMode("floating");

      if (nextSession.media_kind === "youtube" && nextSession.provider_video_id) {
        playerApiRef.current.openPlayer({
          videoId: nextSession.provider_video_id,
          url: `https://youtu.be/${nextSession.provider_video_id}`,
          title,
          autoplay,
        });
      } else if (nextSession.media_kind === "upload") {
        const resolved = await resolveUploadUrlFn({ data: { sessionId: nextSession.id } });
        playerApiRef.current.openUploadPlayer({
          url: resolved.url,
          title,
        });
      } else {
        throw new Error("Unsupported Watch Together media.");
      }

      openedSessionRef.current = nextSession.id;

      const timer = window.setInterval(() => {
        if (!playerApiRef.current.playerControlRef.current) return;
        pausePlayerAt(0);
        window.clearInterval(timer);
      }, 250);
    },
    [pausePlayerAt, resolveUploadUrlFn],
  );

  const broadcastParticipantJoined = useCallback(async (sessionId: string) => {
    const ch = channelRef.current;
    if (!ch || !authUserId) return;
    const payload: WatchParticipantJoinedPayload = {
      sessionId,
      userId: authUserId,
      joinedAt: Date.now(),
    };
    await ch.send({
      type: "broadcast",
      event: WATCH_RT_EVENT_PARTICIPANT_JOINED,
      payload,
    });
  }, [authUserId]);

  const broadcastParticipantDeclined = useCallback(async (sessionId: string) => {
    const ch = channelRef.current;
    if (!ch || !authUserId) return;
    const payload: WatchParticipantDeclinedPayload = {
      sessionId,
      userId: authUserId,
      declinedAt: Date.now(),
    };
    await ch.send({
      type: "broadcast",
      event: WATCH_RT_EVENT_PARTICIPANT_DECLINED,
      payload,
    });
  }, [authUserId]);

  const waitForWatchChannel = useCallback(async (sessionId: string, timeoutMs = 5000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (
        channelRef.current &&
        sessionRef.current?.id === sessionId &&
        realtimeSubscribedRef.current
      ) {
        return channelRef.current;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
    throw new Error("Watch Together connection timed out. Open this DM and try again.");
  }, []);

  const acceptInvite = useCallback(
    async ({ sessionId, channelId: inviteChannelId }: WatchTogetherInviteActionArgs) => {
      if (!authUserId) {
        throw new Error("Sign in to join Watch Together.");
      }
      if (resolvedInviteRef.current.has(sessionId)) {
        return;
      }

      setJoining(true);
      setError(null);

      try {
        const { session: nextSession } = await loadSessionById(sessionId);
        if (nextSession.channel_id !== inviteChannelId) {
          throw new Error("This invite does not match the current conversation.");
        }
        if (nextSession.host_id === authUserId) {
          throw new Error("You started this Watch Together session.");
        }
        if (nextSession.status !== "active") {
          setWatchInviteResolution(sessionId, "expired");
          throw new Error("This Watch Together session is no longer available.");
        }

        resolvedInviteRef.current.add(sessionId);
        setWatchInviteResolution(sessionId, "accepted");
        setPhase("watching");
        setPeerJoined(true);

        await waitForWatchChannel(sessionId);
        await openSessionPlayer(nextSession, false);
        playerApiRef.current.setPresentationMode("cinematic");
        try {
          await playerApiRef.current.waitForCinematicMount();
        } catch (err) {
          console.warn("[watch-together] receiver cinematic mount wait failed", err);
        }
        await broadcastParticipantJoined(sessionId);
        // Stay paused at 0 until the host broadcasts authoritative PLAY.
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to join Watch Together.";
        setError(message);
        console.error("[watch-together] accept invite failed", err);
        throw err;
      } finally {
        setJoining(false);
      }
    },
    [
      authUserId,
      channelId,
      broadcastParticipantJoined,
      loadSessionById,
      openSessionPlayer,
      waitForWatchChannel,
    ],
  );

  const rejectInvite = useCallback(
    async ({ sessionId }: WatchTogetherInviteActionArgs) => {
      if (!authUserId) {
        throw new Error("Sign in to decline Watch Together.");
      }
      if (resolvedInviteRef.current.has(sessionId)) {
        return;
      }

      setRejecting(true);
      setError(null);

      try {
        await waitForWatchChannel(sessionId);
        resolvedInviteRef.current.add(sessionId);
        setWatchInviteResolution(sessionId, "declined");

        await broadcastParticipantDeclined(sessionId);
        const result = await declineSessionFn({ data: { sessionId } });
        if (result?.unavailable) {
          setWatchInviteResolution(sessionId, "expired");
          throw new Error("This Watch Together session is no longer available.");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to decline Watch Together.";
        setError(message);
        console.error("[watch-together] reject invite failed", err);
        throw err;
      } finally {
        setRejecting(false);
      }
    },
    [authUserId, channelId, broadcastParticipantDeclined, declineSessionFn, waitForWatchChannel],
  );

  useEffect(() => {
    if (!remoteDmEnabled || !channelId) return;
    return registerWatchTogetherInviteHandlers(channelId, {
      acceptInvite,
      rejectInvite,
    });
  }, [remoteDmEnabled, channelId, acceptInvite, rejectInvite]);

  useEffect(() => {
    if (!remoteDmEnabled || !channelId || !authUserId) {
      setSession(null);
      setPlayback(null);
      setError(null);
      setPhase("idle");
      peerIdRef.current = null;
      return;
    }

    const parsed = parseDmChannel(channelId, authUserId);
    const peerId = parsed.valid ? parsed.peerId : null;
    peerIdRef.current = peerId;

    if (!peerId) {
      setSession(null);
      setPlayback(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getActiveWatchSession({ data: { peerId } })
      .then((result) => {
        if (cancelled) return;
        const nextSession = result?.session as WatchSession | null;
        const nextPlayback = result?.playback as WatchPlayback | null;
        setSession(nextSession);
        setPlayback(nextPlayback);
        if (nextSession) {
          if (nextSession.host_id === authUserId) {
            setPhase(nextPlayback?.playing ? "watching" : "waiting");
            setStatusMessage(`Waiting for ${peerNameArg} to join…`);
          } else if (nextPlayback?.playing) {
            setPhase("watching");
          }
        } else {
          openedSessionRef.current = null;
          setPhase("idle");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[watch-together] load failed", err);
        setError(err instanceof Error ? err.message : "Unable to load Watch Together.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [remoteDmEnabled, channelId, authUserId, peerNameArg]);

  useEffect(() => {
    if (!remoteDmEnabled || !session) {
      playerApiRef.current.setPlaybackControlPolicy(null);
      return;
    }

    playerApiRef.current.setPlaybackControlPolicy({
      canControlPlayback: session.host_id === authUserId && phase === "watching",
      onLocalPlaybackAction: handleLocalAction,
    });

    return () => {
      playerApiRef.current.setPlaybackControlPolicy(null);
    };
  }, [remoteDmEnabled, session, authUserId, phase, handleLocalAction]);

  useEffect(() => {
    if (!remoteDmEnabled || !session || !authUserId) return;

    let cancelled = false;
    let realtimeChannel: RealtimeChannel | null = null;

    void loadBrowserSupabase().then((supabase) => {
      if (cancelled) return;

      const ch = supabase.channel(`watch:${session.id}`, {
        config: { broadcast: { self: false } },
      });

      ch.on("broadcast", { event: WATCH_RT_EVENT_PLAYBACK }, (msg) => {
        const payload = msg.payload as WatchSyncPayload;
        if (!payload || payload.sessionId !== session.id) return;

        if (payload.action === "ended") {
          if (isHostRef.current) return;
          clearWatchInviteResolution(session.id);
          teardownSession(null);
          return;
        }

        if (isHostRef.current) return;
        if (phaseRef.current !== "watching") return;

        applyRemoteSync(payload, {
          forceSeek:
            payload.action === "seek" ||
            payload.action === "sync" ||
            payload.action === "heartbeat" ||
            payload.action === "play",
        });
        setPlayback((prev) =>
          prev
            ? {
                ...prev,
                playing: payload.playing,
                position_ms: positionMsFromSeconds(payload.positionSeconds),
                updated_at: new Date().toISOString(),
              }
            : prev,
        );
      });

      ch.on("broadcast", { event: WATCH_RT_EVENT_PARTICIPANT_JOINED }, (msg) => {
        const payload = msg.payload as WatchParticipantJoinedPayload;
        if (!payload || payload.sessionId !== session.id || !isHostRef.current) return;
        if (joinedUsersRef.current.has(payload.userId)) return;
        joinedUsersRef.current.add(payload.userId);
        void beginSyncedPlayback();
      });

      ch.on("broadcast", { event: WATCH_RT_EVENT_PARTICIPANT_DECLINED }, (msg) => {
        const payload = msg.payload as WatchParticipantDeclinedPayload;
        if (!payload || payload.sessionId !== session.id || !isHostRef.current) return;
        if (joinedUsersRef.current.has(payload.userId)) return;
        joinedUsersRef.current.add(payload.userId);
        setWatchInviteResolution(session.id, "declined");
        void (async () => {
          try {
            await endWatchSession({ data: { sessionId: session.id } });
          } catch (err) {
            console.error("[watch-together] end after decline failed", err);
          }
          teardownSession(`${peerNameArg} declined the Watch Together invite.`);
        })();
      });

      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          realtimeSubscribedRef.current = true;
          void refreshSession().then((result) => {
            if (!result?.session || !result.playback) return;
            if (isHostRef.current) return;
            if (result.playback.playing && phaseRef.current !== "watching") {
              void openSessionPlayer(result.session, false).then(() => {
                applyRemoteSync(
                  {
                    sessionId: result.session!.id,
                    action: "sync",
                    positionSeconds: expectedFromPlayback(result.playback!),
                    playing: true,
                    sentAt: Date.now(),
                  },
                  { forceSeek: true },
                );
                setPhase("watching");
              });
            }
          });
        }
      });

      realtimeChannel = ch;
      channelRef.current = ch;
    });

    return () => {
      cancelled = true;
      realtimeSubscribedRef.current = false;
      if (realtimeChannel) {
        void loadBrowserSupabase().then((supabase) => {
          void supabase.removeChannel(realtimeChannel);
        });
      }
      channelRef.current = null;
    };
  }, [
    remoteDmEnabled,
    session?.id,
    authUserId,
    applyRemoteSync,
    beginSyncedPlayback,
    openSessionPlayer,
    peerNameArg,
    refreshSession,
    teardownSession,
  ]);

  useEffect(() => {
    if (!remoteDmEnabled || !session || !isHostRef.current || phase !== "watching") return;

    const timer = window.setInterval(() => {
      void broadcastSync("heartbeat");
      void persistPlayback(false);
    }, WATCH_SYNC_HOST_BROADCAST_MS);

    return () => window.clearInterval(timer);
  }, [remoteDmEnabled, session, phase, broadcastSync, persistPlayback]);

  useEffect(() => {
    if (!remoteDmEnabled || !session || isHostRef.current || phase !== "watching") return;

    const timer = window.setInterval(() => {
      const hostSync = lastHostSyncRef.current;
      const controls = playerApiRef.current.playerControlRef.current;
      if (!hostSync || !controls) return;

      const expected = expectedFromBroadcast(
        hostSync.positionSeconds,
        hostSync.playing,
        hostSync.sentAt,
      );
      const current = readLocalPositionSeconds();
      const drift = computeDriftSeconds(expected, current);
      const driftKind = classifyDrift(drift);

      if (driftKind === "none") {
        if (hostSync.playing !== readLocalPlaying()) {
          applyingRemoteRef.current = true;
          if (hostSync.playing) controls.play(silent);
          else controls.pause(silent);
          playerApiRef.current.setPlaying(hostSync.playing);
          applyingRemoteRef.current = false;
        }
        return;
      }

      applyRemoteSync(hostSync, { forceSeek: driftKind === "hard" || driftKind === "soft" });
    }, WATCH_SYNC_VIEWER_DRIFT_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [remoteDmEnabled, session, phase, applyRemoteSync, readLocalPositionSeconds]);

  useEffect(() => {
    if (!remoteDmEnabled || !session || !isHostRef.current || phase !== "waiting") return;

    const timer = window.setInterval(() => {
      if (phaseRef.current !== "waiting") return;
      if (!readLocalPlaying()) return;
      wtDebugLog("host action", {
        role: "host",
        sessionId: session.id,
        action: "force-pause-waiting",
        position: readLocalPositionSeconds(),
      });
      pausePlayerAt(readLocalPositionSeconds());
    }, 400);

    return () => window.clearInterval(timer);
  }, [remoteDmEnabled, session, phase, pausePlayerAt, readLocalPlaying, readLocalPositionSeconds]);

  const startWatchTogether = useCallback(
    async (peerId: string, input: StartWatchTogetherInput) => {
      if (!remoteDmEnabled || !authUserId) {
        throw new Error("Watch Together is available only in registered-user DMs.");
      }

      setStarting(true);
      setError(null);

      try {
        const result = await createWatchSession({
          data:
            input.sourceType === "youtube"
              ? {
                  peerId,
                  sourceType: "youtube",
                  providerVideoId: input.providerVideoId,
                  sourceTitle: input.sourceTitle,
                }
              : {
                  peerId,
                  sourceType: "upload",
                  uploadStoragePath: input.uploadStoragePath,
                  uploadFilename: input.uploadFilename,
                  uploadMime: input.uploadMime,
                  sourceTitle: input.sourceTitle,
                },
        });

        const nextSession = result.session as WatchSession;
        const nextPlayback = result.playback as WatchPlayback | null;

        setSession(nextSession);
        setPlayback(nextPlayback);
        setPhase("waiting");
        setPeerJoined(false);
        joinedUsersRef.current.clear();
        setStatusMessage(`Waiting for ${peerNameArg} to join…`);
        clearWatchInviteResolution(nextSession.id);

        await openSessionPlayer(nextSession, false);

        return nextSession;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to start Watch Together.";
        setError(message);
        console.error("[watch-together] start failed", err);
        throw err;
      } finally {
        setStarting(false);
      }
    },
    [remoteDmEnabled, authUserId, openSessionPlayer, peerNameArg],
  );

  const stopWatchTogether = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession || !isHostRef.current) return;

    setEnding(true);
    setError(null);

    try {
      await endWatchSession({ data: { sessionId: currentSession.id } });

      const ch = channelRef.current;
      if (ch) {
        const payload: WatchSyncPayload = {
          sessionId: currentSession.id,
          action: "ended",
          positionSeconds: readLocalPositionSeconds(),
          playing: false,
          sentAt: Date.now(),
        };
        await ch.send({ type: "broadcast", event: WATCH_RT_EVENT_PLAYBACK, payload });
      }

      clearWatchInviteResolution(currentSession.id);
      teardownSession(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to end Watch Together.";
      setError(message);
      console.error("[watch-together] stop failed", err);
      throw err;
    } finally {
      setEnding(false);
    }
  }, [readLocalPositionSeconds, teardownSession]);

  const joinWatchTogether = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession || !authUserId) return;
    await acceptInvite({ sessionId: currentSession.id, channelId: channelId! });
  }, [acceptInvite, authUserId, channelId]);

  return {
    enabled: remoteDmEnabled,
    session,
    playback,
    phase,
    statusMessage,
    peerJoined,
    isHost: Boolean(session && authUserId && session.host_id === authUserId),
    loading,
    starting,
    ending,
    joining,
    rejecting,
    error,
    startWatchTogether,
    stopWatchTogether,
    joinWatchTogether,
    acceptInvite,
    rejectInvite,
    refreshSession,
  };
}
