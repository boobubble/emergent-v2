import { Lightbulb, Pause, Play, RotateCcw, Star, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HUD({
  levelNumber, difficulty, timeMs, moves, parMoves, parTime,
  hintsUsed, hintCost, canHint, paused,
  onHint, onPause, onResume, onRestart,
}: {
  levelNumber: number;
  difficulty: string;
  timeMs: number;
  moves: number;
  parMoves: number;
  parTime: number;
  hintsUsed: number;
  hintCost: number;
  canHint: boolean;
  paused: boolean;
  onHint(): void;
  onPause(): void;
  onResume(): void;
  onRestart(): void;
}) {
  return (
    <div className="mx-auto w-full max-w-[680px] px-2 pt-3">
      <div className="rounded-2xl border border-border/60 bg-card/70 p-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">Level {levelNumber}</div>
            <Badge variant="secondary" className="capitalize">{difficulty}</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <div className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{fmt(timeMs)} / {fmt(parTime * 1000)}</div>
            <div>·</div>
            <div>{moves} / {parMoves} moves</div>
            <div>·</div>
            <div className="flex items-center gap-0.5"><Star className="h-3 w-3" />{hintsUsed} hints</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onHint} disabled={!canHint}>
            <Lightbulb className="mr-1.5 h-4 w-4" />
            Hint {hintCost > 0 ? `· ${hintCost}c` : "· Free"}
          </Button>
          {paused ? (
            <Button size="sm" variant="outline" onClick={onResume}>
              <Play className="mr-1.5 h-4 w-4" /> Resume
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onPause}>
              <Pause className="mr-1.5 h-4 w-4" /> Pause
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onRestart}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Restart
          </Button>
        </div>
      </div>
    </div>
  );
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
