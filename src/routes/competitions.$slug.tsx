import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Trophy, Plus, Crown, Coins, Sparkles, Calendar } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  getCompetitionBySlug,
  getMyVote,
  getMyCompetitorVote,
  joinCompetition,
  leaveCompetition,
  incrementCompetitionViews,
  listRelatedCompetitions,
  voteForCompetitor,
} from "@/lib/competitions.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useMyRoles } from "@/lib/use-my-role";
import { Countdown } from "@/components/competitions/Countdown";
import { TopThree } from "@/components/competitions/TopThree";
import { ParticipantGrid } from "@/components/competitions/ParticipantGrid";
import { type Competitor } from "@/components/competitions/CompetitorGrid";
import { BattleArena } from "@/components/competitions/BattleArena";
import { DynamicCompetitionLayout, resolveLayout, type CompetitionLayoutStyle } from "@/components/competitions/DynamicCompetitionLayout";
import { CompetitorEditorDialog, emptyCompetitor, type CompetitorDraft } from "@/components/competitions/CompetitorEditorDialog";
import { CompetitionCard, type CompetitionSummary } from "@/components/competitions/CompetitionCard";
import { TournamentProgress } from "@/components/competitions/TournamentProgress";
import { RecentSupporters } from "@/components/competitions/RecentSupporters";
import { BattleActivityFeed } from "@/components/competitions/BattleActivityFeed";
import { AudienceCounter } from "@/components/competitions/AudienceCounter";
import { FloatingReactions } from "@/components/competitions/FloatingReactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const SITE = "https://holo-chat-quest.lovable.app";

