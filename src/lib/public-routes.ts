/**
 * Public / read-only route classification used by AuthGate.
 *
 * Logged-out visitors may browse these paths without creating any
 * Supabase auth user, profile row, guest account, or persistent session.
 * Write actions on these pages must use `useAuthGate().requireAuth(...)`.
 */

/** Landing / auth / API paths reachable without a signed-in user. */
export const PUBLIC_PATH_PREFIXES = [
  "/welcome",
  "/heropage",
  "/login",
  "/reset-password",
  "/banned",
  "/p/",
  "/api/",
  "/lovable/",
  "/installer",
] as const;

export const PUBLIC_EXACT = new Set([
  "/", // crawlable homepage: AuthGate must not SSR "Loading…"
  "/welcome",
  "/heropage",
  "/login",
  "/reset-password",
  "/banned",
  "/installer",
]);

/**
 * Publicly readable app routes — visitors may view content, but individual
 * write actions must gate themselves via `useAuthGate().requireAuth(...)`.
 */
export const READ_ONLY_PUBLIC_APP_PREFIXES = [
  "/feed",
  "/chatroom",
  "/chatrooms",
  "/confessions",
  "/battle-hub",
  "/leaderboard",
  "/poetry",
  "/mehfil",
  "/competitions",
  "/u",
  "/pages",
  "/communities",
  "/community",
  "/invite",
  "/trust",
  "/pricing",
  "/hall-of-fame",
] as const;

export function isReadOnlyPublicAppPath(pathname: string): boolean {
  return READ_ONLY_PUBLIC_APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export function isPublicPath(
  pathname: string,
  opts?: { isPublicCmsSlugPath?: (path: string) => boolean },
): boolean {
  if (opts?.isPublicCmsSlugPath?.(pathname)) return true;
  if (isReadOnlyPublicAppPath(pathname)) return true;
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}
