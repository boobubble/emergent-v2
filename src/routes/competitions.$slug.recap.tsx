import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Trophy, ArrowLeft, Coins, PartyPopper, Sparkles } from "lucide-react";
import { getCompetitionBySlug } from "@/lib/competitions.functions";
import { getPublishedCompetitionBySlug } from "@/lib/competitions.public";
import { loadFunZoneSummary, FUN_META, type FunCategory, type FunZoneSummaryEntry } from "@/lib/competition-memes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { isNavigableSlug } from "@/lib/route-slug";

export const Route = createFileRoute("/competitions/$slug/recap")({
  loader: async ({ params }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
    const data = typeof window === "undefined"
      ? await getPublishedCompetitionBySlug(params.slug)
      : await getCompetitionBySlug({ data: { slug: params.slug } });
    if (!data?.competition) throw notFound();
    return data;
  },
  head: ({ params }) => ({
    meta: [
      { title: `Battle Recap — ${params.slug}` },
      { name: "description", content: `Final results, winners, and Fun Zone highlights for the ${params.slug} competition.` },
      { property: "og:title", content: `Battle Recap — ${params.slug}` },
      { property: "og:description", content: "Full results, podium, and community-powered Fun Zone winners." },
      { property: "og:type", content: "article" },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground">Failed to load recap.</div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground">Competition not found.</div>
  ),
  component: RecapPage,
});

function RecapPage() {
  const data = Route.useLoaderData() as any;
  const c = data.competition;
  const participants = (data.participants ?? []) as any[];
  const allAwards = (data.awards ?? []) as any[];
  const podium = allAwards.filter((a) => !a.award_type && (a.place ?? 0) > 0).sort((a, b) => a.place - b.place);
  const funAwards = allAwards.filter((a) => !!a.award_type);
  const [funSummary, setFunSummary] = useState<Record<FunCategory, FunZoneSummaryEntry> | null>(null);

  useEffect(() => {
    if (!c?.id) return;
    loadFunZoneSummary(c.id).then((s) => setFunSummary(s.perCategory));
  }, [c?.id]);

  if (!c) return null;

  const totalVotes = c.total_votes || 1;
  const funTotal = funSummary ? Object.values(funSummary).reduce((n, e) => n + e.count, 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 pb-24">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/competitions/$slug" params={{ slug: c.slug }} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to competition
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-fuchsia-500/10 to-rose-500/10 p-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_40px_-5px_rgba(251,191,36,0.6)]">
            <Trophy className="h-8 w-8 text-black" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-300">Battle Recap</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{c.name}</h1>
          <p className="mt-2 mx-auto max-w-xl text-sm text-muted-foreground">{c.description || "This chapter of the battle is closed. Here's the definitive recap."}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total votes" value={String(c.total_votes ?? 0)} />
            <Stat label="Participants" value={String(participants.length)} />
            <Stat label="Winners" value={String(podium.length)} />
            <Stat label="Fun Zone posts" value={String(funTotal)} />
          </div>
        </section>

        {/* Podium */}
        {podium.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Crown className="h-5 w-5 text-amber-400" /> Podium</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {podium.slice(0, 3).map((a) => {
                const p = participants.find((x) => x.id === a.participant_id);
                const pct = p ? Math.round((p.vote_count / totalVotes) * 100) : 0;
                const tone = a.place === 1 ? "from-amber-400 to-yellow-500"
                  : a.place === 2 ? "from-slate-300 to-slate-400"
                  : "from-orange-400 to-amber-600";
                return (
                  <div key={a.id} className="rounded-2xl border border-amber-500/20 bg-black/20 p-4 text-center">
                    <div className={`mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-black`}>
                      <Crown className="h-5 w-5" />
                    </div>
                    <Avatar className="mx-auto mb-2 h-16 w-16 ring-2 ring-amber-400/60">
                      <AvatarImage src={a.profile?.avatar_url ?? undefined} />
                      <AvatarFallback style={{ background: a.profile?.avatar_color ?? undefined }}>
                        {(a.profile?.username ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className="border border-amber-500/50 bg-amber-500/20 text-amber-200">#{a.place}</Badge>
                    <div className="mt-1 font-bold">{a.profile?.username ?? "Winner"}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{p ? `${p.vote_count} votes · ${pct}%` : "—"}</div>
                    {(a.rewards as any)?.coins ? (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                        <Coins className="h-3 w-3" /> {(a.rewards as any).coins}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {podium.length > 3 && (
              <div className="mt-3 space-y-2">
                {podium.slice(3).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <Badge variant="outline">#{a.place}</Badge>
                    <Avatar className="h-8 w-8"><AvatarImage src={a.profile?.avatar_url ?? undefined} /><AvatarFallback>{(a.profile?.username ?? "?").slice(0,1)}</AvatarFallback></Avatar>
                    <div className="text-sm font-semibold">{a.profile?.username ?? "Winner"}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Fun Zone Winners */}
        {funAwards.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><PartyPopper className="h-5 w-5 text-fuchsia-400" /> Fun Zone Winners</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {funAwards.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-amber-500/5 p-4">
                  <Avatar className="h-12 w-12 ring-2 ring-fuchsia-400/40">
                    <AvatarImage src={a.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{(a.profile?.username ?? "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">{a.badge_label ?? a.award_type}</div>
                    <div className="truncate font-semibold">@{a.profile?.username ?? "user"}</div>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fun Zone breakdown */}
        {funSummary && funTotal > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><PartyPopper className="h-5 w-5 text-amber-300" /> Fun Zone Highlights</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.keys(FUN_META) as FunCategory[]).map((cat) => {
                const meta = FUN_META[cat];
                const entry = funSummary[cat];
                return (
                  <Link
                    key={cat}
                    to="/competitions/$slug/fun/$type"
                    params={{ slug: c.slug, type: meta.slug }}
                    search={{ nominee: "" }}
                    className={`rounded-2xl border border-white/10 bg-gradient-to-br ${meta.accent} p-3 hover:border-white/25`}
                  >
                    <div className="text-2xl">{meta.emoji}</div>
                    <div className="mt-1 text-sm font-bold">{meta.plural}</div>
                    <div className="text-xs text-muted-foreground">{entry.count} {entry.count === 1 ? "post" : "posts"}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <div className="text-lg font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
