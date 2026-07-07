import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Trophy, Target, Sparkles } from "lucide-react";
import { getMyGamification } from "@/lib/gamification-engine.functions";

/**
 * Small profile widget that surfaces the current user's Gamification
 * progress (achievements %, active quests, milestones, season tier).
 * Renders nothing when there is no data yet.
 */
export function GamificationSummary() {
  const fn = useServerFn(getMyGamification);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = useQuery<any>({ queryKey: ["my-gamification"], queryFn: () => fn({}) });
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openQuests = data.quests.filter((q: any) => !q.progress?.completed_at).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doneMilestones = data.milestones.filter((m: any) => m.progress?.completed_at).length;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold"><Trophy className="h-4 w-4 text-primary" /> Gamification</h3>
        <Link to="/gamification" className="text-[11px] font-semibold text-primary hover:underline">View all</Link>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
        <div><div className="text-lg font-bold">{data.completionPct}%</div><div className="text-muted-foreground">Complete</div></div>
        <div><div className="text-lg font-bold">{openQuests}</div><div className="text-muted-foreground"><Target className="mx-auto h-3 w-3" /> Quests</div></div>
        <div><div className="text-lg font-bold">{doneMilestones}</div><div className="text-muted-foreground"><Sparkles className="mx-auto h-3 w-3" /> Milestones</div></div>
        <div><div className="text-lg font-bold">{data.seasonProgress?.tier ?? 0}</div><div className="text-muted-foreground">Season</div></div>
      </div>
    </section>
  );
}
