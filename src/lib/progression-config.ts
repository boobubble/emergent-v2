/**
 * Centralized Level, Reputation, Permissions & Unlocks framework.
 *
 * This file is data + types only. It does NOT modify any working system:
 *  - XP, coins, levels and existing rewards keep their current logic.
 *  - This layer adds a configurable "what level unlocks what" registry
 *    that future UIs/services can consult through `useUnlock(key)`.
 *
 * Persistence: admin overrides live under `app_settings.progression`.
 */

export type UnlockKey =
  // Level 1 — New Member (baseline; included for completeness)
  | "msg.send"
  | "feed.post.create"
  | "feed.react"
  | "msg.react"
  | "profile.avatar.upload"

  // Level 5 — Active Member (message control + ignore + status)
  | "msg.reply"
  | "msg.edit.own"
  | "msg.delete.own"
  | "msg.quote"
  | "msg.copyLink"
  | "user.ignore"
  | "bot.ignore"
  | "profile.status.custom"

  // Level 10 — Trusted Member
  | "coins.gift"
  | "feed.poll.create"
  | "comment.gif"
  | "profile.cover.upload"
  | "reactions.extra"
  | "user.favorite"
  | "room.favorite"

  // Level 20 — Community Member
  | "community.poll.create"
  | "feed.post.pin.own"
  | "profile.theme.custom"
  | "profile.achievements.showcase"
  | "events.bonus"

  // Level 30 — Creator
  | "creator.badge"
  | "creator.leaderboard"
  | "creator.rankProgression"
  | "creator.analytics"
  | "creator.profileSection"
  | "creator.featuredEligible"

  // Level 50 — Veteran
  | "veteran.badge"
  | "rewards.dailyBonus"
  | "rooms.veteran"
  | "gifts.packs"
  | "cosmetics.advanced"
  | "reactions.special"

  // Level 75 — Elite
  | "profile.effects.elite"
  | "emoji.exclusive"
  | "cosmetics.rare"
  | "events.multiplier"
  | "rooms.elite"

  // Level 100 — Legend
  | "legend.badge"
  | "profile.frame.legend"
  | "coins.gift.higherLimits"
  | "legend.recognition"
  | "legend.earlyAccess"

  // User control powers (cross-cutting; gated by level too)
  | "room.mute"
  | "dm.block"
  | "notif.preferences";

export interface UnlockDefinition {
  key: UnlockKey;
  label: string;
  description: string;
  /** Default minimum level required. Overridable per-deployment. */
  defaultLevel: number;
  /** Whether the unlock is on by default. Admins can toggle off entirely. */
  defaultEnabled: boolean;
  category: "messaging" | "social" | "profile" | "creator" | "economy" | "cosmetic" | "control" | "events";
  tier: 1 | 5 | 10 | 20 | 30 | 50 | 75 | 100;
}

