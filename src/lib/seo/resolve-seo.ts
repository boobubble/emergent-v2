import type { ResolvedSeo, SeoGlobal, SeoPageRow } from "./types";
import { stripUnresolvedTemplateVars } from "./meta-builder";

export function normalizePublicPath(path: string): string {
  if (!path || path === "/") return "/";
  const trimmed = path.replace(/\?.*$/, "").replace(/#.*$/, "").replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed || "/" : `/${trimmed}`;
}

export function buildCanonicalUrl(
  origin: string,
  path: string,
  override?: string | null,
): string {
  const base = origin.replace(/\/$/, "");
  if (override?.trim()) {
    try {
      const url = new URL(override.trim(), base);
      url.search = "";
      url.hash = "";
      const normalized = url.pathname.replace(/\/+$/, "") || "/";
      return `${url.origin}${normalized === "/" ? "" : normalized}`;
    } catch {
      // fall through to generated canonical
    }
  }
  const normalized = normalizePublicPath(path);
  return `${base}${normalized === "/" ? "" : normalized}`;
}

export type EntitySeoOverride = Partial<{
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robots: string;
  noindex: boolean;
  nofollow: boolean;
  jsonLd: Record<string, string | number | boolean | null> | null;
}>;

export const DEFAULT_SITE_ORIGIN = "https://holo-chat-quest.lovable.app";

export function siteOrigin(global: SeoGlobal | null | undefined): string {
  const domain = global?.canonical_domain?.trim();
  if (!domain) return DEFAULT_SITE_ORIGIN;
  if (domain.startsWith("http")) return domain.replace(/\/$/, "");
  return `https://${domain.replace(/\/$/, "")}`;
}

export function applyTemplate(template: string, vars: Record<string, string>): string {
  const applied = template
    .replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => vars[key] ?? "")
    .replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => vars[key] ?? "");
  return stripUnresolvedTemplateVars(applied);
}

