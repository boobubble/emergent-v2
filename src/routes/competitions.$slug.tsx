import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Trophy, Users, Vote, Calendar, Eye, Share2, Flag, Plus, Crown, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getCompetitionBySlug,
  getMyVote,
  getMyCompetitorVote,
  joinCompetition,
  leaveCompetition,
  incrementCompetitionViews,
  listRelatedCompetitions,
} from "@/lib/competitions.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useMyRoles } from "@/lib/use-my-role";
import { Countdown } from "@/components/competitions/Countdown";
import { TopThree } from "@/components/competitions/TopThree";
import { ParticipantGrid } from "@/components/competitions/ParticipantGrid";
import { type Competitor } from "@/components/competitions/CompetitorGrid";
import { PremiumCompetitorGrid } from "@/components/competitions/PremiumCompetitorGrid";
import { AnimatedCounter } from "@/components/competitions/AnimatedCounter";
import { CompetitorEditorDialog, emptyCompetitor, type CompetitorDraft } from "@/components/competitions/CompetitorEditorDialog";
import { CompetitionCard, type CompetitionSummary } from "@/components/competitions/CompetitionCard";
import { CompetitionFollowButton } from "@/components/competitions/CompetitionFollowButton";
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

  // Realtime updates
  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`competition:${competitionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_votes", filter: `competition_id=eq.${competitionId}` },
        () => qc.invalidateQueries({ queryKey: ["competition-slug", slug] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_participants", filter: `competition_id=eq.${competitionId}` },
        () => qc.invalidateQueries({ queryKey: ["competition-slug", slug] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_competitors", filter: `competition_id=eq.${competitionId}` },
        () => qc.invalidateQueries({ queryKey: ["competition-slug", slug] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_competitor_votes", filter: `competition_id=eq.${competitionId}` },
        () => qc.invalidateQueries({ queryKey: ["competition-slug", slug] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
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

  if (!data?.competition) {
    return <div className="grid min-h-screen place-items-center">Competition not found.</div>;
  }
  const c = data.competition as any;
  const participants = data.participants as any[];
  const competitors = (data.competitors ?? []) as Competitor[];
  const awards = (data.awards ?? []) as any[];
  const category = c.category as { name?: string; color?: string | null } | null;
  const iJoined = !!userId && participants.some((p) => p.user_id === userId);

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

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Hero */}
      <div
        className="relative h-72 w-full overflow-hidden"
        style={{
          background: c.banner_url
            ? `url(${c.banner_url}) center/cover`
            : `linear-gradient(135deg, ${category?.color ?? "#8b5cf6"}, ${(category?.color ?? "#8b5cf6")}90)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <Link to="/competitions"><Button size="icon" variant="secondary"><ArrowLeft className="h-4 w-4" /></Button></Link>
        </div>
        <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-2">
          <CompetitionFollowButton competitionId={c.id} userId={userId} />
          {enableSharing && (
            <Button size="sm" variant="secondary" onClick={handleShare}>
              <Share2 className="mr-1 h-4 w-4" /> Share
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={handleReport}>
            <Flag className="mr-1 h-4 w-4" /> Report
          </Button>
        </div>

      </div>

      <div className="mx-auto -mt-16 max-w-5xl px-4">
        <div className="rounded-3xl border border-white/10 bg-background/70 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                {category?.name && <Badge variant="outline">{category.name}</Badge>}
                <Badge className={
                  c.status === "live" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : c.status === "upcoming" ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                  : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/40"
                }>{c.status}</Badge>
              </div>
              <h1 className="text-3xl font-bold">{c.name}</h1>
              {c.description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{c.description}</p>}
            </div>
            {c.status !== "completed" && (
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.status === "live" ? "Ends in" : "Starts in"}
                </div>
                <Countdown endAt={c.status === "live" ? c.end_at : c.start_at} />
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            <StatTile icon={<Users className="h-4 w-4" />} label="Participants" value={c.total_participants ?? 0} />
            {!hideResults && (
              <StatTile icon={<Vote className="h-4 w-4" />} label="Votes" value={c.total_votes ?? 0} accent />
            )}
            <StatTile icon={<Eye className="h-4 w-4" />} label="Views" value={c.views_count ?? 0} />
            <StatTile icon={<Trophy className="h-4 w-4" />} label={`Winner${(c.winner_count ?? 1) > 1 ? "s" : ""}`} value={c.winner_count ?? 1} />
            <StatTile icon={<Calendar className="h-4 w-4" />} label="Ends" valueRaw={new Date(c.end_at).toLocaleDateString()} />
          </div>



          {prizeParts.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-amber-300">Prize:</span>
              <span className="text-amber-100/90">{prizeParts.join(" · ")}</span>
            </div>
          )}

          {c.rules && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Rules</div>
              <p className="whitespace-pre-wrap">{c.rules}</p>
            </div>
          )}

          {userId && enableJoin && (c.status === "upcoming" || c.status === "live") && (
            <div className="mt-4">
              {iJoined ? (
                <Button variant="outline" onClick={() => leaveM.mutate()} disabled={leaveM.isPending}>
                  Leave Competition
                </Button>
              ) : (
                <Button onClick={() => joinM.mutate()} disabled={joinM.isPending}>
                  Join Competition
                </Button>
              )}
            </div>
          )}
        </div>


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
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Crown className="h-5 w-5 text-amber-400" /> Nominees
              <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {competitors.length}
              </span>
            </h2>
            {isAdmin && (
              <Button size="sm" onClick={() => setEditing(emptyCompetitor(c.id, competitors.length))}>
                <Plus className="mr-1 h-4 w-4" /> Add nominee
              </Button>
            )}
          </div>
          <PremiumCompetitorGrid
            competitionId={c.id}
            competitors={competitors}
            myVote={myCompetitorVote?.competitorId ?? null}
            canVote={!!userId && votingOpen}
            hideCounts={hideResults}
            isAdmin={isAdmin}
            votingClosed={c.status === "completed" || !votingOpen && c.status !== "upcoming"}
            votingUpcoming={c.status === "upcoming"}
            onEdit={(comp: Competitor) => setEditing({ ...comp })}
            invalidateKey={["competition-slug", slug]}
          />
        </section>


        <CompetitorEditorDialog
          value={editing}
          onChange={setEditing}
          invalidateKey={["competition-slug", slug]}
        />

        {/* Participants (existing user-join system) */}
        {participants.length > 0 && (
          <section className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h2 className="mb-3 flex items-center gap-2 font-bold"><Trophy className="h-4 w-4 text-amber-400" /> Live Ranking</h2>
              <TopThree participants={participants as any} hideCounts={hideResults} />
            </div>
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h2 className="mb-3 font-bold">Vote for a contestant</h2>
              <ParticipantGrid
                competitionId={c.id}
                participants={participants as any}
                myVote={myVote?.participantId ?? null}
                canVote={!!userId && votingOpen}
                hideCounts={hideResults}
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

function StatTile({
  icon,
  label,
  value,
  valueRaw,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  valueRaw?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur transition hover:border-white/20" +
        (accent ? " ring-1 ring-amber-400/30" : "")
      }
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className={"text-lg font-bold tabular-nums" + (accent ? " text-amber-300" : "")}>
        {valueRaw !== undefined ? valueRaw : <AnimatedCounter value={value ?? 0} />}
      </div>
    </div>
  );
}

