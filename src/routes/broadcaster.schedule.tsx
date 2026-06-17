import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listSchedules, listWidgets, createSchedule, cancelSchedule } from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/broadcaster/schedule")({
  component: SchedulePage,
});

function SchedulePage() {
  const qc = useQueryClient();
  const fetchWidgets = useServerFn(listWidgets);
  const fetchSchedules = useServerFn(listSchedules);
  const create = useServerFn(createSchedule);
  const cancel = useServerFn(cancelSchedule);

  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });
  const schedules = useQuery({ queryKey: ["broadcaster-schedules"], queryFn: () => fetchSchedules({ data: {} }) });

  const [widgetId, setWidgetId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const createMut = useMutation({
    mutationFn: () =>
      create({
        data: {
          widget_id: widgetId,
          title,
          description: desc || null,
          starts_at: new Date(start).toISOString(),
          ends_at: new Date(end).toISOString(),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["broadcaster-schedules"] });
      toast.success("Show scheduled");
      setTitle(""); setDesc(""); setStart(""); setEnd("");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancelMut = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcaster-schedules"] }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Schedule a show</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Select value={widgetId} onValueChange={setWidgetId}>
            <SelectTrigger><SelectValue placeholder="Choose widget" /></SelectTrigger>
            <SelectContent>
              {(widgets.data ?? []).map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Show title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button disabled={!widgetId || !title || !start || !end || createMut.isPending} onClick={() => createMut.mutate()}>
            Schedule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Upcoming & live</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(schedules.data ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground">{s.status}</div>
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.starts_at).toLocaleString()} → {new Date(s.ends_at).toLocaleString()}</div>
              </div>
              {s.status !== "cancelled" && s.status !== "completed" && (
                <Button size="sm" variant="ghost" onClick={() => cancelMut.mutate(s.id)}>Cancel</Button>
              )}
            </div>
          ))}
          {(schedules.data ?? []).length === 0 && <div className="text-sm text-muted-foreground">No shows scheduled.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
