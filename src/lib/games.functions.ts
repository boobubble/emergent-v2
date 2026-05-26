import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  applyMove,
  applyRoll,
  initLudoState,
  LUDO_SEATS_FOR_TYPE,
  LudoState,
  nextSeat,
  SEAT_COLORS,
} from "./games-engine";

const REWARDS = {
  WIN_XP: 25,
  WIN_COINS: 10,
  PARTICIPATION_XP: 5,
  DAILY_FIRST_BONUS_XP: 15,
  DAILY_XP_CAP: 200,
  MIN_TURNS_FOR_WIN_REWARD: 10,
};

type GameType = "ludo_1v1" | "ludo_4p";

// ---------- helpers (server only) ----------
async function loadGame(gameId: string) {
  const { data: game, error } = await supabaseAdmin
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();
  if (error || !game) throw new Error("Game not found");
  const { data: players } = await supabaseAdmin
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat", { ascending: true });
  return { game, players: players || [] };
}

async function maybeStartGame(gameId: string) {
  const { game, players } = await loadGame(gameId);
  if (game.status !== "waiting") return;
  const needed = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
  if (players.length < needed) return;
  const state = initLudoState(needed);
  await supabaseAdmin
    .from("games")
    .update({
      status: "active",
      started_at: new Date().toISOString(),
      current_turn_seat: 0,
      turn_started_at: new Date().toISOString(),
      state: state as unknown as Record<string, unknown>,
    })
    .eq("id", gameId);
  // Notify other players
  for (const p of players) {
    await supabaseAdmin.from("notifications").insert({
      user_id: p.user_id,
      actor_id: game.created_by,
      kind: "game_started",
      target_type: "game",
      target_id: gameId,
      payload: { game_type: game.game_type },
    } as never);
  }
}

async function awardRewards(gameId: string, winnerId: string, loserIds: string[], turnCount: number) {
  if (turnCount < REWARDS.MIN_TURNS_FOR_WIN_REWARD) return; // anti-farm guard

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startOfDayIso = startOfDay.toISOString();

  // Daily cap check (only consider XP from game_rewards today)
  async function xpLeftToday(userId: string) {
    const { data } = await supabaseAdmin
      .from("game_rewards")
      .select("xp")
      .eq("user_id", userId)
      .gte("created_at", startOfDayIso);
    const used = (data ?? []).reduce((sum, r) => sum + (r.xp ?? 0), 0);
    return Math.max(0, REWARDS.DAILY_XP_CAP - used);
  }

  // Winner: win + maybe daily_first
  const winnerLeft = await xpLeftToday(winnerId);
  const winXp = Math.min(REWARDS.WIN_XP, winnerLeft);
  const winCoins = REWARDS.WIN_COINS;
  // Unique on (game_id, reward_type='win') prevents double payout
  const { error: winInsertErr } = await supabaseAdmin.from("game_rewards").insert({
    user_id: winnerId,
    game_id: gameId,
    reward_type: "win",
    xp: winXp,
    coins: winCoins,
  } as never);
  if (winInsertErr) {
    // Already rewarded for this game — bail to avoid double-paying
    return;
  }
  await bumpProfile(winnerId, winXp, winCoins);

  // Daily first win bonus
  const { data: priorWins } = await supabaseAdmin
    .from("game_rewards")
    .select("id")
    .eq("user_id", winnerId)
    .eq("reward_type", "win")
    .gte("created_at", startOfDayIso);
  if ((priorWins?.length ?? 0) <= 1) {
    const left = await xpLeftToday(winnerId);
    const bonus = Math.min(REWARDS.DAILY_FIRST_BONUS_XP, left);
    if (bonus > 0) {
      await supabaseAdmin.from("game_rewards").insert({
        user_id: winnerId,
        game_id: gameId,
        reward_type: "daily_first",
        xp: bonus,
        coins: 0,
      } as never);
      await bumpProfile(winnerId, bonus, 0);
    }
  }

  for (const loserId of loserIds) {
    const left = await xpLeftToday(loserId);
    const xp = Math.min(REWARDS.PARTICIPATION_XP, left);
    await supabaseAdmin.from("game_rewards").insert({
      user_id: loserId,
      game_id: gameId,
      reward_type: "participation",
      xp,
      coins: 0,
    } as never);
    if (xp > 0) await bumpProfile(loserId, xp, 0);
  }

  // Winner notification
  await supabaseAdmin.from("notifications").insert({
    user_id: winnerId,
    actor_id: winnerId,
    kind: "game_won",
    target_type: "game",
    target_id: gameId,
    payload: { xp: winXp, coins: winCoins },
  } as never);
}

