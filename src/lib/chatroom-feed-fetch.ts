import { postsSafe } from "@/lib/posts-safe";
import type { FeedPost } from "@/lib/feed-types";
import type { FeedFetchMode } from "@/lib/feed-prefs";

export const CHATROOM_FEED_PAGE_SIZE = 12;

export type ChatroomFeedCursor =
  | { mode: "chronological"; created_at: string; id: string }
  | { mode: "trending"; trending_score: number; created_at: string; id: string };

export function normalizeChatroomFeedPost(row: Partial<FeedPost>): FeedPost {
  return {
    id: row.id ?? "",
    author_id: row.author_id ?? "",
    owner_id: row.owner_id ?? row.author_id ?? "",
    kind: row.kind ?? "text",
    text: row.text ?? "",
    slug: row.slug ?? row.id ?? "post",
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : [],
    poll: row.poll ?? null,
    privacy: row.privacy ?? "public",
    is_anonymous: Boolean(row.is_anonymous),
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    reaction_count: row.reaction_count ?? 0,
    comment_count: row.comment_count ?? 0,
    trending_score: row.trending_score ?? 0,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function applyFeedCursor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  cursor: ChatroomFeedCursor,
) {
  if (cursor.mode === "trending") {
    const ts = cursor.trending_score;
    const ca = cursor.created_at;
    const id = cursor.id;
    return query.or(
      `trending_score.lt.${ts},and(trending_score.eq.${ts},created_at.lt.${ca}),and(trending_score.eq.${ts},created_at.eq.${ca},id.lt.${id})`,
    );
  }
  const ca = cursor.created_at;
  const id = cursor.id;
  return query.or(`created_at.lt.${ca},and(created_at.eq.${ca},id.lt.${id})`);
}

export function cursorFromChatroomFeedPost(
  post: FeedPost,
  mode: FeedFetchMode,
): ChatroomFeedCursor {
  if (mode === "trending") {
    return {
      mode: "trending",
      trending_score: post.trending_score ?? 0,
      created_at: post.created_at,
      id: post.id,
    };
  }
  return { mode: "chronological", created_at: post.created_at, id: post.id };
}

export async function fetchChatroomFeedPage(
  mode: FeedFetchMode,
  cursor: ChatroomFeedCursor | null,
  limit: number,
): Promise<{ posts: FeedPost[]; error: string | null }> {
  let q = postsSafe().select("*").is("community_id", null);
  if (mode === "trending") {
    q = q
      .order("trending_score", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (cursor?.mode === "trending") q = applyFeedCursor(q, cursor);
  } else {
    q = q.order("created_at", { ascending: false }).order("id", { ascending: false });
    if (cursor?.mode === "chronological") q = applyFeedCursor(q, cursor);
  }
  const { data, error } = await q.limit(limit);
  if (error) return { posts: [], error: error.message };
  return {
    posts: ((data ?? []) as Partial<FeedPost>[]).map(normalizeChatroomFeedPost),
    error: null,
  };
}
