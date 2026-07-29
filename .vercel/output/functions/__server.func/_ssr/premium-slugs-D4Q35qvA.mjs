import { isReservedSlug } from "./reserved-routes-BWsWje6t.mjs";
function isShortSlug(slug) {
  return slug.length > 0 && slug.length <= 4;
}
const PREMIUM_SLUGS = /* @__PURE__ */ new Set([
  // Categories
  "gaming",
  "music",
  "tech",
  "sports",
  "movies",
  "anime",
  "art",
  "photo",
  "fitness",
  "food",
  "travel",
  "fashion",
  "beauty",
  "science",
  "coding",
  "crypto",
  "finance",
  "business",
  "startup",
  "education",
  "health",
  "news",
  "memes",
  "cars",
  "books",
  "writers",
  "creators",
  "podcasts",
  "esports",
  // Regions / countries
  "india",
  "usa",
  "uk",
  "japan",
  "korea",
  "brazil",
  "germany",
  "france",
  "canada",
  "mexico",
  "spain",
  "italy",
  "china",
  "africa",
  "europe",
  "asia",
  // Cities
  "mumbai",
  "delhi",
  "tokyo",
  "london",
  "paris",
  "berlin",
  "dubai",
  "newyork",
  "la",
  "sf",
  "chicago",
  "toronto",
  "sydney",
  // Generic / brand-ish
  "official",
  "vip",
  "elite",
  "premium",
  "pro",
  "hub",
  "world",
  "global",
  "central",
  "the",
  "main",
  "home",
  "lounge",
  "club"
]);
function isPremiumSlug(slug) {
  const s = slug.toLowerCase().trim();
  if (!s) return false;
  if (isShortSlug(s)) return true;
  return PREMIUM_SLUGS.has(s);
}
function isClaimableSlug(slug) {
  const s = slug.toLowerCase().trim();
  if (!s) return false;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s)) return false;
  if (isReservedSlug(s)) return false;
  return true;
}
function classifySlug(slug) {
  const s = slug.toLowerCase().trim();
  if (!s || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s)) return "invalid";
  if (isReservedSlug(s)) return "reserved";
  if (isPremiumSlug(s)) return "premium";
  return "standard";
}
export {
  PREMIUM_SLUGS,
  classifySlug,
  isClaimableSlug,
  isPremiumSlug,
  isShortSlug
};
