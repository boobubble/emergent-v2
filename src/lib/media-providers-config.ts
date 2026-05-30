// YouTube + Giphy media provider configuration.
// Persisted in app_settings.media. Client reads keys for embed/search.
// NOTE: YouTube Data API + Giphy SDK keys are designed for client-side use.
// Restrict them by HTTP referrer / domain in their respective consoles.

export interface YoutubeConfig {
  enabled: boolean;
  apiKey: string;
  defaultPrivacy: "public" | "unlisted";
  /** Restrict embeds (e.g. to "youtube.com"). Empty = allow all. */
  allowedDomains: string[];
}

export interface GiphyConfig {
  enabled: boolean;
  apiKey: string;
  rating: "g" | "pg" | "pg-13" | "r";
  /** Max results per search/trending request. */
  pageSize: number;
}

export interface MediaConfig {
  youtube: YoutubeConfig;
  giphy: GiphyConfig;
}

export const MEDIA_DEFAULTS: MediaConfig = {
  youtube: {
    enabled: false,
    apiKey: "",
    defaultPrivacy: "public",
    allowedDomains: ["youtube.com", "youtu.be"],
  },
  giphy: {
    enabled: false,
    apiKey: "",
    rating: "pg-13",
    pageSize: 24,
  },
};

export function mergeMediaConfig(raw: unknown): MediaConfig {
  const p = (raw ?? {}) as Partial<MediaConfig>;
  return {
    youtube: { ...MEDIA_DEFAULTS.youtube, ...(p.youtube ?? {}) },
    giphy:   { ...MEDIA_DEFAULTS.giphy,   ...(p.giphy   ?? {}) },
  };
}

/** Extract a YouTube video id from many common URL shapes. */
export function parseYoutubeId(input: string): string | null {
  const s = (input || "").trim();
  if (!s) return null;
  // Bare id (11 chars, alphanumeric + - _)
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      const m = u.pathname.match(/^\/(embed|shorts|v|live)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch { /* not a URL */ }
  return null;
}

/** Detect a Giphy URL (giphy.com or media.giphy.com). */
export function parseGiphyUrl(input: string): { id: string; gifUrl: string } | null {
  const s = (input || "").trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "");
    if (host.endsWith("giphy.com")) {
      // .../something-ID  OR  /media/ID/giphy.gif
      const m = u.pathname.match(/-([A-Za-z0-9]{6,})\/?$/) ||
                u.pathname.match(/\/media\/([A-Za-z0-9]+)\//) ||
                u.pathname.match(/\/gifs\/([A-Za-z0-9]+)/);
      if (m) {
        const id = m[1];
        return { id, gifUrl: `https://media.giphy.com/media/${id}/giphy.gif` };
      }
    }
  } catch { /* */ }
  return null;
}
