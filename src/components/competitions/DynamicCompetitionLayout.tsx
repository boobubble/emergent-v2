import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { voteForCompetitor } from "@/lib/competitions.functions";
import { PremiumCompetitorGrid } from "./PremiumCompetitorGrid";
import { PodiumLayout } from "./PodiumLayout";
import { LiveLeaderboard } from "./LiveLeaderboard";
import type { Competitor } from "./CompetitorGrid";

export type CompetitionLayoutStyle = "auto" | "vs_battle" | "podium" | "tournament" | "leaderboard";

export function resolveLayout(style: CompetitionLayoutStyle | null | undefined, count: number): Exclude<CompetitionLayoutStyle, "auto"> {
  if (style && style !== "auto") return style;
  if (count <= 2) return "vs_battle";
  if (count === 3) return "podium";
  if (count <= 8) return "tournament";
  return "leaderboard";
}

interface Props {
  competitionId: string;
  competitors: Competitor[];
  layoutStyle: CompetitionLayoutStyle | null | undefined;
  myVote: string | null;
  canVote: boolean;
  hideCounts?: boolean;
  isAdmin?: boolean;
  votingClosed?: boolean;
  votingUpcoming?: boolean;
  onEdit?: (c: Competitor) => void;
  invalidateKey: (string | number)[];
  /** VS-battle hero is rendered elsewhere; when true, this section is suppressed for VS to avoid duplication. */
  suppressVsBattle?: boolean;
}

export function DynamicCompetitionLayout({
  competitionId,
  competitors,
  layoutStyle,
  myVote,
  canVote,
  hideCounts,
  isAdmin,
  votingClosed,
  votingUpcoming,
  onEdit,
  invalidateKey,
  suppressVsBattle,
}: Props) {
  const eligible = competitors.filter((c) => !c.is_hidden && !c.is_disqualified);
  const resolved = resolveLayout(layoutStyle, eligible.length);

  const vote = useServerFn(voteForCompetitor);
  const qc = useQueryClient();

  const voteM = useMutation({
    mutationFn: (competitorId: string) => vote({ data: { competitionId, competitorId } }),
    onMutate: async (competitorId: string) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: invalidateKey }),
        qc.cancelQueries({ queryKey: ["my-competitor-vote", competitionId] }),
      ]);
      const prev = qc.getQueryData<any>(invalidateKey);
      if (prev?.competitors) {
        const next = prev.competitors.map((c: Competitor) => {
          if (c.id === competitorId) return { ...c, vote_count: (c.vote_count ?? 0) + 1 };
          if (myVote && c.id === myVote && competitorId !== myVote) {
            return { ...c, vote_count: Math.max(0, (c.vote_count ?? 0) - 1) };
          }
          return c;
        });
        qc.setQueryData(invalidateKey, { ...prev, competitors: next });
      }
      qc.setQueriesData({ queryKey: ["my-competitor-vote", competitionId] }, { competitorId });
      return { prev };
    },
    onError: (e: any, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(invalidateKey, ctx.prev);
      toast.error(e?.message ?? "Failed to vote");
    },
    onSuccess: () => toast.success("🗳 Vote counted"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: invalidateKey });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    },
  });

  if (resolved === "vs_battle") {
    if (suppressVsBattle) {
      // The VS hero already shows the pair; render a subtle summary link instead.
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-muted-foreground backdrop-blur">
          ⚔️ VS Battle is live above — cast your vote in the arena.
        </div>
      );
    }
    // Fallback: still use the grid if the hero is not rendered.
    return (
      <PremiumCompetitorGrid
        competitionId={competitionId}
        competitors={competitors}
        myVote={myVote}
        canVote={canVote}
        hideCounts={hideCounts}
        isAdmin={isAdmin}
        votingClosed={votingClosed}
        votingUpcoming={votingUpcoming}
        onEdit={onEdit}
        invalidateKey={invalidateKey}
      />
    );
  }

  if (resolved === "podium") {
    return (
      <PodiumLayout
        competitors={competitors}
        myVote={myVote}
        canVote={canVote}
        hideCounts={hideCounts}
        votingClosed={votingClosed}
        votingUpcoming={votingUpcoming}
        onVote={(id) => voteM.mutate(id)}
        isVoting={voteM.isPending}
      />
    );
  }

  if (resolved === "leaderboard") {
    return (
      <LiveLeaderboard
        competitors={competitors}
        myVote={myVote}
        canVote={canVote}
        hideCounts={hideCounts}
        votingClosed={votingClosed}
        votingUpcoming={votingUpcoming}
        onVote={(id) => voteM.mutate(id)}
        isVoting={voteM.isPending}
      />
    );
  }

  // tournament (default 4-8)
  return (
    <PremiumCompetitorGrid
      competitionId={competitionId}
      competitors={competitors}
      myVote={myVote}
      canVote={canVote}
      hideCounts={hideCounts}
      isAdmin={isAdmin}
      votingClosed={votingClosed}
      votingUpcoming={votingUpcoming}
      onEdit={onEdit}
      invalidateKey={invalidateKey}
    />
  );
}
