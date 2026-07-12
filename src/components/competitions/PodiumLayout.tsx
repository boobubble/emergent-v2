import { useMemo } from "react";
import { Crown, Medal, Vote, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "./AnimatedCounter";
import { flagFromCode } from "@/lib/country-flag";
import type { Competitor } from "./CompetitorGrid";
import { cn } from "@/lib/utils";

interface Props {
  competitors: Competitor[];
  myVote: string | null;
  canVote: boolean;
  hideCounts?: boolean;
  votingClosed?: boolean;
  votingUpcoming?: boolean;
  onVote: (id: string) => void;
  isVoting?: boolean;
}

const TIERS = [
  { rank: 1, ring: "ring-4 ring-amber-400/70", grad: "from-amber-400 via-yellow-500 to-amber-600", glow: "shadow-[0_0_60px_-10px_rgba(251,191,36,0.7)]", label: "Champion", icon: Crown, h: "h-40 sm:h-56", scale: "scale-110" },
  { rank: 2, ring: "ring-4 ring-zinc-300/60", grad: "from-zinc-200 via-zinc-300 to-zinc-400", glow: "shadow-[0_0_40px_-10px_rgba(212,212,216,0.5)]", label: "Runner-up", icon: Medal, h: "h-28 sm:h-40", scale: "" },
  { rank: 3, ring: "ring-4 ring-orange-400/60", grad: "from-orange-400 via-amber-500 to-orange-600", glow: "shadow-[0_0_40px_-10px_rgba(251,146,60,0.5)]", label: "Third", icon: Medal, h: "h-20 sm:h-32", scale: "" },
];

export function PodiumLayout({ competitors, myVote, canVote, hideCounts, votingClosed, votingUpcoming, onVote, isVoting }: Props) {
  const sorted = useMemo(
    () => [...competitors.filter((c) => !c.is_hidden && !c.is_disqualified)]
      .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)),
    [competitors],
  );
  const total = Math.max(1, sorted.reduce((s, c) => s + (c.vote_count ?? 0), 0));

  // Podium visual order: 2nd, 1st, 3rd
  const order = [sorted[1], sorted[0], sorted[2]].filter(Boolean) as Competitor[];
  const rankByIdx = [2, 1, 3];

  const voteCta = votingClosed ? "🏁 Closed" : votingUpcoming ? "Soon" : "Vote";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4 backdrop-blur-xl sm:p-6">
      {/* Spotlight backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute left-1/4 top-10 h-40 w-40 rounded-full bg-zinc-400/10 blur-3xl" />
        <div className="absolute right-1/4 top-10 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200">
          <Crown className="h-3 w-3" /> Podium
        </div>
      </div>

      <div className="grid grid-cols-3 items-end gap-2 sm:gap-6">
        {order.map((c, i) => {
          const rank = rankByIdx[i];
          const tier = TIERS[rank - 1];
          const Icon = tier.icon;
          const flag = flagFromCode(c.country);
          const pct = Math.round(((c.vote_count ?? 0) / total) * 100);
          const mine = myVote === c.id;
          const uname = c.linked_profile?.username;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 120 }}
              className={cn("flex flex-col items-center", tier.scale)}
            >
              {/* Avatar */}
              <div className="relative">
                {rank === 1 && (
                  <Crown className="absolute left-1/2 -top-6 h-6 w-6 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                )}
                <Avatar className={cn("h-16 w-16 sm:h-24 sm:w-24", tier.ring, tier.glow)}>
                  <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
                  <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
                    {c.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {flag && (
                  <span className="absolute -bottom-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full border border-white/20 bg-background/90 px-1 text-sm shadow">
                    {flag}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="mt-2 flex items-center gap-1 text-center">
                <span className="max-w-[8rem] truncate text-xs font-bold sm:text-sm">{c.name}</span>
                {uname && <BadgeCheck className="h-3 w-3 shrink-0 text-sky-400" />}
              </div>

              {/* Podium block */}
              <div
                className={cn(
                  "mt-2 grid w-full place-items-center rounded-t-xl bg-gradient-to-b text-black shadow-lg",
                  tier.grad,
                  tier.h,
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                  <div className="text-lg font-black leading-none sm:text-2xl">#{rank}</div>
                  {!hideCounts && (
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 sm:text-xs">
                      <AnimatedCounter value={c.vote_count ?? 0} /> · {pct}%
                    </div>
                  )}
                </div>
              </div>

              {/* Vote button */}
              <Button
                size="sm"
                className={cn("mt-2 w-full text-xs", mine && "bg-emerald-600 hover:bg-emerald-600/90")}
                disabled={!canVote || isVoting}
                onClick={() => onVote(c.id)}
              >
                <Vote className="mr-1 h-3 w-3" />
                {mine ? "Voted ✓" : voteCta}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
