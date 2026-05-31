// Focus / Spotlight Composer config.
//
// Enhances the existing Feed Composer with a focus-mode overlay. The
// composer is NOT rewritten — it simply opts into a wrapper overlay
// when these flags are on. Persisted under app_settings.focus_composer
// and live-synced via realtime to every client.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FocusComposerConfig {
  /** Master switch — opens the composer into a spotlight overlay on focus. */
  enabled: boolean;
  /** Apply a backdrop-filter blur behind the spotlight. */
  blur: boolean;
  /** Use animated zoom-in / fade-in motion. When off, just toggles. */
  animations: boolean;
}

export const FOCUS_COMPOSER_DEFAULTS: FocusComposerConfig = {
  enabled: true,
  blur: true,
  animations: true,
};

export function mergeFocusComposerConfig(raw: unknown): FocusComposerConfig {
  const p = (raw ?? {}) as Partial<FocusComposerConfig>;
  return { ...FOCUS_COMPOSER_DEFAULTS, ...p };
}

const SETTINGS_KEY = "focus_composer";

export function useFocusComposerConfig() {
  const [config, setConfig] = useState<FocusComposerConfig>(FOCUS_COMPOSER_DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle();
      if (!mounted) return;
      setConfig(mergeFocusComposerConfig(data?.value));
      setReady(true);
    };
    load().catch(() => { if (mounted) setReady(true); });

    const channel = supabase
      .channel(`focus_composer_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: `key=eq.${SETTINGS_KEY}` },
        (payload) => {
          const next = (payload.new as { value?: unknown } | null)?.value;
          setConfig(mergeFocusComposerConfig(next));
        },
      )
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  return { config, ready };
}
