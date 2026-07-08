import { Sparkles, Star, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ResultDialog({
  open, stars, perfect, timeMs, moves, coins, xp, recordBroken,
  onNext, onReplay, onClose,
}: {
  open: boolean;
  stars: number;
  perfect: boolean;
  timeMs: number;
  moves: number;
  coins: number;
  xp: number;
  recordBroken: boolean;
  onNext(): void;
  onReplay(): void;
  onClose(): void;
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogTitle className="text-center text-lg">
          {perfect ? "Perfect Solve!" : "Level Complete"}
        </DialogTitle>

        <div className="flex justify-center gap-1.5 pt-2">
          {[1, 2, 3].map(n => (
            <Star
              key={n}
              className={
                "h-9 w-9 transition-transform " +
                (n <= stars
                  ? "fill-yellow-400 text-yellow-400 " + (n === 3 ? "scale-110" : "")
                  : "text-muted-foreground/40")
              }
            />
          ))}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          <Stat label="Time" value={fmt(timeMs)} />
          <Stat label="Moves" value={String(moves)} />
          <Stat label="Coins" value={`+${coins}`} icon="💎" />
          <Stat label="XP" value={`+${xp}`} icon="✨" />
        </div>

        {recordBroken && (
          <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-sm text-primary">
            <Trophy className="h-4 w-4" /> New world record!
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onReplay}>Replay</Button>
          <Button className="flex-1" onClick={onNext}>
            <Sparkles className="mr-1.5 h-4 w-4" /> Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">{icon ? `${icon} ` : ""}{value}</div>
    </div>
  );
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
