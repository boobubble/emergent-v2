import { deriveContentStatus, computeSeoScore } from "./template-engine";
import type { PageSaveInput } from "./schemas";
import { slugifyPageSlug } from "@/lib/page-slug";

/** Build the DB write payload. Never trusts client-supplied derived fields. */
export function buildCustomPageWriteRow(
  data: PageSaveInput,
  opts: { userId: string; previousPublishedAt?: string | null },
) {
  const slug = slugifyPageSlug(data.slug);
  const content = data.content ?? "";
  const content_status = deriveContentStatus(content);
  const seo_score = computeSeoScore({
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    h1: data.h1,
    primary_keyword: data.primary_keyword,
    content,
    noindex: data.noindex,
  });

  const now = new Date().toISOString();
  let published_at: string | null = null;
  if (data.status === "published") {
    published_at = opts.previousPublishedAt ?? now;
  }

  // New pages default page_type to static when omitted; legacy NULL stays NULL on update if not sent.
  const page_type =
    data.page_type !== undefined
      ? data.page_type
      : data.id
        ? undefined
        : "static";

  const row: Record<string, unknown> = {
    slug,
    title: data.title,
    content,
    excerpt: data.excerpt ?? null,
    tags: data.tags ?? [],
    status: data.status,
    featured: data.featured,
    layout: data.layout,
    sidebar_left: data.sidebar_left,
    sidebar_right: data.sidebar_right,
    meta_title: data.meta_title ?? null,
    meta_description: data.meta_description ?? null,
    meta_keywords: data.meta_keywords ?? null,
    og_title: data.og_title ?? null,
    og_description: data.og_description ?? null,
    og_image: data.og_image ?? null,
    canonical_url: data.canonical_url ?? null,
    noindex: data.noindex,
    nofollow: data.nofollow,
    h1: data.h1 ?? null,
    primary_keyword: data.primary_keyword ?? null,
    secondary_keywords: data.secondary_keywords ?? [],
    language: data.language ?? "en",
    intro_content: data.intro_content ?? null,
    faq_content: data.faq_content ?? null,
    cta_content: data.cta_content ?? null,
    scheduled_at: data.status === "scheduled" ? (data.scheduled_at ?? null) : data.scheduled_at ?? null,
    content_status,
    seo_score,
    updated_at: now,
    published_at,
    created_by: opts.userId,
  };

  if (page_type !== undefined) row.page_type = page_type;
  if (data.country_id !== undefined) row.country_id = data.country_id;
  if (data.state_id !== undefined) row.state_id = data.state_id;
  if (data.city_id !== undefined) row.city_id = data.city_id;
  if (data.category_id !== undefined) row.category_id = data.category_id;
  if (data.keyword_group_id !== undefined) row.keyword_group_id = data.keyword_group_id;
  if (data.template_id !== undefined) row.template_id = data.template_id;
  if (data.parent_page_id !== undefined) row.parent_page_id = data.parent_page_id;
  if (data.hub_page_id !== undefined) row.hub_page_id = data.hub_page_id;
  if (data.related_chat_rooms !== undefined) {
    row.related_chat_rooms = data.related_chat_rooms;
  }

  return { row, slug, content_status, seo_score };
}
