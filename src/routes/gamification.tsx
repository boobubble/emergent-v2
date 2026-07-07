import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Target, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { getMyGamification, claimSeasonTier } from "@/lib/gamification-engine.functions";

export const Route = createFileRoute("/gamification")({
  head: () => ({
    meta: [
      { title: "Achievements & Quests — BooBubble" },
      { name: "description", content: "Track your achievements, daily quests, milestones and season pass progress." },
    ],
  }),
  component: Page,
});

type Progress = { progress: number; completed_at: string | null; claimed_at: string | null } | null;
type CatalogRow = { id: string; name: string; description: string | null; target: number; reward_coins: number; reward_xp: number; progress: Progress };

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>;
}

function Card({ row, icon }: { row: CatalogRow; icon: React.ReactNode }) {
  const done = !!row.progress?.completed_at;
  const p = row.progress?.progress ?? 0;
  return (
    <div className={`rounded-2xl border p-4 ${done ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">{done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{row.name}</div>
          {row.description && <div className="text-xs text-muted-foreground">{row.description}</div>}
          <div className="mt-2"><Bar value={p} max={row.target} /></div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{p}/{row.target}</span>
            <span>+{row.reward_coins}🪙 · +{row.reward_xp}xp</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Page() {
  const fn = useServerFn(getMyGamification);
  const claim = useServerFn(claimSeasonTier);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-gamification"], queryFn: () => fn({}) });
  const claimMut = useMutation({
    mutationFn: (v: { seasonId: string; tier: number }) => claim({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-gamification"] }),
  });
  if (!data) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  const dailies = data.quests.filter((q) => q.cadence === "daily");
  const weeklies = data.quests.filter((q) => q.cadence === "weekly");
  const monthlies = data.quests.filter((q) => q.cadence === "monthly");

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Trophy className="h-6 w-6 text-primary" /> Gamification</h1>
        <p className="text-sm text-muted-foreground">Overall completion: <b>{data.completionPct}%</b></p>
      </header>

      {data.season && (
        <section className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Season</div>
              <h2 className="text-lg font-bold">{data.season.name}</h2>
              <div className="text-xs text-muted-foreground">Tier {data.seasonProgress?.tier ?? 0} · {data.seasonProgress?.xp ?? 0} XP</div>
            </div>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {data.tiers.map((t) => {
              const reached = (data.seasonProgress?.tier ?? 0) >= t.tier;
              const claimed = (data.seasonProgress?.claimed_tiers ?? []).includes(t.tier);
              return (
                <button key={t.id} disabled={!reached || claimed || claimMut.isPending}
                  onClick={() => claimMut.mutate({ seasonId: data.season!.id, tier: t.tier })}
                  className={`rounded-xl border p-3 text-left text-xs transition-all ${reached ? "border-primary/40 bg-card hover:bg-primary/10" : "border-border bg-muted/30 text-muted-foreground"} ${claimed ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-1 font-bold">
                    {t.premium_only && <Lock className="h-3 w-3" />} Tier {t.tier}
                  </div>
                  <div>+{t.reward_coins}🪙 · +{t.reward_xp}xp</div>
                  <div className="mt-1 text-[10px]">{claimed ? "Claimed" : reached ? "Claim" : `${t.xp_required} XP`}</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {dailies.length > 0 && (
        <section><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Target className="h-4 w-4" /> Daily Quests</h2>
          <div className="grid gap-3 sm:grid-cols-2">{dailies.map((q) => <Card key={q.id} row={q} icon={<Target className="h-5 w-5" />} />)}</div>
        </section>
      )}
      {weeklies.length > 0 && (
        <section><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Target className="h-4 w-4" /> Weekly Quests</h2>
          <div className="grid gap-3 sm:grid-cols-2">{weeklies.map((q) => <Card key={q.id} row={q} icon={<Target className="h-5 w-5" />} />)}</div>
        </section>
      )}
      {monthlies.length > 0 && (
        <section><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Target className="h-4 w-4" /> Monthly Missions</h2>
          <div className="grid gap-3 sm:grid-cols-2">{monthlies.map((q) => <Card key={q.id} row={q} icon={<Target className="h-5 w-5" />} />)}</div>
        </section>
      )}

      <section><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Trophy className="h-4 w-4" /> Achievements</h2>
        <div className="grid gap-3 sm:grid-cols-2">{data.achievements.map((a) => <Card key={a.id} row={a} icon={<Trophy className="h-5 w-5" />} />)}</div>
      </section>

      <section><h2 className="mb-3 text-sm font-bold">Lifetime Milestones</h2>
        <div className="grid gap-3 sm:grid-cols-2">{data.milestones.map((m) => <Card key={m.id} row={m} icon={<Sparkles className="h-5 w-5" />} />)}</div>
      </section>
    </div>
  );
}
