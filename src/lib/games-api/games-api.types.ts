/**
 * Games API — shared types.
 *
 * The Games API is a thin HTTP gateway exposed at `/api/games/*` that
 * external games (2048, Water Sort, Sudoku, …) call using the signed
 * session token minted by `GameLaunchService`. Every endpoint responds
 * with the same envelope shape defined here.
 */

export interface GameSessionClaims {
  /** userId (Supabase auth.users.id). */
  sub: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  /** issued-at (epoch seconds). */
  iat: number;
  /** expires-at (epoch seconds). */
  exp: number;
  /** gameId the token was minted for. */
  gid: string;
  /** 128-bit hex random. */
  nonce: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: string | null;
}

export type GamesApiAction =
  | "start"
  | "finish"
  | "score"
  | "xp"
  | "coins"
  | "save.write"
  | "save.read"
  | "achievement"
  | "event";
