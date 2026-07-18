/**
 * Core shared types for the Games SDK.
 * Interface-only foundation — no runtime behavior.
 */

export type GameId = string;
export type UserId = string;
export type ISODateString = string;

export interface SDKResult<T = void> {
  ok: boolean;
  data?: T;
  error?: SDKError;
}

export interface SDKError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface GameContext {
  gameId: GameId;
  version?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}

export interface Paginated<T> {
  items: T[];
  cursor?: string | null;
  total?: number;
}
