import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

/**
 * Central Gamification event emitter.
 *
 * Every existing feature (feed, chat, gifts, games, competitions...)
 * calls `emitGamificationEvent` with a stable event_type. The SQL
 * `gam_emit` RPC updates achievements/quests/milestones/season XP
 * and awards rewards through existing Wallet + XP + Badges + Notifications.
 * This layer stores NO duplicate currency.
 */
export const emitGamificationEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((input: { event: string; amount?: number; metadata?: Record<string, unknown> }) => {
    if (!input?.event || typeof input.event !== "string") throw new Error("event required");
    return {
      event: input.event,
      amount: Number.isFinite(input.amount) ? Math.max(1, Math.floor(input.amount as number)) : 1,
      metadata: input.metadata ?? {},
    };
  })
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { error } = await sb.rpc("gam_emit", {
      _user_id: context.userId,
      _event_type: data.event,
      _amount: data.amount,
      _metadata: data.metadata,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyGamification = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const uid = context.userId;
    const [ach, achProg, quests, qProg, ms, mProg, seasons, sTiers, sProg] = await Promise.all([
      sb.from("gam_achievements").select("*").eq("active", true).order("sort_order"),
      sb.from("gam_user_achievements").select("*").eq("user_id", uid),
      sb.from("gam_quests").select("*").eq("active", true).order("sort_order"),
      sb.from("gam_user_quests").select("*").eq("user_id", uid),
      sb.from("gam_milestones").select("*").eq("active", true).order("sort_order"),
      sb.from("gam_user_milestones").select("*").eq("user_id", uid),
      sb.from("gam_seasons").select("*").eq("active", true).order("starts_at", { ascending: false }).limit(1),
      sb.from("gam_season_tiers").select("*").order("tier"),
      sb.from("gam_user_season").select("*").eq("user_id", uid),
    ]);
    const achievements = (ach.data ?? []).map((a: { id: string }) => ({
      ...a, progress: (achProg.data ?? []).find((p: { achievement_id: string }) => p.achievement_id === a.id) ?? null,
    }));
    const questsOut = (quests.data ?? []).map((q: { id: string }) => ({
      ...q, progress: (qProg.data ?? []).find((p: { quest_id: string }) => p.quest_id === q.id) ?? null,
    }));
    const milestones = (ms.data ?? []).map((m: { id: string }) => ({
      ...m, progress: (mProg.data ?? []).find((p: { milestone_id: string }) => p.milestone_id === m.id) ?? null,
    }));
    const season = (seasons.data ?? [])[0] ?? null;
    const tiers = season ? (sTiers.data ?? []).filter((t: { season_id: string }) => t.season_id === season.id) : [];
    const seasonProgress = season ? (sProg.data ?? []).find((s: { season_id: string }) => s.season_id === season.id) ?? null : null;

    const totalAch = achievements.length;
    const doneAch = achievements.filter((a: { progress: { completed_at?: string } | null }) => a.progress?.completed_at).length;

    return { achievements, quests: questsOut, milestones, season, tiers, seasonProgress,
             completionPct: totalAch ? Math.round((doneAch / totalAch) * 100) : 0 };
  });

export const claimSeasonTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i: { seasonId: string; tier: number }) => i)
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { error } = await sb.rpc("gam_claim_season_tier", { _season_id: data.seasonId, _tier: data.tier });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: analytics overview */
export const getGamificationAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const [{ data: events }, { data: topAch }, { data: qStats }] = await Promise.all([
      sb.from("gam_event_log").select("event_type, created_at").gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()).limit(5000),
      sb.from("gam_user_achievements").select("achievement_id").not("completed_at", "is", null).limit(5000),
      sb.from("gam_user_quests").select("quest_id, completed_at").limit(5000),
    ]);
    const byType: Record<string, number> = {};
    (events ?? []).forEach((e: { event_type: string }) => { byType[e.event_type] = (byType[e.event_type] ?? 0) + 1; });
    const byAch: Record<string, number> = {};
    (topAch ?? []).forEach((r: { achievement_id: string }) => { byAch[r.achievement_id] = (byAch[r.achievement_id] ?? 0) + 1; });
    const totalQ = (qStats ?? []).length;
    const doneQ = (qStats ?? []).filter((q: { completed_at: string | null }) => q.completed_at).length;
    return { events7d: byType, topAchievements: byAch, questCompletionRate: totalQ ? doneQ / totalQ : 0 };
  });

/** Admin CRUD wrappers for gamification catalogs. */
export const listGamCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const [a, q, m, s, t] = await Promise.all([
      sb.from("gam_achievements").select("*").order("sort_order"),
      sb.from("gam_quests").select("*").order("sort_order"),
      sb.from("gam_milestones").select("*").order("sort_order"),
      sb.from("gam_seasons").select("*").order("starts_at", { ascending: false }),
      sb.from("gam_season_tiers").select("*").order("tier"),
    ]);
    return { achievements: a.data ?? [], quests: q.data ?? [], milestones: m.data ?? [],
             seasons: s.data ?? [], tiers: t.data ?? [] };
  });

export const upsertGamRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i: { table: "gam_achievements" | "gam_quests" | "gam_milestones" | "gam_seasons" | "gam_season_tiers"; row: Record<string, unknown> }) => i)
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await sb.from(data.table).upsert(data.row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGamRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i: { table: string; id: string }) => i)
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await sb.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
