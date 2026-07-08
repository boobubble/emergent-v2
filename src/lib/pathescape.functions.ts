import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { solveLevel } from "./pathescape-solver";
import type { LevelPayload } from "./pathescape-solver";

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

// ---------- Public read (published games list) ----------
export const listPublishedLevels = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await publicClient();
  const { data, error } = await sb
    .from("pathescape_levels")
    .select("id, number, name, difficulty, grid_w, grid_h, par_moves, par_time, coin_reward, xp_reward, featured")
    .eq("enabled", true)
    .order("number", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ---------- Admin ----------
export const adminListLevels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("pathescape_levels")
      .select("*")
      .order("number", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetLevel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("pathescape_levels").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export interface SaveLevelInput {
  id?: string;
  number: number;
  name: string;
  difficulty: "easy" | "normal" | "hard" | "expert" | "master" | "nightmare";
  grid_w: number;
  grid_h: number;
  layout: LevelPayload["layout"];
  solution: LevelPayload["solution"];
  par_moves: number;
  par_time: number;
  coin_reward: number;
  xp_reward: number;
  lives?: number;
  enabled?: boolean;
  featured?: boolean;
  admin_notes?: string | null;
  season?: string | null;
  skip_validate?: boolean;
}

export const adminSaveLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SaveLevelInput) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    // Validate solvability (unless explicitly skipped)
    if (!data.skip_validate) {
      const res = solveLevel({
        grid_w: data.grid_w, grid_h: data.grid_h,
        layout: data.layout, solution: data.solution,
      });
      if (!res.solvable) throw new Error("Level has no valid solution to the target cells.");
    }
    const payload: any = {
      number: data.number,
      name: data.name,
      difficulty: data.difficulty,
      grid_w: data.grid_w, grid_h: data.grid_h,
      layout: data.layout, solution: data.solution,
      par_moves: data.par_moves, par_time: data.par_time,
      coin_reward: data.coin_reward, xp_reward: data.xp_reward,
      lives: data.lives ?? 3,
      enabled: data.enabled ?? true,
      featured: data.featured ?? false,
      admin_notes: data.admin_notes ?? null,
      season: data.season ?? null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("pathescape_levels").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("pathescape_levels").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id as string };
  });

export const adminDeleteLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("pathescape_levels").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminBulkSetEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[]; enabled: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("pathescape_levels").update({ enabled: data.enabled }).in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminValidateLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: LevelPayload) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    return solveLevel(data);
  });

export const adminLevelStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("pathescape_scores")
      .select("level_id, stars, time_ms, moves");
    const map: Record<string, { plays: number; avgStars: number; bestTime: number; bestMoves: number }> = {};
    for (const s of (data ?? []) as any[]) {
      const m = map[s.level_id] ?? { plays: 0, avgStars: 0, bestTime: Infinity, bestMoves: Infinity };
      m.plays++;
      m.avgStars = m.avgStars + (s.stars - m.avgStars) / m.plays;
      m.bestTime = Math.min(m.bestTime, s.time_ms);
      m.bestMoves = Math.min(m.bestMoves, s.moves);
      map[s.level_id] = m;
    }
    return map;
  });
