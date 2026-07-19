/**
 * Mehfil realtime hooks — thin wrappers over Supabase Realtime for
 * mehfil_poems row changes (upvote/read/view counters) and battle
 * participant vote counts.
 */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    const channel = supabase
      .channel(`mehfil-poem-${poemId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mehfil_poems", filter: `id=eq.${poemId}` },
        (payload) => {
          if (payload.new) onChange(payload.new as Record<string, unknown>);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
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
    const channel = supabase
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
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [competitionId, onBump]);
}
