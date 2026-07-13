import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Heart, Crown, Trophy } from "lucide-react";
import { listRecentCompetitionVoters } from "@/lib/competitions.functions";
import { supabase } from "@/integrations/supabase/client";

interface FeedItem {
  id: string;
  kind: "vote" | "leader" | "milestone";
  ts: number;
  text: string;
  actor?: string | null;
  target?: string | null;
}

const MAX = 20;

/**
 * Live battle activity feed. Reads recent votes via SECURITY DEFINER RPC
 * and mixes in leader-change / milestone events derived from the competitor
 * list passed in.
 */
export function BattleActivityFeed({
  competitionId,
  topLeaderName,
  totalVotes,
}: {
  competitionId: string;
  topLeaderName?: string | null;
  totalVotes?: number;
}) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const { data = [] } = useQuery({
    queryKey: ["competition-recent-voters", competitionId],
    queryFn: () => fetcher({ data: { competitionId, limit: 20 } }),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const [extras, setExtras] = useState<FeedItem[]>([]);
  const lastLeaderRef = useRef<string | null>(null);
  const lastMilestoneRef = useRef<number>(0);

  // Leader-change detection
  useEffect(() => {
    if (!topLeaderName) return;
    if (lastLeaderRef.current && lastLeaderRef.current !== topLeaderName) {
      setExtras((prev) => [
        {
          id: `leader-${Date.now()}`,
          kind: "leader",
          ts: Date.now(),
          text: `${topLeaderName} took the lead 👑`,
        },
        ...prev,
      ].slice(0, MAX));
    }
    lastLeaderRef.current = topLeaderName;
  }, [topLeaderName]);

  // Milestones: every 100 votes
  useEffect(() => {
    if (!totalVotes) return;
    const bucket = Math.floor(totalVotes / 100);
    if (bucket > 0 && bucket > lastMilestoneRef.current) {
      lastMilestoneRef.current = bucket;
      setExtras((prev) => [
        {
          id: `ms-${bucket}`,
          kind: "milestone",
          ts: Date.now(),
          text: `🏆 ${bucket * 100} votes reached!`,
        },
        ...prev,
      ].slice(0, MAX));
    }
  }, [totalVotes]);

  // Cross-viewer broadcast — flash a transient feed line the moment someone votes
  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "vote" }, (msg) => {
        const payload = (msg.payload ?? {}) as { voter?: string; target?: string };
        setExtras((prev) => [
          {
            id: `bc-${Date.now()}-${Math.random()}`,
            kind: "vote",
            ts: Date.now(),
            text: `${payload.voter ?? "Someone"} voted for ${payload.target ?? "a nominee"}`,
          },
          ...prev,
        ].slice(0, MAX));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId]);

  const items = useMemo<FeedItem[]>(() => {
    const voteItems: FeedItem[] = (data as any[]).map((v) => ({
      id: `v-${v.voter_id}-${v.voted_at}`,
      kind: "vote",
      ts: new Date(v.voted_at).getTime(),
      text: `${v.username ?? "A supporter"} voted for ${v.competitor_name ?? "a nominee"}`,
      actor: v.username,
      target: v.competitor_name,
    }));
    return [...extras, ...voteItems]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, MAX);
  }, [data, extras]);

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-200">
          <Activity className="h-3 w-3" /> Battle Activity
        </h3>
        <span className="inline-flex items-center gap-1 text-[10px] text-white/50">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
          </span>
          Live
        </span>
      </div>

      {items.length === 0 ? (
        <div className="grid place-items-center py-6 text-[11px] text-white/50">
          Activity will appear here as votes come in.
        </div>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
          <AnimatePresence initial={false}>
            {items.map((it) => (
              <motion.li
                key={it.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-[11px]"
              >
                {it.kind === "vote" && <Heart className="h-3 w-3 shrink-0 fill-rose-400 text-rose-400" />}
                {it.kind === "leader" && <Crown className="h-3 w-3 shrink-0 text-amber-400" />}
                {it.kind === "milestone" && <Trophy className="h-3 w-3 shrink-0 text-amber-300" />}
                <span className="truncate text-white/85">{it.text}</span>
                <span className="ml-auto shrink-0 text-[9px] text-white/40">
                  {Math.max(1, Math.floor((Date.now() - it.ts) / 1000))}s
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
