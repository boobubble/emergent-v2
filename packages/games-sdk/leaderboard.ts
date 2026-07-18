import type { GameId, Paginated, SDKResult, UserId } from "./types";

export type LeaderboardScope = "global" | "friends" | "country" | "weekly" | "daily";

export interface LeaderboardEntry {
  rank: number;
  userId: UserId;
  username?: string;
  avatarUrl?: string | null;
  score: number;
}

export interface SubmitScoreInput {
  gameId: GameId;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface LeaderboardQuery {
  gameId: GameId;
  scope?: LeaderboardScope;
  limit?: number;
  cursor?: string | null;
}

export interface LeaderboardAdapter {
  submitScore(input: SubmitScoreInput): Promise<SDKResult<{ rank?: number; best: number }>>;
  getLeaderboard(query: LeaderboardQuery): Promise<SDKResult<Paginated<LeaderboardEntry>>>;
  getMyRank(gameId: GameId, scope?: LeaderboardScope): Promise<SDKResult<LeaderboardEntry | null>>;
}
