import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { ArrowLeft, Award, Crown, Medal, Star, Trophy } from "lucide-react";
import { listHallOfFame } from "@/lib/competitions.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/competitions/hall-of-fame")({
  head: () => ({
    meta: [
      { title: "Hall of Fame — Competition Winners" },
      { name: "description", content: "Celebrate every past champion. Browse the winners, prizes, votes and margins across every completed community competition." },
      { property: "og:title", content: "Competition Hall of Fame" },
      { property: "og:description", content: "Every past winner, every prize, every legendary competition." },
      { property: "og:type", content: "website" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Competition Hall of Fame",
          description: "Every past champion of our community competitions.",
        }),
      },
    ],
  }),
  component: HallOfFamePage,
});

const placeStyle: Record<number, { icon: JSX.Element; color: string; label: string }> = {
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
  const fetchHall = useServerFn(listHallOfFame);
  const { data = [], isLoading } = useQuery({
    queryKey: ["hall-of-fame"],
    queryFn: () => fetchHall({ data: {} }),
  });

  const byYear = useMemo(() => {
    const groups = new Map<number, typeof data>();
    (data as any[]).forEach((r) => {
      const y = new Date(r.awarded_at).getFullYear();
      if (!groups.has(y)) groups.set(y, [] as any);
      (groups.get(y) as any[]).push(r);
    });
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/competitions"><Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-amber-400" /> Hall of Fame
            </h1>
            <p className="text-xs text-muted-foreground">Every champion. Every prize. Every legendary battle.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-transparent p-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_40px_-5px_rgba(251,191,36,0.6)]">
            <Trophy className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Winners' Legacy</h2>
          <p className="mt-2 mx-auto max-w-xl text-sm text-muted-foreground">
            The champions who rose above thousands of votes to claim their crown.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-muted-foreground">
            Loading champions…
          </div>
        ) : byYear.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
            <Star className="mx-auto mb-2 h-8 w-8 opacity-40" />
            No winners yet. Be the first to write your name here.
          </div>
        ) : (
          <div className="space-y-12">
            {byYear.map(([year, entries]) => (
              <section key={year}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="text-3xl font-black tracking-tight">{year}</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                  <Badge variant="outline" className="border-amber-500/40 text-amber-300">
                    {(entries as any[]).length} winner{(entries as any[]).length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="relative pl-6">
                  <div className="absolute bottom-0 left-2 top-0 w-px bg-gradient-to-b from-amber-500/40 via-white/10 to-transparent" />
                  <div className="space-y-4">
                    {(entries as any[]).map((r) => {
                      const style = placeStyle[r.place] ?? { icon: <Star className="h-4 w-4" />, color: "from-white/20 to-white/10", label: `#${r.place}` };
                      const prize = r.rewards?.coins || r.rewards?.custom;
                      return (
                        <div key={r.id} className="relative">
                          <div className={`absolute -left-[22px] top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${style.color} shadow-lg`}>
                            {style.icon}
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 backdrop-blur-xl transition-all hover:border-white/20">
                            <div className="flex flex-wrap items-start gap-4">
                              {/* Avatar */}
                              {r.profile ? (
                                <Link
                                  to="/u/$username"
                                  params={{ username: r.profile.username ?? "" }}
                                  className="shrink-0"
                                >
                                  {r.profile.avatar_url ? (
                                    <img src={r.profile.avatar_url} alt={r.profile.username} className="h-16 w-16 rounded-full border-2 border-white/20 object-cover" />
                                  ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-lg font-bold">
                                      {(r.profile.username ?? "?")[0]?.toUpperCase()}
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
                                  {r.competition?.category && (
                                    <Badge variant="outline" style={{ borderColor: r.competition.category.color ?? undefined, color: r.competition.category.color ?? undefined }}>
                                      {r.competition.category.name}
                                    </Badge>
                                  )}
                                </div>
                                <Link
                                  to="/competitions/$slug"
                                  params={{ slug: r.competition?.slug ?? "" }}
                                  className="mt-1.5 block text-lg font-bold hover:text-amber-300"
                                >
                                  {r.competition?.name ?? "Competition"}
                                </Link>
                                <div className="mt-0.5 text-sm text-muted-foreground">
                                  Won by{" "}
                                  {r.profile ? (
                                    <Link to="/u/$username" params={{ username: r.profile.username ?? "" }} className="font-semibold text-foreground hover:text-amber-300">
                                      @{r.profile.username}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold text-foreground">Unknown</span>
                                  )}
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                  <Stat label="Votes" value={formatNumber(r.winning_votes)} />
                                  <Stat label="Win share" value={`${(r.winning_share * 100).toFixed(0)}%`} />
                                  <Stat label="Prize" value={prize ? (r.rewards.coins ? `${formatNumber(r.rewards.coins)} coins` : String(prize).slice(0, 12)) : "—"} />
                                  <Stat label="Awarded" value={new Date(r.awarded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
                                </div>
                              </div>

                              {/* Competition banner */}
                              {r.competition?.banner_url && (
                                <Link
                                  to="/competitions/$slug"
                                  params={{ slug: r.competition.slug }}
                                  className="hidden shrink-0 overflow-hidden rounded-lg border border-white/10 sm:block"
                                >
                                  <img src={r.competition.banner_url} alt="" className="h-16 w-24 object-cover" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2 text-center">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
