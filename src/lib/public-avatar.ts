/**
 * Public homepage/feed avatar selection.
 * Reuses the same gate as social publishing: only an https `profiles.avatar_url`
 * with `avatar_moderation_status === "approved"` may be shown.
 * Never emit data:/blob: URLs, quarantine paths, or unmoderated images.
 */
import type { AvatarModStatus } from "@/lib/avatar-social-media";
import { resolveAvatarForBuffer } from "@/lib/avatar-social-media";

export function resolvePublicAvatarUrl(opts: {
  avatarUrl?: string | null;
  avatarModerationStatus?: AvatarModStatus | string | null;
}): string | undefined {
  const { mediaUrl, mediaSource } = resolveAvatarForBuffer({
    avatarUrl: opts.avatarUrl,
    avatarModerationStatus: opts.avatarModerationStatus,
    defaultMediaUrl: null,
  });
  if (mediaSource !== "user_avatar" || !mediaUrl) return undefined;
  return mediaUrl;
}

/** Prefer Supabase image transform when the URL is a public storage object. */
export function publicAvatarThumbUrl(url: string, size: number): string {
  try {
    const u = new URL(url);
    const marker = "/storage/v1/object/public/";
    const idx = u.pathname.indexOf(marker);
    if (idx < 0) return url;
    const objectPath = u.pathname.slice(idx + marker.length);
    u.pathname = `/storage/v1/render/image/public/${objectPath}`;
    u.search = "";
    u.searchParams.set("width", String(Math.max(16, Math.round(size))));
    u.searchParams.set("height", String(Math.max(16, Math.round(size))));
    u.searchParams.set("resize", "cover");
    return u.toString();
  } catch {
    return url;
  }
}

export function publicProfilePath(username: string): string {
  return `/u/${encodeURIComponent(username.trim())}`;
}
