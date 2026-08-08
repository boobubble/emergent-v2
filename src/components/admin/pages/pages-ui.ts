/** Shared Pages CMS UI helpers (Phase 3). */

export const DEFAULT_SAVED_VIEWS = [
  { name: "Pakistan Pages", filter: { search: "pakistan" } },
  { name: "India Pages", filter: { search: "india" } },
  { name: "City Pages", filter: { page_type: "city" } },
  { name: "Girls Chat Pages", filter: { search: "girls chat" } },
  { name: "Missing Content", filter: { content_status: "empty" } },
  { name: "SEO Problems", filter: { missing_h1: true } },
  { name: "Noindex Pages", filter: { noindex: true } },
] as const;

export function contentStatusLabel(v: string | null | undefined): string {
  if (!v) return "—";
  if (v === "empty") return "Empty";
  if (v === "partial") return "Partial";
  if (v === "complete") return "Complete";
  return v;
}

export function indexStatusLabel(noindex: boolean | null | undefined): string {
  return noindex ? "Noindex" : "Index";
}

export function formatUpdated(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export const TEMPLATE_SAMPLE = {
  brand: "Yaarzo",
  country: "Pakistan",
  state: "Punjab",
  city: "Lahore",
  category: "Chat Rooms",
  primary_keyword: "lahore chat room",
  year: String(new Date().getFullYear()),
} as const;

export const TEMPLATE_VARIABLES = [
  "{brand}",
  "{country}",
  "{state}",
  "{city}",
  "{category}",
  "{primary_keyword}",
  "{year}",
] as const;

export const KEYWORD_VARIABLES = [
  "{city}",
  "{state}",
  "{country}",
  "{category}",
  "{brand}",
  "{year}",
] as const;

export const PAGE_TYPE_OPTIONS = [
  { value: "static", label: "Static" },
  { value: "country", label: "Country" },
  { value: "state", label: "State" },
  { value: "city", label: "City" },
  { value: "category", label: "Category" },
  { value: "country_category", label: "Country + Category" },
  { value: "state_category", label: "State + Category" },
  { value: "city_category", label: "City + Category" },
  { value: "keyword", label: "Keyword" },
  { value: "hub", label: "Hub" },
  { value: "custom_seo", label: "Custom SEO" },
] as const;

export const CMS_EXPORT_FIELDS = [
  "slug", "title", "content", "excerpt", "tags", "status", "featured",
  "layout", "sidebar_left", "sidebar_right",
  "meta_title", "meta_description", "meta_keywords",
  "og_title", "og_description", "og_image", "canonical_url",
  "noindex", "nofollow",
  "page_type", "h1", "primary_keyword", "secondary_keywords", "language",
  "intro_content", "country", "state", "city", "category", "template",
  "country_id", "state_id", "city_id", "category_id", "template_id",
] as const;
