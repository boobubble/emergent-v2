import { s as supabase } from "./client-H8IXbXWR.mjs";
const sb = supabase;
const WALLPAPER_CATEGORIES = [
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
  "Premium Exclusive"
];
async function fetchWallpaperCatalog() {
  const { data, error } = await sb.from("dm_wallpapers").select("*").eq("enabled", true).order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
async function fetchPersonalTheme(channelId, userId) {
  const { data, error } = await sb.from("dm_chat_themes").select("*").eq("channel_id", channelId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
async function fetchSharedTheme(channelId) {
  const { data, error } = await sb.from("dm_shared_themes").select("*").eq("channel_id", channelId).maybeSingle();
  if (error) throw error;
  return data;
}
async function savePersonalTheme(channelId, userId, patch) {
  const row = {
    channel_id: channelId,
    user_id: userId,
    wallpaper_key: patch.wallpaper_key ?? null,
    opacity: patch.opacity ?? 1,
    blur: patch.blur ?? 0,
    brightness: patch.brightness ?? 1,
    overlay: patch.overlay ?? 0,
    bubble_accent: patch.bubble_accent ?? null
  };
  const { error } = await sb.from("dm_chat_themes").upsert(row, { onConflict: "channel_id,user_id" });
  if (error) throw error;
}
async function clearPersonalTheme(channelId, userId) {
  const { error } = await sb.from("dm_chat_themes").delete().eq("channel_id", channelId).eq("user_id", userId);
  if (error) throw error;
}
async function purchaseWallpaper(wallpaperKey, type, channelId) {
  const { data, error } = await sb.rpc("purchase_dm_wallpaper", {
    _wallpaper_key: wallpaperKey,
    _purchase_type: type,
    _channel_id: channelId
  });
  if (error) throw error;
  return data;
}
function wallpaperBackground(w) {
  if (!w) return void 0;
  if (w.kind === "solid" || w.kind === "gradient") return w.css_value ?? void 0;
  const url = w.asset_url ?? w.preview_url;
  if (!url) return void 0;
  return `center / cover no-repeat url("${url}")`;
}
export {
  WALLPAPER_CATEGORIES as W,
  fetchPersonalTheme as a,
  fetchSharedTheme as b,
  clearPersonalTheme as c,
  fetchWallpaperCatalog as f,
  purchaseWallpaper as p,
  savePersonalTheme as s,
  wallpaperBackground as w
};
