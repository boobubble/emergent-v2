import type { SeoGlobal, SeoPageRow } from "./types";
import { normalizeRoutePath } from "./inventory-categories";

export type SeoEditTarget = "global" | "route";

export type SeoRouteEditMode = "global" | "static" | "template" | "cms" | "private";

export type SeoValueSource = "custom" | "dynamic" | "route_code" | "global_default" | "missing";

export type SeoEditFormValues = {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  index: boolean;
  follow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLdType: string;
  customJsonLd: string;
  sitemapEnabled: boolean;
  sitemapPriority: string;
  sitemapChangeFreq: string;
};

/** Routes that should default to noindex when first configured. */
export const PRIVATE_AUTH_ROUTE_PATHS = [
  "/account",
  "/login",
  "/messages",
  "/notifications",
  "/reset-password",
  "/signup",
  "/wallet",
] as const;

export const CMS_TEMPLATE_ROUTE_PATH = "/$slug";

const COMMON_TEMPLATE_VARS = ["site_name", "title", "name", "slug", "description"] as const;

const TEMPLATE_VARS_BY_ROUTE: Record<string, readonly string[]> = {
  "/$slug": [...COMMON_TEMPLATE_VARS, "author_name"],
  "/community/$slug": [...COMMON_TEMPLATE_VARS, "community_name", "category", "country"],
  "/competitions/$slug": [...COMMON_TEMPLATE_VARS, "competition_name", "country"],
  "/feed/$slug": [...COMMON_TEMPLATE_VARS, "author_name"],
  "/games/$slug": [...COMMON_TEMPLATE_VARS, "game_name"],
  "/poetry/$slug": [...COMMON_TEMPLATE_VARS, "poetry_title", "author_name"],
  "/u/$username": ["site_name", "title", "username", "name", "description", "country"],
};

const TEMPLATE_VAR_PATTERN = /\{\{([a-z_][a-z0-9_]*)\}\}/gi;

export function emptySeoEditForm(): SeoEditFormValues {
  return {
    title: "",
    description: "",
    keywords: "",
    canonicalUrl: "",
    index: true,
    follow: true,
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    jsonLdType: "",
    customJsonLd: "",
    sitemapEnabled: true,
    sitemapPriority: "0.5",
    sitemapChangeFreq: "weekly",
  };
}

export function isPrivateAuthRoute(routePath: string): boolean {
  return (PRIVATE_AUTH_ROUTE_PATHS as readonly string[]).includes(normalizeRoutePath(routePath));
}

export function isCmsTemplateRoute(routePath: string): boolean {
  return normalizeRoutePath(routePath) === CMS_TEMPLATE_ROUTE_PATH;
}

export function getRouteEditMode(routePath: string, isDynamic: boolean): SeoRouteEditMode {
  const path = normalizeRoutePath(routePath);
  if (path === "__global__") return "global";
  if (isCmsTemplateRoute(path)) return "cms";
  if (isPrivateAuthRoute(path)) return "private";
  if (isDynamic) return "template";
  return "static";
}

export function getTemplateVariablesForRoute(routePath: string): string[] {
  const path = normalizeRoutePath(routePath);
  const specific = TEMPLATE_VARS_BY_ROUTE[path];
  if (specific) return [...specific];
  if (path.includes("$")) return [...COMMON_TEMPLATE_VARS];
  return [];
}

export function getEditActionLabel(row: {
  id: string;
  routePath: string;
  isDynamic: boolean;
  editMode?: SeoRouteEditMode;
}): string {
  if (row.id === "__global__") return "Edit";
  const mode = row.editMode ?? getRouteEditMode(row.routePath, row.isDynamic);
  if (mode === "template" || mode === "cms") return "Edit Template";
  return "Edit";
}

export function isSeoEditableRow(_row: { id: string; routePath: string }): boolean {
  return true;
}

export function privateRouteDefaultForm(): Partial<SeoEditFormValues> {
  return {
    index: false,
    follow: false,
    sitemapEnabled: false,
  };
}

export const PRIVATE_ROUTE_WARNING =
  "This is a private or authentication route. Indexing it is usually not recommended.";

export function parseRobotsFlags(robots?: string | null): { index: boolean; follow: boolean } {
  const value = (robots ?? "index,follow").toLowerCase();
  return {
    index: !value.includes("noindex"),
    follow: !value.includes("nofollow"),
  };
}

export function buildRobotsValue(index: boolean, follow: boolean): string {
  return `${index ? "index" : "noindex"}, ${follow ? "follow" : "nofollow"}`;
}

export function sanitizeSeoText(value: string, maxLen: number): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

