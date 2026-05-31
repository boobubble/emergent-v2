/**
 * Live Community Background — admin-configurable, view-only background shown
 * behind the Login/Signup screen. Stored under app_settings.auth_background.
 * Existing auth functionality (login/signup/social/forgot) is NOT touched.
 */

export interface AuthBackgroundConfig {
  /** Master switch — show the live background at all. */
  enabled: boolean;
  /** Apply glassmorphism + backdrop blur to the auth card. */
  blur: boolean;
  /** Show numeric community stats strip. */
  showStats: boolean;
  /** Show recent public feed posts in the scrolling background. */
  showFeed: boolean;
  /** Show recent public lobby chat messages in the scrolling background. */
  showChat: boolean;
  /** Optional override title above the background widgets. */
  headline: string;
}

export const AUTH_BG_DEFAULTS: AuthBackgroundConfig = {
  enabled: true,
  blur: true,
  showStats: true,
  showFeed: true,
  showChat: true,
  headline: "Live from the community",
};

export const AUTH_BG_SETTINGS_KEY = "auth_background";
