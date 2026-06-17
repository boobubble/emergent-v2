import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listWidgets, listQueue, addQueueItem, removeQueueItem, clearQueue } from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/broadcaster/queue")({
  component: QueuePage,
});

function QueuePage() {
  const qc = useQueryClient();
  const fetchWidgets = useServerFn(listWidgets);
  const fetchQueue = useServerFn(listQueue);
  const add = useServerFn(addQueueItem);
  const remove = useServerFn(removeQueueItem);
  const clear = useServerFn(clearQueue);

  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });
  const [widgetId, setWidgetId] = useState<string>("");
  const queue = useQuery({
    queryKey: ["broadcaster-queue", widgetId],
    queryFn: () => fetchQueue({ data: { widget_id: widgetId } }),
    enabled: !!widgetId,
  });

  const [url, setUrl] = useState("");
  const addMut = useMutation({
    mutationFn: () => add({ data: { widget_id: widgetId, url } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["broadcaster-queue", widgetId] }); setUrl(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id, widget_id: widgetId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcaster-queue", widgetId] }),
  });
  const clearMut = useMutation({
    mutationFn: () => clear({ data: { widget_id: widgetId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcaster-queue", widgetId] }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">YouTube queue</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Select value={widgetId} onValueChange={setWidgetId}>
            <SelectTrigger><SelectValue placeholder="Choose widget" /></SelectTrigger>
            <SelectContent>
              {(widgets.data ?? []).map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input placeholder="Paste a YouTube URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button disabled={!widgetId || !url || addMut.isPending} onClick={() => addMut.mutate()}>Add</Button>
          </div>
          {widgetId && (
            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Clear queue?")) clearMut.mutate(); }}>
              Clear queue
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(queue.data ?? []).map((q) => (
          <div key={q.id} className="flex items-center gap-3 rounded-md border p-2">
            {q.thumbnail && <img src={q.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium">{q.title || q.youtube_url}</div>
              <div className="truncate text-xs text-muted-foreground">{q.channel || q.youtube_id}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => removeMut.mutate(q.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {widgetId && (queue.data ?? []).length === 0 && <div className="text-sm text-muted-foreground">Queue is empty.</div>}
      </div>
    </div>
  );
}
