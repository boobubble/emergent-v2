import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type FeedSort = "smart" | "latest" | "trending";
export type DefaultTab = "foryou" | "trending" | "latest" | "friends";
export type DefaultPrivacy = "public" | "friends";

export interface FeedPrefs {
  defaultTab: DefaultTab;
  sortOverride: FeedSort;
  compactCards: boolean;
  hideCounts: boolean;
  hideMedia: boolean;
  autoplayVideos: boolean;
  postSound: boolean;
  emojiEffects: boolean;
  defaultPrivacy: DefaultPrivacy;
  anonymousByDefault: boolean;
  mutedKeywords: string[];
  mutedHashtags: string[];
  notifyFriendPosts: boolean;
  notifyComments: boolean;
  notifyReactions: boolean;
  notifyDMs: boolean;
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