async function bumpProfile(userId: string, addXp: number, addCoins: number) {
  if (addXp <= 0 && addCoins <= 0) return;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("xp, coins, level")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return;
  const newXp = (data.xp ?? 0) + addXp;
  const newCoins = (data.coins ?? 0) + addCoins;
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await supabaseAdmin
    .from("profiles")
    .update({ xp: newXp, coins: newCoins, level: newLevel })
    .eq("id", userId);
}

// ---------- public server fns ----------

export const createLudoMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      type: z.enum(["ludo_1v1", "ludo_4p"]),
      visibility: z.enum(["public", "private"]).default("private"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // 60s cooldown: refuse if user created another game in last 60s that's still waiting
    const cooldownStart = new Date(Date.now() - 60_000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("games")
      .select("id")
      .eq("created_by", userId)
      .eq("status", "waiting")
      .gte("created_at", cooldownStart)
      .limit(1);
    if (recent && recent.length) {
      return { gameId: recent[0].id, reused: true };
    }
    const { data: game, error } = await supabaseAdmin
      .from("games")
      .insert({
        game_type: data.type,
        visibility: data.visibility,
        created_by: userId,
        status: "waiting",
        state: {},
      } as never)
      .select("id")
      .single();
    if (error || !game) throw new Error(error?.message || "Failed to create game");
    // Add creator as seat 0
    await supabaseAdmin.from("game_players").insert({
      game_id: game.id,
      user_id: userId,
      seat: 0,
      color: SEAT_COLORS[0],
      is_ready: true,
    } as never);
    return { gameId: game.id, reused: false };
  });

export const joinQuickMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ type: z.enum(["ludo_1v1", "ludo_4p"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // Find an open public game I haven't already joined
    const { data: candidates } = await supabaseAdmin
      .from("games")
      .select("id, created_by")
      .eq("game_type", data.type)
      .eq("status", "waiting")
      .eq("visibility", "public")
      .neq("created_by", userId)
      .order("created_at", { ascending: true })
      .limit(5);
    for (const c of candidates ?? []) {
      const { data: existing } = await supabaseAdmin
        .from("game_players")
        .select("seat")
        .eq("game_id", c.id);
      if (!existing) continue;
      const taken = new Set(existing.map(p => p.seat));
      const needed = LUDO_SEATS_FOR_TYPE[data.type] ?? 2;
      if (existing.length >= needed) continue;
      if (existing.some(p => (p as { user_id?: string }).user_id === userId)) continue;
      // Find next free seat
      let seat = -1;
      for (let s = 0; s < needed; s++) if (!taken.has(s)) { seat = s; break; }
      if (seat < 0) continue;
      const { error: joinErr } = await supabaseAdmin.from("game_players").insert({
        game_id: c.id,
        user_id: userId,
        seat,
        color: SEAT_COLORS[seat],
        is_ready: true,
      } as never);
      if (joinErr) continue;
      await maybeStartGame(c.id);
      return { gameId: c.id, created: false };
    }
    // Otherwise create a new public match
    const { data: game, error } = await supabaseAdmin
      .from("games")
      .insert({
        game_type: data.type,
        visibility: "public",
        created_by: userId,
        status: "waiting",
        state: {},
      } as never)
      .select("id")
      .single();
    if (error || !game) throw new Error(error?.message || "Failed to create game");
    await supabaseAdmin.from("game_players").insert({
      game_id: game.id,
      user_id: userId,
      seat: 0,
      color: SEAT_COLORS[0],
      is_ready: true,
    } as never);
    return { gameId: game.id, created: true };
  });

