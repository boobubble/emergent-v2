import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ban, Download, KeyRound, Loader2, Plus, RefreshCw, RotateCcw, Search, Server, ShieldCheck, ShieldX, Trash2, Zap } from "lucide-react";
import {
  adminListLicenses,
  adminGetLicense,
  adminLicenseStats,
  adminGenerateSelfLicense,
  adminImportLicense,
  adminSuspendLicense,
  adminRevokeLicense,
  adminActivateLicense,
  adminResetActivation,
  adminExtendExpiry,
  adminChangeDomain,
  adminDeleteLicense,
  adminExportLicensesCsv,
} from "@/lib/licensing/manager.functions";

export const Route = createFileRoute("/admin/licenses")({ component: LicensesPage });

const SOURCES = [
  { id: "self", label: "Direct" },
  { id: "envato", label: "CodeCanyon" },
  { id: "codester", label: "Codester" },
];

const STATUSES = ["active", "pending", "suspended", "revoked", "expired", "disabled", "development", "localhost", "unlimited"];

const PLANS = [
  { id: "trial", label: "Trial" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "lifetime", label: "Lifetime" },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

function planLabel(p?: string | null): string {
  if (!p) return "—";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function formatExpiryCell(row: any): string {
  if (row.license_plan === "lifetime") return "Lifetime";
  return row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : "—";
}

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "active" || s === "unlimited" || s === "development" || s === "localhost") return "default";
  if (s === "pending") return "secondary";
  if (s === "revoked" || s === "expired" || s === "disabled") return "destructive";
  return "outline";
}

