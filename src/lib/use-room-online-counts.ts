import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to the existing `room-presence:<channelId>` Supabase Realtime
 * presence channels as an observer (does NOT track this client) and returns
 * a { [channelId]: onlineCount } map that updates in realtime.
 *
 * Works for guests (uses the public anon key) and reuses the same presence
 * infrastructure the chat UI already runs — no extra DB queries.
 */
export function useRoomOnlineCounts(channelIds: string[]): Record<string, number> {
  const key = channelIds.slice().sort().join(",");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!channelIds.length) return;
    const channels = channelIds.map((id) => {
      const ch = supabase.channel(`room-presence:${id}`, {
        // Observer key — no track() call, so we don't inflate the count.
        config: { presence: { key: `observer-${Math.random().toString(36).slice(2)}` } },
      });
      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState();
        // Unique user keys currently present.
        const uniq = new Set<string>();
        for (const k of Object.keys(state)) {
          const metas: any[] = (state as any)[k];
          if (!metas?.length) continue;
          uniq.add((metas[0]?.user_id as string) || k);
        }
        // Filter out other observers.
        const real = Array.from(uniq).filter((u) => !u.startsWith("observer-"));
        setCounts((prev) => (prev[id] === real.length ? prev : { ...prev, [id]: real.length }));
      }).subscribe();
      return ch;
    });

    return () => {
      for (const ch of channels) supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return counts;
}
