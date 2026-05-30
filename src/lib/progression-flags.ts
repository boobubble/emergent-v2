/**
 * Read-only hooks for the centralized progression / unlocks framework.
 * Wired into existing UIs without modifying their internals — call
 * `useUnlock("msg.reply")` to decide whether to render the affordance.
 */

import { useMemo } from "react";
import { useAppSettings } from "@/lib/app-settings";
import { useAuth } from "@/lib/auth-store";
import {
  PROGRESSION_DEFAULTS,
  canUseUnlock,
  resolveUnlock,
  type ProgressionConfig,
  type UnlockKey,
} from "@/lib/progression-config";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function mergeDeep<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const k of Object.keys(override) as (keyof T)[]) {
    const v: any = (override as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = mergeDeep((base as any)[k] ?? {}, v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

export function useProgressionConfig(): ProgressionConfig {
  const { raw } = useAppSettings();
  return useMemo(
    () => mergeDeep(PROGRESSION_DEFAULTS, raw.progression as DeepPartial<ProgressionConfig> | undefined),
    [raw],
  );
}

/** Returns whether the current user can use the given unlock right now. */
export function useUnlock(key: UnlockKey): { allowed: boolean; requiredLevel: number; userLevel: number } {
  const cfg = useProgressionConfig();
  const { profile } = useAuth();
  const userLevel = profile?.level ?? 1;
  const { level: requiredLevel } = resolveUnlock(key, cfg);
  return { allowed: canUseUnlock(userLevel, key, cfg), requiredLevel, userLevel };
}

/** Pure helper for non-hook call sites. */
export function checkUnlock(userLevel: number, key: UnlockKey, cfg: ProgressionConfig) {
  return canUseUnlock(userLevel, key, cfg);
}
