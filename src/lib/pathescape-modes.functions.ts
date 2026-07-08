import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function assertAdmin(supabase: any, userId: string) {
  const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}

// ---------- Public reads ----------

export const getCurrentDaily = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb.rpc("pathescape_current_daily");
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  const { data: lvl, error: lErr } = await sb
    .from("pathescape_levels")
    .select("id, number, name, difficulty, grid_w, grid_h, layout, solution, par_moves, par_time, coin_reward, xp_reward")
    .eq("id", row.level_id).maybeSingle();
  if (lErr) throw new Error(lErr.message);
  return { ...row, level: lvl };
});

export const getCurrentWeekly = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb.rpc("pathescape_current_weekly");
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  const { data: lvl } = await sb
    .from("pathescape_levels")
    .select("id, number, name, difficulty, grid_w, grid_h, layout, solution, par_moves, par_time, coin_reward, xp_reward")
    .eq("id", row.level_id).maybeSingle();
  return { ...row, level: lvl };
});

export const getLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((d: { levelId: string; limit?: number }) => d)
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: rows, error } = await sb.rpc("pathescape_leaderboard", {
      _level_id: data.levelId, _limit: data.limit ?? 25,
    });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------- Authenticated ----------

export const getEndlessLevel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("pathescape_endless_level", {
      _exclude_solved_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data[0] ?? null : data;
  });

// ---------- Admin ----------

export const adminPinDaily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { day: string; levelId: string; coinReward?: number; xpReward?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("pathescape_daily").upsert({
      day: data.day, level_id: data.levelId,
      coin_reward: data.coinReward ?? 25, xp_reward: data.xpReward ?? 50,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminPinWeekly = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { weekStart: string; levelId: string; coinReward?: number; xpReward?: number; topPrizeCoins?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("pathescape_weekly").upsert({
      week_start: data.weekStart, level_id: data.levelId,
      coin_reward: data.coinReward ?? 100, xp_reward: data.xpReward ?? 200,
      top_prize_coins: data.topPrizeCoins ?? 500,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListSchedule = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [{ data: daily }, { data: weekly }] = await Promise.all([
      context.supabase.from("pathescape_daily").select("*, level:pathescape_levels(id,number,name,difficulty)").order("day", { ascending: false }).limit(30),
      context.supabase.from("pathescape_weekly").select("*, level:pathescape_levels(id,number,name,difficulty)").order("week_start", { ascending: false }).limit(12),
    ]);
    return { daily: daily ?? [], weekly: weekly ?? [] };
  });
