import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package, RefreshCw, Upload, Play, RotateCcw, CheckCircle2, XCircle,
  Loader2, Clock, ShieldAlert, FileJson, History, Sparkles, AlertTriangle,
  Download, Trash2, ChevronRight, Eye, GitCompare, Gauge, Skull,
} from "lucide-react";
import {
  getSystemVersion, listUpdates, uploadUpdatePackage, deleteUpdatePackage,
  preUpdateChecks, runUpdate, rollbackUpdate, listUpdateHistory,
  validatePackage, previewUpdate,
} from "@/lib/updates.functions";

export const Route = createFileRoute("/admin/updates")({ component: UpdatesPage });

type Sys = Awaited<ReturnType<typeof getSystemVersion>>;
type Pkg = any;
type Hist = any;

function fmtDate(v?: string | null) { return v ? new Date(v).toLocaleString() : "—"; }
function fmtDuration(ms?: number | null) {
  if (!ms && ms !== 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function UpdatesPage() {
  const _getSys = useServerFn(getSystemVersion);
  const _listUpdates = useServerFn(listUpdates);
  const _upload = useServerFn(uploadUpdatePackage);
  const _delete = useServerFn(deleteUpdatePackage);
  const _preCheck = useServerFn(preUpdateChecks);
  const _run = useServerFn(runUpdate);
  const _rollback = useServerFn(rollbackUpdate);
  const _history = useServerFn(listUpdateHistory);
  const _validate = useServerFn(validatePackage);
  const _preview = useServerFn(previewUpdate);

  const [sys, setSys] = useState<Sys | null>(null);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [history, setHistory] = useState<Hist[]>([]);
  const [selected, setSelected] = useState<Pkg | null>(null);
  const [checks, setChecks] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [progress, setProgress] = useState<{ stage: string; ok: boolean | null; ms?: number; detail?: string }[]>([]);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState<string | null>(null);
  const [ackDestructive, setAckDestructive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const [s, p, h] = await Promise.all([_getSys(), _listUpdates(), _history()]);
    setSys(s); setPkgs(p); setHistory(h);
    if (!selected && p.length) setSelected(p[0]);
  };

  useEffect(() => { refresh().catch((e) => toast.error(e.message)); }, []);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [running]);


  const targetPkg = useMemo(() => selected ?? pkgs[0] ?? null, [selected, pkgs]);
  const isUpdateAvailable = sys?.update_available;

  async function onUploadFile(f: File) {
    setBusy("upload");
    try {
      const text = await f.text();
      const json = JSON.parse(text);
      const v = await _validate({ data: { pkg: json } });
      if (!v.valid) {
        setValidation(v);
        toast.error("Package failed validation — see report below");
        return;
      }
      const res = await _upload({ data: json });
      toast.success(res.replaced ? "Package replaced" : "Package uploaded");
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Auto-preview + validate when a package is selected
  useEffect(() => {
    if (!targetPkg) { setPreview(null); setValidation(null); return; }
    (async () => {
      try {
        const [prv, val] = await Promise.all([
          _preview({ data: { version: targetPkg.version } }),
          _validate({ data: { pkg: {
            version: targetPkg.version,
            build_number: targetPkg.build_number,
            release_date: targetPkg.release_date,
            channel: targetPkg.channel,
            min_from_version: targetPkg.min_from_version ?? undefined,
            release_notes: targetPkg.release_notes ?? {},
            migrations: targetPkg.migrations ?? [],
            manifest: targetPkg.manifest ?? {},
            package_sha256: targetPkg.package_sha256 ?? undefined,
          } } }),
        ]);
        setPreview(prv); setValidation(val); setAckDestructive(false);
      } catch (e: any) { toast.error(e.message); }
    })();
  }, [targetPkg?.id]);

  async function onCheck() {
    if (!targetPkg) return;
    setBusy("check");
    try {
      const res = await _preCheck({ data: { version: targetPkg.version } });
      setChecks(res);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  }

  const checklist = useMemo(() => {
    const hasDestructive = (preview?.sql?.destructive?.length ?? 0) > 0;
    return [
      { key: "validated", label: "Package validated", ok: !!validation?.valid },
      { key: "compat", label: "Compatibility passed", ok: !!preview?.compatibility?.passed },
      { key: "checks", label: "Pre-update checks passed", ok: !!checks?.ready },
      { key: "db", label: "Database connected", ok: checks?.checks?.find((c: any) => c.name === "Database connection")?.ok ?? false },
      { key: "storage", label: "Storage healthy", ok: checks?.checks?.find((c: any) => c.name === "Storage service")?.ok ?? false },
      { key: "env", label: "Environment valid", ok: checks?.checks?.find((c: any) => c.name === "Environment variables")?.ok ?? false },
      { key: "destructive", label: hasDestructive ? "Destructive operations acknowledged" : "No destructive operations", ok: hasDestructive ? ackDestructive : true },
    ];
  }, [validation, preview, checks, ackDestructive]);

  const allChecklistOk = checklist.every((c) => c.ok);

  async function onRun() {
    if (!targetPkg) return;
    if (!allChecklistOk) { toast.error("Complete the pre-update checklist first"); return; }
    if (!confirm(`Update to v${targetPkg.version}? A backup will be created first.`)) return;

    setRunning(true); setStartedAt(Date.now());
    const initial = [
      "Preparing update", "Creating backup", "Checking compatibility",
      "Updating files", "Running database migrations", "Updating assets",
      "Verifying installation", "Clearing cache", "Finalizing",
    ].map((s) => ({ stage: s, ok: null as boolean | null }));
    setProgress(initial);

    try {
      const res: any = await _run({ data: { version: targetPkg.version, skipBackup: false } });
      const merged = initial.map((row) => {
        const done = res.stages?.find((s: any) => s.stage === row.stage);
        return done ? { ...row, ok: done.ok, ms: done.ms, detail: done.detail } : row;
      });
      setProgress(merged);
      if (res.ok) toast.success("Update completed"); else toast.error(`Update failed: ${res.error}`);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setRunning(false); }
  }


  async function onDelete(id: string) {
    if (!confirm("Delete this update package?")) return;
    await _delete({ data: { id } }); await refresh();
    toast.success("Package removed");
  }

  async function onRollback(historyId: string) {
    if (!confirm("Rollback to previous version? Settings will be restored from the backup snapshot.")) return;
    try {
      const r = await _rollback({ data: { historyId } });
      toast.success(`Rolled back to v${r.restoredTo}`); await refresh();
    } catch (e: any) { toast.error(e.message); }
  }

  function onDownloadReport(h: Hist) {
    const blob = new Blob([JSON.stringify(h, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `update-report-${h.to_version}-${h.id.slice(0, 8)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  const elapsed = startedAt ? now - startedAt : 0;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Update Center"
        description="Version management & one-click updates. Existing user data is never modified."
      />

      {/* Version summary */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Version</CardDescription>
            <CardTitle className="text-2xl">v{sys?.current_version ?? "…"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Build {sys?.current_build ?? "—"} · Installed {fmtDate(sys?.installed_at)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest Available</CardDescription>
            <CardTitle className="text-2xl">v{sys?.latest_version ?? "…"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Build {sys?.latest_build ?? "—"} · Released {fmtDate(sys?.latest_release_date)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {isUpdateAvailable ? (
                <><Sparkles className="h-5 w-5 text-primary" /> Update Available</>
              ) : (
                <><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Up to Date</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" onClick={() => refresh()}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Check for Updates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upload / Package list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Update Packages</CardTitle>
          <CardDescription>Upload a signed <code className="text-xs">.json</code> update manifest. Packages describe the target version, release notes, and database migrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef} type="file" accept=".json,application/json" hidden
              onChange={(e) => e.target.files?.[0] && onUploadFile(e.target.files[0])}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={busy === "upload"}>
              {busy === "upload" ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
              Upload Update Package
            </Button>
            <span className="text-xs text-muted-foreground">Only super admins can upload.</span>
          </div>

          {pkgs.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No update packages uploaded yet.
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {pkgs.map((p) => (
                <button
                  key={p.id} onClick={() => { setSelected(p); setChecks(null); setProgress([]); }}
                  className={`w-full text-left p-3 hover:bg-muted/40 transition ${targetPkg?.id === p.id ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ChevronRight className={`h-4 w-4 transition ${targetPkg?.id === p.id ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          v{p.version} <Badge variant="secondary" className="text-xs">build {p.build_number}</Badge>
                          <Badge variant="outline" className="text-xs">{p.channel}</Badge>
                          {p.is_current && <Badge className="text-xs">current</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Released {fmtDate(p.release_date)} · {(p.migrations?.length ?? 0)} migrations
                        </div>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected package details + run */}
      {targetPkg && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-4 w-4" /> Release Notes · v{targetPkg.version}
            </CardTitle>
            <CardDescription>Review changes before updating.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReleaseNotes notes={targetPkg.release_notes} />

            <Separator />

            {/* Advanced preview */}
            <UpdatePreviewPanel preview={preview} validation={validation} targetPkg={targetPkg} />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3 text-xs space-y-1">
                <div className="font-medium text-sm mb-1">Required Migrations</div>
                {(targetPkg.migrations ?? []).length === 0 ? (
                  <div className="text-muted-foreground">No database changes.</div>
                ) : (
                  <ul className="space-y-0.5">
                    {targetPkg.migrations.map((m: any) => (
                      <li key={m.id}>
                        <code className="text-xs">{m.id}</code>
                        {m.description && <span className="text-muted-foreground"> · {m.description}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border p-3 text-xs space-y-1">
                <div className="font-medium text-sm mb-1">Compatibility</div>
                <div>Min. required version: <code>v{targetPkg.min_from_version ?? "any"}</code></div>
                <div>Channel: {targetPkg.channel}</div>
                <div>Est. update time: {preview?.estimates_ms ? fmtDuration(preview.estimates_ms.total) : `~${Math.max(1, (targetPkg.migrations?.length ?? 0) + 1)} min`}</div>
              </div>
            </div>

            {/* Pre-update checks */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Pre-Update Checks</div>
                <Button size="sm" variant="outline" onClick={onCheck} disabled={busy === "check"}>
                  {busy === "check" ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
                  Run Checks
                </Button>
              </div>
              {!checks ? (
                <div className="text-xs text-muted-foreground">Run checks to verify readiness.</div>
              ) : (
                <div className="space-y-1.5">
                  {checks.checks.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {c.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                        <span>{c.name}</span>
                      </div>
                      <span className="text-muted-foreground">{c.detail ?? ""}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-xs">
                    {checks.ready ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ready to Update · {checks.pendingMigrations} new migration(s)</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Problems Found — resolve above before updating</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live progress */}
            {progress.length > 0 && (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium flex items-center gap-2"><Play className="h-4 w-4" /> Update Progress</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {fmtDuration(elapsed)}
                  </div>
                </div>
                <div className="space-y-1">
                  {progress.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {s.ok === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        {s.ok === false && <XCircle className="h-3.5 w-3.5 text-destructive" />}
                        {s.ok === null && (running ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : <div className="h-3.5 w-3.5 rounded-full border" />)}
                        <span>{s.stage}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {s.ms != null && `${fmtDuration(s.ms)} `}{s.detail ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button onClick={onRun} disabled={running || !checks?.ready}>
                {running ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-2 h-3.5 w-3.5" />}
                Run Update
              </Button>
              <span className="text-xs text-muted-foreground">
                A backup snapshot is created automatically. No user data is deleted.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Update History</CardTitle>
          <CardDescription>Complete audit log of every update run.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground">No updates yet.</div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={h.status} />
                        <span className="font-medium">
                          {h.from_version ? `v${h.from_version} → ` : ""}v{h.to_version}
                        </span>
                        {h.build_number && <Badge variant="outline" className="text-xs">build {h.build_number}</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onDownloadReport(h)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        {h.rollback_available && h.status === "success" && (
                          <Button size="sm" variant="outline" onClick={() => onRollback(h.id)}>
                            <RotateCcw className="mr-2 h-3.5 w-3.5" /> Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {fmtDate(h.started_at)} · {fmtDuration(h.duration_ms)} · {h.backup_created ? "backup ✓" : "no backup"}
                      {h.error && <div className="text-destructive mt-1">⚠ {h.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    success: { label: "Success", cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
    failed: { label: "Failed", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    running: { label: "Running", cls: "bg-primary/15 text-primary border-primary/30" },
    rolled_back: { label: "Rolled Back", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  };
  const s = map[status] ?? { label: status, cls: "" };
  return <Badge variant="outline" className={`text-xs ${s.cls}`}>{s.label}</Badge>;
}

function ReleaseNotes({ notes }: { notes: any }) {
  if (!notes || typeof notes !== "object") return <div className="text-sm text-muted-foreground">No release notes.</div>;
  const sections: [string, string[] | undefined][] = [
    ["✨ New Features", notes.features],
    ["🚀 Improvements", notes.improvements],
    ["🐛 Bug Fixes", notes.fixes],
    ["⚡ Performance", notes.performance],
    ["🔒 Security", notes.security],
    ["🗄 Database Changes", notes.database],
    ["⚠️ Breaking Changes", notes.breaking],
  ];
  const nonEmpty = sections.filter(([, v]) => Array.isArray(v) && v.length > 0);
  if (nonEmpty.length === 0) return <div className="text-sm text-muted-foreground">No release notes.</div>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {nonEmpty.map(([title, items]) => (
        <div key={title} className="rounded-lg border p-3">
          <div className="text-sm font-medium mb-1">{title}</div>
          <ul className="text-xs space-y-0.5 text-muted-foreground list-disc list-inside">
            {items!.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
