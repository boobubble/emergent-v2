/**
 * Ad Placement Manager — configuration schema & helpers.
 *
 * This module does NOT render or load ads. The existing AdSlot / AdsAutoLoader
 * components and the `ads` key in app_settings continue to drive AdSense/custom
 * HTML loading. This file adds a higher-level *placement* layer that admins use
 * to decide WHERE ads appear (which surfaces, how often, on which devices, for
 * which audience). Stored under the `ad_placements` key in app_settings.
 */

export type AdSurface =
  | "feed"
  | "chatroom"
  | "dm"
  | "profile"
  | "find_friends"
  | "games"
  | "custom_page";

export type AdFormat =
  | "adsense"
  | "custom_html"
  | "banner"
  | "sponsor_block"
  | "affiliate_widget";

export type DeviceTarget = "all" | "desktop" | "mobile";
export type AudienceTarget = "all" | "guests" | "registered";

export interface PlacementConfig {
  /** Master enable for this surface. */
  enabled: boolean;
  /** Allowed ad formats for this surface. */
  formats: AdFormat[];
  /** Show on desktop, mobile, or both. */
  device: DeviceTarget;
  /** Restrict to a particular audience (e.g. guests-only). */
  audience: AudienceTarget;
  /** Maximum number of ad units to render on a single page/view. */
  maxPerPage: number;
  /** For "feed"-like surfaces: insert an ad after every N items. 0 = disabled. */
  everyNItems: number;
  /** Optional free-form custom HTML for this placement. */
  customHtml?: string;
  /** Optional affiliate/sponsor block markdown or HTML. */
  sponsorHtml?: string;
}

export interface AdPlacementsConfig {
  /** Master switch for the whole placement system. Existing AdSlot keeps working when off. */
  enabled: boolean;
  /** Premium / paid users see no ads anywhere. */
  premiumAdFree: boolean;
  /** Hide ads entirely for guests (overrides surface audience). */
  hideForGuests: boolean;
  /** Global cap across surfaces per page view. 0 = no cap. */
  globalMaxPerPage: number;
  placements: Record<AdSurface, PlacementConfig>;
}

export const SURFACE_META: Record<
  AdSurface,
  { label: string; description: string; supportsEveryN: boolean }
> = {
  feed:         { label: "Feed",          description: "Social feed timeline.",            supportsEveryN: true  },
  chatroom:     { label: "Chatrooms",     description: "Lobby and chatroom views.",        supportsEveryN: false },
  dm:           { label: "Direct Messages", description: "1:1 conversations.",             supportsEveryN: false },
  profile:      { label: "Profiles",      description: "User profile pages.",              supportsEveryN: false },
  find_friends: { label: "Find Friends",  description: "Discovery & suggestions.",         supportsEveryN: true  },
  games:        { label: "Games",         description: "Games lobby and game pages.",      supportsEveryN: false },
  custom_page:  { label: "Custom Pages",  description: "CMS pages created in the admin.",  supportsEveryN: false },
};

export const FORMAT_META: Record<AdFormat, { label: string; description: string }> = {
  adsense:          { label: "Google AdSense", description: "Uses the AdSense publisher/slot IDs from Ads & Scripts." },
  custom_html:      { label: "Custom HTML",    description: "Free-form HTML injected into the slot." },
  banner:           { label: "Banner",         description: "Image banner with click-through URL." },
  sponsor_block:    { label: "Sponsor Block",  description: "Branded sponsor card / call-out." },
  affiliate_widget: { label: "Affiliate",      description: "Affiliate product / referral widget." },
};

const DEFAULT_PLACEMENT: PlacementConfig = {
  enabled: false,
  formats: ["adsense"],
  device: "all",
  audience: "all",
  maxPerPage: 2,
  everyNItems: 0,
  customHtml: "",
  sponsorHtml: "",
};

export const AD_PLACEMENTS_DEFAULTS: AdPlacementsConfig = {
  enabled: false,
  premiumAdFree: true,
  hideForGuests: false,
  globalMaxPerPage: 6,
  placements: {
    feed:         { ...DEFAULT_PLACEMENT, everyNItems: 5 },
    chatroom:     { ...DEFAULT_PLACEMENT },
    dm:           { ...DEFAULT_PLACEMENT, audience: "guests" },
    profile:      { ...DEFAULT_PLACEMENT },
    find_friends: { ...DEFAULT_PLACEMENT, everyNItems: 8 },
    games:        { ...DEFAULT_PLACEMENT },
    custom_page:  { ...DEFAULT_PLACEMENT },
  },
};

/** Pure helper: should an ad render on the given surface for the given viewer? */
export function shouldShowAd(
  cfg: AdPlacementsConfig | null | undefined,
  surface: AdSurface,
  ctx: { isGuest: boolean; isPremium: boolean; isMobile: boolean },
): boolean {
  if (!cfg?.enabled) return false;
  if (cfg.premiumAdFree && ctx.isPremium) return false;
  if (cfg.hideForGuests && ctx.isGuest) return false;
  const p = cfg.placements[surface];
  if (!p?.enabled) return false;
  if (p.device === "desktop" && ctx.isMobile) return false;
  if (p.device === "mobile" && !ctx.isMobile) return false;
  if (p.audience === "guests" && !ctx.isGuest) return false;
  if (p.audience === "registered" && ctx.isGuest) return false;
  return true;
}
