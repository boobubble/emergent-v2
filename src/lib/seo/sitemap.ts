import type { SeoGlobal, SeoPageRow } from "./types";
import { siteOrigin } from "./resolve-seo";

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

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
      lastmod: p.updated_at?.slice(0, 10) ?? today,
      changefreq: p.sitemap_changefreq ?? "weekly",
      priority: p.sitemap_priority ?? 0.5,
    }));
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
