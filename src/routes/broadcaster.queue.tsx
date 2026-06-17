import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listWidgets, listQueue, addQueueItem, removeQueueItem, clearQueue } from "@/lib/broadcaster.functions";
import { updateSetting } from "@/lib/admin.functions";
import { useDjPlayer } from "@/lib/dj-store";
import { buildTrackFromUrl, currentPositionSec, type DjPlayerState } from "@/lib/dj-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Play, Pause, Square, Radio } from "lucide-react";

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
  const saveSetting = useServerFn(updateSetting);
  const { state: djState } = useDjPlayer();

  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });
  const [widgetId, setWidgetId] = useState<string>("");
  const queue = useQuery({
    queryKey: ["broadcaster-queue", widgetId],
    queryFn: () => fetchQueue({ data: { widget_id: widgetId } }),
    enabled: !!widgetId,
  });

  const [url, setUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamName, setStreamName] = useState("");
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

  const playMut = useMutation({
    mutationFn: async (item: { youtube_url: string; title?: string | null }) => {
      const track = buildTrackFromUrl(item.youtube_url, item.title ?? undefined);
      if (!track) throw new Error("Could not parse track URL");
      const next: DjPlayerState = {
        ...djState,
        enabled: true,
        track,
        playing: true,
        startedAtMs: Date.now(),
        positionSec: 0,
      };
      await saveSetting({ data: { key: "dj_player", value: next } });
    },
    onSuccess: () => toast.success("Now playing"),
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePauseMut = useMutation({
    mutationFn: async () => {
      if (!djState.track) return;
      const next: DjPlayerState = {
        ...djState,
        playing: !djState.playing,
        positionSec: djState.playing ? currentPositionSec(djState) : djState.positionSec,
        startedAtMs: djState.playing ? 0 : Date.now(),
      };
      await saveSetting({ data: { key: "dj_player", value: next } });
    },
    onSuccess: () => toast.success(djState.playing ? "Paused" : "Resumed"),
    onError: (e: Error) => toast.error(e.message),
  });

  const stopMut = useMutation({
    mutationFn: async () => {
      const next: DjPlayerState = {
        ...djState,
        playing: false,
        track: null,
        positionSec: 0,
        startedAtMs: 0,
      };
      await saveSetting({ data: { key: "dj_player", value: next } });
    },
    onSuccess: () => toast.success("Stopped"),
    onError: (e: Error) => toast.error(e.message),
  });

  const nowPlayingItem = (queue.data ?? []).find((q) => q.youtube_url === djState.track?.url);

  return (
    <div className="space-y-6">
      {djState.enabled && djState.track && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-primary flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${djState.playing ? "bg-red-500 animate-pulse" : "bg-muted-foreground"}`} />
              {djState.playing ? "Now playing" : "Paused"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            {nowPlayingItem?.thumbnail && <img src={nowPlayingItem.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium">{djState.track.title || nowPlayingItem?.title || djState.track.url}</div>
              <div className="truncate text-xs text-muted-foreground">{nowPlayingItem?.channel || djState.track.url}</div>
            </div>
            <Button size="sm" variant="outline" disabled={togglePauseMut.isPending} onClick={() => togglePauseMut.mutate()} className="gap-1">
              {djState.playing ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Resume</>}
            </Button>
            <Button size="sm" variant="ghost" disabled={stopMut.isPending} onClick={() => stopMut.mutate()} className="gap-1">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </CardContent>
        </Card>
      )}

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
          <p className="text-xs text-muted-foreground">
            Tip: click <Play className="inline h-3 w-3" /> on a track to push it live to every listener via the DJ player.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Radio className="h-4 w-4" /> Play radio stream URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Station name (optional, e.g. YoChat Radio)"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="https://radio.example.org/public/yourstation (MP3, Icecast, HLS)"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
            />
            <Button
              disabled={!streamUrl.trim() || playMut.isPending}
              onClick={() =>
                playMut.mutate({ youtube_url: streamUrl.trim(), title: streamName.trim() || null })
              }
              className="gap-1"
            >
              <Play className="h-4 w-4" /> Go live
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Pushes the stream live to every listener via the DJ player. Use Pause/Stop above to control it.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(queue.data ?? []).map((q) => {
          const isLoaded = djState.track?.url === q.youtube_url;
          const isCurrent = isLoaded && djState.playing;
          return (
            <div key={q.id} className={`flex items-center gap-3 rounded-md border p-2 ${isLoaded ? "border-primary/50 bg-primary/5" : ""}`}>
              {q.thumbnail && <img src={q.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium flex items-center gap-2">
                  {isCurrent && <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                  {isLoaded && !isCurrent && <span className="text-xs text-muted-foreground">(paused)</span>}
                  {q.title || q.youtube_url}
                </div>
                <div className="truncate text-xs text-muted-foreground">{q.channel || q.youtube_id}</div>
              </div>
              {isLoaded ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={togglePauseMut.isPending}
                  onClick={() => togglePauseMut.mutate()}
                  className="gap-1"
                >
                  {djState.playing ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Resume</>}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={playMut.isPending}
                  onClick={() => playMut.mutate({ youtube_url: q.youtube_url, title: q.title })}
                  className="gap-1"
                >
                  <Play className="h-4 w-4" /> Play
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => removeMut.mutate(q.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          );
        })}
        {widgetId && (queue.data ?? []).length === 0 && <div className="text-sm text-muted-foreground">Queue is empty.</div>}
      </div>
    </div>
  );
}
