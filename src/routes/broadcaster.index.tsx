import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listWidgets, listAnnouncements, getBroadcasterSettings } from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Radio, Boxes } from "lucide-react";

export const Route = createFileRoute("/broadcaster/")({
  component: Dashboard,
});

function Dashboard() {
  const fetchWidgets = useServerFn(listWidgets);
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const fetchSettings = useServerFn(getBroadcasterSettings);
  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });
  const announcements = useQuery({
    queryKey: ["broadcaster-announcements-recent"],
    queryFn: () => fetchAnnouncements({ data: { activeOnly: true } }),
  });
  const settings = useQuery({ queryKey: ["broadcaster-settings"], queryFn: () => fetchSettings() });

  return (
    <div className="space-y-6">
      {settings.data?.disclaimer_enabled && settings.data?.disclaimer_text && (
        <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {settings.data.disclaimer_text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Boxes className="h-4 w-4" /> Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{widgets.data?.length ?? 0}</div>
            <Link to="/broadcaster/widgets"><Button size="sm" variant="outline" className="mt-2">Manage</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4" /> Active Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{announcements.data?.length ?? 0}</div>
            <Link to="/broadcaster/announcements"><Button size="sm" variant="outline" className="mt-2">Create</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Radio className="h-4 w-4" /> Public Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/radio"><Button size="sm" variant="outline" className="mt-2">View /radio</Button></Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Latest announcements</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(announcements.data ?? []).slice(0, 6).map((a) => (
            <div key={a.id} className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">{a.kind.replace("_", " ")}{a.pinned ? " · pinned" : ""}</div>
              <div className="font-medium">{a.title}</div>
              {a.body && <div className="text-sm text-muted-foreground">{a.body}</div>}
            </div>
          ))}
          {(announcements.data ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">No active announcements yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
