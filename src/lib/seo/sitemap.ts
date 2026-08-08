import type { SeoGlobal, SeoPageRow } from "./types";
import { siteOrigin } from "./resolve-seo";

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

/**
 * Normalize timestamps from Supabase REST (ISO strings) or postgres.js (Date)
 * into YYYY-MM-DD for sitemap <lastmod>.
 */
export function formatSitemapLastmod(
  value: string | Date | null | undefined,
  fallback?: string,
): string {
  const today = fallback ?? new Date().toISOString().slice(0, 10);
  if (value == null) return today;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return today;
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (!s) return today;
  // Prefer slicing ISO-like strings; also accept Date-parseable values.
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return s.slice(0, 10);
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`  <url>`, `    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority != null) parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      parts.push(`  </url>`);
      return parts.join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export function buildRobotsTxt(origin: string, global: SeoGlobal | null, sitemapPath = "/sitemap.xml"): string {
  const lines = ["User-agent: *", `Allow: /`];
  if (global?.robots?.includes("noindex")) lines.push("Disallow: /");
  lines.push("", `Sitemap: ${origin}${sitemapPath}`);
  return lines.join("\n");
}

export function staticSitemapEntries(pages: SeoPageRow[], global: SeoGlobal | null): SitemapEntry[] {
  const origin = siteOrigin(global);
  const today = new Date().toISOString().slice(0, 10);
  return pages
    .filter((p) => !p.is_dynamic && !p.sitemap_exclude && !p.noindex && p.route_path)
    .map((p) => ({
      loc: `${origin}${p.route_path === "/" ? "" : p.route_path}`,
      lastmod: formatSitemapLastmod(p.updated_at as string | Date | null | undefined, today),
      changefreq: p.sitemap_changefreq ?? "weekly",
      priority: p.sitemap_priority ?? 0.5,
    }));
}

export type CustomPageSitemapRow = {
  slug: string;
  updated_at?: string | Date | null;
  published_at?: string | Date | null;
  noindex?: boolean | null;
};

/** Published CMS pages at /{custom_pages.slug}; excludes redirect source slugs.
 * lastmod uses custom_pages.updated_at (editorial lastmod). Cache-only refreshes
 * of internal_links_json / internal_link_count / views do not advance updated_at
 * after Phase 4C.1 trigger (custom_pages_set_updated_at).
 */
export function customPageSitemapEntries(
  pages: CustomPageSitemapRow[],
  redirectFromSlugs: Set<string>,
  global: SeoGlobal | null,
): SitemapEntry[] {
  const origin = siteOrigin(global);
  const today = new Date().toISOString().slice(0, 10);
  return pages
    .filter((p) => p.slug && !p.noindex && !redirectFromSlugs.has(p.slug))
    .map((p) => ({
      loc: `${origin}/${p.slug}`,
      lastmod: formatSitemapLastmod(p.updated_at ?? p.published_at, today),
      changefreq: "weekly",
      priority: 0.6,
    }));
}

export function mergeSitemapEntries(...groups: SitemapEntry[][]): SitemapEntry[] {
  const seen = new Set<string>();
  const merged: SitemapEntry[] = [];
  for (const group of groups) {
    for (const entry of group) {
      if (seen.has(entry.loc)) continue;
      seen.add(entry.loc);
      merged.push(entry);
    }
  }
  return merged;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
