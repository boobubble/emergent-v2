import type { GameId, UserId } from "./types";

export type SDKEventName =
  | "sdk.ready"
  | "auth.changed"
  | "wallet.changed"
  | "xp.changed"
  | "achievement.unlocked"
  | "competition.joined"
  | "competition.left"
  | "notification.received";

export interface SDKEventPayloadMap {
  "sdk.ready": { gameId: GameId };
  "auth.changed": { userId: UserId | null };
  "wallet.changed": { balance: number; delta?: number };
  "xp.changed": { xp: number; delta?: number; level?: number };
  "achievement.unlocked": { achievementId: string };
  "competition.joined": { competitionId: string };
  "competition.left": { competitionId: string };
  "notification.received": { id: string; title: string; body?: string };
}

export type SDKEventListener<K extends SDKEventName> = (
  payload: SDKEventPayloadMap[K],
) => void;

export interface EventsAdapter {
  on<K extends SDKEventName>(event: K, listener: SDKEventListener<K>): () => void;
  off<K extends SDKEventName>(event: K, listener: SDKEventListener<K>): void;
  emit<K extends SDKEventName>(event: K, payload: SDKEventPayloadMap[K]): void;
}
