import { useEffect, useState } from "react";

function diff(target: Date) {
  const t = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(t / 86400000);
  const h = Math.floor((t % 86400000) / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  return { d, h, m, s, done: t === 0 };
}

export function Countdown({ endAt, compact = false }: { endAt: string; compact?: boolean }) {
  const target = new Date(endAt);
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (t.done) return <span className="text-xs font-semibold text-muted-foreground">Ended</span>;

  const cells: [string, number][] = [
    ["Days", t.d], ["Hours", t.h], ["Min", t.m], ["Sec", t.s],
  ];
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 text-xs font-mono tabular-nums">
        <span>{t.d}d</span><span>{String(t.h).padStart(2, "0")}h</span>
        <span>{String(t.m).padStart(2, "0")}m</span><span>{String(t.s).padStart(2, "0")}s</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {cells.map(([l, v]) => (
        <div key={l} className="flex min-w-[52px] flex-col items-center rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur">
          <span className="text-lg font-bold tabular-nums">{String(v).padStart(2, "0")}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  );
}
