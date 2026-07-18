/**
 * GameLaunchService — client side.
 *
 * Reusable launcher for every registered external game. Verifies the
 * user is logged in, mints a short-lived signed session token via the
 * server, appends it to the game's launchUrl as `?session=…`, and opens
 * the resulting URL.
 *
 * The Games Hub UI does not embed or duplicate any gameplay — it only
 * hands off to the external game with a signed token.
 */

import { mintGameSession } from "@/lib/game-launch.functions";
import type { HubGame } from "@/lib/games-hub-registry";

export interface LaunchResult {
  url: string;
  token: string;
  expiresAt: number;
}

export class GameLaunchError extends Error {
  constructor(
    message: string,
    public code: "NOT_AUTHENTICATED" | "MINT_FAILED" | "BAD_URL",
  ) {
    super(message);
    this.name = "GameLaunchError";
  }
}

function appendSession(launchUrl: string, token: string): string {
  let url: URL;
  try {
    url = new URL(launchUrl);
  } catch {
    throw new GameLaunchError("Invalid launchUrl", "BAD_URL");
  }
  url.searchParams.set("session", token);
  return url.toString();
}

export const GameLaunchService = {
  /**
   * Build the launch URL with a signed session token. Callers should
   * confirm the user is authenticated before invoking this.
   */
  async prepare(game: Pick<HubGame, "id" | "launchUrl">, opts?: { isAuthenticated?: boolean }): Promise<LaunchResult> {
    if (opts?.isAuthenticated === false) {
      throw new GameLaunchError("Sign in required to launch this game", "NOT_AUTHENTICATED");
    }

    let token: string;
    let expiresAt: number;
    try {
      const res = await mintGameSession({ data: { gameId: game.id } });
      token = res.token;
      expiresAt = res.expiresAt;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // requireSupabaseAuth throws 401 when there's no session
      if (/unauthor/i.test(msg) || /401/.test(msg)) {
        throw new GameLaunchError("Sign in required to launch this game", "NOT_AUTHENTICATED");
      }
      throw new GameLaunchError(`Could not start game session: ${msg}`, "MINT_FAILED");
    }

    return { url: appendSession(game.launchUrl, token), token, expiresAt };
  },

  /**
   * Prepare and open the game in a new tab. Returns the launch result
   * for logging/telemetry.
   */
  async launch(
    game: Pick<HubGame, "id" | "launchUrl">,
    opts?: { isAuthenticated?: boolean; target?: "_blank" | "_self" },
  ): Promise<LaunchResult> {
    const result = await GameLaunchService.prepare(game, opts);
    if (typeof window !== "undefined") {
      const target = opts?.target ?? "_blank";
      window.open(result.url, target, target === "_blank" ? "noopener,noreferrer" : undefined);
    }
    return result;
  },
};
