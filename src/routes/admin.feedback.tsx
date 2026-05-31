import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronUp, Pin, PinOff, Loader2, Trash2, Coins, Sparkles, Save, BarChart3, MessageCircle, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  listFeedback, adminUpdateFeedback, adminDeleteFeedback, getFeedbackStats,
} from "@/lib/feedback.functions";
import {
  FEEDBACK_DEFAULTS, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES,
  CATEGORY_META, STATUS_META,
  type FeedbackConfig, type FeedbackStatus, type FeedbackPriority,
} from "@/lib/feedback-config";
import { useAdminSetting } from "@/lib/use-admin-setting";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Admin" }] }),
  component: AdminFeedback,
});

function AdminFeedback() {
  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-bold">Feedback & Bug Reports</h1>
        <p className="text-sm text-muted-foreground">Manage submissions, statuses, rewards, and analytics.</p>
      </header>
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="queue"><QueueTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

type FeedbackRow = {
  id: string; title: string; description: string;
  category: string; status: string; priority: string;
  is_pinned: boolean; is_showcased?: boolean; upvote_count: number; comment_count: number;
  admin_note: string | null;
};

// ============== QUEUE ==============
function QueueTab() {
  const list = useServerFn(listFeedback);
  const [status, setStatus] = useState<"all" | FeedbackStatus>("all");
  const [category, setCategory] = useState<string>("all");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", status, category],
    queryFn: () => list({ data: { status, category, sort: "recent", limit: 200 } }),
  });
  const [editing, setEditing] = useState<FeedbackRow | null>(null);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {FEEDBACK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {FEEDBACK_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_META[c].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {(data ?? []).map((r) => {
            const Cat = CATEGORY_META[r.category as keyof typeof CATEGORY_META] ?? CATEGORY_META.other;
            const St  = STATUS_META[r.status as FeedbackStatus] ?? STATUS_META.open;
            return (
              <button
                key={r.id} onClick={() => setEditing(r)}
                className="flex w-full items-start gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-muted/40"
              >
                <div className="flex h-12 w-10 flex-col items-center justify-center rounded-lg border border-border bg-background">
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">{r.upvote_count}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {r.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                    {r.is_showcased && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    <h4 className="truncate text-sm font-medium">{r.title}</h4>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] ${Cat.tone}`}>
                      <Cat.icon className="h-3 w-3" /> {Cat.label}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${St.tone}`}>{St.label}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MessageCircle className="h-3 w-3" /> {r.comment_count}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {(data ?? []).length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No reports.</div>
          )}
        </div>
      )}
      {editing && <EditDialog row={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditDialog({ row, onClose }: { row: { id: string; title: string; status: string; priority: string; is_pinned: boolean; is_showcased?: boolean; admin_note: string | null }; onClose: () => void }) {
  const qc = useQueryClient();
  const update = useServerFn(adminUpdateFeedback);
  const remove = useServerFn(adminDeleteFeedback);

  const [status, setStatus] = useState<FeedbackStatus>(row.status as FeedbackStatus);
  const [priority, setPriority] = useState<FeedbackPriority>(row.priority as FeedbackPriority);
  const [pinned, setPinned] = useState(row.is_pinned);
  const [showcased, setShowcased] = useState(!!row.is_showcased);
  const [note, setNote] = useState(row.admin_note ?? "");
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);

  const save = useMutation({
    mutationFn: () => update({
      data: {
        id: row.id, status, priority, is_pinned: pinned, is_showcased: showcased, admin_note: note,
        reward: xp > 0 || coins > 0 ? { xp, coins } : undefined,
      },
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-feedback"] });
      qc.invalidateQueries({ queryKey: ["feedback"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: () => remove({ data: { id: row.id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-feedback"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-8">{row.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as FeedbackStatus)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FEEDBACK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as FeedbackPriority)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["low","normal","high","critical"] as FeedbackPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center justify-between rounded-md border border-border p-2">
            <span className="text-sm flex items-center gap-2">
              {pinned ? <Pin className="h-4 w-4 text-primary" /> : <PinOff className="h-4 w-4 text-muted-foreground" />}
              Pin to top
            </span>
            <Switch checked={pinned} onCheckedChange={setPinned} />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border p-2">
            <span className="text-sm flex items-center gap-2">
              <Star className={`h-4 w-4 ${showcased ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
              Showcase on home / signup
            </span>
            <Switch checked={showcased} onCheckedChange={setShowcased} />
          </label>
          <div className="space-y-1">
            <Label className="text-xs">Admin note (visible to user)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000} />
          </div>
          <div className="rounded-md border border-border p-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Reward author
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">XP</Label>
                <Input type="number" min={0} max={1000} value={xp} onChange={(e) => setXp(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Coins</Label>
                <Input type="number" min={0} max={1000} value={coins} onChange={(e) => setCoins(Number(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <Button
            variant="destructive" size="sm" onClick={() => del.mutate()} disabled={del.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============== ANALYTICS ==============
function AnalyticsTab() {
  const stats = useServerFn(getFeedbackStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-feedback-stats"], queryFn: () => stats({}) });

  if (isLoading || !data) {
    return <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total reports" value={data.total} />
        <StatCard label="Open" value={data.open} />
        <StatCard label="This week" value={data.thisWeek} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="By category">
          {data.byCategory.map((c) => (
            <Row key={c.category} label={CATEGORY_META[c.category as keyof typeof CATEGORY_META]?.label ?? c.category} value={c.count} />
          ))}
        </Panel>
        <Panel title="By status">
          {data.byStatus.map((s) => (
            <Row key={s.status} label={STATUS_META[s.status as FeedbackStatus]?.label ?? s.status} value={s.count} />
          ))}
        </Panel>
        <Panel title="Most requested features">
          {data.topFeatures.map((r) => (
            <Row key={r.id} label={r.title} value={r.upvote_count} />
          ))}
          {data.topFeatures.length === 0 && <Empty />}
        </Panel>
        <Panel title="Most reported bugs">
          {data.topBugs.map((r) => (
            <Row key={r.id} label={r.title} value={r.upvote_count} />
          ))}
          {data.topBugs.length === 0 && <Empty />}
        </Panel>
        <Panel title="Top contributors">
          {data.topContributors.map((c) => (
            <Row key={c.user_id} label={c.username ?? c.user_id.slice(0, 8)} value={c.count} />
          ))}
          {data.topContributors.length === 0 && <Empty />}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <BarChart3 className="h-4 w-4 text-primary" /> {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="truncate">{label}</span>
      <span className="font-semibold tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}
function Empty() { return <p className="text-xs text-muted-foreground">No data.</p>; }

// ============== SETTINGS ==============
function SettingsTab() {
  const { values, set, save, saving } = useAdminSetting<FeedbackConfig>("feedback", FEEDBACK_DEFAULTS);
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <Toggle label="Enable module" checked={values.enabled} onChange={(b) => set("enabled", b)} />
        <Toggle label="Allow comments" checked={values.allowComments} onChange={(b) => set("allowComments", b)} />
        <Toggle label="Allow upvotes" checked={values.allowUpvotes} onChange={(b) => set("allowUpvotes", b)} />
        <Toggle label="Allow screenshots" checked={values.allowScreenshots} onChange={(b) => set("allowScreenshots", b)} />
        <Toggle label="Allow anonymous submissions" checked={values.allowAnonymous} onChange={(b) => set("allowAnonymous", b)} />
        <Toggle label="Duplicate suggestion detection" checked={values.duplicateDetection} onChange={(b) => set("duplicateDetection", b)} />
        <Toggle label="Notify author on status change" checked={values.notifyOnStatusChange} onChange={(b) => set("notifyOnStatusChange", b)} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Coins className="h-4 w-4 text-primary" /> Rewards
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <RewardRow
            label="On submit"
            xp={values.rewardOnSubmit.xp} coins={values.rewardOnSubmit.coins}
            onChange={(xp, coins) => set("rewardOnSubmit", { xp, coins })}
          />
          <RewardRow
            label="When marked Fixed"
            xp={values.rewardOnFixed.xp} coins={values.rewardOnFixed.coins}
            onChange={(xp, coins) => set("rewardOnFixed", { xp, coins })}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save settings
        </Button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
function RewardRow({ label, xp, coins, onChange }: { label: string; xp: number; coins: number; onChange: (xp: number, coins: number) => void }) {
  return (
    <div className="rounded-md border border-border p-3">
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px]">XP</Label>
          <Input type="number" min={0} value={xp} onChange={(e) => onChange(Number(e.target.value) || 0, coins)} />
        </div>
        <div>
          <Label className="text-[10px]">Coins</Label>
          <Input type="number" min={0} value={coins} onChange={(e) => onChange(xp, Number(e.target.value) || 0)} />
        </div>
      </div>
    </div>
  );
}
