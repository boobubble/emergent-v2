import type { FeedPost } from "./feed-types";

export function slugify(input: string, maxLen = 60): string {
  if (!input) return "post";
  let s = input.toLowerCase();
  s = s.replace(/https?:\/\/\S+/g, " ");
  // Strip everything except a-z, 0-9, whitespace, and hyphens
  s = s.replace(/[^a-z0-9\s-]/g, " ");
  s = s.replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/-+$/g, "");
  return s || "post";
}

export function postSlug(post: Pick<FeedPost, "id" | "text" | "kind"> & { slug?: string | null }): string {
  if (post.slug) return post.slug;
  // Fallback for older clients before the slug column existed
  const base = post.text?.trim() ? slugify(post.text) : post.kind || "post";
  return `${base}-${post.id.slice(0, 4)}`;
}
