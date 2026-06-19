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
  return data as FeedThemeKey;
}

/**
 * Resolves the active feed theme for the current user. Returns the default
 * theme key while loading or when signed-out so the feed always renders.
 */
export function useActiveFeedTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<FeedThemeKey>(DEFAULT_FEED_THEME);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setTheme(DEFAULT_FEED_THEME);
      return;
    }
    getMyActiveFeedTheme(user.id).then((t) => {
      if (!cancelled) setTheme(t);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { theme, refresh };
}
