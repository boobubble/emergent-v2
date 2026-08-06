// Live DJ / RJ player — shared audio host + sidebar mini-player UI.
//
// • All listeners see the same player state, synced through
//   app_settings.dj_player + realtime (see src/lib/dj-store.tsx).
// • DjPlayerHost keeps the hidden media element mounted so playback
//   continues when the mobile sidebar drawer closes.
// • DjSidebarPlayer renders the compact controls in the left sidebar.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import {
  Disc3, Pause, Play, Volume2, VolumeX, Radio, Bell, BellOff,
} from "lucide-react";

import { useChatRadioSource } from "@/lib/dj-store";
import { currentPositionSec, DJ_DEFAULTS, normalizeStreamUrl, type DjPlayerState } from "@/lib/dj-config";
import { Button } from "@/components/ui/button";
import { BroadcasterTicker } from "@/components/broadcaster/BroadcasterAnnouncements";
import { useSoundPrefs, setSoundPref } from "@/lib/sound-prefs";
import { cn } from "@/lib/utils";


const LISTENER_MUTE_KEY = "dj_player.listener_muted.v2";
const LISTENER_VOLUME_KEY = "dj_player.listener_volume.v1";

type DjMediaControls = { play: () => void; pause: () => void };

/** Shared ref so sidebar UI can control the always-mounted media sink. */
export const djMediaControlsRef: { current: DjMediaControls | null } = { current: null };

type ListenerPrefs = { muted: boolean; volume: number };
let listenerPrefs: ListenerPrefs = {
  muted: typeof window !== "undefined" && localStorage.getItem(LISTENER_MUTE_KEY) === "1",
  volume: (() => {
    if (typeof window === "undefined") return 100;
    const raw = Number(localStorage.getItem(LISTENER_VOLUME_KEY));
    return Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 100;
  })(),
};
const listenerSubscribers = new Set<() => void>();

function emitListenerPrefs() {
  for (const fn of listenerSubscribers) fn();
}

function setSharedListenerMuted(next: boolean) {
  listenerPrefs = { ...listenerPrefs, muted: next };
  if (typeof window !== "undefined") localStorage.setItem(LISTENER_MUTE_KEY, next ? "1" : "0");
  emitListenerPrefs();
}

function setSharedListenerVolume(next: number) {
  const volume = Math.max(0, Math.min(100, next));
  listenerPrefs = { ...listenerPrefs, volume };
  if (typeof window !== "undefined") localStorage.setItem(LISTENER_VOLUME_KEY, String(volume));
  emitListenerPrefs();
}

function useDjListenerPrefs() {
  const snap = useSyncExternalStore(
    (cb) => {
      listenerSubscribers.add(cb);
      return () => listenerSubscribers.delete(cb);
    },
    () => listenerPrefs,
    () => listenerPrefs,
  );

  return {
    listenerMuted: snap.muted,
    setListenerMuted: (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(snap.muted) : value;
      setSharedListenerMuted(next);
    },
    listenerVolume: snap.volume,
    setListenerVolume: (value: number | ((prev: number) => number)) => {
      const next = typeof value === "function" ? value(snap.volume) : value;
      setSharedListenerVolume(next);
    },
  };
}

/** Hidden media sink — mount once at ChatApp level so audio survives sidebar toggles. */
export function DjPlayerHost() {
  const { ready, radio } = useChatRadioSource();
  const { listenerMuted, listenerVolume } = useDjListenerPrefs();
  const mediaControlsRef = useRef<DjMediaControls | null>(null);

  if (!ready || !radio.visible) return null;

  const muted = radio.state.allowListenerMute && listenerMuted;
  const baseVolume = Math.max(0, Math.min(100, radio.state.defaultVolume));
  const effectiveVolume = muted ? 0 : Math.round((baseVolume * listenerVolume) / 100);

  return (
    <div className="pointer-events-none fixed h-0 w-0 overflow-hidden opacity-0" aria-hidden>
      <DjMediaSink
        state={radio.state}
        volume={effectiveVolume}
        muted={muted}
        controlRef={mediaControlsRef}
        onPlaybackBlockedChange={() => undefined}
        onControlsReady={(c) => { djMediaControlsRef.current = c; }}
      />
    </div>
  );
}

