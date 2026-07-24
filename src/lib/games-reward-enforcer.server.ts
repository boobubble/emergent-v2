/**
 * Games reward enforcement (server-only).
 *
 * Prevents SDK/API callers from self-minting unlimited coins/XP/achievements
 * by:
 *   1. Requiring the gameId be pre-registered in GAME_REWARD_CAPS.
 *   2. Clamping every reward call to the game's per-call cap.
 *   3. Rejecting the call when today's total (per user, per game) already
 *      exceeds the game's per-day cap.
 *
 * Today's totals are computed by summing `gam_event_log` rows for the
 * current UTC day where `metadata->>gameId` matches — that's the same log
 * every SDK/API reward path writes to (via `gam_emit`).
 */
import { getGameRewardCaps } from "./games-hub-caps";

export type RewardKind = "coins" | "xp" | "achievement";

export class GameRewardDeniedError extends Error {
  status: number;
  code: string;
  constructor(code: string, message: string, status = 403) {
    super(message);
    this.name = "GameRewardDeniedError";
    this.code = code;
    this.status = status;
  }
}

interface EnforceInput {
  userId: string;
  gameId: string | null | undefined;
  kind: RewardKind;
  /** Amount the caller requested. Clamped to the per-call cap. */
  requested: number;
}

/**
 * Returns the amount that may actually be credited (>= 1). Throws
 * `GameRewardDeniedError` when the game is unknown or today's cap is spent.
 */
export async function enforceGameReward(input: EnforceInput): Promise<number> {
  const caps = getGameRewardCaps(input.gameId);
  if (!caps) {
    throw new GameRewardDeniedError(
      "unregistered_game",
      "This game is not registered for rewards.",
      403,
    );
  }

  if (input.kind === "achievement") {
    const spent = await sumTodayForGame(input.userId, caps.gameId, "achievement");
    if (spent >= caps.perDayAchievements) {
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
      `Daily ${input.kind} cap reached for this game.`,
    );
  }
  return Math.min(clamped, remaining);
}

async function sumTodayForGame(
  userId: string,
  gameId: string,
  kind: RewardKind,
): Promise<number> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = supabaseAdmin as any;
  const query = a
    .from("gam_event_log")
    .select("amount, event_type, metadata")
    .eq("user_id", userId)
    .gte("created_at", start.toISOString())
    .contains("metadata", { gameId })
    .limit(1000);
  const { data: rows } = await query;
  if (!Array.isArray(rows)) return 0;

  return rows.reduce((sum: number, r: { amount?: number; event_type?: string; metadata?: Record<string, unknown> }) => {
    const et = String(r?.event_type ?? "");
    const amt = Number(r?.amount ?? 0);
    if (kind === "achievement") {
      // Achievements are logged via gam_award which emits a badge event; we
      // count any row whose reason/event mentions "achievement".
      return et.includes("achievement") ? sum + 1 : sum;
    }
    if (kind === "coins") {
      // Coin rewards flow through gam_award → gam_emit with event_type set
      // from the caller's `reason`, typically containing "coin".
      return et.includes("coin") ? sum + amt : sum;
    }
    // XP rewards: any non-coin/non-achievement game event that carries an
    // amount contributes to the daily XP budget for this game.
    if (!et.includes("coin") && !et.includes("achievement")) {
      return sum + amt;
    }
    return sum;
  }, 0);
}
