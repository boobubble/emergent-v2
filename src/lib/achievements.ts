import type { User } from "./chat-types";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "legendary";
  check: (u: User, ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  roomsJoined: number;
  dmsStarted: number;
}

export const BADGES: Badge[] = [
  { id: "first_message", name: "First Words", emoji: "💬", tier: "bronze",
    description: "Send your first message",
    check: u => (u.messageCount ?? 0) >= 1 },
  { id: "chatterbox", name: "Chatterbox", emoji: "🗣️", tier: "silver",
    description: "Send 50 messages",
    check: u => (u.messageCount ?? 0) >= 50 },
  { id: "veteran", name: "Veteran", emoji: "🎖️", tier: "gold",
    description: "Send 500 messages",
    check: u => (u.messageCount ?? 0) >= 500 },
  { id: "level_5", name: "Rising Star", emoji: "⭐", tier: "bronze",
    description: "Reach level 5",
    check: u => u.level >= 5 },
  { id: "level_10", name: "Hot Streak", emoji: "🌟", tier: "silver",
    description: "Reach level 10",
    check: u => u.level >= 10 },
  { id: "level_25", name: "Legend", emoji: "👑", tier: "legendary",
    description: "Reach level 25",
    check: u => u.level >= 25 },
  { id: "streak_3", name: "Warmed Up", emoji: "🔥", tier: "bronze",
    description: "3-day streak",
    check: u => (u.streak ?? 0) >= 3 || (u.longestStreak ?? 0) >= 3 },
  { id: "streak_7", name: "On Fire", emoji: "🔥🔥", tier: "silver",
    description: "7-day streak",
    check: u => (u.streak ?? 0) >= 7 || (u.longestStreak ?? 0) >= 7 },
  { id: "streak_30", name: "Unstoppable", emoji: "💥", tier: "legendary",
    description: "30-day streak",
    check: u => (u.streak ?? 0) >= 30 || (u.longestStreak ?? 0) >= 30 },
  { id: "explorer", name: "Explorer", emoji: "🧭", tier: "bronze",
    description: "Join 3+ rooms",
    check: (_, c) => c.roomsJoined >= 3 },
  { id: "social", name: "Social Butterfly", emoji: "🦋", tier: "silver",
    description: "Start a direct message",
    check: (_, c) => c.dmsStarted >= 1 },
  { id: "gamer", name: "Gamer", emoji: "🎮", tier: "silver",
    description: "Use 10 chat commands",
    check: u => (u.commandCount ?? 0) >= 10 },
];

export const BADGE_MAP: Record<string, Badge> = Object.fromEntries(
  BADGES.map(b => [b.id, b]),
);

export const TIER_COLOR: Record<Badge["tier"], string> = {
  bronze: "from-amber-500/20 to-amber-700/10 text-amber-700 dark:text-amber-300 border-amber-600/40",
  silver: "from-slate-400/25 to-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-400/50",
  gold: "from-yellow-400/25 to-yellow-600/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/50",
  legendary: "from-fuchsia-500/25 to-violet-600/15 text-fuchsia-700 dark:text-fuchsia-200 border-fuchsia-500/50",
};

export function evaluateBadges(u: User, ctx: BadgeContext): string[] {
  const earned = new Set(u.badges ?? []);
  for (const b of BADGES) if (b.check(u, ctx)) earned.add(b.id);
  return [...earned];
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}
