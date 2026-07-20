import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Feather, Heart, Eye, Trophy, MessageCircle, Star, Flame, Swords, Award } from "lucide-react";
import { getMehfilProfileSection } from "@/lib/mehfil.functions";
import { WriterRankBadge } from "@/components/mehfil/WriterRankBadge";
import { poemPreview } from "@/lib/mehfil-types";

export function ProfileMehfilSection({ username }: { username: string }) {
  const fetchSection = useServerFn(getMehfilProfileSection);
  const { data, isLoading } = useQuery({
    queryKey: ["mehfil", "profile-section", username],
    queryFn: () => fetchSection({ data: { username, limit: 6 } }),
    staleTime: 60_000,
  });

  if (isLoading || !data?.profile) return null;
  const { stats, poems, featured, trending, hof, active_battles, battle_history, categories_written, favorite_category } = data;

  const hasAny =
    (stats && (stats.poems_published ?? 0) > 0) ||
    poems.length > 0 ||
    (active_battles?.length ?? 0) > 0 ||
    (hof?.length ?? 0) > 0;
  if (!hasAny) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Feather className="h-3.5 w-3.5 text-primary" /> Mehfil · Poetry
        </h2>
        <Link to="/poetry" className="text-[11px] font-semibold text-primary hover:underline">Explore Mehfil →</Link>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="mb-3 rounded-2xl border border-border bg-card px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <WriterRankBadge rank={stats.writer_rank} />
            {favorite_category && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: `${favorite_category.color ?? "#7c3aed"}22`, color: favorite_category.color ?? "#7c3aed" }}
              >
                ★ {favorite_category.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            <MiniStat icon={<BookOpen className="h-3.5 w-3.5" />} label="Poems" value={stats.poems_published ?? 0} />
            <MiniStat icon={<Heart className="h-3.5 w-3.5 text-rose-400" />} label="Upvotes" value={stats.total_upvotes ?? 0} />
            <MiniStat icon={<Eye className="h-3.5 w-3.5" />} label="Reads" value={stats.total_reads ?? 0} />
            <MiniStat icon={<MessageCircle className="h-3.5 w-3.5" />} label="Comments" value={stats.total_comments ?? 0} />
            <MiniStat icon={<Trophy className="h-3.5 w-3.5 text-warning" />} label="Wins" value={stats.battle_wins ?? 0} />
            <MiniStat icon={<Star className="h-3.5 w-3.5 text-amber-400" />} label="Featured" value={stats.featured_count ?? 0} />
            <MiniStat icon={<Award className="h-3.5 w-3.5 text-fuchsia-400" />} label="Hall of Fame" value={stats.hof_count ?? hof?.length ?? 0} />
            <MiniStat icon={<Swords className="h-3.5 w-3.5 text-cyan-400" />} label="Active Battles" value={active_battles?.length ?? 0} />
          </div>
        </div>
      )}

      {/* Active battles */}
      {(active_battles?.length ?? 0) > 0 && (
        <div className="mb-3">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Battles</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {active_battles.slice(0, 4).map((b: any) => (
              <Link key={b.competition_id} to="/competitions/$slug" params={{ slug: b.competition_slug }}
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-3 hover:border-cyan-400/60">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-300">
                  <Swords className="h-3 w-3" /> {b.status === "live" ? "Live" : "Upcoming"}
                </div>
                <div className="line-clamp-1 text-sm font-semibold">{b.competition_name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {b.rank ? `#${b.rank}` : "—"} · {b.vote_count} votes
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent poems */}
      {poems.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent Poems</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {poems.map((p) => (<PoemChip key={p.id} p={p} />))}
          </div>
        </div>
      )}

      {/* Trending */}
      {(trending?.length ?? 0) > 0 && (
        <div className="mb-3">
          <h3 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Flame className="h-3 w-3 text-orange-400" /> Trending
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {trending.map((p) => (<PoemChip key={p.id} p={p} />))}
          </div>
        </div>
      )}

      {/* Featured */}
      {(featured?.length ?? 0) > 0 && (
        <div className="mb-3">
          <h3 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Star className="h-3 w-3 text-amber-400" /> Featured Poems
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {featured.map((p) => (<PoemChip key={p.id} p={p} />))}
          </div>
        </div>
      )}

      {/* Battle history */}
      {(battle_history?.length ?? 0) > 0 && (
        <div className="mb-3">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Battle History</h3>
          <div className="grid gap-1.5">
            {battle_history.map((b: any) => (
              <Link key={b.competition_id} to="/competitions/$slug" params={{ slug: b.competition_slug }}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 hover:border-primary/40">
                <span className="line-clamp-1 text-xs font-semibold">{b.competition_name}</span>
                <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                  {b.rank ? `#${b.rank}` : "—"} · {b.vote_count} votes
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Achievements / HoF */}
      {(hof?.length ?? 0) > 0 && (
        <div className="mb-3">
          <h3 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3 w-3 text-amber-400" /> Achievements
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {hof.map((h: any) => (
              <span key={h.id} className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                #{h.rank} · {h.period ?? "hall of fame"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories written */}
      {(categories_written?.length ?? 0) > 0 && (
        <div>
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories Written</h3>
          <div className="flex flex-wrap gap-1.5">
            {categories_written.map((c: any) => (
              <Link key={c.id} to="/poetry/category/$slug" params={{ slug: c.slug }}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${c.color ?? "#7c3aed"}22`, color: c.color ?? "#7c3aed" }}>
                {c.name} · {c.poem_count}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PoemChip({ p }: { p: any }) {
  return (
    <Link to="/poetry/$slug" params={{ slug: p.slug }}
      className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40">
      <div className="mb-1 flex items-center gap-2">
        {p.category && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: `${p.category.color ?? "#7c3aed"}22`, color: p.category.color ?? "#7c3aed" }}>
            {p.category.name}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {p.upvote_count ?? 0} ♥ · {p.read_count ?? 0} 👁
        </span>
      </div>
      <div className="line-clamp-1 text-sm font-semibold group-hover:text-primary">{p.title}</div>
      <div className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">{poemPreview(p.body, 140)}</div>
    </Link>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {icon}
      <span className="font-bold">{value.toLocaleString()}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
