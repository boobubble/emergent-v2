import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Feather, Heart, Eye, Trophy } from "lucide-react";
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

  if (isLoading) return null;
  if (!data?.profile) return null;
  const { stats, poems } = data;
  const hasAny = (stats && (stats.poems_published ?? 0) > 0) || poems.length > 0;
  if (!hasAny) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Feather className="h-3.5 w-3.5 text-primary" /> Mehfil · Poetry
        </h2>
        <Link to="/mehfil" className="text-[11px] font-semibold text-primary hover:underline">Explore Mehfil →</Link>
      </div>

      {stats && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <WriterRankBadge rank={stats.writer_rank} />
          <MiniStat icon={<BookOpen className="h-3.5 w-3.5" />} label="Poems" value={stats.poems_published ?? 0} />
          <MiniStat icon={<Heart className="h-3.5 w-3.5 text-rose-400" />} label="Upvotes" value={stats.total_upvotes ?? 0} />
          <MiniStat icon={<Eye className="h-3.5 w-3.5" />} label="Reads" value={stats.total_reads ?? 0} />
          {(stats.battle_wins ?? 0) > 0 && (
            <MiniStat icon={<Trophy className="h-3.5 w-3.5 text-warning" />} label="Battles Won" value={stats.battle_wins ?? 0} />
          )}
        </div>
      )}

      {poems.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {poems.map((p) => (
            <Link
              key={p.id}
              to="/mehfil/$slug"
              params={{ slug: p.slug }}
              className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
            >
              <div className="mb-1 flex items-center gap-2">
                {p.category && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${p.category.color ?? "#7c3aed"}22`, color: p.category.color ?? "#7c3aed" }}
                  >
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
          ))}
        </div>
      )}
    </section>
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
