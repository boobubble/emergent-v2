import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LayoutPriority = "chatrooms_first" | "feed_first";

export interface ModulesFlags {
  wallet: boolean;
  gif: boolean;
  badges: boolean;
  games: boolean;
  feed: boolean;
  reactions: boolean;
  voice: boolean;
  ai: boolean;
  emojis: boolean;
  streaks: boolean;
  referrals: boolean;
  notifications: boolean;
  competitionMemes: boolean;
  nomineeMemeTagging: boolean;
  trendingMemeSection: boolean;
  funZone: boolean;
  funZoneMemes: boolean;
  funZoneFanArts: boolean;
  funZonePosters: boolean;
  funZoneFanEdits: boolean;
  battleRecap: boolean;
  autoAwards: boolean;
}

interface AppSettings {
  layoutPriority: LayoutPriority;
  modules: ModulesFlags;
  raw: Record<string, unknown>;
  ready: boolean;
  refresh: () => Promise<void>;
}

const DEFAULTS: { layoutPriority: LayoutPriority; modules: ModulesFlags } = {
  layoutPriority: "chatrooms_first",
  modules: {
    wallet: true, gif: true, badges: true, games: true, feed: true,
    reactions: true, voice: false, ai: true, emojis: true, streaks: true,
    referrals: false, notifications: true,
    competitionMemes: true, nomineeMemeTagging: true, trendingMemeSection: true,
    funZone: true, funZoneMemes: true, funZoneFanArts: true, funZonePosters: true, funZoneFanEdits: true,
    battleRecap: true, autoAwards: true,
  },
};

const Ctx = createContext<AppSettings | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("app_settings").select("key,value");
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    setRaw(map);
    setReady(true);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`app_settings_changes:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const value = useMemo<AppSettings>(() => {
    const lp = (raw.layout_priority as LayoutPriority) || DEFAULTS.layoutPriority;
    const modules = { ...DEFAULTS.modules, ...((raw.modules as Partial<ModulesFlags>) || {}) };
    return { layoutPriority: lp, modules, raw, ready, refresh: load };
  }, [raw, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Safe fallback so components rendered outside the provider (e.g. during
// SSR / prerender of the "/" route before AuthGate mounts the provider)
// don't crash the whole build. They'll just see defaults + ready=false.
const FALLBACK: AppSettings = {
  layoutPriority: DEFAULTS.layoutPriority,
  modules: DEFAULTS.modules,
  raw: {},
  ready: false,
  refresh: async () => {},
};

export function useAppSettings() {
  const ctx = useContext(Ctx);
  return ctx ?? FALLBACK;
}
