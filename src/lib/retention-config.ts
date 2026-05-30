/**
 * Retention tuning — Activity / Streaks / Momentum / Loyalty / Energy.
 *
 * Pure module, safe to import on the client. All values are DEFAULTS — the
 * live values are merged from `app_settings.retention` so admins can tune
 * them at runtime (see `useRetentionConfig`).
 *
 * DESIGN RULES (do not violate when implementing):
 *   • Never debit earned coins. Decay applies to MOMENTUM and ENERGY only.
 *   • Streak break = reset counter to 0. Past rewards stay. No clawback.
 *   • Inactivity does not punish — it only pauses growth and reduces bonus
 *     multipliers. Base earn rates from `economy-config` are untouched.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Streak milestones (login / chat / feed / room — same ladder)
// ─────────────────────────────────────────────────────────────────────────────

export type StreakKind = "login" | "chat" | "feed" | "room";

export interface StreakMilestone {
  day: number;
  reward:
    | { kind: "xp"; amount: number }
    | { kind: "coins"; amount: number }
    | { kind: "badge"; badgeId: string; label: string }
    | { kind: "achievement"; achievementId: string; label: string };
  label: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { day: 1,   label: "Welcome back",   reward: { kind: "xp",          amount: 10 } },
  { day: 3,   label: "Warming up",     reward: { kind: "coins",       amount: 25 } },
  { day: 7,   label: "One week strong",reward: { kind: "coins",       amount: 100 } },
  { day: 30, label: "Loyal member",   reward: { kind: "badge",       badgeId: "streak_30",  label: "30-day streak" } },
  { day: 100, label: "Centurion",      reward: { kind: "achievement", achievementId: "streak_100", label: "100-day streak" } },
];

export const STREAK_DEFAULTS = {
  /** Hours of grace beyond local midnight before a streak is considered broken. */
  graceHours: 6,
  /** Show a "your streak is at risk" prompt this many hours before reset. */
  riskWindowHours: 12,
};

// ─────────────────────────────────────────────────────────────────────────────
// Momentum (creator visibility score)
// ─────────────────────────────────────────────────────────────────────────────

export const MOMENTUM_DEFAULTS = {
  /** Score gained per action. Server enforces caps to prevent farming. */
  gains: {
    post: 5,
    reaction_received: 1,
    comment_received: 3,
    room_message: 0.2,
    mission_completed: 4,
  } as Record<string, number>,
  /** Hard cap so a single viral day can't dwarf weeks of work. */
  dailyCap: 200,
  /** Soft decay — % of score removed per day of inactivity. */
  decayPerDayPct: 5,
  /** Days of inactivity before decay starts ("grace period"). */
  decayGraceDays: 2,
  /** Score floor — momentum never decays below this. */
  floor: 0,
};

export interface MomentumTier {
  key: string;
  label: string;
  minScore: number;
  visibilityBoostPct: number;
  chip: string;
}

export const MOMENTUM_TIERS: MomentumTier[] = [
  { key: "cold",      label: "Cold",      minScore: 0,    visibilityBoostPct: 0,  chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { key: "warming",   label: "Warming",   minScore: 25,   visibilityBoostPct: 5,  chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  { key: "hot",       label: "Hot",       minScore: 100,  visibilityBoostPct: 15, chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  { key: "blazing",   label: "Blazing",   minScore: 300,  visibilityBoostPct: 25, chip: "bg-orange-500/15 text-orange-600 dark:text-orange-300" },
  { key: "supernova", label: "Supernova", minScore: 800,  visibilityBoostPct: 40, chip: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" },
];

export function momentumTierFor(score: number): MomentumTier {
  let t = MOMENTUM_TIERS[0];
  for (const x of MOMENTUM_TIERS) if (score >= x.minScore) t = x;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// Loyalty (per-scope progression — feed / community / per-room exists already)
// ─────────────────────────────────────────────────────────────────────────────

export type LoyaltyScope = "chatroom" | "feed" | "community";

export interface LoyaltyRank {
  level: number;
  name: string;
  minPoints: number;
  chip: string;
}

export const LOYALTY_RANKS: LoyaltyRank[] = [
  { level: 1, name: "Newcomer",  minPoints: 0,    chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { level: 2, name: "Regular",   minPoints: 100,  chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  { level: 3, name: "Devoted",   minPoints: 500,  chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  { level: 4, name: "Veteran",   minPoints: 1500, chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  { level: 5, name: "Legend",    minPoints: 5000, chip: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" },
];

export function loyaltyRankFor(points: number): LoyaltyRank {
  let r = LOYALTY_RANKS[0];
  for (const l of LOYALTY_RANKS) if (points >= l.minPoints) r = l;
  return r;
}

export const LOYALTY_DEFAULTS = {
  /** Points per action, per scope. Reuses existing message/feed/comment events. */
  gains: {
    chatroom: { message: 1, dailyCap: 80 },
    feed:     { post: 5, reaction: 1, comment: 2, dailyCap: 60 },
    community:{ daily_login: 5, mission: 5, dailyCap: 50 },
  },
  /** Loyalty NEVER decays. Inactivity only pauses growth. */
  pausesAfterDays: 7,
};

// ─────────────────────────────────────────────────────────────────────────────
// Energy (optional bonus multiplier — affects BONUS rewards only, not base)
// ─────────────────────────────────────────────────────────────────────────────

export const ENERGY_DEFAULTS = {
  max: 100,
  /** Energy per hour of activity (capped at max). */
  regenPerHour: 10,
  /** Energy lost per full day of inactivity. */
  decayPerDay: 15,
  /** Restore sources — single-shot boosts when these events fire. */
  restore: {
    login_daily: 25,
    post: 5,
    chat_message: 1,
    mission_completed: 10,
  } as Record<string, number>,
};

/** Bonus multiplier curve — energy never reduces base earn rates below 1.0. */
export const ENERGY_TIERS: { minEnergy: number; bonusMultiplier: number; label: string }[] = [
  { minEnergy: 100, bonusMultiplier: 1.5, label: "Full Bonus" },
  { minEnergy: 75,  bonusMultiplier: 1.25, label: "Normal" },
  { minEnergy: 50,  bonusMultiplier: 1.1,  label: "Reduced Bonus" },
  { minEnergy: 25,  bonusMultiplier: 1.05, label: "Minimal Bonus" },
  { minEnergy: 0,   bonusMultiplier: 1.0,  label: "Base Only" },
];

export function energyBonusFor(energy: number) {
  for (const t of ENERGY_TIERS) if (energy >= t.minEnergy) return t;
  return ENERGY_TIERS[ENERGY_TIERS.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregate config (what gets persisted to app_settings.retention)
// ─────────────────────────────────────────────────────────────────────────────

export interface RetentionConfig {
  modules: {
    activity: boolean;
    momentum: boolean;
    loyalty: boolean;
    energy: boolean;
  };
  streaks: typeof STREAK_DEFAULTS;
  momentum: typeof MOMENTUM_DEFAULTS;
  loyalty: typeof LOYALTY_DEFAULTS;
  energy: typeof ENERGY_DEFAULTS;
}

export const RETENTION_DEFAULTS: RetentionConfig = {
  modules: {
    activity: true,
    momentum: false,
    loyalty: true,
    energy: false,
  },
  streaks: STREAK_DEFAULTS,
  momentum: MOMENTUM_DEFAULTS,
  loyalty: LOYALTY_DEFAULTS,
  energy: ENERGY_DEFAULTS,
};
