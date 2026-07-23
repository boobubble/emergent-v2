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
  getFeedModerationSettings, updateFeedModerationSettings,
  listFeedModerationQueue, setFeedContentStatus,
  warnFeedUser, banFeedPosting, restoreFeedPosting,
  listFeedPostingBans, listFeedModLogs, scanPostImages,
} from "@/lib/feed-moderation.functions";
import { Eye, EyeOff, Trash2, RotateCcw, Sparkles, ShieldAlert, ScrollText } from "lucide-react";

export const Route = createFileRoute("/admin/feed-moderation")({
  component: FeedModerationPage,
  head: () => ({ meta: [{ title: "Feed Moderation · Admin" }] }),
});

function FeedModerationPage() {
  return (
    <div>
      <AdminPageHeader
        title="Feed Moderation"
        description="Queue, warnings, posting bans, spam controls, and AI image moderation — scoped to Feed content only."
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
  const fetchQueue = useServerFn(listFeedModerationQueue);
  const setStatusFn = useServerFn(setFeedContentStatus);
  const warnFn = useServerFn(warnFeedUser);
  const banFn = useServerFn(banFeedPosting);
  const scanFn = useServerFn(scanPostImages);

  const q = useQuery({
    queryKey: ["feed-mod-queue", status],
    queryFn: () => fetchQueue({ data: { status, kind: "all", limit: 100 } }),
    refetchInterval: 30_000,
  });

  async function act(target_type: "post" | "comment", id: string, newStatus: "visible" | "hidden" | "removed") {
    try {
      await setStatusFn({ data: { target_type, target_id: id, status: newStatus } });
      toast.success(`Marked ${newStatus}`);
      qc.invalidateQueries({ queryKey: ["feed-mod-queue"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function warn(userId: string) {
    const reason = window.prompt("Warning reason:");
    if (!reason) return;
    try {
      await warnFn({ data: { user_id: userId, reason, severity: "warning" } });
      toast.success("Warning sent");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function ban(userId: string) {
    const hoursStr = window.prompt("Ban duration in hours (leave empty for permanent):");
    if (hoursStr === null) return;
    const duration_hours = hoursStr.trim() ? Number(hoursStr) : undefined;
    const reason = window.prompt("Ban reason:") ?? undefined;
    try {
      await banFn({ data: { user_id: userId, reason, duration_hours } });
      toast.success("Posting ban applied");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function scan(id: string) {
    try {
      const r = await scanFn({ data: { post_id: id } });
      toast.success(`AI scan complete${"worst" in r ? `: worst=${(r as { worst: number }).worst.toFixed(2)}` : ""}`);
      qc.invalidateQueries({ queryKey: ["feed-mod-queue"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Queue</CardTitle>
        <div className="flex gap-1">
          {(["pending_review", "hidden", "removed", "all"] as const).map((s) => (
            <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {q.isLoading && <Skeleton className="h-32 w-full" />}

        <section>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Posts ({q.data?.posts.length ?? 0})</h3>
          <div className="space-y-2">
            {(q.data?.posts ?? []).map((p) => (
              <div key={p.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <Badge variant="outline">{p.moderation_status}</Badge>
                      <Badge variant="secondary">{p.report_count} reports</Badge>
                      {p.moderation_reason && <span className="text-muted-foreground">· {p.moderation_reason}</span>}
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{(p.text as string)?.slice(0, 400) || <em className="text-muted-foreground">no text</em>}</p>
                    {Array.isArray(p.media_urls) && (p.media_urls as string[]).length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto">
                        {(p.media_urls as string[]).slice(0, 4).map((u) => (
                          <img key={u} src={u} alt="" className="h-20 w-20 rounded object-cover" loading="lazy" />
                        ))}
                      </div>
                    )}
                    <div className="mt-1 text-[10px] text-muted-foreground">post {String(p.id).slice(0, 8)} · author {String(p.author_id).slice(0, 8)} · {new Date(p.created_at as string).toLocaleString()}</div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button size="sm" variant="outline" onClick={() => act("post", p.id as string, "visible")}><Eye className="mr-1 h-3 w-3" />Restore</Button>
                    <Button size="sm" variant="outline" onClick={() => act("post", p.id as string, "hidden")}><EyeOff className="mr-1 h-3 w-3" />Hide</Button>
                    <Button size="sm" variant="destructive" onClick={() => act("post", p.id as string, "removed")}><Trash2 className="mr-1 h-3 w-3" />Remove</Button>
                    <Button size="sm" variant="outline" onClick={() => scan(p.id as string)}><Sparkles className="mr-1 h-3 w-3" />AI Scan</Button>
                    <Button size="sm" variant="outline" onClick={() => warn(p.author_id as string)}><ShieldAlert className="mr-1 h-3 w-3" />Warn</Button>
                    <Button size="sm" variant="destructive" onClick={() => ban(p.author_id as string)}>Ban</Button>
                  </div>
                </div>
              </div>
            ))}
            {q.data?.posts.length === 0 && <p className="text-sm text-muted-foreground">No posts in this state.</p>}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Comments ({q.data?.comments.length ?? 0})</h3>
          <div className="space-y-2">
            {(q.data?.comments ?? []).map((c) => (
              <div key={c.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <Badge variant="outline">{c.moderation_status}</Badge>
                      <Badge variant="secondary">{c.report_count} reports</Badge>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{c.text as string}</p>
                    <div className="mt-1 text-[10px] text-muted-foreground">comment {String(c.id).slice(0, 8)} · author {String(c.author_id).slice(0, 8)}</div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button size="sm" variant="outline" onClick={() => act("comment", c.id as string, "visible")}>Restore</Button>
                    <Button size="sm" variant="outline" onClick={() => act("comment", c.id as string, "hidden")}>Hide</Button>
                    <Button size="sm" variant="destructive" onClick={() => act("comment", c.id as string, "removed")}>Remove</Button>
                    <Button size="sm" variant="outline" onClick={() => warn(c.author_id as string)}>Warn</Button>
                  </div>
                </div>
              </div>
            ))}
            {q.data?.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments in this state.</p>}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

// ---------------- Bans ----------------
function BansTab() {
  const qc = useQueryClient();
  const fetchBans = useServerFn(listFeedPostingBans);
  const restoreFn = useServerFn(restoreFeedPosting);
  const q = useQuery({ queryKey: ["feed-posting-bans"], queryFn: () => fetchBans({}) });

  return (
    <Card>
      <CardHeader><CardTitle>Feed Posting Bans</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {q.isLoading && <Skeleton className="h-32 w-full" />}
        {(q.data ?? []).map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={b.active ? "destructive" : "outline"}>{b.active ? "Active" : "Ended"}</Badge>
                <span className="font-mono text-xs">{String(b.user_id).slice(0, 8)}</span>
                {b.expires_at && <span className="text-xs text-muted-foreground">until {new Date(b.expires_at).toLocaleString()}</span>}
              </div>
              {b.reason && <p className="mt-1 text-xs text-muted-foreground">{b.reason}</p>}
            </div>
            {b.active && (
              <Button size="sm" variant="outline" onClick={async () => {
                try { await restoreFn({ data: { user_id: b.user_id as string } }); toast.success("Restored"); qc.invalidateQueries({ queryKey: ["feed-posting-bans"] }); }
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
  const fetchLogs = useServerFn(listFeedModLogs);
  const q = useQuery({ queryKey: ["feed-mod-logs"], queryFn: () => fetchLogs({ data: { limit: 100 } }) });
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-4 w-4" />Moderator Logs</CardTitle></CardHeader>
      <CardContent className="space-y-1 text-xs font-mono">
        {q.isLoading && <Skeleton className="h-32 w-full" />}
        {(q.data ?? []).map((l) => (
          <div key={l.id} className="flex flex-wrap gap-2 border-b py-1">
            <span className="text-muted-foreground">{new Date(l.created_at as string).toLocaleString()}</span>
            <Badge variant="outline">{l.action}</Badge>
            {l.target_id && <span>target={String(l.target_id).slice(0, 12)}</span>}
            {l.target_user_id && <span>user={String(l.target_user_id).slice(0, 12)}</span>}
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
  const fetchSettings = useServerFn(getFeedModerationSettings);
  const updateFn = useServerFn(updateFeedModerationSettings);
  const q = useQuery({ queryKey: ["feed-mod-settings"], queryFn: () => fetchSettings({}) });
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
      qc.invalidateQueries({ queryKey: ["feed-mod-settings"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Feed Moderation Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow
          label="Enable Feed Moderation"
          description="Master switch. When off, spam/duplicate checks and AI moderation are skipped."
          checked={!!cur.enabled}
          onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
        />
        <ToggleRow
          label="AI Image Moderation"
          description="Scan uploaded images for nudity, violence, gore, child safety, drugs, weapons."
          checked={!!cur.ai_image_moderation_enabled}
          onCheckedChange={(v) => setForm((f) => ({ ...f, ai_image_moderation_enabled: v }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Auto-hide report threshold" value={cur.auto_hide_report_threshold as number} onChange={(v) => setForm((f) => ({ ...f, auto_hide_report_threshold: v }))} />
          <NumberField label="AI auto-hide score threshold (0-1)" value={cur.auto_hide_ai_threshold as number} step={0.05} onChange={(v) => setForm((f) => ({ ...f, auto_hide_ai_threshold: v }))} />
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
