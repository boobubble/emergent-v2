import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { GameRuntimeProps } from "@/lib/games-registry";
import { useChat } from "@/lib/chat-store";
import { useAppSettings } from "@/lib/app-settings";
import { gamify } from "@/lib/gamification-emit";
import {
  listArrowFlowLevels,
  getArrowFlowLevel,
  submitArrowFlowScore,
  buyArrowFlowHint,
} from "@/lib/arrowflow.functions";
import type { Level, Rotation } from "./arrow-flow/logic";
import { useArrowFlowEngine } from "./arrow-flow/useArrowFlowEngine";
import { ArrowFlowBoard } from "./arrow-flow/Board";
import { ArrowFlowHUD } from "./arrow-flow/HUD";
import { ArrowFlowControls } from "./arrow-flow/ControlsBar";
import { ArrowFlowResult } from "./arrow-flow/ResultDialog";
import { ArrowFlowLeaderboard } from "./arrow-flow/LeaderboardPanel";

interface LevelMeta {
  id: string;
  level_number: number;
  difficulty: "easy" | "normal" | "hard" | "expert" | "master";
  grid_size: number;
  par_moves: number;
  par_time_ms: number;
  coin_reward: number;
  xp_reward: number;
  is_featured: boolean;
}
interface FullLevel extends LevelMeta {
  layout: Level;
}

