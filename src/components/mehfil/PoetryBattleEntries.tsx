import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBattleRankingRealtime } from "@/lib/mehfil-realtime";
import { useServerFn } from "@tanstack/react-start";
import { Feather, Heart, Eye, Crown, MessageCircle, Share2, BadgeCheck } from "lucide-react";
import { getPoetryBattle } from "@/lib/mehfil-battles.functions";
import { poemPreview, WRITER_RANK_LABEL, WRITER_RANK_COLOR } from "@/lib/mehfil-types";
import { flagFromCode } from "@/lib/country-flag";

/**
 * Poetry Cards for a Poetry Battle competition.
 * Reuses the existing Competition Engine (participants + vote_count).
 * Rank + progress bar + live position are computed from the participants
 * ordered by vote_count, updated via existing Realtime channel.
 */
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
  const entries = data?.entries ?? [];
  if (poems.length === 0) return null;

  // Merge poem + participant score, sort by votes.
  const byPoem = new Map(entries.map((e: any) => [e.mehfil_poem_id, e]));
  const rows = poems
    .map((p) => ({ p, e: byPoem.get(p.id) as any }))
    .sort((a, b) => (b.e?.vote_count ?? 0) - (a.e?.vote_count ?? 0));
  const topScore = Math.max(1, rows[0]?.e?.vote_count ?? 1);

  return (
    <section className="mt-6 scroll-mt-20">
      <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold text-white">
        <Feather className="h-4 w-4 text-primary" /> Poetry Entries
        <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
          {poems.length}
        </span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(({ p, e }, idx) => {
          const rank = idx + 1;
          const votes = e?.vote_count ?? 0;
          const pct = Math.round((votes / topScore) * 100);
          const rankColor = rank === 1 ? "text-amber-300" : rank === 2 ? "text-slate-200" : rank === 3 ? "text-orange-400" : "text-white/70";
          const author: any = p.author;
          return (
            <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/50">
              {rank === 1 && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                  <Crown className="h-3 w-3" /> Leading
                </span>
              )}

              {/* Author row */}
              <div className="mb-2 flex items-center gap-2">
                <div className={`text-lg font-black tabular-nums ${rankColor}`}>#{rank}</div>
                {author?.avatar_url ? (
                  <img src={author.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-white/10" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 truncate text-xs font-semibold text-white">
                    <span className="truncate">@{author?.username ?? "anon"}</span>
                    {author?.is_verified && <BadgeCheck className="h-3 w-3 shrink-0 text-sky-400" />}
                    {author?.country_code && <span className="shrink-0 text-[11px]">{countryFlagEmoji(author.country_code)}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <span className="rounded px-1 py-0.5" style={{ background: `${WRITER_RANK_COLOR[p.writer_rank]}22`, color: WRITER_RANK_COLOR[p.writer_rank] }}>
                      {WRITER_RANK_LABEL[p.writer_rank]}
                    </span>
                    {p.category && <span>· {p.category.name}</span>}
                  </div>
                </div>
              </div>

              {/* Poetry preview */}
              <Link to="/mehfil/$slug" params={{ slug: p.slug }} className="block">
                <div className="line-clamp-1 text-sm font-semibold text-white group-hover:text-primary">{p.title}</div>
                <div className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-white/70">{poemPreview(p.body, 180)}</div>
              </Link>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-white/60">
                  <span>Score {votes.toLocaleString()}</span>
                  <span>{pct}%</span>
                </div>
              </div>

              {/* Metrics + action */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-white/60">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3 text-rose-400" /> {p.upvote_count ?? 0}</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {p.read_count ?? 0}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {p.comment_count ?? 0}</span>
                  <span className="inline-flex items-center gap-1"><Share2 className="h-3 w-3" /> {p.share_count ?? 0}</span>
                </div>
                <Link to="/mehfil/$slug" params={{ slug: p.slug }}
                  className="rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-2.5 py-1 text-[10px] font-bold text-white hover:from-fuchsia-400 hover:to-rose-400">
                  Open Poetry
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
