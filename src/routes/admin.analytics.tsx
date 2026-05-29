import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAnalytics, getRealtimeOverview, getTopUsers } from "@/lib/admin.functions";
import { Users, Wifi, MessageSquare, Gamepad2, FileText, Hash, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const fetchAnalytics = useServerFn(getAnalytics);
  const fetchLive = useServerFn(getRealtimeOverview);
  const fetchTop = useServerFn(getTopUsers);

  const a = useQuery({ queryKey: ["admin", "analytics"], queryFn: () => fetchAnalytics({}), staleTime: 30_000, refetchInterval: 60_000 });
  const live = useQuery({ queryKey: ["admin", "live"], queryFn: () => fetchLive({}), refetchInterval: 15_000 });
  const top = useQuery({ queryKey: ["admin", "topusers"], queryFn: () => fetchTop({}), staleTime: 60_000 });

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Lightweight overview of community activity."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            Live
          </Badge>
        }
      />

      {/* Realtime row */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Wifi} label="Online now" value={live.data?.onlineUsers} loading={live.isLoading} tone="ok" />
        <Stat icon={Hash} label="Active rooms" value={live.data?.activeRooms} loading={live.isLoading} />
        <Stat icon={Gamepad2} label="Active games" value={live.data?.activeGames} loading={live.isLoading} />
        <Stat icon={FileText} label="Posts / min" value={live.data?.postsLastMinute} loading={live.isLoading} />
      </div>

      {/* Totals row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Users} label="Total users" value={a.data?.totalUsers} loading={a.isLoading} />
        <Stat icon={TrendingUp} label="New users 24h" value={a.data?.newUsers24} loading={a.isLoading} />
        <Stat icon={MessageSquare} label="Messages 24h" value={a.data?.messages24} loading={a.isLoading} />
        <Stat icon={FileText} label="Posts 24h" value={a.data?.posts24} loading={a.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Daily signups (7d)</CardTitle></CardHeader>
          <CardContent>
            {a.isLoading ? <Skeleton className="h-32 w-full" /> : <Sparkline data={(a.data?.newUsersByDay ?? []).map((d) => ({ label: d.day.slice(5), value: d.count }))} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top rooms (24h messages)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {a.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (a.data?.topChannels ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <BarList items={(a.data?.topChannels ?? []).map((c) => ({ label: c.channel, value: c.count }))} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top users by XP</CardTitle></CardHeader>
          <CardContent>
            {top.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(top.data ?? []).map((u) => (
                  <div key={u.id} className="flex items-center gap-2 rounded-md border border-border/60 p-2">
                    <div
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{ background: u.avatar_url ? `url(${u.avatar_url}) center/cover` : u.avatar_color }}
                    >
                      {!u.avatar_url && (u.username?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">{u.username}</div>
                      <div className="text-[10px] text-muted-foreground">Lv {u.level} · {u.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, loading, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: number; loading?: boolean; tone?: "ok" }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />{label}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          {loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-semibold tabular-nums">{value ?? 0}</div>}
          {tone === "ok" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
        </div>
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
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full" preserveAspectRatio="none">
        <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="2" points={points} />
        {data.map((d, i) => {
          const x = pad + i * step;
          const y = h - pad - (d.value / max) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--primary))" />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
    </div>
  );
}

function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-1.5">
      {items.map((i) => (
        <div key={i.label}>
          <div className="flex justify-between text-xs">
            <span className="truncate font-medium">{i.label}</span>
            <span className="tabular-nums text-muted-foreground">{i.value}</span>
          </div>
          <div className="mt-0.5 h-1.5 w-full rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
