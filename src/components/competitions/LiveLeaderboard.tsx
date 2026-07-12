import { useMemo } from "react";
import { Crown, Medal, Trophy, Vote, BadgeCheck, TrendingUp } from "lucide-react";
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

const RANK_STYLE = (r: number) => {
  if (r === 1) return { grad: "from-amber-400 to-yellow-500", text: "text-black", ring: "ring-amber-400/70", icon: <Crown className="h-4 w-4" /> };
  if (r === 2) return { grad: "from-zinc-200 to-zinc-400", text: "text-black", ring: "ring-zinc-300/60", icon: <Medal className="h-4 w-4" /> };
  if (r === 3) return { grad: "from-orange-400 to-amber-600", text: "text-black", ring: "ring-orange-400/60", icon: <Medal className="h-4 w-4" /> };
  return { grad: "from-primary to-fuchsia-500", text: "text-white", ring: "ring-white/10", icon: <Trophy className="h-4 w-4" /> };
};

export function LiveLeaderboard({ competitors, myVote, canVote, hideCounts, votingClosed, votingUpcoming, onVote, isVoting }: Props) {
  const sorted = useMemo(
    () => [...competitors.filter((c) => !c.is_hidden && !c.is_disqualified)]
      .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)),
    [competitors],
  );
  const total = Math.max(1, sorted.reduce((s, c) => s + (c.vote_count ?? 0), 0));
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const voteCta = votingClosed ? "🏁" : votingUpcoming ? "Soon" : "Vote";

  return (
    <div className="space-y-4">
      {/* Sticky Top 3 */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-white/10 bg-[#050308]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200">
            <Trophy className="h-3 w-3" /> Top 3
          </div>
          <div className="text-xs text-muted-foreground">Live rankings</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {top3.map((c, i) => {
            const rank = i + 1;
            const s = RANK_STYLE(rank);
            const pct = Math.round(((c.vote_count ?? 0) / total) * 100);
            const flag = flagFromCode(c.country);
            const mine = myVote === c.id;
            return (
              <motion.div
                key={c.id}
                layout
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur",
                  rank === 1 && "border-amber-400/40 bg-amber-500/5",
                )}
              >
                <div className={cn("absolute -top-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r px-1.5 py-0.5 text-[10px] font-black shadow", s.grad, s.text)}>
                  {s.icon}#{rank}
                </div>
                <Avatar className={cn("h-12 w-12 ring-2", s.ring)}>
                  <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
                  <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
                    {c.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full truncate text-center text-[11px] font-bold">{c.name} {flag}</div>
                {!hideCounts && (
                  <div className="text-[10px] font-semibold text-amber-200">
                    <AnimatedCounter value={c.vote_count ?? 0} /> · {pct}%
                  </div>
                )}
                <Button
                  size="sm"
                  className={cn("h-6 w-full px-1 text-[10px]", mine && "bg-emerald-600 hover:bg-emerald-600/90")}
                  disabled={!canVote || isVoting}
                  onClick={() => onVote(c.id)}
                >
                  {mine ? "✓" : voteCta}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scrollable remaining */}
      <div className="space-y-2">
        {rest.map((c, i) => {
          const rank = i + 4;
          const pct = Math.round(((c.vote_count ?? 0) / total) * 100);
          const flag = flagFromCode(c.country);
          const mine = myVote === c.id;
          const uname = c.linked_profile?.username;
          return (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur transition hover:border-white/20",
                mine && "border-emerald-500/40 bg-emerald-500/5",
              )}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black tabular-nums text-white/80">
                {rank}
              </div>
              <Avatar className="h-11 w-11 shrink-0 ring-1 ring-white/10">
                <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
                <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
                  {c.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm font-bold">{c.name}</span>
                  {flag && <span className="text-sm">{flag}</span>}
                  {uname && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-400" />}
                </div>
                {!hideCounts && (
                  <div className="mt-1">
                    <div className="mb-0.5 flex items-center justify-between text-[10px]">
                      <span className="font-semibold tabular-nums text-white/80">
                        <AnimatedCounter value={c.vote_count ?? 0} /> votes
                      </span>
                      <span className="tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500 transition-[width] duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                className={cn("shrink-0", mine && "bg-emerald-600 hover:bg-emerald-600/90")}
                disabled={!canVote || isVoting}
                onClick={() => onVote(c.id)}
              >
                <Vote className="mr-1 h-3 w-3" />
                {mine ? "Voted" : voteCta}
              </Button>
            </motion.div>
          );
        })}
        {rest.length === 0 && sorted.length > 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-xs text-muted-foreground">
            <TrendingUp className="mx-auto mb-1 h-4 w-4" /> All contenders shown above.
          </div>
        )}
      </div>
    </div>
  );
}
