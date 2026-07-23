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
  getTrustSafetySettings, updateTrustSafetySettings,
  listWordFiltersExtended, upsertWordFilter, deleteWordFilter,
  listTrustViolations, type TrustSafetySettings,
} from "@/lib/trust-safety.functions";
import { Trash2, Save, Shield, Filter as FilterIcon, Gavel, ScrollText, Link2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/trust-safety")({
  component: TrustSafetyAdmin,
  head: () => ({ meta: [{ title: "Trust & Safety · Admin" }] }),
});

const WORD_ACTIONS = ["replace", "reject", "warn", "temp_mute", "permanent_mute", "shadow_mute", "add_violation_point"] as const;
const PENALTY_ACTIONS = ["warn", "temp_mute", "permanent_mute", "permanent_ban"] as const;

function TrustSafetyAdmin() {
  return (
    <div>
      <AdminPageHeader title="Trust & Safety" description="One reusable framework for account maturity, DM privacy, bad-word filtering, URL rules, and automatic penalties." />
      <Tabs defaultValue="unlocks" className="mt-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="unlocks"><Shield className="mr-1 h-3 w-3" />Feature Unlocks</TabsTrigger>
          <TabsTrigger value="words"><FilterIcon className="mr-1 h-3 w-3" />Bad Words</TabsTrigger>
          <TabsTrigger value="urls"><Link2 className="mr-1 h-3 w-3" />URL Rules</TabsTrigger>
          <TabsTrigger value="penalties"><Gavel className="mr-1 h-3 w-3" />Violation & Penalty Rules</TabsTrigger>
          <TabsTrigger value="logs"><ScrollText className="mr-1 h-3 w-3" />Violation Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="unlocks"><UnlocksTab /></TabsContent>
        <TabsContent value="words"><WordsTab /></TabsContent>
        <TabsContent value="urls"><UrlsTab /></TabsContent>
        <TabsContent value="penalties"><PenaltiesTab /></TabsContent>
        <TabsContent value="logs"><LogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function useSettings() {
  const fetchFn = useServerFn(getTrustSafetySettings);
  return useQuery({ queryKey: ["trust-safety-settings"], queryFn: () => fetchFn() });
}

// ---------------- Feature Unlocks + DM Privacy defaults ----------------
function UnlocksTab() {
  const qc = useQueryClient();
  const q = useSettings();
  const saveFn = useServerFn(updateTrustSafetySettings);
  const [form, setForm] = useState<Partial<TrustSafetySettings>>({});
  if (q.isLoading || !q.data) return <Skeleton className="h-64 w-full" />;
  const cur: TrustSafetySettings = { ...q.data, ...form };

  const save = async () => {
    try { await saveFn({ data: form as Record<string, unknown> }); toast.success("Saved"); setForm({}); qc.invalidateQueries({ queryKey: ["trust-safety-settings"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };
  const setUnlock = (k: string, v: number) => setForm((f) => ({ ...f, feature_unlocks: { ...(cur.feature_unlocks), [k]: v } }));

  return (
    <Card>
      <CardHeader><CardTitle>Account Maturity & Feature Unlocks</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow label="Trust & Safety enabled" checked={!!cur.enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs">Unlock mode</Label>
            <select value={cur.unlock_mode} onChange={(e) => setForm((f) => ({ ...f, unlock_mode: e.target.value as TrustSafetySettings["unlock_mode"] }))} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm">
              <option value="level">Minimum Level</option>
              <option value="age">Minimum Account Age (days)</option>
              <option value="verified">Verified only</option>
            </select>
          </div>
          <NumField label="Minimum Account Age (days)" value={cur.min_account_age_days} onChange={(v) => setForm((f) => ({ ...f, min_account_age_days: v }))} />
          <ToggleRow compact label="Require verified" checked={!!cur.require_verified} onCheckedChange={(v) => setForm((f) => ({ ...f, require_verified: v }))} />
        </div>
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <div className="text-sm font-semibold">Feature Unlock Levels</div>
          <p className="text-xs text-muted-foreground">Users below the required level fall back to defaults (DM open, no advanced controls).</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="DM Privacy Settings" value={cur.feature_unlocks?.dm_privacy ?? 5} onChange={(v) => setUnlock("dm_privacy", v)} />
            <NumField label="Custom Message Requests" value={cur.feature_unlocks?.message_requests ?? 10} onChange={(v) => setUnlock("message_requests", v)} />
            <NumField label="Advanced Safety Controls" value={cur.feature_unlocks?.advanced_safety ?? 15} onChange={(v) => setUnlock("advanced_safety", v)} />
          </div>
        </div>
        <div className="flex justify-end"><Button onClick={save} disabled={Object.keys(form).length === 0}><Save className="mr-1 h-4 w-4" />Save</Button></div>
      </CardContent>
    </Card>
  );
}

// ---------------- Bad Words + Categories + Actions ----------------
function WordsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWordFiltersExtended);
  const saveFn = useServerFn(upsertWordFilter);
  const delFn = useServerFn(deleteWordFilter);
  const q = useQuery({ queryKey: ["word-filters-ext"], queryFn: () => listFn() });
  const [draft, setDraft] = useState({ pattern: "", match_mode: "word" as "word"|"substring"|"regex", category: "abuse", actions: ["replace"] as string[], violation_points: 1 });

  const toggleAction = (a: string) => setDraft((d) => ({ ...d, actions: d.actions.includes(a) ? d.actions.filter((x) => x !== a) : [...d.actions, a] }));

  const add = async () => {
    if (!draft.pattern.trim()) return;
    try {
      await saveFn({ data: { ...draft, pattern: draft.pattern.trim() } });
      toast.success("Added");
      setDraft({ pattern: "", match_mode: "word", category: draft.category, actions: draft.actions, violation_points: draft.violation_points });
      qc.invalidateQueries({ queryKey: ["word-filters-ext"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this word rule?")) return;
    try { await delFn({ data: { id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["word-filters-ext"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const toggleActive = async (id: string, pattern: string, active: boolean, current: Record<string, unknown>) => {
    try {
      await saveFn({ data: {
        id, pattern,
        match_mode: (current.match_mode as "word"|"substring"|"regex") ?? "word",
        category: (current.category as string) ?? "general",
        actions: (current.actions as string[]) ?? ["replace"],
        violation_points: (current.violation_points as number) ?? 1,
        active,
      } });
      qc.invalidateQueries({ queryKey: ["word-filters-ext"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Bad Words</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">Applied to Feed Posts, Poetry, Comments, Captions, Competition submissions. Private DMs are excluded — only URL masking runs there.</p>

        <div className="rounded-lg border bg-card p-3 space-y-2">
          <div className="text-sm font-semibold">Add rule</div>
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label className="text-xs">Pattern</Label>
              <Input value={draft.pattern} onChange={(e) => setDraft((d) => ({ ...d, pattern: e.target.value }))} placeholder="badword" />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="abuse" />
            </div>
            <div>
              <Label className="text-xs">Match mode</Label>
              <select value={draft.match_mode} onChange={(e) => setDraft((d) => ({ ...d, match_mode: e.target.value as typeof draft.match_mode }))} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm">
                <option value="word">Whole word</option><option value="substring">Substring</option><option value="regex">Regex</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Violation points</Label>
              <Input type="number" min={0} max={100} value={draft.violation_points} onChange={(e) => setDraft((d) => ({ ...d, violation_points: Number(e.target.value) }))} />
            </div>
            <div className="sm:col-span-3">
              <Label className="text-xs">Actions (combine)</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {WORD_ACTIONS.map((a) => (
                  <Button key={a} type="button" size="sm" variant={draft.actions.includes(a) ? "default" : "outline"} onClick={() => toggleAction(a)}>{a}</Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={add}>Add rule</Button></div>
        </div>

        <div className="space-y-1">
          {q.isLoading && <Skeleton className="h-24 w-full" />}
          {(q.data ?? []).map((w) => (
            <div key={w.id as string} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 text-sm">
              <span className="font-mono text-xs">{String(w.pattern)}</span>
              <Badge variant="outline">{String(w.match_mode)}</Badge>
              <Badge variant="secondary">{String(w.category ?? "general")}</Badge>
              {((w.actions as string[]) ?? []).map((a) => <Badge key={a}>{a}</Badge>)}
              <span className="text-xs text-muted-foreground">+{String(w.violation_points ?? 1)} pts</span>
              <div className="ml-auto flex items-center gap-2">
                <AdminToggle checked={Boolean(w.active)} onCheckedChange={(v) => toggleActive(w.id as string, w.pattern as string, v, w as Record<string, unknown>)} />
                <Button size="sm" variant="destructive" onClick={() => remove(w.id as string)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
          {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No rules yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------- URL rules pointer ----------------
function UrlsTab() {
  const qc = useQueryClient();
  const q = useSettings();
  const saveFn = useServerFn(updateTrustSafetySettings);
  if (!q.data) return <Skeleton className="h-32 w-full" />;
  const cur = q.data;

  return (
    <Card>
      <CardHeader><CardTitle>URL Rules</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">The URL allow/block list is shared with existing Moderation. Manage it in the dedicated screen:</p>
        <Link to="/admin/moderation" className="inline-flex w-fit"><Button variant="outline"><Link2 className="mr-1 h-4 w-4" />Open Moderation → URL Rules</Button></Link>

        <div className="rounded-lg border bg-card p-3">
          <Label className="text-xs">Behaviour for blocked URLs in Public Content (Feed / Poetry / Comments / Competitions)</Label>
          <div className="mt-1 flex gap-2">
            {(["replace", "reject"] as const).map((v) => (
              <Button key={v} size="sm" variant={cur.public_url_action === v ? "default" : "outline"}
                onClick={async () => { await saveFn({ data: { public_url_action: v } }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["trust-safety-settings"] }); }}>
                {v === "replace" ? "Replace with ****" : "Reject submission"}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Blocked URLs inside private DMs are always <b>masked for the receiver only</b> — the sender's text is never modified.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------- Penalties ----------------
function PenaltiesTab() {
  const qc = useQueryClient();
  const q = useSettings();
  const saveFn = useServerFn(updateTrustSafetySettings);
  const [form, setForm] = useState<Partial<TrustSafetySettings>>({});
  if (!q.data) return <Skeleton className="h-64 w-full" />;
  const cur = { ...q.data, ...form };

  const updateThreshold = (i: number, patch: Partial<TrustSafetySettings["penalty_thresholds"][number]>) => {
    const next = [...cur.penalty_thresholds];
    next[i] = { ...next[i], ...patch };
    setForm((f) => ({ ...f, penalty_thresholds: next }));
  };
  const addThreshold = () => setForm((f) => ({ ...f, penalty_thresholds: [...cur.penalty_thresholds, { points: 0, action: "warn", duration_minutes: 0 }] }));
  const removeThreshold = (i: number) => setForm((f) => ({ ...f, penalty_thresholds: cur.penalty_thresholds.filter((_, x) => x !== i) }));
  const setVp = (k: string, v: number) => setForm((f) => ({ ...f, violation_points: { ...(cur.violation_points), [k]: v } }));

  const save = async () => {
    try { await saveFn({ data: form as Record<string, unknown> }); toast.success("Saved"); setForm({}); qc.invalidateQueries({ queryKey: ["trust-safety-settings"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Violation Point Values</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {Object.entries(cur.violation_points).map(([k, v]) => (
            <NumField key={k} label={k} value={v as number} onChange={(x) => setVp(k, x)} />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Automatic Penalties (highest matching threshold applies)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {cur.penalty_thresholds.map((t, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-4 rounded-lg border bg-card p-2">
              <NumField label="Points ≥" value={t.points} onChange={(v) => updateThreshold(i, { points: v })} />
              <div>
                <Label className="text-xs">Action</Label>
                <select value={t.action} onChange={(e) => updateThreshold(i, { action: e.target.value })} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm">
                  {PENALTY_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <NumField label="Duration (mins)" value={t.duration_minutes} onChange={(v) => updateThreshold(i, { duration_minutes: v })} />
              <div className="flex items-end"><Button variant="destructive" onClick={() => removeThreshold(i)}><Trash2 className="mr-1 h-3 w-3" />Remove</Button></div>
            </div>
          ))}
          <Button variant="outline" onClick={addThreshold}>+ Add threshold</Button>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={save} disabled={Object.keys(form).length === 0}><Save className="mr-1 h-4 w-4" />Save</Button></div>
    </div>
  );
}

// ---------------- Logs ----------------
function LogsTab() {
  const fetchFn = useServerFn(listTrustViolations);
  const q = useQuery({ queryKey: ["trust-violations"], queryFn: () => fetchFn({ data: { limit: 200 } }) });
  return (
    <Card>
      <CardHeader><CardTitle>Violation Logs</CardTitle></CardHeader>
      <CardContent className="space-y-1 text-xs font-mono">
        {q.isLoading && <Skeleton className="h-24 w-full" />}
        {(q.data ?? []).map((l) => (
          <div key={l.id as string} className="flex flex-wrap gap-2 border-b py-1">
            <span className="text-muted-foreground">{new Date(l.created_at as string).toLocaleString()}</span>
            <Badge variant="outline">{String(l.type)}</Badge>
            <Badge>+{String(l.points)} pts</Badge>
            <span>user={String(l.user_id).slice(0, 12)}</span>
            {l.ref_id && <span>ref={String(l.ref_type ?? "?")}:{String(l.ref_id).slice(0, 12)}</span>}
            {l.reason && <span className="text-muted-foreground">"{l.reason}"</span>}
          </div>
        ))}
        {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No violations recorded.</p>}
      </CardContent>
    </Card>
  );
}

// ---------------- Shared inputs ----------------
function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <div><Label className="text-xs">{label}</Label><Input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="mt-1" /></div>;
}
function ToggleRow({ label, description, checked, onCheckedChange, compact = false }: { label: string; description?: string; checked: boolean; onCheckedChange: (v: boolean) => void; compact?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border bg-card p-3 ${compact ? "" : ""}`}>
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <AdminToggle checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
