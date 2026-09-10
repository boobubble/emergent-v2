/** Allowlisted YouTube embed hosts — never use raw user URLs as iframe src. */
export const YOUTUBE_EMBED_HOSTS = [
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
] as const;

export type YoutubeEmbedHost = (typeof YOUTUBE_EMBED_HOSTS)[number];

export function youtubeEmbedHost(defaultPrivacy: "public" | "unlisted"): YoutubeEmbedHost {
  return defaultPrivacy === "unlisted"
    ? "https://www.youtube-nocookie.com"
    : "https://www.youtube.com";
}

/** Build a safe embed URL from a validated 11-char video id. */
export function buildYoutubeEmbedUrl(
  videoId: string,
  host: YoutubeEmbedHost,
  opts?: { autoplay?: boolean; enableJsApi?: boolean; origin?: string },
): string | null {
  if (!/^[\w-]{11}$/.test(videoId)) return null;
  if (!YOUTUBE_EMBED_HOSTS.includes(host)) return null;

  const params = new URLSearchParams();
  if (opts?.autoplay) params.set("autoplay", "1");
  if (opts?.enableJsApi !== false) params.set("enablejsapi", "1");
  params.set("rel", "0");
  params.set("modestbranding", "1");
  params.set("playsinline", "1");
  if (opts?.origin) params.set("origin", opts.origin);

  const qs = params.toString();
  return `${host}/embed/${videoId}${qs ? `?${qs}` : ""}`;
}

export function youtubeWatchUrl(videoId: string): string | null {
  if (!/^[\w-]{11}$/.test(videoId)) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeThumbnailUrl(videoId: string): string | null {
  if (!/^[\w-]{11}$/.test(videoId)) return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Whether the pathname is inside chat/DM surfaces where floating media may persist. */
export function isChatMediaContextPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/chatroom" || pathname === "/chat") return true;
  if (/^\/community\/[^/]+\/chatrooms(?:\/|$)/.test(pathname)) return true;
  return false;
}
