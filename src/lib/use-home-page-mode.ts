import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HOME_PAGE_KEY, type HomePageMode } from "@/lib/hero-page-config";

/**
 * Lightweight one-shot fetch of the active landing-page mode. Used by
 * AuthGate to decide whether unauthenticated visitors land on /welcome or
 * /heropage. Defaults to "welcome" while loading or on error to preserve
 * existing behavior.
 */
export function useHomePageMode() {
  const [mode, setMode] = useState<HomePageMode>("welcome");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", HOME_PAGE_KEY)
          .maybeSingle();
        const v = (data?.value as { mode?: HomePageMode } | null)?.mode;
        if (!cancelled && (v === "hero" || v === "welcome")) setMode(v);
      } catch {
        /* keep default */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { mode, ready };
}
