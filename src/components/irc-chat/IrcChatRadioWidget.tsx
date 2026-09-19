import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatRadioSource } from "@/lib/dj-store";
import { djMediaControlsRef, useDjListenerPrefs } from "@/components/chat/DjFooter";
import { cn } from "@/lib/utils";

/**
 * IRC sidebar radio presentation — controls the shared DjPlayerHost sink only.
 */
export function IrcChatRadioWidget({ className }: { className?: string }) {
  const { ready, radio } = useChatRadioSource();
  const prefs = useDjListenerPrefs();
  const volumeRef = useRef<HTMLDivElement>(null);

  if (!ready) {
    return (
      <div className={cn("irc-radio-widget-card", className)} data-irc-radio-widget="">
        <p className="irc-radio-widget-title">
          <Radio className="h-3.5 w-3.5" aria-hidden />
          Yaarzo Radio
        </p>
        <p className="text-[10px] text-muted-foreground">Loading radio…</p>
      </div>
    );
  }

  if (!radio.visible) {
    return (
      <div className={cn("irc-radio-widget-card", className)} data-irc-radio-widget="">
        <p className="irc-radio-widget-title">
          <Radio className="h-3.5 w-3.5" aria-hidden />
          Yaarzo Radio
        </p>
        <p className="text-[10px] text-muted-foreground">Radio currently unavailable</p>
      </div>
    );
  }

  const { state } = radio;
  const muted = state.allowListenerMute && prefs.listenerMuted;
  const trackTitle = radio.trackLabel ?? state.track?.title ?? null;
  const djLabel = state.djName?.trim() || null;
  const showLive = radio.isLive && state.track;
  const canPlayPause = Boolean(state.playing && state.track);

  const togglePlayPause = () => {
    const willPause = !prefs.listenerPaused;
    prefs.setListenerPaused(willPause);
    if (willPause) djMediaControlsRef.current?.pause();
    else djMediaControlsRef.current?.play();
  };

  return (
    <div className={cn("irc-radio-widget-card", className)} data-irc-radio-widget="">
      <div className="flex items-start justify-between gap-2">
        <p className="irc-radio-widget-title min-w-0 flex-1">
          <Radio className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span className="truncate">Yaarzo Radio</span>
        </p>
        {showLive && !prefs.listenerPaused ? (
          <span className="irc-radio-live-badge shrink-0">● LIVE</span>
        ) : (
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            Radio
          </span>
        )}
      </div>

      <div className="mt-2 min-w-0 space-y-0.5">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          Now playing
        </p>
        <p className="truncate text-[11px] font-semibold text-foreground" title={trackTitle ?? undefined}>
          {trackTitle ?? (showLive ? "Live stream" : "Off air")}
        </p>
        {djLabel ? (
          <p className="truncate text-[10px] text-muted-foreground" title={djLabel}>
            {djLabel}
          </p>
        ) : radio.stationName ? (
          <p className="truncate text-[10px] text-muted-foreground" title={radio.stationName}>
            {radio.stationName}
          </p>
        ) : null}
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        {canPlayPause ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full bg-primary/15 text-primary hover:bg-primary/25"
            onClick={togglePlayPause}
            title={prefs.listenerPaused ? "Play stream" : "Pause stream"}
            aria-label={prefs.listenerPaused ? "Play stream" : "Pause stream"}
          >
            {prefs.listenerPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        ) : null}

        {state.allowListenerMute ? (
          <div ref={volumeRef} className="relative flex min-w-0 flex-1 items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 rounded-full"
              onClick={() => {
                if (muted) prefs.setListenerMuted(false);
                else prefs.setListenerMuted(true);
              }}
              title={muted ? "Unmute radio" : "Volume"}
              aria-label={muted ? "Unmute radio" : "Volume"}
            >
              {muted || prefs.listenerVolume === 0 ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <input
              type="range"
              min={0}
              max={100}
              value={prefs.listenerVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                prefs.setListenerVolume(v);
                if (v > 0 && muted) prefs.setListenerMuted(false);
                if (v === 0 && !muted) prefs.setListenerMuted(true);
              }}
              className="irc-radio-volume-range min-w-0 flex-1"
              aria-label="Radio volume"
            />
          </div>
        ) : null}
      </div>

      <Link
        to="/radio"
        className="mt-2 block text-center text-[9px] font-medium text-primary/80 hover:text-primary"
      >
        Open Radio
      </Link>
    </div>
  );
}
