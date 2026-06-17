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

/**
 * Normalize known radio-station web-player URLs to their actual audio stream.
 * Azuracast example: https://host/public/STATION → https://host/listen/STATION/radio.mp3
 */
export function normalizeStreamUrl(input: string): string {
  try {
    const u = new URL(input);
    const m = u.pathname.match(/^\/public\/([^/]+)\/?$/);
    if (m) {
      return `${u.origin}/listen/${m[1]}/radio.mp3`;
    }
    return input;
  } catch {
    return input;
  }
}

export type StreamUrlKind = "youtube" | "direct-audio" | "hls" | "player-page" | "invalid";

export interface StreamUrlAnalysis {
  kind: StreamUrlKind;
  /** Final URL to feed into the player (normalized when possible). */
  normalizedUrl: string;
  /** True when the user pasted an HTML player page we auto-converted. */
  wasNormalized: boolean;
  /** Human-readable note shown next to the input. */
  note: string;
  /** False when we cannot safely go live with this URL. */
  ok: boolean;
}

const DIRECT_AUDIO_EXT = /\.(mp3|aac|ogg|opus|m4a|flac|wav)(\?|#|$)/i;
const HLS_EXT = /\.m3u8(\?|#|$)/i;

/** Inspect a pasted URL and explain whether it's a usable audio stream. */
export function analyzeStreamUrl(input: string): StreamUrlAnalysis {
  const raw = (input || "").trim();
  if (!raw) {
    return { kind: "invalid", normalizedUrl: "", wasNormalized: false, ok: false, note: "" };
  }
  if (parseYoutubeId(raw)) {
    return { kind: "youtube", normalizedUrl: raw, wasNormalized: false, ok: true, note: "YouTube video — will play via the embedded player." };
  }
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { kind: "invalid", normalizedUrl: raw, wasNormalized: false, ok: false, note: "Not a valid URL." };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { kind: "invalid", normalizedUrl: raw, wasNormalized: false, ok: false, note: "URL must start with http:// or https://." };
  }
  const normalized = normalizeStreamUrl(raw);
  const wasNormalized = normalized !== raw;
  const path = (() => { try { return new URL(normalized).pathname; } catch { return u.pathname; } })();

  if (HLS_EXT.test(path)) {
    return { kind: "hls", normalizedUrl: normalized, wasNormalized, ok: true, note: wasNormalized ? "Detected HLS stream after normalization." : "Detected HLS (.m3u8) stream." };
  }
  if (DIRECT_AUDIO_EXT.test(path) || /\/listen\/[^/]+\/(radio|stream)/i.test(path) || /\/(stream|listen)(\.|$)/i.test(path)) {
    return {
      kind: wasNormalized ? "direct-audio" : "direct-audio",
      normalizedUrl: normalized,
      wasNormalized,
      ok: true,
      note: wasNormalized
        ? "Detected an Azuracast player page — using the direct stream URL instead."
        : "Looks like a direct audio stream.",
    };
  }
  // Bare host with no path: likely an Icecast/Shoutcast mount root — usually OK.
  if (path === "/" || path === "") {
    return { kind: "direct-audio", normalizedUrl: normalized, wasNormalized, ok: true, note: "Treating as a direct stream root (Icecast/Shoutcast)." };
  }
  // Anything else: probably an HTML player page we can't auto-convert.
  return {
    kind: "player-page",
    normalizedUrl: normalized,
    wasNormalized,
    ok: false,
    note: "This looks like an HTML player page, not an audio stream. Paste the direct stream URL (usually ends in .mp3, .aac, or .m3u8).",
  };
}

/** Build a DjTrack from a pasted URL. Returns null when unparseable. */
export function buildTrackFromUrl(input: string, title?: string): DjTrack | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  const videoId = parseYoutubeId(raw);
  if (videoId) return { kind: "youtube", url: raw, videoId, title: title?.trim() || undefined };
  // Treat any other http(s) url as a direct audio stream (mp3/aac/ogg/m3u8).
  if (/^https?:\/\//i.test(raw)) {
    const url = normalizeStreamUrl(raw);
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
