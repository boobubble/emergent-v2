/**
 * Poetry Hub realtime hooks — thin wrappers over Supabase Realtime for
 * mehfil_poems row changes (upvote/read/view counters) and battle
 * participant vote counts.
 *
 * Browser client is loaded only inside useEffect (never during SSR).
 */
import { useEffect } from "react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";

/**
 * Subscribe to a single poem row and invoke `onChange` with the fresh row
 * whenever counts change (upvote_count, read_count, view_count, etc.).
 */
export function useMehfilPoemRealtime(
  poemId: string | null | undefined,
  onChange: (row: Record<string, unknown>) => void,
) {
  useEffect(() => {
    if (!poemId) return;
    let cancelled = false;
    let channel: { unsubscribe?: () => Promise<unknown> } | null = null;
    let sb: Awaited<ReturnType<typeof loadBrowserSupabase>> | null = null;

    void (async () => {
      const client = await loadBrowserSupabase();
      if (cancelled) return;
      sb = client;
      const next = client
        .channel(`mehfil-poem-${poemId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "mehfil_poems", filter: `id=eq.${poemId}` },
          (payload) => {
            if (payload.new) onChange(payload.new as Record<string, unknown>);
          },
        )
        .subscribe();
      if (cancelled) {
        void client.removeChannel(next);
        return;
      }
      channel = next;
    })();

    return () => {
      cancelled = true;
      if (sb && channel) void sb.removeChannel(channel as never);
    };
  }, [poemId, onChange]);
}

/**
 * Subscribe to a Poetry Battle's ranked entries. Fires the provided
 * callback (typically a `queryClient.invalidateQueries`) whenever a
 * participant row changes for the given competition.
 */
export function useBattleRankingRealtime(
  competitionId: string | null | undefined,
  onBump: () => void,
) {
  useEffect(() => {
    if (!competitionId) return;
    let cancelled = false;
    let channel: { unsubscribe?: () => Promise<unknown> } | null = null;
    let sb: Awaited<ReturnType<typeof loadBrowserSupabase>> | null = null;

    void (async () => {
      const client = await loadBrowserSupabase();
      if (cancelled) return;
      sb = client;
      const next = client
        .channel(`poetry-battle-${competitionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "competition_participants",
            filter: `competition_id=eq.${competitionId}`,
          },
          () => onBump(),
        )
        .subscribe();
      if (cancelled) {
        void client.removeChannel(next);
        return;
      }
      channel = next;
    })();

    return () => {
      cancelled = true;
      if (sb && channel) void sb.removeChannel(channel as never);
    };
  }, [competitionId, onBump]);
}
