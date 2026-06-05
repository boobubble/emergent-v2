import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Disc3, Play, Pause, Radio, Link as LinkIcon, Lock, Eye, EyeOff, Antenna } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/lib/app-settings";
import {
  updateSetting,
  getDjBroadcastCredentials,
  saveDjBroadcastCredentials,
} from "@/lib/admin.functions";
import {
  DJ_DEFAULTS, buildTrackFromUrl, currentPositionSec, mergeDjConfig, type DjPlayerState,
} from "@/lib/dj-config";

export const Route = createFileRoute("/admin/dj")({ component: DjAdminPage });

function DjAdminPage() {
  const { raw, refresh } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);

  const [draft, setDraft] = useState<DjPlayerState>(() =>
    mergeDjConfig((raw as any).dj_player),
  );

  useEffect(() => {
    setDraft(mergeDjConfig((raw as any).dj_player));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((raw as any).dj_player ?? {})]);

  const mut = useMutation({
    mutationFn: (next: DjPlayerState) =>
      saveSetting({ data: { key: "dj_player", value: next } }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const update = (patch: (d: DjPlayerState) => void) => {
    const next = structuredClone(draft);
    patch(next);
    setDraft(next);
  };

  const [urlDraft, setUrlDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState("");

  const goLive = () => {
    const track = buildTrackFromUrl(urlDraft, titleDraft);
    if (!track) { toast.error("Paste a YouTube URL or a direct audio link"); return; }
    const next: DjPlayerState = {
      ...draft,
      enabled: true,
      track,
      playing: true,
      positionSec: 0,
      startedAtMs: Date.now(),
    };
    setDraft(next);
    mut.mutate(next);
    setUrlDraft("");
    setTitleDraft("");
  };

  const togglePlay = () => {
    if (!draft.track) return;
    const next: DjPlayerState = draft.playing
      ? { ...draft, playing: false, positionSec: currentPositionSec(draft), startedAtMs: 0 }
      : { ...draft, playing: true, startedAtMs: Date.now() };
    setDraft(next);
    mut.mutate(next);
  };

  const stopTrack = () => {
    const next: DjPlayerState = { ...draft, track: null, playing: false, positionSec: 0, startedAtMs: 0 };
    setDraft(next);
    mut.mutate(next);
  };

  const goLiveWithUrl = (url: string, title: string) => {
    const track = buildTrackFromUrl(url, title);
    if (!track) { toast.error("Listen URL is missing or invalid"); return; }
    const next: DjPlayerState = {
      ...draft,
      enabled: true,
      track,
      playing: true,
      positionSec: 0,
      startedAtMs: Date.now(),
    };
    setDraft(next);
    mut.mutate(next);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Live DJ / RJ"
        description="Pin a synced music player under the lobby chat composer. All listeners hear the same track in real time."
      />

      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Saved to <code className="rounded bg-background px-1 py-0.5">app_settings.dj_player</code>.
        Updates broadcast instantly via realtime — no page refresh needed for listeners.
      </div>

      {/* Master switch + DJ identity */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-md ${draft.enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Radio className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Footer player</div>
              <div className="text-xs text-muted-foreground">
                When on, every visitor in the lobby chat sees the player bar.
              </div>
            </div>
            <AdminToggle
              checked={draft.enabled}
              onCheckedChange={(v) => update((d) => { d.enabled = v; })}
            />
          </div>

          <div className={draft.enabled ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2 opacity-60 pointer-events-none"}>
            <div className="space-y-1">
              <Label className="text-xs">DJ / RJ name (chip label)</Label>
              <Input
                value={draft.djName}
                onChange={(e) => update((d) => { d.djName = e.target.value.slice(0, 40); })}
                placeholder="e.g. DJ Nova"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Default listener volume ({draft.defaultVolume}%)</Label>
              <Input
                type="range" min={0} max={100} step={1}
                value={draft.defaultVolume}
                onChange={(e) => update((d) => { d.defaultVolume = Number(e.target.value) || 0; })}
                className="h-9"
              />
            </div>
            <div className="flex items-center justify-between sm:col-span-2 rounded-md border bg-muted/30 px-3 py-2">
              <div>
                <div className="text-xs font-medium">Allow listeners to mute</div>
                <div className="text-[11px] text-muted-foreground">Adds a personal mute button to the footer.</div>
              </div>
              <AdminToggle
                checked={draft.allowListenerMute}
                onCheckedChange={(v) => update((d) => { d.allowListenerMute = v; })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live console */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Disc3 className={`h-4 w-4 text-primary ${draft.playing && draft.track ? "animate-spin" : "opacity-50"}`} style={{ animationDuration: "3.5s" }} />
            <div className="text-sm font-semibold">Live console</div>
          </div>

          <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs">
            <div className="font-medium text-foreground">
              {draft.track
                ? (draft.track.title || (draft.track.kind === "youtube" ? "YouTube stream" : "Audio stream"))
                : <span className="italic text-muted-foreground">Nothing on air</span>}
            </div>
            {draft.track && (
              <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{draft.track.url}</div>
            )}
            <div className="mt-1 text-[11px] text-muted-foreground">
              {draft.playing ? "Playing" : "Paused"} · {Math.floor(currentPositionSec(draft))}s in
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-xs"><LinkIcon className="h-3 w-3" /> Track URL</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://youtu.be/… or https://stream.example.com/live.mp3"
                className="h-9 min-w-[14rem] flex-1 text-xs"
              />
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Title (optional)"
                className="h-9 w-44 text-xs"
              />
              <Button onClick={goLive} disabled={mut.isPending} className="h-9 gap-1">
                <Play className="h-3.5 w-3.5" /> Go live
              </Button>
            </div>
            <div className="text-[11px] text-muted-foreground">
              YouTube videos and direct audio streams (mp3, aac, ogg, hls) are supported.
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={togglePlay} disabled={!draft.track || mut.isPending}>
              {draft.playing ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>}
            </Button>
            <Button variant="ghost" size="sm" className="h-8" onClick={stopTrack} disabled={!draft.track || mut.isPending}>
              Stop / clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <AzuraCastCard onUseListenUrl={goLiveWithUrl} />



      <div className="sticky bottom-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setDraft(DJ_DEFAULTS)} disabled={mut.isPending}>
          Reset to defaults
        </Button>
        <Button onClick={() => mut.mutate(draft)} disabled={mut.isPending} className="gap-2">
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>
    </div>
  );
}
