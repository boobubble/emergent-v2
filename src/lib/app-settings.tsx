import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { CORE_MODULE_DEFAULTS } from "@/lib/module-flags";
import { subscribeAuthStateChange } from "@/lib/auth-listener";
import { hasStoredAuthToken, isGuestHomePath } from "@/lib/stored-auth";
import { scheduleIdle } from "@/lib/schedule-idle";

export type LayoutPriority = "chatrooms_first" | "feed_first";

export interface ModulesFlags {
  communities: boolean;
  blog: boolean;
  pages: boolean;
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
  smartQualification: boolean;
  smartQualificationApproval: boolean;
  smartQualificationLive: boolean;
}

export const DEFAULT_MODULE_FLAGS: ModulesFlags = {
  communities: CORE_MODULE_DEFAULTS.communities,
  blog: CORE_MODULE_DEFAULTS.blog,
  pages: CORE_MODULE_DEFAULTS.pages,
  wallet: true, gif: true, badges: true, games: true, feed: true,
  reactions: true, voice: false, ai: true, emojis: true, streaks: true,
  referrals: false, notifications: true,
  competitionMemes: true, nomineeMemeTagging: true, trendingMemeSection: true,
  funZone: true, funZoneMemes: true, funZoneFanArts: true, funZonePosters: true, funZoneFanEdits: true,
  battleRecap: true, autoAwards: true,
  smartQualification: true, smartQualificationApproval: false, smartQualificationLive: true,
};

export function mergeModuleFlags(input: unknown): ModulesFlags {
  return { ...DEFAULT_MODULE_FLAGS, ...((input as Partial<ModulesFlags>) || {}) };
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
  modules: DEFAULT_MODULE_FLAGS,
};

const Ctx = createContext<AppSettings | null>(null);

/** Keys needed to boot the guest homepage without downloading every setting row. */
export const GUEST_HOME_SETTING_KEYS = [
  "branding",
  "modules",
  "layout_priority",
  "guest_chat",
] as const;

function shouldLoadFullSettings() {
  if (typeof window === "undefined") return false;
  if (hasStoredAuthToken()) return true;
  return window.location.pathname !== "/";
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);

  const load = async (forceFull = false) => {
    const supabase = await loadBrowserSupabase();
    const full = forceFull || shouldLoadFullSettings();
    let q = supabase.from("app_settings").select("key,value");
    if (!full) q = q.in("key", [...GUEST_HOME_SETTING_KEYS]);
    const { data } = await q;
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    setRaw(map);
    setReady(true);
  };

  useEffect(() => {
    const supabaseConfigured = Boolean(
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    );
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }

    let channel: { unsubscribe?: () => void } | null = null;
    let unsubAuth: (() => void) | undefined;
    let cancelIdle: (() => void) | undefined;

    const start = async () => {
      try {
        const supabase = await loadBrowserSupabase();
        void load().catch((e) => {
          console.error("[app-settings] load failed", e);
          setReady(true);
        });
        unsubAuth = subscribeAuthStateChange((_event, session) => {
          if (session?.user) void load(true);
        });
        try {
          channel = supabase
            .channel(`app_settings_changes:${Math.random().toString(36).slice(2)}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => load())
            .subscribe();
        } catch (e) {
          console.error("[app-settings] realtime subscribe failed", e);
          setReady(true);
        }
      } catch (e) {
        console.error("[app-settings] realtime subscribe failed", e);
        setReady(true);
      }
    };

    if (isGuestHomePath()) {
      setReady(true);
      cancelIdle = scheduleIdle(() => { void start(); }, 4000);
    } else {
      void start();
    }

    return () => {
      unsubAuth?.();
      cancelIdle?.();
      if (!channel) return;
      void loadBrowserSupabase().then((supabase) => {
        try { supabase.removeChannel(channel as Parameters<typeof supabase.removeChannel>[0]); } catch { /* ignore */ }
      });
    };
  }, []);

  const value = useMemo<AppSettings>(() => {
    const lp = (raw.layout_priority as LayoutPriority) || DEFAULTS.layoutPriority;
    const modules = mergeModuleFlags(raw.modules);
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
