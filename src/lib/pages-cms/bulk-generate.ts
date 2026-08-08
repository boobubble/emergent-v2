import { slugifyPageSlug } from "@/lib/page-slug";
import { buildTemplateVars, renderTemplate } from "./template-engine";
import type { CmsPageStatus, CmsPageType, DuplicateHandling, TemplateVars } from "./types";
import { resolveDuplicateSlug } from "./slug-conflicts";

export type BulkLocationInput = {
  countryId: string;
  countryName: string;
  countrySlug: string;
  stateId?: string | null;
  stateName?: string | null;
  stateSlug?: string | null;
  cityId?: string | null;
  cityName?: string | null;
  citySlug?: string | null;
};

export type BulkCategoryInput = {
  id: string;
  name: string;
  slug: string;
};

export type BulkKeywordGroupInput = {
  id: string;
  name: string;
  slug: string;
  primary_pattern: string;
  title_pattern?: string | null;
  meta_title_pattern?: string | null;
  meta_description_pattern?: string | null;
  h1_pattern?: string | null;
  slug_pattern?: string | null;
};

export type BulkTemplateInput = {
  id: string;
  name: string;
  slug: string;
  intro_template?: string | null;
  content_template?: string | null;
  meta_title_template?: string | null;
  meta_description_template?: string | null;
  h1_template?: string | null;
};

export type BulkGenerateConfig = {
  page_type: CmsPageType;
  brand?: string;
  status?: CmsPageStatus;
  locations: BulkLocationInput[];
  category?: BulkCategoryInput | null;
  keywordGroup: BulkKeywordGroupInput;
  template?: BulkTemplateInput | null;
  duplicateHandling?: DuplicateHandling;
  language?: string;
  noindex?: boolean;
  batchSize?: number;
};

export type BulkConflictLabel =
  | "Ready"
  | "Existing Page"
  | "Reserved Route"
  | "Redirect Conflict"
  | "Invalid";

export type BulkPreviewRow = {
  title: string;
  slug: string;
  h1: string | null;
  primary_keyword: string;
  meta_title: string | null;
  meta_description: string | null;
  intro_content: string | null;
  content: string;
  location: {
    country: string;
    state: string | null;
    city: string | null;
  };
  category: string | null;
  country_id: string;
  state_id: string | null;
  city_id: string | null;
  category_id: string | null;
  keyword_group_id: string;
  template_id: string | null;
  page_type: CmsPageType;
  duplicateStatus: "ok" | "skip" | "suffix" | "overwrite_metadata" | "overwrite_template";
  conflictLabel?: BulkConflictLabel;
  conflictSlug?: string;
  existingId?: string;
};

export function conflictLabelFromSources(
  sources: string[],
  duplicateStatus: BulkPreviewRow["duplicateStatus"],
): BulkConflictLabel {
  if (sources.includes("reserved")) return "Reserved Route";
  if (sources.includes("redirect")) return "Redirect Conflict";
  if (sources.includes("custom_page") || duplicateStatus === "skip" || duplicateStatus.startsWith("overwrite")) {
    return "Existing Page";
  }
  if (duplicateStatus === "ok" || duplicateStatus === "suffix") return "Ready";
  return "Invalid";
}

export function buildPrimaryKeyword(pattern: string, vars: TemplateVars): string {
  return renderTemplate(pattern || "{city} chat room", vars).trim();
}

export function buildBulkVars(
  loc: BulkLocationInput,
  category: BulkCategoryInput | null | undefined,
  primaryKeyword: string,
  brand?: string,
): TemplateVars {
  return buildTemplateVars({
    brand: brand ?? "Yaarzo",
    country: loc.countryName,
    state: loc.stateName ?? "",
    city: loc.cityName ?? "",
    category: category?.name ?? "",
    primary_keyword: primaryKeyword,
  });
}

export function previewBulkRow(
  config: BulkGenerateConfig,
  loc: BulkLocationInput,
): Omit<BulkPreviewRow, "duplicateStatus" | "conflictLabel" | "conflictSlug" | "existingId"> {
  const kg = config.keywordGroup;
  const category = config.category ?? null;
  const provisional = buildTemplateVars({
    brand: config.brand ?? "Yaarzo",
    country: loc.countryName,
    state: loc.stateName ?? "",
    city: loc.cityName ?? "",
    category: category?.name ?? "",
    primary_keyword: "",
  });
  const primary = buildPrimaryKeyword(kg.primary_pattern, provisional);
  const vars = buildBulkVars(loc, category, primary, config.brand);
  const tpl = config.template;

  const slugPattern = kg.slug_pattern || "{city}-chat-room";
  const titlePattern = kg.title_pattern || tpl?.meta_title_template || "{primary_keyword} | {brand}";
  const metaTitlePattern = kg.meta_title_pattern || tpl?.meta_title_template || titlePattern;
  const metaDescPattern = kg.meta_description_pattern || tpl?.meta_description_template || "";
  const h1Pattern = kg.h1_pattern || tpl?.h1_template || "{primary_keyword}";

  const slug = slugifyPageSlug(renderTemplate(slugPattern, vars));
  const title = renderTemplate(titlePattern, vars) || primary;
  const h1 = renderTemplate(h1Pattern, vars) || null;
  const meta_title = renderTemplate(metaTitlePattern, vars) || null;
  const meta_description = renderTemplate(metaDescPattern, vars) || null;
  const intro_content = tpl?.intro_template ? renderTemplate(tpl.intro_template, vars) : null;
  const content = tpl?.content_template ? renderTemplate(tpl.content_template, vars) : "";

  return {
    title,
    slug,
    h1,
    primary_keyword: primary,
    meta_title,
    meta_description,
    intro_content,
    content,
    location: {
      country: loc.countryName,
      state: loc.stateName ?? null,
      city: loc.cityName ?? null,
    },
    category: category?.name ?? null,
    country_id: loc.countryId,
    state_id: loc.stateId ?? null,
    city_id: loc.cityId ?? null,
    category_id: category?.id ?? null,
    keyword_group_id: kg.id,
    template_id: tpl?.id ?? null,
    page_type: config.page_type,
  };
}

export function expandBulkPreviews(config: BulkGenerateConfig): Array<Omit<BulkPreviewRow, "duplicateStatus" | "conflictLabel" | "conflictSlug" | "existingId">> {
  return config.locations.map((loc) => previewBulkRow(config, loc));
}

export function resolveBulkDuplicate(
  handling: DuplicateHandling,
  conflicts: { source: string; existingId?: string }[],
  baseSlug: string,
  attempt = 1,
): { action: BulkPreviewRow["duplicateStatus"]; slug: string; existingId?: string } {
  if (!conflicts.length) return { action: "ok", slug: baseSlug };

  const existingId = conflicts.find((c) => c.source === "custom_page")?.existingId;
  if (handling === "skip") return { action: "skip", slug: baseSlug, existingId };
  if (handling === "overwrite_metadata") return { action: "overwrite_metadata", slug: baseSlug, existingId };
  if (handling === "overwrite_template") return { action: "overwrite_template", slug: baseSlug, existingId };

  // suffix
  const next = resolveDuplicateSlug(baseSlug, attempt);
  return { action: "suffix", slug: next, existingId };
}

export const DEFAULT_BULK_BATCH_SIZE = 25;

export function chunkArray<T>(items: T[], size = DEFAULT_BULK_BATCH_SIZE): T[][] {
  const n = Math.max(1, size);
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += n) out.push(items.slice(i, i + n));
  return out;
}
