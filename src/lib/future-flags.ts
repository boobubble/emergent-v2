/**
 * Future Flags hook
 * ------------------------------------------------------------------
 * Reads `app_settings.future_flags` via `useAppSettings()` and exposes
 * a simple `isEnabled(key)` API. Future modules should gate every
 * client entry-point with this so they can ship dark and be flipped
 * on per-environment without code changes.
 */

import { useMemo } from "react";
import { useAppSettings } from "@/lib/app-settings";
import {
  FUTURE_FLAG_DEFAULTS,
  type FutureFlags,
  type FutureModuleKey,
} from "@/lib/future-modules";

export function useFutureFlags(): {
  flags: FutureFlags;
  isEnabled: (key: FutureModuleKey) => boolean;
} {
  const { raw } = useAppSettings();
  return useMemo(() => {
    const persisted = (raw.future_flags as FutureFlags | undefined) ?? {};
    const flags: FutureFlags = { ...FUTURE_FLAG_DEFAULTS, ...persisted };
    return {
      flags,
      isEnabled: (key) => Boolean(flags[key]),
    };
  }, [raw]);
}

export function useFutureFlag(key: FutureModuleKey): boolean {
  return useFutureFlags().isEnabled(key);
}
