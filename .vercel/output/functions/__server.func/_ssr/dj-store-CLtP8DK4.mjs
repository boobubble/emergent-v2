import { r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { p as parseYoutubeId } from "./media-providers-config-Do_nLlCF.mjs";
const DJ_DEFAULTS = {
  enabled: false,
  track: null,
  playing: false,
  startedAtMs: 0,
  positionSec: 0,
  defaultVolume: 70,
  djName: "",
  allowListenerMute: true,
  stations: []
};
function mergeDjConfig(raw) {
  const p = raw ?? {};
  return {
    ...DJ_DEFAULTS,
    ...p,
    track: p.track ? { kind: p.track.kind, url: p.track.url, videoId: p.track.videoId, title: p.track.title } : null,
    stations: Array.isArray(p.stations) ? p.stations.filter((s) => !!s && typeof s.url === "string" && typeof s.name === "string").map((s) => ({ id: String(s.id || crypto.randomUUID()), name: s.name, url: s.url })) : []
  };
}
function normalizeStreamUrl(input) {
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
const DIRECT_AUDIO_EXT = /\.(mp3|aac|ogg|opus|m4a|flac|wav)(\?|#|$)/i;
const HLS_EXT = /\.m3u8(\?|#|$)/i;
function analyzeStreamUrl(input) {
  const raw = (input || "").trim();
  if (!raw) {
    return { kind: "invalid", normalizedUrl: "", wasNormalized: false, ok: false, note: "" };
  }
  if (parseYoutubeId(raw)) {
    return { kind: "youtube", normalizedUrl: raw, wasNormalized: false, ok: true, note: "YouTube video — will play via the embedded player." };
  }
  let u;
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
  const path = (() => {
    try {
      return new URL(normalized).pathname;
    } catch {
      return u.pathname;
    }
  })();
  if (HLS_EXT.test(path)) {
    return { kind: "hls", normalizedUrl: normalized, wasNormalized, ok: true, note: wasNormalized ? "Detected HLS stream after normalization." : "Detected HLS (.m3u8) stream." };
  }
  if (DIRECT_AUDIO_EXT.test(path) || /\/listen\/[^/]+\/(radio|stream)/i.test(path) || /\/(stream|listen)(\.|$)/i.test(path)) {
    return {
      kind: wasNormalized ? "direct-audio" : "direct-audio",
      normalizedUrl: normalized,
      wasNormalized,
      ok: true,
      note: wasNormalized ? "Detected an Azuracast player page — using the direct stream URL instead." : "Looks like a direct audio stream."
    };
  }
  if (path === "/" || path === "") {
    return { kind: "direct-audio", normalizedUrl: normalized, wasNormalized, ok: true, note: "Treating as a direct stream root (Icecast/Shoutcast)." };
  }
  return {
    kind: "player-page",
    normalizedUrl: normalized,
    wasNormalized,
    ok: false,
    note: "This looks like an HTML player page, not an audio stream. Paste the direct stream URL (usually ends in .mp3, .aac, or .m3u8)."
  };
}
function buildTrackFromUrl(input, title) {
  const raw = (input || "").trim();
  if (!raw) return null;
  const videoId = parseYoutubeId(raw);
  if (videoId) return { kind: "youtube", url: raw, videoId, title: title?.trim() || void 0 };
  if (/^https?:\/\//i.test(raw)) {
    const url = normalizeStreamUrl(raw);
    return { kind: "audio", url, title: title?.trim() || void 0 };
  }
  return null;
}
function currentPositionSec(state, nowMs = Date.now()) {
  if (!state.track) return 0;
  if (!state.playing) return Math.max(0, state.positionSec);
  if (!state.startedAtMs) return Math.max(0, state.positionSec);
  return Math.max(0, state.positionSec + (nowMs - state.startedAtMs) / 1e3);
}
const SETTINGS_KEY = "dj_player";
function useDjPlayer() {
  const [state, setState] = reactExports.useState(DJ_DEFAULTS);
  const [ready, setReady] = reactExports.useState(false);
  const load = async () => {
    const { data } = await supabase.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
    setState(mergeDjConfig(data?.value));
    setReady(true);
  };
  reactExports.useEffect(() => {
    let mounted = true;
    load().catch(() => {
      if (mounted) setReady(true);
    });
    const channel = supabase.channel(`dj_player_${Math.random().toString(36).slice(2, 8)}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "app_settings", filter: `key=eq.${SETTINGS_KEY}` },
      (payload) => {
        const next = payload.new?.value;
        if (next === void 0) load();
        else setState(mergeDjConfig(next));
      }
    ).subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
  return { state, ready, reload: load };
}
export {
  analyzeStreamUrl as a,
  buildTrackFromUrl as b,
  currentPositionSec as c,
  normalizeStreamUrl as n,
  useDjPlayer as u
};
