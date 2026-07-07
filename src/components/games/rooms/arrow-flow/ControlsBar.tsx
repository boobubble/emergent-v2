import { RotateCcw, Lightbulb, LogOut, Trophy } from "lucide-react";

export function ArrowFlowControls({
  onRestart,
  onHint,
  onLeaderboard,
  onLeave,
  hintCost,
  hintDisabled,
  solved,
}: {
  onRestart: () => void;
  onHint: () => void;
  onLeaderboard: () => void;
  onLeave: () => void;
  hintCost: number;
  hintDisabled: boolean;
  solved: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 md:px-4">
      <button
        onClick={onRestart}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur hover:bg-card"
        aria-label="Restart level"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Restart
      </button>
      <button
        onClick={onHint}
        disabled={hintDisabled || solved}
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Use hint for ${hintCost} coins`}
      >
        <Lightbulb className="h-3.5 w-3.5" /> Hint <span className="opacity-80">· {hintCost} 💎</span>
      </button>
      <button
        onClick={onLeaderboard}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur hover:bg-card"
        aria-label="Show leaderboard"
      >
        <Trophy className="h-3.5 w-3.5" /> Leaderboard
      </button>
      <button
        onClick={onLeave}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur hover:bg-card"
        aria-label="Leave game room"
      >
        <LogOut className="h-3.5 w-3.5" /> Leave
      </button>
    </div>
  );
}
