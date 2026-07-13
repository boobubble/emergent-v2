import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, BadgeCheck } from "lucide-react";
import { listRecentCompetitionVoters } from "@/lib/competitions.functions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Voter {
  voter_id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  is_verified: boolean;
  voted_at: string;
}

/**
 * Aggregates recent voter events (existing RPC) into "most active supporters".
 * No new table / RPC — pure client aggregation of the last 200 vote events.
 */
export function TopSupporters({ competitionId }: { competitionId: string }) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const { data = [], refetch } = useQuery({
    queryKey: ["competition-top-supporters", competitionId],
    queryFn: () => fetcher({ data: { competitionId, limit: 200 } }),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "vote" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId, refetch]);

  const top = useMemo(() => {
    const byVoter = new Map<string, { v: Voter; count: number }>();
    for (const v of data as Voter[]) {
      const key = v.voter_id;
      if (!key) continue;
      const cur = byVoter.get(key);
      if (cur) cur.count += 1;
      else byVoter.set(key, { v, count: 1 });
    }
    return Array.from(byVoter.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (top.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-200">
          <Users className="h-3 w-3" /> Most Active Supporters
        </h3>
        <span className="text-[10px] text-white/50">Top {top.length}</span>
      </div>
      <ol className="grid gap-1.5">
        {top.map((entry, idx) => (
          <li
            key={entry.v.voter_id}
            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5"
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                idx === 0
                  ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black"
                  : idx === 1
                    ? "bg-gradient-to-br from-zinc-200 to-zinc-400 text-black"
                    : idx === 2
                      ? "bg-gradient-to-br from-orange-400 to-orange-600 text-black"
                      : "bg-white/10 text-white/70"
              }`}
            >
              {idx + 1}
            </span>
            <Avatar className="h-7 w-7 border border-white/10">
              <AvatarImage src={entry.v.avatar_url ?? undefined} />
              <AvatarFallback style={{ background: entry.v.avatar_color ?? undefined }}>
                {(entry.v.username ?? "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90">
                <span className="truncate">{entry.v.username ?? "Supporter"}</span>
                {entry.v.is_verified && <BadgeCheck className="h-2.5 w-2.5 shrink-0 text-sky-400" />}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-white/90">
              {entry.count} {entry.count === 1 ? "vote" : "votes"}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
