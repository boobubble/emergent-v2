/** Detect a persisted Supabase auth token without initializing the JS client. */
export function hasStoredAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) ?? "";
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Guest marketing homepage: no stored session, path is `/`. */
export function isGuestHomePath(): boolean {
  return typeof window !== "undefined"
    && window.location.pathname === "/"
    && !hasStoredAuthToken();
}