export const UNLOCKS: UnlockDefinition[] = [
  // ── Level 1 ───────────────────────────────────────────────
  { key: "msg.send",                tier: 1,  defaultLevel: 1,  defaultEnabled: true, category: "messaging", label: "Send messages",        description: "Post messages in chatrooms." },
  { key: "feed.post.create",        tier: 1,  defaultLevel: 1,  defaultEnabled: true, category: "social",    label: "Create posts",         description: "Publish to the social feed." },
  { key: "feed.react",              tier: 1,  defaultLevel: 1,  defaultEnabled: true, category: "social",    label: "React to posts",       description: "Like/react to feed posts." },
  { key: "msg.react",               tier: 1,  defaultLevel: 1,  defaultEnabled: true, category: "messaging", label: "React to messages",    description: "Add emoji reactions to chat messages." },
  { key: "profile.avatar.upload",   tier: 1,  defaultLevel: 1,  defaultEnabled: true, category: "profile",   label: "Upload avatar",        description: "Upload a custom avatar image." },

  // ── Level 5 ───────────────────────────────────────────────
  { key: "msg.reply",               tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "messaging", label: "Reply to messages",    description: "Thread a reply to another message." },
  { key: "msg.edit.own",            tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "messaging", label: "Edit own messages",    description: "Edit your own chat messages within the time limit." },
  { key: "msg.delete.own",          tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "messaging", label: "Delete own messages",  description: "Delete your own chat messages within the time limit." },
  { key: "msg.quote",               tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "messaging", label: "Quote messages",       description: "Insert a quoted snippet of another message." },
  { key: "msg.copyLink",            tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "messaging", label: "Copy message links",   description: "Copy a deep link to any chat message." },
  { key: "user.ignore",             tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "control",   label: "Ignore users",         description: "Hide messages from specific users in chat." },
  { key: "bot.ignore",              tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "control",   label: "Ignore bots",          description: "Hide messages from chat bots." },
  { key: "profile.status.custom",   tier: 5,  defaultLevel: 5,  defaultEnabled: true, category: "profile",   label: "Custom profile status",description: "Set a free-form profile status." },

  // ── Level 10 ──────────────────────────────────────────────
  { key: "coins.gift",              tier: 10, defaultLevel: 10, defaultEnabled: true, category: "economy",   label: "Gift coins",           description: "Send coins to another user." },
  { key: "feed.poll.create",        tier: 10, defaultLevel: 10, defaultEnabled: true, category: "social",    label: "Create polls",         description: "Publish a poll post in the feed." },
  { key: "comment.gif",             tier: 10, defaultLevel: 10, defaultEnabled: true, category: "social",    label: "GIF comments",         description: "Attach GIFs in comments." },
  { key: "profile.cover.upload",    tier: 10, defaultLevel: 10, defaultEnabled: true, category: "profile",   label: "Upload cover image",   description: "Upload a profile cover banner." },
  { key: "reactions.extra",         tier: 10, defaultLevel: 10, defaultEnabled: true, category: "cosmetic",  label: "Extra reactions",      description: "Unlock additional reaction emoji." },
  { key: "user.favorite",           tier: 10, defaultLevel: 10, defaultEnabled: true, category: "control",   label: "Favorite users",       description: "Pin users to a personal favorites list." },
  { key: "room.favorite",           tier: 10, defaultLevel: 10, defaultEnabled: true, category: "control",   label: "Favorite rooms",       description: "Pin rooms to a personal favorites list." },

  // ── Level 20 ──────────────────────────────────────────────
  { key: "community.poll.create",   tier: 20, defaultLevel: 20, defaultEnabled: true, category: "social",    label: "Community polls",      description: "Open polls that target the wider community." },
  { key: "feed.post.pin.own",       tier: 20, defaultLevel: 20, defaultEnabled: true, category: "social",    label: "Pin own feed post",    description: "Pin one of your own posts to your profile." },
  { key: "profile.theme.custom",    tier: 20, defaultLevel: 20, defaultEnabled: true, category: "profile",   label: "Custom profile theme", description: "Customize profile colors/theme." },
  { key: "profile.achievements.showcase", tier: 20, defaultLevel: 20, defaultEnabled: true, category: "profile", label: "Achievements showcase", description: "Showcase selected achievements on your profile." },
  { key: "events.bonus",            tier: 20, defaultLevel: 20, defaultEnabled: true, category: "events",    label: "Event participation bonus", description: "Earn extra rewards in community events." },

  // ── Level 30 ──────────────────────────────────────────────
  { key: "creator.badge",           tier: 30, defaultLevel: 30, defaultEnabled: true, category: "creator",   label: "Creator badge",        description: "Display the Creator badge on your profile." },
  { key: "creator.leaderboard",     tier: 30, defaultLevel: 30, defaultEnabled: true, category: "creator",   label: "Creator leaderboard",  description: "Appear on the creator leaderboard." },
  { key: "creator.rankProgression", tier: 30, defaultLevel: 30, defaultEnabled: true, category: "creator",   label: "Creator rank progression", description: "Progress through creator ranks." },
  { key: "creator.analytics",       tier: 30, defaultLevel: 30, defaultEnabled: true, category: "creator",   label: "Creator analytics",    description: "Access analytics on your posts and reach." },
  { key: "creator.profileSection",  tier: 30, defaultLevel: 30, defaultEnabled: true, category: "creator",   label: "Creator profile section", description: "Show a dedicated creator section on your profile." },
  { key: "creator.featuredEligible",tier: 30, defaultLevel: 30, defaultEnabled: true, category: "creator",   label: "Featured creator eligibility", description: "Become eligible for the featured creator slot." },

  // ── Level 50 ──────────────────────────────────────────────
  { key: "veteran.badge",           tier: 50, defaultLevel: 50, defaultEnabled: true, category: "cosmetic",  label: "Veteran badge",        description: "Display the Veteran badge." },
  { key: "rewards.dailyBonus",      tier: 50, defaultLevel: 50, defaultEnabled: true, category: "economy",   label: "Daily bonus rewards",  description: "Receive an extra daily login bonus." },
  { key: "rooms.veteran",           tier: 50, defaultLevel: 50, defaultEnabled: true, category: "social",    label: "Veteran rooms",        description: "Access veteran-only chatrooms." },
  { key: "gifts.packs",             tier: 50, defaultLevel: 50, defaultEnabled: true, category: "economy",   label: "Gift packs",           description: "Send curated gift packs to others." },
  { key: "cosmetics.advanced",      tier: 50, defaultLevel: 50, defaultEnabled: true, category: "cosmetic",  label: "Advanced cosmetics",   description: "Equip advanced profile cosmetics." },
  { key: "reactions.special",       tier: 50, defaultLevel: 50, defaultEnabled: true, category: "cosmetic",  label: "Special reaction packs", description: "Unlock special reaction packs." },

  // ── Level 75 ──────────────────────────────────────────────
  { key: "profile.effects.elite",   tier: 75, defaultLevel: 75, defaultEnabled: true, category: "cosmetic",  label: "Elite profile effects",description: "Display elite-only animated effects." },
  { key: "emoji.exclusive",         tier: 75, defaultLevel: 75, defaultEnabled: true, category: "cosmetic",  label: "Exclusive emoji packs",description: "Use exclusive emoji packs." },
  { key: "cosmetics.rare",          tier: 75, defaultLevel: 75, defaultEnabled: true, category: "cosmetic",  label: "Rare cosmetics",       description: "Equip rare cosmetic items." },
  { key: "events.multiplier",       tier: 75, defaultLevel: 75, defaultEnabled: true, category: "events",    label: "Event reward multiplier", description: "Earn multiplier on event rewards." },
  { key: "rooms.elite",             tier: 75, defaultLevel: 75, defaultEnabled: true, category: "social",    label: "Elite room access",    description: "Enter elite-only chatrooms." },

  // ── Level 100 ─────────────────────────────────────────────
  { key: "legend.badge",            tier: 100,defaultLevel: 100,defaultEnabled: true, category: "cosmetic",  label: "Legend badge",         description: "Display the Legend badge." },
  { key: "profile.frame.legend",    tier: 100,defaultLevel: 100,defaultEnabled: true, category: "cosmetic",  label: "Legend profile frame", description: "Equip the exclusive Legend avatar frame." },
  { key: "coins.gift.higherLimits", tier: 100,defaultLevel: 100,defaultEnabled: true, category: "economy",   label: "Higher gifting limits",description: "Raised daily coin gifting cap." },
  { key: "legend.recognition",      tier: 100,defaultLevel: 100,defaultEnabled: true, category: "social",    label: "Platform-wide recognition", description: "Highlighted across community surfaces." },
  { key: "legend.earlyAccess",      tier: 100,defaultLevel: 100,defaultEnabled: true, category: "events",    label: "Early-access features",description: "Eligible for early access to new features." },

  // ── Cross-cutting control powers ─────────────────────────
  { key: "room.mute",               tier: 5,  defaultLevel: 1,  defaultEnabled: true, category: "control",   label: "Mute rooms",           description: "Mute notifications from a room." },
  { key: "dm.block",                tier: 5,  defaultLevel: 1,  defaultEnabled: true, category: "control",   label: "Block DMs",            description: "Block direct messages from a user." },
  { key: "notif.preferences",       tier: 5,  defaultLevel: 1,  defaultEnabled: true, category: "control",   label: "Notification preferences", description: "Configure personal notification settings." },
];

