import type { AutomationSettings } from "@/lib/content-automation/db";

export const SEO_ENGINE_DEFAULTS = {
  blog_posts_per_day: 2,
  static_pages_per_day: 3,
  daily_total_limit: 5,
  automation_enabled: true,
  auto_seo_optimization: true,
  auto_internal_linking: true,
  two_way_linking: true,
  cannibalization_check: true,
  broken_link_check: true,
  new_page_discovery: true,
  content_refresh_enabled: true,
  refresh_interval_days: 15,
  refresh_type: "intelligent",
  auto_update_published: true,
  only_update_when_meaningful: true,
  minimum_content_change_percent: 10,
  keep_previous_versions: true,
  max_versions: 10,
  pexels_images_enabled: true,
  images_per_content: 1,
  prefer_landscape_images: true,
  image_optimization: true,
  image_duplicate_prevention: true,
  dry_run_optimization: false,
  migration_paused: false,
} as const;

export type SeoEngineSettings = AutomationSettings;

export function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

export function asInt(value: unknown, fallback: number, min = 0, max = 10_000): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function normalizeAutomationSettings(row: Partial<AutomationSettings> | null | undefined): AutomationSettings {
  const src = row ?? {};
  return {
    id: 1,
    blog_posts_per_day: asInt(src.blog_posts_per_day, SEO_ENGINE_DEFAULTS.blog_posts_per_day, 0, 20),
    static_pages_per_day: asInt(src.static_pages_per_day, SEO_ENGINE_DEFAULTS.static_pages_per_day, 0, 50),
    daily_total_limit: asInt(src.daily_total_limit, SEO_ENGINE_DEFAULTS.daily_total_limit, 0, 20),
    automation_enabled: asBool(src.automation_enabled, SEO_ENGINE_DEFAULTS.automation_enabled),
    auto_seo_optimization: asBool(src.auto_seo_optimization, SEO_ENGINE_DEFAULTS.auto_seo_optimization),
    auto_internal_linking: asBool(src.auto_internal_linking, SEO_ENGINE_DEFAULTS.auto_internal_linking),
    two_way_linking: asBool(src.two_way_linking, SEO_ENGINE_DEFAULTS.two_way_linking),
    cannibalization_check: asBool(src.cannibalization_check, SEO_ENGINE_DEFAULTS.cannibalization_check),
    broken_link_check: asBool(src.broken_link_check, SEO_ENGINE_DEFAULTS.broken_link_check),
    new_page_discovery: asBool(src.new_page_discovery, SEO_ENGINE_DEFAULTS.new_page_discovery),
    content_refresh_enabled: asBool(src.content_refresh_enabled, SEO_ENGINE_DEFAULTS.content_refresh_enabled),
    refresh_interval_days: asInt(src.refresh_interval_days, SEO_ENGINE_DEFAULTS.refresh_interval_days, 1, 365),
    refresh_type: typeof src.refresh_type === "string" && src.refresh_type.trim()
      ? src.refresh_type
      : SEO_ENGINE_DEFAULTS.refresh_type,
    auto_update_published: asBool(src.auto_update_published, SEO_ENGINE_DEFAULTS.auto_update_published),
    only_update_when_meaningful: asBool(src.only_update_when_meaningful, SEO_ENGINE_DEFAULTS.only_update_when_meaningful),
    minimum_content_change_percent: asInt(
      src.minimum_content_change_percent,
      SEO_ENGINE_DEFAULTS.minimum_content_change_percent,
      0,
      100,
    ),
    keep_previous_versions: asBool(src.keep_previous_versions, SEO_ENGINE_DEFAULTS.keep_previous_versions),
    max_versions: asInt(src.max_versions, SEO_ENGINE_DEFAULTS.max_versions, 1, 50),
    pexels_images_enabled: asBool(src.pexels_images_enabled, SEO_ENGINE_DEFAULTS.pexels_images_enabled),
    images_per_content: asInt(src.images_per_content, SEO_ENGINE_DEFAULTS.images_per_content, 0, 3),
    prefer_landscape_images: asBool(src.prefer_landscape_images, SEO_ENGINE_DEFAULTS.prefer_landscape_images),
    image_optimization: asBool(src.image_optimization, SEO_ENGINE_DEFAULTS.image_optimization),
    image_duplicate_prevention: asBool(src.image_duplicate_prevention, SEO_ENGINE_DEFAULTS.image_duplicate_prevention),
    dry_run_optimization: asBool(src.dry_run_optimization, SEO_ENGINE_DEFAULTS.dry_run_optimization),
    migration_paused: asBool(src.migration_paused, SEO_ENGINE_DEFAULTS.migration_paused),
    updated_at: src.updated_at ?? null,
  };
}

