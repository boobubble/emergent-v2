/**
 * Guest access has been removed from this app. These hooks remain as
 * back-compat stubs so existing imports continue to compile — but they
 * always report "not a guest" and grant every capability, since only
 * fully signed-in users can reach these code paths now.
 */

import type { GuestPermissionKey, GuestAccessConfig } from "@/lib/guest-config";
import { GUEST_ACCESS_DEFAULTS } from "@/lib/guest-config";

export function useGuestConfig(): GuestAccessConfig {
  return GUEST_ACCESS_DEFAULTS;
}

export interface GuestAccessApi {
  isGuest: boolean;
  enabled: boolean;
  autoLogin: boolean;
  showUpgradePrompt: boolean;
  cfg: GuestAccessConfig;
  can: (key: GuestPermissionKey) => boolean;
}

export function useGuestAccess(): GuestAccessApi {
  return {
    isGuest: false,
    enabled: false,
    autoLogin: false,
    showUpgradePrompt: false,
    cfg: GUEST_ACCESS_DEFAULTS,
    can: () => true,
  };
}

export function canGuestDo(): boolean {
  return false;
}
