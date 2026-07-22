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

export const FUN_META: Record<FunCategory, { emoji: string; label: string; plural: string; slug: string; accent: string }> = {
  meme:     { emoji: "😂", label: "Meme",     plural: "Memes",     slug: "memes",     accent: "from-amber-400/30 to-amber-500/10" },
  fan_art:  { emoji: "🎨", label: "Fan Art",  plural: "Fan Arts",  slug: "fan-arts",  accent: "from-fuchsia-400/30 to-pink-500/10" },
  poster:   { emoji: "📸", label: "Poster",   plural: "Posters",   slug: "posters",   accent: "from-sky-400/30 to-indigo-500/10" },
  fan_edit: { emoji: "🎥", label: "Fan Edit", plural: "Fan Edits", slug: "fan-edits", accent: "from-emerald-400/30 to-teal-500/10" },
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

/** Fun Zone summary: per-category count, latest activity timestamp, and top thumbnail. */
export interface FunZoneSummaryEntry {
  category: FunCategory;
  count: number;
  latestAt: string | null;
  thumb: string | null;
  caption: string | null;
}

export async function loadFunZoneSummary(competitionId: string): Promise<Record<FunCategory, FunZoneSummaryEntry>> {
  const result: Record<FunCategory, FunZoneSummaryEntry> = {
    meme:     { category: "meme",     count: 0, latestAt: null, thumb: null, caption: null },
    fan_art:  { category: "fan_art",  count: 0, latestAt: null, thumb: null, caption: null },
    poster:   { category: "poster",   count: 0, latestAt: null, thumb: null, caption: null },
    fan_edit: { category: "fan_edit", count: 0, latestAt: null, thumb: null, caption: null },
  };
  const { data } = await (supabase as any)
    .from("posts_safe")
    .select("category,created_at,media_urls,text,reaction_count,comment_count")
    .eq("competition_id", competitionId)
    .in("category", FUN_CATEGORIES)
    .limit(1000);
  for (const row of (data ?? []) as Array<{
    category: FunCategory; created_at: string; media_urls: string[] | null;
    text: string | null; reaction_count: number; comment_count: number;
  }>) {
    const bucket = result[row.category];
    if (!bucket) continue;
    bucket.count += 1;
    if (!bucket.latestAt || row.created_at > bucket.latestAt) bucket.latestAt = row.created_at;
    const engagement = (row.reaction_count ?? 0) + (row.comment_count ?? 0);
    const currentBest = bucket.thumb ? 1 : 0;
    if (engagement >= currentBest || !bucket.thumb) {
      const img = (row.media_urls ?? []).find((u) => /\.(jpe?g|png|gif|webp|avif|mp4|webm)$/i.test(u)) ?? row.media_urls?.[0] ?? null;
      if (img) bucket.thumb = img;
      if (!bucket.caption) bucket.caption = row.text;
    }
  }
  return result;
}
