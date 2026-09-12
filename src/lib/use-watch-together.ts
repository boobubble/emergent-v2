import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  createWatchSession,
  endWatchSession,
  getActiveWatchSession,
  updateWatchPlayback,
} from "@/lib/watch-together.functions";
import { isRemoteDmChannel, parseDmChannel } from "@/lib/dm-utils";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import {
  useYouTubePlayer,
  type YouTubePlaybackAction,
} from "@/components/chat/youtube-player-context";

type WatchSession = {
  id: string;
  channel_id: string;
  host_id: string;
  status: "active" | "ended";
  media_kind: "youtube";
  provider: "youtube";
  provider_video_id: string;
  started_at: string;
  ended_at?: string | null;
  ends_at: string;
  created_at?: string;
};

type WatchPlayback = {
  session_id: string;
  playing: boolean;
  position_ms: number;
  playback_rate: number;
  updated_at: string;
  updated_by: string;
  host_clock_ms?: number | null;
};

type WatchBroadcast =
  | {
      type: "state";
      sessionId: string;
      playing: boolean;
      positionMs: number;
      playbackRate: number;
      sentAt: number;
    }
  | {
      type: "action";
      sessionId: string;
      action: YouTubePlaybackAction;
      sentAt: number;
    }
  | {
      type: "ended";
      sessionId: string;
    };

const DRIFT_THRESHOLD_SECONDS = 0.75;
const HOST_TICK_MS = 1000;
const PERSIST_INTERVAL_MS = 3000;

function getPositionSeconds(currentTime: number): number {
  return Math.max(0, currentTime || 0);
}

