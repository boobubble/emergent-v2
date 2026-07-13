import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { castVote } from "@/lib/competitions.functions";

interface P {
  id: string;
  user_id: string;
  status: string;
  vote_count: number;
  profile?: { username?: string | null; avatar_url?: string | null; avatar_color?: string | null } | null;
}

export function ParticipantGrid({
  competitionId, participants, myVote, canVote, hideCounts, invalidateKey,
}: {
  competitionId: string;
  participants: P[];
  myVote: string | null;
  canVote: boolean;
  hideCounts?: boolean;
  invalidateKey?: (string | number)[];
}) {
  const vote = useServerFn(castVote);
  const qc = useQueryClient();
  const listKey = invalidateKey ?? ["competition", competitionId];
  const m = useMutation({
    mutationFn: (pid: string) => vote({ data: { competitionId, participantId: pid } }),
    onSuccess: () => {
      toast.success("Vote counted");
      qc.invalidateQueries({ queryKey: listKey });
      qc.invalidateQueries({ queryKey: ["competition-vote", competitionId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to vote"),
  });

  const approved = participants.filter((p) => p.status === "approved");
  if (approved.length === 0) return <p className="text-sm text-muted-foreground">No participants yet.</p>;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {approved.map((p) => {
        const mine = myVote === p.id;
        return (
          <div key={p.id} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-center backdrop-blur">
            <Avatar className="h-14 w-14 ring-2 ring-white/10">
              <AvatarImage src={p.profile?.avatar_url ?? undefined} />
              <AvatarFallback style={{ background: p.profile?.avatar_color ?? undefined }}>
                {(p.profile?.username ?? "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="truncate text-xs font-semibold">{p.profile?.username ?? "Anonymous"}</div>
            {!hideCounts && (
              <Badge variant="secondary" className="text-[10px]">{p.vote_count} votes</Badge>
            )}
            <Button
              size="sm"
              className="h-8 w-full text-xs"
              variant={mine ? "secondary" : "default"}
              disabled={!canVote || m.isPending}
              onClick={() => m.mutate(p.id)}
              aria-label={mine ? "You voted for this user" : `Vote for ${p.profile?.username ?? "user"}`}
            >
              {mine ? "Your Vote" : "Vote"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
