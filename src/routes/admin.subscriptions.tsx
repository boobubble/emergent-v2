import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Crown, Plus, Trash2, Edit3, Check, X, Loader2 } from "lucide-react";
import {
  listPlans, adminUpsertPlan, adminDeletePlan,
  adminListPayments, adminApprovePayment, adminRejectPayment,
  adminSetSubscriptionMode, adminSubscriptionStats, getSubscriptionMode,
} from "@/lib/subscription.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptions,
});

const DEFAULT_PERKS = {
  no_ads: false, premium_themes: false, premium_games: false,
  creator_tools: false, vip_badge: false, custom_username_effects: false,
  premium_radio_requests: false, premium_chatrooms: false,
  premium_feed_features: false, featured_room: false, dj_perks: false,
};

function AdminSubscriptions() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscriptions & Membership"
        description="Manage plans, approve manual payments, and configure subscription mode."
        icon={Crown}
      />
      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="plans"><PlansTab /></TabsContent>
        <TabsContent value="payments"><PaymentsTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Plans ----------

function PlansTab() {
  const fetchPlans = useServerFn(listPlans);
  const { data: plans, refetch } = useQuery({ queryKey: ["admin-plans"], queryFn: () => fetchPlans() });
  const [editing, setEditing] = useState<any>(null);
  const del = useServerFn(adminDeletePlan);
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ ...emptyPlan() })}><Plus className="mr-1 h-4 w-4" /> New plan</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(plans ?? []).map((p: any) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {p.name}
                    {p.badge && <span className="rounded bg-primary/15 px-1.5 text-[10px] text-primary">{p.badge}</span>}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{p.slug} · {p.tier}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Edit3 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${p.name}?`)) delMut.mutate(p.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{p.currency_symbol}{p.monthly_price}/mo · {p.currency_symbol}{p.yearly_price}/yr</p>
              <p className="text-xs text-muted-foreground">Max personal rooms: {p.max_personal_chatrooms} · {p.active ? "Active" : "Disabled"}</p>
              <ul className="ml-4 list-disc text-xs text-muted-foreground">
                {((p.features as string[]) ?? []).slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      {editing && <PlanEditor plan={editing} onClose={() => { setEditing(null); refetch(); }} />}
    </div>
  );
}

function emptyPlan() {
  return {
    id: undefined as string | undefined,
    slug: "", name: "", description: "", badge: "", tier: "vip",
    currency_code: "INR", currency_symbol: "₹",
    monthly_price: 99, yearly_price: 999, trial_days: 0,
    features: ["No ads", "VIP badge"],
    perks: { ...DEFAULT_PERKS, no_ads: true, vip_badge: true, premium_themes: true },
    max_personal_chatrooms: 1, sort_order: 10, active: true, is_default: false,
  };
}

function PlanEditor({ plan, onClose }: { plan: any; onClose: () => void }) {
  const [v, setV] = useState<any>({ ...plan, features: plan.features ?? [], perks: { ...DEFAULT_PERKS, ...(plan.perks ?? {}) } });
  const [featuresText, setFeaturesText] = useState<string>(((plan.features as string[]) ?? []).join("\n"));
  const upsert = useServerFn(adminUpsertPlan);
  const mut = useMutation({
    mutationFn: () => upsert({
      data: {
        id: v.id,
        slug: v.slug, name: v.name, description: v.description || null, badge: v.badge || null,
        tier: v.tier, currency_code: v.currency_code, currency_symbol: v.currency_symbol,
        monthly_price: Number(v.monthly_price), yearly_price: Number(v.yearly_price),
        trial_days: Number(v.trial_days), features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
        perks: v.perks, max_personal_chatrooms: Number(v.max_personal_chatrooms),
        sort_order: Number(v.sort_order), active: !!v.active, is_default: !!v.is_default,
      },
    }),
    onSuccess: () => { toast.success("Saved"); onClose(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{v.id ? "Edit plan" : "New plan"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Slug"><Input value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="vip" /></Field>
          <Field label="Name"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="Badge (optional)"><Input value={v.badge} onChange={(e) => setV({ ...v, badge: e.target.value })} /></Field>
          <Field label="Tier">
            <Select value={v.tier} onValueChange={(x) => setV({ ...v, tier: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Currency code (3 letters)"><Input value={v.currency_code} onChange={(e) => setV({ ...v, currency_code: e.target.value.toUpperCase() })} maxLength={3} /></Field>
          <Field label="Currency symbol"><Input value={v.currency_symbol} onChange={(e) => setV({ ...v, currency_symbol: e.target.value })} maxLength={4} /></Field>
          <Field label="Monthly price"><Input type="number" value={v.monthly_price} onChange={(e) => setV({ ...v, monthly_price: e.target.value })} /></Field>
          <Field label="Yearly price"><Input type="number" value={v.yearly_price} onChange={(e) => setV({ ...v, yearly_price: e.target.value })} /></Field>
          <Field label="Trial days"><Input type="number" value={v.trial_days} onChange={(e) => setV({ ...v, trial_days: e.target.value })} /></Field>
          <Field label="Max personal chatrooms"><Input type="number" value={v.max_personal_chatrooms} onChange={(e) => setV({ ...v, max_personal_chatrooms: e.target.value })} /></Field>
          <Field label="Sort order"><Input type="number" value={v.sort_order} onChange={(e) => setV({ ...v, sort_order: e.target.value })} /></Field>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Features (one per line)</Label>
            <Textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Perks (locked features unlocked by this plan)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border p-3">
              {Object.keys(DEFAULT_PERKS).map((k) => (
                <label key={k} className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-3 py-1.5 text-sm">
                  <span className="capitalize">{k.replaceAll("_", " ")}</span>
                  <Switch checked={!!v.perks[k]} onCheckedChange={(b) => setV({ ...v, perks: { ...v.perks, [k]: b } })} />
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2"><Switch checked={!!v.active} onCheckedChange={(b) => setV({ ...v, active: b })} /> Active</label>
          <label className="flex items-center gap-2"><Switch checked={!!v.is_default} onCheckedChange={(b) => setV({ ...v, is_default: b })} /> Default (free) plan</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ---------- Payments ----------

function PaymentsTab() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const fetchPayments = useServerFn(adminListPayments);
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["admin-sub-payments", status],
    queryFn: () => fetchPayments({ data: { status } }),
  });
  const approveFn = useServerFn(adminApprovePayment);
  const rejectFn = useServerFn(adminRejectPayment);
  const approve = useMutation({
    mutationFn: (id: string) => approveFn({ data: { paymentId: id } }),
    onSuccess: () => { toast.success("Approved"); refetch(); qc.invalidateQueries({ queryKey: ["my-subscription"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const reject = useMutation({
    mutationFn: (id: string) => rejectFn({ data: { paymentId: id } }),
    onSuccess: () => { toast.success("Rejected"); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        {(data ?? []).map((p: any) => (
          <Card key={p.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <div className="font-semibold">{p.user?.username ?? p.user_id.slice(0, 8)} → {p.plan?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.currency_code} {p.amount} · {p.billing_cycle} · {new Date(p.created_at).toLocaleString()}
                </div>
                {p.proof_reference && <div className="text-xs">Ref: <span className="font-mono">{p.proof_reference}</span></div>}
                {p.admin_note && <div className="text-xs italic text-muted-foreground">Note: {p.admin_note}</div>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${p.status === "approved" ? "bg-green-500/20 text-green-700" : p.status === "rejected" ? "bg-red-500/20 text-red-700" : "bg-amber-500/20 text-amber-700"}`}>{p.status}</span>
                {p.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => approve.mutate(p.id)}><Check className="mr-1 h-4 w-4" /> Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject.mutate(p.id)}><X className="mr-1 h-4 w-4" /> Reject</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {(data?.length ?? 0) === 0 && <p className="text-center text-sm text-muted-foreground">No payments to show.</p>}
      </div>
    </div>
  );
}

