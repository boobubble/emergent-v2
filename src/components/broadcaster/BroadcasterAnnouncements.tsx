// Broadcaster announcement surfaces — pure consumers, fully additive.
// Subscribes to the radio_announcements table via realtime and:
//   • <BroadcasterTicker target="chatbar|feed|widget" /> renders a scrolling
//     announcement strip filtered by the chosen target channel.
//   • <BroadcasterAnnouncementsRunner /> mounts a global listener that fires
//     a sonner toast for each new active "community" announcement.
//
// No existing chat / feed / radio playback files are modified beyond a
// one-line render injection of these components.

import { useEffect, useMemo, useRef, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { canPlaySound } from "@/lib/sound-prefs";
import type { Database } from "@/integrations/supabase/types";

type Announcement = Database["public"]["Tables"]["radio_announcements"]["Row"];

type Target = "widget" | "chatbar" | "notifications" | "feed";

function isLive(a: Announcement): boolean {
  if (!a.active) return false;
  const now = Date.now();
  if (a.starts_at && new Date(a.starts_at).getTime() > now) return false;
  if (a.ends_at && new Date(a.ends_at).getTime() < now) return false;
  return true;
}

function targetEnabled(a: Announcement, t: Target): boolean {
  const tg = a.target as Record<string, boolean> | null;
  if (!tg) return true;
  return tg[t] !== false;
}

function useAnnouncements(filter?: { widgetId?: string | null; kind?: string }) {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let q = supabase
        .from("radio_announcements")
        .select("*")
        .eq("active", true)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      if (filter?.kind) q = q.eq("kind", filter.kind);
      if (filter?.widgetId === null) q = q.is("widget_id", null);
      else if (filter?.widgetId) q = q.eq("widget_id", filter.widgetId);
      const { data } = await q;
      if (!cancelled) setItems(((data ?? []) as Announcement[]).filter(isLive));
    };
    load();

    const channel = supabase
      .channel(`broadcaster-announcements-${filter?.kind ?? "all"}-${filter?.widgetId ?? "any"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "radio_announcements" },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [filter?.kind, filter?.widgetId]);

  return items;
}

export function BroadcasterTicker({
  target,
  widgetId,
  className,
}: {
  target: Target;
  widgetId?: string | null;
  className?: string;
}) {
  const items = useAnnouncements({ widgetId });

  const dismissKey = `broadcaster_ticker_dismissed.${target}.v1`;
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(dismissKey);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });
  const persistDismissed = (next: Set<string>) => {
    setDismissed(next);
    if (typeof window !== "undefined") {
      try { localStorage.setItem(dismissKey, JSON.stringify([...next])); } catch { /* noop */ }
    }
  };

  const visible = useMemo(
    () =>
      items.filter((a) => {
        if (dismissed.has(a.id)) return false;
        if (!targetEnabled(a, target)) return false;
        if (target === "widget") return a.kind === "upcoming_show" || a.kind === "ticker";
        if (target === "chatbar") return a.kind === "ticker" || a.kind === "upcoming_show";
        if (target === "feed") return a.kind === "ticker" || a.kind === "community";
        return true;
      }),
    [items, target, dismissed],
  );

  if (visible.length === 0) return null;

  const dismissAll = () => {
    const next = new Set(dismissed);
    visible.forEach((a) => next.add(a.id));
    persistDismissed(next);
  };

  return (
    <div
      className={
        "flex items-center gap-2 overflow-hidden bg-primary/10 px-3 py-1.5 text-xs " +
        (className ?? "")
      }
      role="status"
      aria-live="polite"
    >
      <Megaphone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
      <div className="truncate flex-1 min-w-0">
        {visible.map((a, i) => (
          <span key={a.id}>
            {i > 0 && <span className="mx-2 text-muted-foreground">•</span>}
            <span className="font-medium">{a.title}</span>
            {a.body && <span className="text-muted-foreground"> — {a.body}</span>}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={dismissAll}
        className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background/60 hover:text-foreground transition-colors"
        title="Dismiss announcement"
        aria-label="Dismiss announcement"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/**
 * Global background listener. Fires a sonner toast whenever a new live
 * "community" announcement (notifications target enabled) is inserted, and a
 * lighter toast for live "ticker" announcements with the feed target enabled
 * (so the existing feed-bot surface picks them up without changes).
 */
export function BroadcasterAnnouncementsRunner() {
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Prime the cache with already-existing IDs so we don't replay history.
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("radio_announcements")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      (data ?? []).forEach((r) => seen.current.add(r.id));
    })();

    const channel = supabase
      .channel("broadcaster-announcements-runner")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "radio_announcements" },
        (payload) => {
          const a = payload.new as Announcement;
          if (seen.current.has(a.id)) return;
          seen.current.add(a.id);
          if (!isLive(a)) return;

          // Respect per-user mute for radio announcements/alerts.
          if (!canPlaySound("radio_announcements")) return;

          if (a.kind === "community" && targetEnabled(a, "notifications")) {
            toast(a.title, {
              description: a.body ?? undefined,
              icon: "📣",
              duration: 6000,
            });
          } else if (a.kind === "ticker" && targetEnabled(a, "feed")) {
            toast.message(`📻 ${a.title}`, {
              description: a.body ?? undefined,
              duration: 5000,
            });
          } else if (a.kind === "upcoming_show" && targetEnabled(a, "notifications")) {
            toast.message(`🎙️ ${a.title}`, {
              description: a.body ?? "A new show is coming up.",
              duration: 5000,
            });
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
