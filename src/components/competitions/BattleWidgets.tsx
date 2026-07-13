import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, TrendingUp, TrendingDown, Minus, Crown, PartyPopper, Rocket, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Competitor } from "@/components/competitions/CompetitorGrid";

/* ============================================================
 * Head-to-Head Battle Widget (Top 2)
 * ============================================================ */
export function HeadToHeadBattle({
  competitors,
  canVote,
  onVote,
  isVoting,
  myVote,
}: {
  competitors: Competitor[];
  canVote: boolean;
  onVote: (id: string) => void;
  isVoting: boolean;
  myVote: string | null;
}) {
  const sorted = useMemo(
    () => [...competitors].filter((c) => !c.is_hidden && !c.is_disqualified).sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)),
    [competitors]
  );
  const [a, b] = sorted;
  if (!a || !b) return null;

  const total = Math.max(1, (a.vote_count ?? 0) + (b.vote_count ?? 0));
  const pctA = Math.round(((a.vote_count ?? 0) / total) * 100);
  const pctB = 100 - pctA;
  const diff = Math.abs((a.vote_count ?? 0) - (b.vote_count ?? 0));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/[0.06] to-rose-500/10 p-3 backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-fuchsia-200">
          <Flame className="h-3 w-3" /> Head-to-Head
        </h3>
        <span className="text-[10px] text-white/60">
          Lead: <span className="font-bold text-amber-300">+{diff}</span>
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <VsSide c={a} pct={pctA} isLeader align="left" canVote={canVote} onVote={onVote} isVoting={isVoting} mine={myVote === a.id} />
        <div className="grid place-items-center">
          <span className="rounded-full bg-gradient-to-br from-amber-400 to-rose-500 px-2 py-0.5 text-[10px] font-black text-black shadow-lg sm:px-2.5 sm:text-xs">VS</span>
        </div>
        <VsSide c={b} pct={pctB} align="right" canVote={canVote} onVote={onVote} isVoting={isVoting} mine={myVote === b.id} />
      </div>
      {/* Combined bar */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <div className="flex h-full">
          <div className="bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500" style={{ width: `${pctA}%` }} />
          <div className="bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all duration-500" style={{ width: `${pctB}%` }} />
        </div>
      </div>
    </section>
  );
}

