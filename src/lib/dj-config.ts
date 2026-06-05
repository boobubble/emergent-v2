// Live DJ / RJ music player configuration.
// Persisted in app_settings.dj_player. Synced to every client via the
// app_settings realtime channel so all listeners hear the same track.
//
// This module only defines the shape + helpers. The runtime player lives
// in src/components/chat/DjFooter.tsx and the admin UI in
// src/routes/admin.dj.tsx.

import { parseYoutubeId } from "@/lib/media-providers-config";

export type DjTrackKind = "youtube" | "audio";

export interface DjTrack {
  kind: DjTrackKind;
  /** Original URL the DJ pasted. */
  url: string;
  /** Resolved YouTube videoId (when kind === "youtube"). */
  videoId?: string;
  /** Optional human-readable label shown in the player chip. */
  title?: string;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
}

export interface DjPlayerState {
  /** Master switch. When false the footer player is hidden for everyone. */
  enabled: boolean;
  /** Currently loaded track (null = idle, "Off air"). */
  track: DjTrack | null;
  /** True = playing; false = paused. */
  playing: boolean;
  /**
   * Epoch ms marking when the current track started, used to compute
   * the live playback position on every client. Reset when a track
   * changes or playback resumes.
   */
  startedAtMs: number;
  /** Saved playback position when paused (seconds). */
  positionSec: number;
  /** Default playback volume for listeners (0..100). */
  defaultVolume: number;
  /** Show DJ name / "On air" chip in the footer. */
  djName: string;
  /** Allow listeners to mute their own player. */
  allowListenerMute: boolean;
  /** Saved radio stations (DJ/RJ broadcaster URLs) admin can quick-go-live with. */
  stations: RadioStation[];
}

export const DJ_DEFAULTS: DjPlayerState = {
  enabled: false,
  track: null,
  playing: false,
  startedAtMs: 0,
  positionSec: 0,
  defaultVolume: 70,
  djName: "",
  allowListenerMute: true,
  stations: [],
};

export function mergeDjConfig(raw: unknown): DjPlayerState {
  const p = (raw ?? {}) as Partial<DjPlayerState>;
  return {
    ...DJ_DEFAULTS,
    ...p,
    track: p.track
      ? { kind: p.track.kind, url: p.track.url, videoId: p.track.videoId, title: p.track.title }
      : null,
    stations: Array.isArray(p.stations)
      ? p.stations
          .filter((s): s is RadioStation => !!s && typeof s.url === "string" && typeof s.name === "string")
          .map((s) => ({ id: String(s.id || crypto.randomUUID()), name: s.name, url: s.url }))
      : [],
  };
}

/** Build a DjTrack from a pasted URL. Returns null when unparseable. */
export function buildTrackFromUrl(input: string, title?: string): DjTrack | null {
  const url = (input || "").trim();
  if (!url) return null;
  const videoId = parseYoutubeId(url);
  if (videoId) return { kind: "youtube", url, videoId, title: title?.trim() || undefined };
  // Treat any other http(s) url as a direct audio stream (mp3/aac/ogg/m3u8).
  if (/^https?:\/\//i.test(url)) {
    return { kind: "audio", url, title: title?.trim() || undefined };
  }
  return null;
}

/** Live playback position in seconds, derived from server timestamps. */
export function currentPositionSec(state: DjPlayerState, nowMs: number = Date.now()): number {
  if (!state.track) return 0;
  if (!state.playing) return Math.max(0, state.positionSec);
  if (!state.startedAtMs) return Math.max(0, state.positionSec);
  return Math.max(0, state.positionSec + (nowMs - state.startedAtMs) / 1000);
}
