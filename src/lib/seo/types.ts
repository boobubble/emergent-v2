export type SeoChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export type SeoGlobal = {
  id: number;
  site_name: string | null;
  site_tagline: string | null;
  default_title: string | null;
  default_description: string | null;
  default_keywords: string | null;
  canonical_domain: string | null;
  robots: string | null;
  theme_color: string | null;
  author: string | null;
  language: string | null;
  default_og_image: string | null;
  twitter_card: string | null;
  twitter_site: string | null;
  twitter_creator: string | null;
  facebook_app_id: string | null;
  google_verification: string | null;
  bing_verification: string | null;
  yandex_verification: string | null;
  baidu_verification: string | null;
  updated_at?: string;
  updated_by?: string | null;
};

export type SeoPageRow = {
  page_key: string;
  route_path: string | null;
  label: string | null;
  enabled: boolean;
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  robots: string | null;
  json_ld: Record<string, string | number | boolean | null> | null;
  json_ld_type?: string | null;
  route_type?: string | null;
  template_variables?: string[] | null;
  sitemap_priority: number | null;
  sitemap_changefreq: string | null;
  sitemap_exclude: boolean;
  noindex: boolean;
  nofollow: boolean;
  is_dynamic: boolean;
  auto_discovered: boolean;
  updated_at?: string;
  updated_by?: string | null;
};

export type ResolvedSeo = {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLd: Record<string, string | number | boolean | null> | null;
  noindex: boolean;
  nofollow: boolean;
};

export type SeoRouteDefinition = {
  pageKey: string;
  routePath: string;
  label: string;
  group: string;
  isDynamic?: boolean;
  dynamicPattern?: string;
};

export type SeoHealthIssue =
  | "missing_title"
  | "missing_description"
  | "missing_og_image"
  | "description_too_short"
  | "description_too_long"
  | "missing_keywords"
  | "duplicate_title"
  | "duplicate_description"
  | "missing_canonical"
  | "missing_json_ld";

export type SeoHealthReport = {
  pageKey: string;
  routePath: string;
  label: string;
  issues: SeoHealthIssue[];
};

export type SeoAiField = "title" | "description" | "keywords" | "og" | "json_ld";
