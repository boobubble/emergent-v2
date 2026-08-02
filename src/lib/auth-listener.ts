import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
 * Subscribe to auth state changes and return a safe unsubscribe function.
 * Guards against undefined `.subscription` when the listener shape is unexpected.
 */
export function subscribeAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const result = supabase.auth.onAuthStateChange(callback);
  const subscription = getAuthStateSubscription(result);
  return () => subscription?.unsubscribe();
}
