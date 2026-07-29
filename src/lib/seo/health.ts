import type { SeoGlobal, SeoHealthIssue, SeoHealthReport, SeoPageRow } from "./types";
import { resolvePageSeo } from "./resolve-seo";

function effectiveTitle(page: SeoPageRow, global: SeoGlobal | null): string {
  return resolvePageSeo(page, global, { routePath: page.route_path ?? "/" }).title;
}

function effectiveDescription(page: SeoPageRow, global: SeoGlobal | null): string {
  return resolvePageSeo(page, global, { routePath: page.route_path ?? "/" }).description;
}

export function auditSeoHealth(pages: SeoPageRow[], global: SeoGlobal | null): SeoHealthReport[] {
  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();

  for (const page of pages) {
    const title = effectiveTitle(page, global).trim().toLowerCase();
    const desc = effectiveDescription(page, global).trim().toLowerCase();
    if (title) titleMap.set(title, [...(titleMap.get(title) ?? []), page.page_key]);
    if (desc) descMap.set(desc, [...(descMap.get(desc) ?? []), page.page_key]);
  }

  return pages.map((page) => {
    const issues: SeoHealthIssue[] = [];
    const resolved = resolvePageSeo(page, global, { routePath: page.route_path ?? "/" });
    const title = resolved.title.trim();
    const desc = resolved.description.trim();

    if (!title) issues.push("missing_title");
    if (!desc) issues.push("missing_description");
    if (!resolved.ogImage) issues.push("missing_og_image");
    if (desc && desc.length < 50) issues.push("description_too_short");
    if (desc && desc.length > 160) issues.push("description_too_long");
    if (!resolved.keywords.trim()) issues.push("missing_keywords");
    if (!resolved.canonical) issues.push("missing_canonical");
    if (!resolved.jsonLd && page.enabled && !page.is_dynamic) issues.push("missing_json_ld");

    const titleKey = title.toLowerCase();
    const descKey = desc.toLowerCase();
    if (titleKey && (titleMap.get(titleKey)?.length ?? 0) > 1) issues.push("duplicate_title");
    if (descKey && (descMap.get(descKey)?.length ?? 0) > 1) issues.push("duplicate_description");

    return {
      pageKey: page.page_key,
      routePath: page.route_path ?? `/${page.page_key}`,
      label: page.label ?? page.page_key,
      issues,
    };
  });
}

export const SEO_HEALTH_LABELS: Record<SeoHealthIssue, string> = {
  missing_title: "Missing Title",
  missing_description: "Missing Description",
  missing_og_image: "Missing OG Image",
  description_too_short: "Description Too Short",
  description_too_long: "Description Too Long",
  missing_keywords: "Missing Keywords",
  duplicate_title: "Duplicate Title",
  duplicate_description: "Duplicate Description",
  missing_canonical: "Missing Canonical",
  missing_json_ld: "Missing JSON-LD",
};
