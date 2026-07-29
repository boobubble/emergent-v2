import { r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
function useMehfilPoemRealtime(poemId, onChange) {
  reactExports.useEffect(() => {
    if (!poemId) return;
    const channel = supabase.channel(`mehfil-poem-${poemId}`).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "mehfil_poems", filter: `id=eq.${poemId}` },
      (payload) => {
        if (payload.new) onChange(payload.new);
      }
    ).subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [poemId, onChange]);
}
function useBattleRankingRealtime(competitionId, onBump) {
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const channel = supabase.channel(`poetry-battle-${competitionId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "competition_participants",
        filter: `competition_id=eq.${competitionId}`
      },
      () => onBump()
    ).subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [competitionId, onBump]);
}
export {
  useMehfilPoemRealtime as a,
  useBattleRankingRealtime as u
};
