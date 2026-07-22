import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowLeft, Award, Crown, Medal, Search, Star, Trophy, Feather } from "lucide-react";
import { listHallOfFame } from "@/lib/competitions.functions";
import { getMehfilHallOfFame } from "@/lib/mehfil.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const searchSchema = z.object({
  tab: z.enum(["all", "competitions", "poetry"]).optional().catch("all"),
});

export const Route = createFileRoute("/hall-of-fame")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Hall of Fame — Champions of Competitions & Poetry" },
      { name: "description", content: "Every champion. Every craft. Browse winners across all competitions and poetry battles — one legendary archive." },
      { property: "og:title", content: "Hall of Fame — Champions" },
      { property: "og:description", content: "Every champion. Every craft. The permanent archive of winners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Hall of Fame",
          description: "Every champion across competitions and poetry battles.",
        }),
      },
    ],
  }),
  component: HallOfFamePage,
});

type Kind = "competition" | "poetry";
type UnifiedRow = {
  id: string;
  kind: Kind;
  year: number;
  rank: number;
  awardedAt: string;
  profile: { username?: string | null; display_name?: string | null; avatar_url?: string | null } | null;
  title: string;
  linkTo: string;
  linkParams: Record<string, string>;
  category?: { name: string; color?: string | null } | null;
  votes?: number;
  share?: number;
  prize?: string | null;
  banner?: string | null;
  period?: string | null;
};

