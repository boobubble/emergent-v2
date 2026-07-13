import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, Vote, Eye, Heart, TrendingUp, Star, Download } from "lucide-react";
import { getCompetitionAnalytics } from "@/lib/competition-analytics.functions";

export const Route = createFileRoute("/admin/competition-analytics")({ component: Page });

type Win = "day" | "week" | "month" | "all";

function Page() {
  const fetchA = useServerFn(getCompetitionAnalytics);
  const [win, setWin] = useState<Win>("month");
  const q = useQuery({
    queryKey: ["competition-analytics", win],
    queryFn: () => fetchA({ data: { window: win } }),
    staleTime: 30_000,
  });
  const d = q.data;

  const exportCsv = () => {
    if (!d) return;
    const rows: string[][] = [["Section", "Metric", "Value"]];
    Object.entries(d.counts).forEach(([k, v]) => rows.push(["counts", k, String(v)]));
    Object.entries(d.totals).forEach(([k, v]) => rows.push(["totals", k, String(v)]));
    d.topCompetitions.forEach((c) =>
      rows.push(["top_competitions", c.name, `${c.votes} votes`]),
    );
    d.topNominees.forEach((n) =>
      rows.push(["top_nominees", `${n.username} (${n.competition})`, String(n.vote_count)]),
    );
    d.topCategories.forEach((c) => rows.push(["top_categories", c.name, String(c.votes)]));
    d.trends.forEach((t) => rows.push(["trends", t.day, String(t.count)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competition-analytics-${win}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Competition Analytics"
        description="Aggregate performance across every competition, nominee, and category."
        actions={
          <div className="flex items-center gap-2">
            {(["day", "week", "month", "all"] as Win[]).map((w) => (
              <Button
                key={w}
                size="sm"
                variant={win === w ? "default" : "outline"}
                onClick={() => setWin(w)}
              >
                {w === "all" ? "All time" : w === "day" ? "24h" : w === "week" ? "7d" : "30d"}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={!d}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Trophy} label="Total" value={d?.counts.total} loading={q.isLoading} />
        <Stat icon={TrendingUp} label="Live" value={d?.counts.active} loading={q.isLoading} />
        <Stat icon={Trophy} label="Upcoming" value={d?.counts.upcoming} loading={q.isLoading} />
        <Stat icon={Trophy} label="Completed" value={d?.counts.completed} loading={q.isLoading} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Users} label="Nominees" value={d?.totals.nominees} loading={q.isLoading} />
        <Stat icon={Vote} label="Total votes" value={d?.totals.votes} loading={q.isLoading} />
        <Stat icon={Users} label="Unique voters" value={d?.totals.uniqueVoters} loading={q.isLoading} />
        <Stat icon={Heart} label="Followers" value={d?.totals.followers} loading={q.isLoading} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat icon={Eye} label="Total views" value={d?.totals.views} loading={q.isLoading} />
        <Stat icon={Vote} label={`Votes (${win})`} value={d?.totals.votesInWindow} loading={q.isLoading} />
        <Stat icon={Star} label="Featured" value={d?.counts.featured} loading={q.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Vote trend (30d)</CardTitle></CardHeader>
          <CardContent>
            {q.isLoading ? <Skeleton className="h-32 w-full" /> : <Sparkline data={(d?.trends ?? []).map((t) => ({ label: t.day.slice(5), value: t.count }))} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top competitions (all-time votes)</CardTitle></CardHeader>
          <CardContent>
            {q.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <BarList
                items={(d?.topCompetitions ?? []).map((c) => ({
                  label: c.name,
                  value: c.votes,
                  href: `/competitions/${c.slug ?? c.id}`,
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fastest growing ({win})</CardTitle></CardHeader>
          <CardContent>
            {q.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <BarList items={(d?.fastestGrowing ?? []).map((c) => ({ label: c.name, value: c.votesInWindow, href: `/competitions/${c.slug ?? c.id}` }))} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Most viewed</CardTitle></CardHeader>
          <CardContent>
            {q.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <BarList items={(d?.mostViewed ?? []).map((c) => ({ label: c.name, value: c.views, href: `/competitions/${c.slug ?? c.id}` }))} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top nominees</CardTitle></CardHeader>
          <CardContent>
            {q.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <BarList items={(d?.topNominees ?? []).map((n) => ({ label: `${n.username} — ${n.competition}`, value: n.vote_count }))} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top categories</CardTitle></CardHeader>
          <CardContent>
            {q.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <BarList items={(d?.topCategories ?? []).map((c) => ({ label: c.name, value: c.votes }))} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, loading }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: number; loading?: boolean }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />{label}
        </div>
        {loading ? <Skeleton className="h-7 w-12" /> : <div className="mt-1 text-2xl font-semibold tabular-nums">{value ?? 0}</div>}
      </CardContent>
    </Card>
  );
}

function Sparkline({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <p className="text-sm text-muted-foreground">No data.</p>;
  const w = 320, h = 96, pad = 6;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => `${pad + i * step},${h - pad - (d.value / max) * (h - pad * 2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full" preserveAspectRatio="none">
      <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="2" points={points} />
    </svg>
  );
}

function BarList({ items }: { items: { label: string; value: number; href?: string }[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">No data.</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-1.5">
      {items.map((i, idx) => {
        const inner = (
          <>
            <div className="flex justify-between text-xs">
              <span className="truncate font-medium">{i.label}</span>
              <span className="tabular-nums text-muted-foreground">{i.value}</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(i.value / max) * 100}%` }} />
            </div>
          </>
        );
        return i.href ? (
          <Link key={idx} to={i.href} className="block hover:opacity-80">{inner}</Link>
        ) : (
          <div key={idx}>{inner}</div>
        );
      })}
    </div>
  );
}
