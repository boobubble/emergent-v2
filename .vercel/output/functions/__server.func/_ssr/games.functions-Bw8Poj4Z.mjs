import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { S as SEAT_COLORS, L as LUDO_SEATS_FOR_TYPE, a as applyRoll, n as nextSeat, b as applyMove, i as initLudoState } from "./games-engine-CmrX_RAC.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, e as enumType, s as stringType, b as booleanType, n as numberType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
async function getSupabaseAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
const REWARDS = {
  WIN_XP: 25,
  WIN_COINS: 10,
  PARTICIPATION_XP: 5,
  DAILY_FIRST_BONUS_XP: 15,
  DAILY_XP_CAP: 200,
  MIN_TURNS_FOR_WIN_REWARD: 10
};
async function loadGame(gameId) {
  const {
    data: game,
    error
  } = await supabaseAdmin.from("games").select("*").eq("id", gameId).maybeSingle();
  if (error || !game) throw new Error("Game not found");
  const {
    data: players
  } = await supabaseAdmin.from("game_players").select("*").eq("game_id", gameId).order("seat", {
    ascending: true
  });
  return {
    game,
    players: players || []
  };
}
async function maybeStartGame(gameId) {
  const {
    game,
    players
  } = await loadGame(gameId);
  if (game.status !== "waiting") return;
  const needed = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
  if (players.length < needed) return;
  const state = initLudoState(needed);
  await supabaseAdmin.from("games").update({
    status: "active",
    started_at: (/* @__PURE__ */ new Date()).toISOString(),
    current_turn_seat: 0,
    turn_started_at: (/* @__PURE__ */ new Date()).toISOString(),
    state
  }).eq("id", gameId);
  for (const p of players) {
    await (await getSupabaseAdmin()).from("notifications").insert({
      user_id: p.user_id,
      actor_id: game.created_by,
      kind: "game_started",
      target_type: "game",
      target_id: gameId,
      payload: {
        game_type: game.game_type
      }
    });
  }
}
async function awardRewards(gameId, winnerId, loserIds, turnCount) {
  if (turnCount < REWARDS.MIN_TURNS_FOR_WIN_REWARD) return;
  const startOfDay = /* @__PURE__ */ new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startOfDayIso = startOfDay.toISOString();
  async function xpLeftToday(userId) {
    const {
      data
    } = await supabaseAdmin.from("game_rewards").select("xp").eq("user_id", userId).gte("created_at", startOfDayIso);
    const used = (data ?? []).reduce((sum, r) => sum + (r.xp ?? 0), 0);
    return Math.max(0, REWARDS.DAILY_XP_CAP - used);
  }
  const winnerLeft = await xpLeftToday(winnerId);
  const winXp = Math.min(REWARDS.WIN_XP, winnerLeft);
  const winCoins = REWARDS.WIN_COINS;
  const {
    error: winInsertErr
  } = await (await getSupabaseAdmin()).from("game_rewards").insert({
    user_id: winnerId,
    game_id: gameId,
    reward_type: "win",
    xp: winXp,
    coins: winCoins
  });
  if (winInsertErr) {
    return;
  }
  await bumpProfile(winnerId, winXp, winCoins);
  const {
    data: priorWins
  } = await supabaseAdmin.from("game_rewards").select("id").eq("user_id", winnerId).eq("reward_type", "win").gte("created_at", startOfDayIso);
  if ((priorWins?.length ?? 0) <= 1) {
    const left = await xpLeftToday(winnerId);
    const bonus = Math.min(REWARDS.DAILY_FIRST_BONUS_XP, left);
    if (bonus > 0) {
      await (await getSupabaseAdmin()).from("game_rewards").insert({
        user_id: winnerId,
        game_id: gameId,
        reward_type: "daily_first",
        xp: bonus,
        coins: 0
      });
      await bumpProfile(winnerId, bonus, 0);
    }
  }
  for (const loserId of loserIds) {
    const left = await xpLeftToday(loserId);
    const xp = Math.min(REWARDS.PARTICIPATION_XP, left);
    await (await getSupabaseAdmin()).from("game_rewards").insert({
      user_id: loserId,
      game_id: gameId,
      reward_type: "participation",
      xp,
      coins: 0
    });
    if (xp > 0) await bumpProfile(loserId, xp, 0);
  }
  await (await getSupabaseAdmin()).from("notifications").insert({
    user_id: winnerId,
    actor_id: winnerId,
    kind: "game_won",
    target_type: "game",
    target_id: gameId,
    payload: {
      xp: winXp,
      coins: winCoins
    }
  });
}
async function bumpProfile(userId, addXp, addCoins) {
  if (addXp <= 0 && addCoins <= 0) return;
  const {
    data
  } = await supabaseAdmin.from("profiles").select("xp, coins, level").eq("id", userId).maybeSingle();
  if (!data) return;
  const newXp = (data.xp ?? 0) + addXp;
  const newCoins = (data.coins ?? 0) + addCoins;
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await supabaseAdmin.from("profiles").update({
    xp: newXp,
    coins: newCoins,
    level: newLevel
  }).eq("id", userId);
}
async function findUserOpenGame(userId) {
  const {
    data: rows
  } = await supabaseAdmin.from("game_players").select("game_id, games!inner(id, status, game_type, visibility)").eq("user_id", userId);
  const open = (rows ?? []).find((r) => r.games.status === "waiting" || r.games.status === "active");
  return open ? open.games : null;
}
const createLudoMatch_createServerFn_handler = createServerRpc({
  id: "cd4166158dfa889a61bbe2d625174c679b8fc908e5b4f3644d160e3909255691",
  name: "createLudoMatch",
  filename: "src/lib/games.functions.ts"
}, (opts) => createLudoMatch.__executeServer(opts));
const createLudoMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  type: enumType(["ludo_1v1", "ludo_4p"]),
  visibility: enumType(["public", "private"]).default("private")
}).parse(input)).handler(createLudoMatch_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const open = await findUserOpenGame(userId);
  if (open) {
    if (open.status === "active") {
      throw new Error("You already have a game in progress. Finish or leave it first.");
    }
    return {
      gameId: open.id,
      reused: true
    };
  }
  const {
    data: game,
    error
  } = await supabaseAdmin.from("games").insert({
    game_type: data.type,
    visibility: data.visibility,
    created_by: userId,
    status: "waiting",
    state: {}
  }).select("id").single();
  if (error || !game) throw new Error(error?.message || "Failed to create game");
  await (await getSupabaseAdmin()).from("game_players").insert({
    game_id: game.id,
    user_id: userId,
    seat: 0,
    color: SEAT_COLORS[0],
    is_ready: true
  });
  return {
    gameId: game.id,
    reused: false
  };
});
const joinQuickMatch_createServerFn_handler = createServerRpc({
  id: "eed1a7beeda13b4a04f01404389fc5b6b3d5984b0f4481ffd2f0c0701f5f09de",
  name: "joinQuickMatch",
  filename: "src/lib/games.functions.ts"
}, (opts) => joinQuickMatch.__executeServer(opts));
const joinQuickMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  type: enumType(["ludo_1v1", "ludo_4p"])
}).parse(input)).handler(joinQuickMatch_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const open = await findUserOpenGame(userId);
  if (open) {
    if (open.status === "active") {
      throw new Error("You already have a game in progress. Finish or leave it first.");
    }
    return {
      gameId: open.id,
      created: false
    };
  }
  const {
    data: candidates
  } = await supabaseAdmin.from("games").select("id, created_by").eq("game_type", data.type).eq("status", "waiting").eq("visibility", "public").neq("created_by", userId).order("created_at", {
    ascending: true
  }).limit(5);
  for (const c of candidates ?? []) {
    const {
      data: existing
    } = await supabaseAdmin.from("game_players").select("seat, user_id").eq("game_id", c.id);
    if (!existing) continue;
    const taken = new Set(existing.map((p) => p.seat));
    const needed = LUDO_SEATS_FOR_TYPE[data.type] ?? 2;
    if (existing.length >= needed) continue;
    if (existing.some((p) => p.user_id === userId)) continue;
    let seat = -1;
    for (let s = 0; s < needed; s++) if (!taken.has(s)) {
      seat = s;
      break;
    }
    if (seat < 0) continue;
    const {
      error: joinErr
    } = await (await getSupabaseAdmin()).from("game_players").insert({
      game_id: c.id,
      user_id: userId,
      seat,
      color: SEAT_COLORS[seat],
      is_ready: true
    });
    if (joinErr) continue;
    await maybeStartGame(c.id);
    return {
      gameId: c.id,
      created: false
    };
  }
  const {
    data: game,
    error
  } = await supabaseAdmin.from("games").insert({
    game_type: data.type,
    visibility: "public",
    created_by: userId,
    status: "waiting",
    state: {}
  }).select("id").single();
  if (error || !game) throw new Error(error?.message || "Failed to create game");
  await (await getSupabaseAdmin()).from("game_players").insert({
    game_id: game.id,
    user_id: userId,
    seat: 0,
    color: SEAT_COLORS[0],
    is_ready: true
  });
  return {
    gameId: game.id,
    created: true
  };
});
const inviteToGame_createServerFn_handler = createServerRpc({
  id: "49cc98ca68bbc66d95e39195311e383f06e5b326a7f4d663d7c0f14dea45a0bc",
  name: "inviteToGame",
  filename: "src/lib/games.functions.ts"
}, (opts) => inviteToGame.__executeServer(opts));
const inviteToGame = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid(),
  receiverId: stringType().uuid()
}).parse(input)).handler(inviteToGame_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  if (data.receiverId === userId) throw new Error("Cannot invite yourself");
  const {
    game,
    players
  } = await loadGame(data.gameId);
  if (game.status !== "waiting") throw new Error("Game already started");
  if (!players.some((p) => p.user_id === userId)) throw new Error("Not in this game");
  if (players.some((p) => p.user_id === data.receiverId)) throw new Error("Already in game");
  const {
    data: inv,
    error
  } = await supabaseAdmin.from("game_invites").insert({
    sender_id: userId,
    receiver_id: data.receiverId,
    game_id: data.gameId,
    status: "pending"
  }).select("id").single();
  if (error || !inv) throw new Error(error?.message || "Invite failed");
  await (await getSupabaseAdmin()).from("notifications").insert({
    user_id: data.receiverId,
    actor_id: userId,
    kind: "game_invite",
    target_type: "game",
    target_id: data.gameId,
    payload: {
      invite_id: inv.id,
      game_type: game.game_type
    }
  });
  return {
    inviteId: inv.id
  };
});
const respondToInvite_createServerFn_handler = createServerRpc({
  id: "22cffefac94963a228668e2408c63722795aaf6ff9a0ae2d926921298874f9bb",
  name: "respondToInvite",
  filename: "src/lib/games.functions.ts"
}, (opts) => respondToInvite.__executeServer(opts));
const respondToInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  inviteId: stringType().uuid(),
  accept: booleanType()
}).parse(input)).handler(respondToInvite_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    data: inv,
    error
  } = await supabaseAdmin.from("game_invites").select("*").eq("id", data.inviteId).maybeSingle();
  if (error || !inv) throw new Error("Invite not found");
  if (inv.receiver_id !== userId) throw new Error("Not your invite");
  if (inv.status !== "pending") throw new Error("Invite already handled");
  if (!data.accept) {
    await supabaseAdmin.from("game_invites").update({
      status: "rejected",
      responded_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.inviteId);
    return {
      gameId: null
    };
  }
  const {
    game,
    players
  } = await loadGame(inv.game_id);
  if (game.status !== "waiting") {
    await supabaseAdmin.from("game_invites").update({
      status: "expired",
      responded_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.inviteId);
    throw new Error("Game already started");
  }
  const needed = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
  const taken = new Set(players.map((p) => p.seat));
  let seat = -1;
  for (let s = 0; s < needed; s++) if (!taken.has(s)) {
    seat = s;
    break;
  }
  if (seat < 0) throw new Error("Game full");
  if (!players.some((p) => p.user_id === userId)) {
    const {
      error: jErr
    } = await (await getSupabaseAdmin()).from("game_players").insert({
      game_id: inv.game_id,
      user_id: userId,
      seat,
      color: SEAT_COLORS[seat],
      is_ready: true
    });
    if (jErr) throw new Error(jErr.message);
  }
  await supabaseAdmin.from("game_invites").update({
    status: "accepted",
    responded_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.inviteId);
  await maybeStartGame(inv.game_id);
  return {
    gameId: inv.game_id
  };
});
const rollDice_createServerFn_handler = createServerRpc({
  id: "def86cf4221a567a0df4b29ba809cef73663b77fcf06f76656fc2857e33c4d0f",
  name: "rollDice",
  filename: "src/lib/games.functions.ts"
}, (opts) => rollDice.__executeServer(opts));
const rollDice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid()
}).parse(input)).handler(rollDice_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    game,
    players
  } = await loadGame(data.gameId);
  if (game.status !== "active") throw new Error("Game not active");
  const me = players.find((p) => p.user_id === userId);
  if (!me) throw new Error("Not in game");
  if (me.seat !== game.current_turn_seat) throw new Error("Not your turn");
  const state = game.state;
  if (state.dice != null) throw new Error("Already rolled — make a move");
  const die = 1 + Math.floor(Math.random() * 6);
  const {
    state: newState,
    mustPass,
    extraTurn
  } = applyRoll(state, me.seat, die);
  const totalSeats = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
  const updates = {
    state: newState,
    turn_count: (game.turn_count ?? 0) + 1,
    turn_started_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (mustPass && !extraTurn) {
    updates.current_turn_seat = nextSeat(me.seat, totalSeats);
  }
  await (await getSupabaseAdmin()).from("games").update(updates).eq("id", data.gameId);
  return {
    die
  };
});
const moveToken_createServerFn_handler = createServerRpc({
  id: "71677cf95649820521dba41c3d1c40a14d6abfae7bd67abbe7faa598960a35b1",
  name: "moveToken",
  filename: "src/lib/games.functions.ts"
}, (opts) => moveToken.__executeServer(opts));
const moveToken = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid(),
  tokenIndex: numberType().int().min(0).max(3)
}).parse(input)).handler(moveToken_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    game,
    players
  } = await loadGame(data.gameId);
  if (game.status !== "active") throw new Error("Game not active");
  const me = players.find((p) => p.user_id === userId);
  if (!me) throw new Error("Not in game");
  if (me.seat !== game.current_turn_seat) throw new Error("Not your turn");
  const state = game.state;
  const result = applyMove(state, me.seat, data.tokenIndex);
  if ("error" in result) throw new Error(result.error);
  const totalSeats = LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2;
  const updates = {
    state: result.state,
    turn_count: (game.turn_count ?? 0) + 1,
    turn_started_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  let finished = false;
  let winnerId = null;
  if (result.winnerSeat != null) {
    finished = true;
    const winnerPlayer = players.find((p) => p.seat === result.winnerSeat);
    winnerId = winnerPlayer?.user_id ?? null;
    updates.status = "finished";
    updates.winner_id = winnerId;
    updates.finished_at = (/* @__PURE__ */ new Date()).toISOString();
  } else if (!result.extraTurn) {
    updates.current_turn_seat = nextSeat(me.seat, totalSeats);
  }
  await (await getSupabaseAdmin()).from("games").update(updates).eq("id", data.gameId);
  if (finished && winnerId) {
    const losers = players.filter((p) => p.user_id !== winnerId).map((p) => p.user_id);
    await awardRewards(data.gameId, winnerId, losers, (game.turn_count ?? 0) + 1);
  }
  return {
    ok: true
  };
});
const leaveGame_createServerFn_handler = createServerRpc({
  id: "c40f74d1a45590fdf525f74684e4f6e44cf523aa76a14f23fd4706087ee9d02d",
  name: "leaveGame",
  filename: "src/lib/games.functions.ts"
}, (opts) => leaveGame.__executeServer(opts));
const leaveGame = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid()
}).parse(input)).handler(leaveGame_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    game,
    players
  } = await loadGame(data.gameId);
  const me = players.find((p) => p.user_id === userId);
  if (!me) return {
    ok: true
  };
  if (game.status === "active") {
    const others = players.filter((p) => p.user_id !== userId);
    if (others.length === 1) {
      const winner = others[0];
      await supabaseAdmin.from("games").update({
        status: "finished",
        winner_id: winner.user_id,
        finished_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", data.gameId);
      await awardRewards(data.gameId, winner.user_id, [userId], game.turn_count ?? 0);
    } else {
      await supabaseAdmin.from("games").update({
        status: "cancelled",
        finished_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", data.gameId);
    }
  } else if (game.status === "waiting") {
    await (await getSupabaseAdmin()).from("game_players").delete().eq("id", me.id);
    if (game.created_by === userId && players.length === 1) {
      await (await getSupabaseAdmin()).from("games").update({
        status: "cancelled"
      }).eq("id", data.gameId);
    }
  }
  return {
    ok: true
  };
});
const listMyGames_createServerFn_handler = createServerRpc({
  id: "4d00427dbed1e2194bf1b9907d21b2093afbfe89d10306de3cebf8e73ecd8aa6",
  name: "listMyGames",
  filename: "src/lib/games.functions.ts"
}, (opts) => listMyGames.__executeServer(opts));
const listMyGames = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).handler(listMyGames_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    data: rows
  } = await supabaseAdmin.from("game_players").select("game_id, games!inner(id, game_type, status, current_turn_seat, created_at, winner_id)").eq("user_id", userId).order("joined_at", {
    ascending: false
  }).limit(20);
  return {
    rows: rows ?? []
  };
});
const listLeaderboard_createServerFn_handler = createServerRpc({
  id: "3902176137028063880e5342df75791c99dfbc86370baf92b68e6f6430078c79",
  name: "listLeaderboard",
  filename: "src/lib/games.functions.ts"
}, (opts) => listLeaderboard.__executeServer(opts));
const listLeaderboard = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).handler(listLeaderboard_createServerFn_handler, async () => {
  const since = new Date(Date.now() - 7 * 24 * 36e5).toISOString();
  const {
    data: rows
  } = await supabaseAdmin.from("game_rewards").select("user_id, xp").gte("created_at", since);
  const totals = /* @__PURE__ */ new Map();
  (rows ?? []).forEach((r) => {
    totals.set(r.user_id, (totals.get(r.user_id) ?? 0) + (r.xp ?? 0));
  });
  const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (!top.length) return {
    rows: []
  };
  const ids = top.map(([id]) => id);
  const {
    data: profiles
  } = await supabaseAdmin.from("profiles").select("id, username, avatar_url, avatar_color, level").in("id", ids);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  return {
    rows: top.map(([id, xp]) => ({
      user_id: id,
      xp,
      profile: byId.get(id) ?? null
    }))
  };
});
export {
  createLudoMatch_createServerFn_handler,
  inviteToGame_createServerFn_handler,
  joinQuickMatch_createServerFn_handler,
  leaveGame_createServerFn_handler,
  listLeaderboard_createServerFn_handler,
  listMyGames_createServerFn_handler,
  moveToken_createServerFn_handler,
  respondToInvite_createServerFn_handler,
  rollDice_createServerFn_handler
};
