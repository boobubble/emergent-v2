import { publishedLookupResult } from "@/lib/fetch-published-page";
import { extractContentImages, isSafeContentImageSrc } from "@/lib/content-image-seo";

export type PublicBlogCategory = { id: string; name: string; slug: string };

export type BlogCoverImage = {
  src: string;
  alt: string;
};

export type PublicBlogListItem = {
  title: string;
  slug: string;
  meta_description: string | null;
  published_at: string | null;
  categories: { name: string; slug: string } | null;
  cover_image: BlogCoverImage | null;
};

export type PublicBlogPost = {
  title: string;
  slug: string;
  meta_description: string | null;
  content: string;
  published_at: string | null;
  tags: string[];
  categories: { name: string; slug: string } | null;
  cover_image: BlogCoverImage | null;
};

type BlogRow = {
  title: string;
  slug: string;
  meta_description: string | null;
  content?: string;
  published_at: string | null;
  category_id: string | null;
  tags?: string[] | null;
};

/**
 * Single source of truth for list thumbnails and article og:image.
 * blog_posts has no featured_image column — the first safe <img> in content is the cover.
 */
export function firstBlogCoverImage(html: string | null | undefined): BlogCoverImage | null {
  for (const attrs of extractContentImages(html)) {
    const src = (attrs.src || "").trim();
    if (!isSafeContentImageSrc(src)) continue;
    return { src, alt: (attrs.alt || "").trim() };
  }
  return null;
}

export function absolutizeBlogCoverSrc(src: string, origin = "https://yaarzo.com"): string {
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return `${origin.replace(/\/$/, "")}${src}`;
  return src;
}

/** Older posts with null/missing tags still render. */
export function publicBlogTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
}

function attachCategory(
  row: BlogRow,
  categories: PublicBlogCategory[],
): { name: string; slug: string } | null {
  if (!row.category_id) return null;
  const match = categories.find((c) => c.id === row.category_id);
  return match ? { name: match.name, slug: match.slug } : null;
}

async function loadBlogCategories(sb: { from: (table: string) => any }): Promise<PublicBlogCategory[]> {
  const { data, error } = await sb.from("categories").select("id, name, slug").order("name");
  const rows = publishedLookupResult(
    (data ?? []) as PublicBlogCategory[],
    error,
    "Failed to load blog categories",
  );
  return rows ?? [];
}

/** SSR-safe blog index. Uses service-role client — never the browser supabase proxy. */
export async function listPublishedBlogIndex(): Promise<{
  posts: PublicBlogListItem[];
  categories: PublicBlogCategory[];
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (table: string) => any };
  const [postsResult, categories] = await Promise.all([
    db
      .from("blog_posts")
      .select("title, slug, meta_description, published_at, category_id, content")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    loadBlogCategories(db),
  ]);
  const rows = publishedLookupResult(
    (postsResult.data ?? []) as BlogRow[],
    postsResult.error,
    "Failed to load blog posts",
  );
  const posts: PublicBlogListItem[] = (rows ?? []).map((row) => ({
    title: row.title,
    slug: row.slug,
    meta_description: row.meta_description,
    published_at: row.published_at,
    categories: attachCategory(row, categories),
    cover_image: firstBlogCoverImage(row.content),
  }));
  return { posts, categories };
}

/** SSR-safe published post by slug. Miss → null (404). Unexpected query error throws (500). */
export async function getPublishedBlogBySlug(slug: string): Promise<PublicBlogPost | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (table: string) => any };
  const [{ data, error }, categories] = await Promise.all([
    db
      .from("blog_posts")
      .select("title, slug, meta_description, content, published_at, category_id, tags")
      .eq("slug", trimmed)
      .eq("status", "published")
      .maybeSingle(),
    loadBlogCategories(db),
  ]);
  const row = publishedLookupResult(data as BlogRow | null, error, "Failed to load blog post");
  if (!row) return null;
  const content = row.content ?? "";
  return {
    title: row.title,
    slug: row.slug,
    meta_description: row.meta_description,
    content,
    published_at: row.published_at,
    tags: publicBlogTags(row.tags),
    categories: attachCategory(row, categories),
    cover_image: firstBlogCoverImage(content),
  };
}
