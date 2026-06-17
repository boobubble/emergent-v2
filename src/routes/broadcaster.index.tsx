import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listWidgets, listAnnouncements, getBroadcasterSettings } from "@/lib/broadcaster.functions";
import { useAuth } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Radio,
  Users,
  ListMusic,
  Mic,
  Plus,
  Play,
  ArrowRight,
  Music2,
} from "lucide-react";

export const Route = createFileRoute("/broadcaster/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const fetchWidgets = useServerFn(listWidgets);
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const fetchSettings = useServerFn(getBroadcasterSettings);
  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });
  const announcements = useQuery({
    queryKey: ["broadcaster-announcements-recent"],
    queryFn: () => fetchAnnouncements({ data: { activeOnly: true } }),
  });
  const settings = useQuery({ queryKey: ["broadcaster-settings"], queryFn: () => fetchSettings() });

  const w = widgets.data ?? [];
  const liveCount = w.filter((x) => (x as any).enabled).length;
  const displayName = (user as any)?.user_metadata?.username || user?.email?.split("@")[0] || "Host";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div className="space-y-6 min-w-0">
        {/* Welcome + disclaimer */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-start">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back, {displayName} <span className="inline-block">👋</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your radio widgets, go live, and connect with your listeners.
            </p>
          </div>
          {settings.data?.disclaimer_enabled && settings.data?.disclaimer_text && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground max-w-sm">
              {settings.data.disclaimer_text}
            </div>
          )}
        </div>

        {/* Widgets grid */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Your Radio Widgets</h2>
              <p className="text-xs text-muted-foreground">Each widget can go live independently.</p>
            </div>
            <Link to="/broadcaster/widgets">
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-4 w-4" /> Create Widget
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {w.map((widget, i) => {
              const enabled = (widget as any).enabled;
              return (
                <Card key={widget.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-semibold">
                          {i + 1}
                        </span>
                        {widget.name}
                      </span>
                      <Badge variant={enabled ? "default" : "secondary"} className="text-[10px]">
                        {enabled ? "● LIVE" : "● OFFLINE"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="text-xs text-muted-foreground">/{widget.slug}</div>
                    <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
                      <div className="h-10 w-10 rounded bg-muted grid place-items-center">
                        <Music2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase text-muted-foreground">
                          {enabled ? "Now Playing" : "Not Live"}
                        </div>
                        <div className="text-xs truncate">
                          {enabled ? widget.description || "On air" : "Go live to start your radio."}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to="/broadcaster/mic" className="flex-1">
                        <Button size="sm" variant={enabled ? "default" : "outline"} className="w-full gap-1">
                          <Mic className="h-3.5 w-3.5" /> Mic
                        </Button>
                      </Link>
                      <Link to="/broadcaster/queue" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full gap-1">
                          <Play className="h-3.5 w-3.5" /> Play
                        </Button>
                      </Link>
                    </div>
                    <Link to="/broadcaster/widgets">
                      <Button size="sm" variant="ghost" className="w-full justify-between">
                        Manage Widget <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}

            {/* Create card */}
            <Link to="/broadcaster/widgets" className="block">
              <Card className="border-dashed h-full grid place-items-center p-6 hover:bg-muted/30 transition">
                <div className="text-center">
                  <Plus className="mx-auto h-6 w-6 text-muted-foreground" />
                  <div className="mt-2 text-sm font-medium">Create New Radio Widget</div>
                  <div className="text-xs text-muted-foreground">Add more stations</div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Live Overview</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Stat label="Live Widgets" value={liveCount} icon={Radio} />
            <Stat label="Total Widgets" value={w.length} icon={Users} />
            <Stat label="Announcements" value={announcements.data?.length ?? 0} icon={Megaphone} />
            <Stat label="Total Queue" value={w.reduce((a, x) => a + (((x as any).queue_size as number) || 0), 0)} icon={ListMusic} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active Widgets</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {w.length === 0 && <div className="text-xs text-muted-foreground">No widgets yet.</div>}
            {w.slice(0, 6).map((x, i) => {
              const on = (x as any).enabled;
              return (
                <div key={x.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-primary/15 text-primary text-[10px]">
                      {i + 1}
                    </span>
                    <span className="truncate">{x.name}</span>
                  </span>
                  <Badge variant={on ? "default" : "secondary"} className="text-[10px]">
                    {on ? "● LIVE" : "● OFFLINE"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Latest Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(announcements.data ?? []).slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-md border p-2">
                <div className="text-[10px] uppercase text-muted-foreground">{a.kind.replace("_", " ")}</div>
                <div className="text-sm font-medium truncate">{a.title}</div>
              </div>
            ))}
            {(announcements.data ?? []).length === 0 && (
              <div className="text-xs text-muted-foreground">No active announcements.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Radio }) {
  return (
    <div className="rounded-lg border bg-card/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