export function extractTemplateVariables(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(TEMPLATE_VAR_PATTERN)) {
    found.add(match[1].toLowerCase());
  }
  return [...found];
}

export function validateTemplateFields(
  values: SeoEditFormValues,
  allowedVars: string[],
): string[] {
  const allowed = new Set(allowedVars.map((v) => v.toLowerCase()));
  const errors: string[] = [];
  const fields: Array<[string, string]> = [
    ["title", values.title],
    ["description", values.description],
    ["ogTitle", values.ogTitle],
    ["ogDescription", values.ogDescription],
    ["twitterTitle", values.twitterTitle],
    ["twitterDescription", values.twitterDescription],
    ["canonicalUrl", values.canonicalUrl],
  ];

  for (const [field, text] of fields) {
    for (const variable of extractTemplateVariables(text)) {
      if (!allowed.has(variable)) {
        errors.push(`Unknown template variable {{${variable}}} in ${field}.`);
      }
    }
  }
  return errors;
}

export function parseCustomJsonLd(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = JSON.parse(trimmed) as unknown;
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON-LD must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function globalToEditForm(global: SeoGlobal | null): SeoEditFormValues {
  const { index, follow } = parseRobotsFlags(global?.robots);
  const title = global?.default_title ?? "";
  const description = global?.default_description ?? "";
  const ogImage = global?.default_og_image ?? "";
  let canonicalUrl = global?.canonical_domain?.trim() ?? "";
  if (canonicalUrl && !canonicalUrl.startsWith("http")) {
    canonicalUrl = `https://${canonicalUrl.replace(/^\/+/, "")}`;
  }
  return {
    title,
    description,
    keywords: global?.default_keywords ?? "",
    canonicalUrl,
    index,
    follow,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    jsonLdType: "",
    customJsonLd: "",
    sitemapEnabled: true,
    sitemapPriority: "0.5",
    sitemapChangeFreq: "weekly",
  };
}

export function pageToEditForm(
  page: SeoPageRow | null | undefined,
  opts?: { isPrivateDefault?: boolean },
): SeoEditFormValues {
  if (!page) {
    const base = emptySeoEditForm();
    if (opts?.isPrivateDefault) {
      return { ...base, ...privateRouteDefaultForm() };
    }
    return base;
  }
  const title = page.title ?? "";
  const description = page.description ?? "";
  const ogImage = page.og_image ?? "";
  const jsonLdType = page.json_ld_type ?? (typeof page.json_ld?.["@type"] === "string" ? page.json_ld["@type"] : "");
  let customJsonLd = "";
  if (page.json_ld) {
    const copy = { ...page.json_ld };
    delete copy["@type"];
    if (Object.keys(copy).length) customJsonLd = JSON.stringify(copy, null, 2);
  }
  return {
    title,
    description,
    keywords: page.keywords ?? "",
    canonicalUrl: page.canonical_url ?? "",
    index: !page.noindex,
    follow: !page.nofollow,
    ogTitle: page.og_title ?? title,
    ogDescription: page.og_description ?? description,
    ogImage,
    twitterTitle: page.twitter_title ?? page.og_title ?? title,
    twitterDescription: page.twitter_description ?? page.og_description ?? description,
    twitterImage: page.twitter_image ?? ogImage,
    jsonLdType,
    customJsonLd,
    sitemapEnabled: !page.sitemap_exclude,
    sitemapPriority: page.sitemap_priority != null ? String(page.sitemap_priority) : "0.5",
    sitemapChangeFreq: page.sitemap_changefreq ?? "weekly",
  };
}

export type SeoEditValidation = {
  fieldErrors: Partial<Record<keyof SeoEditFormValues, string>>;
  warnings: string[];
};

export function validateSeoEditForm(
  values: SeoEditFormValues,
  opts?: { isTemplate?: boolean; templateVariables?: string[] },
): SeoEditValidation {
  const fieldErrors: Partial<Record<keyof SeoEditFormValues, string>> = {};
  const warnings: string[] = [];

  if (values.title.length > 60) {
    warnings.push("SEO title is longer than the recommended 60 characters.");
  }
  if (values.description.length > 160) {
    warnings.push("Meta description is longer than the recommended 160 characters.");
  }

  const canonical = values.canonicalUrl.trim();
  if (canonical && !canonical.includes("{{")) {
    try {
      const url = new URL(canonical);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        fieldErrors.canonicalUrl = "Canonical must use http:// or https://";
      }
    } catch {
      fieldErrors.canonicalUrl = "Canonical must be a valid absolute URL";
    }
  }

  const priority = Number(values.sitemapPriority);
  if (Number.isNaN(priority) || priority < 0 || priority > 1) {
    fieldErrors.sitemapPriority = "Sitemap priority must be between 0.0 and 1.0";
  }

  if (values.customJsonLd.trim()) {
    try {
      parseCustomJsonLd(values.customJsonLd);
    } catch (err) {
      fieldErrors.customJsonLd = err instanceof Error ? err.message : "Invalid JSON-LD JSON";
    }
  }

  if (opts?.isTemplate && opts.templateVariables?.length) {
    for (const msg of validateTemplateFields(values, opts.templateVariables)) {
      if (!fieldErrors.title) fieldErrors.title = msg;
      else warnings.push(msg);
    }
  }

  return { fieldErrors, warnings };
}

