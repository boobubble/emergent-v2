import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FEEDBACK_DEFAULTS, type FeedbackConfig } from "@/lib/feedback-config";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function getConfig(): Promise<FeedbackConfig> {
  const { data } = await supabaseAdmin
    .from("app_settings").select("value").eq("key", "feedback").maybeSingle();
  return { ...FEEDBACK_DEFAULTS, ...((data?.value as Partial<FeedbackConfig>) ?? {}) };
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  return Boolean(data && data.length > 0);
}

async function rewardUser(userId: string, xp: number, coins: number, reason: string, refId: string) {
  if (xp === 0 && coins === 0) return;
  const { data: prof } = await supabaseAdmin
    .from("profiles").select("xp, coins").eq("id", userId).maybeSingle();
  if (!prof) return;
  const newXp = Math.max(0, (prof.xp ?? 0) + xp);
  const newCoins = Math.max(0, (prof.coins ?? 0) + coins);
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await (await getSupabaseAdmin()).from("profiles")
    .update({ xp: newXp, coins: newCoins, level: newLevel })
    .eq("id", userId);
  if (coins !== 0) {
    await (await getSupabaseAdmin()).from("coin_transactions").insert({
      user_id: userId, kind: "coins", amount: coins, reason, ref_type: "feedback", ref_id: refId,
    } as never);
  }
  if (xp !== 0) {
    await (await getSupabaseAdmin()).from("coin_transactions").insert({
      user_id: userId, kind: "xp_award", amount: xp, reason, ref_type: "feedback", ref_id: refId,
    } as never);
  }
}

// ============== LIST ==============
export const listFeedback = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({
      category: z.string().optional(),
      status: z.string().optional(),
      sort: z.enum(["trending", "recent", "top", "oldest"]).default("trending"),
      search: z.string().max(120).optional(),
      limit: z.number().min(1).max(100).default(50),
    }).parse(d ?? {}),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await getSupabaseAdmin();
    let q = supabaseAdmin.from("feedback_reports").select("*").limit(data.limit);
    if (data.category && data.category !== "all") q = q.eq("category", data.category as never);
    if (data.status && data.status !== "all") q = q.eq("status", data.status as never);
    if (data.search) q = q.ilike("title", `%${data.search}%`);

    if (data.sort === "top") q = q.order("upvote_count", { ascending: false });
    else if (data.sort === "oldest") q = q.order("created_at", { ascending: true });
    else if (data.sort === "recent") q = q.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    else q = q.order("is_pinned", { ascending: false }).order("upvote_count", { ascending: false }).order("created_at", { ascending: false });

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id);
    let myVotes: Record<string, boolean> = {};
    if (ids.length) {
      const { data: vx } = await supabaseAdmin
        .from("feedback_votes").select("report_id")
        .eq("user_id", context.userId).in("report_id", ids);
      for (const v of vx ?? []) myVotes[v.report_id] = true;
    }

    return (rows ?? []).map((r) => ({ ...r, hasVoted: !!myVotes[r.id] }));
  });

// ============== GET ONE ==============
export const getFeedback = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: row, error } = await supabaseAdmin
      .from("feedback_reports").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Report not found");

    const [{ data: comments }, { data: vote }] = await Promise.all([
      (await getSupabaseAdmin()).from("feedback_comments").select("*")
        .eq("report_id", data.id).order("created_at", { ascending: true }),
      (await getSupabaseAdmin()).from("feedback_votes").select("id")
        .eq("report_id", data.id).eq("user_id", context.userId).maybeSingle(),
    ]);

    return { report: row, comments: comments ?? [], hasVoted: !!vote };
  });

