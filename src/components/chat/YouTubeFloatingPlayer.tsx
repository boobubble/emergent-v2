import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaFromSettings } from "@/lib/media-embed-text";
import { cn } from "@/lib/utils";
import { useChatComposerClearance } from "./youtube-composer-clearance";
import { youtubeEmbedHost, youtubeThumbnailUrl } from "./youtube-embed-url";
import { loadYoutubeIframeApi, YT_PLAYER_STATE, type YtPlayerInstance } from "./youtube-iframe-api";
import { wtDebugLog } from "@/lib/watch-together-sync";
import { useYouTubePlayer, type YouTubePlayerControls } from "./youtube-player-context";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function YouTubeFloatingPlayer() {
  const {
    activeVideoId,
    uploadUrl,
    mediaKind,
    title,
    isPlaying,
    isMuted,
    isMinimized,
    currentTime,
    duration,
    needsUserGesture,
    closePlayer,
    minimizePlayer,
    restorePlayer,
    setPlaying,
    setMuted,
    setTimeline,
    playerControlRef,
    canControlPlayback,
    reportLocalPlaybackAction,
    presentationMode,
    cinematicVideoMountRef,
    cinematicMountReady,
  } = useYouTubePlayer();

  const { raw } = useAppSettings();
  const media = mergeMediaFromSettings(raw);
  const host = youtubeEmbedHost(media.youtube.defaultPrivacy);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const uploadVideoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<YtPlayerInstance | null>(null);
  const [volume, setVolume] = useState(100);
  const [ready, setReady] = useState(false);
  const tickRef = useRef<number | null>(null);
  const initialAutoplayRef = useRef(false);
  const canControlPlaybackRef = useRef(canControlPlayback);
  canControlPlaybackRef.current = canControlPlayback;

  const stopTick = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    stopTick();
    tickRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        setTimeline(player.getCurrentTime(), player.getDuration());
      } catch {
        /* player may be tearing down */
      }
    }, 500);
  }, [setTimeline, stopTick]);

  const destroyPlayer = useCallback(() => {
    stopTick();
    try {
      playerRef.current?.destroy();
    } catch {
      /* ignore */
    }
    playerRef.current = null;
    setReady(false);
  }, [stopTick]);

  const controlsRef = useRef<YouTubePlayerControls>({
    play: () => {},
    pause: () => {},
    togglePlay: () => {},
    mute: () => {},
    unmute: () => {},
    toggleMute: () => {},
    setVolume: () => {},
    seek: () => {},
    getCurrentTime: () => 0,
    isPlayerPlaying: () => false,
    requestFullscreen: () => {},
    destroy: () => {},
  });

  controlsRef.current = {
    getCurrentTime: () => {
      try {
        if (mediaKind === "upload") {
          return uploadVideoRef.current?.currentTime ?? 0;
        }
        return playerRef.current?.getCurrentTime() ?? 0;
      } catch {
        return 0;
      }
    },
    isPlayerPlaying: () => {
      try {
        if (mediaKind === "upload") {
          const video = uploadVideoRef.current;
          return Boolean(video && !video.paused);
        }
        const state = playerRef.current?.getPlayerState();
        return state === YT_PLAYER_STATE.PLAYING || state === YT_PLAYER_STATE.BUFFERING;
      } catch {
        return false;
      }
    },
    play: (options) => {
      try {
        if (mediaKind === "upload") {
          void uploadVideoRef.current?.play().catch(() => setPlaying(false));
        } else {
          playerRef.current?.playVideo();
        }
        if (!options?.silent) reportLocalPlaybackAction({ type: "play" });
      } catch {
        /* ignore */
      }
    },
    pause: (options) => {
      try {
        if (mediaKind === "upload") {
          uploadVideoRef.current?.pause();
        } else {
          playerRef.current?.pauseVideo();
        }
        if (!options?.silent) reportLocalPlaybackAction({ type: "pause" });
      } catch {
        /* ignore */
      }
    },
    togglePlay: () => {
      const player = playerRef.current;
      if (mediaKind === "upload") {
        const video = uploadVideoRef.current;
        if (!video) return;
        if (video.paused) {
          void video.play().catch(() => setPlaying(false));
          reportLocalPlaybackAction({ type: "play" });
        } else {
          video.pause();
          reportLocalPlaybackAction({ type: "pause" });
        }
        return;
      }
      if (!player) return;
      const state = player.getPlayerState();
      if (state === YT_PLAYER_STATE.PLAYING || state === YT_PLAYER_STATE.BUFFERING) {
        player.pauseVideo();
        reportLocalPlaybackAction({ type: "pause" });
      } else {
        player.playVideo();
        reportLocalPlaybackAction({ type: "play" });
      }
    },
    mute: () => {
      try {
        playerRef.current?.mute();
        setMuted(true);
      } catch {
        /* ignore */
      }
    },
    unmute: () => {
      try {
        playerRef.current?.unMute();
        setMuted(false);
      } catch {
        /* ignore */
      }
    },
    toggleMute: () => {
      const player = playerRef.current;
      if (!player) return;
      if (player.isMuted()) player.unMute();
      else player.mute();
      setMuted(player.isMuted());
    },
    setVolume: (next: number) => {
      const clamped = Math.max(0, Math.min(100, next));
      setVolume(clamped);
      try {
        playerRef.current?.setVolume(clamped);
        if (clamped > 0 && playerRef.current?.isMuted()) {
          playerRef.current.unMute();
          setMuted(false);
        }
      } catch {
        /* ignore */
      }
    },
    seek: (seconds: number, options) => {
      try {
        if (mediaKind === "upload") {
          const video = uploadVideoRef.current;
          if (video) {
            video.currentTime = Math.max(0, seconds);
            setTimeline(video.currentTime, video.duration || duration);
          }
        } else {
          playerRef.current?.seekTo(seconds, true);
          setTimeline(seconds, playerRef.current?.getDuration() ?? duration);
        }
        if (!options?.silent) reportLocalPlaybackAction({ type: "seek", seconds });
      } catch {
        /* ignore */
      }
    },
    requestFullscreen: () => {
      const el = shellRef.current;
      if (!el) return;
      const req =
        el.requestFullscreen ??
        (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen;
      req?.call(el);
    },
    destroy: destroyPlayer,
  };

  useEffect(() => {
    playerControlRef.current = controlsRef.current;
    return () => {
      if (playerControlRef.current === controlsRef.current) {
        playerControlRef.current = null;
      }
    };
  }, [playerControlRef]);

  useEffect(() => {
    if (mediaKind !== "youtube" || !activeVideoId || !mountRef.current) {
      if (mediaKind === "youtube") destroyPlayer();
      return;
    }

    let cancelled = false;
    setReady(false);
    initialAutoplayRef.current = isPlaying;

    void loadYoutubeIframeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current || !activeVideoId) return;

        destroyPlayer();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const autoplayOnCreate = initialAutoplayRef.current;

        const player = new YT.Player(mountRef.current, {
          width: "100%",
          height: "100%",
          videoId: activeVideoId,
          host,
          playerVars: {
            autoplay: autoplayOnCreate ? 1 : 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            origin,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              playerRef.current = event.target;
              setReady(true);
              try {
                event.target.setVolume(volume);
                if (isMuted) event.target.mute();
                else event.target.unMute();
                setMuted(event.target.isMuted());
                setTimeline(event.target.getCurrentTime(), event.target.getDuration());
                if (autoplayOnCreate) {
                  event.target.playVideo();
                  startTick();
                } else {
                  event.target.pauseVideo();
                  try {
                    event.target.seekTo(0, true);
                  } catch {
                    /* ignore */
                  }
                }
              } catch {
                /* ignore */
              }
            },
            onStateChange: (event) => {
              if (cancelled) return;
              const playing =
                event.data === YT_PLAYER_STATE.PLAYING || event.data === YT_PLAYER_STATE.BUFFERING;

              if (!canControlPlaybackRef.current && playing) {
                try {
                  event.target.pauseVideo();
                  setPlaying(false);
                  stopTick();
                  setTimeline(event.target.getCurrentTime(), event.target.getDuration());
                } catch {
                  /* ignore */
                }
                wtDebugLog("yt state", {
                  data: event.data,
                  playing: false,
                  blocked: true,
                  current: event.target.getCurrentTime(),
                });
                return;
              }

              setPlaying(playing);
              wtDebugLog("yt state", {
                data: event.data,
                playing,
                current: event.target.getCurrentTime(),
              });
              if (event.data === YT_PLAYER_STATE.PLAYING) startTick();
              if (event.data === YT_PLAYER_STATE.PAUSED || event.data === YT_PLAYER_STATE.ENDED) {
                stopTick();
                try {
                  setTimeline(event.target.getCurrentTime(), event.target.getDuration());
                } catch {
                  /* ignore */
                }
              }
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        setReady(false);
      });

    return () => {
      cancelled = true;
      destroyPlayer();
    };
    // Recreate only when the video identity changes — not when isPlaying toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideoId, host, mediaKind]);

  useEffect(() => {
    if (mediaKind !== "youtube" || !ready || !playerRef.current) return;
    const player = playerRef.current;
    try {
      const state = player.getPlayerState();
      const playerPlaying =
        state === YT_PLAYER_STATE.PLAYING || state === YT_PLAYER_STATE.BUFFERING;
      if (isPlaying && !playerPlaying && canControlPlayback) {
        player.playVideo();
        startTick();
      } else if (!isPlaying && playerPlaying) {
        player.pauseVideo();
        stopTick();
      }
    } catch {
      /* player may be tearing down */
    }
  }, [isPlaying, mediaKind, ready, startTick, stopTick, canControlPlayback]);

  useEffect(() => {
    if (mediaKind !== "upload" || !uploadUrl) {
      return;
    }

    const video = uploadVideoRef.current;
    if (!video) return;

    setReady(false);
    const onLoaded = () => {
      setReady(true);
      setTimeline(video.currentTime, video.duration || 0);
      startTick();
    };
    const onTimeUpdate = () => {
      setTimeline(video.currentTime, video.duration || 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.src = uploadUrl;
    video.load();
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    controlsRef.current = {
      ...controlsRef.current,
      play: (options) => {
        void video.play().catch(() => setPlaying(false));
        if (!options?.silent) reportLocalPlaybackAction({ type: "play" });
      },
      pause: (options) => {
        video.pause();
        if (!options?.silent) reportLocalPlaybackAction({ type: "pause" });
      },
      togglePlay: () => {
        if (video.paused) {
          void video.play().catch(() => setPlaying(false));
          reportLocalPlaybackAction({ type: "play" });
        } else {
          video.pause();
          reportLocalPlaybackAction({ type: "pause" });
        }
      },
      seek: (seconds: number, options) => {
        video.currentTime = Math.max(0, seconds);
        setTimeline(video.currentTime, video.duration || duration);
        if (!options?.silent) reportLocalPlaybackAction({ type: "seek", seconds });
      },
      destroy: () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        stopTick();
        setReady(false);
      },
    };
    playerControlRef.current = controlsRef.current;

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [
    mediaKind,
    uploadUrl,
    duration,
    playerControlRef,
    reportLocalPlaybackAction,
    setPlaying,
    setTimeline,
    startTick,
    stopTick,
  ]);

  useEffect(() => () => destroyPlayer(), [destroyPlayer]);
  const composerClearancePx = useChatComposerClearance();

  if (!mediaKind || typeof document === "undefined") return null;

  const isCinematic = presentationMode === "cinematic" && cinematicMountReady;
  const cinematicMount = cinematicVideoMountRef.current;
  const portalTarget =
    isCinematic && cinematicMount ? cinematicMount : document.body;

  const thumb = activeVideoId && activeVideoId !== "upload" ? youtubeThumbnailUrl(activeVideoId) : null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const controls = controlsRef.current;
  const shellBottom = `calc(env(safe-area-inset-bottom, 0px) + ${composerClearancePx}px)`;
  const shellMaxHeight = `calc(100dvh - env(safe-area-inset-bottom, 0px) - ${composerClearancePx}px - 0.75rem)`;

  return createPortal(
    <div
      ref={shellRef}
      data-youtube-floating-player=""
      data-presentation={isCinematic ? "cinematic" : "floating"}
      className={cn(
        isCinematic
          ? "pointer-events-auto relative flex h-full min-h-0 w-full flex-col text-foreground"
          : cn(
              "pointer-events-none fixed right-3 z-[85] text-foreground sm:right-6",
              isMinimized
                ? "left-3 w-[min(100%,22rem)] sm:left-auto"
                : "left-3 w-[min(100%,24rem)] sm:left-auto md:w-[min(100%,26rem)]",
            ),
      )}
      style={
        isCinematic
          ? undefined
          : {
              bottom: shellBottom,
              maxWidth: "calc(100vw - 1.5rem)",
              maxHeight: isMinimized ? undefined : shellMaxHeight,
            }
      }
    >
      <div
        className={cn(
          "pointer-events-auto overflow-hidden",
          isCinematic
            ? "flex h-full min-h-0 w-full flex-col bg-neutral-950"
            : cn(
                "rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-md",
                isMinimized ? "relative flex items-center gap-2 p-2" : "flex max-h-full min-h-0 flex-col",
              ),
        )}
        role="region"
        aria-label={isCinematic ? "Watch Together player" : "Floating YouTube player"}
      >
        {!isMinimized && !isCinematic && (
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
            <p className="min-w-0 flex-1 truncate text-xs font-medium" title={title ?? undefined}>
              {title ?? "YouTube video"}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={minimizePlayer}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Minimize video"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={controls.requestFullscreen}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Fullscreen video"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closePlayer}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Close video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "bg-black",
            isMinimized
              ? "pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
              : isCinematic
                ? "relative min-h-0 w-full flex-1"
                : "relative w-full min-h-0 flex-1",
          )}
          style={
            isMinimized
              ? undefined
              : isCinematic
                ? undefined
                : { aspectRatio: "16 / 9", maxHeight: "min(56vw, 100%)" }
          }
          aria-hidden={isMinimized}
        >
          <div
            ref={mountRef}
            className={cn(isMinimized ? "h-px w-px" : "absolute inset-0 h-full w-full")}
          />
          {mediaKind === "upload" && !isMinimized && (
            <video
              ref={uploadVideoRef}
              className="absolute inset-0 h-full w-full bg-black object-contain"
              playsInline
              controls={false}
            />
          )}
          {!ready && !isMinimized && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 text-xs text-white/80">
              Loading player…
            </div>
          )}
        </div>

        {needsUserGesture && !isMinimized && (
          <div className="border-t border-border/70 px-3 py-2">
            <button
              type="button"
              className="flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
              onClick={() => controls.play()}
            >
              Join / Resume playback
            </button>
          </div>
        )}

        {isMinimized ? (
          <>
            <button
              type="button"
              onClick={controls.togglePlay}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-600 text-white"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              disabled={!canControlPlayback}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </button>
            {thumb && (
              <img
                src={thumb}
                alt=""
                className="h-10 w-14 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1 truncate text-xs font-medium" title={title ?? undefined}>
              {title ?? "YouTube video"}
            </div>
            <button
              type="button"
              onClick={controls.toggleMute}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={restorePlayer}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Restore video"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={closePlayer}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div
            className={cn(
              "space-y-2 px-3 py-2",
              isCinematic && "border-t border-white/10 bg-neutral-950/90 text-white",
            )}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={controls.togglePlay}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-600 text-white"
                aria-label={isPlaying ? "Pause video" : "Play video"}
                disabled={!ready || !canControlPlayback}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>
              <button
                type="button"
                onClick={controls.toggleMute}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                disabled={!ready}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <label className="flex min-w-0 flex-1 items-center gap-2">
                <span className="sr-only">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => controls.setVolume(Number(e.target.value))}
                  className="h-1.5 w-full accent-red-600"
                  disabled={!ready}
                  aria-label="Volume"
                />
              </label>
              <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <label className="block">
              <span className="sr-only">Seek timeline</span>
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                step={0.1}
                value={Math.min(currentTime, duration > 0 ? duration : currentTime)}
                onChange={(e) => controls.seek(Number(e.target.value))}
                className="h-1.5 w-full accent-red-600"
                disabled={!ready || duration <= 0 || !canControlPlayback}
                aria-label="Seek timeline"
                style={{
                  background: `linear-gradient(to right, #dc2626 ${progress}%, rgb(0 0 0 / 0.12) ${progress}%)`,
                }}
              />
            </label>
          </div>
        )}
      </div>
    </div>,
    portalTarget,
  );
}