export const Route = createFileRoute("/competitions/$slug")({
  loader: async ({ params }) => {
    const data = await getCompetitionBySlug({ data: { slug: params.slug } });
    if (!data?.competition) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.competition as any;
    const url = `${SITE}/competitions/${params.slug}`;
    if (!c) {
      return {
        meta: [
          { title: "Competition not found" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${c.name} — Competition`;
    const description = (c.description ?? "Join and vote in this community competition.").slice(0, 155);
    const img = c.banner_url || undefined;
    const meta: any[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: img ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (img) {
      meta.push({ property: "og:image", content: img });
      meta.push({ name: "twitter:image", content: img });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: c.name,
            description,
            startDate: c.start_at,
            endDate: c.end_at,
            eventStatus:
              c.status === "live" ? "https://schema.org/EventScheduled"
              : c.status === "completed" ? "https://schema.org/EventCompleted"
              : "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
            image: img ? [img] : undefined,
            url,
          }),
        },
      ],
    };
  },
  component: CompetitionDetail,
});

function CompetitionDetail() {
  const { slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const get = useServerFn(getCompetitionBySlug);
  const getVote = useServerFn(getMyVote);
  const getCompVote = useServerFn(getMyCompetitorVote);
  const join = useServerFn(joinCompetition);
  const leave = useServerFn(leaveCompetition);
  const bumpViews = useServerFn(incrementCompetitionViews);
  const related = useServerFn(listRelatedCompetitions);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { isAdmin } = useMyRoles();
  const userId = user?.id ?? null;
  const [editing, setEditing] = useState<CompetitorDraft | null>(null);

  const { data } = useQuery({
    queryKey: ["competition-slug", slug],
    queryFn: () => get({ data: { slug } }),
    initialData: initial,
  });

  const competitionId = data?.competition?.id;

  const { data: myVote } = useQuery({
    queryKey: ["competition-vote", competitionId, userId],
    queryFn: () => getVote({ data: { competitionId: competitionId! } }),
    enabled: !!userId && !!competitionId,
  });

  const { data: myCompetitorVote } = useQuery({
    queryKey: ["my-competitor-vote", competitionId, userId],
    queryFn: () => getCompVote({ data: { competitionId: competitionId! } }),
    enabled: !!userId && !!competitionId,
  });

  const { data: relatedList = [] } = useQuery({
    queryKey: ["competition-related", competitionId, (data?.competition as any)?.category_id],
    queryFn: () =>
      related({
        data: {
          competitionId: competitionId!,
          categoryId: (data?.competition as any)?.category_id ?? null,
          limit: 6,
        },
      }),
    enabled: !!competitionId,
  });

  // Increment views once per session per competition
  useEffect(() => {
    if (!competitionId) return;
    const key = `comp-viewed:${competitionId}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      bumpViews({ data: { competitionId } }).catch(() => {});
    }
  }, [competitionId, bumpViews]);

  // Realtime updates — coalesce bursts (many votes / sec) into one refetch
  useEffect(() => {
    if (!competitionId) return;
    let t: ReturnType<typeof setTimeout> | null = null;
    const bump = () => {
      if (t) return;
      t = setTimeout(() => {
        t = null;
        qc.invalidateQueries({ queryKey: ["competition-slug", slug] });
      }, 350);
    };
    const ch = supabase
      .channel(`competition:${competitionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_votes", filter: `competition_id=eq.${competitionId}` }, bump)
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_participants", filter: `competition_id=eq.${competitionId}` }, bump)
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_competitors", filter: `competition_id=eq.${competitionId}` }, bump)
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_competitor_votes", filter: `competition_id=eq.${competitionId}` }, bump)
      .subscribe();
    return () => { if (t) clearTimeout(t); supabase.removeChannel(ch); };
  }, [competitionId, slug, qc]);



  const joinM = useMutation({
    mutationFn: () => join({ data: { competitionId: competitionId! } }),
    onSuccess: () => { toast.success("Joined!"); qc.invalidateQueries({ queryKey: ["competition-slug", slug] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to join"),
  });
  const leaveM = useMutation({
    mutationFn: () => leave({ data: { competitionId: competitionId! } }),
    onSuccess: () => { toast.success("Left"); qc.invalidateQueries({ queryKey: ["competition-slug", slug] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const voteCompetitor = useServerFn(voteForCompetitor);
  const arenaVoteM = useMutation({
    mutationFn: (competitorId: string) =>
      voteCompetitor({ data: { competitionId: competitionId!, competitorId } }),
    onMutate: async (competitorId: string) => {
      await qc.cancelQueries({ queryKey: ["competition-slug", slug] });
      const prev = qc.getQueryData<any>(["competition-slug", slug]);
      if (prev?.competitors) {
        const prevMy = myCompetitorVote?.competitorId ?? null;
        const next = prev.competitors.map((cc: Competitor) => {
          if (cc.id === competitorId) return { ...cc, vote_count: (cc.vote_count ?? 0) + 1 };
          if (prevMy && cc.id === prevMy && competitorId !== prevMy) {
            return { ...cc, vote_count: Math.max(0, (cc.vote_count ?? 0) - 1) };
          }
          return cc;
        });
        qc.setQueryData(["competition-slug", slug], { ...prev, competitors: next });
      }
      qc.setQueriesData({ queryKey: ["my-competitor-vote", competitionId] }, { competitorId });
      return { prev };
    },
    onSuccess: (_res, competitorId) => {
      toast.success("🔥 Vote counted");
      // Broadcast to peers viewing this competition — powers RecentSupporters
      // refetch, BattleActivityFeed line, and FloatingReactions burst.
      if (competitionId) {
        const target = competitors.find((cc) => cc.id === competitorId)?.name ?? null;
        supabase
          .channel(`comp-broadcast:${competitionId}`)
          .send({
            type: "broadcast",
            event: "vote",
            payload: { voter: (user as any)?.username ?? "Someone", target },
          })
          .catch(() => {});
      }
      // Confetti burst
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          origin: { y: 0.6 },
          particleCount: Math.floor(180 * particleRatio),
          ...opts,
        });
      };
      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#a855f7", "#f43f5e", "#fbbf24"] });
      fire(0.2, { spread: 60, colors: ["#a855f7", "#f43f5e", "#fbbf24"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9, colors: ["#a855f7", "#f43f5e", "#fbbf24"] });
    },

    onError: (e: any, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["competition-slug", slug], ctx.prev);
      toast.error(e?.message ?? "Failed to vote");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["competition-slug", slug] });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    },
  });

  if (!data?.competition) {
    return <div className="grid min-h-screen place-items-center">Competition not found.</div>;
  }
  const c = data.competition as any;
  const participants = data.participants as any[];
  const competitors = (data.competitors ?? []) as Competitor[];
  const awards = (data.awards ?? []) as any[];
  const category = c.category as { name?: string; color?: string | null } | null;
  const iJoined = !!userId && participants.some((p) => p.user_id === userId);
  const approvedParticipants = participants.filter((p) => p.status === "approved");

  const rewards = (c.rewards ?? {}) as { coins?: number; xp?: number; badge?: string; premium_days?: number; custom?: string };
  const prizeParts = [
    rewards.coins ? `${rewards.coins} coins` : null,
    rewards.xp ? `${rewards.xp} XP` : null,
    rewards.premium_days ? `${rewards.premium_days}d premium` : null,
    rewards.badge || null,
    rewards.custom || null,
  ].filter(Boolean) as string[];

  // Admin-configurable feature flags (default true when missing on legacy rows)
  const enableVoting = c.enable_voting !== false;
  const enableJoin = c.enable_join !== false;
  const enableSharing = c.enable_sharing !== false;
  const hideResults =
    c.hide_results_until_end === true && c.status !== "completed"
      ? true
      : !c.show_live_counts;
  const votingOpen = enableVoting && c.status === "live" && !(c.auto_close_voting !== false && new Date(c.end_at).getTime() < Date.now());

  const url = `${SITE}/competitions/${c.slug}`;


  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: c.name, text: c.description ?? "", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch { /* user cancelled */ }
  };

  const handleReport = async () => {
    if (!userId) { toast.error("Sign in to report"); return; }
    const reason = window.prompt("Why are you reporting this competition?");
    if (!reason) return;
    const { error } = await supabase.from("reports").insert({
      reporter_id: userId,
      target_type: "post" as any,
      target_id: c.id,
      reason: `[competition] ${reason}`,
    } as any);
    if (error) toast.error(error.message);
    else toast.success("Reported. Thanks for keeping the community safe.");
  };

  const layoutStyle = (c.layout_style ?? "auto") as CompetitionLayoutStyle;
  const eligibleCount = competitors.filter((cc) => !cc.is_hidden && !cc.is_disqualified).length;
  const resolvedLayout = resolveLayout(layoutStyle, eligibleCount);
  const showBattleArenaHero = resolvedLayout === "vs_battle";

  // Premium battlefield derived state
  const sortedCompetitors = [...competitors]
    .filter((cc) => !cc.is_hidden && !cc.is_disqualified)
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  const topLeaderName = sortedCompetitors[0]?.name ?? null;
  const totalCompetitorVotes = sortedCompetitors.reduce((s, cc) => s + (cc.vote_count ?? 0), 0);
  const showPremiumSections = c.status !== "draft";

  return (
    <div className="min-h-screen bg-[#050308] pb-24 text-foreground">
      {showPremiumSections && <FloatingReactions competitionId={c.id} />}

      {/* Premium Battle Arena hero — only for VS Battle layout */}
      {showBattleArenaHero && (
        <BattleArena
          competition={c}
          competitors={competitors}
          userId={userId}
          hideCounts={hideResults}
          votingOpen={votingOpen}
          onVote={(id) => arenaVoteM.mutate(id)}
          myVote={myCompetitorVote?.competitorId ?? null}
          onShare={handleShare}
          onReport={handleReport}
          isVoting={arenaVoteM.isPending}
        />
      )}

      {/* Compact hero for non-VS layouts */}
      {!showBattleArenaHero && (
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-4 pb-4 pt-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-1.5">
              {c.status === "live" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/60 bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-rose-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> Live
                </span>
              )}
              {c.status === "upcoming" && <Badge className="border-sky-400/50 bg-sky-500/20 text-sky-200 text-[10px]">Upcoming</Badge>}
              {c.status === "completed" && <Badge className="border-zinc-400/40 bg-zinc-500/20 text-zinc-200 text-[10px]">Concluded</Badge>}
              {category?.name && <Badge variant="outline" className="border-white/20 bg-white/5 text-[10px]">{category.name}</Badge>}
              <Badge variant="outline" className="border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200 text-[9px] uppercase tracking-wider">
                {resolvedLayout === "podium" ? "Podium" : resolvedLayout === "tournament" ? "Tournament" : "Leaderboard"}
              </Badge>
              {showPremiumSections && <AudienceCounter competitionId={c.id} />}
            </div>

            <h1 className="mt-1.5 text-xl font-black tracking-tight sm:text-3xl">{c.name}</h1>
            {c.status !== "completed" && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/70">
                <span>{c.status === "live" ? "Ends in" : "Starts in"}</span>
                <Countdown endAt={c.status === "live" ? c.end_at : c.start_at} compact />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4">
        {c.description && (
          <p className="mt-2 text-sm text-white/70">{c.description}</p>
        )}

        {c.rules && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs backdrop-blur">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <Sparkles className="h-3 w-3" /> Match Rules
            </div>
            <p className="whitespace-pre-wrap text-white/80">{c.rules}</p>
          </div>
        )}

        {userId && enableJoin && (c.status === "upcoming" || c.status === "live") && (
          <div className="mt-3">
            {iJoined ? (
              <Button size="sm" variant="outline" onClick={() => leaveM.mutate()} disabled={leaveM.isPending}>
                Leave Arena
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => joinM.mutate()}
                disabled={joinM.isPending}
                className="bg-gradient-to-r from-fuchsia-500 to-rose-500 text-sm font-bold text-white hover:from-fuchsia-400 hover:to-rose-400"
              >
                ⚔️ Enter the Arena
              </Button>
            )}
          </div>
        )}

        {/* Premium battlefield sections: tournament progress, recent supporters, live activity feed */}
        {showPremiumSections && (
          <div className="mt-4 space-y-3">
            <TournamentProgress startAt={c.start_at} endAt={c.end_at} status={c.status} />
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <RecentSupporters competitionId={c.id} />
              <BattleActivityFeed
                competitionId={c.id}
                topLeaderName={topLeaderName}
                totalVotes={totalCompetitorVotes}
              />
            </div>
          </div>
        )}

        {/* Winner section */}

        {c.status === "completed" && awards.length > 0 && (
          <section className="mt-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-rose-500/5 p-6 backdrop-blur-xl">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Crown className="h-5 w-5 text-amber-400" /> Winner{awards.length > 1 ? "s" : ""}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {awards.map((a: any) => {
                const p = participants.find((x) => x.id === a.participant_id);
                const totalVotes = c.total_votes || 1;
                const pct = p ? Math.round((p.vote_count / totalVotes) * 100) : 0;
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-black/20 p-4">
                    <Avatar className="h-14 w-14 ring-2 ring-amber-400/60">
                      <AvatarImage src={a.profile?.avatar_url ?? undefined} />
                      <AvatarFallback style={{ background: a.profile?.avatar_color ?? undefined }}>
                        {(a.profile?.username ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="border border-amber-500/50 bg-amber-500/20 text-amber-200">#{a.place}</Badge>
                        <span className="font-semibold">{a.profile?.username ?? "Winner"}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {p ? `${p.vote_count} votes · ${pct}%` : "—"}
                      </div>
                      {a.badge_label && <div className="mt-1 text-xs text-amber-300">🏆 {a.badge_label}</div>}
                    </div>
                    {(a.rewards as any)?.coins ? (
                      <div className="inline-flex items-center gap-1 text-sm text-amber-300">
                        <Coins className="h-4 w-4" /> {(a.rewards as any).coins}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Voting-state banner */}
        {c.status === "upcoming" && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-200">
              <Calendar className="h-4 w-4" /> Voting opens in
            </div>
            <Countdown endAt={c.start_at} compact />
          </div>
        )}
        {c.status === "completed" && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm font-semibold backdrop-blur">
            🏁 Voting Closed
          </div>
        )}

        {/* Nominees */}
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-base font-bold">
              <Crown className="h-4 w-4 text-amber-400" /> Nominees
              <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {competitors.length > 0 ? competitors.length : approvedParticipants.length}
              </span>
            </h2>
            {isAdmin && (
              <Button size="sm" className="h-8 text-xs" onClick={() => setEditing(emptyCompetitor(c.id, competitors.length))}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add nominee
              </Button>
            )}
          </div>
          {competitors.length > 0 ? (
            <DynamicCompetitionLayout
              competitionId={c.id}
              competitors={competitors}
              layoutStyle={layoutStyle}
              myVote={myCompetitorVote?.competitorId ?? null}
              canVote={!!userId && votingOpen}
              hideCounts={hideResults}
              isAdmin={isAdmin}
              votingClosed={c.status === "completed" || (!votingOpen && c.status !== "upcoming")}
              votingUpcoming={c.status === "upcoming"}
              onEdit={(comp: Competitor) => setEditing({ ...comp })}
              invalidateKey={["competition-slug", slug]}
              suppressVsBattle={showBattleArenaHero}
            />
          ) : approvedParticipants.length > 0 ? (
            <ParticipantGrid
              competitionId={c.id}
              participants={approvedParticipants as any}
              myVote={myVote?.participantId ?? null}
              canVote={!!userId && votingOpen}
              hideCounts={hideResults}
              invalidateKey={["competition-slug", slug]}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center text-sm text-muted-foreground">
              No nominees have been added yet.
            </div>
          )}
        </section>


        <CompetitorEditorDialog
          value={editing}
          onChange={setEditing}
          invalidateKey={["competition-slug", slug]}
        />

        {/* Participants (existing user-join system) */}
        {competitors.length > 0 && approvedParticipants.length > 0 && (
          <section className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Trophy className="h-3.5 w-3.5 text-amber-400" /> Live Ranking</h2>
              <TopThree participants={participants as any} hideCounts={hideResults} />
            </div>
            <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <h2 className="mb-2 text-sm font-bold">Vote for a contestant</h2>
              <ParticipantGrid
                competitionId={c.id}
                participants={participants as any}
                myVote={myVote?.participantId ?? null}
                canVote={!!userId && votingOpen}
                hideCounts={hideResults}
                invalidateKey={["competition-slug", slug]}
              />

            </div>
          </section>
        )}

        {/* Related competitions */}
        {relatedList.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-4 w-4 text-amber-400" /> Related competitions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(relatedList as CompetitionSummary[]).map((r) => (
                <CompetitionCard key={r.id} c={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