export function useWatchTogether(channelId: string | null, authUserId: string | null | undefined) {
  const player = useYouTubePlayer();
  const {
    playerControlRef,
    setPlaybackControlPolicy,
    setPlaying,
    closePlayer,
    openPlayer,
    isOpen,
    isPlaying,
    currentTime,
  } = player;

  const [session, setSession] = useState<WatchSession | null>(null);
  const [playback, setPlayback] = useState<WatchPlayback | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<Awaited<ReturnType<typeof loadBrowserSupabase>> | null>(null);
  const sessionRef = useRef<WatchSession | null>(null);
  const isHostRef = useRef(false);
  const lastPersistRef = useRef(0);
  const applyingRemoteRef = useRef(false);
  const openedSessionRef = useRef<string | null>(null);
  const playerSnapshotRef = useRef({ isPlaying: false, currentTime: 0 });
  const playerApiRef = useRef(player);

  playerSnapshotRef.current = { isPlaying, currentTime };
  playerApiRef.current = player;

  const remoteDmEnabled = Boolean(
    channelId && authUserId && isRemoteDmChannel(channelId, authUserId),
  );

  useEffect(() => {
    sessionRef.current = session;
    isHostRef.current = Boolean(session && authUserId && session.host_id === authUserId);
  }, [session, authUserId]);

  const applyPlayback = useCallback(
    (next: { playing: boolean; positionMs: number; playbackRate: number }) => {
      const controls = playerApiRef.current.playerControlRef.current;
      if (!controls) return;

      applyingRemoteRef.current = true;

      if (next.playing) {
        controls.play();
      } else {
        controls.pause();
      }

      controls.seek(Math.max(0, next.positionMs / 1000));
      playerApiRef.current.setPlaying(next.playing);

      applyingRemoteRef.current = false;
    },
    [],
  );

  const persistPlayback = useCallback(async (force = false) => {
    const currentSession = sessionRef.current;
    if (!currentSession || !isHostRef.current || applyingRemoteRef.current) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastPersistRef.current < PERSIST_INTERVAL_MS) {
      return;
    }

    lastPersistRef.current = now;

    try {
      const result = await updateWatchPlayback({
        data: {
          sessionId: currentSession.id,
          playing: playerSnapshotRef.current.isPlaying,
          positionMs: Math.max(
            0,
            Math.round(getPositionSeconds(playerSnapshotRef.current.currentTime) * 1000),
          ),
          playbackRate: 1,
        },
      });

      if (result?.playback) {
        setPlayback(result.playback as WatchPlayback);
      }
    } catch (err) {
      console.error("[watch-together] playback persistence failed", err);
    }
  }, []);

  const broadcastState = useCallback(async () => {
    const ch = channelRef.current;
    const currentSession = sessionRef.current;

    if (!ch || !currentSession || !isHostRef.current || applyingRemoteRef.current) {
      return;
    }

    const payload: WatchBroadcast = {
      type: "state",
      sessionId: currentSession.id,
      playing: playerSnapshotRef.current.isPlaying,
      positionMs: Math.max(
        0,
        Math.round(getPositionSeconds(playerSnapshotRef.current.currentTime) * 1000),
      ),
      playbackRate: 1,
      sentAt: Date.now(),
    };

    await ch.send({
      type: "broadcast",
      event: "playback",
      payload,
    });
  }, []);

  const handleLocalAction = useCallback(
    (action: YouTubePlaybackAction) => {
      if (applyingRemoteRef.current) return;

      const currentSession = sessionRef.current;
      const ch = channelRef.current;

      if (!currentSession || !ch || !isHostRef.current) return;

      const payload: WatchBroadcast = {
        type: "action",
        sessionId: currentSession.id,
        action,
        sentAt: Date.now(),
      };

      void ch.send({
        type: "broadcast",
        event: "playback",
        payload,
      });

      void persistPlayback(true);
    },
    [persistPlayback],
  );

  useEffect(() => {
    if (!remoteDmEnabled || !channelId || !authUserId) {
      setSession(null);
      setPlayback(null);
      setError(null);
      return;
    }

    const parsed = parseDmChannel(channelId, authUserId);
    const peerId = parsed.valid ? parsed.peerId : null;

    if (!peerId) {
      setSession(null);
      setPlayback(null);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    void getActiveWatchSession({
      data: { peerId },
    })
      .then((result) => {
        if (cancelled) return;

        const nextSession = result?.session as WatchSession | null;
        const nextPlayback = result?.playback as WatchPlayback | null;

        setSession(nextSession);
        setPlayback(nextPlayback);

        if (!nextSession) {
          openedSessionRef.current = null;
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
  }, [remoteDmEnabled, channelId, authUserId]);

  useEffect(() => {
    if (!remoteDmEnabled || !session) {
      playerApiRef.current.setPlaybackControlPolicy(null);
      return;
    }

    playerApiRef.current.setPlaybackControlPolicy({
      canControlPlayback: session.host_id === authUserId,
      onLocalPlaybackAction: handleLocalAction,
    });

    return () => {
      playerApiRef.current.setPlaybackControlPolicy(null);
    };
  }, [remoteDmEnabled, session, authUserId, handleLocalAction, setPlaybackControlPolicy]);

  useEffect(() => {
    if (!remoteDmEnabled || !session || !authUserId) return;

    let cancelled = false;
    let realtimeChannel: RealtimeChannel | null = null;

    void loadBrowserSupabase().then((supabase) => {
      if (cancelled) return;

      const ch = supabase.channel(`watch:${session.id}`, {
        config: {
          broadcast: { self: false },
        },
      });

      ch.on("broadcast", { event: "playback" }, (msg) => {
        const payload = msg.payload as WatchBroadcast;

        if (!payload || payload.sessionId !== session.id) return;
        if (payload.type === "ended") {
          if (isHostRef.current) return;
          setSession(null);
          setPlayback(null);
          openedSessionRef.current = null;
          playerApiRef.current.setPlaybackControlPolicy(null);
          playerApiRef.current.closePlayer();
          return;
        }

        if (payload.type === "action") {
          if (isHostRef.current) return;

          const controls = playerApiRef.current.playerControlRef.current;
          if (!controls) return;

          applyingRemoteRef.current = true;

          if (payload.action.type === "play") {
            controls.play();
            playerApiRef.current.setPlaying(true);
          } else if (payload.action.type === "pause") {
            controls.pause();
            playerApiRef.current.setPlaying(false);
          } else if (payload.action.type === "seek") {
            controls.seek(Math.max(0, payload.action.seconds));
          }

          applyingRemoteRef.current = false;
          return;
        }

        if (payload.type === "state") {
          if (isHostRef.current) return;

          const localPosition = getPositionSeconds(playerSnapshotRef.current.currentTime);
          const remotePosition =
            payload.positionMs / 1000 +
            (payload.playing ? (Date.now() - payload.sentAt) / 1000 : 0);

          const drift = Math.abs(localPosition - remotePosition);

          if (drift >= DRIFT_THRESHOLD_SECONDS) {
            applyPlayback({
              playing: payload.playing,
              positionMs: Math.round(remotePosition * 1000),
              playbackRate: payload.playbackRate,
            });
          } else if (payload.playing !== playerSnapshotRef.current.isPlaying) {
            applyingRemoteRef.current = true;

            if (payload.playing) {
              playerApiRef.current.playerControlRef.current?.play();
            } else {
              playerApiRef.current.playerControlRef.current?.pause();
            }

            playerApiRef.current.setPlaying(payload.playing);
            applyingRemoteRef.current = false;
          }

          setPlayback((prev) =>
            prev
              ? {
                  ...prev,
                  playing: payload.playing,
                  position_ms: payload.positionMs,
                  playback_rate: payload.playbackRate,
                  updated_at: new Date().toISOString(),
                }
              : prev,
          );
        }
      });

      ch.subscribe();
      realtimeChannel = ch;
      channelRef.current = ch;
    });

    return () => {
      cancelled = true;
      if (realtimeChannel) {
        void loadBrowserSupabase().then((supabase) => {
          void supabase.removeChannel(realtimeChannel);
        });
      }
      channelRef.current = null;
    };
  }, [remoteDmEnabled, session, authUserId, applyPlayback]);

  useEffect(() => {
    if (!remoteDmEnabled || !session) return;
    if (openedSessionRef.current === session.id) return;

    openedSessionRef.current = session.id;

    playerApiRef.current.openPlayer({
      videoId: session.provider_video_id,
      url: `https://youtu.be/${session.provider_video_id}`,
      title: "Watch Together",
    });

    const timer = window.setInterval(() => {
      if (!sessionRef.current || sessionRef.current.id !== session.id) {
        window.clearInterval(timer);
        return;
      }

      const controls = playerApiRef.current.playerControlRef.current;
      if (!controls) return;

      const currentPlayback = playback;

      if (currentPlayback) {
        applyPlayback({
          playing: currentPlayback.playing,
          positionMs: currentPlayback.position_ms,
          playbackRate: currentPlayback.playback_rate,
        });
      }

      window.clearInterval(timer);
    }, 750);

    return () => window.clearInterval(timer);
  }, [remoteDmEnabled, session, playback, applyPlayback]);

  useEffect(() => {
    if (!remoteDmEnabled || !session || !isHostRef.current) return;

    const timer = window.setInterval(() => {
      void broadcastState();
      void persistPlayback(false);
    }, HOST_TICK_MS);

    return () => window.clearInterval(timer);
  }, [remoteDmEnabled, session, broadcastState, persistPlayback]);

  useEffect(() => {
    return () => {
      playerApiRef.current.setPlaybackControlPolicy(null);
    };
  }, [player.setPlaybackControlPolicy]);

  const startWatchTogether = useCallback(
    async (peerId: string, providerVideoId: string) => {
      if (!remoteDmEnabled || !authUserId) {
        throw new Error("Watch Together is available only in registered-user DMs.");
      }

      setStarting(true);
      setError(null);

      try {
        const result = await createWatchSession({
          data: {
            peerId,
            providerVideoId,
          },
        });

        const nextSession = result.session as WatchSession;
        const nextPlayback = result.playback as WatchPlayback | null;

        setSession(nextSession);
        setPlayback(nextPlayback);

        return nextSession;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to start Watch Together.";
        setError(message);
        throw err;
      } finally {
        setStarting(false);
      }
    },
    [remoteDmEnabled, authUserId],
  );

  const stopWatchTogether = useCallback(async () => {
    const currentSession = sessionRef.current;

    if (!currentSession || !isHostRef.current) return;

    setEnding(true);
    setError(null);

    try {
      await endWatchSession({
        data: {
          sessionId: currentSession.id,
        },
      });

      const ch = channelRef.current;

      if (ch) {
        const payload: WatchBroadcast = {
          type: "ended",
          sessionId: currentSession.id,
        };

        await ch.send({
          type: "broadcast",
          event: "playback",
          payload,
        });
      }

      setSession(null);
      setPlayback(null);
      openedSessionRef.current = null;
      playerApiRef.current.setPlaybackControlPolicy(null);
      playerApiRef.current.closePlayer();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to end Watch Together.";
      setError(message);
      throw err;
    } finally {
      setEnding(false);
    }
  }, []);

  return {
    enabled: remoteDmEnabled,
    session,
    playback,
    isHost: Boolean(session && authUserId && session.host_id === authUserId),
    loading,
    starting,
    ending,
    error,
    startWatchTogether,
    stopWatchTogether,
  };
}
