import { Timer, Move, Gauge, Sparkles } from "lucide-react";

/**
 * Compact single-row status bar. Small rounded pills, premium spacing.
 * Sits directly under the game header. No big cards, no control buttons —
 * those live in FloatingControls, overlaid on the board.
 */
export function HUD({
  difficulty, timeMs, moves, parMoves, parTime, hintsUsed,
}: {
  levelNumber: number;
  difficulty: string;
  timeMs: number;
  moves: number;
  parMoves: number;
  parTime: number;
  hintsUsed: number;
}) {
  const movesLeft = Math.max(0, parMoves - moves);
  const overTime = timeMs > parTime * 1000;
  return (
    <div className="mx-auto flex w-full max-w-[560px] items-center justify-center gap-1.5 px-2 pt-2 pb-1">
      <Pill icon={<Timer className="h-3 w-3" />} value={fmt(timeMs)} tone={overTime ? "warn" : "default"} />
      <Pill icon={<Move className="h-3 w-3" />} value={`${movesLeft}`} sub={`/${parMoves}`} />
      <Pill icon={<Gauge className="h-3 w-3" />} value={difficulty} capitalize />
      <Pill icon={<Sparkles className="h-3 w-3" />} value={String(hintsUsed)} tone="muted" />
    </div>
  );
}

function Pill({
  icon, value, sub, tone = "default", capitalize,
}: {
  icon: React.ReactNode;
  value: string;
  sub?: string;
  tone?: "default" | "muted" | "warn";
  capitalize?: boolean;
}) {
  const toneCls =
    tone === "warn"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/25"
      : tone === "muted"
      ? "bg-muted/50 text-muted-foreground ring-border/60"
      : "bg-background/70 text-foreground ring-border/60";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ring-1 backdrop-blur-md " +
        toneCls
      }
    >
      {icon}
      <span className={capitalize ? "capitalize" : undefined}>{value}</span>
      {sub && <span className="text-muted-foreground/80 font-normal">{sub}</span>}
    </span>
  );
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
