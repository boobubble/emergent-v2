import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { getAllSettings, updateSetting } from "@/lib/admin.functions";
import { toast } from "sonner";
import {
  PhoneCall, Video, Users, Coins, Activity, Plug, Settings as SettingsIcon,
  Search, CheckCircle2, AlertTriangle, XCircle, Sparkles, RotateCcw, Save,
  ShieldCheck, Crown, BadgeCheck, Mic, MonitorPlay, CircleDot, Zap,
} from "lucide-react";

export const Route = createFileRoute("/admin/calls")({ component: CallsAdmin });

// ---------- Types & defaults ----------
type Role = "owner" | "admin" | "premium" | "verified" | "all";
type BillingMode = "free" | "per_minute" | "fixed";
type CallMode = "audio" | "video" | "both";
type ProviderId = "livekit" | "agora";

interface ProviderCfg {
  configured: boolean;
  // livekit
  url?: string; api_key?: string; secret?: string;
  // agora
  app_id?: string; certificate?: string;
}

interface CallSettings {
  enabled: boolean;
  mode: CallMode;
  default_max_duration_min: number;
  idle_timeout_sec: number;
  auto_disconnect_min: number;

  active_provider: ProviderId;
  smart_routing: boolean;
  providers: Record<ProviderId, ProviderCfg>;

  one_to_one: {
    audio: { who: Role; coin_cost: number; max_duration_min: number };
    video: { who: Role; coin_cost: number; max_duration_min: number };
  };
  group: {
    audio: { create: Role; join: Role; participant_limit: number; lifespan_min: number };
    video: { create: Role; join: Role; participant_limit: number; lifespan_min: number };
    allow_screen_share: boolean;
    allow_recording: boolean;
    auto_mute_new: boolean;
  };
  billing: {
    audio: { mode: BillingMode; cost: number };
    video: { mode: BillingMode; cost: number };
    group_create: { mode: BillingMode; cost: number };
    trio_room: { mode: BillingMode; cost: number };
  };
}

const DEFAULTS: CallSettings = {
  enabled: true,
  mode: "both",
  default_max_duration_min: 60,
  idle_timeout_sec: 45,
  auto_disconnect_min: 120,
  active_provider: "livekit",
  smart_routing: true,
  providers: {
    livekit: { configured: false, url: "", api_key: "", secret: "" },
    agora: { configured: false, app_id: "", certificate: "" },
  },
  one_to_one: {
    audio: { who: "all", coin_cost: 2, max_duration_min: 30 },
    video: { who: "verified", coin_cost: 5, max_duration_min: 30 },
  },
  group: {
    audio: { create: "premium", join: "all", participant_limit: 20, lifespan_min: 180 },
    video: { create: "premium", join: "verified", participant_limit: 10, lifespan_min: 120 },
    allow_screen_share: true,
    allow_recording: false,
    auto_mute_new: true,
  },
  billing: {
    audio: { mode: "per_minute", cost: 2 },
    video: { mode: "per_minute", cost: 5 },
    group_create: { mode: "fixed", cost: 25 },
    trio_room: { mode: "fixed", cost: 50 },
  },
};

const ROLE_OPTIONS: { id: Role; label: string; icon: any }[] = [
  { id: "owner", label: "Owner", icon: Crown },
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "premium", label: "Premium", icon: Sparkles },
  { id: "verified", label: "Verified", icon: BadgeCheck },
  { id: "all", label: "All users", icon: Users },
];

const PROVIDERS: { id: ProviderId; name: string; gradient: string; tagline: string; bestFor: string }[] = [
  { id: "livekit", name: "LiveKit", gradient: "from-cyan-500 to-blue-600", tagline: "Open-source · WebRTC SFU", bestFor: "DM & Trio rooms" },
  { id: "agora",   name: "Agora",   gradient: "from-fuchsia-500 to-orange-500", tagline: "Global RTC network", bestFor: "Large rooms / Stage" },
];

// ---------- Helpers ----------
function deepMerge<T>(base: T, patch: any): T {
  if (!patch || typeof patch !== "object") return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const k of Object.keys(patch)) {
    const bv = (base as any)?.[k];
    const pv = patch[k];
    out[k] = pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object"
      ? deepMerge(bv, pv) : pv;
  }
  return out;
}

