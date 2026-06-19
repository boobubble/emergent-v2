import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";

export type ChatThemeKey =
  | "boobubble_default_chat"
  | "discord"
  | "yahoo_messenger"
  | "whatsapp"
  | "cyber_neon"
  | "minimal_modern"
  | "vip_gold";

export type UnlockMode = "lifetime" | "days_30" | "days_7";

export interface ChatThemeRow {
  id: string;
  theme_key: ChatThemeKey;
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

export interface UserChatThemeRow {
  theme_key: ChatThemeKey;
  unlocked_at: string;
  expires_at: string | null;
  source: string;
}

export const DEFAULT_CHAT_THEME: ChatThemeKey = "boobubble_default_chat";
const sb = supabase as any;

export async function listChatThemes(): Promise<ChatThemeRow[]> {
  const { data, error } = await sb
    .from("chat_themes")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatThemeRow[];
}

export async function listMyChatUnlocks(userId: string): Promise<UserChatThemeRow[]> {
  const { data, error } = await sb
    .from("user_chat_themes")
    .select("theme_key, unlocked_at, expires_at, source")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as UserChatThemeRow[];
}

export async function getMyActiveChatTheme(userId: string): Promise<ChatThemeKey> {
  const { data, error } = await sb.rpc("get_active_chat_theme", { _user: userId });
  if (error || !data) return DEFAULT_CHAT_THEME;
  return data as ChatThemeKey;
}

export async function unlockChatTheme(themeKey: ChatThemeKey) {
  const { data, error } = await sb.rpc("unlock_chat_theme", { _theme_key: themeKey });
  if (error) throw error;
  return data;
}

export async function activateChatTheme(themeKey: ChatThemeKey) {
  const { data, error } = await sb.rpc("activate_chat_theme", { _theme_key: themeKey });
  if (error) throw error;
  return data as ChatThemeKey;
}

export function useActiveChatTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ChatThemeKey>(DEFAULT_CHAT_THEME);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setTheme(DEFAULT_CHAT_THEME);
      return;
    }
    getMyActiveChatTheme(user.id).then((t) => {
      if (!cancelled) setTheme(t);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { theme, refresh };
}
