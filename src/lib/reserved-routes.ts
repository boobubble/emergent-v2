// Reserved top-level slugs that custom pages cannot use.
// Keep in sync with src/routes/*.tsx top-level files.
export const RESERVED_SLUGS = new Set<string>([
  "admin", "api", "feed", "games", "rooms", "chatroom", "chatrooms", "messages", "profile",
  "settings", "friends", "find-friends", "notifications", "login",
  "register", "signup", "logout", "auth", "account", "achievements",
  "leaderboard", "reset-password", "welcome", "banned", "confessions", "feedback", "u", "p", "assets", "static",
  "public", "favicon.ico", "robots.txt", "sitemap.xml", "manifest.json",
  "_root", "__root", "index", "reels", "pages", "groups", "installer",
]);

export function isReservedSlug(slug: string): boolean {
  if (!slug) return true;
  const head = slug.split("/")[0].toLowerCase();
  return RESERVED_SLUGS.has(head);
}
