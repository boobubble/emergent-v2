import { useEffect } from "react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";

type BrowserClient = Awaited<ReturnType<typeof loadBrowserSupabase>>;

/** Run a Supabase realtime subscription only after the browser client is ready. */
export function useCompetitionRealtimeEffect(
  enabled: boolean,
  setup: (supabase: BrowserClient) => (() => void) | void,
  deps: readonly unknown[],
) {
  useEffect(() => {
    if (!enabled) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void loadBrowserSupabase().then((supabase) => {
      if (cancelled) return;
      const result = setup(supabase);
      if (typeof result === "function") cleanup = result;
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}
