import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { ArrowLeft, Trophy, Users, Vote, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getCompetition, getMyVote, joinCompetition, leaveCompetition } from "@/lib/competitions.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { Countdown } from "@/components/competitions/Countdown";
import { TopThree } from "@/components/competitions/TopThree";
import { ParticipantGrid } from "@/components/competitions/ParticipantGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/competitions/$id")({
  head: () => ({
    meta: [
      { title: "Competition" },
      { name: "description", content: "Vote and participate in this community competition." },
    ],
  }),
  component: CompetitionDetail,
});

function CompetitionDetail() {
  const { id } = Route.useParams();
  const get = useServerFn(getCompetition);
  const getVote = useServerFn(getMyVote);
  const join = useServerFn(joinCompetition);
  const leave = useServerFn(leaveCompetition);
  const qc = useQueryClient();
  const auth = useAuth();
  const userId = auth?.user?.id ?? null;

  const { data } = useQuery({
    queryKey: ["competition", id],
    queryFn: () => get({ data: { id } }),
  });

  const { data: myVote } = useQuery({
    queryKey: ["competition-vote", id, userId],
    queryFn: () => getVote({ data: { competitionId: id } }),
    enabled: !!userId,
  });

  // Realtime updates
  useEffect(() => {
    const ch = supabase
      .channel(`competition:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_votes", filter: `competition_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["competition", id] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "competition_participants", filter: `competition_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["competition", id] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, qc]);

  const joinM = useMutation({
    mutationFn: () => join({ data: { competitionId: id } }),
    onSuccess: () => { toast.success("Joined!"); qc.invalidateQueries({ queryKey: ["competition", id] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to join"),
  });
  const leaveM = useMutation({
    mutationFn: () => leave({ data: { competitionId: id } }),
    onSuccess: () => { toast.success("Left"); qc.invalidateQueries({ queryKey: ["competition", id] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (!data) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  }
  const { competition: c, participants } = data;
  if (!c) {
    return <div className="grid min-h-screen place-items-center">Competition not found.</div>;
  }
  const category = (c as any).category as { name?: string; color?: string | null } | null;
  const iJoined = !!userId && (participants as any[]).some((p) => p.user_id === userId);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <div
        className="relative h-64 w-full overflow-hidden"
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
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4">
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
              <h1 className="text-2xl font-bold">{c.name}</h1>
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

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {c.total_participants} participants</span>
            <span className="inline-flex items-center gap-1"><Vote className="h-4 w-4" /> {c.total_votes} votes</span>
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(c.start_at).toLocaleDateString()} → {new Date(c.end_at).toLocaleDateString()}</span>
            <span className="inline-flex items-center gap-1"><Trophy className="h-4 w-4" /> {c.winner_count} winner{c.winner_count > 1 ? "s" : ""}</span>
          </div>

          {c.rules && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Rules</div>
              <p className="whitespace-pre-wrap">{c.rules}</p>
            </div>
          )}

          {userId && (c.status === "upcoming" || c.status === "live") && (
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

        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><Trophy className="h-4 w-4 text-amber-400" /> Live Ranking</h2>
            <TopThree participants={participants as any} hideCounts={!c.show_live_counts} />
          </div>
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="mb-3 font-bold">Vote for a contestant</h2>
            <ParticipantGrid
              competitionId={c.id}
              participants={participants as any}
              myVote={myVote?.participantId ?? null}
              canVote={!!userId && c.status === "live"}
              hideCounts={!c.show_live_counts}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
