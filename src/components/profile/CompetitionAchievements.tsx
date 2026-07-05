import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy } from "lucide-react";
import { getUserAchievements } from "@/lib/competitions.functions";
import { Badge } from "@/components/ui/badge";

export function CompetitionAchievements({ userId }: { userId: string }) {
  const fn = useServerFn(getUserAchievements);
  const { data } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: () => fn({ data: { userId } }),
    enabled: !!userId,
  });
  if (!data) return null;
  if (data.total_wins === 0 && data.total_joined === 0) return null;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Trophy className="h-4 w-4 text-amber-400" /> Competition Achievements
        </h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span><b className="text-foreground">{data.total_wins}</b> wins</span>
          <span><b className="text-foreground">{data.total_joined}</b> joined</span>
          <span><b className="text-foreground">{data.live_count}</b> live</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.awards.slice(0, 8).map((a: any) => (
          <Badge key={a.id} variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300">
            🏆 {a.badge_label ?? a.competition?.name ?? "Winner"}
          </Badge>
        ))}
      </div>
    </section>
  );
}
