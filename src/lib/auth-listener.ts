import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";

type AuthListenerResult = {
  data?: { subscription?: { unsubscribe: () => void } };
  subscription?: { unsubscribe: () => void };
};

/** Extract unsubscribe from onAuthStateChange return value (sync or promise). */
export function getAuthStateSubscription(result: unknown): { unsubscribe: () => void } | null {
  if (!result || typeof result !== "object") return null;
  const direct = (result as AuthListenerResult).data?.subscription
    ?? (result as AuthListenerResult).subscription;
  return direct?.unsubscribe ? direct : null;
}

/**
 * Subscribe after the browser Supabase client is loaded.
 * Use this when the caller must not miss the first auth event (login/restore).
 */
export async function attachAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): Promise<() => void> {
  const supabase = await loadBrowserSupabase();
  const result = supabase.auth.onAuthStateChange(callback);
  const subscription = getAuthStateSubscription(result);
  return () => subscription?.unsubscribe();
}

/**
 * Subscribe to auth state changes and return a safe unsubscribe function.
 * Guards against undefined `.subscription` when the listener shape is unexpected.
 * Loads Supabase on demand so guest `/` can skip the JS client entirely.
 */
export function subscribeAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  let unsub: () => void = () => {};
  let cancelled = false;
  void attachAuthStateChange(callback)
    .then((fn) => {
      if (cancelled) {
        fn();
        return;
      }
      unsub = fn;
    })
    .catch((e) => {
      console.warn("[auth-store] onAuthStateChange failed to attach", e);
    });
  return () => {
    cancelled = true;
    unsub();
  };
}
