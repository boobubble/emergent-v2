import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { SectionShell } from "../ui/SectionShell";

export interface LiveStats {
  members: number;
  online: number;
  rooms: number;
  djs: number;
  postsToday: number;
}

function AnimatedCounter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = n;
    const to = value;
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span>{n.toLocaleString()}</span>;
}

function StatValue({ loaded, value, fetched }: { loaded: boolean; value: number; fetched: boolean }) {
  if (!loaded) {
    return <span className="inline-block animate-pulse opacity-50">—</span>;
  }
  if (!fetched && value === 0) {
    return <span className="opacity-50">—</span>;
  }
  return <AnimatedCounter value={value} />;
}

const STAT_ITEMS: { emoji: string; label: string; key: keyof LiveStats; fetched: boolean }[] = [
  { emoji: "👥", label: "Members", key: "members", fetched: true },
  { emoji: "🟢", label: "Online", key: "online", fetched: true },
  { emoji: "💬", label: "Chatrooms", key: "rooms", fetched: false },
  { emoji: "📝", label: "Posts Today", key: "postsToday", fetched: true },
];

export function StatsSection({ stats, loaded }: { stats: LiveStats; loaded: boolean }) {
  return (
    <SectionShell className="!px-4 !py-10 sm:!px-5 sm:!py-12">
      <GlassCard className="p-4 sm:p-6 md:p-8 [data-hero-theme=light]:border-violet-200/60 [data-hero-theme=light]:bg-white/80 [data-hero-theme=light]:shadow-[0_8px_32px_rgba(124,58,237,0.08)]">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider opacity-70 sm:mb-5 sm:text-xs">
          <Flame className="h-4 w-4 shrink-0 text-orange-400" />
          Live community pulse
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STAT_ITEMS.map((sc) => (
            <div
              key={sc.key}
              className="flex min-h-[88px] flex-col items-center justify-center rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.06] to-cyan-500/[0.03] p-3 text-center [data-hero-theme=light]:border-violet-200/50 [data-hero-theme=light]:from-violet-500/[0.04] [data-hero-theme=light]:to-indigo-500/[0.02] sm:min-h-[96px] sm:p-4"
            >
              <div className="text-xl sm:text-2xl">{sc.emoji}</div>
              <div className="mt-1 text-[clamp(1.125rem,4vw,1.875rem)] font-black leading-none tracking-tight">
                <StatValue loaded={loaded} value={stats[sc.key]} fetched={sc.fetched} />
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider opacity-60">{sc.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </SectionShell>
  );
}
