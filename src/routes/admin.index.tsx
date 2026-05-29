import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_NAV } from "@/components/admin/AdminNav";
import { getRealtimeOverview } from "@/lib/admin.functions";
import { Wifi, Hash, Gamepad2, FileText, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchLive = useServerFn(getRealtimeOverview);
  const live = useQuery({ queryKey: ["admin", "live"], queryFn: () => fetchLive({}), refetchInterval: 15_000 });

  const quick = ADMIN_NAV.filter((n) => n.to !== "/admin").slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Realtime activity at a glance. Open Analytics for deeper trends.</p>
        </div>
        <Link to="/admin/analytics">
          <Badge variant="outline" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />Open analytics
          </Badge>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <LiveCard icon={Wifi} label="Online now" value={live.data?.onlineUsers} loading={live.isLoading} tone="ok" />
        <LiveCard icon={Hash} label="Active rooms" value={live.data?.activeRooms} loading={live.isLoading} />
        <LiveCard icon={Gamepad2} label="Active games" value={live.data?.activeGames} loading={live.isLoading} />
        <LiveCard icon={FileText} label="Posts / min" value={live.data?.postsLastMinute} loading={live.isLoading} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {quick.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 transition hover:border-primary/40 hover:bg-muted/40">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{item.label}</div>
                      {item.badge && <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{item.badge}</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{item.group}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LiveCard({ icon: Icon, label, value, loading, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: number; loading?: boolean; tone?: "ok" }) {
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
