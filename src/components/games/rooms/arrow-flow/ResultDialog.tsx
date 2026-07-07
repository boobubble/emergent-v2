import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Sparkles, Coins, Star } from "lucide-react";

export function ArrowFlowResult({
  open,
  onNext,
  onReplay,
  result,
}: {
  open: boolean;
  onNext: () => void;
  onReplay: () => void;
  result: {
    score: number;
    stars: 1 | 2 | 3;
    perfect: boolean;
    newRecord: boolean;
    brokeRoomRecord: boolean;
    coinsAwarded: number;
    xpAwarded: number;
    timeMs: number;
    moves: number;
  } | null;
}) {
  if (!result) return null;
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-sm border border-border/50 bg-gradient-to-br from-background via-card to-background backdrop-blur-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {result.perfect ? "Perfect Solve" : result.newRecord ? "New Personal Best" : "Level Complete"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 pt-1">
          <div className="grid place-items-center py-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`h-8 w-8 ${n <= result.stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Cell icon={<Trophy className="h-4 w-4 text-primary" />} label="Score" value={result.score.toLocaleString()} />
            <Cell icon={<Coins className="h-4 w-4 text-amber-400" />} label="Coins" value={`+${result.coinsAwarded}`} />
            <Cell icon={<Sparkles className="h-4 w-4 text-emerald-400" />} label="XP" value={`+${result.xpAwarded}`} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs text-muted-foreground">
            <div className="rounded-xl border border-border/40 bg-card/40 px-3 py-2 backdrop-blur">Time · {fmt(result.timeMs)}</div>
            <div className="rounded-xl border border-border/40 bg-card/40 px-3 py-2 backdrop-blur">Moves · {result.moves}</div>
          </div>
          {result.brokeRoomRecord && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-center text-xs font-semibold text-amber-300">
              🔥 You broke this room's record
            </div>
          )}
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <button
              onClick={onReplay}
              className="rounded-full border border-border/40 bg-card/60 px-4 py-2 text-xs font-semibold text-foreground hover:bg-card"
            >
              Play again
            </button>
            <button
              onClick={onNext}
              className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-xs font-semibold text-primary-foreground shadow"
            >
              Next level
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Cell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 px-2 py-2 backdrop-blur">
      <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">{icon}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s - m * 60).padStart(2, "0")}`;
}
