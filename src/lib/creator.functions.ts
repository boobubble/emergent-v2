/**
 * Creator economy — weekly engagement score, rank, leaderboard, viral jackpot.
 * Score is computed on the fly from posts created in the last 7 days using the
 * weights in `economy-config.SCORE_WEIGHTS`.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SCORE_WEIGHTS, creatorRankFor, VIRAL_JACKPOT } from "./economy-config";
import { withRateLimit } from "./rate-limit-middleware";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function weekAgoIso(): string {
  return new Date(Date.now() - 7 * 86_400_000).toISOString();
}

interface PostRow {
  owner_id: string;
  reaction_count: number | null;
  comment_count: number | null;
  trending_score: number | null;
}

/** Score a single post by its engagement counts. */
function scorePost(p: PostRow): number {
  const r = (p.reaction_count ?? 0) * SCORE_WEIGHTS.reaction;
  const c = (p.comment_count ?? 0) * SCORE_WEIGHTS.comment;
  const t = (p.trending_score ?? 0) * 0.5; // includes boost bumps
  return r + c + t;
}

/** Get my rolling 7-day creator score + rank. */
export const getMyCreatorRank = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data } = await supabaseAdmin
      .from("posts")
      .select("owner_id, reaction_count, comment_count, trending_score")
      .eq("owner_id", userId)
      .gte("created_at", weekAgoIso())
      .limit(200);
    const rows = (data ?? []) as PostRow[];
    const score = rows.reduce((s, p) => s + scorePost(p), 0);
    const rank = creatorRankFor(score);
    return { score: Math.round(score), rank, postCount: rows.length };
  });

/** Top creators of the last 7 days. */
export const getCreatorLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("posts")
      .select("owner_id, reaction_count, comment_count, trending_score")
      .gte("created_at", weekAgoIso())
      .not("owner_id", "is", null)
      .limit(1000);
    const rows = (data ?? []) as PostRow[];
    const byUser = new Map<string, { score: number; posts: number }>();
    for (const p of rows) {
      if (!p.owner_id) continue;
      const cur = byUser.get(p.owner_id) ?? { score: 0, posts: 0 };
      cur.score += scorePost(p);
      cur.posts += 1;
      byUser.set(p.owner_id, cur);
    }
    const top = Array.from(byUser.entries())
      .map(([userId, { score, posts }]) => ({
        userId,
        score: Math.round(score),
        posts,
        rank: creatorRankFor(score),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);
    return { top };
  });

/** Today's top trending post — the daily viral jackpot candidate. */
export const getViralJackpot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .handler(async () => {
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const { data } = await supabaseAdmin
      .from("posts")
      .select("id, owner_id, text, trending_score, reaction_count, comment_count, created_at")
      .gte("created_at", dayStart.toISOString())
      .order("trending_score", { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      post: data ?? null,
      reward: VIRAL_JACKPOT,
      qualifies: !!data && (data.trending_score ?? 0) >= VIRAL_JACKPOT.minScore,
    };
  });
