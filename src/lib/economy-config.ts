/**
 * Economy tuning. All rates, caps, costs, cooldowns live here so they're easy
 * to balance without touching server logic. Pure module — safe to import on
 * the client (used by UI to show prices, mission targets, rank thresholds).
 */

/** Coins/XP earned per action. Server enforces caps below. */
export const EARN = {
  // Chat
  chat_message: { coins: 1, xp: 1, cooldownMs: 8_000, dailyCap: 80 },
  chat_reply:   { coins: 2, xp: 1, cooldownMs: 8_000, dailyCap: 40 }, // reply to another user

  // Feed (actor side — the one doing the action)
  feed_reaction_actor: { coins: 0, xp: 1, dailyCap: 50 },
  feed_comment_actor:  { coins: 1, xp: 2, dailyCap: 30 },

  // Feed (owner side — author of the post receiving engagement)
  feed_reaction_owner: { coins: 1, xp: 1, dailyCapPerPost: 30 },
  feed_comment_owner:  { coins: 2, xp: 2, dailyCapPerPost: 20 },
  feed_share_owner:    { coins: 5, xp: 3, dailyCapPerPost: 10 },
} as const;

/** Coin costs for spending. */
export const SPEND = {
  highlight_message: { coins: 15, durationMs: 60 * 60 * 1000 }, // 1h
  boost_post:        { coins: 25, scoreDelta: 30 },
} as const;

/** Room loyalty progression. Level up by accumulating messages in a room. */
export interface RoomLoyaltyLevel {
  level: number;
  name: string;
  minMsgs: number;
  chip: string;
}
export const ROOM_LOYALTY_LEVELS: RoomLoyaltyLevel[] = [
  { level: 1, name: "Newcomer",  minMsgs: 0,    chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { level: 2, name: "Regular",   minMsgs: 50,   chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  { level: 3, name: "Local",     minMsgs: 200,  chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  { level: 4, name: "Veteran",   minMsgs: 500,  chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  { level: 5, name: "Legend",    minMsgs: 1500, chip: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" },
];

export function roomLoyaltyFor(totalMessages: number): RoomLoyaltyLevel {
  let r = ROOM_LOYALTY_LEVELS[0];
  for (const l of ROOM_LOYALTY_LEVELS) if (totalMessages >= l.minMsgs) r = l;
  return r;
}

/** Creator ranks — based on rolling 7-day engagement score. */
export interface CreatorRank {
  title: string;
  minScore: number;
  chip: string;
  color: string;
}
export const CREATOR_RANKS: CreatorRank[] = [
  { title: "Newcomer",         minScore: 0,    chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300",  color: "text-slate-500" },
  { title: "Rising Creator",   minScore: 25,   chip: "bg-sky-500/15 text-sky-600 dark:text-sky-300",        color: "text-sky-500" },
  { title: "Trending Creator", minScore: 100,  chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300", color: "text-emerald-500" },
  { title: "Viral Creator",    minScore: 300,  chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300",  color: "text-amber-500" },
  { title: "Elite Poster",     minScore: 800,  chip: "bg-orange-500/15 text-orange-600 dark:text-orange-300", color: "text-orange-500" },
  { title: "Legendary",        minScore: 2000, chip: "bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-600 dark:text-fuchsia-300", color: "text-fuchsia-500" },
];

export function creatorRankFor(score: number): CreatorRank {
  let r = CREATOR_RANKS[0];
  for (const x of CREATOR_RANKS) if (score >= x.minScore) r = x;
  return r;
}

/** Engagement score weights — used for trending + creator rank. */
export const SCORE_WEIGHTS = {
  reaction: 1,
  comment: 3,
  share: 5,
  boost: 10, // per coin spent / 25
} as const;

/** Daily missions. Each mission can be claimed once per UTC day. */
export interface MissionDef {
  id: string;
  title: string;
  description: string;
  target: number;
  coins: number;
  xp: number;
  icon: string; // emoji
}

export const DAILY_MISSIONS: MissionDef[] = [
  { id: "react_5",       title: "Show some love",   description: "React to 5 posts",            target: 5,  coins: 10, xp: 10, icon: "❤️" },
  { id: "comment_3",     title: "Join the chat",    description: "Comment on 3 posts",          target: 3,  coins: 15, xp: 15, icon: "💬" },
  { id: "chat_10",       title: "Stay social",      description: "Send 10 chat messages",       target: 10, coins: 10, xp: 10, icon: "💭" },
  { id: "post_1",        title: "Share something",  description: "Create 1 post",               target: 1,  coins: 20, xp: 20, icon: "📝" },
  { id: "engage_15",     title: "Community builder", description: "Earn 15 engagements on your posts (reactions+comments)", target: 15, coins: 30, xp: 25, icon: "🚀" },
];

export const MISSION_BY_ID: Record<string, MissionDef> = Object.fromEntries(
  DAILY_MISSIONS.map((m) => [m.id, m]),
);

/** Daily viral jackpot — top trending post of the day wins. */
export const VIRAL_JACKPOT = {
  coins: 250,
  xp: 100,
  minScore: 50, // post must be at least somewhat trending
} as const;

// ============================================================
// Centralized economy rules engine config (foundation only).
// Read by the admin Economy page and future server fns as the
// single source of truth. Persisted under app_settings.economy.
// Does NOT replace the constants above (EARN/SPEND/etc.) which
// remain authoritative for current XP/coin/streak systems.
// ============================================================

export interface EconomyConfig {
  modules: {
    chatXp: boolean;
    feedXp: boolean;
    coinRewards: boolean;
    streakRewards: boolean;
    creatorRewards: boolean;
    loyaltyRewards: boolean;
    dailyMissions: boolean;
  };
  chatXp:  { perMessage: number; dailyCap: number; cooldownSec: number };
  feedXp:  { perPost: number; perComment: number; perReactionReceived: number; dailyCap: number };
  coins:   { perLevel: number; perDailyLogin: number; perFriendInvite: number };
  streaks: { dailyLoginBonusCoins: number; milestoneBonusCoins: Record<string, number> };
  creator: { tipMinCoins: number; tipMaxCoins: number; platformCutPct: number };
  loyalty: { perDayActiveCoins: number; weeklyBonusCoins: number };
  missions:{ enabledCount: number; refreshHours: number };
}

export const ECONOMY_DEFAULTS: EconomyConfig = {
  modules: {
    chatXp: true, feedXp: true, coinRewards: true, streakRewards: true,
    creatorRewards: false, loyaltyRewards: false, dailyMissions: false,
  },
  chatXp:   { perMessage: 1, dailyCap: 200, cooldownSec: 5 },
  feedXp:   { perPost: 10, perComment: 3, perReactionReceived: 1, dailyCap: 300 },
  coins:    { perLevel: 50, perDailyLogin: 10, perFriendInvite: 25 },
  streaks:  { dailyLoginBonusCoins: 5, milestoneBonusCoins: { "7": 50, "14": 120, "30": 300, "100": 1500 } },
  creator:  { tipMinCoins: 10, tipMaxCoins: 10000, platformCutPct: 10 },
  loyalty:  { perDayActiveCoins: 2, weeklyBonusCoins: 25 },
  missions: { enabledCount: 3, refreshHours: 24 },
};
