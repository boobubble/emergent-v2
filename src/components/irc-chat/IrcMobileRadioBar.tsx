import { Link } from "@tanstack/react-router";
import { Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatRadioSource } from "@/lib/dj-store";
import { djMediaControlsRef, useDjListenerPrefs } from "@/components/chat/DjFooter";
import {
  formatIrcRadioNowPlaying,
  formatIrcRadioSubtitle,
  ircRadioLiveAccessibleLabel,
} from "@/lib/irc-chat/irc-chat-radio-present";
import { cn } from "@/lib/utils";

/**
 * Compact mobile radio controls — same DjMediaSink as sidebar widget; no extra audio element.
 */
export function IrcMobileRadioBar({ className }: { className?: string }) {
  const { ready, radio } = useChatRadioSource();
  const prefs = useDjListenerPrefs();

  if (!ready || !radio.visible) return null;

  const { state } = radio;
  const muted = state.allowListenerMute && prefs.listenerMuted;
  const showLive = radio.isLive && Boolean(state.track);
  const trackTitle = formatIrcRadioNowPlaying({
    trackLabel: radio.trackLabel,
    trackTitle: state.track?.title,
    isLive: radio.isLive,
    hasTrack: Boolean(state.track),
  });
  const subtitle = formatIrcRadioSubtitle({
    djName: state.djName,
    stationName: radio.stationName,
  });
  const canPlayPause = Boolean(state.playing && state.track);
  const liveLabel = ircRadioLiveAccessibleLabel(showLive, prefs.listenerPaused);

  const togglePlayPause = () => {
    const willPause = !prefs.listenerPaused;
    prefs.setListenerPaused(willPause);
    if (willPause) djMediaControlsRef.current?.pause();
    else djMediaControlsRef.current?.play();
  };

  return (
    <div
      className={cn(
        "irc-mobile-radio-bar shrink-0 border-t border-primary/20 bg-[hsl(230_38%_9%)] px-2.5 py-1.5 md:hidden",
        className,
      )}
      data-irc-mobile-radio-bar=""
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
          <Radio className="h-3 w-3" aria-hidden />
          <span>{liveLabel}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-foreground" title={trackTitle}>
            {trackTitle}
          </p>
          {subtitle ? (
            <p className="truncate text-[10px] text-muted-foreground" title={subtitle}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {canPlayPause ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full bg-primary/15 text-primary"
            onClick={togglePlayPause}
            aria-label={prefs.listenerPaused ? "Play stream" : "Pause stream"}
          >
            {prefs.listenerPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        ) : null}
        {state.allowListenerMute ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={() => prefs.setListenerMuted(!muted)}
            aria-label={muted ? "Unmute radio" : "Mute radio"}
          >
            {muted || prefs.listenerVolume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        ) : null}
        <Link
          to="/radio"
          className="shrink-0 text-[10px] font-medium text-primary/90 hover:text-primary"
        >
          More
        </Link>
      </div>
    </div>
  );
}