function absolutizeImage(origin: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `${origin}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function pickText(
  entity: string | null | undefined,
  custom: string | null | undefined,
  globalVal: string | null | undefined,
  fallback: string,
  vars: Record<string, string>,
  useCustom: boolean,
  skipGlobal: boolean,
): string {
  if (entity?.trim()) return applyTemplate(entity.trim(), vars);
  if (useCustom && custom?.trim()) return applyTemplate(custom.trim(), vars);
  if (!skipGlobal && globalVal?.trim()) return applyTemplate(globalVal.trim(), vars);
  if (fallback) return applyTemplate(fallback, vars);
  return "";
}

export function resolvePageSeo(
  page: SeoPageRow | null | undefined,
  global: SeoGlobal | null | undefined,
  opts?: {
    routePath?: string;
    vars?: Record<string, string>;
    fallback?: Partial<ResolvedSeo>;
    entityOverride?: EntitySeoOverride | null;
    routeDefaultsOnly?: boolean;
  },
): ResolvedSeo {
  const origin = siteOrigin(global);
  const routePath = opts?.routePath ?? page?.route_path ?? "/";
  const vars = opts?.vars ?? {};
  const fb = opts?.fallback ?? {};
  const entity = opts?.entityOverride ?? null;
  const skipGlobal = opts?.routeDefaultsOnly === true;
  const useCustom = page?.enabled === true;

  const title = pickText(
    entity?.title,
    page?.title,
    global?.default_title,
    fb.title ?? global?.site_name ?? "App",
    vars,
    useCustom,
    skipGlobal,
  );
  const description = pickText(
    entity?.description,
    page?.description,
    global?.default_description,
    fb.description ?? global?.site_tagline ?? "",
    vars,
    useCustom,
    skipGlobal,
  );
  const keywords = pickText(
    entity?.keywords,
    page?.keywords,
    global?.default_keywords,
    fb.keywords ?? "",
    vars,
    useCustom,
    skipGlobal,
  );

  const ogTitle = pickText(
    entity?.ogTitle,
    page?.og_title ?? page?.title,
    page?.title ?? global?.default_title,
    fb.ogTitle ?? title,
    vars,
    useCustom,
    skipGlobal,
  );
  const ogDescription = pickText(
    entity?.ogDescription,
    page?.og_description ?? page?.description,
    page?.description ?? global?.default_description,
    fb.ogDescription ?? description,
    vars,
    useCustom,
    skipGlobal,
  );

  const entityImage = vars.image?.trim() || vars.avatar?.trim() || "";
  let ogImage = "";
  if (entity?.ogImage?.trim()) ogImage = absolutizeImage(origin, entity.ogImage);
  else if (useCustom && page?.og_image?.trim()) ogImage = absolutizeImage(origin, page.og_image);
  else if (entityImage) ogImage = absolutizeImage(origin, entityImage);
  else if (fb.ogImage?.trim()) ogImage = absolutizeImage(origin, fb.ogImage);
  else if (!skipGlobal && global?.default_og_image?.trim()) ogImage = absolutizeImage(origin, global.default_og_image);

  const twitterTitle = pickText(
    entity?.twitterTitle,
    page?.twitter_title ?? page?.og_title ?? page?.title,
    page?.og_title ?? page?.title ?? global?.default_title,
    fb.twitterTitle ?? ogTitle,
    vars,
    useCustom,
    skipGlobal,
  );
  const twitterDescription = pickText(
    entity?.twitterDescription,
    page?.twitter_description ?? page?.og_description ?? page?.description,
    page?.og_description ?? page?.description ?? global?.default_description,
    fb.twitterDescription ?? ogDescription,
    vars,
    useCustom,
    skipGlobal,
  );

  let twitterImage = "";
  if (entity?.twitterImage?.trim()) twitterImage = absolutizeImage(origin, entity.twitterImage);
  else if (useCustom && page?.twitter_image?.trim()) twitterImage = absolutizeImage(origin, page.twitter_image);
  else if (entity?.ogImage?.trim()) twitterImage = absolutizeImage(origin, entity.ogImage);
  else if (useCustom && page?.og_image?.trim()) twitterImage = absolutizeImage(origin, page.og_image);
  else if (entityImage) twitterImage = absolutizeImage(origin, entityImage);
  else if (fb.twitterImage?.trim()) twitterImage = absolutizeImage(origin, fb.twitterImage);
  else twitterImage = ogImage;

  const canonicalOverride = entity?.canonical?.trim()
    || (useCustom ? page?.canonical_url?.trim() : "")
    || fb.canonical?.trim()
    || vars.canonical_url?.trim()
    || null;
  const canonical = buildCanonicalUrl(origin, routePath, canonicalOverride);

  const noindex = entity?.noindex ?? page?.noindex ?? fb.noindex ?? false;
  const nofollow = entity?.nofollow ?? page?.nofollow ?? fb.nofollow ?? false;
  const robots = entity?.robots?.trim()
    || page?.robots?.trim()
    || (skipGlobal ? null : global?.robots?.trim())
    || fb.robots?.trim()
    || `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`;

  const jsonLd = entity?.jsonLd ?? (useCustom && page?.json_ld ? page.json_ld : null) ?? fb.jsonLd ?? null;

  return {
    title,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogType: "website",
    twitterCard: page?.twitter_card ?? global?.twitter_card ?? "summary_large_image",
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLd: jsonLd as Record<string, string | number | boolean | null> | null,
    noindex,
    nofollow,
  };
}

export function resolveDynamicSeo(
  template: SeoPageRow | null | undefined,
  global: SeoGlobal | null | undefined,
  vars: Record<string, string>,
  fallback: Partial<ResolvedSeo>,
  entityOverride?: EntitySeoOverride | null,
): ResolvedSeo {
  return resolvePageSeo(template, global, { vars, fallback, entityOverride });
}

export function safeJsonLd(value: Record<string, unknown> | null | undefined): Record<string, string | number | boolean | null> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  try {
    return JSON.parse(JSON.stringify(value)) as Record<string, string | number | boolean | null>;
  } catch {
    return null;
  }
}
