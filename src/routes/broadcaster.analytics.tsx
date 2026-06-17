import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getBroadcasterAnalytics } from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Tv, Clock, Boxes, Music } from "lucide-react";

export const Route = createFileRoute("/broadcaster/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fetchAnalytics = useServerFn(getBroadcasterAnalytics);
  const q = useQuery({ queryKey: ["broadcaster-analytics"], queryFn: () => fetchAnalytics(), staleTime: 60_000 });
  const a = q.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Analytics</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={Trophy} label="Top Host" value={a?.topHost ? `${a.topHost.host_id.slice(0, 8)}…` : "—"} hint={a?.topHost ? `${a.topHost.shows} completed shows` : "No data yet"} />
        <Stat icon={Tv} label="Top Show" value={a?.topShow?.title ?? "—"} hint={a?.topShow ? `${a.topShow.minutes} min total` : "No data yet"} />
        <Stat icon={Clock} label="Peak Listener Time" value={a?.peakHour ? `${String(a.peakHour.hour).padStart(2, "0")}:00 UTC` : "—"} hint={a?.peakHour ? `${a.peakHour.listeners} listeners` : "No data yet"} />
        <Stat icon={Boxes} label="Most Active Widget" value={a?.mostActiveWidget?.name ?? "—"} hint={a?.mostActiveWidget ? `${a.mostActiveWidget.listeners} peak listeners` : "No data yet"} />
        <Stat icon={Music} label="Most Played Track" value={a?.mostPlayedTrack?.title || a?.mostPlayedTrack?.youtube_id || "—"} hint={a?.mostPlayedTrack ? `${a.mostPlayedTrack.plays} plays` : "No data yet"} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold truncate">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
