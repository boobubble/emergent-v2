import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Trash2, Trophy, EyeOff, Eye, Ban, RotateCcw, Undo2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminDeleteCompetitor,
  voteForCompetitor,
  adminSetCompetitorFlags,
  adminResetCompetitorVotes,
} from "@/lib/competitions.functions";

export interface Competitor {
  id: string;
  competition_id: string;
  name: string;
  photo_url?: string | null;
  description?: string | null;
  linked_user_id?: string | null;
  vote_count: number;
  sort_order: number;
  is_hidden?: boolean;
  is_disqualified?: boolean;
  linked_profile?: { username?: string | null; avatar_url?: string | null; avatar_color?: string | null } | null;
}


export function CompetitorGrid({
  competitionId,
  competitors,
  myVote,
  canVote,
  hideCounts,
  isAdmin,
  onEdit,
  invalidateKey,
}: {
  competitionId: string;
  competitors: Competitor[];
  myVote: string | null;
  canVote: boolean;
  hideCounts?: boolean;
  isAdmin?: boolean;
  onEdit?: (c: Competitor) => void;
  invalidateKey: (string | number)[];
}) {
  const vote = useServerFn(voteForCompetitor);
  const del = useServerFn(adminDeleteCompetitor);
  const qc = useQueryClient();

  const totalVotes = competitors.reduce((sum, c) => sum + (c.vote_count ?? 0), 0);
  const sorted = [...competitors].sort((a, b) => b.vote_count - a.vote_count);
  const leaderId = sorted[0]?.id;

  const voteM = useMutation({
    mutationFn: (competitorId: string) => vote({ data: { competitionId, competitorId } }),
    onSuccess: () => {
      toast.success("Vote counted");
      qc.invalidateQueries({ queryKey: invalidateKey });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to vote"),
  });

  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (competitors.length === 0) {
    return <p className="text-sm text-muted-foreground">No competitors added yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {competitors.map((c) => {
        const mine = myVote === c.id;
        const pct = totalVotes > 0 ? Math.round((c.vote_count / totalVotes) * 100) : 0;
        const isLeader = leaderId === c.id && c.vote_count > 0;
        return (
          <div
            key={c.id}
            className="relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
          >
            {isLeader && !hideCounts && (
              <Badge className="absolute right-3 top-3 border border-amber-500/40 bg-amber-500/20 text-amber-300">
                <Trophy className="mr-1 h-3 w-3" /> Leading
              </Badge>
            )}
            <div className="flex items-start gap-3">
              <Avatar className="h-16 w-16 ring-2 ring-white/10">
                <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
                <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
                  {c.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{c.name}</div>
                {c.linked_profile?.username && (
                  <div className="truncate text-xs text-muted-foreground">@{c.linked_profile.username}</div>
                )}
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                )}
              </div>
            </div>

            {!hideCounts && (
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{c.vote_count} votes</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1"
                variant={mine ? "secondary" : "default"}
                disabled={!canVote || voteM.isPending}
                onClick={() => voteM.mutate(c.id)}
              >
                {mine ? "Your Vote" : "Vote"}
              </Button>
              {isAdmin && (
                <>
                  <Button size="icon" variant="ghost" onClick={() => onEdit?.(c)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => confirm(`Remove ${c.name}?`) && delM.mutate(c.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