function LicensesPage() {
  const qc = useQueryClient();
  const list = useServerFn(adminListLicenses);
  const stats = useServerFn(adminLicenseStats);
  const exportCsv = useServerFn(adminExportLicensesCsv);

  const [search, setSearch] = useState("");
  const [sourceId, setSourceId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [plan, setPlan] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const statsQ = useQuery({ queryKey: ["licenses:stats"], queryFn: () => stats() });
  const listQ = useQuery({
    queryKey: ["licenses:list", search, sourceId, status, plan],
    queryFn: () =>
      list({
        data: {
          search: search || undefined,
          sourceId: sourceId || undefined,
          status: status || undefined,
          plan: (plan || undefined) as PlanId | undefined,
          limit: 100,
          offset: 0,
        },
      }),
  });

  const rows = listQ.data?.rows ?? [];
  const count = listQ.data?.count ?? 0;

  async function handleExport() {
    try {
      const { csv, filename } = await exportCsv();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch (e: any) { toast.error(e?.message ?? "Export failed"); }
  }

  const s = (statsQ.data ?? {}) as any;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="License Management"
        description="Unified licensing across Direct, CodeCanyon and Codester sources."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<KeyRound className="h-4 w-4" />} label="Total" value={s.total_licenses ?? 0} />
        <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Active" value={s.active_licenses ?? 0} />
        <StatCard icon={<Ban className="h-4 w-4" />} label="Suspended / Revoked" value={(s.suspended_licenses ?? 0) + (s.revoked_licenses ?? 0)} />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Activations" value={s.total_activations ?? 0} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Licenses ({count})</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search key / domain / email" className="w-56 pl-7 text-xs" />
            </div>
            <Select value={sourceId || "__all"} onValueChange={(v) => setSourceId(v === "__all" ? "" : v)}>
              <SelectTrigger className="w-36 text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All sources</SelectItem>
                {SOURCES.map((src) => <SelectItem key={src.id} value={src.id}>{src.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status || "__all"} onValueChange={(v) => setStatus(v === "__all" ? "" : v)}>
              <SelectTrigger className="w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All statuses</SelectItem>
                {STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => listQ.refetch()}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh</Button>
            <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1.5 h-3.5 w-3.5" />Export CSV</Button>
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>Import</Button>
            <Button size="sm" onClick={() => setGenerateOpen(true)}><Plus className="mr-1.5 h-3.5 w-3.5" />Generate</Button>
          </div>
        </CardHeader>
        <CardContent>
          {listQ.isLoading ? (
            <div className="grid place-items-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="grid place-items-center py-10 text-sm text-muted-foreground">No licenses match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Key</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Activations</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r: any) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelectedId(r.id)}>
                      <TableCell className="font-mono text-xs">{r.license_key}</TableCell>
                      <TableCell><Badge variant="outline">{r.source_id}</Badge></TableCell>
                      <TableCell className="text-xs">{r.customer_email ?? "—"}</TableCell>
                      <TableCell className="text-xs">{r.current_domain ?? "—"}</TableCell>
                      <TableCell className="text-xs">{r.current_activations}/{r.max_activations}</TableCell>
                      <TableCell className="text-xs">{r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><Badge variant={statusVariant(r.status)}>{r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <GenerateDialog open={generateOpen} onOpenChange={setGenerateOpen} onDone={() => { qc.invalidateQueries({ queryKey: ["licenses:list"] }); qc.invalidateQueries({ queryKey: ["licenses:stats"] }); }} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} onDone={() => { qc.invalidateQueries({ queryKey: ["licenses:list"] }); qc.invalidateQueries({ queryKey: ["licenses:stats"] }); }} />
      <LicenseDrawer id={selectedId} onClose={() => setSelectedId(null)} onChanged={() => { qc.invalidateQueries({ queryKey: ["licenses:list"] }); qc.invalidateQueries({ queryKey: ["licenses:stats"] }); }} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- Drawer ------------------------------- */

function LicenseDrawer({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged: () => void }) {
  const get = useServerFn(adminGetLicense);
  const suspend = useServerFn(adminSuspendLicense);
  const revoke = useServerFn(adminRevokeLicense);
  const activate = useServerFn(adminActivateLicense);
  const reset = useServerFn(adminResetActivation);
  const extend = useServerFn(adminExtendExpiry);
  const chDomain = useServerFn(adminChangeDomain);
  const del = useServerFn(adminDeleteLicense);

  const q = useQuery({
    queryKey: ["license", id],
    queryFn: () => get({ data: { id: id! } }),
    enabled: !!id,
  });

  const [newDomain, setNewDomain] = useState("");
  const [newExpiry, setNewExpiry] = useState("");

  const invalidate = () => { q.refetch(); onChanged(); };
  const wrap = (label: string, fn: () => Promise<any>) => async () => {
    try { await fn(); toast.success(label); invalidate(); }
    catch (e: any) { toast.error(e?.message ?? `${label} failed`); }
  };

  const license = (q.data?.license ?? null) as any;
  const activations = (q.data?.activations ?? []) as any[];
  const logs = (q.data?.logs ?? []) as any[];

  return (
    <Sheet open={!!id} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader><SheetTitle>License details</SheetTitle></SheetHeader>
        {q.isLoading || !license ? (
          <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-lg border p-3">
              <div className="font-mono text-xs">{license.license_key}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Source: </span>{license.source_id}</div>
                <div><span className="text-muted-foreground">Status: </span><Badge variant={statusVariant(license.status)}>{license.status}</Badge></div>
                <div><span className="text-muted-foreground">Customer: </span>{license.customer_email ?? "—"}</div>
                <div><span className="text-muted-foreground">Domain: </span>{license.current_domain ?? "—"}</div>
                <div><span className="text-muted-foreground">Activations: </span>{license.current_activations}/{license.max_activations}</div>
                <div><span className="text-muted-foreground">Expires: </span>{license.expiry_date ? new Date(license.expiry_date).toLocaleDateString() : "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Last check: </span>{license.last_validation_at ? new Date(license.last_validation_at).toLocaleString() : "—"}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={wrap("Activated", () => activate({ data: { id: license.id } }))}><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Activate</Button>
              <Button size="sm" variant="outline" onClick={wrap("Suspended", () => suspend({ data: { id: license.id } }))}><Ban className="mr-1.5 h-3.5 w-3.5" />Suspend</Button>
              <Button size="sm" variant="destructive" onClick={wrap("Revoked", () => revoke({ data: { id: license.id } }))}><ShieldX className="mr-1.5 h-3.5 w-3.5" />Revoke</Button>
              <Button size="sm" variant="outline" onClick={wrap("Reset activations", () => reset({ data: { id: license.id } }))}><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Reset activations</Button>
              <Button size="sm" variant="ghost" onClick={wrap("Deleted", async () => { await del({ data: { id: license.id } }); onClose(); })}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete</Button>
            </div>

            <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Change domain</Label>
                <div className="mt-1 flex gap-2">
                  <Input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="example.com" className="text-xs" />
                  <Button size="sm" onClick={wrap("Domain updated", () => chDomain({ data: { id: license.id, domain: newDomain } }))} disabled={!newDomain}><Server className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Extend expiry</Label>
                <div className="mt-1 flex gap-2">
                  <Input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} className="text-xs" />
                  <Button
                    size="sm"
                    onClick={wrap("Expiry updated", () =>
                      extend({ data: { id: license.id, expiryDate: newExpiry ? new Date(newExpiry).toISOString() : null } }),
                    )}
                  >Save</Button>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activation history</div>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2 text-xs">
                {activations.length === 0 ? <div className="text-muted-foreground">None</div> : activations.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{a.domain}</span>
                    <span className="text-muted-foreground">{a.active ? "active" : "inactive"} · {new Date(a.activated_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Logs</div>
              <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border p-2 text-xs font-mono">
                {logs.length === 0 ? <div className="text-muted-foreground">No logs</div> : logs.map((l) => (
                  <div key={l.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                    <Badge variant={l.outcome === "ok" ? "default" : l.outcome === "warn" ? "secondary" : "destructive"} className="h-4 text-[10px]">{l.outcome}</Badge>
                    <span>{l.action}{l.message ? ` — ${l.message}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------- Generate dialog -------------------------- */

function GenerateDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: () => void }) {
  const gen = useServerFn(adminGenerateSelfLicense);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [maxActivations, setMaxActivations] = useState(1);
  const [expiry, setExpiry] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<any | null>(null);

  async function submit() {
    if (!email) { toast.error("Customer email required"); return; }
    setBusy(true);
    try {
      const res = await gen({
        data: {
          customerEmail: email,
          customerName: name || undefined,
          maxActivations,
          expiryDate: expiry ? new Date(expiry).toISOString() : null,
        },
      });
      setCreated(res.license);
      toast.success("License generated");
      onDone();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  function close() {
    onOpenChange(false);
    setEmail(""); setName(""); setMaxActivations(1); setExpiry(""); setCreated(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Generate direct license</DialogTitle></DialogHeader>
        {created ? (
          <div className="space-y-2">
            <div className="rounded-lg border bg-muted/50 p-3 font-mono text-sm">{created.license_key}</div>
            <p className="text-xs text-muted-foreground">Send this key to <strong>{created.customer_email}</strong>.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div><Label>Customer email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Customer name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Max activations</Label><Input type="number" min={1} value={maxActivations} onChange={(e) => setMaxActivations(Number(e.target.value) || 1)} /></div>
              <div><Label>Expires</Label><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={close}>Close</Button>
          {!created && <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Import dialog --------------------------- */

function ImportDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: () => void }) {
  const imp = useServerFn(adminImportLicense);
  const [sourceId, setSourceId] = useState("self");
  const [licenseKey, setLicenseKey] = useState("");
  const [purchaseCode, setPurchaseCode] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [maxActivations, setMaxActivations] = useState(1);
  const [expiry, setExpiry] = useState("");
  const [status, setStatus] = useState("active");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!licenseKey) { toast.error("License key required"); return; }
    setBusy(true);
    try {
      await imp({
        data: {
          sourceId,
          licenseKey,
          purchaseCode: purchaseCode || undefined,
          customerEmail: email || undefined,
          customerName: name || undefined,
          maxActivations,
          expiryDate: expiry ? new Date(expiry).toISOString() : null,
          status,
        },
      });
      toast.success("License imported");
      onDone();
      onOpenChange(false);
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Import existing license</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Source</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>License key</Label><Input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} className="font-mono" /></div>
          <div><Label>Purchase code (optional)</Label><Input value={purchaseCode} onChange={(e) => setPurchaseCode(e.target.value)} className="font-mono" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Customer email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Customer name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Max activations</Label><Input type="number" min={1} value={maxActivations} onChange={(e) => setMaxActivations(Number(e.target.value) || 1)} /></div>
            <div><Label>Expires</Label><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
