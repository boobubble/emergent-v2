import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import JSZip from "jszip";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Image as ImageIcon, Package, Upload, Download, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import {
  backupDatabase,
  backupMediaManifest,
  restoreBackupDryRun,
} from "@/lib/backup.functions";

export const Route = createFileRoute("/admin/backup")({ component: BackupPage });

type Job = "db" | "media" | "full" | "restore" | null;

function todayStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}_${p(d.getMonth() + 1)}_${p(d.getDate())}`;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function BackupPage() {
  const [busy, setBusy] = useState<Job>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const runDb = useServerFn(backupDatabase);
  const runMedia = useServerFn(backupMediaManifest);
  const runRestore = useServerFn(restoreBackupDryRun);

  async function buildZip(parts: { name: string; content: string }[], label: string) {
    const zip = new JSZip();
    const stamp = todayStamp();
    const meta = {
      kind: label,
      generated_at: new Date().toISOString(),
      app: "BooBubble",
      parts: parts.map((p) => p.name),
    };
    zip.file("manifest.json", JSON.stringify(meta, null, 2));
    parts.forEach((p) => zip.file(p.name, p.content));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const fname = `backup_${stamp}_${label}.zip`;
    download(blob, fname);
    setLastFile(fname);
  }

  async function onDatabase() {
    setBusy("db");
    try {
      const snap = await runDb({});
      await buildZip([{ name: "database.json", content: JSON.stringify(snap, null, 2) }], "database");
      toast.success("Database backup downloaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Database backup failed");
    } finally { setBusy(null); }
  }

  async function onMedia() {
    setBusy("media");
    try {
      const snap = await runMedia({});
      await buildZip([{ name: "media-manifest.json", content: JSON.stringify(snap, null, 2) }], "media");
      toast.success("Media manifest downloaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Media backup failed");
    } finally { setBusy(null); }
  }

  async function onFull() {
    setBusy("full");
    try {
      const [db, media] = await Promise.all([runDb({}), runMedia({})]);
      await buildZip([
        { name: "database.json", content: JSON.stringify(db, null, 2) },
        { name: "media-manifest.json", content: JSON.stringify(media, null, 2) },
      ], "full");
      toast.success("Full backup downloaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Full backup failed");
    } finally { setBusy(null); }
  }

  async function onRestoreFile(file: File) {
    setBusy("restore");
    try {
      const zip = await JSZip.loadAsync(file);
      const dbEntry = zip.file("database.json");
      if (!dbEntry) throw new Error("No database.json found in backup");
      const text = await dbEntry.async("text");
      const json = JSON.parse(text);
      const summary: Record<string, number> = {};
      for (const t of json.tables ?? []) summary[t.table] = t.rows?.length ?? 0;
      const res = await runRestore({ data: { summary } });
      const rows = res.tables.reduce((n, t) => n + t.rows, 0);
      toast.success(`Backup verified — ${rows} rows across ${res.tables.length} tables`);
    } catch (e: any) {
      toast.error(e?.message ?? "Restore failed");
    } finally { setBusy(null); }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="System Backup" description="Snapshot the database and media, or verify a backup archive. Super admin only." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Create backup</CardTitle>
          <CardDescription>
            Downloads as <span className="font-mono">backup_{todayStamp()}_*.zip</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button onClick={onDatabase} disabled={!!busy} className="justify-start">
            {busy === "db" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Backup Database
          </Button>
          <Button onClick={onMedia} disabled={!!busy} variant="outline" className="justify-start">
            {busy === "media" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            Backup Media
          </Button>
          <Button onClick={onFull} disabled={!!busy} variant="secondary" className="justify-start">
            {busy === "full" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Full Backup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" /> Restore backup</CardTitle>
          <CardDescription>Upload a previously downloaded backup ZIP. The contents are verified and a summary is shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInput}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onRestoreFile(f);
              e.target.value = "";
            }}
          />
          <Button onClick={() => fileInput.current?.click()} disabled={!!busy} variant="outline">
            {busy === "restore" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Restore Backup
          </Button>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-200">
            <ShieldAlert className="mr-1 inline h-3.5 w-3.5" />
            Cloud databases require a point-in-time restore for a true rollback. This tool verifies your archive and records the request for audit. Contact support to apply.
          </div>
          {lastFile && (
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Last download: <span className="font-mono">{lastFile}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
