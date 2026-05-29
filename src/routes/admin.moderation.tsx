import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getModerationOverview, listReports, resolveReport,
  listBans, banUser, unbanUser,
  listMutes, muteUser, unmuteUser,
  listWordFilters, addWordFilter, toggleWordFilter, removeWordFilter,
  listUrlRules, addUrlRule, removeUrlRule,
  listModLogs,
} from "@/lib/moderation.functions";
import { Flag, ShieldOff, MicOff, Ban, Link as LinkIcon, ScrollText, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/moderation")({ component: ModerationPage });

function ModerationPage() {
  const fetchOverview = useServerFn(getModerationOverview);
  const overview = useQuery({ queryKey: ["mod", "overview"], queryFn: () => fetchOverview({}), refetchInterval: 30_000 });

  return (
    <div>
      <AdminPageHeader title="Moderation" description="Reports, bans, mutes, filters, and audit logs." />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Open reports" value={overview.data?.openReports} tone="warn" />
        <Stat label="Active bans" value={overview.data?.activeBans} />
        <Stat label="Active mutes" value={overview.data?.activeMutes} />
        <Stat label="Word filters" value={overview.data?.activeWordFilters} />
        <Stat label="URL rules" value={overview.data?.activeUrlRules} />
        <Stat label="Actions 24h" value={overview.data?.logs24h} />
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="mb-4 flex w-full flex-wrap">
          <TabsTrigger value="reports"><Flag className="mr-1.5 h-3.5 w-3.5" />Reports</TabsTrigger>
          <TabsTrigger value="bans"><Ban className="mr-1.5 h-3.5 w-3.5" />Bans</TabsTrigger>
          <TabsTrigger value="mutes"><MicOff className="mr-1.5 h-3.5 w-3.5" />Mutes</TabsTrigger>
          <TabsTrigger value="words"><ShieldOff className="mr-1.5 h-3.5 w-3.5" />Word filter</TabsTrigger>
          <TabsTrigger value="urls"><LinkIcon className="mr-1.5 h-3.5 w-3.5" />URL rules</TabsTrigger>
          <TabsTrigger value="logs"><ScrollText className="mr-1.5 h-3.5 w-3.5" />Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="bans"><BansTab /></TabsContent>
        <TabsContent value="mutes"><MutesTab /></TabsContent>
        <TabsContent value="words"><WordsTab /></TabsContent>
        <TabsContent value="urls"><UrlsTab /></TabsContent>
        <TabsContent value="logs"><LogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value?: number; tone?: "warn" }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular-nums">{value ?? 0}</div>
          {tone === "warn" && (value ?? 0) > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsTab() {
  const fetchAll = useServerFn(listReports);
  const resolve = useServerFn(resolveReport);
  const qc = useQueryClient();
  const [status, setStatus] = useState<"open" | "reviewing" | "resolved" | "dismissed" | "all">("open");
  const { data, isLoading } = useQuery({
    queryKey: ["mod", "reports", status],
    queryFn: () => fetchAll({ data: { status, limit: 50 } }),
    refetchInterval: 30_000,
  });

  async function act(id: string, next: "resolved" | "dismissed" | "reviewing") {
    try {
      await resolve({ data: { id, status: next } });
      toast.success(`Report ${next}`);
      qc.invalidateQueries({ queryKey: ["mod"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-base">Reports</CardTitle>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["open", "reviewing", "resolved", "dismissed", "all"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? <Skeleton className="h-32 w-full" /> :
          !data?.length ? <p className="text-sm text-muted-foreground">No reports.</p> :
          data.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{r.target_type}</Badge>
                  <Badge className="text-[10px]">{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm font-medium">{r.reason}</div>
                {r.details && <div className="line-clamp-2 text-xs text-muted-foreground">{r.details}</div>}
                <div className="font-mono text-[10px] text-muted-foreground">target: {r.target_id}</div>
              </div>
              {r.status === "open" || r.status === "reviewing" ? (
                <div className="flex gap-1.5">
                  {r.status === "open" && <Button size="sm" variant="outline" onClick={() => act(r.id, "reviewing")}>Review</Button>}
                  <Button size="sm" onClick={() => act(r.id, "resolved")}>Resolve</Button>
                  <Button size="sm" variant="ghost" onClick={() => act(r.id, "dismissed")}>Dismiss</Button>
                </div>
              ) : null}
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

function BansTab() {
  const fetchAll = useServerFn(listBans);
  const ban = useServerFn(banUser);
  const unban = useServerFn(unbanUser);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mod", "bans"], queryFn: () => fetchAll({}) });
  const [uid, setUid] = useState("");
  const [ip, setIp] = useState("");
  const [type, setType] = useState<"ban" | "temp_ban" | "shadow_ban" | "ip_ban">("ban");
  const [hours, setHours] = useState("");
  const [reason, setReason] = useState("");

  async function submit() {
    try {
      await ban({ data: {
        user_id: uid.trim() || undefined,
        ip_address: ip.trim() || undefined,
        ban_type: type,
        reason: reason || undefined,
        expires_in_hours: hours ? Number(hours) : undefined,
      }});
      setUid(""); setIp(""); setReason(""); setHours("");
      toast.success("Ban applied");
      qc.invalidateQueries({ queryKey: ["mod"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">New ban</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FieldRow label="User ID (UUID)"><Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="optional" /></FieldRow>
          <FieldRow label="IP address"><Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="optional, for ip_ban" /></FieldRow>
          <FieldRow label="Type">
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ban">Permanent</SelectItem>
                <SelectItem value="temp_ban">Temporary</SelectItem>
                <SelectItem value="shadow_ban">Shadow</SelectItem>
                <SelectItem value="ip_ban">IP</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Expires in (hours)"><Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="leave blank for permanent" /></FieldRow>
          <FieldRow label="Reason" className="sm:col-span-2"><Textarea value={reason} rows={2} onChange={(e) => setReason(e.target.value)} maxLength={300} /></FieldRow>
          <div className="sm:col-span-2 flex justify-end"><Button onClick={submit} size="sm"><Plus className="mr-1 h-4 w-4" />Apply ban</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Active bans</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <Skeleton className="h-24 w-full" /> :
            !data?.length ? <p className="text-sm text-muted-foreground">No bans.</p> :
            data.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2 text-sm">
                <Badge variant={b.active ? "default" : "outline"}>{b.ban_type}</Badge>
                {!b.active && <Badge variant="outline">inactive</Badge>}
                <span className="font-mono text-[11px] text-muted-foreground">{b.user_id ?? b.ip_address}</span>
                {b.reason && <span className="text-xs text-muted-foreground">· {b.reason}</span>}
                {b.expires_at && <span className="text-xs text-muted-foreground">· expires {new Date(b.expires_at).toLocaleString()}</span>}
                {b.active && <Button size="sm" variant="ghost" className="ml-auto" onClick={async () => { await unban({ data: { ban_id: b.id }}); qc.invalidateQueries({ queryKey: ["mod"] }); }}>Unban</Button>}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MutesTab() {
  const fetchAll = useServerFn(listMutes);
  const mute = useServerFn(muteUser);
  const unmute = useServerFn(unmuteUser);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mod", "mutes"], queryFn: () => fetchAll({}) });
  const [uid, setUid] = useState("");
  const [scope, setScope] = useState<"global" | "room">("global");
  const [channel, setChannel] = useState("");
  const [mins, setMins] = useState("");
  const [reason, setReason] = useState("");

  async function submit() {
    try {
      await mute({ data: {
        user_id: uid.trim(), scope,
        channel_id: scope === "room" ? channel : undefined,
        expires_in_minutes: mins ? Number(mins) : undefined,
        reason: reason || undefined,
      }});
      setUid(""); setChannel(""); setMins(""); setReason("");
      toast.success("Muted");
      qc.invalidateQueries({ queryKey: ["mod"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">New mute</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FieldRow label="User ID"><Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="UUID" /></FieldRow>
          <FieldRow label="Scope">
            <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="global">Global</SelectItem><SelectItem value="room">Room</SelectItem></SelectContent>
            </Select>
          </FieldRow>
          {scope === "room" && <FieldRow label="Channel ID"><Input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="e.g. lobby" /></FieldRow>}
          <FieldRow label="Expires in (minutes)"><Input type="number" value={mins} onChange={(e) => setMins(e.target.value)} placeholder="blank = indefinite" /></FieldRow>
          <FieldRow label="Reason" className="sm:col-span-2"><Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} /></FieldRow>
          <div className="sm:col-span-2 flex justify-end"><Button size="sm" onClick={submit}>Mute</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Active mutes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <Skeleton className="h-24 w-full" /> :
            !data?.length ? <p className="text-sm text-muted-foreground">No mutes.</p> :
            data.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2 text-sm">
                <Badge>{m.scope}{m.channel_id ? ` · ${m.channel_id}` : ""}</Badge>
                <span className="font-mono text-[11px] text-muted-foreground">{m.user_id}</span>
                {m.expires_at && <span className="text-xs text-muted-foreground">· expires {new Date(m.expires_at).toLocaleString()}</span>}
                {m.active && <Button size="sm" variant="ghost" className="ml-auto" onClick={async () => { await unmute({ data: { mute_id: m.id }}); qc.invalidateQueries({ queryKey: ["mod"] }); }}>Unmute</Button>}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function WordsTab() {
  const fetchAll = useServerFn(listWordFilters);
  const add = useServerFn(addWordFilter);
  const toggle = useServerFn(toggleWordFilter);
  const remove = useServerFn(removeWordFilter);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mod", "words"], queryFn: () => fetchAll({}) });
  const [pattern, setPattern] = useState("");
  const [mode, setMode] = useState<"word" | "substring" | "regex">("word");
  const [action, setAction] = useState<"delete" | "warn" | "mute" | "ban">("delete");

  async function submit() {
    if (!pattern.trim()) return;
    try {
      await add({ data: { pattern: pattern.trim(), match_mode: mode, action, severity: 1 } });
      setPattern("");
      toast.success("Filter added");
      qc.invalidateQueries({ queryKey: ["mod"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Add word filter</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <FieldRow label="Pattern" className="sm:col-span-2"><Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="badword" /></FieldRow>
          <FieldRow label="Match">
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="word">Whole word</SelectItem>
                <SelectItem value="substring">Substring</SelectItem>
                <SelectItem value="regex">Regex</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Action">
            <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">Auto-delete</SelectItem>
                <SelectItem value="warn">Warn user</SelectItem>
                <SelectItem value="mute">Auto-mute</SelectItem>
                <SelectItem value="ban">Auto-ban</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <div className="sm:col-span-4 flex justify-end"><Button size="sm" onClick={submit}>Add filter</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <Skeleton className="h-24 w-full" /> :
            !data?.length ? <p className="text-sm text-muted-foreground">No filters yet.</p> :
            data.map((w) => (
              <div key={w.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2 text-sm">
                <Badge variant="outline">{w.match_mode}</Badge>
                <Badge>{w.action}</Badge>
                <span className="font-mono text-xs">{w.pattern}</span>
                <div className="ml-auto flex items-center gap-2">
                  <Switch checked={w.active} onCheckedChange={async (v) => { await toggle({ data: { id: w.id, active: v }}); qc.invalidateQueries({ queryKey: ["mod"] }); }} />
                  <Button size="icon" variant="ghost" onClick={async () => { await remove({ data: { id: w.id }}); qc.invalidateQueries({ queryKey: ["mod"] }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function UrlsTab() {
  const fetchAll = useServerFn(listUrlRules);
  const add = useServerFn(addUrlRule);
  const remove = useServerFn(removeUrlRule);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mod", "urls"], queryFn: () => fetchAll({}) });
  const [domain, setDomain] = useState("");
  const [kind, setKind] = useState<"whitelist" | "block">("block");
  const [reason, setReason] = useState("");

  async function submit() {
    if (!domain.trim()) return;
    try {
      await add({ data: { domain: domain.trim(), kind, reason: reason || undefined } });
      setDomain(""); setReason("");
      toast.success("URL rule added");
      qc.invalidateQueries({ queryKey: ["mod"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Add URL rule</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <FieldRow label="Domain"><Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" /></FieldRow>
          <FieldRow label="Type">
            <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block (anti-spam/phishing)</SelectItem>
                <SelectItem value="whitelist">Whitelist (allow only)</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Reason"><Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} /></FieldRow>
          <div className="sm:col-span-3 flex justify-end"><Button size="sm" onClick={submit}>Add rule</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Rules</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <Skeleton className="h-24 w-full" /> :
            !data?.length ? <p className="text-sm text-muted-foreground">No rules.</p> :
            data.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2 text-sm">
                <Badge variant={u.kind === "block" ? "destructive" : "default"}>{u.kind}</Badge>
                <span className="font-mono text-xs">{u.domain}</span>
                {u.reason && <span className="text-xs text-muted-foreground">· {u.reason}</span>}
                <Button size="icon" variant="ghost" className="ml-auto" onClick={async () => { await remove({ data: { id: u.id }}); qc.invalidateQueries({ queryKey: ["mod"] }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LogsTab() {
  const fetchAll = useServerFn(listModLogs);
  const { data, isLoading } = useQuery({ queryKey: ["mod", "logs"], queryFn: () => fetchAll({ data: { limit: 100, offset: 0 }}), refetchInterval: 60_000 });
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Recent moderator actions</CardTitle></CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading ? <Skeleton className="h-32 w-full" /> :
          !data?.length ? <p className="text-sm text-muted-foreground">No actions yet.</p> :
          data.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2 text-xs">
              <Badge variant="outline" className="text-[10px]">{l.action}</Badge>
              <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
              {l.target_user_id && <span className="font-mono">user: {l.target_user_id.slice(0, 8)}…</span>}
              {l.target_id && <span className="font-mono">id: {String(l.target_id).slice(0, 12)}…</span>}
              <span className="ml-auto font-mono text-muted-foreground">by {l.actor_id.slice(0, 8)}…</span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

function FieldRow({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
