import { slugifyPageSlug } from "@/lib/page-slug";
import {
  buildTemplateVars,
  renderTemplate,
  renderCtaTemplate,
  renderFaqTemplate,
} from "./template-engine";
import type { CmsPageStatus, CmsPageType, DuplicateHandling, TemplateVars } from "./types";
import { resolveDuplicateSlug } from "./slug-conflicts";
import {
  buildAmbiguousCityIndex,
  resolveCityPageSlug,
  type AmbiguousCityIndex,
  type CityCountryRef,
} from "./city-slug-policy";
import { buildCityPageContextVars, type NearbyCityRef } from "./city-page-context";

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

export type BulkCtaContent = {
  label?: string;
  href?: string;
  text?: string;
  [key: string]: string | undefined;
};

export type BulkFaqItem = { q: string; a: string };

export type BulkTemplateInput = {
  id: string;
  name: string;
  slug: string;
  intro_template?: string | null;
  content_template?: string | null;
  meta_title_template?: string | null;
  meta_description_template?: string | null;
  h1_template?: string | null;
  cta_template?: BulkCtaContent | Record<string, string> | null;
  faq_template?: BulkFaqItem[] | null;
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
  /**
   * Precomputed index of city names/slugs that exist in 2+ countries.
   * When omitted, derived from `cityCatalog` or `locations`.
   */
  ambiguousCities?: AmbiguousCityIndex;
  /** Full city catalog for ambiguity + nearby/related blocks */
  cityCatalog?: NearbyCityRef[];
  /** Optional per-citySlug content overrides */
  contentOverridesByCitySlug?: Record<
    string,
    {
      intro?: string | null;
      location?: string | null;
      nearby?: string | null;
      country_context?: string | null;
      how_it_works?: string | null;
    }
  >;
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
  cta_content: BulkCtaContent | null;
  faq_content: BulkFaqItem[] | null;
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
  slug_disambiguated?: boolean;
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

export function resolveAmbiguityIndex(config: BulkGenerateConfig): AmbiguousCityIndex {
  if (config.ambiguousCities) return config.ambiguousCities;
  const refs: CityCountryRef[] = [];
  if (config.cityCatalog?.length) {
    for (const c of config.cityCatalog) {
      refs.push({ name: c.name, slug: c.slug, countrySlug: c.countrySlug });
    }
  } else {
    for (const loc of config.locations) {
      if (!loc.citySlug || !loc.cityName) continue;
      refs.push({
        name: loc.cityName,
        slug: loc.citySlug,
        countrySlug: loc.countrySlug,
      });
    }
  }
  return buildAmbiguousCityIndex(refs);
}

export function buildBulkVars(
  loc: BulkLocationInput,
  category: BulkCategoryInput | null | undefined,
  primaryKeyword: string,
  brand?: string,
  extra?: Record<string, string>,
): TemplateVars {
  return buildTemplateVars({
    brand: brand ?? "Yaarzo",
    country: loc.countryName,
    state: loc.stateName ?? "",
    city: loc.cityName ?? "",
    category: category?.name ?? "",
    primary_keyword: primaryKeyword,
    country_slug: loc.countrySlug ?? "",
    state_slug: loc.stateSlug ?? "",
    city_slug: loc.citySlug ?? "",
    ...(extra ?? {}),
  });
}

export function previewBulkRow(
  config: BulkGenerateConfig,
  loc: BulkLocationInput,
): Omit<BulkPreviewRow, "duplicateStatus" | "conflictLabel" | "conflictSlug" | "existingId"> {
  const kg = config.keywordGroup;
  const category = config.category ?? null;
  const ambiguity = resolveAmbiguityIndex(config);

  const contextExtra =
    config.page_type === "city" && loc.cityName && loc.citySlug
      ? buildCityPageContextVars({
          cityName: loc.cityName,
          citySlug: loc.citySlug,
          stateName: loc.stateName,
          stateSlug: loc.stateSlug,
          countryName: loc.countryName,
          countrySlug: loc.countrySlug,
          brand: config.brand,
          language: config.language ?? "en",
          catalog: config.cityCatalog ?? config.locations
            .filter((l) => l.citySlug && l.cityName)
            .map((l) => ({
              name: l.cityName!,
              slug: l.citySlug!,
              stateSlug: l.stateSlug,
              countrySlug: l.countrySlug,
            })),
          overrides: loc.citySlug
            ? config.contentOverridesByCitySlug?.[loc.citySlug] ?? null
            : null,
        })
      : {
          country_slug: loc.countrySlug ?? "",
          state_slug: loc.stateSlug ?? "",
          city_slug: loc.citySlug ?? "",
          language: config.language ?? "en",
          language_note: "",
          nearby_cities: "",
          nearby_cities_html: "",
          country_hub_label: loc.countryName ? `${loc.countryName} chat room` : "",
          region_label: loc.countryName,
          country_context: "",
          location_context: "",
        };

  const provisional = buildTemplateVars({
    brand: config.brand ?? "Yaarzo",
    country: loc.countryName,
    state: loc.stateName ?? "",
    city: loc.cityName ?? "",
    category: category?.name ?? "",
    primary_keyword: "",
    ...contextExtra,
  });
  const primary = buildPrimaryKeyword(kg.primary_pattern, provisional);
  const vars = buildBulkVars(loc, category, primary, config.brand, contextExtra);
  const tpl = config.template;

  const slugPattern = kg.slug_pattern || "{city}-chat-room";
  const titlePattern = kg.title_pattern || tpl?.meta_title_template || "{primary_keyword} | {brand}";
  const metaTitlePattern = kg.meta_title_pattern || tpl?.meta_title_template || titlePattern;
  const metaDescPattern = kg.meta_description_pattern || tpl?.meta_description_template || "";
  const h1Pattern = kg.h1_pattern || tpl?.h1_template || "{primary_keyword}";

  let renderedSlug = slugifyPageSlug(renderTemplate(slugPattern, vars));
  let slugDisambiguated = false;
  if (config.page_type === "city" && loc.citySlug && loc.cityName) {
    const resolved = resolveCityPageSlug({
      cityName: loc.cityName,
      citySlug: loc.citySlug,
      countrySlug: loc.countrySlug,
      renderedSlug,
      ambiguity,
    });
    renderedSlug = resolved.slug;
    slugDisambiguated = resolved.disambiguated;
  }

  const title = renderTemplate(titlePattern, vars) || primary;
  const h1 = renderTemplate(h1Pattern, vars) || null;
  const meta_title = renderTemplate(metaTitlePattern, vars) || null;
  const meta_description = renderTemplate(metaDescPattern, vars) || null;
  let intro_content = tpl?.intro_template ? renderTemplate(tpl.intro_template, vars) : null;
  if (config.contentOverridesByCitySlug?.[loc.citySlug ?? ""]?.intro) {
    intro_content = config.contentOverridesByCitySlug[loc.citySlug!].intro!;
  }
  const content = tpl?.content_template ? renderTemplate(tpl.content_template, vars) : "";
  const cta_content = renderCtaTemplate(tpl?.cta_template, vars);
  const faq_content = renderFaqTemplate(tpl?.faq_template, vars);

  return {
    title,
    slug: renderedSlug,
    h1,
    primary_keyword: primary,
    meta_title,
    meta_description,
    intro_content,
    content,
    cta_content,
    faq_content,
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
    slug_disambiguated: slugDisambiguated,
  };
}

export function expandBulkPreviews(config: BulkGenerateConfig): Array<Omit<BulkPreviewRow, "duplicateStatus" | "conflictLabel" | "conflictSlug" | "existingId">> {
  // Ensure ambiguity is computed once against full catalog/locations
  const withIndex: BulkGenerateConfig = {
    ...config,
    ambiguousCities: resolveAmbiguityIndex(config),
  };
  return withIndex.locations.map((loc) => previewBulkRow(withIndex, loc));
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

export { buildAmbiguousCityIndex, resolveCityPageSlug } from "./city-slug-policy";
export { buildCityPageContextVars, extractContentBlocks, selectRelatedCities } from "./city-page-context";
