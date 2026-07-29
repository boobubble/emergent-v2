function siteOrigin(global) {
  const domain = global?.canonical_domain?.trim();
  if (!domain) return "https://holo-chat-quest.lovable.app";
  if (domain.startsWith("http")) return domain.replace(/\/$/, "");
  return `https://${domain.replace(/\/$/, "")}`;
}
function applyTemplate(template, vars) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => vars[key] ?? "");
}
function resolvePageSeo(page, global, opts) {
  const origin = siteOrigin(global);
  const routePath = opts?.routePath ?? page?.route_path ?? "/";
  const vars = opts?.vars ?? {};
  const fb = opts?.fallback ?? {};
  const useCustom = page?.enabled === true;
  const pick = (custom, globalVal, fallback) => {
    if (useCustom && custom?.trim()) return applyTemplate(custom.trim(), vars);
    if (globalVal?.trim()) return applyTemplate(globalVal.trim(), vars);
    if (fallback) return applyTemplate(fallback, vars);
    return "";
  };
  const title = pick(page?.title, global?.default_title, fb.title ?? global?.site_name ?? "App");
  const description = pick(page?.description, global?.default_description, fb.description ?? global?.site_tagline ?? "");
  const keywords = pick(page?.keywords, global?.default_keywords, fb.keywords ?? "");
  const ogTitle = pick(page?.og_title, page?.title ?? global?.default_title, fb.ogTitle ?? title);
  const ogDescription = pick(page?.og_description, page?.description ?? global?.default_description, fb.ogDescription ?? description);
  const ogImage = useCustom && page?.og_image?.trim() || global?.default_og_image?.trim() || fb.ogImage || "";
  const twitterTitle = pick(page?.twitter_title, page?.og_title ?? page?.title, fb.twitterTitle ?? ogTitle);
  const twitterDescription = pick(page?.twitter_description, page?.og_description ?? page?.description, fb.twitterDescription ?? ogDescription);
  const twitterImage = useCustom && page?.twitter_image?.trim() || page?.og_image?.trim() || global?.default_og_image?.trim() || fb.twitterImage || ogImage;
  const canonical = useCustom && page?.canonical_url?.trim() || `${origin}${routePath === "/" ? "" : routePath}`;
  const robotsParts = [];
  if (page?.noindex) robotsParts.push("noindex");
  else robotsParts.push("index");
  if (page?.nofollow) robotsParts.push("nofollow");
  else robotsParts.push("follow");
  const robots = page?.robots?.trim() || global?.robots?.trim() || robotsParts.join(", ");
  return {
    title,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage: ogImage.startsWith("http") ? ogImage : ogImage ? `${origin}${ogImage.startsWith("/") ? "" : "/"}${ogImage}` : "",
    ogType: "website",
    twitterCard: page?.twitter_card ?? global?.twitter_card ?? "summary_large_image",
    twitterTitle,
    twitterDescription,
    twitterImage: twitterImage.startsWith("http") ? twitterImage : twitterImage ? `${origin}${twitterImage.startsWith("/") ? "" : "/"}${twitterImage}` : "",
    jsonLd: page?.json_ld ?? fb.jsonLd ?? null,
    noindex: page?.noindex ?? false,
    nofollow: page?.nofollow ?? false
  };
}
const resolveSeo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  applyTemplate,
  resolvePageSeo,
  siteOrigin
}, Symbol.toStringTag, { value: "Module" }));
function buildSitemapXml(entries) {
  const body = entries.map((e) => {
    const parts = [`  <url>`, `    <loc>${escapeXml(e.loc)}</loc>`];
    if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (e.priority != null) parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
    parts.push(`  </url>`);
    return parts.join("\n");
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
function buildRobotsTxt(origin, global, sitemapPath = "/sitemap.xml") {
  const lines = ["User-agent: *", `Allow: /`];
  if (global?.robots?.includes("noindex")) lines.push("Disallow: /");
  lines.push("", `Sitemap: ${origin}${sitemapPath}`);
  return lines.join("\n");
}
function staticSitemapEntries(pages, global) {
  const origin = siteOrigin(global);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return pages.filter((p) => !p.is_dynamic && !p.sitemap_exclude && !p.noindex && p.route_path).map((p) => ({
    loc: `${origin}${p.route_path === "/" ? "" : p.route_path}`,
    lastmod: p.updated_at?.slice(0, 10) ?? today,
    changefreq: p.sitemap_changefreq ?? "weekly",
    priority: p.sitemap_priority ?? 0.5
  }));
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
export {
  buildRobotsTxt as a,
  buildSitemapXml as b,
  resolveSeo as c,
  resolvePageSeo as r,
  staticSitemapEntries as s
};
