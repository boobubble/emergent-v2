/**
 * Browser helpers for Competition Memes (Feed-owned; no duplicate storage).
 * All reads target `posts_safe` filtered by category='meme' + competition_id.
 */
import { supabase } from "@/integrations/supabase/client";
import { postsSafe } from "@/lib/posts-safe";
import type { FeedPost } from "@/lib/feed-types";

export interface ActiveCompetitionLite {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export async function searchActiveCompetitions(query: string, limit = 8): Promise<ActiveCompetitionLite[]> {
  let q = supabase
    .from("competitions")
    .select("id,name,slug,status")
    .eq("is_published", true)
    .in("status", ["upcoming", "live"])
    .order("start_at", { ascending: false })
    .limit(limit);
  const trimmed = query.trim();
  if (trimmed) q = q.ilike("name", `%${trimmed}%`);
  const { data } = await q;
  return (data ?? []) as ActiveCompetitionLite[];
}

export interface NomineeLite { id: string; name: string; photo_url: string | null }

export async function listCompetitionNominees(competitionId: string): Promise<NomineeLite[]> {
  const { data } = await supabase
    .from("competition_competitors")
    .select("id,name,photo_url,is_hidden,is_disqualified")
    .eq("competition_id", competitionId)
    .order("name", { ascending: true });
  return ((data ?? []) as any[])
    .filter((c) => !c.is_hidden && !c.is_disqualified)
    .map((c) => ({ id: c.id, name: c.name, photo_url: c.photo_url ?? null }));
}

export type FunCategory = "meme" | "fan_art" | "poster" | "fan_edit";

export const FUN_CATEGORIES: FunCategory[] = ["meme", "fan_art", "poster", "fan_edit"];

export const FUN_META: Record<FunCategory, { emoji: string; label: string; plural: string; slug: string; accent: string; cta: string }> = {
  meme:     { emoji: "😂", label: "Meme",   plural: "Memes",    slug: "memes",     accent: "from-amber-400/30 to-amber-500/10",   cta: "Post the first meme" },
  fan_art:  { emoji: "🎨", label: "Fan Art", plural: "Fan Arts", slug: "fan-arts",  accent: "from-fuchsia-400/30 to-pink-500/10",  cta: "Share your fan art" },
  poster:   { emoji: "📸", label: "Poster",  plural: "Posters",  slug: "posters",   accent: "from-sky-400/30 to-indigo-500/10",    cta: "Design a poster" },
  fan_edit: { emoji: "🎥", label: "Video",   plural: "Videos",   slug: "fan-edits", accent: "from-emerald-400/30 to-teal-500/10",  cta: "Upload a fan video" },
};

export function funSlugToCategory(slug: string): FunCategory | null {
  for (const c of FUN_CATEGORIES) if (FUN_META[c].slug === slug) return c;
  return null;
}

export async function listCompetitionMemes(opts: {
  competitionId: string;
  nomineeId?: string | null;
  limit?: number;
  category?: FunCategory;
}): Promise<FeedPost[]> {
  const limit = opts.limit ?? 10;
  let q = postsSafe()
    .select("*")
    .eq("category", opts.category ?? "meme")
    .eq("competition_id", opts.competitionId);
  if (opts.nomineeId) q = q.eq("nominee_id", opts.nomineeId);
  q = q
    .order("reaction_count", { ascending: false })
    .order("comment_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  const { data } = await q;
  return ((data ?? []) as FeedPost[]);
}

/** Counts memes per nominee for the given competition. */
export async function countMemesByNominee(competitionId: string): Promise<Record<string, number>> {
  const { data } = await (supabase as any)
    .from("posts_safe")
    .select("nominee_id")
    .eq("category", "meme")
    .eq("competition_id", competitionId)
    .not("nominee_id", "is", null)
    .limit(1000);
  const map: Record<string, number> = {};
  for (const row of (data ?? []) as { nominee_id: string }[]) {
    if (!row.nominee_id) continue;
    map[row.nominee_id] = (map[row.nominee_id] ?? 0) + 1;
  }
  return map;
}

/** Fun Zone summary: per-category count, latest activity, top thumbnail, engagement badges, and mixed highlights. */
export interface FunZoneSummaryEntry {
  category: FunCategory;
  count: number;
  latestAt: string | null;
  thumb: string | null;
  caption: string | null;
  reactions: number;
  comments: number;
  recentCount: number; // last 24h
  badge: FunBadge | null;
}

export type FunBadge = "trending" | "most_shared" | "favorite" | "featured";

export const BADGE_META: Record<FunBadge, { emoji: string; label: string; className: string }> = {
  trending:    { emoji: "🔥", label: "Trending",           className: "bg-orange-500/25 text-orange-100 border-orange-400/40" },
  most_shared: { emoji: "⭐", label: "Most Shared",        className: "bg-yellow-500/25 text-yellow-100 border-yellow-400/40" },
  favorite:    { emoji: "❤️", label: "Community Favorite", className: "bg-rose-500/25 text-rose-100 border-rose-400/40" },
  featured:    { emoji: "🏆", label: "Featured",           className: "bg-amber-500/25 text-amber-100 border-amber-400/40" },
};

export interface FunHighlight {
  id: string;
  slug: string | null;
  text: string | null;
  kind: string;
  category: FunCategory;
  author_id: string;
  media_urls: string[];
  reaction_count: number;
  comment_count: number;
  created_at: string;
}

export interface FunZoneSummary {
  perCategory: Record<FunCategory, FunZoneSummaryEntry>;
  highlights: FunHighlight[];
  totals: { count: number };
}

export async function loadFunZoneSummary(competitionId: string): Promise<FunZoneSummary> {
  const perCategory: Record<FunCategory, FunZoneSummaryEntry> = {
    meme:     { category: "meme",     count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null },
    fan_art:  { category: "fan_art",  count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null },
    poster:   { category: "poster",   count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null },
    fan_edit: { category: "fan_edit", count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null },
  };
  const { data } = await (supabase as any)
    .from("posts_safe")
    .select("id,slug,kind,author_id,category,created_at,media_urls,text,reaction_count,comment_count")
    .eq("competition_id", competitionId)
    .in("category", FUN_CATEGORIES)
    .limit(1000);

  const rows = (data ?? []) as Array<{
    id: string; slug: string | null; kind: string; author_id: string;
    category: FunCategory; created_at: string; media_urls: string[] | null;
    text: string | null; reaction_count: number; comment_count: number;
  }>;
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const scored: Array<{ row: typeof rows[number]; score: number }> = [];

  for (const row of rows) {
    const bucket = perCategory[row.category];
    if (!bucket) continue;
    bucket.count += 1;
    bucket.reactions += row.reaction_count ?? 0;
    bucket.comments += row.comment_count ?? 0;
    if (new Date(row.created_at).getTime() >= dayAgo) bucket.recentCount += 1;
    if (!bucket.latestAt || row.created_at > bucket.latestAt) bucket.latestAt = row.created_at;
    const media = (row.media_urls ?? []).find((u) => /\.(jpe?g|png|gif|webp|avif|mp4|webm)$/i.test(u)) ?? row.media_urls?.[0] ?? null;
    const engagement = (row.reaction_count ?? 0) + (row.comment_count ?? 0);
    if (!bucket.thumb && media) { bucket.thumb = media; bucket.caption = row.text; }
    scored.push({ row, score: engagement + (new Date(row.created_at).getTime() >= dayAgo ? 5 : 0) });
  }

  // Assign one badge per category based on relative leadership.
  const cats: FunCategory[] = ["meme", "fan_art", "poster", "fan_edit"];
  const pick = (metric: (e: FunZoneSummaryEntry) => number, badge: FunBadge) => {
    let best: FunCategory | null = null;
    let bestVal = 0;
    for (const c of cats) {
      const v = metric(perCategory[c]);
      if (v > bestVal && perCategory[c].count > 0 && !perCategory[c].badge) { bestVal = v; best = c; }
    }
    if (best) perCategory[best].badge = badge;
  };
  pick((e) => e.recentCount, "trending");
  pick((e) => e.reactions, "favorite");
  pick((e) => e.comments, "most_shared");
  pick((e) => e.reactions + e.comments, "featured");

  scored.sort((a, b) => b.score - a.score);
  const highlights: FunHighlight[] = scored.slice(0, 12).map(({ row }) => ({
    id: row.id,
    slug: row.slug,
    text: row.text,
    kind: row.kind,
    category: row.category,
    author_id: row.author_id,
    media_urls: row.media_urls ?? [],
    reaction_count: row.reaction_count ?? 0,
    comment_count: row.comment_count ?? 0,
    created_at: row.created_at,
  }));

  return { perCategory, highlights, totals: { count: rows.length } };
}