/** Friendly tier metadata (display only). */
export interface LevelTier {
  level: number;
  name: string;
  chip: string;
  description: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1,   name: "New Member",       chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300",       description: "Baseline messaging and posting." },
  { level: 5,   name: "Active Member",    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300",             description: "Message control + ignore powers." },
  { level: 10,  name: "Trusted Member",   chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", description: "Coin gifting, polls, cover image." },
  { level: 20,  name: "Community Member", chip: "bg-teal-500/15 text-teal-700 dark:text-teal-300",          description: "Community polls + custom theme." },
  { level: 30,  name: "Creator",          chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300",    description: "Creator tools and analytics." },
  { level: 50,  name: "Veteran",          chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",       description: "Veteran rooms, daily bonus, gift packs." },
  { level: 75,  name: "Elite",            chip: "bg-orange-500/15 text-orange-700 dark:text-orange-300",    description: "Elite effects and rare cosmetics." },
  { level: 100, name: "Legend",           chip: "bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-700 dark:text-fuchsia-200", description: "Platform-wide recognition." },
];

/** Admin-tunable behaviour. Persisted under `app_settings.progression`. */
export interface ProgressionConfig {
  modules: {
    /** Master switch — when off, all unlocks default to ON regardless of level. */
    unlocks: boolean;
    /** Show level-gated messaging affordances (reply/edit/delete/quote). */
    messageControl: boolean;
    /** Surface creator rank UI. */
    creatorRanks: boolean;
    /** Surface reputation/loyalty/veteran badges. */
    socialStatus: boolean;
  };
  message: {
    /** Minutes after send that the author can still edit. 0 = unlimited. */
    editTimeLimitMins: number;
    /** Minutes after send that the author can still delete. 0 = unlimited. */
    deleteTimeLimitMins: number;
    /** Future: enable "unsend" (recall) of delivered messages. */
    unsendEnabled: boolean;
  };
  gifting: {
    /** Daily cap on coin gifting (per sender). */
    dailyCap: number;
    /** Multiplier applied at Legend tier. */
    legendMultiplier: number;
    /** Min level required to gift coins (overrides unlock map). 0 = use unlock map. */
    minLevelOverride: number;
  };
  /** Per-unlock overrides: level number to require & whether the unlock is enabled. */
  unlocks: Partial<Record<UnlockKey, { level?: number; enabled?: boolean }>>;
}

export const PROGRESSION_DEFAULTS: ProgressionConfig = {
  modules: {
    unlocks: true,
    messageControl: true,
    creatorRanks: true,
    socialStatus: true,
  },
  message: {
    editTimeLimitMins: 15,
    deleteTimeLimitMins: 60,
    unsendEnabled: false,
  },
  gifting: {
    dailyCap: 500,
    legendMultiplier: 3,
    minLevelOverride: 0,
  },
  unlocks: {},
};

/** Resolve the effective unlock entry (default merged with admin overrides). */
export function resolveUnlock(
  key: UnlockKey,
  cfg: ProgressionConfig,
): { level: number; enabled: boolean; def: UnlockDefinition | undefined } {
  const def = UNLOCKS.find((u) => u.key === key);
  const ov = cfg.unlocks[key] ?? {};
  return {
    level: ov.level ?? def?.defaultLevel ?? 1,
    enabled: ov.enabled ?? def?.defaultEnabled ?? true,
    def,
  };
}

/** Pure helper — can the given level use the given unlock under config? */
export function canUseUnlock(level: number, key: UnlockKey, cfg: ProgressionConfig): boolean {
  if (!cfg.modules.unlocks) return true;
  const { level: minLevel, enabled } = resolveUnlock(key, cfg);
  return enabled && level >= minLevel;
}
