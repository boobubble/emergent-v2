import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type WallpaperKind = "solid" | "gradient" | "image" | "animated";
export type PurchaseType = "self" | "shared";

export interface DmWallpaper {
  id: string;
  wallpaper_key: string;
  name: string;
  category: string;
  kind: WallpaperKind;
  preview_url: string | null;
  asset_url: string | null;
  css_value: string | null;
  price_coins: number;
  is_premium: boolean;
  is_featured: boolean;
  is_limited: boolean;
  enabled: boolean;
  sort_order: number;
}

export interface DmThemeRow {
  channel_id: string;
  wallpaper_key: string | null;
  opacity: number;
  blur: number;
  brightness: number;
  overlay: number;
  bubble_accent: string | null;
  updated_at: string;
}

export interface DmSharedThemeRow extends DmThemeRow {
  applied_by: string | null;
}

export const WALLPAPER_CATEGORIES = [
  "Romantic",
  "Space",
  "Nature",
  "Gaming",
  "Neon",
  "Cute",
  "Dark",
  "Seasonal",
  "Minimal",
  "Trending",
  "Premium Exclusive",
] as const;

export async function fetchWallpaperCatalog(): Promise<DmWallpaper[]> {
  const { data, error } = await sb
    .from("dm_wallpapers")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DmWallpaper[];
}

export async function fetchOwnedWallpaperKeys(userId: string): Promise<Set<string>> {
  const { data, error } = await sb
    .from("user_dm_wallpapers")
    .select("wallpaper_key")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r: { wallpaper_key: string }) => r.wallpaper_key));
}

export async function fetchPersonalTheme(channelId: string, userId: string): Promise<DmThemeRow | null> {
  const { data, error } = await sb
    .from("dm_chat_themes")
    .select("*")
    .eq("channel_id", channelId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as DmThemeRow | null;
}

export async function fetchSharedTheme(channelId: string): Promise<DmSharedThemeRow | null> {
  const { data, error } = await sb
    .from("dm_shared_themes")
    .select("*")
    .eq("channel_id", channelId)
    .maybeSingle();
  if (error) throw error;
  return data as DmSharedThemeRow | null;
}

export async function savePersonalTheme(
  channelId: string,
  userId: string,
  patch: Partial<Omit<DmThemeRow, "channel_id" | "updated_at">>,
) {
  const row = {
    channel_id: channelId,
    user_id: userId,
    wallpaper_key: patch.wallpaper_key ?? null,
    opacity: patch.opacity ?? 1,
    blur: patch.blur ?? 0,
    brightness: patch.brightness ?? 1,
    overlay: patch.overlay ?? 0,
    bubble_accent: patch.bubble_accent ?? null,
  };
  const { error } = await sb
    .from("dm_chat_themes")
    .upsert(row, { onConflict: "channel_id,user_id" });
  if (error) throw error;
}

export async function clearPersonalTheme(channelId: string, userId: string) {
  const { error } = await sb
    .from("dm_chat_themes")
    .delete()
    .eq("channel_id", channelId)
    .eq("user_id", userId);
  if (error) throw error;
}

export interface PurchaseResult {
  ok: boolean;
  already_owned: boolean;
  coins_spent: number;
  wallpaper_key: string;
}

export async function purchaseWallpaper(
  wallpaperKey: string,
  type: PurchaseType,
  channelId: string | null,
): Promise<PurchaseResult> {
  const { data, error } = await sb.rpc("purchase_dm_wallpaper", {
    _wallpaper_key: wallpaperKey,
    _purchase_type: type,
    _channel_id: channelId,
  });
  if (error) throw error;
  return data as PurchaseResult;
}

/** Compute CSS background for a wallpaper (used by preview + live layer). */
export function wallpaperBackground(w: DmWallpaper | null): string | undefined {
  if (!w) return undefined;
  if (w.kind === "solid" || w.kind === "gradient") return w.css_value ?? undefined;
  const url = w.asset_url ?? w.preview_url;
  if (!url) return undefined;
  return `center / cover no-repeat url("${url}")`;
}