export function remainingDailySlots(input: {
  blogLimit: number;
  pageLimit: number;
  totalLimit: number;
  blogsUsed: number;
  pagesUsed: number;
}): { blogs: number; pages: number; totalRemaining: number } {
  const blogsUsed = Math.max(0, input.blogsUsed);
  const pagesUsed = Math.max(0, input.pagesUsed);
  const totalRemaining = Math.max(0, input.totalLimit - blogsUsed - pagesUsed);
  return {
    blogs: Math.max(0, Math.min(input.blogLimit - blogsUsed, totalRemaining)),
    pages: Math.max(0, Math.min(input.pageLimit - pagesUsed, totalRemaining)),
    totalRemaining,
  };
}

export function utcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function dailyPublishJobKey(kind: "blog" | "page", date: string, slot: number): string {
  return `publish:${kind}:${date}:${slot}`;
}

export function refreshJobKey(kind: "blog" | "page", sourceId: string, date: string): string {
  return `refresh:${kind}:${sourceId}:${date}`;
}

export function migrationJobKey(kind: "blog" | "page", sourceId: string): string {
  return `migration:${kind}:${sourceId}`;
}

export const AUTOMATION_SETTINGS_PATCH_KEYS = [
  "blog_posts_per_day",
  "static_pages_per_day",
  "daily_total_limit",
  "automation_enabled",
  "auto_seo_optimization",
  "auto_internal_linking",
  "two_way_linking",
  "cannibalization_check",
  "broken_link_check",
  "new_page_discovery",
  "content_refresh_enabled",
  "refresh_interval_days",
  "refresh_type",
  "auto_update_published",
  "only_update_when_meaningful",
  "minimum_content_change_percent",
  "keep_previous_versions",
  "max_versions",
  "pexels_images_enabled",
  "images_per_content",
  "prefer_landscape_images",
  "image_optimization",
  "image_duplicate_prevention",
  "dry_run_optimization",
  "migration_paused",
] as const;

export type AutomationSettingsPatchKey = (typeof AUTOMATION_SETTINGS_PATCH_KEYS)[number];

export function shouldInjectSeoContext(settings: { auto_seo_optimization?: boolean }): boolean {
  return settings.auto_seo_optimization !== false;
}

export function shouldEnforceThinContent(settings: { auto_seo_optimization?: boolean }): boolean {
  return settings.auto_seo_optimization !== false;
}

export function shouldRunRefreshRewrite(settings: { auto_seo_optimization?: boolean; content_refresh_enabled?: boolean }): boolean {
  return settings.content_refresh_enabled !== false && settings.auto_seo_optimization !== false;
}

export function shouldSnapshotVersions(settings: { keep_previous_versions?: boolean }): boolean {
  return settings.keep_previous_versions !== false;
}

export function shouldDiscoverRelatedPages(settings: { new_page_discovery?: boolean }): boolean {
  return settings.new_page_discovery !== false;
}

export function shouldOptimizeImageMarkup(settings: { image_optimization?: boolean }): boolean {
  return settings.image_optimization !== false;
}

export function shouldEnforceBrokenLinkAbort(settings: { broken_link_check?: boolean }): boolean {
  return settings.broken_link_check !== false;
}
