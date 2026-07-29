import { r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
const FOCUS_COMPOSER_DEFAULTS = {
  enabled: true,
  blur: true,
  animations: true
};
function mergeFocusComposerConfig(raw) {
  const p = raw ?? {};
  return { ...FOCUS_COMPOSER_DEFAULTS, ...p };
}
const SETTINGS_KEY = "focus_composer";
function useFocusComposerConfig() {
  const [config, setConfig] = reactExports.useState(FOCUS_COMPOSER_DEFAULTS);
  const [ready, setReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
      if (!mounted) return;
      setConfig(mergeFocusComposerConfig(data?.value));
      setReady(true);
    };
    load().catch(() => {
      if (mounted) setReady(true);
    });
    const channel = supabase.channel(`focus_composer_${Math.random().toString(36).slice(2, 8)}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "app_settings", filter: `key=eq.${SETTINGS_KEY}` },
      (payload) => {
        const next = payload.new?.value;
        setConfig(mergeFocusComposerConfig(next));
      }
    ).subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
  return { config, ready };
}
export {
  FOCUS_COMPOSER_DEFAULTS as F,
  useFocusComposerConfig as u
};
