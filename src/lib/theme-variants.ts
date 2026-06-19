/**
 * Theme variants — structural flag separate from theme colors/tokens.
 *
 * Layout is LOCKED via the base `[data-chat-theme]` / `[data-feed-theme]`
 * rules in styles.css. Themes only retint colors, gradients, and typography.
 *
 * A theme may opt into ONE structural variant via `data-theme-variant`:
 *   - "classic" — tight radius, denser spacing (retro feel: orkut, yahoo)
 *   - "modern"  — default; medium radius, comfortable spacing
 *   - "square"  — flat 0 radius, no shadows (utilitarian: fb, reddit)
 *
 * Add a new theme → pick a variant here (or omit for "modern").
 */

export type ThemeVariant = "classic" | "modern" | "square";

const CHAT_VARIANTS: Record<string, ThemeVariant> = {
  yahoo_messenger: "classic",
  vip_gold: "classic",
  // discord, whatsapp, cyber_neon, minimal_modern, boobubble_default_chat → modern (default)
};

const FEED_VARIANTS: Record<string, ThemeVariant> = {
  orkut_retro: "classic",
  facebook_classic: "square",
  reddit: "square",
  // instagram, twitter_x, neon_glass, boobubble_default_feed → modern (default)
};

export function chatVariantFor(themeKey: string | null | undefined): ThemeVariant {
  if (!themeKey) return "modern";
  return CHAT_VARIANTS[themeKey] ?? "modern";
}

export function feedVariantFor(themeKey: string | null | undefined): ThemeVariant {
  if (!themeKey) return "modern";
  return FEED_VARIANTS[themeKey] ?? "modern";
}
