import { slugifyPageSlug } from "@/lib/page-slug";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  composePublicCmsHtml,
  extractPublicCmsHrefSlugs,
  filterUnpublishedCmsLinks,
} from "@/lib/pages-cms/public-links";
import { rewriteCmsHtml } from "@/lib/pages-cms/content-quality";

/** Supabase client surface for public CMS page reads. */
export type PublishedPageDbClient = SupabaseClient<Database>;

/** TanStack Query key namespace for public CMS pages. */
export const CUSTOM_PAGE_QUERY_KEY = "custom-page" as const;

export function customPageQueryKey(slug: string): readonly [typeof CUSTOM_PAGE_QUERY_KEY, string] {
  const normalized = slugifyPageSlug(slug) || slug.trim();
  return [CUSTOM_PAGE_QUERY_KEY, normalized];
}

export type PublishedCustomPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  intro_content: string | null;
  excerpt: string | null;
  tags: string[];
  layout: string | null;
  sidebar_left: string | null;
  sidebar_right: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  /** Optional CMS H1; public renderer prefers this over title when set. */
  h1: string | null;
  noindex: boolean;
  nofollow: boolean;
  views: number;
  published_at: string | null;
  redirectedFrom: string | null;
};

export function publishedPageMatchesSlug(page: { slug: string }, urlSlug: string): boolean {
  if (!page.slug || !urlSlug) return false;
  if (page.slug === urlSlug) return true;
  return slugifyPageSlug(page.slug) === slugifyPageSlug(urlSlug);
}

function logPublishedPageFetch(meta: {
  requestedSlug: string;
  normalizedSlug: string;
  finalSlug: string;
  pageId: string | null;
  pageSlug: string | null;
  title: string | null;
}) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") return;
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) return;
  console.info("[custom-page]", meta);
}

const PAGE_SELECT =
  "id,slug,title,content,intro_content,excerpt,tags,layout,sidebar_left,sidebar_right,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,canonical_url,h1,noindex,nofollow,views,published_at";

/** PostgREST "no rows" from `.single()` — treat as miss, not infrastructure failure. */
export function isMissingRowError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "PGRST116";
}

/**
 * Map a PostgREST read to a value or throw.
 * - no row (maybeSingle null / PGRST116) → null (HTTP 404)
 * - query/connection/schema error → throw (HTTP 500)
 */
export function publishedLookupResult<T>(
  data: T | null | undefined,
  error: { code?: string; message?: string } | null | undefined,
  fallbackMessage = "Failed to load page",
): T | null {
  if (error) {
    if (isMissingRowError(error)) return null;
    throw new Error(error.message ?? fallbackMessage);
  }
  return data ?? null;
}

async function loadPublishedRow(
  sb: PublishedPageDbClient,
  slug: string,
): Promise<PublishedCustomPage | null> {
  const { data: row, error } = await sb
    .from("custom_pages")
    .select(PAGE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return publishedLookupResult(row as PublishedCustomPage | null, error);
}

async function resolveRedirectTarget(
  sb: PublishedPageDbClient,
  requestedSlug: string,
  normalizedSlug: string,
): Promise<string | null> {
  const { data: byNormalized } = await sb
    .from("page_redirects")
    .select("to_slug")
    .eq("from_slug", normalizedSlug)
    .maybeSingle();
  if (byNormalized?.to_slug) return byNormalized.to_slug;

  if (requestedSlug !== normalizedSlug) {
    const { data: byExact } = await sb
      .from("page_redirects")
      .select("to_slug")
      .eq("from_slug", requestedSlug)
      .maybeSingle();
    if (byExact?.to_slug) return byExact.to_slug;
  }

  return null;
}

/** Among candidate path slugs, return matching custom_pages rows (any status). */
export async function listCustomPageStatusesAmong(
  sb: PublishedPageDbClient,
  candidateSlugs: string[],
): Promise<Array<{ slug: string; status: string }>> {
  const uniq = [...new Set(candidateSlugs.map((s) => s.trim().toLowerCase()).filter(Boolean))];
  if (!uniq.length) return [];
  const { data, error } = await sb.from("custom_pages").select("slug,status").in("slug", uniq);
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ slug: string; status: string }>;
}

/** Display HTML for a published CMS page: intro+content with draft-target links unwrapped. */
export async function buildPublicCmsPageHtml(
  sb: PublishedPageDbClient,
  page: Pick<PublishedCustomPage, "intro_content" | "content" | "h1">,
): Promise<string> {
  const raw = composePublicCmsHtml({
    intro: page.intro_content,
    content: page.content,
  });
  const candidates = extractPublicCmsHrefSlugs(raw);
  const rows = await listCustomPageStatusesAmong(sb, candidates);
  const unpublished = rows.filter((r) => r.status !== "published").map((r) => r.slug);
  const published = rows.filter((r) => r.status === "published").map((r) => r.slug);
  const filtered = filterUnpublishedCmsLinks(raw, unpublished);
  return rewriteCmsHtml(filtered, { h1: page.h1, publishedSlugs: published });
}

/**
 * Fetch one published CMS page for a public slug.
 * - Resolves page_redirects only for the requested slug (normalized + legacy exact)
 * - Queries custom_pages by final slug (normalized first, then legacy exact)
 * - Never falls back to another page
 */
export async function fetchPublishedPageBySlug(
  sb: PublishedPageDbClient,
  rawSlug: string,
): Promise<PublishedCustomPage | null> {
  const requestedSlug = rawSlug.trim();
  const normalizedSlug = slugifyPageSlug(requestedSlug);
  if (!normalizedSlug && !requestedSlug) return null;

  const redirectTarget = await resolveRedirectTarget(sb, requestedSlug, normalizedSlug);
  const finalSlug = redirectTarget ?? normalizedSlug ?? requestedSlug;

  let row = await loadPublishedRow(sb, finalSlug);
  if (!row && requestedSlug && requestedSlug !== finalSlug) {
    row = await loadPublishedRow(sb, requestedSlug);
  }

  logPublishedPageFetch({
    requestedSlug,
    normalizedSlug,
    finalSlug,
    pageId: row?.id ?? null,
    pageSlug: row?.slug ?? null,
    title: row?.title ?? null,
  });

  if (!row) return null;

  void sb.rpc("bump_page_view", { _slug: row.slug });

  return {
    ...row,
    redirectedFrom: redirectTarget ? (normalizedSlug || requestedSlug) : null,
  };
}
