// Standalone read-only hook for the live DJ player state.
//
// AppSettingsProvider only wraps the admin area, but the player runs
// inside the lobby chat too. To keep the chat tree untouched, this hook
// fetches `app_settings.dj_player` directly and subscribes to the same
// realtime channel used by AppSettingsProvider, so every listener stays
// in sync without prop drilling.

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DJ_DEFAULTS,
  mergeDjConfig,
  resolveChatRadioView,
  type ChatRadioView,
  type DjPlayerState,
  type RadioWidgetRow,
  type RadioWidgetStateRow,
} from "@/lib/dj-config";

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

export function useChatRadioSource(): { ready: boolean; radio: ChatRadioView } {
  const { state: djState, ready: djReady } = useDjPlayer();
  const [widgets, setWidgets] = useState<RadioWidgetRow[]>([]);
  const [states, setStates] = useState<RadioWidgetStateRow[]>([]);
  const [widgetsReady, setWidgetsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [{ data: w }, { data: s }] = await Promise.all([
        supabase.from("radio_widgets").select("id, name, enabled, stream_url").order("created_at"),
        supabase.from("radio_widget_state").select("widget_id, is_live, current_track_title, current_track_artist, current_show_title"),
      ]);
      if (!mounted) return;
      setWidgets((w ?? []) as RadioWidgetRow[]);
      setStates((s ?? []) as RadioWidgetStateRow[]);
      setWidgetsReady(true);
    }

    load().catch(() => {
      if (mounted) setWidgetsReady(true);
    });

    const channel = supabase
      .channel(`chat_radio_${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "radio_widgets" }, () => {
        load().catch(() => undefined);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "radio_widget_state" }, () => {
        load().catch(() => undefined);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const radio = useMemo(() => {
    const activeWidget =
      widgets.find((w) => w.enabled && w.stream_url) ??
      widgets.find((w) => w.stream_url) ??
      null;
    const widgetState = activeWidget
      ? states.find((st) => st.widget_id === activeWidget.id) ?? null
      : null;
    return resolveChatRadioView(djState ?? DJ_DEFAULTS, activeWidget, widgetState);
  }, [djState, widgets, states]);

  return { ready: djReady && widgetsReady, radio };
}
