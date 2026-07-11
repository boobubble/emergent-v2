import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import {
  followCompetition,
  unfollowCompetition,
  getMyCompetitionFollow,
  getCompetitionFollowerCount,
} from "@/lib/competitions.functions";
import { Button } from "@/components/ui/button";

export function CompetitionFollowButton({
  competitionId,
  userId,
  compact,
}: {
  competitionId: string;
  userId: string | null;
  compact?: boolean;
}) {
  const follow = useServerFn(followCompetition);
  const unfollow = useServerFn(unfollowCompetition);
  const getMine = useServerFn(getMyCompetitionFollow);
  const getCount = useServerFn(getCompetitionFollowerCount);
  const qc = useQueryClient();

  const { data: mine } = useQuery({
    queryKey: ["competition-follow-mine", competitionId, userId],
    queryFn: () => getMine({ data: { competitionId } }),
    enabled: !!userId && !!competitionId,
  });

  const { data: count } = useQuery({
    queryKey: ["competition-follow-count", competitionId],
    queryFn: () => getCount({ data: { competitionId } }),
    enabled: !!competitionId,
  });

  const following = !!mine?.following;
  const total = count?.count ?? 0;

  const m = useMutation({
    mutationFn: () =>
      (following ? unfollow : follow)({ data: { competitionId } }),
    onSuccess: () => {
      toast.success(following ? "Unfollowed" : "You'll be notified when this changes");
      qc.invalidateQueries({ queryKey: ["competition-follow-mine", competitionId] });
      qc.invalidateQueries({ queryKey: ["competition-follow-count", competitionId] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Button
      size={compact ? "sm" : "sm"}
      variant={following ? "default" : "secondary"}
      disabled={!userId || m.isPending}
      onClick={() => {
        if (!userId) { toast.error("Sign in to follow"); return; }
        m.mutate();
      }}
      title={!userId ? "Sign in to follow" : following ? "Unfollow" : "Follow"}
    >
      {following ? <BellRing className="mr-1 h-4 w-4" /> : <Bell className="mr-1 h-4 w-4" />}
      {following ? "Following" : "Follow"}
      {total > 0 && <span className="ml-1.5 text-xs opacity-70">· {total}</span>}
    </Button>
  );
}
