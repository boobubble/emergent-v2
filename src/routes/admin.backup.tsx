import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import JSZip from "jszip";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Database, Image as ImageIcon, Package, Upload, Download, Loader2,
  ShieldAlert, CheckCircle2, Zap, FileJson, ExternalLink, BookOpen,
} from "lucide-react";

import {
  backupDatabase,
  backupMediaManifest,
  restoreBackupDryRun,
  downloadMediaFile,
  ensureStorageBucket,
  uploadMediaFile,
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

// ---- concurrency helper: run tasks with a small parallelism window ----
async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, idx: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  let done = 0;
  async function next() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
      done++;
      onProgress?.(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

function QuickBackupChecklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
      {items.map((it) => (
        <li key={it} className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {it}
        </li>
      ))}
    </ul>
  );
}

function BackupPage() {

  const [busy, setBusy] = useState<Job>(null);
  const [progress, setProgress] = useState<{ label: string; done: number; total: number } | null>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const runDb = useServerFn(backupDatabase);
  const runMedia = useServerFn(backupMediaManifest);
  const runRestore = useServerFn(restoreBackupDryRun);
  const runDownload = useServerFn(downloadMediaFile);
  const runEnsureBucket = useServerFn(ensureStorageBucket);
  const runUpload = useServerFn(uploadMediaFile);
  const [quickBusy, setQuickBusy] = useState(false);

  async function onQuickJson() {
    setQuickBusy(true);
    try {
      const snap = await runDb({});
      const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
      download(blob, `quick-backup_${todayStamp()}.json`);
      toast.success("JSON backup downloaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Quick backup failed");
    } finally {
      setQuickBusy(false);
    }
  }


  async function buildFullZip(
    parts: { name: string; content: string }[],
    label: string,
    mediaFiles?: { bucket: string; path: string; bytes: Uint8Array }[],
  ) {
    const zip = new JSZip();
    const stamp = todayStamp();
    const meta = {
      kind: label,
      generated_at: new Date().toISOString(),
      app: "BooBubble",
      parts: parts.map((p) => p.name),
      media_files: mediaFiles?.length ?? 0,
    };
    zip.file("manifest.json", JSON.stringify(meta, null, 2));
    parts.forEach((p) => zip.file(p.name, p.content));
    if (mediaFiles?.length) {
      const media = zip.folder("media")!;
      for (const f of mediaFiles) {
        media.file(`${f.bucket}/${f.path}`, f.bytes);
      }
    }
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const fname = `backup_${stamp}_${label}.zip`;
    download(blob, fname);
    setLastFile(fname);
  }

  async function fetchMediaFiles(manifest: any) {
    const flat: { bucket: string; path: string }[] = [];
    for (const b of manifest.buckets ?? []) {
      for (const f of b.files ?? []) flat.push({ bucket: b.name, path: f.path });
    }
    setProgress({ label: "Downloading media", done: 0, total: flat.length });
    const files = await runPool(flat, 4, async (item) => {
      const res = await runDownload({ data: item });
      const bin = atob(res.contentBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { bucket: item.bucket, path: item.path, bytes };
    }, (done, total) => setProgress({ label: "Downloading media", done, total }));
    setProgress(null);
    return files;
  }

  async function onDatabase() {
    setBusy("db");
    try {
      const snap = await runDb({});
      await buildFullZip([{ name: "database.json", content: JSON.stringify(snap, null, 2) }], "database");
      toast.success("Database backup downloaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Database backup failed");
    } finally { setBusy(null); setProgress(null); }
  }

  async function onMedia() {
    setBusy("media");
    try {
      const manifest = await runMedia({});
      const files = await fetchMediaFiles(manifest);
      await buildFullZip(
        [{ name: "media-manifest.json", content: JSON.stringify(manifest, null, 2) }],
        "media",
        files,
      );
      toast.success(`Media backup downloaded (${files.length} files)`);
    } catch (e: any) {
      toast.error(e?.message ?? "Media backup failed");
    } finally { setBusy(null); setProgress(null); }
  }

  async function onFull() {
    setBusy("full");
    try {
      const [db, manifest] = await Promise.all([runDb({}), runMedia({})]);
      const files = await fetchMediaFiles(manifest);
      await buildFullZip([
        { name: "database.json", content: JSON.stringify(db, null, 2) },
        { name: "media-manifest.json", content: JSON.stringify(manifest, null, 2) },
      ], "full", files);
      toast.success(`Full backup downloaded (${files.length} media files)`);
    } catch (e: any) {
      toast.error(e?.message ?? "Full backup failed");
    } finally { setBusy(null); setProgress(null); }
  }

  async function onRestoreFile(file: File) {
    setBusy("restore");
    try {
      const zip = await JSZip.loadAsync(file);

      // 1) Database dry-run verify (if present)
      let dbSummary = { tables: 0, rows: 0 };
      const dbEntry = zip.file("database.json");
      if (dbEntry) {
        const text = await dbEntry.async("text");
        const json = JSON.parse(text);
        const summary: Record<string, number> = {};
        for (const t of json.tables ?? []) summary[t.table] = t.rows?.length ?? 0;
        const res = await runRestore({ data: { summary } });
        dbSummary = {
          tables: res.tables.length,
          rows: res.tables.reduce((n, t) => n + t.rows, 0),
        };
      }

      // 2) Restore media files (portable across projects/domains)
      const manifestEntry = zip.file("media-manifest.json");
      let mediaRestored = 0;
      if (manifestEntry) {
        const manifest = JSON.parse(await manifestEntry.async("text"));
        const buckets: { name: string; public: boolean; files: any[] }[] = manifest.buckets ?? [];

        // Recreate buckets first
        setProgress({ label: "Recreating buckets", done: 0, total: buckets.length });
        for (let i = 0; i < buckets.length; i++) {
          const b = buckets[i];
          try {
            await runEnsureBucket({ data: { name: b.name, public: !!b.public } });
          } catch (e: any) {
            console.warn(`Bucket ${b.name} ensure failed:`, e?.message);
          }
          setProgress({ label: "Recreating buckets", done: i + 1, total: buckets.length });
        }

        // Collect all media files from zip (works whether manifest is present or not)
        const uploads: { bucket: string; path: string; mime?: string; bytes: Uint8Array }[] = [];
        const mediaFolder = zip.folder("media");
        if (mediaFolder) {
          const mimeMap = new Map<string, string>();
          for (const b of buckets) {
            for (const f of b.files ?? []) {
              mimeMap.set(`${b.name}/${f.path}`, f.mime || "application/octet-stream");
            }
          }
          const entries: JSZip.JSZipObject[] = [];
          mediaFolder.forEach((_relPath, entry) => {
            if (!entry.dir) entries.push(entry);
          });
          for (const entry of entries) {
            // entry.name is "media/<bucket>/<path>"
            const rel = entry.name.replace(/^media\//, "");
            const slash = rel.indexOf("/");
            if (slash < 0) continue;
            const bucket = rel.slice(0, slash);
            const path = rel.slice(slash + 1);
            const bytes = new Uint8Array(await entry.async("arraybuffer"));
            uploads.push({ bucket, path, mime: mimeMap.get(`${bucket}/${path}`), bytes });
          }
        }

        setProgress({ label: "Uploading media", done: 0, total: uploads.length });
        await runPool(uploads, 4, async (u) => {
          let bin = "";
          const chunk = 0x8000;
          for (let i = 0; i < u.bytes.length; i += chunk) {
            bin += String.fromCharCode(...u.bytes.subarray(i, i + chunk));
          }
          const contentBase64 = btoa(bin);
          try {
            await runUpload({
              data: { bucket: u.bucket, path: u.path, mime: u.mime, contentBase64 },
            });
            mediaRestored++;
          } catch (e: any) {
            console.warn(`Upload ${u.bucket}/${u.path} failed:`, e?.message);
          }
        }, (done, total) => setProgress({ label: "Uploading media", done, total }));
      }

      toast.success(
        `Restore complete — ${dbSummary.rows} rows in ${dbSummary.tables} tables verified, ${mediaRestored} media files uploaded`,
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Restore failed");
    } finally { setBusy(null); setProgress(null); }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="System Backup" description="Snapshot the database and media into a portable ZIP, or restore an archive on any Supabase project. Super admin only." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" /> Quick Backup
              <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600">Recommended</span>
            </CardTitle>
            <CardDescription>One-click JSON export of your core application data. Fast, portable, and safe to run any time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickBackupChecklist
              items={["App Data", "Settings", "Competitions", "Feed", "Profiles", "Themes & Roles"]}
            />
            <Button onClick={onQuickJson} disabled={quickBusy || !!busy} className="w-full sm:w-auto">
              {quickBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileJson className="mr-2 h-4 w-4" />}
              Download JSON Backup
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Saves as <span className="font-mono">quick-backup_{todayStamp()}.json</span>. Row limits per table apply — use Full Backup below for media and larger tables.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-4 w-4" /> Full Database Backup</CardTitle>
            <CardDescription>Recommended before major upgrades — includes schema, functions, triggers, RLS policies and every row.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickBackupChecklist
              items={["Schema", "Tables", "Functions", "Triggers", "RLS Policies", "Everything"]}
            />
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto"
            >
              <a
                href="https://supabase.com/docs/guides/platform/backups"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Open Supabase Export Guide
                <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
              </a>
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Full Postgres dumps run outside the app — the guide walks through Point-in-Time Recovery and downloadable database backups from your hosting provider.
            </p>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Create backup</CardTitle>
          <CardDescription>
            Downloads as <span className="font-mono">backup_{todayStamp()}_*.zip</span> — includes raw media file bytes under <span className="font-mono">/media/&lt;bucket&gt;/&lt;path&gt;</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button onClick={onDatabase} disabled={!!busy} className="justify-start">
            {busy === "db" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Backup Database
          </Button>
          <Button onClick={onMedia} disabled={!!busy} variant="outline" className="justify-start">
            {busy === "media" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            Backup Media (files)
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
          <CardDescription>Upload a backup ZIP — buckets are recreated and media files are uploaded to this project's storage. Works across projects, localhost, and new domains.</CardDescription>
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

          {progress && (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span>{progress.label}</span>
                <span className="font-mono">{progress.done} / {progress.total}</span>
              </div>
              <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} />
            </div>
          )}

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-200">
            <ShieldAlert className="mr-1 inline h-3.5 w-3.5" />
            Media files upload with <span className="font-mono">upsert=true</span>. Database rows are verified only — full row restore requires a point-in-time snapshot from the database provider.
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
