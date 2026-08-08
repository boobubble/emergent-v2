/**
 * Resolve which SEO source wins for a Custom Page (for Phase 3 editor indicator).
 * Priority:
 * 1. SEO Manager route override (seo_settings for /$slug when enabled with real values)
 * 2. custom_pages local SEO fields
 * 3. page template SEO templates
 * 4. seo_global fallback
 *
 * Does not invent a new SEO storage system.
 */

export type SeoSourceKind =
  | "seo_manager_override"
  | "page_seo"
  | "template"
  | "global";

export type SeoSourceLabel =
  | "SEO Manager Override"
  | "Page SEO"
  | "Template"
  | "Global";

export const SEO_SOURCE_LABELS: Record<SeoSourceKind, SeoSourceLabel> = {
  seo_manager_override: "SEO Manager Override",
  page_seo: "Page SEO",
  template: "Template",
  global: "Global",
};

export type PageSeoFields = {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  h1?: string | null;
};

export type SeoSettingsSnippet = {
  enabled?: boolean | null;
  title?: string | null;
  description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  canonical_path?: string | null;
} | null | undefined;

export type TemplateSeoSnippet = {
  meta_title_template?: string | null;
  meta_description_template?: string | null;
  h1_template?: string | null;
} | null | undefined;

export type GlobalSeoSnippet = {
  default_title?: string | null;
  default_description?: string | null;
  site_name?: string | null;
} | null | undefined;

function hasText(v: string | null | undefined): boolean {
  return Boolean(v && v.trim());
}

export function pageHasLocalSeo(page: PageSeoFields): boolean {
  return (
    hasText(page.meta_title) ||
    hasText(page.meta_description) ||
    hasText(page.og_title) ||
    hasText(page.og_description) ||
    hasText(page.og_image) ||
    hasText(page.canonical_url) ||
    hasText(page.h1)
  );
}

export function seoSettingsHasOverride(settings: SeoSettingsSnippet): boolean {
  if (!settings || settings.enabled !== true) return false;
  return (
    hasText(settings.title) ||
    hasText(settings.description) ||
    hasText(settings.og_title) ||
    hasText(settings.og_description) ||
    hasText(settings.og_image) ||
    hasText(settings.canonical_url) ||
    hasText(settings.canonical_path)
  );
}

export function templateHasSeo(template: TemplateSeoSnippet): boolean {
  if (!template) return false;
  return (
    hasText(template.meta_title_template) ||
    hasText(template.meta_description_template) ||
    hasText(template.h1_template)
  );
}

export function resolveCmsSeoSource(input: {
  page: PageSeoFields;
  seoSettings?: SeoSettingsSnippet;
  template?: TemplateSeoSnippet;
  global?: GlobalSeoSnippet;
}): {
  kind: SeoSourceKind;
  label: SeoSourceLabel;
  priority: SeoSourceKind[];
} {
  const priority: SeoSourceKind[] = [
    "seo_manager_override",
    "page_seo",
    "template",
    "global",
  ];

  if (seoSettingsHasOverride(input.seoSettings)) {
    return { kind: "seo_manager_override", label: SEO_SOURCE_LABELS.seo_manager_override, priority };
  }
  if (pageHasLocalSeo(input.page)) {
    return { kind: "page_seo", label: SEO_SOURCE_LABELS.page_seo, priority };
  }
  if (templateHasSeo(input.template)) {
    return { kind: "template", label: SEO_SOURCE_LABELS.template, priority };
  }
  return { kind: "global", label: SEO_SOURCE_LABELS.global, priority };
}