const rankStyle: Record<number, { icon: JSX.Element; color: string; label: string }> = {
  1: { icon: <Crown className="h-4 w-4" />, color: "from-amber-400 to-yellow-500", label: "Champion" },
  2: { icon: <Medal className="h-4 w-4" />, color: "from-slate-300 to-slate-400", label: "Runner Up" },
  3: { icon: <Award className="h-4 w-4" />, color: "from-orange-400 to-amber-600", label: "Third Place" },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function HallOfFamePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeTab = (search.tab ?? "all") as "all" | "competitions" | "poetry";
  const [q, setQ] = useState("");
  const [rankFilter, setRankFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const fetchComp = useServerFn(listHallOfFame);
  const fetchPoetry = useServerFn(getMehfilHallOfFame);

  const compQ = useQuery({
    queryKey: ["hall-of-fame", "competitions"],
    queryFn: () => fetchComp({ data: {} }),
  });
  const poetryQ = useQuery({
    queryKey: ["hall-of-fame", "poetry"],
    queryFn: () => fetchPoetry(),
  });

  const unified = useMemo<UnifiedRow[]>(() => {
    const rows: UnifiedRow[] = [];
    (compQ.data ?? []).forEach((r: any) => {
      if (!r.competition?.slug) return;
      rows.push({
        id: `c:${r.id}`,
        kind: "competition",
        year: new Date(r.awarded_at).getFullYear(),
        rank: r.place,
        awardedAt: r.awarded_at,
        profile: r.profile,
        title: r.competition?.name ?? "Competition",
        linkTo: "/competitions/$slug",
        linkParams: { slug: r.competition.slug },
        category: r.competition?.category ?? null,
        votes: r.winning_votes,
        share: r.winning_share,
        prize: r.rewards?.coins ? `${formatNumber(r.rewards.coins)} coins` : r.rewards?.custom ?? null,
        banner: r.competition?.banner_url ?? null,
      });
    });
    (poetryQ.data ?? []).forEach((r: any) => {
      rows.push({
        id: `p:${r.id}`,
        kind: "poetry",
        year: new Date(r.awarded_at).getFullYear(),
        rank: r.rank,
        awardedAt: r.awarded_at,
        profile: r.profile,
        title: r.poem?.title ?? "Poetry Battle",
        linkTo: r.poem?.slug ? "/poetry/$slug" : "/poetry",
        linkParams: r.poem?.slug ? { slug: r.poem.slug } : {},
        period: r.period,
      });
    });
    return rows.sort((a, b) => +new Date(b.awardedAt) - +new Date(a.awardedAt));
  }, [compQ.data, poetryQ.data]);

  const years = useMemo(
    () => Array.from(new Set(unified.map((r) => r.year))).sort((a, b) => b - a),
    [unified],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return unified.filter((r) => {
      if (activeTab === "competitions" && r.kind !== "competition") return false;
      if (activeTab === "poetry" && r.kind !== "poetry") return false;
      if (rankFilter && r.rank !== rankFilter) return false;
      if (yearFilter && r.year !== yearFilter) return false;
      if (needle) {
        const hay = `${r.title} ${r.profile?.username ?? ""} ${r.profile?.display_name ?? ""} ${r.category?.name ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [unified, activeTab, rankFilter, yearFilter, q]);

  const byYear = useMemo(() => {
    const groups = new Map<number, UnifiedRow[]>();
    filtered.forEach((r) => {
      if (!groups.has(r.year)) groups.set(r.year, []);
      groups.get(r.year)!.push(r);
    });
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const totalChampions = unified.length;
  const compCount = unified.filter((r) => r.kind === "competition").length;
  const poetryCount = unified.filter((r) => r.kind === "poetry").length;
  const thisYear = new Date().getFullYear();
  const thisYearCount = unified.filter((r) => r.year === thisYear).length;

  const setTab = (t: "all" | "competitions" | "poetry") =>
    navigate({ search: { tab: t === "all" ? undefined : t } as any, replace: true });

  const isLoading = compQ.isLoading || poetryQ.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/"><Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-amber-400" /> Hall of Fame
            </h1>
            <p className="text-xs text-muted-foreground">Every champion. Every craft.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-transparent p-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_40px_-5px_rgba(251,191,36,0.6)]">
            <Trophy className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Winners' Legacy</h2>
          <p className="mt-2 mx-auto max-w-xl text-sm text-muted-foreground">
            Champions of competitions and poetry battles — permanently enshrined.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Champions" value={String(totalChampions)} />
            <Stat label="Competitions" value={String(compCount)} />
            <Stat label="Poetry" value={String(poetryCount)} />
            <Stat label={`${thisYear}`} value={String(thisYearCount)} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit">
          {(["all", "competitions", "poetry"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize ${activeTab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
            >
              {t === "all" ? "All" : t === "competitions" ? "Competitions" : "Poetry"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search winner, title, category…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3].map((r) => (
              <button
                key={r}
                onClick={() => setRankFilter(rankFilter === r ? null : r)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${rankFilter === r ? "border-amber-400 bg-amber-500/10 text-amber-300" : "border-border/60 hover:border-border"}`}
              >
                {r === 1 ? <Crown className="h-3 w-3" /> : r === 2 ? <Medal className="h-3 w-3" /> : <Award className="h-3 w-3" />}
                {r === 1 ? "1st" : r === 2 ? "2nd" : "3rd"}
              </button>
            ))}
            {years.slice(0, 6).map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(yearFilter === y ? null : y)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${yearFilter === y ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:border-border"}`}
              >
                {y}
              </button>
            ))}
            {(rankFilter || yearFilter || q) && (
              <button
                onClick={() => { setRankFilter(null); setYearFilter(null); setQ(""); }}
                className="rounded-full border border-dashed border-border/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-muted-foreground">
            Loading champions…
          </div>
        ) : byYear.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
            <Star className="mx-auto mb-2 h-8 w-8 opacity-40" />
            No champions match your filters yet.
          </div>
        ) : (
          <div className="space-y-12">
            {byYear.map(([year, rows]) => (
              <section key={year}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="text-3xl font-black tracking-tight">{year}</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                  <Badge variant="outline" className="border-amber-500/40 text-amber-300">
                    {rows.length} winner{rows.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="relative pl-6">
                  <div className="absolute bottom-0 left-2 top-0 w-px bg-gradient-to-b from-amber-500/40 via-white/10 to-transparent" />
                  <div className="space-y-4">
                    {rows.map((r) => <WinnerCard key={r.id} row={r} />)}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function WinnerCard({ row }: { row: UnifiedRow }) {
  const style = rankStyle[row.rank] ?? { icon: <Star className="h-4 w-4" />, color: "from-white/20 to-white/10", label: `#${row.rank}` };
  const kindBadge = row.kind === "poetry"
    ? { icon: <Feather className="h-3 w-3" />, label: "Poetry", cls: "border-fuchsia-500/40 text-fuchsia-300" }
    : { icon: <Trophy className="h-3 w-3" />, label: "Competition", cls: "border-amber-500/40 text-amber-300" };

  return (
    <div className="relative">
      <div className={`absolute -left-[22px] top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${style.color} shadow-lg`}>
        {style.icon}
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 backdrop-blur-xl transition-all hover:border-white/20">
        <div className="flex flex-wrap items-start gap-4">
          {row.profile ? (
            <Link to="/u/$username" params={{ username: row.profile.username ?? "" }} className="shrink-0">
              {row.profile.avatar_url ? (
                <img src={row.profile.avatar_url} alt={row.profile.username ?? ""} className="h-16 w-16 rounded-full border-2 border-white/20 object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-lg font-bold">
                  {(row.profile.username ?? "?")[0]?.toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <div className="h-16 w-16 rounded-full border-2 border-white/20 bg-white/10" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`gap-1 border-none bg-gradient-to-r ${style.color} text-black`}>
                {style.icon} {style.label}
              </Badge>
              <Badge variant="outline" className={`gap-1 ${kindBadge.cls}`}>
                {kindBadge.icon} {kindBadge.label}
              </Badge>
              {row.category && (
                <Badge variant="outline" style={{ borderColor: row.category.color ?? undefined, color: row.category.color ?? undefined }}>
                  {row.category.name}
                </Badge>
              )}
              {row.period && (
                <Badge variant="outline" className="capitalize">
                  {row.period.replace("_", " ")}
                </Badge>
              )}
            </div>
            <Link
              to={row.linkTo as any}
              params={row.linkParams as any}
              className="mt-1.5 block text-lg font-bold hover:text-amber-300"
            >
              {row.kind === "poetry" ? `"${row.title}"` : row.title}
            </Link>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Won by{" "}
              {row.profile ? (
                <Link to="/u/$username" params={{ username: row.profile.username ?? "" }} className="font-semibold text-foreground hover:text-amber-300">
                  @{row.profile.username}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">Unknown</span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {typeof row.votes === "number" && <Stat label="Votes" value={formatNumber(row.votes)} />}
              {typeof row.share === "number" && <Stat label="Win share" value={`${(row.share * 100).toFixed(0)}%`} />}
              {row.prize && <Stat label="Prize" value={row.prize} />}
              <Stat label="Awarded" value={new Date(row.awardedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
            </div>
          </div>

          {row.banner && (
            <div className="hidden shrink-0 overflow-hidden rounded-lg border border-white/10 sm:block">
              <img src={row.banner} alt="" className="h-16 w-24 object-cover" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2 text-center">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