function VsSide({
  c,
  pct,
  isLeader,
  align,
  canVote,
  onVote,
  isVoting,
  mine,
}: {
  c: Competitor;
  pct: number;
  isLeader?: boolean;
  align: "left" | "right";
  canVote: boolean;
  onVote: (id: string) => void;
  isVoting: boolean;
  mine: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 text-center ${align === "right" ? "" : ""}`}>
      <div className={`rounded-full p-[2px] ${isLeader ? "bg-gradient-to-br from-amber-300 via-amber-400 to-rose-500 shadow-[0_0_16px_-2px_rgba(251,191,36,0.7)]" : "bg-gradient-to-br from-fuchsia-500 to-violet-500"}`}>
        <Avatar className="h-14 w-14 border-2 border-black sm:h-16 sm:w-16">
          <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
          <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
            {(c.name ?? "?").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-1">
        {isLeader && <Crown className="h-3 w-3 text-amber-400" />}
        <span className="max-w-[90px] truncate text-xs font-bold sm:max-w-[130px] sm:text-sm">{c.name}</span>
      </div>
      <div className="text-[10px] text-white/60">
        <span className="font-bold text-white/90">{c.vote_count ?? 0}</span> · {pct}%
      </div>
      <Button
        size="sm"
        disabled={!canVote || isVoting || mine}
        onClick={() => onVote(c.id)}
        className={`h-7 rounded-full px-3 text-[10px] font-bold ${
          mine
            ? "bg-emerald-500/20 text-emerald-200"
            : "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white hover:from-fuchsia-400 hover:to-rose-400"
        }`}
      >
        {mine ? "✓ Voted" : "Vote"}
      </Button>
    </div>
  );
}

/* ============================================================
 * Battle Intensity Meter (based on realtime broadcast pings)
 * ============================================================ */
export function BattleIntensityMeter({ competitionId }: { competitionId: string }) {
  // Rolling window: timestamps of vote pings in last 60s
  const bucketRef = useRef<number[]>([]);
  const [rate, setRate] = useState(0);

  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: true } } })
      .on("broadcast", { event: "vote" }, () => {
        bucketRef.current.push(Date.now());
      })
      .subscribe();
    const iv = setInterval(() => {
      const cutoff = Date.now() - 60_000;
      bucketRef.current = bucketRef.current.filter((t) => t >= cutoff);
      setRate(bucketRef.current.length);
    }, 1000);
    return () => {
      clearInterval(iv);
      supabase.removeChannel(ch);
    };
  }, [competitionId]);

  const { label, color, pct } = useMemo(() => {
    if (rate >= 30) return { label: "Extreme", color: "from-rose-500 via-orange-500 to-amber-400", pct: 100 };
    if (rate >= 12) return { label: "High", color: "from-fuchsia-500 to-rose-500", pct: 75 };
    if (rate >= 4) return { label: "Medium", color: "from-violet-500 to-fuchsia-500", pct: 50 };
    if (rate >= 1) return { label: "Low", color: "from-sky-500 to-violet-500", pct: 25 };
    return { label: "Calm", color: "from-white/20 to-white/10", pct: 8 };
  }, [rate]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-200">
          <Flame className="h-3 w-3 text-orange-400" /> Battle Intensity
        </h3>
        <span className="text-[10px] font-bold text-white/80">
          {label} · <span className="text-white/50">{rate}/min</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
    </section>
  );
}

/* ============================================================
 * Live Leader Change Banner
 * ============================================================ */
export function LiveLeaderBanner({
  topLeaderName,
}: {
  topLeaderName: string | null;
}) {
  const [visible, setVisible] = useState<string | null>(null);
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (!topLeaderName) return;
    if (prevRef.current === null) {
      prevRef.current = topLeaderName;
      return;
    }
    if (prevRef.current !== topLeaderName) {
      prevRef.current = topLeaderName;
      setVisible(topLeaderName);
      const t = setTimeout(() => setVisible(null), 4500);
      return () => clearTimeout(t);
    }
  }, [topLeaderName]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="pointer-events-none fixed inset-x-0 top-16 z-40 mx-auto w-max max-w-[92%] rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-4 py-2 text-center text-xs font-black text-black shadow-[0_10px_40px_-10px_rgba(251,191,36,0.8)] sm:text-sm"
        >
          <Crown className="mr-1.5 inline h-4 w-4" />
          {visible} takes the lead!
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
 * Vote Milestone cards (100/500/1k/5k)
 * ============================================================ */
const MILESTONES: { at: number; icon: any; label: string; color: string }[] = [
  { at: 100, icon: PartyPopper, label: "100 Votes", color: "from-sky-500 to-violet-500" },
  { at: 500, icon: Flame, label: "500 Votes", color: "from-violet-500 to-fuchsia-500" },
  { at: 1000, icon: Rocket, label: "1,000 Votes", color: "from-fuchsia-500 to-rose-500" },
  { at: 5000, icon: Trophy, label: "5,000 Votes", color: "from-amber-400 to-rose-500" },
];

export function VoteMilestones({ totalVotes }: { totalVotes: number }) {
  const nextIdx = MILESTONES.findIndex((m) => totalVotes < m.at);
  const reached = nextIdx === -1 ? MILESTONES : MILESTONES.slice(0, nextIdx);
  const next = nextIdx === -1 ? null : MILESTONES[nextIdx];
  if (totalVotes < 10 && reached.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-200">
          <Sparkles className="h-3 w-3" /> Milestones
        </h3>
        {next && (
          <span className="text-[10px] text-white/60">
            Next: <span className="font-bold text-white/90">{next.at - totalVotes}</span> to {next.label}
          </span>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MILESTONES.map((m) => {
          const done = totalVotes >= m.at;
          const Icon = m.icon;
          return (
            <div
              key={m.at}
              className={`flex min-w-[110px] shrink-0 items-center gap-2 rounded-xl border p-2 transition ${
                done
                  ? `border-transparent bg-gradient-to-br ${m.color} text-white shadow-lg`
                  : "border-white/10 bg-white/[0.02] text-white/40"
              }`}
            >
              <Icon className={`h-4 w-4 ${done ? "" : ""}`} />
              <div>
                <div className="text-[11px] font-bold leading-tight">{m.label}</div>
                <div className="text-[9px] opacity-80">{done ? "Unlocked" : `${m.at - totalVotes} to go`}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
 * Momentum helper (for cards / leaderboard rows)
 * Uses recent broadcast pings, tagged per competitor via target name.
 * ============================================================ */
export function useCompetitorMomentum(competitionId: string): Record<string, "rising" | "falling" | "stable"> {
  const [map, setMap] = useState<Record<string, "rising" | "falling" | "stable">>({});
  const bucketRef = useRef<{ name: string; t: number }[]>([]);

  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: true } } })
      .on("broadcast", { event: "vote" }, (msg: any) => {
        const name = msg?.payload?.target as string | null;
        if (name) bucketRef.current.push({ name, t: Date.now() });
      })
      .subscribe();
    const iv = setInterval(() => {
      const cutoff = Date.now() - 120_000; // 2 min window
      bucketRef.current = bucketRef.current.filter((x) => x.t >= cutoff);
      const counts: Record<string, number> = {};
      for (const x of bucketRef.current) counts[x.name] = (counts[x.name] ?? 0) + 1;
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      const next: Record<string, "rising" | "falling" | "stable"> = {};
      for (const [name, n] of Object.entries(counts)) {
        const share = n / total;
        if (share >= 0.4 && n >= 3) next[name] = "rising";
        else if (n === 0) next[name] = "falling";
        else next[name] = "stable";
      }
      setMap(next);
    }, 2000);
    return () => {
      clearInterval(iv);
      supabase.removeChannel(ch);
    };
  }, [competitionId]);

  return map;
}

export function MomentumBadge({ state }: { state?: "rising" | "falling" | "stable" }) {
  if (!state || state === "stable") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-white/60">
        <Minus className="h-2.5 w-2.5" /> Stable
      </span>
    );
  }
  if (state === "rising") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
        <TrendingUp className="h-2.5 w-2.5" /> Rising
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
      <TrendingDown className="h-2.5 w-2.5" /> Slowing
    </span>
  );
}