// ---------- Main ----------
function CallsAdmin() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => fetchSettings({}) });

  const [values, setValues] = useState<CallSettings>(DEFAULTS);
  const [initial, setInitial] = useState<CallSettings>(DEFAULTS);
  const [tab, setTab] = useState("general");
  const [search, setSearch] = useState("");
  const [providerModal, setProviderModal] = useState<ProviderId | null>(null);

  useEffect(() => {
    if (!data) return;
    const remote = (data as any).calls as Partial<CallSettings> | undefined;
    const merged = deepMerge(DEFAULTS, remote ?? {});
    setValues(merged); setInitial(merged);
  }, [data]);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const mut = useMutation({
    mutationFn: () => saveSetting({ data: { key: "calls", value: values } }),
    onSuccess: () => {
      toast.success("Call settings saved");
      setInitial(values);
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const patch = (p: Partial<CallSettings> | ((s: CallSettings) => CallSettings)) =>
    setValues((s) => (typeof p === "function" ? p(s) : deepMerge(s, p)));

  // search filter helper
  const showTab = (keywords: string) =>
    !search || keywords.toLowerCase().includes(search.toLowerCase());

  return (
    <div className="pb-28">
      <AdminPageHeader
        title="Call Settings"
        description="Audio · Video · Group calls — provider, permissions, monetization & analytics."
        actions={
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search settings…"
              className="h-9 w-56 pl-8"
            />
          </div>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-border/60 bg-background/80 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
          <TabsList className="flex w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
            <TabTrigger value="general" icon={SettingsIcon} label="General" />
            <TabTrigger value="providers" icon={Plug} label="Providers" />
            <TabTrigger value="one2one" icon={PhoneCall} label="1-to-1" />
            <TabTrigger value="group" icon={Users} label="Group" />
            <TabTrigger value="billing" icon={Coins} label="Billing & Coins" />
            <TabTrigger value="analytics" icon={Activity} label="Analytics" />
          </TabsList>
        </div>

        {/* ============ GENERAL ============ */}
        <TabsContent value="general" className="space-y-4">
          {showTab("call system enable disable mode audio video duration timeout") && (
            <GlassCard
              title="Call System"
              icon={PhoneCall}
              right={<StatusPill ok={values.enabled} okText="Active" badText="Disabled" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <AdminToggle
                  label="Enable call system"
                  description="Master switch for all audio & video calls"
                  checked={values.enabled}
                  onCheckedChange={(v) => patch({ enabled: v })}
                />
                <Field label="Call mode">
                  <SegmentedControl
                    value={values.mode}
                    onChange={(v) => patch({ mode: v as CallMode })}
                    options={[
                      { value: "audio", label: "Audio", icon: Mic },
                      { value: "video", label: "Video", icon: Video },
                      { value: "both", label: "Both", icon: MonitorPlay },
                    ]}
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <NumberField label="Max duration (min)" value={values.default_max_duration_min} onChange={(n) => patch({ default_max_duration_min: n })} />
                <NumberField label="Idle timeout (sec)" value={values.idle_timeout_sec} onChange={(n) => patch({ idle_timeout_sec: n })} />
                <NumberField label="Auto disconnect (min)" value={values.auto_disconnect_min} onChange={(n) => patch({ auto_disconnect_min: n })} />
              </div>
            </GlassCard>
          )}

          {showTab("system status active provider health") && (
            <GlassCard title="System Status" icon={Activity}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Active provider" value={values.active_provider.toUpperCase()} tone="sky" icon={Plug} />
                <StatTile label="Active calls" value="—" tone="emerald" icon={CircleDot} />
                <StatTile label="Calls today" value="—" tone="violet" icon={PhoneCall} />
                <StatTile
                  label="Provider health"
                  value={values.providers[values.active_provider].configured ? "Healthy" : "Not configured"}
                  tone={values.providers[values.active_provider].configured ? "emerald" : "amber"}
                  icon={values.providers[values.active_provider].configured ? CheckCircle2 : AlertTriangle}
                />
              </div>
            </GlassCard>
          )}
        </TabsContent>

        {/* ============ PROVIDERS ============ */}
        <TabsContent value="providers" className="space-y-4">
          <GlassCard title="Smart Provider Routing" icon={Zap}>
            <AdminToggle
              label="Enable smart routing"
              description="Auto-select provider based on participant count. 1–3 → LiveKit, 4+ → Agora."
              checked={values.smart_routing}
              onCheckedChange={(v) => patch({ smart_routing: v })}
            />
          </GlassCard>

          <div className="grid gap-4 md:grid-cols-2">
            {PROVIDERS.map((p) => {
              const cfg = values.providers[p.id];
              const isActive = values.active_provider === p.id;
              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur transition hover:shadow-md"
                >
                  <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${p.gradient} opacity-20 blur-2xl`} />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${p.gradient} text-white shadow-lg`}>
                        <Plug className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold">{p.name}</h3>
                          {isActive && <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">Active</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.tagline}</p>
                      </div>
                    </div>
                    <StatusPill ok={cfg.configured} okText="Configured" badText="Setup needed" />
                  </div>

                  <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs">
                    <Stat mini label="Best for" value={p.bestFor} />
                    <Stat mini label="Connections" value="—" />
                  </div>

                  <div className="relative mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setProviderModal(p.id)}>
                      <SettingsIcon className="mr-1.5 h-3.5 w-3.5" />Configure
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      disabled={!cfg.configured}
                      onClick={() => toast.success(`${p.name} reachable`)}
                    >Test connection</Button>
                    <Button
                      size="sm"
                      disabled={isActive || !cfg.configured}
                      onClick={() => patch({ active_provider: p.id })}
                    >{isActive ? "In use" : "Activate"}</Button>
                  </div>
                </div>
              );
            })}
          </div>

          <ProviderConfigDialog
            providerId={providerModal}
            value={providerModal ? values.providers[providerModal] : null}
            onClose={() => setProviderModal(null)}
            onSave={(id, cfg) => {
              patch((s) => ({ ...s, providers: { ...s.providers, [id]: { ...cfg, configured: true } } }));
              setProviderModal(null);
              toast.success("Provider configuration updated");
            }}
          />
        </TabsContent>

        {/* ============ 1-TO-1 ============ */}
        <TabsContent value="one2one" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CallPermCard
              title="Audio Calls" icon={PhoneCall} tint="from-emerald-500 to-teal-500"
              who={values.one_to_one.audio.who} cost={values.one_to_one.audio.coin_cost} duration={values.one_to_one.audio.max_duration_min}
              onChange={(p) => patch({ one_to_one: { ...values.one_to_one, audio: { ...values.one_to_one.audio, ...p } } })}
            />
            <CallPermCard
              title="Video Calls" icon={Video} tint="from-violet-500 to-fuchsia-500"
              who={values.one_to_one.video.who} cost={values.one_to_one.video.coin_cost} duration={values.one_to_one.video.max_duration_min}
              onChange={(p) => patch({ one_to_one: { ...values.one_to_one, video: { ...values.one_to_one.video, ...p } } })}
            />
          </div>
        </TabsContent>

        {/* ============ GROUP ============ */}
        <TabsContent value="group" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <GroupCallCard
              title="Audio Group Calls" icon={Mic} tint="from-emerald-500 to-cyan-500"
              cfg={values.group.audio}
              onChange={(p) => patch({ group: { ...values.group, audio: { ...values.group.audio, ...p } } })}
            />
            <GroupCallCard
              title="Video Group Calls" icon={Video} tint="from-rose-500 to-fuchsia-500"
              cfg={values.group.video}
              onChange={(p) => patch({ group: { ...values.group, video: { ...values.group.video, ...p } } })}
            />
          </div>

          <GlassCard title="Moderator controls" icon={ShieldCheck}>
            <div className="grid gap-3 md:grid-cols-3">
              <AdminToggle label="Allow screen share" checked={values.group.allow_screen_share} onCheckedChange={(v) => patch({ group: { ...values.group, allow_screen_share: v } })} />
              <AdminToggle label="Allow recording" checked={values.group.allow_recording} onCheckedChange={(v) => patch({ group: { ...values.group, allow_recording: v } })} />
              <AdminToggle label="Auto-mute new users" checked={values.group.auto_mute_new} onCheckedChange={(v) => patch({ group: { ...values.group, auto_mute_new: v } })} />
            </div>
          </GlassCard>
        </TabsContent>

        {/* ============ BILLING ============ */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <BillingCard label="Audio call" icon={PhoneCall} tint="from-emerald-500 to-teal-500" cfg={values.billing.audio} onChange={(p) => patch({ billing: { ...values.billing, audio: { ...values.billing.audio, ...p } } })} />
            <BillingCard label="Video call" icon={Video} tint="from-violet-500 to-fuchsia-500" cfg={values.billing.video} onChange={(p) => patch({ billing: { ...values.billing, video: { ...values.billing.video, ...p } } })} />
            <BillingCard label="Group call creation" icon={Users} tint="from-amber-500 to-orange-500" cfg={values.billing.group_create} onChange={(p) => patch({ billing: { ...values.billing, group_create: { ...values.billing.group_create, ...p } } })} />
            <BillingCard label="Trio room call" icon={Sparkles} tint="from-pink-500 to-rose-500" cfg={values.billing.trio_room} onChange={(p) => patch({ billing: { ...values.billing, trio_room: { ...values.billing.trio_room, ...p } } })} />
          </div>

          <RevenueCalculator settings={values} />
        </TabsContent>

        {/* ============ ANALYTICS ============ */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Calls today" value="—" tone="sky" icon={PhoneCall} />
            <StatTile label="Avg duration" value="—" tone="violet" icon={Activity} />
            <StatTile label="Top provider" value={values.active_provider.toUpperCase()} tone="emerald" icon={Plug} />
            <StatTile label="Revenue (coins)" value="—" tone="amber" icon={Coins} />
          </div>
          <GlassCard title="Peak concurrent calls" icon={Activity}>
            <div className="grid h-32 place-items-center text-sm text-muted-foreground">
              Live analytics will appear here once calls start.
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Sticky action bar */}
      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur transition ${dirty ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> You have unsaved changes
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setValues(initial)}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Reset
            </Button>
            <Button size="sm" onClick={() => mut.mutate()} disabled={mut.isPending}>
              <Save className="mr-1.5 h-3.5 w-3.5" />{mut.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- UI primitives ----------
function TabTrigger({ value, icon: Icon, label }: { value: string; icon: any; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </TabsTrigger>
  );
}

function GlassCard({ title, icon: Icon, right, children }: { title: string; icon?: any; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          </div>
          {right}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Field label={label}>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </Field>
  );
}

function SegmentedControl<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: any }[] }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            type="button" key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {ROLE_OPTIONS.map((r) => {
        const active = r.id === value;
        const Icon = r.icon;
        return (
          <button
            key={r.id} type="button" onClick={() => onChange(r.id)}
            className={`group flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition ${
              active
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusPill({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
      ok ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
         : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
      {ok ? okText : badText}
    </span>
  );
}

function StatTile({ label, value, tone, icon: Icon }: { label: string; value: string | number; tone: "sky" | "emerald" | "violet" | "amber"; icon: any }) {
  const tones: Record<string, string> = {
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  };
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`}><Icon className="h-3.5 w-3.5" /></div>
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Stat({ label, value, mini }: { label: string; value: string; mini?: boolean }) {
  return (
    <div className={`rounded-lg border border-border/60 bg-muted/30 ${mini ? "px-2.5 py-1.5" : "p-3"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ---------- Provider config modal ----------
function ProviderConfigDialog({
  providerId, value, onClose, onSave,
}: { providerId: ProviderId | null; value: ProviderCfg | null; onClose: () => void; onSave: (id: ProviderId, cfg: ProviderCfg) => void }) {
  const [local, setLocal] = useState<ProviderCfg | null>(null);
  useEffect(() => { setLocal(value ? { ...value } : null); }, [value, providerId]);

  if (!providerId || !local) return null;
  const isLk = providerId === "livekit";

  return (
    <Dialog open={!!providerId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{providerId} configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {isLk ? (
            <>
              <Field label="Server URL"><Input value={local.url ?? ""} onChange={(e) => setLocal({ ...local, url: e.target.value })} placeholder="wss://example.livekit.cloud" /></Field>
              <Field label="API key"><Input value={local.api_key ?? ""} onChange={(e) => setLocal({ ...local, api_key: e.target.value })} /></Field>
              <Field label="API secret"><Input type="password" value={local.secret ?? ""} onChange={(e) => setLocal({ ...local, secret: e.target.value })} /></Field>
            </>
          ) : (
            <>
              <Field label="App ID"><Input value={local.app_id ?? ""} onChange={(e) => setLocal({ ...local, app_id: e.target.value })} /></Field>
              <Field label="Certificate"><Input type="password" value={local.certificate ?? ""} onChange={(e) => setLocal({ ...local, certificate: e.target.value })} /></Field>
            </>
          )}
          <Button
            variant="outline" size="sm" className="w-full"
            onClick={() => {
              const ok = isLk ? !!(local.url && local.api_key && local.secret) : !!(local.app_id && local.certificate);
              ok ? toast.success("Connection successful") : toast.error("Missing credentials");
            }}
          >Test connection</Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(providerId, local)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- 1-to-1 card ----------
function CallPermCard({
  title, icon: Icon, tint, who, cost, duration, onChange,
}: {
  title: string; icon: any; tint: string;
  who: Role; cost: number; duration: number;
  onChange: (p: { who?: Role; coin_cost?: number; max_duration_min?: number }) => void;
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className={`h-1.5 w-full bg-gradient-to-r ${tint}`} />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <div className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${tint} text-white`}><Icon className="h-4 w-4" /></div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <Field label="Who can initiate"><RolePicker value={who} onChange={(r) => onChange({ who: r })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Coin cost / min" value={cost} onChange={(n) => onChange({ coin_cost: n })} />
          <NumberField label="Max duration (min)" value={duration} onChange={(n) => onChange({ max_duration_min: n })} />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Group card ----------
function GroupCallCard({
  title, icon: Icon, tint, cfg, onChange,
}: {
  title: string; icon: any; tint: string;
  cfg: { create: Role; join: Role; participant_limit: number; lifespan_min: number };
  onChange: (p: Partial<typeof cfg>) => void;
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className={`h-1.5 w-full bg-gradient-to-r ${tint}`} />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <div className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${tint} text-white`}><Icon className="h-4 w-4" /></div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <Field label="Who can create"><RolePicker value={cfg.create} onChange={(r) => onChange({ create: r })} /></Field>
        <Field label="Who can join"><RolePicker value={cfg.join} onChange={(r) => onChange({ join: r })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Participant limit" value={cfg.participant_limit} onChange={(n) => onChange({ participant_limit: n })} />
          <NumberField label="Lifespan (min)" value={cfg.lifespan_min} onChange={(n) => onChange({ lifespan_min: n })} />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Billing card ----------
function BillingCard({
  label, icon: Icon, tint, cfg, onChange,
}: {
  label: string; icon: any; tint: string;
  cfg: { mode: BillingMode; cost: number };
  onChange: (p: Partial<{ mode: BillingMode; cost: number }>) => void;
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className={`h-1.5 w-full bg-gradient-to-r ${tint}`} />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <div className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${tint} text-white`}><Icon className="h-4 w-4" /></div>
          <h3 className="text-sm font-semibold">{label}</h3>
        </div>
        <Field label="Billing mode">
          <SegmentedControl
            value={cfg.mode}
            onChange={(m) => onChange({ mode: m as BillingMode })}
            options={[
              { value: "free", label: "Free" },
              { value: "per_minute", label: "Per minute" },
              { value: "fixed", label: "Fixed" },
            ]}
          />
        </Field>
        {cfg.mode !== "free" && (
          <NumberField
            label={cfg.mode === "per_minute" ? "Coins per minute" : "Fixed cost (coins)"}
            value={cfg.cost}
            onChange={(n) => onChange({ cost: n })}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Revenue calculator ----------
function RevenueCalculator({ settings }: { settings: CallSettings }) {
  const [calls, setCalls] = useState(100);
  const [avgMin, setAvgMin] = useState(5);
  const est = useMemo(() => {
    const audio = settings.billing.audio.mode === "per_minute" ? avgMin * settings.billing.audio.cost : settings.billing.audio.mode === "fixed" ? settings.billing.audio.cost : 0;
    const video = settings.billing.video.mode === "per_minute" ? avgMin * settings.billing.video.cost : settings.billing.video.mode === "fixed" ? settings.billing.video.cost : 0;
    return { audio: audio * calls, video: video * calls, total: (audio + video) * calls };
  }, [calls, avgMin, settings]);

  return (
    <GlassCard title="Revenue Preview" icon={Coins}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <NumberField label="Calls / day" value={calls} onChange={setCalls} />
          <NumberField label="Avg duration (min)" value={avgMin} onChange={setAvgMin} />
        </div>
        <div className="grid gap-2 rounded-xl border border-border/60 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Audio earnings</span><span className="font-semibold tabular-nums">{est.audio.toLocaleString()} 🪙</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Video earnings</span><span className="font-semibold tabular-nums">{est.video.toLocaleString()} 🪙</span></div>
          <div className="my-1 h-px bg-border" />
          <div className="flex justify-between text-base"><span className="font-semibold">Total / day</span><span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">{est.total.toLocaleString()} 🪙</span></div>
        </div>
      </div>
    </GlassCard>
  );
}
