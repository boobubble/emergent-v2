/** Presentation-only helpers for IRC chat radio UI (no playback logic). */

export function formatIrcRadioNowPlaying(input: {
  trackLabel?: string | null;
  trackTitle?: string | null;
  isLive?: boolean;
  hasTrack?: boolean;
}): string {
  const label = (input.trackLabel ?? input.trackTitle)?.trim();
  if (label) return label;
  if (input.isLive && input.hasTrack) return "Live stream";
  return "Off air";
}

export function formatIrcRadioSubtitle(input: {
  djName?: string | null;
  stationName?: string | null;
}): string | null {
  const dj = input.djName?.trim();
  if (dj) return dj;
  const station = input.stationName?.trim();
  return station || null;
}

export function ircRadioLiveAccessibleLabel(isLive: boolean, paused: boolean): string {
  if (!isLive) return "Radio";
  if (paused) return "Live stream paused";
  return "Live on air";
}
