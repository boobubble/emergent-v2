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

export async function listCompetitionMemes(opts: {
  competitionId: string;
  nomineeId?: string | null;
  limit?: number;
}): Promise<FeedPost[]> {
  const limit = opts.limit ?? 10;
  let q = postsSafe()
    .select("*")
    .eq("category", "meme")
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
