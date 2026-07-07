// Global scheduled event system for Fish / Dig / Wine bots.
// Replaces per-user cooldowns with community-wide event windows.
// This module is intentionally pure (no React) so both the chat store
// and UI components can share the same math.

export type BotEventKind = "fish" | "dig" | "wine";

export interface BotEventConfig {
  enabled: boolean;
  /** Cycle length in minutes. */
  interval_min: number;
  /** How long the event stays open in minutes. */
  duration_min: number;
  /** Max attempts per user per event window. */
  max_attempts: number;
  /** When true, occasional golden 2× reward windows are enabled. */
  bonus_enabled: boolean;
  /** 0..1 chance a given cycle becomes a golden bonus event. */
  bonus_chance: number;
}

export interface BotEventsConfig {
  fish: BotEventConfig;
  dig: BotEventConfig;
  wine: BotEventConfig;
}

export const DEFAULT_BOT_EVENT: BotEventConfig = {
  enabled: true,
  interval_min: 30,
  duration_min: 5,
  max_attempts: 1,
  bonus_enabled: true,
  bonus_chance: 0.1,
};

export const DEFAULT_BOT_EVENTS_CONFIG: BotEventsConfig = {
  fish: { ...DEFAULT_BOT_EVENT },
  dig: { ...DEFAULT_BOT_EVENT, interval_min: 45 },
  wine: { ...DEFAULT_BOT_EVENT, interval_min: 60 },
};

export const BOT_EVENT_META: Record<
  BotEventKind,
  { label: string; emoji: string; botId: string; command: string; goldenLabel: string }
> = {
  fish: { label: "Fish Event", emoji: "🐟", botId: "bot-fish", command: "!fish", goldenLabel: "Golden Fish" },
  dig:  { label: "Dig Event",  emoji: "⛏️", botId: "bot-dig",  command: "!dig",  goldenLabel: "Golden Dig" },
  wine: { label: "Wine Event", emoji: "🍷", botId: "bot-wine", command: "!wine", goldenLabel: "Happy Hour" },
};

export interface BotEventState {
  kind: BotEventKind;
  live: boolean;
  /** Deterministic id for this cycle — used to dedupe participation & notifications. */
  cycleId: string;
  cycleIndex: number;
  opensAt: number;
  closesAt: number;
  /** ms from `now` until it opens (0 if live). */
  msUntilOpen: number;
  /** ms from `now` until it closes (0 if not live). */
  msUntilClose: number;
  /** Golden/2× reward window? */
  golden: boolean;
}

export function normalizeConfig(raw: unknown): BotEventsConfig {
  const src = (raw && typeof raw === "object") ? raw as Partial<BotEventsConfig> : {};
  const one = (k: BotEventKind): BotEventConfig => ({
    ...DEFAULT_BOT_EVENTS_CONFIG[k],
    ...((src[k] as Partial<BotEventConfig>) || {}),
  });
  return { fish: one("fish"), dig: one("dig"), wine: one("wine") };
}

// Simple xorshift-ish hash for deterministic golden roll per cycle.
function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 0xffffffff;
}

export function computeEventState(
  kind: BotEventKind,
  cfg: BotEventConfig,
  now: number = Date.now(),
): BotEventState {
  const intervalMs = Math.max(1, cfg.interval_min) * 60_000;
  const durationMs = Math.max(1, Math.min(cfg.duration_min, cfg.interval_min)) * 60_000;
  const cycleIndex = Math.floor(now / intervalMs);
  const opensAt = cycleIndex * intervalMs;
  const closesAt = opensAt + durationMs;
  const live = cfg.enabled && now >= opensAt && now < closesAt;
  const nextOpensAt = live ? opensAt : (cycleIndex + (now >= closesAt ? 1 : 0)) * intervalMs;
  const cycleId = `${kind}:${cycleIndex}`;
  const golden = cfg.bonus_enabled && hashStr(cycleId) < Math.max(0, Math.min(1, cfg.bonus_chance));
  return {
    kind,
    live,
    cycleId,
    cycleIndex,
    opensAt,
    closesAt,
    msUntilOpen: live ? 0 : Math.max(0, nextOpensAt - now),
    msUntilClose: live ? Math.max(0, closesAt - now) : 0,
    golden,
  };
}

// ---- Participation tracking (client-side, per user) ----------------------

const PART_KEY = (userKey: string) => `palrgo:bot-events:participated:${userKey}`;

type PartMap = Record<string, number>; // cycleId -> attempts

function readPart(userKey: string): PartMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(PART_KEY(userKey)) || "{}") as PartMap; }
  catch { return {}; }
}

function writePart(userKey: string, map: PartMap) {
  if (typeof window === "undefined") return;
  // prune old cycles — keep last 200 entries
  const entries = Object.entries(map);
  if (entries.length > 200) {
    entries.sort((a, b) => Number(a[0].split(":")[1]) - Number(b[0].split(":")[1]));
    const pruned = Object.fromEntries(entries.slice(-200));
    try { window.localStorage.setItem(PART_KEY(userKey), JSON.stringify(pruned)); } catch { /* ignore */ }
    return;
  }
  try { window.localStorage.setItem(PART_KEY(userKey), JSON.stringify(map)); } catch { /* ignore */ }
}

export function getAttempts(userKey: string, cycleId: string): number {
  return readPart(userKey)[cycleId] ?? 0;
}

export function recordAttempt(userKey: string, cycleId: string): number {
  const map = readPart(userKey);
  map[cycleId] = (map[cycleId] ?? 0) + 1;
  writePart(userKey, map);
  return map[cycleId];
}

// ---- Shared config accessor (used by chat-store) -------------------------

let CURRENT_CONFIG: BotEventsConfig = DEFAULT_BOT_EVENTS_CONFIG;

export function setBotEventsConfig(cfg: BotEventsConfig) { CURRENT_CONFIG = cfg; }
export function getBotEventsConfig(): BotEventsConfig { return CURRENT_CONFIG; }