export default function ArrowFlowGame({ room, config }: GameRuntimeProps) {
  const chat = useChat();
  const { raw } = useAppSettings();
  const arrowSettings = (raw.arrowflow as { hintCost?: number; maxHints?: number } | undefined) ?? {};
  const hintCost = arrowSettings.hintCost ?? 15;

  const listFn = useServerFn(listArrowFlowLevels);
  const getFn = useServerFn(getArrowFlowLevel);
  const submitFn = useServerFn(submitArrowFlowScore);
  const hintFn = useServerFn(buyArrowFlowHint);

  const roomDifficulty = (config.difficulty as LevelMeta["difficulty"] | undefined) ?? "easy";

  const [levels, setLevels] = useState<LevelMeta[]>([]);
  const [current, setCurrent] = useState<FullLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<Parameters<typeof ArrowFlowResult>[0]["result"]>(null);
  const [lbOpen, setLbOpen] = useState(false);

  const engine = useArrowFlowEngine(current?.layout ?? null);

  // Load levels for the room's difficulty.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    listFn({ data: { difficulty: roomDifficulty, limit: 100 } })
      .then((r) => {
        if (!alive) return;
        const rows = (r?.levels as LevelMeta[]) ?? [];
        setLevels(rows);
      })
      .catch((e) => toast.error(e.message ?? "Failed to load levels"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [listFn, roomDifficulty]);

  // Load first level.
  useEffect(() => {
    if (current || levels.length === 0) return;
    const first = levels[0];
    getFn({ data: { id: first.id } })
      .then((row) => setCurrent(row as FullLevel))
      .catch((e) => toast.error(e.message ?? "Failed to load level"));
  }, [levels, current, getFn]);

  const loadLevel = useCallback((idx: number) => {
    const meta = levels[idx];
    if (!meta) return;
    setCurrent(null);
    setPersonalBest(null);
    getFn({ data: { id: meta.id } })
      .then((row) => setCurrent(row as FullLevel))
      .catch((e) => toast.error(e.message ?? "Failed to load level"));
    gamify("arrowflow.started", 1, { level: meta.level_number, difficulty: meta.difficulty });
  }, [levels, getFn]);

  // Submit on solve.
  useEffect(() => {
    if (!engine.solved || !current || submitting) return;
    setSubmitting(true);
    (async () => {
      try {
        const r = await submitFn({
          data: {
            levelId: current.id,
            mode: "story",
            timeMs: engine.elapsed,
            moves: engine.moves,
            hintsUsed: engine.hintsUsed,
            moveLog: engine.moveLog,
            roomId: room.id,
          },
        });
        setResult({
          score: r.score,
          stars: r.stars as 1 | 2 | 3,
          perfect: r.perfect,
          newRecord: r.newRecord,
          brokeRoomRecord: r.brokeRoomRecord,
          coinsAwarded: r.coinsAwarded,
          xpAwarded: r.xpAwarded,
          timeMs: engine.elapsed,
          moves: engine.moves,
        });
        setPersonalBest(r.personalBest);
        setResultOpen(true);

        // Gamification events
        gamify("arrowflow.completed", 1, { level: current.level_number, score: r.score });
        if (r.perfect) gamify("arrowflow.perfect", 1, { level: current.level_number });
        if (r.brokeRoomRecord) gamify("arrowflow.record.broken", 1, { level: current.level_number });

        // System-event feed messages (auto only)
        const name = chat.state.me.name ?? "Player";
        chat.pushSystem(room.id, `🏆 ${name} completed Level ${current.level_number}.`);
        if (r.perfect) chat.pushSystem(room.id, `⭐ ${name} achieved a Perfect Solve.`);
        if (r.brokeRoomRecord) chat.pushSystem(room.id, `🔥 ${name} broke the room record.`);
        if (r.coinsAwarded > 0) chat.pushSystem(room.id, `💎 ${name} earned ${r.coinsAwarded} Coins.`);

        // In-app achievement toast reuse
        window.dispatchEvent(new CustomEvent("palrgo:buzz", { detail: { actor: name, reason: `+${r.coinsAwarded} coins` } }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Score submission failed");
      } finally {
        setSubmitting(false);
      }
    })();
  }, [engine.solved, current, engine.elapsed, engine.moves, engine.hintsUsed, engine.moveLog, room.id, submitFn, submitting, chat]);

  const scorePreview = useMemo(() => {
    if (!current) return 0;
    const bases: Record<string, number> = { easy: 100, normal: 200, hard: 400, expert: 800, master: 1600 };
    const base = bases[current.difficulty] ?? 200;
    const timeBonus = Math.max(0, (current.par_time_ms - engine.elapsed) / current.par_time_ms) * base;
    const moveBonus = Math.max(0, (current.par_moves - engine.moves) / current.par_moves) * base * 0.5;
    const hintPenalty = engine.hintsUsed * (base * 0.1);
    return Math.max(0, Math.round(base + timeBonus + moveBonus - hintPenalty));
  }, [current, engine.elapsed, engine.moves, engine.hintsUsed]);

  const onHint = useCallback(async () => {
    if (!current || !engine.level) return;
    try {
      const rots = engine.level.pieces.map((p) => p.rot as Rotation);
      const r = await hintFn({ data: { levelId: current.id, currentRotations: rots } });
      if (r.alreadySolved) return;
      engine.applyHint(r.hintIdx, r.hintRot as Rotation);
      toast("Hint applied", { description: `${r.cost > 0 ? `-${r.cost} coins` : "Free daily hint"}` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not use hint");
    }
  }, [current, engine, hintFn]);

  const goNext = useCallback(() => {
    if (!current) return;
    const idx = levels.findIndex((l) => l.id === current.id);
    const nextIdx = (idx + 1) % Math.max(levels.length, 1);
    setResultOpen(false);
    if (levels[nextIdx]) loadLevel(nextIdx);
  }, [current, levels, loadLevel]);

  const onLeave = useCallback(() => {
    const fallback = chat.state.roomOrder.find((id) => chat.state.rooms[id]?.kind !== "game") || "lobby";
    chat.setActive(fallback);
  }, [chat]);

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
        Loading Arrow Flow…
      </div>
    );
  }
  if (!current || !engine.level) {
    return (
      <div className="grid flex-1 place-items-center px-6 text-center text-xs text-muted-foreground">
        No Arrow Flow levels are configured for this difficulty yet.
        <br />An admin can add levels under <span className="rounded bg-muted px-1 py-0.5 font-mono">/admin/arrowflow</span>.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ArrowFlowHUD
        levelNumber={current.level_number}
        difficulty={current.difficulty}
        elapsed={engine.elapsed}
        moves={engine.moves}
        parMoves={current.par_moves}
        parTimeMs={current.par_time_ms}
        personalBest={personalBest}
        scorePreview={scorePreview}
      />
      <div className="min-h-0 flex-1">
        <ArrowFlowBoard
          level={engine.level}
          powered={engine.powered}
          solved={engine.solved}
          focused={engine.focused}
          setFocused={engine.setFocused}
          onRotate={(i) => engine.rotate(i, "cw")}
          onReverse={(i) => engine.rotate(i, "ccw")}
        />
      </div>
      <ArrowFlowControls
        onRestart={engine.restart}
        onHint={onHint}
        onLeaderboard={() => setLbOpen(true)}
        onLeave={onLeave}
        hintCost={hintCost}
        hintDisabled={!current}
        solved={engine.solved}
      />
      <ArrowFlowResult
        open={resultOpen}
        onNext={goNext}
        onReplay={() => { setResultOpen(false); engine.restart(); }}
        result={result}
      />
      <ArrowFlowLeaderboard
        open={lbOpen}
        onOpenChange={setLbOpen}
        levelId={current.id}
        roomId={room.id}
      />
    </div>
  );
}
