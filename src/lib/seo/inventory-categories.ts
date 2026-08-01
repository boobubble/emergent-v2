export type SeoInventoryCategoryId =
  | "global-defaults"
  | "homepage"
  | "social-feed"
  | "chatrooms"
  | "poetry"
  | "memes-confessions"
  | "games"
  | "competitions"
  | "communities"
  | "profiles"
  | "blog-static"
  | "legal-system";

export type SeoInventoryCategory = {
  id: SeoInventoryCategoryId;
  label: string;
  description: string;
};

export const SEO_INVENTORY_CATEGORIES: SeoInventoryCategory[] = [
  { id: "global-defaults", label: "Global Defaults", description: "Site-wide SEO defaults from seo_global." },
  { id: "homepage", label: "Homepage", description: "Home, welcome, and hero landing pages." },
  { id: "social-feed", label: "Social & Feed", description: "Feed, posts, find friends, groups, reels, feedback." },
  { id: "chatrooms", label: "Chatrooms", description: "Public chat hub and community chatrooms." },
  { id: "poetry", label: "Poetry", description: "Poetry / Mehfil hub and poem pages." },
  { id: "memes-confessions", label: "Memes & Confessions", description: "Confessions and competition meme galleries." },
  { id: "games", label: "Games", description: "Games hub, radio, achievements, wallet, gamification." },
  { id: "competitions", label: "Competitions", description: "Competitions, live arena, hall of fame, leaderboards." },
  { id: "communities", label: "Communities", description: "Community directory, profiles, members, competitions." },
  { id: "profiles", label: "Profiles", description: "User profiles and account pages." },
  { id: "blog-static", label: "Blog & Static Pages", description: "CMS pages, blog posts, pages directory." },
  { id: "legal-system", label: "Legal & System Pages", description: "Pricing, trust, auth, invites, legal content." },
];

export function normalizeRoutePath(routePath: string): string {
  if (!routePath || routePath === "/") return "/";
  return routePath.replace(/\/+$/, "") || "/";
}

export function categorizeInventoryRoute(routePath: string): SeoInventoryCategoryId {
  const p = normalizeRoutePath(routePath);

  if (p === "/") return "homepage";
  if (p === "/welcome" || p === "/heropage") return "homepage";

  if (
    p === "/feed" ||
    p.startsWith("/feed/") ||
    p === "/find-friends" ||
    p === "/groups" ||
    p === "/reels" ||
    p === "/feedback" ||
    p.startsWith("/feedback/")
  ) {
    return "social-feed";
  }

  if (
    p === "/chatroom" ||
    p === "/chatrooms" ||
    p === "/chat" ||
    (p.startsWith("/community/") && p.includes("/chatrooms"))
  ) {
    return "chatrooms";
  }

  if (p.startsWith("/poetry") || p.startsWith("/mehfil")) return "poetry";

  if (p === "/confessions" || p.includes("/memes")) return "memes-confessions";

  if (
    p.startsWith("/games") ||
    p === "/battle-hub" ||
    p === "/radio" ||
    p === "/achievements" ||
    p === "/gamification" ||
    p === "/wallet"
  ) {
    return "games";
  }

  if (
    p.startsWith("/competitions") ||
    p === "/hall-of-fame" ||
    p === "/leaderboard"
  ) {
    return "competitions";
  }

  if (p === "/communities" || p.startsWith("/community")) return "communities";

  if (p.startsWith("/u/") || p === "/account") return "profiles";

  if (
    p === "/pages" ||
    p.startsWith("/p/") ||
    p === "/$slug" ||
    p.startsWith("/pages-editor")
  ) {
    return "blog-static";
  }

  if (
    p === "/pricing" ||
    p === "/trust" ||
    p === "/journey" ||
    p === "/login" ||
    p === "/reset-password" ||
    p.startsWith("/invite/") ||
    p === "/settings/privacy" ||
    p === "/deploy"
  ) {
    return "legal-system";
  }

  return "legal-system";
}