export const inviteToGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      gameId: z.string().uuid(),
      receiverId: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (data.receiverId === userId) throw new Error("Cannot invite yourself");
    // Verify caller is in the game and game is waiting
    const { game, players } = await loadGame(data.gameId);
    if (game.status !== "waiting") throw new Error("Game already started");
    if (!players.some(p => p.user_id === userId)) throw new Error("Not in this game");
    if (players.some(p => p.user_id === data.receiverId)) throw new Error("Already in game");

    const { data: inv, error } = await supabaseAdmin
      .from("game_invites")
      .insert({
        sender_id: userId,
        receiver_id: data.receiverId,
        game_id: data.gameId,
        status: "pending",
      } as never)
      .select("id")
      .single();
    if (error || !inv) throw new Error(error?.message || "Invite failed");
    await supabaseAdmin.from("notifications").insert({
      user_id: data.receiverId,
      actor_id: userId,
      kind: "game_invite",
      target_type: "game",
      target_id: data.gameId,
      payload: { invite_id: inv.id, game_type: game.game_type },
    } as never);
    return { inviteId: inv.id };
  });

export const respondToInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      inviteId: z.string().uuid(),
      accept: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: inv, error } = await supabaseAdmin
      .from("game_invites")
      .select("*")
      .eq("id", data.inviteId)
      .maybeSingle();
    if (error || !inv) throw new Error("Invite not found");
    if (inv.receiver_id !== userId) throw new Error("Not your invite");
    if (inv.status !== "pending") throw new Error("Invite already handled");

    if (!data.accept) {
      await supabaseAdmin
        .from("game_invites")
        .update({ status: "rejected", responded_at: new Date().toISOString() })
        .eq("id", data.inviteId);
      return { gameId: null };
    }

    // Accept: join game
    const { game, players } = await loadGame(inv.game_id);
    if (game.status !== "waiting") {
      await supabaseAdmin
        .from("game_invites")
        .update({ status: "expired", responded_at: new Date().toISOString() })
        .eq("id", data.inviteId);
      throw new Error("Game already started");
    }
    const needed = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
    const taken = new Set(players.map(p => p.seat));
    let seat = -1;
    for (let s = 0; s < needed; s++) if (!taken.has(s)) { seat = s; break; }
    if (seat < 0) throw new Error("Game full");
    if (!players.some(p => p.user_id === userId)) {
      const { error: jErr } = await supabaseAdmin.from("game_players").insert({
        game_id: inv.game_id,
        user_id: userId,
        seat,
        color: SEAT_COLORS[seat],
        is_ready: true,
      } as never);
      if (jErr) throw new Error(jErr.message);
    }
    await supabaseAdmin
      .from("game_invites")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", data.inviteId);
    await maybeStartGame(inv.game_id);
    return { gameId: inv.game_id };
  });

export const rollDice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ gameId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { game, players } = await loadGame(data.gameId);
    if (game.status !== "active") throw new Error("Game not active");
    const me = players.find(p => p.user_id === userId);
    if (!me) throw new Error("Not in game");
    if (me.seat !== game.current_turn_seat) throw new Error("Not your turn");
    const state = game.state as unknown as LudoState;
    if (state.dice != null) throw new Error("Already rolled — make a move");

    const die = 1 + Math.floor(Math.random() * 6);
    const { state: newState, mustPass, extraTurn } = applyRoll(state, me.seat, die);
    const totalSeats = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
    const updates: Record<string, unknown> = {
      state: newState as unknown as Record<string, unknown>,
      turn_count: (game.turn_count ?? 0) + 1,
      turn_started_at: new Date().toISOString(),
    };
    if (mustPass && !extraTurn) {
      updates.current_turn_seat = nextSeat(me.seat, totalSeats);
    }
    await supabaseAdmin.from("games").update(updates).eq("id", data.gameId);
    return { die };
  });

