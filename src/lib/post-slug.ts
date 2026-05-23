import type { FeedPost } from "./feed-types";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function slugifyText(text: string, maxWords = 6): string {
  const cleaned = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#@]/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join("-");
  return cleaned || "post";
}

export function postSlug(post: Pick<FeedPost, "id" | "text" | "kind">): string {
  const base = post.text?.trim() ? slugifyText(post.text) : post.kind || "post";
  return `${base}-${post.id}`;
}

export function postIdFromSlug(slug: string): string | null {
  const m = slug.match(UUID_RE);
  return m ? m[0] : null;
}
