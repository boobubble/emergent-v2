import type { ResolvedSeo, SeoGlobal, SeoPageRow } from "./types";

export function siteOrigin(global: SeoGlobal | null | undefined): string {
  const domain = global?.canonical_domain?.trim();
  if (!domain) return "https://holo-chat-quest.lovable.app";
  if (domain.startsWith("http")) return domain.replace(/\/$/, "");
  return `https://${domain.replace(/\/$/, "")}`;
}

export function applyTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function resolvePageSeo(
  page: SeoPageRow | null | undefined,
  global: SeoGlobal | null | undefined,
  opts?: {
    routePath?: string;
    vars?: Record<string, string>;
    fallback?: Partial<ResolvedSeo>;
  },
): ResolvedSeo {
  const origin = siteOrigin(global);
  const routePath = opts?.routePath ?? page?.route_path ?? "/";
  const vars = opts?.vars ?? {};
  const fb = opts?.fallback ?? {};

  const useCustom = page?.enabled === true;
  const pick = (custom: string | null | undefined, globalVal: string | null | undefined, fallback: string) => {
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
  const ogImage = (useCustom && page?.og_image?.trim()) || global?.default_og_image?.trim() || fb.ogImage || "";
  const twitterTitle = pick(page?.twitter_title, page?.og_title ?? page?.title, fb.twitterTitle ?? ogTitle);
  const twitterDescription = pick(page?.twitter_description, page?.og_description ?? page?.description, fb.twitterDescription ?? ogDescription);
  const twitterImage = (useCustom && page?.twitter_image?.trim()) || page?.og_image?.trim() || global?.default_og_image?.trim() || fb.twitterImage || ogImage;

  const canonical = (useCustom && page?.canonical_url?.trim())
    || fb.canonical?.trim()
    || `${origin}${routePath === "/" ? "" : routePath}`;
  const robotsParts: string[] = [];
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
    jsonLd: (page?.json_ld ?? fb.jsonLd ?? null) as Record<string, string | number | boolean | null> | null,
    noindex: page?.noindex ?? false,
    nofollow: page?.nofollow ?? false,
  };
}

export function resolveDynamicSeo(
  template: SeoPageRow | null | undefined,
  global: SeoGlobal | null | undefined,
  vars: Record<string, string>,
  fallback: Partial<ResolvedSeo>,
): ResolvedSeo {
  return resolvePageSeo(template, global, { vars, fallback });
}
