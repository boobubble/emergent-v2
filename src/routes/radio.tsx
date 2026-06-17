import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listWidgets, listAnnouncements } from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Megaphone } from "lucide-react";

export const Route = createFileRoute("/radio")({
  component: RadioDirectory,
});

function RadioDirectory() {
  const fetchWidgets = useServerFn(listWidgets);
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });
  const ticker = useQuery({
    queryKey: ["radio-ticker"],
    queryFn: () => fetchAnnouncements({ data: { kind: "ticker", activeOnly: true } }),
    refetchInterval: 30_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Radio</h1>
        </div>
        {(ticker.data ?? []).length > 0 && (
          <div className="bg-primary/10 px-4 py-2 text-sm flex items-center gap-2 overflow-hidden">
            <Megaphone className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="truncate">
              {(ticker.data ?? []).map((t) => t.title).join("  •  ")}
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(widgets.data ?? []).filter((w) => w.enabled).map((w) => (
          <Card key={w.id}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Radio className="h-4 w-4" /> {w.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {w.description || "Tune in via your chatroom radio player."}
            </CardContent>
          </Card>
        ))}
        {(widgets.data ?? []).length === 0 && (
          <div className="text-sm text-muted-foreground">No live widgets yet.</div>
        )}
      </main>
    </div>
  );
}