export const moveToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      gameId: z.string().uuid(),
      tokenIndex: z.number().int().min(0).max(3),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { game, players } = await loadGame(data.gameId);
    if (game.status !== "active") throw new Error("Game not active");
    const me = players.find(p => p.user_id === userId);
    if (!me) throw new Error("Not in game");
    if (me.seat !== game.current_turn_seat) throw new Error("Not your turn");
    const state = game.state as unknown as LudoState;
    const result = applyMove(state, me.seat, data.tokenIndex);
    if ("error" in result) throw new Error(result.error);
    const totalSeats = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
    const updates: Record<string, unknown> = {
      state: result.state as unknown as Record<string, unknown>,
      turn_count: (game.turn_count ?? 0) + 1,
      turn_started_at: new Date().toISOString(),
    };
    let finished = false;
    let winnerId: string | null = null;
    if (result.winnerSeat != null) {
      finished = true;
      const winnerPlayer = players.find(p => p.seat === result.winnerSeat);
      winnerId = winnerPlayer?.user_id ?? null;
      updates.status = "finished";
      updates.winner_id = winnerId;
      updates.finished_at = new Date().toISOString();
    } else if (!result.extraTurn) {
      updates.current_turn_seat = nextSeat(me.seat, totalSeats);
    }
    await supabaseAdmin.from("games").update(updates).eq("id", data.gameId);

    if (finished && winnerId) {
      const losers = players.filter(p => p.user_id !== winnerId).map(p => p.user_id);
      await awardRewards(data.gameId, winnerId, losers, (game.turn_count ?? 0) + 1);
    }
    return { ok: true };
  });

export const leaveGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ gameId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { game, players } = await loadGame(data.gameId);
    const me = players.find(p => p.user_id === userId);
    if (!me) return { ok: true };
    if (game.status === "active") {
      // Forfeit: remaining player wins
      const others = players.filter(p => p.user_id !== userId);
      if (others.length === 1) {
        const winner = others[0];
        await supabaseAdmin
          .from("games")
          .update({
            status: "finished",
            winner_id: winner.user_id,
            finished_at: new Date().toISOString(),
          })
          .eq("id", data.gameId);
        await awardRewards(data.gameId, winner.user_id, [userId], (game.turn_count ?? 0));
      } else {
        await supabaseAdmin
          .from("games")
          .update({ status: "cancelled", finished_at: new Date().toISOString() })
          .eq("id", data.gameId);
      }
    } else if (game.status === "waiting") {
      await supabaseAdmin.from("game_players").delete().eq("id", me.id);
      // If creator left and no one else, cancel
      if (game.created_by === userId && players.length === 1) {
        await supabaseAdmin.from("games").update({ status: "cancelled" }).eq("id", data.gameId);
      }
    }
    return { ok: true };
  });

export const listMyGames = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: rows } = await supabaseAdmin
      .from("game_players")
      .select("game_id, games!inner(id, game_type, status, current_turn_seat, created_at, winner_id)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: false })
      .limit(20);
    return { rows: rows ?? [] };
  });

export const listLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    // Aggregate XP from game_rewards in last 7 days
    const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
    const { data: rows } = await supabaseAdmin
      .from("game_rewards")
      .select("user_id, xp")
      .gte("created_at", since);
    const totals = new Map<string, number>();
    (rows ?? []).forEach(r => {
      totals.set(r.user_id, (totals.get(r.user_id) ?? 0) + (r.xp ?? 0));
    });
    const top = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    if (!top.length) return { rows: [] };
    const ids = top.map(([id]) => id);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, username, avatar_url, avatar_color, level")
      .in("id", ids);
    const byId = new Map((profiles ?? []).map(p => [p.id, p]));
    return {
      rows: top.map(([id, xp]) => ({ user_id: id, xp, profile: byId.get(id) ?? null })),
    };
  });
