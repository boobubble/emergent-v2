import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { toast } from "sonner";
import {
  CONTENT_TYPES, type ContentType,
  getModerationSettings,
  listModerationQueue, setContentModerationStatus,
  warnUser, banPosting, restorePosting,
  listPostingBans, listModerationLogs,
  scanContentImages, scanContentText,
} from "@/lib/moderation-engine.functions";
import { updateFeedModerationSettings } from "@/lib/feed-moderation.functions";
import { Eye, EyeOff, Trash2, RotateCcw, Sparkles, ShieldAlert, ScrollText, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/feed-moderation")({
  component: ModerationEnginePage,
  head: () => ({ meta: [{ title: "Moderation Engine · Admin" }] }),
});

const ALL_TYPES = ["all", ...CONTENT_TYPES] as const;
type TypeFilter = (typeof ALL_TYPES)[number];

function ModerationEnginePage() {
  return (
    <div>
      <AdminPageHeader
        title="Moderation Engine"
        description="One unified pipeline protecting Feed, Poetry, Memes, Images, Videos, Comments, and Competition submissions."
      />
      <Tabs defaultValue="queue" className="mt-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="bans">Posting Bans</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="queue"><QueueTab /></TabsContent>
        <TabsContent value="bans"><BansTab /></TabsContent>
        <TabsContent value="logs"><LogsTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------- Queue ----------------
function QueueTab() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<"pending_review" | "hidden" | "removed" | "all">("pending_review");
  const [type, setType] = useState<TypeFilter>("all");
  const fetchQueue = useServerFn(listModerationQueue);
  const setStatusFn = useServerFn(setContentModerationStatus);
  const warnFn = useServerFn(warnUser);
  const banFn = useServerFn(banPosting);
  const scanImgFn = useServerFn(scanContentImages);
  const scanTextFn = useServerFn(scanContentText);

  const q = useQuery({
    queryKey: ["mod-engine-queue", status, type],
    queryFn: () => fetchQueue({ data: { status, content_type: type, limit: 100 } }),
    refetchInterval: 30_000,
  });

  async function act(ct: ContentType, id: string, newStatus: "visible" | "hidden" | "removed") {
    try {
      await setStatusFn({ data: { content_type: ct, content_id: id, status: newStatus } });
      toast.success(`Marked ${newStatus}`);
      qc.invalidateQueries({ queryKey: ["mod-engine-queue"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function warn(userId: string) {
    const reason = window.prompt("Warning reason:");
    if (!reason) return;
    try {
      await warnFn({ data: { user_id: userId, reason, severity: "warning", scope: "all" } });
      toast.success("Warning sent");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function ban(userId: string) {
    const hoursStr = window.prompt("Ban duration in hours (leave empty for permanent):");
    if (hoursStr === null) return;
    const duration_hours = hoursStr.trim() ? Number(hoursStr) : undefined;
    const reason = window.prompt("Ban reason:") ?? undefined;
    try {
      await banFn({ data: { user_id: userId, reason, duration_hours, scope: "all" } });
      toast.success("Posting ban applied");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function scanImg(ct: ContentType, id: string) {
    try {
      const r = await scanImgFn({ data: { content_type: ct, content_id: id } });
      toast.success(`Image scan: ${"worst" in r ? (r as { worst: number }).worst.toFixed(2) : "skipped"}`);
      qc.invalidateQueries({ queryKey: ["mod-engine-queue"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }
  async function scanTxt(ct: ContentType, id: string) {
    try {
      const r = await scanTextFn({ data: { content_type: ct, content_id: id } });
      toast.success(`Text scan: ${"worst" in r ? (r as { worst: number }).worst.toFixed(2) : "skipped"}`);
      qc.invalidateQueries({ queryKey: ["mod-engine-queue"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>Unified Queue</CardTitle>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1">
            {(["pending_review", "hidden", "removed", "all"] as const).map((s) => (
              <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>
                {s.replace("_", " ")}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {ALL_TYPES.map((t) => (
              <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>
                {t}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {q.isLoading && <Skeleton className="h-32 w-full" />}
        {(q.data ?? []).map((row) => {
          const prev = row.preview as Record<string, unknown> | null;
          const text = (prev?.text ?? prev?.body ?? "") as string;
          const media = ((prev?.media_urls ?? []) as unknown[]).filter((u): u is string => typeof u === "string");
          return (
            <div key={row.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <Badge variant="outline">{row.content_type}</Badge>
                    <Badge>{row.status}</Badge>
                    <Badge variant="secondary">{row.report_count} reports</Badge>
                    {row.reason && <span className="text-muted-foreground">· {row.reason}</span>}
                  </div>
                  {text && <p className="whitespace-pre-wrap text-sm">{text.slice(0, 400)}</p>}
                  {media.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {media.slice(0, 4).map((u) => (
                        <img key={u} src={u} alt="" className="h-20 w-20 rounded object-cover" loading="lazy" />
                      ))}
                    </div>
                  )}
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    id {String(row.content_id).slice(0, 8)} · owner {row.owner_id ? String(row.owner_id).slice(0, 8) : "?"}
                    {" · updated "}{new Date(row.updated_at as string).toLocaleString()}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => act(row.content_type as ContentType, row.content_id as string, "visible")}><Eye className="mr-1 h-3 w-3" />Restore</Button>
                  <Button size="sm" variant="outline" onClick={() => act(row.content_type as ContentType, row.content_id as string, "hidden")}><EyeOff className="mr-1 h-3 w-3" />Hide</Button>
                  <Button size="sm" variant="destructive" onClick={() => act(row.content_type as ContentType, row.content_id as string, "removed")}><Trash2 className="mr-1 h-3 w-3" />Remove</Button>
                  <Button size="sm" variant="outline" onClick={() => scanImg(row.content_type as ContentType, row.content_id as string)}><Sparkles className="mr-1 h-3 w-3" />AI Image</Button>
                  <Button size="sm" variant="outline" onClick={() => scanTxt(row.content_type as ContentType, row.content_id as string)}><FileText className="mr-1 h-3 w-3" />AI Text</Button>
                  {row.owner_id && <>
                    <Button size="sm" variant="outline" onClick={() => warn(row.owner_id as string)}><ShieldAlert className="mr-1 h-3 w-3" />Warn</Button>
                    <Button size="sm" variant="destructive" onClick={() => ban(row.owner_id as string)}>Ban</Button>
                  </>}
                </div>
              </div>
            </div>
          );
        })}
        {q.data?.length === 0 && <p className="text-sm text-muted-foreground">Nothing in this state.</p>}
      </CardContent>
    </Card>
  );
}

// ---------------- Bans ----------------
function BansTab() {
  const qc = useQueryClient();
  const fetchBans = useServerFn(listPostingBans);
  const restoreFn = useServerFn(restorePosting);
  const q = useQuery({ queryKey: ["mod-engine-bans"], queryFn: () => fetchBans({}) });

  return (
    <Card>
      <CardHeader><CardTitle>Posting Bans</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {q.isLoading && <Skeleton className="h-32 w-full" />}
        {(q.data ?? []).map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={b.active ? "destructive" : "outline"}>{b.active ? "Active" : "Ended"}</Badge>
                <Badge variant="secondary">{b.scope ?? "all"}</Badge>
                <span className="font-mono text-xs">{String(b.user_id).slice(0, 8)}</span>
                {b.expires_at && <span className="text-xs text-muted-foreground">until {new Date(b.expires_at).toLocaleString()}</span>}
                {!b.expires_at && b.active && <span className="text-xs text-destructive">permanent</span>}
              </div>
              {b.reason && <p className="mt-1 text-xs text-muted-foreground">{b.reason}</p>}
            </div>
            {b.active && (
              <Button size="sm" variant="outline" onClick={async () => {
                try { await restoreFn({ data: { user_id: b.user_id as string } }); toast.success("Restored"); qc.invalidateQueries({ queryKey: ["mod-engine-bans"] }); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}><RotateCcw className="mr-1 h-3 w-3" />Restore</Button>
            )}
          </div>
        ))}
        {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No bans.</p>}
      </CardContent>
    </Card>
  );
}

// ---------------- Logs ----------------
function LogsTab() {
  const [type, setType] = useState<TypeFilter>("all");
  const fetchLogs = useServerFn(listModerationLogs);
  const q = useQuery({
    queryKey: ["mod-engine-logs", type],
    queryFn: () => fetchLogs({ data: { limit: 200, content_type: type } }),
  });
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-2"><ScrollText className="h-4 w-4" />Moderation Logs</CardTitle>
        <div className="flex flex-wrap gap-1">
          {ALL_TYPES.map((t) => (
            <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>{t}</Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-xs font-mono">
        {q.isLoading && <Skeleton className="h-32 w-full" />}
        {(q.data ?? []).map((l) => (
          <div key={l.id} className="flex flex-wrap gap-2 border-b py-1">
            <span className="text-muted-foreground">{new Date(l.created_at as string).toLocaleString()}</span>
            {l.content_type && <Badge variant="outline">{l.content_type}</Badge>}
            <Badge>{l.action_taken}</Badge>
            {l.content_id && <span>c={String(l.content_id).slice(0, 12)}</span>}
            {l.target_user_id && <span>user={String(l.target_user_id).slice(0, 12)}</span>}
            {l.moderator_id && <span>mod={String(l.moderator_id).slice(0, 12)}</span>}
            {l.reason && <span className="text-muted-foreground">"{l.reason}"</span>}
          </div>
        ))}
        {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No logs yet.</p>}
      </CardContent>
    </Card>
  );
}

// ---------------- Settings ----------------
function SettingsTab() {
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getModerationSettings);
  const updateFn = useServerFn(updateFeedModerationSettings);
  const q = useQuery({ queryKey: ["mod-engine-settings"], queryFn: () => fetchSettings({}) });
  const s = q.data;
  const [form, setForm] = useState<Record<string, unknown>>({});

  if (q.isLoading || !s) return <Skeleton className="h-64 w-full" />;
  const cur = { ...s, ...form };

  const save = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateFn({ data: form as any });
      toast.success("Settings saved");
      setForm({});
      qc.invalidateQueries({ queryKey: ["mod-engine-settings"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Engine Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">These settings apply to every content type protected by the engine (Feed, Poetry, Memes, Images, Videos, Comments, Competition submissions).</p>
        <ToggleRow label="Enable Moderation Engine" description="Master switch." checked={!!cur.enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />
        <ToggleRow label="AI Image Moderation" description="Nudity, violence, gore, child safety, drugs, weapons." checked={!!cur.ai_image_moderation_enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, ai_image_moderation_enabled: v }))} />
        <ToggleRow label="AI Text Moderation" description="Hate speech, harassment, self-harm, unsafe text." checked={!!(cur as { ai_text_moderation_enabled?: boolean }).ai_text_moderation_enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, ai_text_moderation_enabled: v }))} />
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Auto-hide report threshold" value={cur.auto_hide_report_threshold as number} onChange={(v) => setForm((f) => ({ ...f, auto_hide_report_threshold: v }))} />
          <NumberField label="AI auto-hide score (0-1)" value={cur.auto_hide_ai_threshold as number} step={0.05} onChange={(v) => setForm((f) => ({ ...f, auto_hide_ai_threshold: v }))} />
          <NumberField label="Duplicate window (minutes)" value={cur.duplicate_window_minutes as number} onChange={(v) => setForm((f) => ({ ...f, duplicate_window_minutes: v }))} />
          <NumberField label="Max posts per hour" value={cur.max_posts_per_hour as number} onChange={(v) => setForm((f) => ({ ...f, max_posts_per_hour: v }))} />
          <NumberField label="Max comments per minute" value={cur.max_comments_per_minute as number} onChange={(v) => setForm((f) => ({ ...f, max_comments_per_minute: v }))} />
        </div>
        <div>
          <Label className="text-xs">AI moderation categories</Label>
          <div className="mt-1 flex flex-wrap gap-1">
            {(cur.ai_moderation_categories as string[]).map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={Object.keys(form).length === 0}>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="number" step={step} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="mt-1" />
    </div>
  );
}

function ToggleRow({ label, description, checked, onCheckedChange }: { label: string; description?: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <AdminToggle checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
