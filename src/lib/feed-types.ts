export type PostKind = "text" | "image" | "gif" | "poll";
export type PostPrivacy = "public" | "friends" | "private";
export type ReactionType = "like" | "love" | "haha" | "angry" | "fire";
export type FriendshipStatus = "pending" | "accepted" | "blocked";

export interface FeedPost {
  id: string;
  author_id: string;
  kind: PostKind;
  text: string;
  slug: string;
  media_urls: string[];
  poll: { question: string; options: string[]; votes?: Record<string, number> } | null;
  privacy: PostPrivacy;
  is_anonymous: boolean;
  hashtags: string[];
  reaction_count: number;
  comment_count: number;
  trending_score: number;
  created_at: string;
}


export interface FeedComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  text: string;
  created_at: string;
}

export interface FeedReaction {
  id: string;
  user_id: string;
  target_type: "post" | "comment";
  target_id: string;
  type: ReactionType;
  created_at: string;
}

export interface FeedFriendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface FeedNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  kind: string;
  target_type: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export const REACTION_EMOJI: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  angry: "😡",
  fire: "🔥",
};

export const REACTION_ORDER: ReactionType[] = ["like", "love", "haha", "angry", "fire"];

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\p{L}0-9_]{2,32}/giu) ?? [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
}

export function extractMentions(text: string): string[] {
  const matches = text.match(/@[a-zA-Z0-9_-]{3,20}/g) ?? [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
}