/** Compact radio mini-player for the left sidebar. */
export function DjSidebarPlayer({ className }: { className?: string }) {
  const { ready, radio } = useChatRadioSource();
  const prefs = useDjListenerPrefs();

  if (!ready || !radio.visible) return null;

  return (
    <DjPlayerControls
      className={className}
      variant="sidebar"
      state={radio.state}
      stationName={radio.stationName}
      trackLabel={radio.trackLabel}
      isLive={radio.isLive}
      listenerMuted={prefs.listenerMuted}
      listenerVolume={prefs.listenerVolume}
      onToggleListenerMute={() => prefs.setListenerMuted((m) => !m)}
      onListenerVolumeChange={prefs.setListenerVolume}
    />
  );
}

/** @deprecated Composer bar variant — use DjSidebarPlayer in sidebar instead. */
export function DjFooter() {
  return null;
}

function DjPlayerControls({
  state, stationName, trackLabel, isLive, listenerMuted, listenerVolume, onToggleListenerMute, onListenerVolumeChange, variant, className,
}: {
  state: DjPlayerState;
  stationName: string;
  trackLabel: string | null;
  isLive: boolean;
  listenerMuted: boolean;
  listenerVolume: number;
  onToggleListenerMute: () => void;
  onListenerVolumeChange: (v: number) => void;
  variant: "sidebar";
  className?: string;
}) {
  const muted = state.allowListenerMute && listenerMuted;
  const [localPaused, setLocalPaused] = useState(false);
  const mediaControlsRef = useRef<DjMediaControls | null>(null);

  const trackTitle = trackLabel ?? state.track?.title ?? null;
  const showLive = isLive && state.track;

  return (
    <div className={cn("sidebar-radio-mini", className)}>
      <BroadcasterTicker target="chatbar" />
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
          <Radio className="h-4 w-4 text-primary" />
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-card",
              showLive ? "bg-red-500 animate-pulse" : "bg-muted-foreground/40",
            )}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[11px] font-bold text-foreground">{stationName}</div>
          <div className="truncate text-[10px] text-muted-foreground">
            {showLive ? (
              trackTitle ?? <span className="italic">Live now</span>
            ) : (
              <span className="italic">Off air</span>
            )}
          </div>
        </div>
        {state.playing && state.track?.kind === "audio" && !muted && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            onClick={() => {
              setLocalPaused((p) => {
                const next = !p;
                if (next) djMediaControlsRef.current?.pause();
                else djMediaControlsRef.current?.play();
                return next;
              });
            }}
            title={localPaused ? "Play stream" : "Pause stream"}
            aria-label={localPaused ? "Play stream" : "Pause stream"}
          >
            {localPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
        )}
        {state.allowListenerMute && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full"
            onClick={() => {
              onToggleListenerMute();
              if (muted) djMediaControlsRef.current?.play();
            }}
            title={muted ? "Unmute radio" : "Mute radio"}
            aria-label={muted ? "Unmute radio" : "Mute radio"}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
      {state.allowListenerMute && (
        <div className="flex items-center gap-2 px-2 pb-2">
          <Disc3
            className={cn("h-3 w-3 shrink-0 text-primary", state.playing && state.track && "animate-spin")}
            style={{ animationDuration: "3.5s" }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={listenerVolume}
            onChange={(e) => onListenerVolumeChange(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-primary"
            aria-label="Radio volume"
          />
          <RadioNotifyToggle compact />
        </div>
      )}
    </div>
  );
}

/**
 * Renders the actual audio source — either a hidden YouTube iframe
 * (audio only, no controls) or an <audio> element for direct streams.
 * Re-mounts when the track/play state changes so the start position
 * stays in sync across listeners.
 */
function DjMediaSink({
  state, volume, muted, controlRef, onPlaybackBlockedChange, onControlsReady,
}: {
  state: DjPlayerState;
  volume: number;
  muted: boolean;
  controlRef: RefObject<DjMediaControls | null>;
  onPlaybackBlockedChange: (blocked: boolean) => void;
  onControlsReady?: (controls: DjMediaControls | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioSrc = state.track?.kind === "audio" ? normalizeStreamUrl(state.track.url) : null;

  const requestAudioPlay = useCallback((reload = false) => {
    const el = audioRef.current;
    if (!el || state.track?.kind !== "audio" || !state.playing) return;
    el.volume = Math.max(0, Math.min(1, volume / 100));
    el.muted = muted;
    if (reload || el.error || el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      try { el.load(); } catch { /* noop */ }
    }
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => onPlaybackBlockedChange(false)).catch((err) => {
        onPlaybackBlockedChange(true);
        console.warn("[DjPlayer] audio play blocked:", err);
      });
    } else {
      onPlaybackBlockedChange(false);
    }
  }, [muted, onPlaybackBlockedChange, state.playing, state.track?.kind, volume]);

  useEffect(() => {
    const controls = {
      play: () => requestAudioPlay(true),
      pause: () => { audioRef.current?.pause(); onPlaybackBlockedChange(false); },
    };
    controlRef.current = controls;
    onControlsReady?.(controls);
    return () => {
      controlRef.current = null;
      onControlsReady?.(null);
    };
  }, [controlRef, requestAudioPlay, onPlaybackBlockedChange, onControlsReady]);

  // Apply volume / mute to the <audio> element whenever it changes.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, volume / 100));
    el.muted = muted;
  }, [volume, muted]);

  // Drive play/pause on the <audio> element based on shared state.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || state.track?.kind !== "audio") return;
    if (state.playing) {
      requestAudioPlay();
    } else {
      el.pause();
      onPlaybackBlockedChange(false);
    }
  }, [requestAudioPlay, state.playing, audioSrc, state.track?.kind, onPlaybackBlockedChange]);

  const youtubeSrc = useMemo(() => {
    if (!state.track || state.track.kind !== "youtube" || !state.track.videoId) return null;
    if (!state.playing) return null;
    const start = Math.floor(currentPositionSec(state));
    const params = new URLSearchParams({
      autoplay: "1",
      start: String(start),
      controls: "0",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      mute: muted ? "1" : "0",
    });
    return `https://www.youtube-nocookie.com/embed/${state.track.videoId}?${params.toString()}`;
  }, [state.track?.videoId, state.playing, state.startedAtMs, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (audioSrc) {
    return (
      <audio
        key={audioSrc}
        ref={audioRef}
        src={audioSrc}
        autoPlay={state.playing}
        preload="auto"
        playsInline
        className="hidden"
        onPlaying={() => onPlaybackBlockedChange(false)}
        onError={() => onPlaybackBlockedChange(true)}
      />
    );
  }


  if (youtubeSrc) {
    return (
      <iframe
        key={youtubeSrc}
        src={youtubeSrc}
        title="DJ player"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="absolute h-0 w-0 border-0 opacity-0 pointer-events-none"
        aria-hidden
      />
    );
  }
  return null;
}

function RadioNotifyToggle({ compact }: { compact?: boolean }) {
  const prefs = useSoundPrefs();
  const on = prefs.radio_announcements !== false;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={compact ? "h-6 w-6 shrink-0" : "h-8 w-8"}
      onClick={() => setSoundPref("radio_announcements", !on)}
      title={on ? "Mute radio notifications" : "Enable radio notifications"}
      aria-label={on ? "Mute radio notifications" : "Enable radio notifications"}
    >
      {on ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
    </Button>
  );
}

// Re-export defaults for admin pages that prefer the named import.
export { DJ_DEFAULTS };
