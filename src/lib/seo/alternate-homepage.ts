import type { ResolvedSeo } from "./types";

/**
 * Alternate marketing landings that must stay live (HTTP 200) but must not
 * compete with the primary SEO homepage at `/`.
 */
export const ALTERNATE_HOMEPAGE_PATHS = new Set(["/welcome", "/heropage"]);

export const ALTERNATE_HOMEPAGE_ROBOTS = "noindex, follow";

export function isAlternateHomepagePath(path: string): boolean {
  return ALTERNATE_HOMEPAGE_PATHS.has(path);
}

/** Force crawlable noindex without changing title, description, canonical, or social meta. */
export function applyAlternateHomepageRobots(seo: ResolvedSeo): ResolvedSeo {
  return {
    ...seo,
    robots: ALTERNATE_HOMEPAGE_ROBOTS,
    noindex: true,
    nofollow: false,
  };
}
