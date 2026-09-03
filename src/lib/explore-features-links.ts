/**
 * Shared "Explore more on Yaarzo" feature-link picker.
 *
 * These links are rendered as SSR <a href> on public CMS/blog pages, but they
 * live outside stored custom_pages.content / blog_posts.content (same pattern
 * as Related Chat Rooms). getOrphanReport therefore counts the same
 * deterministic subset as synthetic graph links so Hub incoming totals match
 * the HTML crawlers and users actually see.
 */

import { normalizeInternalHref } from "@/lib/internal-linking-orphans";
import { CITY_CATEGORIES } from "@/lib/content-automation/peer-geo-links";

export const EXPLORE_FEATURES_HEADING = "Explore more on Yaarzo";
export const EXPLORE_FEATURES_COUNT = 3;
export const EXPLORE_FEATURES_BLOG_COUNT = 2;

const PLATFORM_TYPES = new Set(["community_page", "game", "feed_page"]);

const EXCLUDED_SEO_CATEGORIES = new Set<string>([
  ...CITY_CATEGORIES,
  "country",
  "language",
  "legal",
]);

export type ExploreFeatureTarget = {
  url: string;
  title: string;
  type: string;
  category?: string | null;
};

export type ExploreFeatureLink = {
  href: string;
  label: string;
};

/** Platform chrome + topic/feature seo_pages — not city/country/legal/language. */
export function isExploreFeatureTarget(t: ExploreFeatureTarget): boolean {
  if (PLATFORM_TYPES.has(t.type)) return true;
  if (t.type !== "seo_page") return false;
  const cat = (t.category || "").toLowerCase();
  if (EXCLUDED_SEO_CATEGORIES.has(cat)) return false;
  return cat === "type" || cat === "";
}

export function featureLinkLabel(title: string, url: string): string {
  const fromTitle = title.split("|")[0].split("–")[0].split(":")[0].replace(/\s+/g, " ").trim();
  if (fromTitle && fromTitle.length <= 22) return fromTitle;
  const slug = (normalizeInternalHref(url) ?? url).replace(/^\//, "");
  const base = slug.replace(/-chat-room$/, "").replace(/-/g, " ");
  return base.replace(/\b\w/g, (c) => c.toUpperCase()) || fromTitle || slug;
}

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic feature links for a page slug (default 3). Same slug always
 * yields the same set; different slugs rotate through the pool.
 */
export function pickExploreFeatureLinks(
  pageSlug: string,
  pool: ExploreFeatureTarget[],
  opts?: { count?: number },
): ExploreFeatureLink[] {
  const count = Math.min(Math.max(opts?.count ?? EXPLORE_FEATURES_COUNT, 0), 6);
  if (count === 0) return [];
  const selfPath = normalizeInternalHref(pageSlug.startsWith("/") ? pageSlug : `/${pageSlug}`);
  const eligible = pool
    .filter(isExploreFeatureTarget)
    .map((t) => {
      const href = normalizeInternalHref(t.url);
      if (!href || href === selfPath) return null;
      return { href, label: featureLinkLabel(t.title, href) };
    })
    .filter((row): row is ExploreFeatureLink => row !== null)
    .sort((a, b) => a.href.localeCompare(b.href));

  if (eligible.length === 0) return [];

  const start = hashSlug(pageSlug) % eligible.length;
  const picked: ExploreFeatureLink[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < eligible.length && picked.length < count; i++) {
    const item = eligible[(start + i) % eligible.length]!;
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    picked.push(item);
  }
  return picked;
}

export function exploreFeatureGraphLinks(
  sources: Array<{ slug: string; canonicalUrl: string }>,
  pool: ExploreFeatureTarget[],
  opts?: { count?: number },
): Array<{ sourceUrl: string; targetUrl: string }> {
  const out: Array<{ sourceUrl: string; targetUrl: string }> = [];
  for (const source of sources) {
    for (const link of pickExploreFeatureLinks(source.slug, pool, opts)) {
      out.push({ sourceUrl: source.canonicalUrl, targetUrl: link.href });
    }
  }
  return out;
}

export async function loadExploreFeatureLinks(
  sb: { from: (table: string) => any },
  pageSlug: string,
  opts?: { count?: number },
): Promise<ExploreFeatureLink[]> {
  const { data, error } = await sb
    .from("internal_link_targets")
    .select("url, title, type, category")
    .eq("is_active", true)
    .limit(2000);
  if (error) throw new Error(error.message);
  return pickExploreFeatureLinks(pageSlug, (data ?? []) as ExploreFeatureTarget[], opts);
}
