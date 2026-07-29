import { g as getGameRewardCaps } from "./games-hub-caps-DZ7ZIznu.mjs";
class GameRewardDeniedError extends Error {
  status;
  code;
  constructor(code, message, status = 403) {
    super(message);
    this.name = "GameRewardDeniedError";
    this.code = code;
    this.status = status;
  }
}
async function enforceGameReward(input) {
  const caps = getGameRewardCaps(input.gameId);
  if (!caps) {
    throw new GameRewardDeniedError(
      "unregistered_game",
      "This game is not registered for rewards.",
      403
    );
  }
  if (input.kind === "achievement") {
    const spent2 = await sumTodayForGame(input.userId, caps.gameId, "achievement");
    if (spent2 >= caps.perDayAchievements) {
      throw new GameRewardDeniedError("daily_cap", "Daily achievement cap reached for this game.");
    }
    return 1;
  }
  const perCall = input.kind === "coins" ? caps.perCallCoins : caps.perCallXp;
  const perDay = input.kind === "coins" ? caps.perDayCoins : caps.perDayXp;
  const requested = Math.max(0, Math.floor(Number(input.requested) || 0));
  if (requested <= 0) return 0;
  const clamped = Math.min(requested, perCall);
  const spent = await sumTodayForGame(input.userId, caps.gameId, input.kind);
  const remaining = Math.max(0, perDay - spent);
  if (remaining <= 0) {
    throw new GameRewardDeniedError(
      "daily_cap",
      `Daily ${input.kind} cap reached for this game.`
    );
  }
  return Math.min(clamped, remaining);
}
async function sumTodayForGame(userId, gameId, kind) {
  const { supabaseAdmin } = await import("./client.server-BXCYxJZY.mjs");
  const start = /* @__PURE__ */ new Date();
  start.setUTCHours(0, 0, 0, 0);
  const a = supabaseAdmin;
  const query = a.from("gam_event_log").select("amount, event_type, metadata").eq("user_id", userId).gte("created_at", start.toISOString()).contains("metadata", { gameId }).limit(1e3);
  const { data: rows } = await query;
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((sum, r) => {
    const et = String(r?.event_type ?? "");
    const amt = Number(r?.amount ?? 0);
    if (kind === "achievement") {
      return et.includes("achievement") ? sum + 1 : sum;
    }
    if (kind === "coins") {
      return et.includes("coin") ? sum + amt : sum;
    }
    if (!et.includes("coin") && !et.includes("achievement")) {
      return sum + amt;
    }
    return sum;
  }, 0);
}
export {
  GameRewardDeniedError,
  enforceGameReward
};
