/**
 * Hook that reads the live retention config from `app_settings.retention`
 * and falls back to RETENTION_DEFAULTS for any missing keys. Use this in
 * every UI/service that needs to know whether a retention module is on,
 * or what the current decay/grace numbers are.
 */

import { useMemo } from "react";
import { useAppSettings } from "@/lib/app-settings";
import { RETENTION_DEFAULTS, type RetentionConfig } from "@/lib/retention-config";

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

export function useRetentionConfig(): RetentionConfig {
  const { raw } = useAppSettings();
  return useMemo(
    () => mergeDeep(RETENTION_DEFAULTS, raw.retention as DeepPartial<RetentionConfig> | undefined),
    [raw],
  );
}

export function useRetentionModule(key: keyof RetentionConfig["modules"]): boolean {
  return useRetentionConfig().modules[key];
}
