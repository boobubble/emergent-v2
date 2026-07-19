import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Medal } from "lucide-react";
import { MehfilShell } from "@/components/mehfil/MehfilShell";
import { WriterRankBadge } from "@/components/mehfil/WriterRankBadge";
import type { WriterRank } from "@/lib/mehfil-types";

// Server function inline — public read of writer stats.
export const getMehfilLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data: stats } = await sb.from("mehfil_writer_stats")
    .select("user_id, poems_published, total_upvotes, total_reads, battle_wins, writer_rank")
    .order("total_upvotes", { ascending: false })
    .limit(100);
  const ids = (stats ?? []).map((s: any) => s.user_id);
  const { data: profiles } = ids.length
    ? await sb.from("profiles").select("id, username, display_name, avatar_url").in("id", ids)
    : { data: [] as any[] };
  const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  return (stats ?? []).map((s: any) => ({ ...s, profile: pmap.get(s.user_id) ?? null }));
});

export const Route = createFileRoute("/mehfil/leaderboard")({
  head: () => ({
    meta: [
      { title: "Mehfil Leaderboard · Top Poets" },
      { name: "description", content: "See the top writers on Mehfil ranked by upvotes, reads, and battle wins." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [range] = useState<"all">("all");
  const fetchLb = useServerFn(getMehfilLeaderboard);
  const q = useQuery({ queryKey: ["mehfil", "leaderboard", range], queryFn: () => fetchLb() });

  return (
    <MehfilShell showBack>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">🏆 Mehfil Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Top poets ranked by upvotes, reads, and battle wins.</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_80px_80px] gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
          <span>#</span><span>Writer</span><span className="text-right">Poems</span><span className="text-right">Upvotes</span><span className="text-right">Wins</span>
        </div>
        {q.isLoading && <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>}
        {(q.data ?? []).map((row: any, i: number) => (
          <div key={row.user_id} className="grid grid-cols-[40px_1fr_80px_80px_80px] gap-2 items-center px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/40">
            <span className="font-bold">
              {i === 0 ? <Trophy className="h-4 w-4 text-amber-500" /> : i === 1 ? <Medal className="h-4 w-4 text-slate-400" /> : i === 2 ? <Medal className="h-4 w-4 text-orange-500" /> : i + 1}
            </span>
            <div className="flex items-center gap-3 min-w-0">
              {row.profile?.avatar_url ? (
                <img src={row.profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center text-xs font-semibold">
                  {(row.profile?.display_name || row.profile?.username || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{row.profile?.display_name || row.profile?.username || "Anonymous"}</div>
                <WriterRankBadge rank={row.writer_rank as WriterRank} />
              </div>
            </div>
            <span className="text-right text-sm font-medium">{row.poems_published}</span>
            <span className="text-right text-sm font-medium">{row.total_upvotes}</span>
            <span className="text-right text-sm font-medium">{row.battle_wins}</span>
          </div>
        ))}
      </div>
    </MehfilShell>
  );
}
