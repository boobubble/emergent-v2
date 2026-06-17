import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listWidgets, goLive, endLive, setMic } from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mic, MicOff, Radio } from "lucide-react";

export const Route = createFileRoute("/broadcaster/mic")({
  component: MicPage,
});

function MicPage() {
  const qc = useQueryClient();
  const fetchWidgets = useServerFn(listWidgets);
  const go = useServerFn(goLive);
  const end = useServerFn(endLive);
  const mic = useServerFn(setMic);

  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });
  const [widgetId, setWidgetId] = useState("");
  const [show, setShow] = useState("");

  const goMut = useMutation({
    mutationFn: () => go({ data: { widget_id: widgetId, show_title: show || undefined } }),
    onSuccess: () => toast.success("You're live"),
    onError: (e: Error) => toast.error(e.message),
  });
  const endMut = useMutation({
    mutationFn: () => end({ data: { widget_id: widgetId } }),
    onSuccess: () => toast.success("Show ended"),
  });
  const micOn = useMutation({
    mutationFn: (active: boolean) => mic({ data: { widget_id: widgetId, active } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcaster-widgets"] }),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Go live</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Select value={widgetId} onValueChange={setWidgetId}>
            <SelectTrigger><SelectValue placeholder="Choose widget" /></SelectTrigger>
            <SelectContent>
              {(widgets.data ?? []).map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Show title (optional)" value={show} onChange={(e) => setShow(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button disabled={!widgetId} onClick={() => goMut.mutate()}><Radio className="h-4 w-4 mr-1" /> Go live</Button>
            <Button disabled={!widgetId} variant="outline" onClick={() => endMut.mutate()}>End show</Button>
            <Button disabled={!widgetId} variant="outline" onClick={() => micOn.mutate(true)}><Mic className="h-4 w-4 mr-1" /> Mic on</Button>
            <Button disabled={!widgetId} variant="outline" onClick={() => micOn.mutate(false)}><MicOff className="h-4 w-4 mr-1" /> Mic off</Button>
          </div>
          <p className="text-xs text-muted-foreground">Mic state is a presence indicator (🎙). Real voice transport not yet wired.</p>
        </CardContent>
      </Card>
    </div>
  );
}
