import type { GameId, UserId } from "./types";

export type SDKEventName =
  | "sdk.ready"
  | "auth.changed"
  | "wallet.changed"
  | "xp.changed"
  | "achievement.unlocked"
  | "competition.joined"
  | "competition.left"
  | "notification.received"
  | "game.started"
  | "game.finished"
  | "game.highest_tile"
  | "daily_challenge.complete"
  | "mission.complete";

export interface GameRewardResult {
  xpAwarded?: number;
  coinsAwarded?: number;
}

export interface SDKEventPayloadMap {
  "sdk.ready": { gameId: GameId };
  "auth.changed": { userId: UserId | null };
  "wallet.changed": { balance: number; delta?: number };
  "xp.changed": { xp: number; delta?: number; level?: number };
  "achievement.unlocked": { achievementId: string };
  "competition.joined": { competitionId: string };
  "competition.left": { competitionId: string };
  "notification.received": { id: string; title: string; body?: string };
  "game.started": { gameId: GameId; sessionId?: string; mode?: string; metadata?: Record<string, unknown> };
  "game.finished": { gameId: GameId; sessionId?: string; score?: number; durationMs?: number; won?: boolean; metadata?: Record<string, unknown> } & GameRewardResult;
  "game.highest_tile": { gameId: GameId; tile: number; previousBest?: number; isNewRecord?: boolean } & GameRewardResult;
  "daily_challenge.complete": { gameId: GameId; challengeId: string; date?: string } & GameRewardResult;
  "mission.complete": { gameId: GameId; missionId: string } & GameRewardResult;
}

export type SDKEventListener<K extends SDKEventName> = (
  payload: SDKEventPayloadMap[K],
) => void;

export interface EventsAdapter {
  on<K extends SDKEventName>(event: K, listener: SDKEventListener<K>): () => void;
  off<K extends SDKEventName>(event: K, listener: SDKEventListener<K>): void;
  emit<K extends SDKEventName>(event: K, payload: SDKEventPayloadMap[K]): void;
}
