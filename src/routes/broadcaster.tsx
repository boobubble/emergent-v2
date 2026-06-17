import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { getBroadcasterAccess } from "@/lib/broadcaster.functions";
import { Button } from "@/components/ui/button";
import { Radio, LayoutDashboard, ListMusic, Calendar, Mic, Megaphone, BarChart3, Boxes, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/broadcaster")({
  component: BroadcasterLayout,
});

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/broadcaster", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/broadcaster/widgets", label: "Widgets", icon: Boxes },
  { to: "/broadcaster/schedule", label: "Schedule", icon: Calendar },
  { to: "/broadcaster/queue", label: "Queue", icon: ListMusic },
  { to: "/broadcaster/mic", label: "Mic", icon: Mic },
  { to: "/broadcaster/announcements", label: "Announcements", icon: Megaphone },
  { to: "/broadcaster/analytics", label: "Analytics", icon: BarChart3 },
];

function BroadcasterLayout() {
  const { user, ready } = useAuth();
  const fetchAccess = useServerFn(getBroadcasterAccess);
  const { data, isLoading } = useQuery({
    queryKey: ["broadcaster-access", user?.id],
    queryFn: () => fetchAccess(),
    enabled: !!user && ready,
    staleTime: 30_000,
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!ready || isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading studio…</div>;
  }
  if (!user || !data?.isBroadcaster) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-semibold">Broadcaster access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ask an admin for a DJ or RJ role.</p>
          <Link to="/" className="mt-4 inline-flex"><Button variant="outline" size="sm">Back to app</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Radio className="h-5 w-5 text-primary" />
          <div className="font-semibold">Broadcaster Studio</div>
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {data?.roles?.join(" · ")}
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-2 pb-2 flex flex-wrap gap-1 overflow-x-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