// ============== CREATE ==============
export const createFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().trim().min(4).max(140),
      description: z.string().trim().max(8000).default(""),
      category: z.enum(["bug", "feature", "improvement", "ui", "performance", "security", "other"]),
      priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
      screenshots: z.array(z.string().url()).max(6).default([]),
      url: z.string().max(500).optional(),
      device_info: z.record(z.string(), z.unknown()).optional(),
      is_anonymous: z.boolean().default(false),
    }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const cfg = await getConfig();
    if (!cfg.enabled) throw new Error("Feedback module is disabled.");
    const anon = data.is_anonymous && cfg.allowAnonymous;

    const { data: row, error } = await supabaseAdmin
      .from("feedback_reports")
      .insert({
        author_id: context.userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        screenshots: data.screenshots,
        url: data.url ?? null,
        device_info: (data.device_info as never) ?? null,
        is_anonymous: anon,
      } as never)
      .select("*").single();
    if (error) throw new Error(error.message);

    await rewardUser(
      context.userId,
      cfg.rewardOnSubmit.xp, cfg.rewardOnSubmit.coins,
      "feedback_submit", row.id,
    );

    return row;
  });

// ============== DUPLICATE DETECTION ==============
export const findSimilarFeedback = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ title: z.string().trim().min(3).max(140) }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const words = data.title.toLowerCase().split(/\s+/).filter((w) => w.length >= 4).slice(0, 4);
    if (words.length === 0) return [];
    const pattern = `%${words.join("%")}%`;
    const { data: rows } = await supabaseAdmin
      .from("feedback_reports")
      .select("id, title, status, upvote_count, category")
      .ilike("title", pattern)
      .order("upvote_count", { ascending: false })
      .limit(5);
    return rows ?? [];
  });

// ============== VOTE ==============
export const toggleVote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ reportId: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: existing } = await supabaseAdmin
      .from("feedback_votes").select("id")
      .eq("report_id", data.reportId).eq("user_id", context.userId).maybeSingle();
    if (existing) {
      await (await getSupabaseAdmin()).from("feedback_votes").delete().eq("id", existing.id);
      return { active: false };
    }
    const { error } = await supabaseAdmin
      .from("feedback_votes")
      .insert({ report_id: data.reportId, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { active: true };
  });

// ============== COMMENT ==============
export const postComment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      reportId: z.string().uuid(),
      text: z.string().trim().min(1).max(2000),
    }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const cfg = await getConfig();
    if (!cfg.allowComments) throw new Error("Comments are disabled.");
    const admin = await isAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("feedback_comments")
      .insert({
        report_id: data.reportId,
        author_id: context.userId,
        text: data.text,
        is_admin_response: admin,
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

// ============== ADMIN ==============
export const adminUpdateFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["open","investigating","planned","in_progress","fixed","closed","rejected"]).optional(),
      priority: z.enum(["low","normal","high","critical"]).optional(),
      is_pinned: z.boolean().optional(),
      is_showcased: z.boolean().optional(),
      admin_note: z.string().max(2000).optional(),
      duplicate_of: z.string().uuid().nullable().optional(),
      reward: z.object({ xp: z.number().int().min(0).max(1000), coins: z.number().int().min(0).max(1000) }).optional(),
    }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Forbidden");
    const cfg = await getConfig();

    const { data: before } = await supabaseAdmin
      .from("feedback_reports").select("*").eq("id", data.id).maybeSingle();
    if (!before) throw new Error("Not found");

    const patch: Record<string, unknown> = {};
    if (data.status) patch.status = data.status;
    if (data.priority) patch.priority = data.priority;
    if (typeof data.is_pinned === "boolean") patch.is_pinned = data.is_pinned;
    if (typeof data.is_showcased === "boolean") patch.is_showcased = data.is_showcased;
    if (typeof data.admin_note === "string") patch.admin_note = data.admin_note;
    if (data.duplicate_of !== undefined) patch.duplicate_of = data.duplicate_of;
    if (data.status === "fixed" || data.status === "closed" || data.status === "rejected") {
      patch.resolved_at = new Date().toISOString();
      patch.resolved_by = context.userId;
    }

    const { error } = await (await getSupabaseAdmin()).from("feedback_reports").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);

    // Reward author when marked fixed
    if (data.status === "fixed" && before.status !== "fixed" && before.author_id) {
      await rewardUser(
        before.author_id,
        cfg.rewardOnFixed.xp, cfg.rewardOnFixed.coins,
        "feedback_fixed", data.id,
      );
    }
    if (data.reward && before.author_id) {
      await rewardUser(before.author_id, data.reward.xp, data.reward.coins, "feedback_admin_reward", data.id);
    }

    // Notification on status change
    if (cfg.notifyOnStatusChange && data.status && data.status !== before.status && before.author_id) {
      await (await getSupabaseAdmin()).from("notifications").insert({
        user_id: before.author_id,
        actor_id: context.userId,
        kind: "feedback_status",
        target_type: "feedback",
        target_id: data.id,
        payload: { title: before.title, status: data.status },
      } as never);
    }

    // Log
    await (await getSupabaseAdmin()).from("mod_logs").insert({
      actor_id: context.userId,
      action: "edit",
      target_type: "feedback",
      target_id: data.id,
      payload: patch,
    } as never);

    return { ok: true };
  });

