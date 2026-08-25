import type { SeoRouteDefinition } from "./types";

/** Human labels for known public routes. Auto-sync fills gaps for new routes. */
export const SEO_ROUTE_CATALOG: SeoRouteDefinition[] = [
  { pageKey: "home", routePath: "/", label: "Home", group: "Core" },
  { pageKey: "welcome", routePath: "/welcome", label: "Welcome (redirects to Home)", group: "Core" },
  { pageKey: "heropage", routePath: "/heropage", label: "Hero Page", group: "Core" },
  { pageKey: "feed", routePath: "/feed", label: "Feed", group: "Social" },
  { pageKey: "chatroom", routePath: "/chatroom", label: "Chatrooms", group: "Social" },
  { pageKey: "chatrooms", routePath: "/chatrooms", label: "Chatrooms List", group: "Social" },
  { pageKey: "competitions", routePath: "/competitions", label: "Competitions", group: "Social" },
  { pageKey: "competition-detail", routePath: "/competitions/$slug", label: "Competition Details", group: "Social", isDynamic: true, dynamicPattern: "/competitions/:slug" },
  { pageKey: "hall-of-fame", routePath: "/hall-of-fame", label: "Hall of Fame", group: "Social" },
  { pageKey: "leaderboard", routePath: "/leaderboard", label: "Leaderboard", group: "Social" },
  { pageKey: "confessions", routePath: "/confessions", label: "Confessions", group: "Social" },
  { pageKey: "communities", routePath: "/communities", label: "Communities", group: "Social" },
  { pageKey: "community-detail", routePath: "/community/$slug", label: "Community Details", group: "Social", isDynamic: true, dynamicPattern: "/community/:slug" },
  { pageKey: "find-friends", routePath: "/find-friends", label: "Friends", group: "Social" },
  { pageKey: "poetry", routePath: "/poetry/", label: "Poetry", group: "Poetry" },
  { pageKey: "poetry-detail", routePath: "/poetry/$slug", label: "Poetry Detail", group: "Poetry", isDynamic: true, dynamicPattern: "/poetry/:slug" },
  { pageKey: "poetry-categories", routePath: "/poetry/categories", label: "Poetry Categories", group: "Poetry" },
  { pageKey: "battle-hub", routePath: "/battle-hub", label: "Battle Field", group: "Games" },
  { pageKey: "games", routePath: "/games", label: "Games", group: "Games" },
  { pageKey: "game-detail", routePath: "/games/$slug", label: "Game Detail", group: "Games", isDynamic: true, dynamicPattern: "/games/:slug" },
  { pageKey: "radio", routePath: "/radio", label: "Radio", group: "Media" },
  { pageKey: "reels", routePath: "/reels", label: "Reels", group: "Media" },
  { pageKey: "profile", routePath: "/u/$username", label: "Profiles", group: "Users", isDynamic: true, dynamicPattern: "/u/:username" },
  { pageKey: "feed-post", routePath: "/feed/$slug", label: "Feed Post", group: "Social", isDynamic: true, dynamicPattern: "/feed/:slug" },
  { pageKey: "search", routePath: "/search", label: "Search", group: "Core" },
  { pageKey: "notifications", routePath: "/notifications", label: "Notifications", group: "Users" },
  { pageKey: "messages", routePath: "/messages", label: "Messages", group: "Users" },
  { pageKey: "account", routePath: "/account", label: "Account", group: "Users" },
  { pageKey: "pricing", routePath: "/pricing", label: "Pricing", group: "Marketing" },
  { pageKey: "wallet", routePath: "/wallet", label: "Wallet", group: "Users" },
  { pageKey: "login", routePath: "/login", label: "Login", group: "Auth" },
  { pageKey: "signup", routePath: "/signup", label: "Signup", group: "Auth" },
  { pageKey: "reset-password", routePath: "/reset-password", label: "Reset Password", group: "Auth" },
  { pageKey: "custom-page", routePath: "/$slug", label: "Static / CMS Pages", group: "Content", isDynamic: true, dynamicPattern: "/:slug" },
  { pageKey: "not-found", routePath: "/404", label: "404", group: "System" },
  { pageKey: "error", routePath: "/500", label: "500", group: "System" },
];

const EXCLUDED_PREFIXES = ["/admin", "/api/", "/broadcaster", "/deploy", "/installer", "/setup-wizard", "/lovable/"];
const EXCLUDED_EXACT = new Set([
  "/manifest.webmanifest",
  "/banned",
]);

export function pageKeyFromPath(routePath: string): string {
  return routePath
    .replace(/^\//, "")
    .replace(/\$[a-zA-Z]+/g, "param")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "home";
}

export function labelFromPath(routePath: string): string {
  if (routePath === "/") return "Home";
  const parts = routePath.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "Page";
  if (last.startsWith("$")) return `${last.slice(1)} Detail`;
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function isPublicSeoRoute(routePath: string): boolean {
  if (!routePath || routePath.includes("//")) return false;
  if (EXCLUDED_EXACT.has(routePath)) return false;
  return !EXCLUDED_PREFIXES.some((p) => routePath === p || routePath.startsWith(p));
}

/** Parse fullPath entries from generated route tree (server-side). */
export function parseRoutePathsFromTree(source: string): string[] {
  const paths = new Set<string>();
  for (const match of source.matchAll(/fullPath:\s*'([^']+)'/g)) {
    const p = match[1];
    if (isPublicSeoRoute(p)) paths.add(p);
  }
  return [...paths].sort();
}

export function buildRouteCatalog(discoveredPaths: string[]): SeoRouteDefinition[] {
  const byPath = new Map<string, SeoRouteDefinition>();
  for (const def of SEO_ROUTE_CATALOG) byPath.set(def.routePath, def);
  for (const routePath of discoveredPaths) {
    if (byPath.has(routePath)) continue;
    byPath.set(routePath, {
      pageKey: pageKeyFromPath(routePath),
      routePath,
      label: labelFromPath(routePath),
      group: "Auto-discovered",
      isDynamic: routePath.includes("$"),
      dynamicPattern: routePath.includes("$") ? routePath.replace(/\$[a-zA-Z]+/g, ":param") : undefined,
    });
  }
  return [...byPath.values()].sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}

export function matchDynamicTemplate(routePath: string): SeoRouteDefinition | undefined {
  return SEO_ROUTE_CATALOG.find((d) => d.isDynamic && d.routePath === routePath);
}
