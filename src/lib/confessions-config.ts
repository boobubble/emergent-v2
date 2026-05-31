/**
 * Standalone Confessions module — config + types.
 * Stored under `app_settings.confessions`. The actual content lives in
 * the dedicated `confessions` / `confession_replies` / `confession_reactions`
 * tables (see migration). Does NOT touch chatrooms or feed.
 */

export type ConfessionKind = "text" | "poll" | "image" | "question" | "advice";
export type ConfessionStatus = "pending" | "approved" | "rejected";
export type ConfessionDisplayMode =
  | "fully_anonymous"
  | "random_id"
  | "random_avatar"
  | "username";

export type ConfessionReactionType = "like" | "funny" | "shock" | "sad" | "hot" | "love";

export interface ConfessionCategory {
  key: string;
  label: string;
  emoji?: string;
}

export interface ConfessionsConfig {
  /** Master switch. */
  enabled: boolean;
  /** Route slug — "/confessions" or "/confess". UI uses /confessions either way; setting drives label/alias copy. */
  routeSlug: "confessions" | "confess";
  /** Allowed identity display modes. At least one must be true. */
  anonymousModes: Record<ConfessionDisplayMode, boolean>;
  /** Allowed post kinds. */
  kinds: Record<ConfessionKind, boolean>;
  categories: ConfessionCategory[];
  reactions: Record<ConfessionReactionType, boolean>;
  // Engagement
  allowReplies: boolean;
  allowAnonymousReplies: boolean;
  allowReports: boolean;
  // Coins (integrates with existing economy)
  coins: {
    enabled: boolean;
    postCost: number;
    pinCost: number;
    highlightCost: number;
  };
  // XP / Level gating (integrates with existing leveling)
  level: {
    enabled: boolean;
    minLevelToPost: number;
    minLevelForAnonReply: number;
    minLevelForImages: number;
  };
  // Moderation
  moderation: {
    approvalRequired: boolean;
    autoModeration: boolean;
    badWordFilter: boolean;
    linkFilter: boolean;
    spamDetection: boolean;
  };
  // Expiry
  expiry: {
    /** "never" | "24h" | "7d" | "30d" — default for new confessions. */
    defaultMode: "never" | "24h" | "7d" | "30d";
    /** Let users override the expiry per post. */
    userSelectable: boolean;
  };
  // Leaderboards on the confessions page
  leaderboards: {
    trending: boolean;
    mostReplied: boolean;
    mostLiked: boolean;
    dailyPick: boolean;
    weeklyPick: boolean;
  };
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    noindex: boolean;
  };
}

export const DEFAULT_CATEGORIES: ConfessionCategory[] = [
  { key: "love",        label: "Love",            emoji: "❤️" },
  { key: "relationships", label: "Relationships", emoji: "💞" },
  { key: "friendship",  label: "Friendship",      emoji: "🤝" },
  { key: "family",      label: "Family",          emoji: "👪" },
  { key: "secrets",     label: "Secrets",         emoji: "🤫" },
  { key: "advice",      label: "Advice",          emoji: "💡" },
  { key: "funny",       label: "Funny",           emoji: "😂" },
  { key: "school",      label: "School/College",  emoji: "🎓" },
  { key: "work",        label: "Work",            emoji: "💼" },
  { key: "polls",       label: "Polls",           emoji: "📊" },
];

export const REACTION_META: Record<ConfessionReactionType, { emoji: string; label: string }> = {
  like:  { emoji: "❤️", label: "Like" },
  funny: { emoji: "😂", label: "Funny" },
  shock: { emoji: "😮", label: "Shocking" },
  sad:   { emoji: "😢", label: "Sad" },
  hot:   { emoji: "🔥", label: "Hot" },
  love:  { emoji: "🥰", label: "Love" },
};

export const ANIMAL_AVATARS = [
  "🐼", "🦊", "🐯", "🦁", "🐸", "🐵", "🐨", "🐰",
  "🐻", "🦝", "🦄", "🐲", "🐧", "🦉", "🐙", "🦋",
] as const;

export const CONFESSIONS_DEFAULTS: ConfessionsConfig = {
  enabled: true,
  routeSlug: "confessions",
  anonymousModes: {
    fully_anonymous: true,
    random_id: true,
    random_avatar: true,
    username: false,
  },
  kinds: {
    text: true,
    poll: true,
    image: false,
    question: true,
    advice: true,
  },
  categories: DEFAULT_CATEGORIES,
  reactions: {
    like: true, funny: true, shock: true, sad: true, hot: true, love: false,
  },
  allowReplies: true,
  allowAnonymousReplies: true,
  allowReports: true,
  coins: { enabled: true, postCost: 0, pinCost: 20, highlightCost: 50 },
  level: {
    enabled: false,
    minLevelToPost: 1,
    minLevelForAnonReply: 1,
    minLevelForImages: 3,
  },
  moderation: {
    approvalRequired: false,
    autoModeration: true,
    badWordFilter: true,
    linkFilter: true,
    spamDetection: true,
  },
  expiry: { defaultMode: "never", userSelectable: true },
  leaderboards: {
    trending: true,
    mostReplied: true,
    mostLiked: true,
    dailyPick: true,
    weeklyPick: true,
  },
  seo: {
    metaTitle: "Confessions — Share anonymously",
    metaDescription: "A safe space to share secrets, ask for advice, and connect anonymously.",
    keywords: "confessions, anonymous, secrets, advice, community",
    ogTitle: "Confessions",
    ogDescription: "Anonymous community confessions, polls, and questions.",
    ogImage: "",
    noindex: false,
  },
};

export function expiryToTimestamp(mode: ConfessionsConfig["expiry"]["defaultMode"]): string | null {
  if (mode === "never") return null;
  const now = Date.now();
  const ms = mode === "24h" ? 86400000 : mode === "7d" ? 7 * 86400000 : 30 * 86400000;
  return new Date(now + ms).toISOString();
}

export function pickRandomAvatar(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ANIMAL_AVATARS[Math.abs(h) % ANIMAL_AVATARS.length];
}

export function randomConfessorNumber(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 131 + seed.charCodeAt(i)) | 0;
  return (Math.abs(h) % 9000) + 100; // #100–#9099
}
