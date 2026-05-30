import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalytics, getRealtimeOverview } from "@/lib/admin.functions";
import { useAuth } from "@/lib/auth-store";
import { Users2, FileText, MessageSquare, Gamepad2, Wifi, Newspaper, BarChart3 } from "lucide-react";
import { QuickToggles } from "@/components/admin/QuickToggles";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const fetchAnalytics = useServerFn(getAnalytics);
  const fetchLive = useServerFn(getRealtimeOverview);
  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: () => fetchAnalytics({}), staleTime: 60_000 });
  const live = useQuery({ queryKey: ["admin", "live"], queryFn: () => fetchLive({}), refetchInterval: 15_000 });

  const stats = [
    { key: "users",    label: "Total Users",    icon: Users2,        tint: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",       value: analytics.data?.totalUsers,  href: "/admin/users" },
    { key: "posts",    label: "Total Posts",    icon: Newspaper,     tint: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300", value: analytics.data?.postsTotal,  href: "/admin/social-feed" },
    { key: "pages",    label: "Total Pages",    icon: FileText,      tint: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",  value: undefined,                   href: "/admin/pages" },
    { key: "online",   label: "Online Users",   icon: Wifi,          tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", value: live.data?.onlineUsers,     href: "/admin/users" },
    { key: "comments", label: "Total Comments", icon: MessageSquare, tint: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",     value: analytics.data?.messages24,  href: "/admin/chatrooms" },
    { key: "games",    label: "Total Games",    icon: Gamepad2,      tint: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300", value: analytics.data?.games24,    href: "/admin/games" },
  ];

  const series = analytics.data?.newUsersByDay ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Welcome back{user?.username ? `, ${user.username}` : ""}
        </h1>
      </div>

      {/* Stat cards (WoWonder-style) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.key} to={s.href} className="group">
            <Card className="border-border/60 transition hover:border-primary/40 hover:shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-full ${s.tint}`}>
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                  {analytics.isLoading || live.isLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <div className="text-2xl font-semibold tabular-nums">{(s.value ?? 0).toLocaleString()}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Statistics chart */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Statistics</h2>
            </div>
            <Link to="/admin/analytics" className="text-xs text-primary hover:underline">View analytics</Link>
          </div>
          {analytics.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <MiniBarChart data={series} />
          )}
        </CardContent>
      </Card>

      {/* Quick toggles — preserved from the previous dashboard */}
      <QuickToggles />
    </div>
  );
}

function MiniBarChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const labelFor = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { weekday: "short" });
  };
  return (
    <div>
      <div className="flex h-48 items-end gap-2 sm:gap-4">
        {data.map((d) => {
          const h = Math.max(4, Math.round((d.count / max) * 100));
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all"
                  style={{ height: `${h}%` }}
                  title={`${d.count} new users`}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">{labelFor(d.day)}</div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No data yet.</div>
        )}
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">New users · last 7 days</div>
    </div>
  );
}