export function editFormToGlobalPatch(values: SeoEditFormValues): Partial<SeoGlobal> {
  const canonical = sanitizeSeoText(values.canonicalUrl, 500);
  let canonical_domain: string | null = canonical || null;
  if (canonical) {
    try {
      const url = new URL(canonical);
      canonical_domain = url.origin;
    } catch {
      canonical_domain = canonical;
    }
  }

  const image = sanitizeSeoText(values.ogImage, 500) || sanitizeSeoText(values.twitterImage, 500) || null;

  return {
    default_title: sanitizeSeoText(values.title, 120) || null,
    default_description: sanitizeSeoText(values.description, 500) || null,
    default_keywords: sanitizeSeoText(values.keywords, 500) || null,
    canonical_domain,
    robots: buildRobotsValue(values.index, values.follow),
    default_og_image: image,
  };
}

export function buildPageJsonLd(values: SeoEditFormValues): Record<string, string | number | boolean | null> | null {
  const jsonLdType = sanitizeSeoText(values.jsonLdType, 80);
  const customRaw = values.customJsonLd.trim();
  if (!jsonLdType && !customRaw) return null;

  let base: Record<string, string | number | boolean | null> = {};
  if (customRaw) {
    const parsed = parseCustomJsonLd(customRaw);
    base = parsed as Record<string, string | number | boolean | null>;
  }
  if (jsonLdType) {
    base["@type"] = jsonLdType;
  }
  return Object.keys(base).length ? base : null;
}

export function editFormToPagePatch(
  values: SeoEditFormValues,
  base: Partial<SeoPageRow>,
  opts?: { isTemplate?: boolean; routeType?: string; templateVariables?: string[] },
): Partial<SeoPageRow> {
  const priority = Number(values.sitemapPriority);
  const routeType = opts?.routeType ?? (opts?.isTemplate ? "dynamic" : "static");

  return {
    ...base,
    enabled: true,
    route_type: routeType,
    title: sanitizeSeoText(values.title, 120) || null,
    description: sanitizeSeoText(values.description, 500) || null,
    keywords: sanitizeSeoText(values.keywords, 500) || null,
    canonical_url: sanitizeSeoText(values.canonicalUrl, 500) || null,
    noindex: !values.index,
    nofollow: !values.follow,
    robots: buildRobotsValue(values.index, values.follow),
    og_title: sanitizeSeoText(values.ogTitle, 120) || null,
    og_description: sanitizeSeoText(values.ogDescription, 500) || null,
    og_image: sanitizeSeoText(values.ogImage, 500) || null,
    twitter_title: sanitizeSeoText(values.twitterTitle, 120) || null,
    twitter_description: sanitizeSeoText(values.twitterDescription, 500) || null,
    twitter_image: sanitizeSeoText(values.twitterImage, 500) || null,
    json_ld_type: sanitizeSeoText(values.jsonLdType, 80) || null,
    json_ld: buildPageJsonLd(values),
    sitemap_exclude: !values.sitemapEnabled,
    sitemap_priority: Number.isFinite(priority) ? priority : 0.5,
    sitemap_changefreq: sanitizeSeoText(values.sitemapChangeFreq, 20) || "weekly",
    is_dynamic: !!opts?.isTemplate,
    template_variables: opts?.templateVariables ?? null,
  };
}

export function formHasCustomValues(values: SeoEditFormValues): boolean {
  return Boolean(
    values.title.trim()
    || values.description.trim()
    || values.keywords.trim()
    || values.canonicalUrl.trim()
    || values.ogTitle.trim()
    || values.ogDescription.trim()
    || values.ogImage.trim()
    || values.twitterTitle.trim()
    || values.twitterDescription.trim()
    || values.twitterImage.trim()
    || values.jsonLdType.trim()
    || values.customJsonLd.trim()
    || !values.index
    || !values.follow
    || !values.sitemapEnabled,
  );
}
