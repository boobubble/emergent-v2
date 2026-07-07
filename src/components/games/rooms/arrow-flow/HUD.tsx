import { Timer, MousePointerClick, Sparkles, Trophy } from "lucide-react";

export function ArrowFlowHUD({
  levelNumber,
  difficulty,
  elapsed,
  moves,
  parMoves,
  parTimeMs,
  personalBest,
  scorePreview,
}: {
  levelNumber: number;
  difficulty: string;
  elapsed: number;
  moves: number;
  parMoves: number;
  parTimeMs: number;
  personalBest: number | null;
  scorePreview: number;
}) {
  const timeStr = fmt(elapsed);
  const parStr = fmt(parTimeMs);
  return (
    <div className="grid grid-cols-2 gap-2 px-3 pt-2 md:grid-cols-4 md:px-4">
      <Stat
        icon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
        label={`Level ${levelNumber} · ${difficulty}`}
        value={scorePreview.toLocaleString()}
        sub={personalBest != null ? `PB ${personalBest.toLocaleString()}` : "New level"}
      />
      <Stat
        icon={<Timer className="h-3.5 w-3.5 text-primary" />}
        label="Time"
        value={timeStr}
        sub={`par ${parStr}`}
      />
      <Stat
        icon={<MousePointerClick className="h-3.5 w-3.5 text-primary" />}
        label="Moves"
        value={String(moves)}
        sub={`par ${parMoves}`}
      />
      <Stat
        icon={<Trophy className="h-3.5 w-3.5 text-primary" />}
        label="Stars preview"
        value={starsFor(scorePreview, difficulty)}
        sub="1–3 ★"
      />
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-card/50 px-3 py-2 backdrop-blur-md">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
        {icon}
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-bold text-foreground">{value}</div>
        {sub && <div className="truncate text-[10px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s - m * 60;
  return `${String(m).padStart(1, "0")}:${String(rs).padStart(2, "0")}`;
}

function starsFor(score: number, difficulty: string) {
  const bases: Record<string, number> = { easy: 100, normal: 200, hard: 400, expert: 800, master: 1600 };
  const b = bases[difficulty] ?? 200;
  const n = score >= b * 1.8 ? 3 : score >= b * 1.2 ? 2 : 1;
  return "★".repeat(n) + "☆".repeat(3 - n);
}
