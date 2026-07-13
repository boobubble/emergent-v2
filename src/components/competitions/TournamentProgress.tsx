import { useEffect, useState } from "react";
import { CalendarClock, Flag, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  startAt: string;
  endAt: string;
  status: string;
}

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function humanRemain(ms: number) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

/**
 * Premium tournament progress bar — animated violet→amber gradient
 * with start / now / end markers.
 */
export function TournamentProgress({ startAt, endAt, status }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const total = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(total, now - start));
  const pct = Math.round((elapsed / total) * 100);
  const remain = end - now;
  const upcoming = status === "upcoming" || now < start;
  const done = status === "completed" || remain <= 0;

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="inline-flex items-center gap-1 text-violet-200">
          <Hourglass className="h-3 w-3" /> Tournament Progress
        </span>
        <span className="text-white/70">
          {upcoming ? "Starts soon" : done ? "Completed" : `${pct}% completed`}
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-black/50 shadow-inner">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 shadow-[0_0_16px_rgba(217,70,239,0.6)]"
          initial={false}
          animate={{ width: `${upcoming ? 0 : done ? 100 : pct}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 22 }}
        />
        {!upcoming && !done && (
          <motion.div
            aria-hidden
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.9)]"
            animate={{ left: `${pct}%`, scale: [1, 1.15, 1] }}
            transition={{ left: { type: "spring", stiffness: 60, damping: 22 }, scale: { duration: 1.4, repeat: Infinity } }}
          />
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/50">
            <Flag className="h-2.5 w-2.5" /> Start
          </div>
          <div className="mt-0.5 truncate font-semibold text-white/90">{fmt(new Date(startAt))}</div>
        </div>
        <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1.5">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-300">
            <CalendarClock className="h-2.5 w-2.5" /> {done ? "Ended" : "Now"}
          </div>
          <div className="mt-0.5 truncate font-semibold text-amber-100">
            {done ? "Voting closed" : humanRemain(remain)}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-right">
          <div className="flex items-center justify-end gap-1 text-[9px] uppercase tracking-wider text-white/50">
            End <Flag className="h-2.5 w-2.5" />
          </div>
          <div className="mt-0.5 truncate font-semibold text-white/90">{fmt(new Date(endAt))}</div>
        </div>
      </div>
    </section>
  );
}
