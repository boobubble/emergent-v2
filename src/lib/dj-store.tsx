// Standalone read-only hook for the live DJ player state.
//
// AppSettingsProvider only wraps the admin area, but the player runs
// inside the lobby chat too. To keep the chat tree untouched, this hook
// fetches `app_settings.dj_player` directly and subscribes to the same
// realtime channel used by AppSettingsProvider, so every listener stays
// in sync without prop drilling.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DJ_DEFAULTS, mergeDjConfig, type DjPlayerState } from "@/lib/dj-config";

const SETTINGS_KEY = "dj_player";

export function useDjPlayer(): { state: DjPlayerState; ready: boolean; reload: () => Promise<void> } {
  const [state, setState] = useState<DjPlayerState>(DJ_DEFAULTS);
  const [ready, setReady] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    setState(mergeDjConfig(data?.value));
    setReady(true);
  };

  useEffect(() => {
    let mounted = true;
    load().catch(() => { if (mounted) setReady(true); });

    const channel = supabase
      .channel(`dj_player_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: `key=eq.${SETTINGS_KEY}` },
        (payload) => {
          const next = (payload.new as { value?: unknown } | null)?.value;
          if (next === undefined) load();
          else setState(mergeDjConfig(next));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { state, ready, reload: load };
}
