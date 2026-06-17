import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { getBroadcasterAccess } from "@/lib/broadcaster.functions";
import { Button } from "@/components/ui/button";
import {
  Radio,
  LayoutDashboard,
  ListMusic,
  Calendar,
  Mic,
  Megaphone,
  BarChart3,
  Boxes,
  ShieldAlert,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/broadcaster")({
  component: BroadcasterLayout,
});

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/broadcaster", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/broadcaster/widgets", label: "Live Widgets", icon: Boxes },
  { to: "/broadcaster/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/broadcaster/mic", label: "Mic & Audio", icon: Mic },
  { to: "/broadcaster/queue", label: "Queue Manager", icon: ListMusic },
  { to: "/broadcaster/schedule", label: "Schedule", icon: Calendar },
  { to: "/broadcaster/announcements", label: "Announcements", icon: Megaphone },
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
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Left sidebar */}
        <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r bg-card/40 min-h-screen sticky top-0">
          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <Radio className="h-5 w-5 text-primary" />
            <span className="font-semibold">Broadcaster</span>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t space-y-1">
            <Link to="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <Settings className="h-4 w-4" /> Back to app
            </Link>
            <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4" /> {data?.roles?.join(" · ")}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Mobile top nav */}
          <header className="md:hidden border-b bg-background/80 backdrop-blur sticky top-0 z-30">
            <div className="px-4 py-3 flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              <div className="font-semibold">Broadcaster Studio</div>
            </div>
            <nav className="px-2 pb-2 flex gap-1 overflow-x-auto">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
