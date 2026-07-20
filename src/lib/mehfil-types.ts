/**
 * Poetry Hub (Poetry Community) — shared types + constants.
 * Reuses existing platform primitives (auth, reactions, comments, XP, wallet,
 * competitions). This file defines only Poetry Hub-specific shapes.
 */

export type PoemStatus = "draft" | "pending" | "published" | "archived" | "rejected";

export type WriterRank =
  | "fresh_writer"
  | "rising_poet"
  | "poet"
  | "master_poet"
  | "legend_poet"
  | "hall_of_fame";

export const WRITER_RANK_LABEL: Record<WriterRank, string> = {
  fresh_writer: "Fresh Writer",
  rising_poet: "Rising Poet",
  poet: "Poet",
  master_poet: "Master Poet",
  legend_poet: "Legend Poet",
  hall_of_fame: "Hall of Fame",
};

export const WRITER_RANK_COLOR: Record<WriterRank, string> = {
  fresh_writer: "#94a3b8",
  rising_poet: "#22c55e",
  poet: "#0ea5e9",
  master_poet: "#8b5cf6",
  legend_poet: "#f59e0b",
  hall_of_fame: "#ef4444",
};

export const WRITER_RANK_ICON: Record<WriterRank, string> = {
  fresh_writer: "✍️",
  rising_poet: "🌱",
  poet: "📜",
  master_poet: "🎖️",
  legend_poet: "👑",
  hall_of_fame: "🏆",
};

/**
 * Poetry Hub reactions map onto the existing platform `reactions` table by
 * reusing the same reaction types (like/love/haha/fire/etc) but display
 * them with poetry-friendly labels. Storage layer stays untouched.
 */
export const MEHFIL_REACTIONS = [
  { type: "love",  emoji: "❤️", label: "Dil Chhoo Liya" },
  { type: "haha",  emoji: "👏", label: "Wah Wah" },
  { type: "angry", emoji: "🥺", label: "Emotional" },   // repurposed slot
  { type: "fire",  emoji: "🔥", label: "Outstanding" },
  { type: "like",  emoji: "🌹", label: "Beautiful" },
  { type: "wow",   emoji: "✨", label: "Masterpiece" },
] as const;

export interface MehfilCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MehfilPoem {
  id: string;
  slug: string;
  title: string;
  body: string;
  category_id: string | null;
  author_id: string;
  cover_url: string | null;
  theme: string | null;
  language: string;
  tags: string[];
  status: PoemStatus;
  view_count: number;
  read_count: number;
  upvote_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  is_featured: boolean;
  is_editors_pick: boolean;
  competition_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MehfilAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
}

export interface MehfilWriterStats {
  user_id: string;
  poems_published: number;
  total_upvotes: number;
  total_reads: number;
  total_comments: number;
  battle_wins: number;
  featured_count: number;
  hof_count: number;
  writer_rank: WriterRank;
}

export interface MehfilPoemEnriched extends MehfilPoem {
  category: Pick<MehfilCategory, "id" | "slug" | "name" | "color" | "icon"> | null;
  author: MehfilAuthor | null;
  writer_rank: WriterRank | null;
  reaction_count: number;
}

export interface MehfilDiscoverySection {
  key:
    | "trending"
    | "editors_pick"
    | "fresh"
    | "most_loved"
    | "most_read"
    | "battle_winners"
    | "rising_writers";
  label: string;
  poems: MehfilPoemEnriched[];
}

export interface MehfilSettings {
  enabled: boolean;
  battles_enabled: boolean;
  upvotes_enabled: boolean;
  comments_enabled: boolean;
  reactions_enabled: boolean;
  shares_enabled: boolean;
  ai_assist_enabled: boolean;
  auto_publish_winners: boolean;
  trending_widget_frequency: number;
  battle_auto_enroll: boolean;
  default_language: string;
  /** Admin-configurable display label for the Poetry Hub module across nav, headings, breadcrumbs, hero, empty states, notifications, and feed widgets. Route identifiers stay `/mehfil`. */
  module_name: string;
}

export const MEHFIL_SETTINGS_DEFAULTS: MehfilSettings = {
  enabled: true,
  battles_enabled: true,
  upvotes_enabled: true,
  comments_enabled: true,
  reactions_enabled: true,
  shares_enabled: true,
  ai_assist_enabled: true,
  auto_publish_winners: true,
  trending_widget_frequency: 5,
  battle_auto_enroll: false,
  default_language: "en",
  module_name: "Poetry Hub",
};

export function slugifyTitle(title: string): string {
  return (title || "poem")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "poem";
}

export function poemPreview(body: string, max = 180): string {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/[,.\s]+\S*$/, "") + "…";
}
