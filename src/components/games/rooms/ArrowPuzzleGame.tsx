import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUp, RotateCcw, Lightbulb, Trophy, Timer as TimerIcon } from "lucide-react";
import type { GameRuntimeProps } from "@/lib/games-registry";
import { useChat } from "@/lib/chat-store";
import { gamify } from "@/lib/gamification-emit";

/** Directions in 90° increments: 0=up, 1=right, 2=down, 3=left. */
type Dir = 0 | 1 | 2 | 3;

function difficultyToGrid(d: string | undefined): { size: number; scrambles: number } {
  if (d === "easy") return { size: 3, scrambles: 4 };
  if (d === "hard") return { size: 5, scrambles: 12 };
  return { size: 4, scrambles: 8 };
}

function neighbors(idx: number, size: number): number[] {
  const r = Math.floor(idx / size);
  const c = idx % size;
  const out: number[] = [idx];
  if (r > 0) out.push(idx - size);
  if (r < size - 1) out.push(idx + size);
  if (c > 0) out.push(idx - 1);
  if (c < size - 1) out.push(idx + 1);
  return out;
}

function scramble(size: number, moves: number): Dir[] {
  const arr: Dir[] = new Array(size * size).fill(0);
  for (let i = 0; i < moves; i++) {
    const idx = Math.floor(Math.random() * arr.length);
    for (const n of neighbors(idx, size)) {
      arr[n] = ((arr[n] + 1) % 4) as Dir;
    }
  }
  // Ensure not already solved
  if (arr.every(d => d === 0)) return scramble(size, moves);
  return arr;
}

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2, "0")}:${String(rs).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export default function ArrowPuzzleGame({ room, config }: GameRuntimeProps) {
  const { pushSystem, state } = useChat();
  const meName = state.me.name;
  const { size, scrambles } = useMemo(() => difficultyToGrid(config.difficulty), [config.difficulty]);
  const [tiles, setTiles] = useState<Dir[]>(() => scramble(size, scrambles));
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(`arrow-best:${room.id}`);
    return v ? Number(v) : null;
  });

  const solved = tiles.every(d => d === 0);
  const elapsed = won ? 0 : Math.max(0, now - startedAt);
  const score = Math.max(0, Math.round(1000 - moves * 15 - Math.floor(elapsed / 250)));

  // Ticker
  useEffect(() => {
    if (won) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [won]);

  // Handle solve transition
  useEffect(() => {
    if (!solved || won) return;
    setWon(true);
    const finalTime = Date.now() - startedAt;
    const finalScore = Math.max(0, Math.round(1000 - moves * 15 - Math.floor(finalTime / 250)));
    const perfect = moves <= scrambles;
    const isBest = best == null || finalScore > best;
    if (isBest && typeof window !== "undefined") {
      localStorage.setItem(`arrow-best:${room.id}`, String(finalScore));
      setBest(finalScore);
    }
    pushSystem(
      room.id,
      `🏆 @${meName} solved ${room.name} in ${fmtTime(finalTime)} · ${moves} moves · +${finalScore} pts${isBest ? " · 🔥 new personal best" : ""}${perfect ? " · ⭐ Perfect Solve" : ""}`,
    );
    gamify("arrow.level.completed", 1, {
      room: room.id,
      difficulty: config.difficulty ?? "normal",
      moves,
      time_ms: finalTime,
      score: finalScore,
    });
    if (perfect) gamify("arrow.perfect.solve", 1, { room: room.id });
    if (config.dailyChallenge) gamify("daily.challenge.completed", 1, { room: room.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  // Emit join/leave presence events
  useEffect(() => {
    gamify("game.room.joined", 1, { room: room.id, game: config.type });
    return () => {
      gamify("game.room.left", 1, { room: room.id, game: config.type });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const rotate = useCallback((idx: number) => {
    if (won) return;
    setTiles(prev => {
      const next = [...prev];
      for (const n of neighbors(idx, size)) {
        next[n] = ((next[n] + 1) % 4) as Dir;
      }
      return next;
    });
    setMoves(m => m + 1);
    setHint(null);
  }, [size, won]);

  const restart = useCallback(() => {
    setTiles(scramble(size, scrambles));
    setMoves(0);
    setStartedAt(Date.now());
    setNow(Date.now());
    setWon(false);
    setHint(null);
  }, [size, scrambles]);

  const showHint = useCallback(() => {
    if (won) return;
    // Naive hint: highlight a tile whose rotation reduces total non-zero neighbours.
    let bestIdx = 0;
    let bestScore = Infinity;
    for (let i = 0; i < tiles.length; i++) {
      const trial = [...tiles];
      for (const n of neighbors(i, size)) trial[n] = ((trial[n] + 1) % 4) as Dir;
      const s = trial.reduce((acc, d) => acc + (d === 0 ? 0 : 1), 0);
      if (s < bestScore) { bestScore = s; bestIdx = i; }
    }
    setHint(bestIdx);
  }, [tiles, size, won]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-4 px-4 py-6 sm:py-8">
      {/* Stats bar */}
      <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Time" value={fmtTime(elapsed)} icon={<TimerIcon className="h-3.5 w-3.5" />} />
        <Stat label="Moves" value={String(moves)} />
        <Stat label="Score" value={String(score)} />
        <Stat label="Best" value={best != null ? String(best) : "—"} icon={<Trophy className="h-3.5 w-3.5 text-amber-400" />} />
      </div>

      {/* Grid */}
      <div
        className="grid gap-1.5 rounded-2xl border border-border bg-card/60 p-3 shadow-lg backdrop-blur"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {tiles.map((d, i) => {
          const solved = d === 0;
          const isHint = hint === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => rotate(i)}
              className={`grid aspect-square w-14 place-items-center rounded-xl border transition sm:w-16 ${
                solved
                  ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                  : "border-border bg-background/60 text-foreground hover:border-primary/50 hover:bg-primary/10"
              } ${isHint ? "ring-2 ring-amber-400 animate-pulse" : ""}`}
              aria-label={`Arrow tile ${i}`}
              disabled={won}
            >
              <ArrowUp
                className="h-6 w-6 transition-transform sm:h-7 sm:w-7"
                style={{ transform: `rotate(${d * 90}deg)` }}
              />
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
        <button
          type="button"
          onClick={showHint}
          disabled={won}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/50 disabled:opacity-40"
        >
          <Lightbulb className="h-4 w-4" /> Hint
        </button>
      </div>

      {won && (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 text-center text-sm text-emerald-200">
          🎉 Solved! Tap Restart to play again.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-3 py-1.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
