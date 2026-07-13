import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, BadgeCheck } from "lucide-react";
import { listRecentCompetitionVoters } from "@/lib/competitions.functions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export interface RecentVoter {
  voter_id: string;
  competitor_id: string;
  voted_at: string;
  username: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  is_verified: boolean;
  competitor_name: string | null;
}

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s || 1}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Live horizontal strip of recent supporters. Polls every 15s; also
 * appends instantly via `comp-broadcast:<id>` channel when the local user
 * votes. Uses existing `list_recent_competition_voters` RPC — safe for anon.
 */
export function RecentSupporters({ competitionId }: { competitionId: string }) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const { data = [], refetch } = useQuery({
    queryKey: ["competition-recent-voters", competitionId],
    queryFn: () => fetcher({ data: { competitionId, limit: 30 } }),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  // Live broadcast pings — refetch on any vote broadcast (own or peer relay).
  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "vote" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId, refetch]);

  // Tick to keep "12s ago" fresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  const voters = useMemo(() => (data as RecentVoter[]).slice(0, 30), [data]);

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-pink-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-200">
          <Heart className="h-3 w-3 fill-rose-400 text-rose-400" /> Recent Supporters
        </h3>
        <span className="text-[10px] text-white/50">Live · {voters.length}</span>
      </div>

      {voters.length === 0 ? (
        <div className="grid place-items-center py-4 text-[11px] text-white/50">
          Be the first to vote and cheer someone on.
        </div>
      ) : (
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatePresence initial={false}>
            {voters.map((v) => {
              const gradient = v.avatar_color
                ? `from-white/20 to-white/5`
                : "from-fuchsia-500 via-rose-500 to-amber-400";
              return (
                <motion.div
                  key={`${v.voter_id}-${v.voted_at}`}
                  layout
                  initial={{ opacity: 0, scale: 0.7, x: -12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="mx-1 flex w-[64px] shrink-0 flex-col items-center text-center"
                >
                  <div className={`rounded-full bg-gradient-to-br ${gradient} p-[2px] shadow-[0_0_12px_-3px_rgba(244,63,94,0.7)]`}>
                    <Avatar className="h-11 w-11 border-2 border-black">
                      <AvatarImage src={v.avatar_url ?? undefined} />
                      <AvatarFallback style={{ background: v.avatar_color ?? undefined }}>
                        {(v.username ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="mt-1 flex max-w-full items-center gap-0.5">
                    <span className="truncate text-[10px] font-semibold text-white/90">
                      {v.username ?? "Voter"}
                    </span>
                    {v.is_verified && <BadgeCheck className="h-2.5 w-2.5 shrink-0 text-sky-400" />}
                  </div>
                  <span className="text-[9px] text-white/50">{timeAgo(v.voted_at)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
