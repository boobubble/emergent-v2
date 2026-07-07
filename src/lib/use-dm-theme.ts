import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPersonalTheme,
  fetchSharedTheme,
  fetchWallpaperCatalog,
  type DmSharedThemeRow,
  type DmThemeRow,
  type DmWallpaper,
} from "./dm-wallpapers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export interface ActiveDmTheme {
  wallpaper: DmWallpaper | null;
  opacity: number;
  blur: number;
  brightness: number;
  overlay: number;
  bubbleAccent: string | null;
  source: "shared" | "personal" | "default";
}

const DEFAULT_THEME: ActiveDmTheme = {
  wallpaper: null,
  opacity: 1,
  blur: 0,
  brightness: 1,
  overlay: 0,
  bubbleAccent: null,
  source: "default",
};

interface UseDmThemeResult extends ActiveDmTheme {
  catalog: DmWallpaper[];
  loading: boolean;
  refresh: () => void;
}

/**
 * Resolves the active theme for a DM channel.
 *  - Shared theme takes precedence over the user's personal theme.
 *  - No-op for non-DM channels (returns defaults, no fetches).
 */
export function useDmTheme(channelId: string | null | undefined, userId: string | null | undefined): UseDmThemeResult {
  const isDm = !!channelId && channelId.startsWith("dm:");
  const [catalog, setCatalog] = useState<DmWallpaper[]>([]);
  const [personal, setPersonal] = useState<DmThemeRow | null>(null);
  const [shared, setShared] = useState<DmSharedThemeRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchWallpaperCatalog()
      .then((rows) => { if (!cancelled) setCatalog(rows); })
      .catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isDm || !channelId || !userId) {
      setPersonal(null);
      setShared(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchPersonalTheme(channelId, userId).catch(() => null),
      fetchSharedTheme(channelId).catch(() => null),
    ]).then(([p, s]) => {
      if (cancelled) return;
      setPersonal(p);
      setShared(s);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isDm, channelId, userId, reloadCounter]);

  // Realtime: pick up shared-theme changes made by the other participant.
  useEffect(() => {
    if (!isDm || !channelId) return;
    const channel = sb
      .channel(`dm-shared-theme-${channelId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dm_shared_themes", filter: `channel_id=eq.${channelId}` },
        (payload: { new: DmSharedThemeRow | null; old: DmSharedThemeRow | null; eventType: string }) => {
          if (payload.eventType === "DELETE") setShared(null);
          else setShared(payload.new ?? null);
        },
      )
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [isDm, channelId]);

  const refresh = useCallback(() => setReloadCounter((n) => n + 1), []);

  const active = useMemo<ActiveDmTheme>(() => {
    if (!isDm) return DEFAULT_THEME;
    const row: (DmThemeRow | DmSharedThemeRow) | null = shared ?? personal ?? null;
    if (!row) return DEFAULT_THEME;
    const wp = row.wallpaper_key ? catalog.find((w) => w.wallpaper_key === row.wallpaper_key) ?? null : null;
    return {
      wallpaper: wp,
      opacity: Number(row.opacity ?? 1),
      blur: Number(row.blur ?? 0),
      brightness: Number(row.brightness ?? 1),
      overlay: Number(row.overlay ?? 0),
      bubbleAccent: row.bubble_accent ?? null,
      source: shared ? "shared" : "personal",
    };
  }, [isDm, catalog, personal, shared]);

  return { ...active, catalog, loading, refresh };
}