// ---------- Settings ----------

function SettingsTab() {
  const fetchCfg = useServerFn(getSubscriptionMode);
  const setMode = useServerFn(adminSetSubscriptionMode);
  const qc = useQueryClient();
  const { data: cfg } = useQuery({ queryKey: ["sub-cfg"], queryFn: () => fetchCfg() });
  const [mode, setModeState] = useState<"off" | "optional" | "required">("optional");
  const [instr, setInstr] = useState("");
  const [curr, setCurr] = useState("INR");
  const [sym, setSym] = useState("₹");

  // hydrate on first load
  if (cfg && mode === "optional" && !instr && cfg.mode) {
    setModeState(cfg.mode as any);
    setInstr(cfg.payment_instructions || "");
    setCurr(cfg.default_currency || "INR");
    setSym(cfg.default_currency_symbol || "₹");
  }

  const save = useMutation({
    mutationFn: () => setMode({ data: { mode, payment_instructions: instr, default_currency: curr, default_currency_symbol: sym } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["sub-cfg"] });
      qc.invalidateQueries({ queryKey: ["subscription-mode"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader><CardTitle>Subscription mode</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={mode} onValueChange={(v) => setModeState(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off — hide subscriptions everywhere</SelectItem>
              <SelectItem value="optional">Optional — users can upgrade</SelectItem>
              <SelectItem value="required">Required — must pick a plan after signup</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Default currency code"><Input maxLength={3} value={curr} onChange={(e) => setCurr(e.target.value.toUpperCase())} /></Field>
            <Field label="Default currency symbol"><Input maxLength={4} value={sym} onChange={(e) => setSym(e.target.value)} /></Field>
          </div>
          <div>
            <Label>Payment instructions (shown in checkout)</Label>
            <Textarea rows={4} value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="e.g. Send payment to UPI: yourname@upi" />
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Analytics ----------

function AnalyticsTab() {
  const fn = useServerFn(adminSubscriptionStats);
  const { data } = useQuery({ queryKey: ["sub-stats"], queryFn: () => fn() });
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <StatCard label="Total subscribers" value={data?.total ?? 0} />
      <StatCard label="Active" value={data?.active ?? 0} />
      <StatCard label="Expired" value={data?.expired ?? 0} />
      <StatCard label="Pending payments" value={data?.pendingPayments ?? 0} />
      <Card className="md:col-span-4">
        <CardHeader><CardTitle>Revenue (last 30 days)</CardTitle></CardHeader>
        <CardContent className="text-sm">
          {Object.entries(data?.revenue30d ?? {}).length === 0
            ? <p className="text-muted-foreground">No approved payments yet.</p>
            : <ul className="space-y-1">{Object.entries(data!.revenue30d).map(([c, v]) => <li key={c}><strong>{c}</strong>: {Number(v).toFixed(2)}</li>)}</ul>}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
