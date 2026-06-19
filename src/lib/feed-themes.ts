import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";

export type FeedThemeKey =
  | "boobubble_default"
  | "facebook_classic"
  | "instagram"
  | "twitter_x"
  | "reddit"
  | "orkut_retro"
  | "neon_glass";

export type UnlockMode = "lifetime" | "days_30" | "days_7";

export interface FeedThemeRow {
  id: string;
  theme_key: FeedThemeKey;
  name: string;
  description: string | null;
  price_coins: number;
  unlock_mode: UnlockMode;
  duration_days: number | null;
  enabled: boolean;
  is_default: boolean;
  sort_order: number;
  preview_url: string | null;
  accent_hex: string | null;
}

export interface UserFeedThemeRow {
  theme_key: FeedThemeKey;
  unlocked_at: string;
  expires_at: string | null;
  source: string;
}

export const DEFAULT_FEED_THEME: FeedThemeKey = "boobubble_default";

const sb = supabase as any;

export async function listFeedThemes(): Promise<FeedThemeRow[]> {
  const { data, error } = await sb
    .from("feed_themes")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FeedThemeRow[];
}

export async function listMyUnlocks(userId: string): Promise<UserFeedThemeRow[]> {
  const { data, error } = await sb
    .from("user_feed_themes")
    .select("theme_key, unlocked_at, expires_at, source")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as UserFeedThemeRow[];
}

export async function getMyActiveFeedTheme(userId: string): Promise<FeedThemeKey> {
  const { data, error } = await sb.rpc("get_active_feed_theme", { _user: userId });
  if (error || !data) return DEFAULT_FEED_THEME;
  return data as FeedThemeKey;
}

export async function unlockFeedTheme(themeKey: FeedThemeKey) {
  const { data, error } = await sb.rpc("unlock_feed_theme", { _theme_key: themeKey });
  if (error) throw error;
  return data;
}

export async function activateFeedTheme(themeKey: FeedThemeKey) {
  const { data, error } = await sb.rpc("activate_feed_theme", { _theme_key: themeKey });
  if (error) throw error;
  const next = (data as FeedThemeKey) ?? themeKey;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("palrgo:active-feed-theme", next);
      window.dispatchEvent(new CustomEvent("palrgo:feed-theme-changed", { detail: next }));
    }
  } catch {}
  return next;
}

const FEED_THEME_CACHE_KEY = "palrgo:active-feed-theme";

function readCachedFeedTheme(): FeedThemeKey {
  if (typeof window === "undefined") return DEFAULT_FEED_THEME;
  try {
    const v = localStorage.getItem(FEED_THEME_CACHE_KEY) as FeedThemeKey | null;
    return v || DEFAULT_FEED_THEME;
  } catch {
    return DEFAULT_FEED_THEME;
  }
}

/**
 * Resolves the active feed theme for the current user. Returns the cached
 * theme for instant paint, then reconciles with the database on mount, and
 * stays in sync via the palrgo:feed-theme-changed event.
 */
export function useActiveFeedTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<FeedThemeKey>(readCachedFeedTheme);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setTheme(DEFAULT_FEED_THEME);
      try { localStorage.removeItem(FEED_THEME_CACHE_KEY); } catch {}
      return;
    }
    getMyActiveFeedTheme(user.id).then((t) => {
      if (cancelled) return;
      setTheme(t);
      try { localStorage.setItem(FEED_THEME_CACHE_KEY, t); } catch {}
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, version]);

  useEffect(() => {
    const onChanged = (e: Event) => {
      const next = (e as CustomEvent<FeedThemeKey>).detail;
      if (next) setTheme(next);
      else setVersion((v) => v + 1);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === FEED_THEME_CACHE_KEY && e.newValue) setTheme(e.newValue as FeedThemeKey);
    };
    window.addEventListener("palrgo:feed-theme-changed", onChanged as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("palrgo:feed-theme-changed", onChanged as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { theme, refresh };
}
