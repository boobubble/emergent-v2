import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applyMoves, isSolved, type Level, type Rotation } from "@/components/games/rooms/arrow-flow/logic";

type Difficulty = "easy" | "normal" | "hard" | "expert" | "master";
type Mode = "story" | "daily" | "practice" | "tournament";
type LeaderboardScope = "global" | "today" | "week" | "friends" | "room";

const DIFF_BASE: Record<Difficulty, number> = {
  easy: 100, normal: 200, hard: 400, expert: 800, master: 1600,
};
const DIFF_MULT: Record<Difficulty, number> = {
  easy: 1, normal: 1.5, hard: 2, expert: 3, master: 5,
};

interface LevelRow {
  id: string;
  level_number: number;
  difficulty: Difficulty;
  grid_size: number;
  layout: Level;
  solution: Rotation[];
  par_moves: number;
  par_time_ms: number;
  coin_reward: number;
  xp_reward: number;
  is_featured: boolean;
  is_enabled: boolean;
  version: number;
}

/** List enabled levels, without solutions. */
export const listArrowFlowLevels = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { difficulty?: Difficulty; limit?: number }) => ({
    difficulty: input?.difficulty,
    limit: Math.min(Math.max(1, input?.limit ?? 50), 200),
  }))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (context.supabase as any)
      .from("arrowflow_levels")
      .select("id,level_number,difficulty,grid_size,par_moves,par_time_ms,coin_reward,xp_reward,is_featured")
      .eq("is_enabled", true)
      .order("level_number", { ascending: true })
      .limit(data.limit);
    if (data.difficulty) q = q.eq("difficulty", data.difficulty);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { levels: rows ?? [] };
  });

/** Fetch a level's playable layout. Never returns the solution. */
export const getArrowFlowLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id || typeof input.id !== "string") throw new Error("Invalid level id");
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any)
      .from("arrowflow_levels")
      .select("id,level_number,difficulty,grid_size,layout,par_moves,par_time_ms,coin_reward,xp_reward,is_featured")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Level not found");
    return row;
  });

/** Fetch today's daily challenge (or null). */
export const getArrowFlowDaily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row } = await (context.supabase as any)
      .from("arrowflow_daily")
      .select("id,challenge_date,level_id,bonus_coins,bonus_xp")
      .eq("challenge_date", today)
      .maybeSingle();
    return { daily: row ?? null };
  });

/**
 * Submit a completed run. Server replays the move log against the level's
 * canonical layout+solution and rejects tampered submissions before it
 * grants coins/XP or updates the leaderboard.
 */
