/**
 * Games Hub — server-side allow-list & reward caps.
 *
 * Every external game that can mint coins / XP / achievements through the
 * Games SDK or the Games API MUST be listed here. The caps below are the
 * hard ceiling the server will accept regardless of what the caller sends.
 *
 * - `perCallCoins`   / `perCallXp`   — max amount allowed on ONE reward call.
 * - `perDayCoins`    / `perDayXp`    — max total accepted from that game per
 *                                     user per UTC day (enforced by summing
 *                                     today's rows in `gam_event_log`).
 * - `perDayAchievements`             — max achievement unlocks per user per
 *                                     UTC day for this game.
 *
 * A gameId absent from `GAME_REWARD_CAPS` is treated as untrusted:
 *   • `mintGameSession` refuses to sign a token for it.
 *   • The SDK/API reward endpoints refuse to credit anything for it.
 *
 * This module is browser-safe (no server-only imports); it is intentionally
 * separate from `games-hub-registry.ts` which carries React icons.
 */
export interface GameRewardCaps {
  /** Human-readable id used as `gameId` everywhere. */
  gameId: string;
  perCallCoins: number;
  perCallXp: number;
  perDayCoins: number;
  perDayXp: number;
  perDayAchievements: number;
}

/**
 * Conservative defaults for platform-published games. External games can be
 * added here as they are integrated. Numbers reflect what a legitimate game
 * session can plausibly reward without breaking the economy.
 */
export const GAME_REWARD_CAPS: Record<string, GameRewardCaps> = {
  "premium-2048": {
    gameId: "premium-2048",
    perCallCoins: 25,
    perCallXp: 50,
    perDayCoins: 300,
    perDayXp: 600,
    perDayAchievements: 10,
  },
};

export function getGameRewardCaps(gameId: string | null | undefined): GameRewardCaps | null {
  if (!gameId) return null;
  return GAME_REWARD_CAPS[gameId] ?? null;
}

export function isRegisteredGame(gameId: string | null | undefined): boolean {
  return !!getGameRewardCaps(gameId);
}
