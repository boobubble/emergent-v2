import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type FeedSort = "smart" | "latest" | "trending";
export type DefaultTab = "foryou" | "trending" | "latest" | "friends";
export type DefaultPrivacy = "public" | "friends";

/** How the feed list queries additional pages from `posts_safe`. */
export type FeedFetchMode = "chronological" | "trending";

/**
 * Preferences consumed by the feed list (pagination, ranking, filters).
 * Other `FeedPrefs` fields remain stored for settings/composer and later batches.
 */
export const FEED_LIST_CONSUMED_PREFS = [
  "defaultTab",
  "sortOverride",
  "hideMedia",
  "mutedKeywords",
  "mutedHashtags",
] as const satisfies readonly (keyof FeedPrefs)[];

export interface FeedPrefs {
  /** Initial tab on feed mount — consumed by feed list. */
  defaultTab: DefaultTab;
  /** Overrides tab sort when not `smart` — consumed by feed list fetch + display. */
  sortOverride: FeedSort;
  compactCards: boolean;
  hideCounts: boolean;
  /** Hides media posts client-side — consumed by feed list. */
  hideMedia: boolean;
  autoplayVideos: boolean;
  postSound: boolean;
  emojiEffects: boolean;
  defaultPrivacy: DefaultPrivacy;
  anonymousByDefault: boolean;
  /** Hide posts containing these words — consumed by feed list. */
  mutedKeywords: string[];
  /** Hide posts with these tags (without #) — consumed by feed list. */
  mutedHashtags: string[];
  notifyFriendPosts: boolean;
  notifyComments: boolean;
  notifyReactions: boolean;
  notifyDMs: boolean;
}

/** Tab keys that render the main post stream (not Saved / Notifications stubs). */
export type FeedStreamTab = DefaultTab | "saved" | "notifications";

/** Resolve the active sort: `sortOverride` wins unless it is `smart`. */
export function getEffectiveFeedSort(
  tab: FeedStreamTab,
  sortOverride: FeedSort,
): FeedSort | "friends" | "saved" | "notifications" | "foryou" {
  if (tab === "saved") return "saved";
  if (tab === "notifications") return "notifications";
  if (tab === "friends") return "friends";
  if (sortOverride !== "smart") return sortOverride;
  return tab;
}

/** DB fetch order for the next page — Trending uses `trending_score`, others use `created_at`. */
export function getFeedFetchMode(tab: FeedStreamTab, sortOverride: FeedSort): FeedFetchMode {
  if (tab === "saved" || tab === "notifications") return "chronological";
  const effective = getEffectiveFeedSort(tab, sortOverride);
  if (effective === "trending") return "trending";
  return "chronological";
}

const DEFAULTS: FeedPrefs = {
  defaultTab: "foryou",
  sortOverride: "smart",
  compactCards: false,
  hideCounts: false,
  hideMedia: false,
  autoplayVideos: true,
  postSound: true,
  emojiEffects: true,
  defaultPrivacy: "public",
  anonymousByDefault: false,
  mutedKeywords: [],
  mutedHashtags: [],
  notifyFriendPosts: true,
  notifyComments: true,
  notifyReactions: true,
  notifyDMs: true,
};

const KEY = "palrgo:feed-prefs:v1";

function sanitizePrefs(raw: Partial<FeedPrefs>): FeedPrefs {
  const defaultTab = ["foryou", "trending", "latest", "friends"].includes(raw.defaultTab ?? "") ? raw.defaultTab! : DEFAULTS.defaultTab;
  const sortOverride = ["smart", "latest", "trending"].includes(raw.sortOverride ?? "") ? raw.sortOverride! : DEFAULTS.sortOverride;
  const defaultPrivacy = ["public", "friends"].includes(raw.defaultPrivacy ?? "") ? raw.defaultPrivacy! : DEFAULTS.defaultPrivacy;

  return {
    ...DEFAULTS,
    ...raw,
    defaultTab,
    sortOverride,
    defaultPrivacy,
    mutedKeywords: Array.isArray(raw.mutedKeywords) ? raw.mutedKeywords.filter((v): v is string => typeof v === "string") : [],
    mutedHashtags: Array.isArray(raw.mutedHashtags) ? raw.mutedHashtags.filter((v): v is string => typeof v === "string") : [],
  };
}

function load(): FeedPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return sanitizePrefs(JSON.parse(raw) as Partial<FeedPrefs>);
  } catch {
    return DEFAULTS;
  }
}

interface Ctx {
  prefs: FeedPrefs;
  setPrefs: (patch: Partial<FeedPrefs>) => void;
  reset: () => void;
}

const FeedPrefsCtx = createContext<Ctx | null>(null);

export function FeedPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setState] = useState<FeedPrefs>(DEFAULTS);

  useEffect(() => { setState(load()); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }, [prefs]);

  const value = useMemo<Ctx>(() => ({
    prefs,
    setPrefs: (patch) => setState(p => ({ ...p, ...patch })),
    reset: () => setState(DEFAULTS),
  }), [prefs]);

  return <FeedPrefsCtx.Provider value={value}>{children}</FeedPrefsCtx.Provider>;
}

export function useFeedPrefs(): Ctx {
  const ctx = useContext(FeedPrefsCtx);
  if (!ctx) {
    // Safe fallback so components don't crash if used outside provider
    return { prefs: DEFAULTS, setPrefs: () => {}, reset: () => {} };
  }
  return ctx;
}