export const adminDeleteFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Forbidden");
    const { error } = await (await getSupabaseAdmin()).from("feedback_reports").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== ANALYTICS ==============
export const getFeedbackStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Forbidden");

    const since7d = new Date(Date.now() - 7 * 86400000).toISOString();
    const [
      { count: total }, { count: openCount }, { count: weekCount },
      { data: byCat }, { data: byStatus },
      { data: topFeatures }, { data: topBugs }, { data: topContrib },
    ] = await Promise.all([
      (await getSupabaseAdmin()).from("feedback_reports").select("*", { count: "exact", head: true }),
      (await getSupabaseAdmin()).from("feedback_reports").select("*", { count: "exact", head: true }).eq("status", "open"),
      (await getSupabaseAdmin()).from("feedback_reports").select("*", { count: "exact", head: true }).gte("created_at", since7d),
      (await getSupabaseAdmin()).from("feedback_reports").select("category"),
      (await getSupabaseAdmin()).from("feedback_reports").select("status"),
      (await getSupabaseAdmin()).from("feedback_reports").select("id, title, upvote_count, status")
        .eq("category", "feature").order("upvote_count", { ascending: false }).limit(5),
      (await getSupabaseAdmin()).from("feedback_reports").select("id, title, upvote_count, status")
        .eq("category", "bug").order("upvote_count", { ascending: false }).limit(5),
      (await getSupabaseAdmin()).from("feedback_reports").select("author_id"),
    ]);

    const catCounts: Record<string, number> = {};
    for (const r of byCat ?? []) catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
    const statusCounts: Record<string, number> = {};
    for (const r of byStatus ?? []) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;

    const contribCounts: Record<string, number> = {};
    for (const r of topContrib ?? []) {
      if (!r.author_id) continue;
      contribCounts[r.author_id] = (contribCounts[r.author_id] ?? 0) + 1;
    }
    const topContribIds = Object.entries(contribCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 5);
    let contributors: Array<{ user_id: string; username: string | null; count: number }> = [];
    if (topContribIds.length) {
      const { data: profs } = await (await getSupabaseAdmin()).from("profiles")
        .select("id, username").in("id", topContribIds.map(([id]) => id));
      const map = new Map((profs ?? []).map((p) => [p.id, p.username]));
      contributors = topContribIds.map(([id, count]) => ({
        user_id: id, username: map.get(id) ?? null, count,
      }));
    }

    return {
      total: total ?? 0,
      open: openCount ?? 0,
      thisWeek: weekCount ?? 0,
      byCategory: Object.entries(catCounts).map(([category, count]) => ({ category, count })),
      byStatus:   Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      topFeatures: topFeatures ?? [],
      topBugs: topBugs ?? [],
      topContributors: contributors,
    };
  });
