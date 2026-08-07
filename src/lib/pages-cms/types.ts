export type CmsPageType =
  | "static"
  | "country"
  | "state"
  | "city"
  | "category"
  | "country_category"
  | "state_category"
  | "city_category"
  | "keyword"
  | "custom_seo"
  | "hub";

export type CmsPageStatus = "draft" | "scheduled" | "published" | "archived";
export type CmsContentStatus = "empty" | "partial" | "complete";
export type DuplicateHandling = "skip" | "overwrite_metadata" | "overwrite_template" | "suffix";

export type TemplateVars = {
  brand: string;
  country: string;
  state: string;
  city: string;
  category: string;
  primary_keyword: string;
  year: string;
  [key: string]: string;
};

export const CMS_PAGE_TYPES: { value: CmsPageType; label: string }[] = [
  { value: "static", label: "Static Page" },
  { value: "country", label: "Country" },
  { value: "city", label: "City" },
  { value: "category", label: "Category" },
  { value: "custom_seo", label: "Custom SEO" },
  { value: "hub", label: "Hub Page" },
];
