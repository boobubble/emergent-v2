// Competition analytics — pure aggregation over existing tables (competitions,
// competition_votes, competition_participants, competition_follows, competition_categories).
// No new analytics engine; reuses admin auth + service-role reads.
// Architecture note: filters accept optional `creatorId` so a future Creator
// Analytics view can reuse the same handler for per-user dashboards. Not yet
// exposed in the admin UI.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.rpc("is_admin", { _user_id: userId });
  if (!data) throw new Error("Forbidden");
}

const Input = z.object({
  window: z.enum(["day", "week", "month", "all"]).default("month"),
  creatorId: z.string().uuid().optional(),
});

function windowStart(w: "day" | "week" | "month" | "all"): string | null {
  if (w === "all") return null;
  const now = Date.now();
  const ms = w === "day" ? 86400000 : w === "week" ? 7 * 86400000 : 30 * 86400000;
  return new Date(now - ms).toISOString();
}

export const getCompetitionAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = windowStart(data.window);

    // 1) Competition counts by status (filtered by creator if provided)
    let compQ = supabaseAdmin.from("competitions").select("id, name, slug, status, category_id, banner_url, total_votes, total_participants, views_count, is_featured, created_at, created_by, end_at");
    if (data.creatorId) compQ = compQ.eq("created_by", data.creatorId);
    const { data: comps = [] } = await compQ;
    const rows = comps ?? [];

    const counts = {
      total: rows.length,
      active: rows.filter((c) => c.status === "live").length,
      upcoming: rows.filter((c) => c.status === "upcoming").length,
      completed: rows.filter((c) => c.status === "completed").length,
      featured: rows.filter((c) => c.is_featured).length,
    };

    // 2) Nominee, follower, share totals
    const compIds = rows.map((c) => c.id);
    let nomineesCount = 0;
    let followersCount = 0;
    if (compIds.length > 0) {
      const [{ count: n }, { count: f }] = await Promise.all([
        supabaseAdmin.from("competition_participants").select("id", { count: "exact", head: true }).in("competition_id", compIds),
        supabaseAdmin.from("competition_follows").select("competition_id", { count: "exact", head: true }).in("competition_id", compIds),
      ]);
      nomineesCount = n ?? 0;
      followersCount = f ?? 0;
    }

    // 3) Votes in window + unique voters + trends
    let voteQ = supabaseAdmin.from("competition_votes").select("competition_id, voter_id, created_at");
    if (since) voteQ = voteQ.gte("created_at", since);
    if (compIds.length > 0) voteQ = voteQ.in("competition_id", compIds);
    const { data: votes = [] } = await voteQ;
    const voteRows = votes ?? [];
    const uniqueVoters = new Set(voteRows.map((v) => v.voter_id)).size;

    // Bucket votes by day (last 30 days regardless of `window` to give a chart)
    const dayBuckets = new Map<string, number>();
    const startWindow = Date.now() - 30 * 86400000;
    for (const v of voteRows) {
      const t = new Date(v.created_at).getTime();
      if (t < startWindow) continue;
      const day = new Date(v.created_at).toISOString().slice(0, 10);
      dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1);
    }
    const trends = Array.from(dayBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({ day, count }));

    // 4) Votes per competition for Top rankings
    const votesByComp = new Map<string, number>();
    for (const v of voteRows) {
      votesByComp.set(v.competition_id, (votesByComp.get(v.competition_id) ?? 0) + 1);
    }

    const withStats = rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      votes: c.total_votes ?? 0,
      votesInWindow: votesByComp.get(c.id) ?? 0,
      participants: c.total_participants ?? 0,
      views: c.views_count ?? 0,
      category_id: c.category_id,
    }));

    const topCompetitions = [...withStats].sort((a, b) => b.votes - a.votes).slice(0, 10);
    const fastestGrowing = [...withStats].sort((a, b) => b.votesInWindow - a.votesInWindow).slice(0, 10);
    const mostViewed = [...withStats].sort((a, b) => b.views - a.views).slice(0, 10);

    // 5) Top nominees (across all competitions)
    let topNominees: Array<{ user_id: string; username: string; vote_count: number; competition: string }> = [];
    if (compIds.length > 0) {
      const { data: parts = [] } = await supabaseAdmin
        .from("competition_participants")
        .select("user_id, vote_count, competition_id")
        .in("competition_id", compIds)
        .order("vote_count", { ascending: false })
        .limit(10);
      const userIds = (parts ?? []).map((p) => p.user_id);
      const { data: profs = [] } = userIds.length
        ? await supabaseAdmin.from("profiles").select("id, username").in("id", userIds)
        : { data: [] as Array<{ id: string; username: string }> };
      const nameMap = new Map((profs ?? []).map((p) => [p.id, p.username]));
      const compMap = new Map(rows.map((c) => [c.id, c.name]));
      topNominees = (parts ?? []).map((p) => ({
        user_id: p.user_id,
        username: nameMap.get(p.user_id) ?? "unknown",
        vote_count: p.vote_count ?? 0,
        competition: compMap.get(p.competition_id) ?? "",
      }));
    }

    // 6) Top categories by vote count
    const { data: cats = [] } = await supabaseAdmin
      .from("competition_categories")
      .select("id, name");
    const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));
    const catVotes = new Map<string, number>();
    for (const c of rows) {
      if (!c.category_id) continue;
      catVotes.set(c.category_id, (catVotes.get(c.category_id) ?? 0) + (c.total_votes ?? 0));
    }
    const topCategories = Array.from(catVotes.entries())
      .map(([id, votes]) => ({ id, name: catMap.get(id) ?? id, votes }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);

    return {
      counts,
      totals: {
        nominees: nomineesCount,
        votes: rows.reduce((s, c) => s + (c.total_votes ?? 0), 0),
        votesInWindow: voteRows.length,
        uniqueVoters,
        followers: followersCount,
        views: rows.reduce((s, c) => s + (c.views_count ?? 0), 0),
      },
      topCompetitions,
      fastestGrowing,
      mostViewed,
      topNominees,
      topCategories,
      trends,
    };
  });
