/**
 * Public homepage/feed avatar selection.
 * Shows any https `profiles.avatar_url` unless the avatar was admin-rejected.
 * Never emit data:/blob: URLs or quarantine paths.
 */
import type { AvatarModStatus } from "@/lib/avatar-social-media";
import { resolveAvatarForBuffer } from "@/lib/avatar-social-media";

/** Current upload paths are `{userId}/avatar-{Date.now()}.ext`. */
const UNIQUE_AVATAR_OBJECT = /\/avatar-\d{10,}(?:\.[a-z0-9]+)?$/i;

export function avatarObjectLooksUnique(url: string): boolean {
  try {
    return UNIQUE_AVATAR_OBJECT.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/** Stable token from `profiles.avatar_moderated_at`. Never `Date.now()` / `updated_at`. */
export function publicAvatarVersionToken(moderatedAt?: string | null): string | undefined {
  if (!moderatedAt) return undefined;
  const ms = Date.parse(moderatedAt);
  if (!Number.isFinite(ms)) return undefined;
  return String(Math.floor(ms / 1000));
}

/**
 * Cache-bust only when the storage object path is reused across DP changes.
 * Unique `avatar-{timestamp}` objects already change URL on every upload.
 */
export function applyPublicAvatarVersion(url: string, version?: string | null): string {
  if (!version || avatarObjectLooksUnique(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("v", version);
    return u.toString();
  } catch {
    return url;
  }
}

export function resolvePublicAvatarUrl(opts: {
  avatarUrl?: string | null;
  avatarModerationStatus?: AvatarModStatus | string | null;
  avatarModeratedAt?: string | null;
}): string | undefined {
  const { mediaUrl, mediaSource } = resolveAvatarForBuffer({
    avatarUrl: opts.avatarUrl,
    avatarModerationStatus: opts.avatarModerationStatus,
    defaultMediaUrl: null,
  });
  if (mediaSource !== "user_avatar" || !mediaUrl) return undefined;
  return applyPublicAvatarVersion(mediaUrl, publicAvatarVersionToken(opts.avatarModeratedAt));
}

/** Prefer Supabase image transform when the URL is a public storage object. */
export function publicAvatarThumbUrl(url: string, size: number): string {
  try {
    const u = new URL(url);
    const version = u.searchParams.get("v");
    const marker = "/storage/v1/object/public/";
    const idx = u.pathname.indexOf(marker);
    if (idx < 0) return url;
    const objectPath = u.pathname.slice(idx + marker.length);
    u.pathname = `/storage/v1/render/image/public/${objectPath}`;
    u.search = "";
    u.searchParams.set("width", String(Math.max(16, Math.round(size))));
    u.searchParams.set("height", String(Math.max(16, Math.round(size))));
    u.searchParams.set("resize", "cover");
    if (version) u.searchParams.set("v", version);
    return u.toString();
  } catch {
    return url;
  }
}

export function publicProfilePath(username: string): string {
  return `/u/${encodeURIComponent(username.trim())}`;
}
