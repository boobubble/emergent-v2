import { logger } from "@/lib/logger";
import { CHAT_STORAGE_KEY_BASE } from "@/lib/dm-utils";

export type FeatureStoreKey = "chat" | "feed-prefs";

const STORE_PREFIXES: Record<FeatureStoreKey, string[]> = {
  chat: [CHAT_STORAGE_KEY_BASE, "palrgo:sync:v", "palrgo:sidebar"],
  "feed-prefs": ["palrgo:feed-prefs"],
};

export function safeParseJSON<T>(raw: string | null, fallback: T, label: string): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn(`Corrupted persisted state: ${label}`, err);
    return fallback;
  }
}

export function loadPersistedJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return safeParseJSON(localStorage.getItem(key), fallback, key);
  } catch (err) {
    logger.warn(`localStorage read failed: ${key}`, err);
    return fallback;
  }
}

export function savePersistedJSON(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    logger.warn(`localStorage write failed: ${key}`, err);
    return false;
  }
}

/** Remove only keys belonging to one feature — never clears unrelated stores. */
export function resetFeatureState(feature: FeatureStoreKey): void {
  if (typeof window === "undefined") return;
  const prefixes = STORE_PREFIXES[feature];
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (prefixes.some((p) => k.startsWith(p))) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
    logger.info("Reset corrupted feature state", { feature, keysRemoved: keys.length });
  } catch (err) {
    logger.error("Failed to reset feature state", err, { feature });
  }
}

export function removeCorruptedKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    logger.info("Removed corrupted localStorage key", { key });
  } catch {
    /* ignore */
  }
}
