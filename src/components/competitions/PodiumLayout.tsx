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
  { rank: 1, ring: "ring-[3px] ring-amber-400/70", grad: "from-amber-400 via-yellow-500 to-amber-600", glow: "shadow-[0_0_40px_-10px_rgba(251,191,36,0.6)]", label: "Champion", icon: Crown, h: "h-28 sm:h-40", scale: "scale-105" },
  { rank: 2, ring: "ring-[3px] ring-zinc-300/60", grad: "from-zinc-200 via-zinc-300 to-zinc-400", glow: "shadow-[0_0_28px_-10px_rgba(212,212,216,0.45)]", label: "Runner-up", icon: Medal, h: "h-20 sm:h-28", scale: "" },
  { rank: 3, ring: "ring-[3px] ring-orange-400/60", grad: "from-orange-400 via-amber-500 to-orange-600", glow: "shadow-[0_0_28px_-10px_rgba(251,146,60,0.45)]", label: "Third", icon: Medal, h: "h-14 sm:h-22", scale: "" },
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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4">
      {/* Spotlight backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute left-1/4 top-8 h-28 w-28 rounded-full bg-zinc-400/10 blur-3xl" />
        <div className="absolute right-1/4 top-8 h-28 w-28 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <div className="mb-3 text-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-200">
          <Crown className="h-2.5 w-2.5" /> Podium
        </div>
      </div>

      <div className="grid grid-cols-3 items-end gap-1.5 sm:gap-4">
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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 120 }}
              className={cn("flex flex-col items-center", tier.scale)}
            >
              {/* Avatar */}
              <div className="relative">
                {rank === 1 && (
                  <Crown className="absolute left-1/2 -top-4 h-4 w-4 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                )}
                <Avatar className={cn("h-12 w-12 sm:h-16 sm:w-16", tier.ring, tier.glow)}>
                  <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
                  <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
                    {c.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {flag && (
                  <span className="absolute -bottom-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full border border-white/20 bg-background/90 px-1 text-xs shadow">
                    {flag}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="mt-1.5 flex items-center gap-1 text-center">
                <span className="max-w-[6rem] truncate text-[11px] font-bold sm:text-xs">{c.name}</span>
                {uname && <BadgeCheck className="h-2.5 w-2.5 shrink-0 text-sky-400" />}
              </div>

              {/* Podium block */}
              <div
                className={cn(
                  "mt-1.5 grid w-full place-items-center rounded-t-lg bg-gradient-to-b text-black shadow-md",
                  tier.grad,
                  tier.h,
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <div className="text-base font-black leading-none sm:text-xl">#{rank}</div>
                  {!hideCounts && (
                    <div className="text-[9px] font-bold uppercase tracking-wider opacity-80 sm:text-[10px]">
                      <AnimatedCounter value={c.vote_count ?? 0} /> · {pct}%
                    </div>
                  )}
                </div>
              </div>

              {/* Vote button */}
              <Button
                size="sm"
                className={cn("mt-1.5 h-8 w-full text-[11px]", mine && "bg-emerald-600 hover:bg-emerald-600/90")}
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
