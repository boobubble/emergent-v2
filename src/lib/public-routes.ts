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

/** Private utility routes that must not bounce guests to an indexable marketing page. */
export function isPrivateUtilityPath(pathname: string): boolean {
  return (
    pathname === "/settings"
    || pathname.startsWith("/settings/")
    || pathname === "/notifications"
    || pathname.startsWith("/notifications/")
  );
}

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
  "/blog",
  "/invite",
  "/trust",
  "/pricing",
  "/hall-of-fame",
  "/find-friends",
  "/games",
  "/achievements",
  "/site-directory",
] as const;

export function isReadOnlyPublicAppPath(pathname: string): boolean {
  return READ_ONLY_PUBLIC_APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

/**
 * Guest surfaces that need GuestChatProvider. Content pages (blog, poetry, CMS)
 * must SSR without the lazy chat shell so crawlers see H1/body markup.
 */
export function needsGuestChatShell(pathname: string): boolean {
  return (
    pathname === "/feed" ||
    pathname.startsWith("/feed/") ||
    pathname === "/chatroom" ||
    pathname.startsWith("/chatroom/") ||
    pathname === "/chatrooms" ||
    pathname.startsWith("/chatrooms/") ||
    pathname === "/leaderboard" ||
    pathname.startsWith("/leaderboard/") ||
    pathname === "/achievements" ||
    pathname.startsWith("/achievements/")
  );
}

/** Crawler-visible H1 for chat-shell routes whose UI is inside a lazy Suspense boundary. */
export function publicSsrHeading(pathname: string): string | null {
  if (pathname === "/feed" || pathname.startsWith("/feed/")) return "Community Feed";
  if (pathname === "/chatroom" || pathname.startsWith("/chatroom/") || pathname === "/chatrooms") {
    return "Chatrooms";
  }
  if (pathname === "/leaderboard" || pathname.startsWith("/leaderboard/")) return "Leaderboard";
  if (pathname === "/achievements" || pathname.startsWith("/achievements/")) return "Achievements";
  return null;
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
