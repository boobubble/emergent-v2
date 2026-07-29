const CHAT_VARIANTS = {
  yahoo_messenger: "classic",
  vip_gold: "classic"
  // discord, whatsapp, cyber_neon, minimal_modern, boobubble_default_chat → modern (default)
};
const FEED_VARIANTS = {
  orkut_retro: "classic",
  facebook_classic: "square",
  reddit: "square"
  // instagram, twitter_x, neon_glass, boobubble_default_feed → modern (default)
};
function chatVariantFor(themeKey) {
  if (!themeKey) return "modern";
  return CHAT_VARIANTS[themeKey] ?? "modern";
}
function feedVariantFor(themeKey) {
  if (!themeKey) return "modern";
  return FEED_VARIANTS[themeKey] ?? "modern";
}
export {
  chatVariantFor as c,
  feedVariantFor as f
};
