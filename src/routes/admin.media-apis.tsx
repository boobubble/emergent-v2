import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Youtube, Image as ImageIcon, KeyRound, Eye, EyeOff, ExternalLink } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAppSettings } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import { MEDIA_DEFAULTS, mergeMediaConfig, type MediaConfig } from "@/lib/media-providers-config";

export const Route = createFileRoute("/admin/media-apis")({ component: MediaApisPage });

function MediaApisPage() {
  const { raw, refresh } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);

  const [draft, setDraft] = useState<MediaConfig>(() => mergeMediaConfig((raw as any).media));
  const [reveal, setReveal] = useState({ youtube: false, giphy: false });

  useEffect(() => {
    setDraft(mergeMediaConfig((raw as any).media));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((raw as any).media ?? {})]);

  const mut = useMutation({
    mutationFn: (next: MediaConfig) => saveSetting({ data: { key: "media", value: next } }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const update = (patch: (d: MediaConfig) => void) => {
    const next = structuredClone(draft);
    patch(next);
    setDraft(next);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Media APIs"
        description="YouTube and Giphy integration for the chat composer."
      />

      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Saved to <code className="rounded bg-background px-1 py-0.5">app_settings.media</code>.
        These keys are designed for client-side use — restrict them by HTTP referrer
        in the YouTube / Giphy developer consoles before going live.
      </div>

      {/* YouTube */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-md ${draft.youtube.enabled ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"}`}>
              <Youtube className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">YouTube Data API v3</span>
                <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                  Get key <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="text-xs text-muted-foreground">Lets users share YouTube videos in chat by URL.</div>
            </div>
            <AdminToggle
              checked={draft.youtube.enabled}
              onCheckedChange={(v) => update((d) => { d.youtube.enabled = v; })}
            />
          </div>

          <div className={draft.youtube.enabled ? "space-y-3" : "space-y-3 opacity-60 pointer-events-none"}>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><KeyRound className="h-3 w-3" /> API key</Label>
              <div className="flex gap-1">
                <Input
                  type={reveal.youtube ? "text" : "password"}
                  className="h-9 text-xs font-mono"
                  value={draft.youtube.apiKey}
                  onChange={(e) => update((d) => { d.youtube.apiKey = e.target.value; })}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                />
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0"
                  onClick={() => setReveal((r) => ({ ...r, youtube: !r.youtube }))}>
                  {reveal.youtube ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Required only for search. URL-based sharing works without a key, but oEmbed previews use the key when present.
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Default embed privacy</Label>
              <Select
                value={draft.youtube.defaultPrivacy}
                onValueChange={(v) => update((d) => { d.youtube.defaultPrivacy = v as any; })}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public" className="text-xs">Public (youtube.com)</SelectItem>
                  <SelectItem value="unlisted" className="text-xs">Cookieless (youtube-nocookie.com)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Giphy */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-md ${draft.giphy.enabled ? "bg-fuchsia-500/15 text-fuchsia-400" : "bg-muted text-muted-foreground"}`}>
              <ImageIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Giphy</span>
                <a href="https://developers.giphy.com/dashboard/" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                  Get key <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="text-xs text-muted-foreground">Lets users search and share GIFs in chat.</div>
            </div>
            <AdminToggle
              checked={draft.giphy.enabled}
              onCheckedChange={(v) => update((d) => { d.giphy.enabled = v; })}
            />
          </div>

          <div className={draft.giphy.enabled ? "space-y-3" : "space-y-3 opacity-60 pointer-events-none"}>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><KeyRound className="h-3 w-3" /> API key</Label>
              <div className="flex gap-1">
                <Input
                  type={reveal.giphy ? "text" : "password"}
                  className="h-9 text-xs font-mono"
                  value={draft.giphy.apiKey}
                  onChange={(e) => update((d) => { d.giphy.apiKey = e.target.value; })}
                  placeholder="Paste Giphy SDK / API key"
                  autoComplete="off"
                />
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0"
                  onClick={() => setReveal((r) => ({ ...r, giphy: !r.giphy }))}>
                  {reveal.giphy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Content rating</Label>
                <Select
                  value={draft.giphy.rating}
                  onValueChange={(v) => update((d) => { d.giphy.rating = v as any; })}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g" className="text-xs">G — family-safe</SelectItem>
                    <SelectItem value="pg" className="text-xs">PG</SelectItem>
                    <SelectItem value="pg-13" className="text-xs">PG-13 (default)</SelectItem>
                    <SelectItem value="r" className="text-xs">R — mature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Results per page</Label>
                <Input type="number" min={6} max={50} className="h-9 text-xs"
                  value={draft.giphy.pageSize}
                  onChange={(e) => update((d) => { d.giphy.pageSize = Math.max(6, Math.min(50, Number(e.target.value) || 24)); })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setDraft(MEDIA_DEFAULTS)} disabled={mut.isPending}>
          Reset to defaults
        </Button>
        <Button onClick={() => mut.mutate(draft)} disabled={mut.isPending} className="gap-2">
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>
    </div>
  );
}
