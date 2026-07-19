import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBattleRankingRealtime } from "@/lib/mehfil-realtime";
import { useServerFn } from "@tanstack/react-start";
import { Feather, Heart, Eye, Crown } from "lucide-react";
import { getPoetryBattle } from "@/lib/mehfil-battles.functions";
import { poemPreview } from "@/lib/mehfil-types";

export function PoetryBattleEntries({ slug }: { slug: string }) {
  const fetchBattle = useServerFn(getPoetryBattle);
  const { data } = useQuery({
    queryKey: ["poetry-battle", slug],
    queryFn: () => fetchBattle({ data: { slug } }),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });

  const qc = useQueryClient();
  useBattleRankingRealtime(data?.battle?.id ?? null, () => {
    void qc.invalidateQueries({ queryKey: ["poetry-battle", slug] });
  });

  const poems = data?.poems ?? [];
  if (poems.length === 0) return null;

  return (
    <section className="mt-6 scroll-mt-20">
      <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold text-white">
        <Feather className="h-4 w-4 text-primary" /> Poetry Entries
        <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
          {poems.length}
        </span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {poems.map((p, idx) => (
          <Link
            key={p.id}
            to="/mehfil/$slug"
            params={{ slug: p.slug }}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/50"
          >
            {idx === 0 && (
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                <Crown className="h-3 w-3" /> Leading
              </span>
            )}
            <div className="mb-1 text-[10px] uppercase tracking-wider text-white/50">
              @{p.author?.username ?? "anon"}
              {p.category && <> · {p.category.name}</>}
            </div>
            <div className="line-clamp-1 text-sm font-semibold text-white group-hover:text-primary">{p.title}</div>
            <div className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-white/60">{poemPreview(p.body, 140)}</div>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-white/60">
              <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3 text-rose-400" /> {p.upvote_count ?? 0}</span>
              <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {p.read_count ?? 0}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
