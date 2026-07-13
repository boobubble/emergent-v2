/**
 * Central white-label branding helper.
 *
 * All UI strings and assets that identify the platform read from here.
 * Values come from `app_settings.branding` (BrandingMap) merged with defaults.
 * Buyers configure the whole thing from Admin → Appearance → Branding, or the
 * initial values from the Setup Wizard's Platform Branding step.
 *
 * Never hardcode "Palrgo" / "BooBubble" in components — use `useBrand()`.
 */
import { useMemo } from "react";
import { useAppSettings } from "@/lib/app-settings";
import type { BrandingMap } from "@/components/BrandMark";

export interface WhiteLabelBrand {
  /** Platform display name, e.g. "Palrgo" */
  name: string;
  /** PWA short name / mobile app title */
  shortName: string;
  /** One-line tagline for hero + meta description fallback */
  tagline: string;
  /** Legal / company entity name for footer + emails + invoices */
  company: string;
  /** Support inbox address (also default email "from" address) */
  supportEmail: string;
  /** Public support / help website */
  supportUrl: string;
  privacyUrl: string;
  termsUrl: string;
  /** Rendered in footer, e.g. "© 2026 Acme Inc." */
  copyright: string;
  /** Additional footer HTML/text */
  footerText: string;
  /** PWA + browser theme color (hex) */
  themeColor: string;
  /** Accent used for buttons/links (hex) */
  accentColor: string;
  /** SEO */
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  /** Public share preview image (absolute URL preferred) */
  ogImage: string;
  /** Default placeholder image for missing avatars/covers */
  placeholderImage: string;
  /** Apple touch icon URL */
  appleTouchIcon: string;
  /** Favicon URL (falls back to branding.favicon_light) */
  favicon: string;
  /** Main logo URL for the current theme */
  logo: string;
  logoLight: string;
  logoDark: string;
  /** Email sender name (shown as "From: {name} <support@…>") */
  senderName: string;
  /** Reply-To address for outbound emails */
  replyTo: string;
  /** Locale + regional defaults */
  defaultLanguage: string;
  timezone: string;
  currency: string;
  /** Display name of the built-in AI assistant (internal code stays "boobubble") */
  assistantName: string;
  /** Raw BrandingMap for advanced consumers (per-room, sizes, etc.) */
  raw: BrandingMap;
}

export const BRAND_DEFAULTS: WhiteLabelBrand = {
  name: "Palrgo",
  shortName: "Palrgo",
  tagline: "Chat rooms, DMs, games and more.",
  company: "Palrgo",
  supportEmail: "support@example.com",
  supportUrl: "",
  privacyUrl: "/p/privacy",
  termsUrl: "/p/terms",
  copyright: `© ${new Date().getFullYear()} Palrgo`,
  footerText: "",
  themeColor: "#3B82F6",
  accentColor: "#3B82F6",
  metaTitle: "Palrgo — Chat rooms & command-driven games",
  metaDescription: "Public chat rooms, private DMs, file sharing, threaded replies, daily streaks, achievements and game commands.",
  metaKeywords: "chatroom, community, dm, games",
  ogImage: "",
  placeholderImage: "",
  appleTouchIcon: "/apple-touch-icon.png",
  favicon: "/favicon-blue.png",
  logo: "",
  logoLight: "",
  logoDark: "",
  senderName: "Palrgo",
  replyTo: "",
  defaultLanguage: "en",
  timezone: "UTC",
  currency: "USD",
  assistantName: "Assistant",
  raw: {},
};

function resolvedTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Build a WhiteLabelBrand by merging:
 *  - `app_settings.branding` (BrandingMap: logos, favicons, per-room, sizes)
 *  - `app_settings.whitelabel` (text/legal/meta/color fields)
 *  - `app_settings.general` (site_name, site_tagline, site_description) — fallbacks
 * against BRAND_DEFAULTS.
 */
export function buildBrand(
  brandingRaw: any,
  whitelabelRaw?: any,
  generalRaw?: any,
  theme?: "light" | "dark",
): WhiteLabelBrand {
  const bAssets = (brandingRaw ?? {}) as BrandingMap;
  const wl = (whitelabelRaw ?? {}) as Partial<WhiteLabelBrand>;
  const gen = (generalRaw ?? {}) as { site_name?: string; site_tagline?: string; site_description?: string };
  const t = theme ?? resolvedTheme();

  const logoLight = bAssets.logo_light || "";
  const logoDark = bAssets.logo_dark || "";
  const favicon =
    (t === "dark" ? bAssets.favicon_dark : bAssets.favicon_light) ||
    bAssets.favicon_light ||
    bAssets.favicon_dark ||
    BRAND_DEFAULTS.favicon;
  const logo = (t === "dark" ? logoDark : logoLight) || logoLight || logoDark || BRAND_DEFAULTS.logo;

  const merged: WhiteLabelBrand = {
    ...BRAND_DEFAULTS,
    ...(gen.site_name ? { name: gen.site_name, shortName: gen.site_name, company: gen.site_name } : {}),
    ...(gen.site_tagline ? { tagline: gen.site_tagline } : {}),
    ...(gen.site_description ? { metaDescription: gen.site_description } : {}),
    ...wl,
    favicon,
    logo,
    logoLight,
    logoDark,
    raw: bAssets,
  };
  if (!merged.senderName) merged.senderName = merged.name;
  if (!merged.shortName) merged.shortName = merged.name;
  if (!merged.metaTitle) merged.metaTitle = `${merged.name} — ${merged.tagline}`;
  if (!merged.metaDescription) merged.metaDescription = merged.tagline;
  if (!merged.copyright) merged.copyright = `© ${new Date().getFullYear()} ${merged.company || merged.name}`;
  return merged;
}

/**
 * React hook: returns the fully-resolved brand for the current theme.
 * Safe to call outside AppSettingsProvider (returns defaults).
 */
export function useBrand(): WhiteLabelBrand {
  const { raw } = useAppSettings();
  return useMemo(
    () => buildBrand(raw?.branding, raw?.whitelabel, raw?.general),
    [raw?.branding, raw?.whitelabel, raw?.general],
  );
}
