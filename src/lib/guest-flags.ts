/**
 * Read-only hooks for the Guest Access framework.
 *
 * Usage:
 *   const { isGuest, can } = useGuestAccess();
 *   if (isGuest && !can("send_messages")) return <UpgradeHint />;
 */

import { useMemo } from "react";
import { useAppSettings } from "@/lib/app-settings";
import { useAuth } from "@/lib/auth-store";
import {
  GUEST_ACCESS_DEFAULTS,
  guestCan,
  type GuestAccessConfig,
  type GuestPermissionKey,
} from "@/lib/guest-config";

export function useGuestConfig(): GuestAccessConfig {
  const { raw } = useAppSettings();
  return useMemo(() => {
    const persisted = (raw.guest_access as Partial<GuestAccessConfig> | undefined) ?? {};
    return {
      ...GUEST_ACCESS_DEFAULTS,
      ...persisted,
      permissions: { ...GUEST_ACCESS_DEFAULTS.permissions, ...(persisted.permissions ?? {}) },
    };
  }, [raw]);
}

export interface GuestAccessApi {
  /** Current user is a guest (anonymous Supabase session). */
  isGuest: boolean;
  /** Master switch from admin settings. */
  enabled: boolean;
  /** Auto sign-in unauthenticated visitors as guest. */
  autoLogin: boolean;
  /** Show the "Upgrade to full account" prompt while signed in as guest. */
  showUpgradePrompt: boolean;
  cfg: GuestAccessConfig;
  /**
   * Permission check. Always returns `true` for non-guests; for guests it
   * returns the admin-configured value for that permission key.
   */
  can: (key: GuestPermissionKey) => boolean;
}

export function useGuestAccess(): GuestAccessApi {
  const cfg = useGuestConfig();
  const { user } = useAuth();
  const isGuest = Boolean(user?.isGuest);
  return useMemo<GuestAccessApi>(() => ({
    isGuest,
    enabled: cfg.enabled,
    autoLogin: cfg.autoLogin,
    showUpgradePrompt: cfg.showUpgradePrompt,
    cfg,
    can: (k) => (isGuest ? guestCan(cfg, k) : true),
  }), [cfg, isGuest]);
}

/** Pure helper for non-hook code paths. */
export function canGuestDo(cfg: GuestAccessConfig, key: GuestPermissionKey): boolean {
  return guestCan(cfg, key);
}
