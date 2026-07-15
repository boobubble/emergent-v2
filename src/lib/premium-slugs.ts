// Catalog of "premium" community slugs — short, generic, geographic, or category
// words that require admin approval to claim. Kept in sync with reserved-routes.ts
// (a slug that clashes with a reserved top-level route can never be claimed).

import { isReservedSlug } from "./reserved-routes";

/** Short slugs (<=4 chars) are automatically premium. */
export function isShortSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 4;
}

/** Curated premium slug list — expand freely, matching is case-insensitive. */
export const PREMIUM_SLUGS = new Set<string>([
  // Categories
  "gaming", "music", "tech", "sports", "movies", "anime", "art", "photo",
  "fitness", "food", "travel", "fashion", "beauty", "science", "coding",
  "crypto", "finance", "business", "startup", "education", "health", "news",
  "memes", "cars", "books", "writers", "creators", "podcasts", "esports",
  // Regions / countries
  "india", "usa", "uk", "japan", "korea", "brazil", "germany", "france",
  "canada", "mexico", "spain", "italy", "china", "africa", "europe", "asia",
  // Cities
  "mumbai", "delhi", "tokyo", "london", "paris", "berlin", "dubai",
  "newyork", "la", "sf", "chicago", "toronto", "sydney",
  // Generic / brand-ish
  "official", "vip", "elite", "premium", "pro", "hub", "world", "global",
  "central", "the", "main", "home", "lounge", "club",
]);

export function isPremiumSlug(slug: string): boolean {
  const s = slug.toLowerCase().trim();
  if (!s) return false;
  if (isShortSlug(s)) return true;
  return PREMIUM_SLUGS.has(s);
}

/** Anything reserved (route conflict) can never be claimed. */
export function isClaimableSlug(slug: string): boolean {
  const s = slug.toLowerCase().trim();
  if (!s) return false;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s)) return false;
  if (isReservedSlug(s)) return false;
  return true;
}

export function classifySlug(slug: string): "reserved" | "premium" | "standard" | "invalid" {
  const s = slug.toLowerCase().trim();
  if (!s || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s)) return "invalid";
  if (isReservedSlug(s)) return "reserved";
  if (isPremiumSlug(s)) return "premium";
  return "standard";
}
