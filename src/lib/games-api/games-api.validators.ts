/**
 * Games API — Zod validators.
 *
 * Every external HTTP payload is validated with these schemas before it
 * reaches `games-api.service.ts`. Reject malformed requests with a 400.
 */
import { z } from "zod";

const GameId = z.string().trim().min(1).max(64).regex(/^[a-z0-9][a-z0-9-]*$/i, "invalid gameId");
const Slot = z.string().trim().min(1).max(80).default("default");
const Reason = z.string().trim().min(1).max(80).optional();
const Meta = z.record(z.string(), z.unknown()).optional();

export const StartSchema = z.object({
  gameId: GameId.optional(),
  metadata: Meta,
});

export const FinishSchema = z.object({
  gameId: GameId.optional(),
  score: z.number().finite().min(0).max(1e12).optional(),
  duration: z.number().finite().min(0).max(1e9).optional(),
  metadata: Meta,
});

export const ScoreSchema = z.object({
  gameId: GameId.optional(),
  score: z.number().finite().min(0).max(1e12),
  metadata: Meta,
});

export const XpSchema = z.object({
  amount: z.number().finite().int().min(1).max(1_000_000),
  reason: Reason,
  gameId: GameId.optional(),
  metadata: Meta,
});

export const CoinsSchema = z.object({
  amount: z.number().finite().int().min(1).max(1_000_000),
  reason: Reason,
  gameId: GameId.optional(),
});

export const SaveWriteSchema = z.object({
  gameId: GameId.optional(),
  slot: Slot,
  data: z.unknown(),
  expectedVersion: z.number().int().min(0).optional(),
});

export const SaveReadSchema = z.object({
  gameId: GameId.optional(),
  slot: Slot.optional(),
  /** When true, returns all slots for the game (list). */
  list: z.boolean().optional(),
});

export const AchievementSchema = z.object({
  achievementId: z.string().trim().min(1).max(120),
  coins: z.number().int().min(0).max(1_000_000).optional(),
  xp: z.number().int().min(0).max(1_000_000).optional(),
  reason: Reason,
});

export const EventSchema = z.object({
  name: z.string().trim().min(1).max(120),
  gameId: GameId.optional(),
  properties: Meta,
});

export type StartInput = z.infer<typeof StartSchema>;
export type FinishInput = z.infer<typeof FinishSchema>;
export type ScoreInput = z.infer<typeof ScoreSchema>;
export type XpInput = z.infer<typeof XpSchema>;
export type CoinsInput = z.infer<typeof CoinsSchema>;
export type SaveWriteInput = z.infer<typeof SaveWriteSchema>;
export type SaveReadInput = z.infer<typeof SaveReadSchema>;
export type AchievementInput = z.infer<typeof AchievementSchema>;
export type EventInput = z.infer<typeof EventSchema>;
