/**
 * Journey & Progressive Unlock helpers — pure data + selectors.
 *
 * This layer sits on top of the existing XP / Level / Achievements /
 * Unlocks systems (see `progression-config.ts`, `economy-config.ts`,
 * `achievements.ts`). It does NOT introduce a new currency or
 * duplicate logic — it only re-frames what already exists as
 * "Journey Stages", "Next Unlock" and "Feature Locked" views so the
 * user always knows what's ahead.
 */
import {
  UNLOCKS,
  resolveUnlock,
  type ProgressionConfig,
  type UnlockDefinition,
  type UnlockKey,
} from "./progression-config";

/** XP per level — matches `missions.functions.ts` (`floor(xp/50)+1`). */
export const XP_PER_LEVEL = 50;

/** A named phase of the user's journey, mapped from raw level. */
export interface JourneyStage {
  id: string;
  emoji: string;
  name: string;
  description: string;
  minLevel: number;
  accent: string; // Tailwind text/background classes
}

export const JOURNEY_STAGES: JourneyStage[] = [
  { id: "explorer",   emoji: "🌱", name: "Explorer",   minLevel: 1,   accent: "from-emerald-500/20 to-teal-500/10 text-emerald-700 dark:text-emerald-300",   description: "Browse the platform and get familiar with the community." },
  { id: "socializer", emoji: "🤝", name: "Socializer", minLevel: 5,   accent: "from-sky-500/20 to-indigo-500/10 text-sky-700 dark:text-sky-300",              description: "React, reply and connect with other members." },
  { id: "creator",    emoji: "✍",  name: "Creator",    minLevel: 10,  accent: "from-violet-500/20 to-purple-500/10 text-violet-700 dark:text-violet-300",    description: "Publish posts, polls and poetry to the community." },
  { id: "challenger", emoji: "⚔",  name: "Challenger", minLevel: 20,  accent: "from-orange-500/20 to-amber-500/10 text-orange-700 dark:text-orange-300",    description: "Enter competitions, battles and community events." },
  { id: "champion",   emoji: "🏆", name: "Champion",   minLevel: 50,  accent: "from-yellow-500/25 to-amber-500/10 text-yellow-700 dark:text-yellow-300",    description: "Earn recognition, veteran rooms and elite cosmetics." },
  { id: "legend",     emoji: "👑", name: "Legend",     minLevel: 100, accent: "from-fuchsia-500/25 to-violet-500/15 text-fuchsia-700 dark:text-fuchsia-200", description: "Platform-wide recognition and early access privileges." },
];

export function stageForLevel(level: number): JourneyStage {
  let out = JOURNEY_STAGES[0];
  for (const s of JOURNEY_STAGES) if (level >= s.minLevel) out = s;
  return out;
}

export function nextStage(level: number): JourneyStage | null {
  return JOURNEY_STAGES.find((s) => s.minLevel > level) ?? null;
}

export interface XpBreakdown {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  xpToNext: number;
  pct: number; // 0-100
}

export function xpBreakdown(xp: number, level: number): XpBreakdown {
  const floor = (level - 1) * XP_PER_LEVEL;
  const xpIntoLevel = Math.max(0, xp - floor);
  const xpForLevel = XP_PER_LEVEL;
  const xpToNext = Math.max(0, xpForLevel - xpIntoLevel);
  return {
    level,
    xp,
    xpIntoLevel,
    xpForLevel,
    xpToNext,
    pct: Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)),
  };
}

/** Resolved unlock, enriched with progress information for a given user level. */
export interface ResolvedUnlock {
  def: UnlockDefinition;
  requiredLevel: number;
  enabled: boolean;
  unlocked: boolean;
  xpRemaining: number;
  progressPct: number;
}

export function resolveAllUnlocks(userLevel: number, userXp: number, cfg: ProgressionConfig): ResolvedUnlock[] {
  return UNLOCKS.map((def) => {
    const { level, enabled } = resolveUnlock(def.key, cfg);
    const requiredXp = (level - 1) * XP_PER_LEVEL;
    const xpRemaining = Math.max(0, requiredXp - userXp);
    const unlocked = enabled && userLevel >= level;
    const progressPct = requiredXp <= 0 ? 100 : Math.min(100, Math.round((userXp / requiredXp) * 100));
    return { def, requiredLevel: level, enabled, unlocked, xpRemaining, progressPct };
  });
}

export function nextUnlock(userLevel: number, userXp: number, cfg: ProgressionConfig): ResolvedUnlock | null {
  const locked = resolveAllUnlocks(userLevel, userXp, cfg)
    .filter((u) => u.enabled && !u.unlocked)
    .sort((a, b) => a.requiredLevel - b.requiredLevel || a.xpRemaining - b.xpRemaining);
  return locked[0] ?? null;
}

export function upcomingUnlocks(userLevel: number, userXp: number, cfg: ProgressionConfig, count = 5): ResolvedUnlock[] {
  return resolveAllUnlocks(userLevel, userXp, cfg)
    .filter((u) => u.enabled && !u.unlocked)
    .sort((a, b) => a.requiredLevel - b.requiredLevel)
    .slice(0, count);
}

/** Lightweight "discovery" missions — read-only, evaluated client-side from
 * public profile shape. These do not award XP by themselves; they simply
 * nudge new users through the surfaces that already exist. Actual XP is
 * awarded by the existing engines (missions, gamification, feed, etc.). */
export interface DiscoveryMission {
  id: string;
  label: string;
  description: string;
  cta: { label: string; to: string };
  done: (u: { messageCount?: number; friends?: string[]; avatarUrl?: string; badges?: string[] }) => boolean;
}

export const DISCOVERY_MISSIONS: DiscoveryMission[] = [
  { id: "upload_avatar",    label: "Upload your avatar",        description: "Give your profile a face.",              cta: { label: "Edit profile", to: "/settings" }, done: (u) => Boolean(u.avatarUrl) },
  { id: "first_message",    label: "Send your first message",   description: "Say hi in any chatroom.",                cta: { label: "Open chatrooms", to: "/chatrooms" }, done: (u) => (u.messageCount ?? 0) >= 1 },
  { id: "follow_creator",   label: "Follow a creator",          description: "Discover writers you love.",             cta: { label: "Open Poetry", to: "/poetry" }, done: (u) => (u.friends?.length ?? 0) >= 1 },
  { id: "visit_hof",        label: "Visit Hall of Fame",        description: "See the platform's champions.",          cta: { label: "Hall of Fame", to: "/hall-of-fame" }, done: () => false },
  { id: "visit_battle_hub", label: "Open the Battle Hub",       description: "See what competitions are live.",        cta: { label: "Battle Hub", to: "/competitions" }, done: () => false },
  { id: "read_poem",        label: "Read a poem",               description: "Explore the Poetry Hub.",                cta: { label: "Open Poetry", to: "/poetry" }, done: () => false },
];

/** Format an unlock key into a short reason string for the locked overlay. */
export function unlockReason(u: ResolvedUnlock): string {
  if (u.unlocked) return "Unlocked";
  if (!u.enabled) return "Currently disabled";
  return `Unlocks at Level ${u.requiredLevel}`;
}

export type { UnlockKey };
