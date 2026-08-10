import { z } from "zod";
import type { CmsContentStatus, CmsPageStatus, CmsPageType } from "./types";
import { relatedChatRoomsConfigSchema } from "./related-chat-rooms-config";

export const CMS_PAGE_STATUSES = ["draft", "scheduled", "published", "archived"] as const satisfies readonly CmsPageStatus[];
export const CMS_CONTENT_STATUSES = ["empty", "partial", "complete"] as const satisfies readonly CmsContentStatus[];
export const CMS_PAGE_TYPE_VALUES = [
  "static", "country", "state", "city", "category",
  "country_category", "state_category", "city_category",
  "keyword", "custom_seo", "hub",
] as const satisfies readonly CmsPageType[];

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 50;

export const SORT_FIELDS = [
  "updated_at",
  "created_at",
  "title",
  "slug",
  "seo_score",
  "internal_link_count",
] as const;

export type PageSortField = (typeof SORT_FIELDS)[number];

export const cmsPageStatusSchema = z.enum(CMS_PAGE_STATUSES);
export const cmsPageTypeSchema = z.enum(CMS_PAGE_TYPE_VALUES);
export const cmsContentStatusSchema = z.enum(CMS_CONTENT_STATUSES);

export const uuidOpt = z.string().uuid().nullable().optional();

export const listPagesQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(DEFAULT_PAGE_SIZE),
  search: z.string().max(120).optional(),
  /** @deprecated use `search` — kept for existing admin UI */
  q: z.string().max(120).optional(),
  page_type: cmsPageTypeSchema.optional(),
  country_id: z.string().uuid().optional(),
  state_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  keyword_group_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  status: cmsPageStatusSchema.optional(),
  noindex: z.boolean().optional(),
  content_status: cmsContentStatusSchema.optional(),
  language: z.string().max(16).optional(),
  missing_h1: z.boolean().optional(),
  missing_meta_title: z.boolean().optional(),
  missing_meta_description: z.boolean().optional(),
  missing_primary_keyword: z.boolean().optional(),
  missing_internal_links: z.boolean().optional(),
  seo_score_min: z.number().int().min(0).max(100).optional(),
  seo_score_max: z.number().int().min(0).max(100).optional(),
  sortBy: z.enum(SORT_FIELDS).default("updated_at"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;

export const LAYOUTS = ["full", "boxed"] as const;
export const SIDEBARS = ["none", "ads", "feed"] as const;

export const pageSaveSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  content: z.string().max(200_000).default(""),
  excerpt: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).default([]),
  status: cmsPageStatusSchema.default("draft"),
  featured: z.boolean().default(false),
  layout: z.enum(LAYOUTS).default("boxed"),
  sidebar_left: z.enum(SIDEBARS).default("none"),
  sidebar_right: z.enum(SIDEBARS).default("none"),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  meta_keywords: z.string().max(500).nullable().optional(),
  og_title: z.string().max(200).nullable().optional(),
  og_description: z.string().max(400).nullable().optional(),
  og_image: z.string().max(500).nullable().optional(),
  canonical_url: z.string().max(500).nullable().optional(),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  // CMS extensions
  page_type: cmsPageTypeSchema.nullable().optional(),
  country_id: uuidOpt,
  state_id: uuidOpt,
  city_id: uuidOpt,
  category_id: uuidOpt,
  keyword_group_id: uuidOpt,
  template_id: uuidOpt,
  h1: z.string().max(300).nullable().optional(),
  primary_keyword: z.string().max(200).nullable().optional(),
  secondary_keywords: z.array(z.string().max(80)).max(40).optional(),
  language: z.string().max(16).optional(),
  intro_content: z.string().max(50_000).nullable().optional(),
  faq_content: z.any().nullable().optional(),
  cta_content: z.any().nullable().optional(),
  scheduled_at: z.string().max(40).nullable().optional(),
  parent_page_id: uuidOpt,
  hub_page_id: uuidOpt,
  related_chat_rooms: relatedChatRoomsConfigSchema.nullable().optional(),
});

export type PageSaveInput = z.infer<typeof pageSaveSchema>;

/** Public visibility: only published pages are publicly readable. */
export function isPubliclyVisibleStatus(status: string | null | undefined): boolean {
  return status === "published";
}