export const submitArrowFlowScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    levelId: string;
    mode: Mode;
    timeMs: number;
    moves: number;
    hintsUsed: number;
    moveLog: number[];
    roomId?: string | null;
  }) => {
    if (!input?.levelId) throw new Error("Missing levelId");
    if (!Array.isArray(input.moveLog)) throw new Error("Missing moveLog");
    if (typeof input.timeMs !== "number" || input.timeMs < 0) throw new Error("Bad time");
    if (typeof input.moves !== "number" || input.moves < 0) throw new Error("Bad moves");
    return {
      levelId: input.levelId,
      mode: (["story", "daily", "practice", "tournament"] as const).includes(input.mode) ? input.mode : "story",
      timeMs: Math.min(input.timeMs, 60 * 60 * 1000),
      moves: Math.min(input.moves, 5000),
      hintsUsed: Math.max(0, Math.min(input.hintsUsed ?? 0, 500)),
      moveLog: input.moveLog.slice(0, 5000).map((n) => Math.floor(Number(n))),
      roomId: input.roomId ?? null,
    };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;

    const { data: lvl, error: le } = await admin
      .from("arrowflow_levels")
      .select("id,level_number,difficulty,grid_size,layout,solution,par_moves,par_time_ms,coin_reward,xp_reward")
      .eq("id", data.levelId)
      .maybeSingle();
    if (le) throw new Error(le.message);
    if (!lvl) throw new Error("Level not found");

    const level = lvl as LevelRow;

    // Anti-cheat: sanity bounds.
    if (data.moveLog.length !== data.moves) throw new Error("Move log length mismatch");
    if (data.timeMs < data.moves * 120) throw new Error("Impossible completion time");
    if (data.moves > level.par_moves * 5 + 50) throw new Error("Move count exceeds cap");

    // Replay and verify.
    const replayed = applyMoves(level.layout, data.moveLog);
    if (!isSolved(replayed)) throw new Error("Replay did not solve the puzzle");

    // Score / stars.
    const base = DIFF_BASE[level.difficulty] ?? 200;
    const timeBonus = Math.max(0, (level.par_time_ms - data.timeMs) / level.par_time_ms) * base;
    const moveBonus = Math.max(0, (level.par_moves - data.moves) / level.par_moves) * base * 0.5;
    const hintPenalty = data.hintsUsed * (base * 0.1);
    const score = Math.max(0, Math.round(base + timeBonus + moveBonus - hintPenalty));
    const stars = score >= base * 1.8 ? 3 : score >= base * 1.2 ? 2 : 1;
    const perfect = data.moves <= level.par_moves && data.hintsUsed === 0 && data.timeMs <= level.par_time_ms;

    // Duplicate submission throttle (3s).
    const { data: recent } = await admin
      .from("arrowflow_scores")
      .select("created_at")
      .eq("user_id", userId)
      .eq("level_id", data.levelId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (recent?.[0]?.created_at && Date.now() - new Date(recent[0].created_at).getTime() < 3000) {
      throw new Error("Please wait a moment before submitting again");
    }

    // Room best BEFORE upsert (to detect record-broken).
    let brokeRoomRecord = false;
    if (data.roomId) {
      const { data: roomBest } = await admin
        .from("arrowflow_scores")
        .select("score")
        .eq("level_id", data.levelId)
        .eq("room_id", data.roomId)
        .order("score", { ascending: false })
        .limit(1);
      brokeRoomRecord = !roomBest?.[0] || score > (roomBest[0].score as number);
    }

    // Upsert best-per-user.
    const { data: existing } = await admin
      .from("arrowflow_scores")
      .select("id,score")
      .eq("user_id", userId)
      .eq("level_id", data.levelId)
      .eq("mode", data.mode)
      .maybeSingle();

    let personalBest = existing?.score ?? 0;
    let newRecord = false;
    if (!existing || score > (existing.score as number)) {
      newRecord = true;
      personalBest = score;
      const payload = {
        user_id: userId,
        level_id: data.levelId,
        room_id: data.roomId,
        time_ms: data.timeMs,
        moves: data.moves,
        hints_used: data.hintsUsed,
        score,
        stars,
        perfect,
        mode: data.mode,
        move_log: data.moveLog,
      };
      if (existing) {
        await admin.from("arrowflow_scores").update(payload).eq("id", existing.id);
      } else {
        await admin.from("arrowflow_scores").insert(payload);
      }
    }

    // Wallet reward (only on new personal best, to prevent farming).
    const mult = DIFF_MULT[level.difficulty] ?? 1;
    const coinsAwarded = newRecord ? Math.round(level.coin_reward * mult) : 0;
    if (coinsAwarded > 0) {
      await admin.rpc("wallet_apply", {
        _user: userId,
        _amount: coinsAwarded,
        _direction: "credit",
        _kind: "coin_award",
        _reference: `arrowflow:${level.id}:${data.mode}`,
        _metadata: { source: "arrowflow", level_number: level.level_number, mode: data.mode },
      });
    }

    // System event feed (server-side broadcast via chat_messages fallback: skipped;
    // client also pushes via its own `pushSystem` so the room sees it immediately).

    return {
      ok: true,
      score,
      stars,
      perfect,
      newRecord,
      brokeRoomRecord,
      coinsAwarded,
      xpAwarded: newRecord ? level.xp_reward : 0,
      personalBest,
    };
  });

