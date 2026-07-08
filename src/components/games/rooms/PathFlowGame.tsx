import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChat } from "@/lib/chat-store";
import { gamify } from "@/lib/gamification-emit";
import type { GameRuntimeProps } from "@/lib/games-registry";
import { Board } from "./path-flow/Board";
import { HUD } from "./path-flow/HUD";
import { FloatingControls } from "./path-flow/FloatingControls";
import { ResultDialog } from "./path-flow/ResultDialog";
import { useEngine } from "./path-flow/useEngine";
import { nextHintPiece, type Level } from "./path-flow/logic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

const HINT_COST_DEFAULT = 20;

async function fetchLevel(levelNumber: number): Promise<Level | null> {
  const { data } = await sb
    .from("pathflow_levels")
    .select("id, number, difficulty, grid_w, grid_h, layout, solution, par_moves, par_time, coin_reward, xp_reward")
    .eq("enabled", true)
    .gte("number", levelNumber)
    .order("number", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as Level | null) ?? null;
}

async function fetchProgress(userId: string | null): Promise<{ highest: number }> {
  if (!userId) return { highest: 0 };
  const { data } = await sb.from("pathflow_progress").select("highest_level").eq("user_id", userId).maybeSingle();
  return { highest: (data?.highest_level as number) ?? 0 };
}

export default function PathFlowGame({ room }: GameRuntimeProps) {
  const { pushSystem, authUserId } = useChat() as unknown as {
    pushSystem: (channelId: string, text: string) => void;
    authUserId: string | null;
  };

  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<null | { stars: number; perfect: boolean; coins: number; xp: number; record: boolean; timeMs: number; moves: number }>(null);
  const [hintHighlight, setHintHighlight] = useState<string | null>(null);

  const { state, tryPlace, applyHint, pause, resume, restart } = useEngine(level);

  // Initial load: continue from highest + 1.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { highest } = await fetchProgress(authUserId);
      const lvl = await fetchLevel(highest + 1);
      if (!cancelled) {
        setLevel(lvl);
        setLoading(false);
        if (lvl) gamify("pathflow.started", 1, { level: lvl.number });
      }
    })();
    return () => { cancelled = true };
  }, [authUserId]);

  // On win: submit score.
  useEffect(() => {
    if (state.status !== "won" || !level || !authUserId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await sb.rpc("pathflow_submit_score", {
        _level_id: level.id,
        _time_ms: state.timeMs,
        _moves: state.moves,
        _hints_used: state.hintsUsed,
        _kind: "level",
        _room_id: room.id,
      });
      if (cancelled) return;
      if (error) {
        toast.error(error.message || "Score rejected");
        return;
      }
      const r = data as { stars: number; perfect: boolean; coins: number; xp: number; record_broken: boolean };
      setResult({
        stars: r.stars, perfect: r.perfect, coins: r.coins, xp: r.xp,
        record: r.record_broken, timeMs: state.timeMs, moves: state.moves,
      });
      gamify("pathflow.completed", 1, { level: level.number, stars: r.stars });
      if (r.perfect) gamify("pathflow.perfect", 1, { level: level.number });
      if (r.record_broken) gamify("pathflow.record.broken", 1, { level: level.number });

      const you = "You";
      pushSystem(room.id, `🏆 ${you} completed Level ${level.number} (${r.stars}★)`);
      if (r.perfect) pushSystem(room.id, `⭐ ${you} achieved a Perfect Solve!`);
      if (r.coins > 0) pushSystem(room.id, `💎 ${you} earned ${r.coins} Coins.`);
      if (r.record_broken) pushSystem(room.id, `🔥 ${you} set a new world record!`);
    })();
    return () => { cancelled = true };
  }, [state.status, state.timeMs, state.moves, state.hintsUsed, level, authUserId, pushSystem, room.id]);

  const handleHint = useCallback(async () => {
    if (!level) return;
    if (!authUserId) {
      applyHint();
      return;
    }
    const { data, error } = await sb.rpc("pathflow_buy_hint", { _cost: HINT_COST_DEFAULT });
    if (error) {
      toast.error(error.message || "Not enough coins for a hint");
      return;
    }
    const nxt = nextHintPiece(level, state.positions);
    setHintHighlight(nxt?.id ?? null);
    applyHint();
    window.setTimeout(() => setHintHighlight(null), 900);
    void data;
  }, [level, authUserId, applyHint, state.positions]);

  const goNext = useCallback(async () => {
    if (!level) return;
    setResult(null);
    const nxt = await fetchLevel(level.number + 1);
    if (nxt) setLevel(nxt);
    else toast.info("You've completed every published level. New ones coming soon!");
  }, [level]);

  const canHint = state.status === "playing";

  const boardArea = useMemo(() => {
    if (loading) return <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading level…</div>;
    if (!level) return (
      <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
        No enabled Path Flow levels yet. Ask an admin to publish some from <span className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[11px]">/admin/pathflow</span>.
      </div>
    );
    return (
      <Board
        level={level}
        positions={state.positions}
        disabled={state.status !== "playing"}
        hintPieceId={hintHighlight}
        onMove={tryPlace}
      />
    );
  }, [loading, level, state.positions, state.status, hintHighlight, tryPlace]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* board fills the entire viewport */}
      <div className="relative min-h-0 flex-1">{boardArea}</div>

      {/* HUD floats over the top, does not consume layout height */}
      {level && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
          <div className="pointer-events-auto">
            <HUD
              levelNumber={level.number}
              difficulty={level.difficulty}
              timeMs={state.timeMs}
              moves={state.moves}
              parMoves={level.par_moves}
              parTime={level.par_time}
              hintsUsed={state.hintsUsed}
            />
          </div>
        </div>
      )}

      {level && (
        <FloatingControls
          canHint={canHint}
          paused={state.status === "paused"}
          hintCost={HINT_COST_DEFAULT}
          onHint={handleHint}
          onPause={pause}
          onResume={resume}
          onRestart={restart}
        />
      )}

      <ResultDialog
        open={!!result}
        stars={result?.stars ?? 0}
        perfect={result?.perfect ?? false}
        timeMs={result?.timeMs ?? 0}
        moves={result?.moves ?? 0}
        coins={result?.coins ?? 0}
        xp={result?.xp ?? 0}
        recordBroken={result?.record ?? false}
        onNext={goNext}
        onReplay={() => { setResult(null); restart(); }}
        onClose={() => setResult(null)}
      />
    </div>
  );
}
