// Live DJ / RJ footer player — pinned under the lobby chat composer.
//
// • All listeners see the same player state, synced through
//   app_settings.dj_player + realtime (see src/lib/dj-store.tsx).
// • Chatroom users only see the "Now playing" chip and a local mute toggle.
// • Hidden behind the master switch in /admin/dj — renders nothing
//   when disabled, so existing chat UX is untouched by default.

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Disc3, Pause, Play, Volume2, VolumeX, Radio, Bell, BellOff,
} from "lucide-react";

import { useDjPlayer } from "@/lib/dj-store";
import {
  currentPositionSec, DJ_DEFAULTS, normalizeStreamUrl, type DjPlayerState,
} from "@/lib/dj-config";
import { Button } from "@/components/ui/button";
import { BroadcasterTicker } from "@/components/broadcaster/BroadcasterAnnouncements";
import { useSoundPrefs, setSoundPref } from "@/lib/sound-prefs";


const LISTENER_MUTE_KEY = "dj_player.listener_muted.v2";

type DjMediaControls = { play: () => void; pause: () => void };

export function DjFooter() {
  const { state, ready } = useDjPlayer();

  // Listener-side mute is stored locally, never broadcast.
  const [listenerMuted, setListenerMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LISTENER_MUTE_KEY) === "1";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LISTENER_MUTE_KEY, listenerMuted ? "1" : "0");
  }, [listenerMuted]);

  if (!ready || !state.enabled) return null;

  return (
    <DjFooterView
      state={state}
      listenerMuted={listenerMuted}
      onToggleListenerMute={() => setListenerMuted((m) => !m)}
    />
  );
}

function DjFooterView({
  state, listenerMuted, onToggleListenerMute,
}: {
  state: DjPlayerState;
  listenerMuted: boolean;
  onToggleListenerMute: () => void;
}) {
  const muted = state.allowListenerMute && listenerMuted;
  const effectiveVolume = muted ? 0 : Math.max(0, Math.min(100, state.defaultVolume));
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const mediaControlsRef = useRef<DjMediaControls | null>(null);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="border-t border-border/60 bg-muted/40 backdrop-blur-sm">
      <BroadcasterTicker target="chatbar" />
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        {/* On Air chip */}
        <div className="flex items-center gap-2 rounded-full bg-background/70 px-2.5 py-1 shadow-sm">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              state.playing && state.track ? "bg-red-500 animate-pulse" : "bg-muted-foreground/40"
            }`}
            aria-hidden
          />
          <Radio className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {state.playing && state.track ? "On Air" : "Off Air"}
          </span>
          {state.djName && (
            <span className="text-[11px] text-muted-foreground/80">· {state.djName}</span>
          )}
        </div>

        {/* Now playing title */}
        <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
          <Disc3
            className={`h-4 w-4 shrink-0 text-primary ${state.playing && state.track ? "animate-spin" : "opacity-50"}`}
            style={{ animationDuration: "3.5s" }}
          />
          <span className="truncate text-foreground/90">
            {state.track
              ? (state.track.title || (state.track.kind === "youtube" ? "YouTube stream" : "Audio stream"))
              : <span className="text-muted-foreground italic">Nothing on air</span>}
          </span>
        </div>

        {/* Listener controls (everyone) */}
        {state.allowListenerMute && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              onToggleListenerMute();
              if (muted) mediaControlsRef.current?.play();
            }}
            title={muted ? "Unmute" : "Mute"}
            aria-label={muted ? "Unmute DJ player" : "Mute DJ player"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        )}

        {/* Radio announcement notifications toggle */}
        <RadioNotifyToggle />


        {state.playing && state.track?.kind === "audio" && !muted && (
          <Button
            type="button"
            variant={playbackBlocked ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1 px-2"
            onClick={() => {
              if (localPaused) {
                setLocalPaused(false);
                mediaControlsRef.current?.play();
              } else {
                setLocalPaused(true);
                mediaControlsRef.current?.pause();
              }
            }}
            title={localPaused ? "Play stream" : "Pause stream"}
          >
            {localPaused
              ? <><Play className="h-3.5 w-3.5" /> Play</>
              : <><Pause className="h-3.5 w-3.5" /> Pause</>}
          </Button>
        )}
      </div>

      {/* Admin URL paste bar removed — manage tracks from the Broadcaster Studio (/broadcaster). */}


      {/* Hidden media element — drives the actual playback. */}
      <DjMediaSink
        state={state}
        volume={effectiveVolume}
        muted={muted}
        controlRef={mediaControlsRef}
        onPlaybackBlockedChange={setPlaybackBlocked}
      />
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
  state, volume, muted, controlRef, onPlaybackBlockedChange,
}: {
  state: DjPlayerState;
  volume: number;
  muted: boolean;
  controlRef: RefObject<DjMediaControls | null>;
  onPlaybackBlockedChange: (blocked: boolean) => void;
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
    controlRef.current = {
      play: () => requestAudioPlay(true),
      pause: () => { audioRef.current?.pause(); onPlaybackBlockedChange(false); },
    };
    return () => { controlRef.current = null; };
  }, [controlRef, requestAudioPlay, onPlaybackBlockedChange]);

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

function RadioNotifyToggle() {
  const prefs = useSoundPrefs();
  const on = prefs.radio_announcements !== false;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setSoundPref("radio_announcements", !on)}
      title={on ? "Mute radio notifications" : "Enable radio notifications"}
      aria-label={on ? "Mute radio notifications" : "Enable radio notifications"}
    >
      {on ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
    </Button>
  );
}

// Re-export defaults for admin pages that prefer the named import.
export { DJ_DEFAULTS };