/**
 * Reveal one incorrect piece's correct rotation. Costs coins from the
 * player's wallet (or a free daily hint slot if admin allows).
 */
export const buyArrowFlowHint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { levelId: string; currentRotations: Rotation[] }) => {
    if (!input?.levelId) throw new Error("Missing levelId");
    if (!Array.isArray(input.currentRotations)) throw new Error("Missing currentRotations");
    return {
      levelId: input.levelId,
      currentRotations: input.currentRotations.map((r) => (Math.floor(Number(r)) % 4) as Rotation),
    };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;

    const { data: lvl } = await admin
      .from("arrowflow_levels")
      .select("id,solution")
      .eq("id", data.levelId)
      .maybeSingle();
    if (!lvl) throw new Error("Level not found");
    const solution = lvl.solution as Rotation[];

    // Find first piece with wrong rotation.
    let hintIdx = -1;
    let hintRot: Rotation = 0;
    for (let i = 0; i < solution.length; i++) {
      const cur = data.currentRotations[i];
      if (cur !== solution[i]) { hintIdx = i; hintRot = solution[i]; break; }
    }
    if (hintIdx < 0) return { ok: true, alreadySolved: true, hintIdx: -1, hintRot: 0, cost: 0 };

    // Config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settingsRow } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", "arrowflow")
      .maybeSingle();
    const settings = (settingsRow?.value as { hintCost?: number } | null) ?? null;
    const cost = Math.max(0, Math.floor(settings?.hintCost ?? 15));

    if (cost > 0) {
      const { error } = await admin.rpc("wallet_apply", {
        _user: userId,
        _amount: cost,
        _direction: "debit",
        _kind: "coin_spend",
        _reference: `arrowflow_hint:${data.levelId}`,
        _metadata: { source: "arrowflow", type: "hint" },
      });
      if (error) throw new Error("Not enough coins");
    }

    return { ok: true, alreadySolved: false, hintIdx, hintRot, cost };
  });

/** Leaderboard rows for a given level and scope. */
export const getArrowFlowLeaderboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { levelId: string; scope: LeaderboardScope; roomId?: string | null }) => ({
    levelId: input.levelId,
    scope: (["global", "today", "week", "friends", "room"] as const).includes(input.scope) ? input.scope : "global",
    roomId: input.roomId ?? null,
  }))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = context.supabase as any;
    let q = supabase
      .from("arrowflow_scores")
      .select("id,user_id,score,time_ms,moves,stars,perfect,created_at,room_id")
      .eq("level_id", data.levelId)
      .order("score", { ascending: false })
      .order("time_ms", { ascending: true })
      .limit(50);
    if (data.scope === "today") {
      const start = new Date(); start.setUTCHours(0, 0, 0, 0);
      q = q.gte("created_at", start.toISOString());
    } else if (data.scope === "week") {
      const start = new Date(); start.setUTCDate(start.getUTCDate() - 7);
      q = q.gte("created_at", start.toISOString());
    } else if (data.scope === "room" && data.roomId) {
      q = q.eq("room_id", data.roomId);
    } else if (data.scope === "friends") {
      const { data: friends } = await supabase
        .from("friendships")
        .select("addressee_id,requester_id,status")
        .or(`addressee_id.eq.${context.userId},requester_id.eq.${context.userId}`)
        .eq("status", "accepted");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const friendIds = new Set<string>((friends ?? []).map((f: any) =>
        f.addressee_id === context.userId ? f.requester_id : f.addressee_id,
      ));
      friendIds.add(context.userId);
      q = q.in("user_id", Array.from(friendIds));
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds = Array.from(new Set((rows ?? []).map((r: any) => r.user_id)));
    let profiles: Record<string, { display_name: string | null; username: string | null; avatar_url: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,display_name,username,avatar_url")
        .in("id", userIds);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profiles = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { rows: (rows ?? []).map((r: any) => ({
      ...r,
      profile: profiles[r.user_id] ?? null,
    })) };
  });
