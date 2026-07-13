import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import JSZip from "jszip";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Database, Image as ImageIcon, Package, Upload, Download, Loader2,
  ShieldAlert, CheckCircle2, Zap, FileJson, ExternalLink, BookOpen,
  Lock, ShieldCheck, History as HistoryIcon,
} from "lucide-react";

import {
  backupDatabase,
  backupMediaManifest,
  restoreBackupDryRun,
  downloadMediaFile,
  ensureStorageBucket,
  uploadMediaFile,
  dumpDatabaseSql,
  exportBackupExtras,
  exportBackupMetadataV2,
} from "@/lib/backup.functions";
import {
  recordBackupHistory, listBackupHistory, deleteBackupHistory,
  markBackupVerified, markRestoreTested,
  getBackupRetention, setBackupRetention, getBackupHealth,
} from "@/lib/backup-history.functions";
import {
  restoreDatabaseSql, getStorageBucketNames,
} from "@/lib/backup-restore.functions";
import { APP_VERSION } from "@/lib/app-version";
import { sha256Hex, md5Hex } from "@/lib/hash";
import { encryptBlobAes256, isEncryptedBackup, decryptBackup } from "@/lib/backup-crypto";
import { verifyFullBackupZip, dryRunValidateZip, type VerifyReport } from "@/lib/backup-verify";
import { BackupHealthCard } from "@/components/admin/BackupHealthCard";
import { BackupHistoryTable } from "@/components/admin/BackupHistoryTable";
import { BackupVerificationPanel } from "@/components/admin/BackupVerificationPanel";
import { PreRestoreDialog, type PreRestoreInfo } from "@/components/admin/PreRestoreDialog";

export const Route = createFileRoute("/admin/backup")({ component: BackupPage });

type Job = "db" | "media" | "full" | "restore" | "validate" | null;


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
  const runDumpSql = useServerFn(dumpDatabaseSql);
  const runExtras = useServerFn(exportBackupExtras);
  const runMetaV2 = useServerFn(exportBackupMetadataV2);
  const runRecord = useServerFn(recordBackupHistory);
  const runList = useServerFn(listBackupHistory);
  const runDelete = useServerFn(deleteBackupHistory);
  const runMarkVerified = useServerFn(markBackupVerified);
  const runMarkRestored = useServerFn(markRestoreTested);
  const runGetRetention = useServerFn(getBackupRetention);
  const runSetRetention = useServerFn(setBackupRetention);
  const runGetHealth = useServerFn(getBackupHealth);
  const runRestoreSql = useServerFn(restoreDatabaseSql);
  const runGetBuckets = useServerFn(getStorageBucketNames);
  const [quickBusy, setQuickBusy] = useState(false);

  // Enterprise state
  const [encryptEnabled, setEncryptEnabled] = useState(false);
  const [encryptPassword, setEncryptPassword] = useState("");
  const [verifyReport, setVerifyReport] = useState<VerifyReport | null>(null);
  const [lastChecksum, setLastChecksum] = useState<{ sha256: string; md5: string; filename: string } | null>(null);
  const [validateReport, setValidateReport] = useState<VerifyReport | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [health, setHealth] = useState<any | null>(null);
  const [retention, setRetention] = useState<string>("30d");
  const [preRestore, setPreRestore] = useState<PreRestoreInfo | null>(null);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);

  const refreshHistoryAndHealth = useCallback(async () => {
    try {
      const [h, hl, r] = await Promise.all([
        runList({}), runGetHealth({}), runGetRetention({}),
      ]);
      setHistory(h as any[]);
      setHealth(hl);
      setRetention(r as string);
    } catch (e) {
      console.warn("refresh backup meta failed:", e);
    }
  }, [runList, runGetHealth, runGetRetention]);

  useEffect(() => { refreshHistoryAndHealth(); }, [refreshHistoryAndHealth]);


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
    databaseFiles?: { name: string; content: string }[],
    extraInfo?: Record<string, unknown>,
    opts?: {
      skipDownload?: boolean;
      restoreFiles?: { name: string; content: string }[];
      includeChecksums?: boolean;
    },
  ): Promise<{ blob: Blob; filename: string; meta: Record<string, unknown> }> {
    const zip = new JSZip();
    const stamp = todayStamp();
    const meta = {
      kind: label,
      generated_at: new Date().toISOString(),
      app: "platform",
      app_version: APP_VERSION,
      parts: parts.map((p) => p.name),
      media_files: mediaFiles?.length ?? 0,
      database_files: databaseFiles?.map((f) => f.name) ?? [],
      restore_scripts: opts?.restoreFiles?.map((f) => f.name) ?? [],
      ...extraInfo,
    };
    zip.file("manifest.json", JSON.stringify(meta, null, 2));
    zip.file("backup-info.json", JSON.stringify(meta, null, 2));
    parts.forEach((p) => zip.file(p.name, p.content));
    if (databaseFiles?.length) {
      const db = zip.folder("database")!;
      for (const f of databaseFiles) db.file(f.name, f.content);
    }
    if (opts?.restoreFiles?.length) {
      const r = zip.folder("restore")!;
      for (const f of opts.restoreFiles) r.file(f.name, f.content);
    }
    if (mediaFiles?.length) {
      const media = zip.folder("media")!;
      for (const f of mediaFiles) {
        media.file(`${f.bucket}/${f.path}`, f.bytes);
      }
    }

    // Per-file SHA-256 index (checksums.sha256) — computed BEFORE finalize
    if (opts?.includeChecksums) {
      const lines: string[] = [];
      const entries: { path: string; obj: JSZip.JSZipObject }[] = [];
      zip.forEach((relPath, obj) => {
        if (!obj.dir) entries.push({ path: relPath, obj });
      });
      entries.sort((a, b) => a.path.localeCompare(b.path));
      for (const e of entries) {
        const bytes = await e.obj.async("uint8array");
        const hex = await sha256Hex(bytes);
        lines.push(`${hex}  ${e.path}`);
      }
      zip.file("checksums.sha256", lines.join("\n") + "\n");
    }

    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const fname = `backup_${stamp}_${label}.zip`;
    if (!opts?.skipDownload) {
      download(blob, fname);
      setLastFile(fname);
    }
    return { blob, filename: fname, meta };
  }

  // Restore scripts (templates — user customizes DB URL / project ref).
  function restoreScripts(): { name: string; content: string }[] {
    const sh = `#!/usr/bin/env bash
# Backup restore (Linux/macOS)
# Usage: DATABASE_URL=postgres://... ./restore.sh
set -euo pipefail
: "\${DATABASE_URL:?Set DATABASE_URL to the target Postgres connection string}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
echo "==> Extensions";  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/extensions.sql" || true
echo "==> Schema";      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/schema.sql"
echo "==> Data";        psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/data.sql"
echo "==> Policies";    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/policies.sql" || true
echo "==> Storage cfg"; psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/storage.sql" || true
echo "==> Cron jobs";   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/cron.sql" || true
echo "Done. Media files under $HERE/media/ must be re-uploaded via the Backup Center Restore button or the Supabase Storage API."
`;
    const ps1 = `# Backup restore (Windows PowerShell)
# Usage: $env:DATABASE_URL="postgres://..."; .\\restore.ps1
$ErrorActionPreference = "Stop"
if (-not $env:DATABASE_URL) { throw "Set DATABASE_URL to the target Postgres connection string" }
$Here = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
foreach ($f in @("extensions.sql","schema.sql","data.sql","policies.sql","storage.sql","cron.sql")) {
  $p = Join-Path $Here "database\\$f"
  if (Test-Path $p) { Write-Host "==> $f"; psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f $p }
}
Write-Host "Done. Re-upload media/ via the Backup Center Restore button."
`;
    const verify = `#!/usr/bin/env bash
# Verify every file in the backup matches checksums.sha256
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"
if [ ! -f checksums.sha256 ]; then echo "checksums.sha256 missing"; exit 1; fi
sha256sum -c checksums.sha256
`;
    return [
      { name: "restore.sh",  content: sh },
      { name: "restore.ps1", content: ps1 },
      { name: "verify.sh",   content: verify },
    ];
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
    if (encryptEnabled && encryptPassword.length < 8) {
      toast.error("Encryption password must be at least 8 characters");
      return;
    }
    setBusy("full");
    setVerifyReport(null);
    setLastChecksum(null);
    const startedAtDate = new Date();
    const startedAt = startedAtDate.getTime();
    try {
      setProgress({ label: "Preparing backup (JSON + media manifest)", done: 0, total: 6 });
      const [db, manifest] = await Promise.all([runDb({}), runMedia({})]);
      setProgress({ label: "Exporting PostgreSQL database", done: 1, total: 6 });
      let sqlDump: Awaited<ReturnType<typeof runDumpSql>>;
      try {
        sqlDump = await runDumpSql({});
      } catch (e: any) {
        // Root-cause SQL export failure. Do NOT continue to validation or
        // report downstream "missing file" errors — surface the original
        // SQL error (object, type, file:line, dependency chain) verbatim.
        const raw = String(e?.message ?? e ?? "unknown SQL export error");
        console.error("SQL export failed — backup aborted.\nRoot cause:\n" + raw);
        toast.error(
          "SQL export failed — backup aborted.\nRoot cause: " + raw,
          { duration: 20000 },
        );
        setBusy(null);
        setProgress(null);
        return;
      }

      setProgress({ label: "Downloading media", done: 2, total: 6 });
      const files = await fetchMediaFiles(manifest);

      // Extras: storage config, RLS policies, extensions, realtime, cron, meta.
      // Best-effort — never blocks the backup if the RPC is unavailable.
      const extras = await runExtras({}).catch((e) => {
        console.warn("Extras export failed:", e?.message);
        toast.warning("Extras skipped: " + (e?.message ?? "error"));
        return null;
      });
      const metaV2 = await runMetaV2({}).catch((e) => {
        console.warn("Metadata v2 failed:", e?.message);
        return null as any;
      });

      const databaseFiles: { name: string; content: string }[] = [];
      // SQL sanity: a literal two-char `\n` (0x5C 0x6E) *outside* any string
      // literal is invalid SQL. Real newlines are fine, and `\n` inside
      // single-quoted strings or dollar-quoted blocks is a valid escape
      // (jsonb values commonly contain them). The old regex-only check
      // false-positived on those, so strip string literals first, then look
      // for `\n` in the remaining "code" region and report file+line+context.
      const stripSqlStrings = (sql: string): string => {
        let out = "";
        let i = 0;
        const n = sql.length;
        while (i < n) {
          const c = sql[i];
          // single-quoted string, incl. '' escape
          if (c === "'") {
            out += " ";
            i++;
            while (i < n) {
              if (sql[i] === "'" && sql[i + 1] === "'") { i += 2; continue; }
              if (sql[i] === "'") { i++; break; }
              // preserve real newlines so line numbers stay aligned
              out += sql[i] === "\n" ? "\n" : " ";
              i++;
            }
            continue;
          }
          // dollar-quoted string: $tag$ ... $tag$
          if (c === "$") {
            const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i));
            if (m) {
              const tag = m[0];
              out += " ".repeat(tag.length);
              i += tag.length;
              const end = sql.indexOf(tag, i);
              if (end === -1) { out += sql.slice(i).replace(/[^\n]/g, " "); i = n; break; }
              for (let k = i; k < end; k++) out += sql[k] === "\n" ? "\n" : " ";
              out += " ".repeat(tag.length);
              i = end + tag.length;
              continue;
            }
          }
          // line comment
          if (c === "-" && sql[i + 1] === "-") {
            while (i < n && sql[i] !== "\n") { out += " "; i++; }
            continue;
          }
          out += c;
          i++;
        }
        return out;
      };
      const sqlLooksBroken = (filename: string, sql: string): string | null => {
        if (!sql) return null;
        const stripped = stripSqlStrings(sql);
        const idx = stripped.indexOf("\\n");
        if (idx === -1) return null;
        // Compute line number + surrounding context from the ORIGINAL file
        // (stripped preserves newlines so offsets align).
        const before = sql.slice(0, idx);
        const line = before.split("\n").length;
        const lineStart = before.lastIndexOf("\n") + 1;
        const lineEnd = sql.indexOf("\n", idx);
        const snippet = sql.slice(lineStart, lineEnd === -1 ? sql.length : lineEnd);
        const col = idx - lineStart + 1;
        const caret = " ".repeat(Math.max(0, col - 1)) + "^^";
        // Log full detail to console — toast has a length limit.
        console.error(
          `SQL export invalid\n${filename}\nLine ${line}, column ${col}\n${snippet}\n${caret}`,
        );
        return `${filename}:${line}:${col} — literal \\n outside string literal\n> ${snippet.trim().slice(0, 160)}`;
      };
      if (sqlDump) {
        const bad =
          sqlLooksBroken("schema.sql", sqlDump.schema_sql) ||
          sqlLooksBroken("data.sql", sqlDump.data_sql) ||
          sqlLooksBroken("database.sql", sqlDump.full_sql);
        if (bad) {
          toast.error(`SQL export invalid — backup aborted:\n${bad}`, { duration: 15000 });
          setBusy(null);
          setProgress(null);
          return;
        }
        databaseFiles.push(
          { name: "database.sql", content: sqlDump.full_sql },
          { name: "schema.sql",   content: sqlDump.schema_sql },
          { name: "data.sql",     content: sqlDump.data_sql },
          { name: "stats.json",   content: JSON.stringify(sqlDump.stats, null, 2) },
        );
      }


      if (extras) {
        for (const [name, content] of Object.entries(extras.files)) {
          databaseFiles.push({ name, content: content as string });
        }
      }

      setProgress({ label: "Building ZIP", done: 3, total: 6 });
      const parts: { name: string; content: string }[] = [
        { name: "database.json", content: JSON.stringify(db, null, 2) },
        { name: "media-manifest.json", content: JSON.stringify(manifest, null, 2) },
      ];

      // Aggregate media bytes for size math + restore estimation
      const mediaBytesTotal = files.reduce((s, f) => s + f.bytes.byteLength, 0);
      const dbSizeBytes = metaV2?.database_size_bytes ?? null;
      const storageSizeBytes = metaV2?.storage_total_size_bytes ?? mediaBytesTotal;

      // Restore time estimation (rough, based on throughput heuristics)
      const rowsForEstimate = sqlDump?.stats.rows ?? metaV2?.total_rows_estimate ?? 0;
      const dbRestoreSec   = Math.max(2, Math.ceil(rowsForEstimate / 2000));
      const mediaRestoreSec = Math.max(1, Math.ceil(mediaBytesTotal / (2 * 1024 * 1024))); // ~2 MB/s upload
      const storageRestoreSec = Math.max(1, Math.ceil(files.length / 20));
      const totalRestoreSec = dbRestoreSec + mediaRestoreSec + storageRestoreSec;
      const fmtDur = (s: number) => s < 60 ? `${s} sec` : `${Math.floor(s/60)}m ${s%60}s`;
      const restoreEstimation = {
        database:  { seconds: dbRestoreSec,      pretty: fmtDur(dbRestoreSec) },
        media:     { seconds: mediaRestoreSec,   pretty: fmtDur(mediaRestoreSec) },
        storage:   { seconds: storageRestoreSec, pretty: fmtDur(storageRestoreSec) },
        total:     { seconds: totalRestoreSec,   pretty: fmtDur(totalRestoreSec) },
      };

      // Rich project-info.json — initial (sizes/timing patched later)
      const projectInfo = {
        generated_at: new Date().toISOString(),
        backup_version: 3,
        app: {
          name: "platform",
          version: APP_VERSION,
          environment: (import.meta as any).env?.MODE ?? "production",
          migration_count: (extras?.project_info?.migration_count ?? 0),
        },
        database: {
          pg_version: extras?.project_info?.pg_version ?? null,
          total_tables:       extras?.project_info?.total_tables ?? null,
          total_rows:         sqlDump?.stats.rows ?? metaV2?.total_rows_estimate ?? null,
          total_functions:    metaV2?.total_functions ?? null,
          total_rpcs:         metaV2?.total_functions ?? null,
          total_views:        metaV2?.total_views ?? null,
          total_materialized_views: metaV2?.total_materialized_views ?? null,
          total_triggers:     metaV2?.total_triggers ?? null,
          total_indexes:      metaV2?.total_indexes ?? null,
          total_foreign_keys: metaV2?.total_foreign_keys ?? null,
          total_sequences:    metaV2?.total_sequences ?? null,
          total_policies:     metaV2?.total_policies ?? (extras?.counts?.policies ?? null),
          database_size_bytes: dbSizeBytes,
        },
        storage: {
          total_buckets: extras?.project_info?.total_buckets ?? null,
          total_files:   extras?.project_info?.total_files   ?? files.length,
          total_size_bytes: storageSizeBytes,
          largest_bucket: metaV2?.largest_bucket ?? null,
        },
        extras_counts: extras?.counts ?? null,
        migrations: extras?.project_info?.migrations ?? [],
        restore_estimation: restoreEstimation,
        // Filled in second pass:
        sizes: null as null | Record<string, unknown>,
        timing: null as null | Record<string, unknown>,
      };
      parts.push({ name: "project-info.json", content: JSON.stringify(projectInfo, null, 2) });

      // validation.json — component-by-component export report
      const dbNames = new Set(databaseFiles.map((f) => f.name));
      const check = (present: boolean, reason?: string) => ({
        ok: present,
        ...(present ? {} : { reason: reason ?? "missing" }),
      });
      const validation = {
        generated_at: new Date().toISOString(),
        backup_version: 3,
        components: {
          "database/database.sql":   check(dbNames.has("database.sql"),   sqlDump ? undefined : "sql dump failed"),
          "database/schema.sql":     check(dbNames.has("schema.sql"),     sqlDump ? undefined : "sql dump failed"),
          "database/data.sql":       check(dbNames.has("data.sql"),       sqlDump ? undefined : "sql dump failed"),
          "database/stats.json":     check(dbNames.has("stats.json"),     sqlDump ? undefined : "sql dump failed"),
          "database/storage.sql":    check(dbNames.has("storage.sql"),    extras ? undefined : "extras export failed"),
          "database/policies.sql":   check(dbNames.has("policies.sql"),   extras ? undefined : "extras export failed"),
          "database/extensions.sql": check(dbNames.has("extensions.sql"), extras ? undefined : "extras export failed"),
          "database/cron.sql":       check(dbNames.has("cron.sql"),       extras ? undefined : "extras export failed"),
          "database/auth.json":      check(dbNames.has("auth.json"),      extras ? undefined : "extras export failed"),
          "database/realtime.json":  check(dbNames.has("realtime.json"),  extras ? undefined : "extras export failed"),
          "database.json":           check(true),
          "media-manifest.json":     check(true),
          "media":                   check(files.length > 0, files.length === 0 ? "no media files" : undefined),
          "project-info.json":       check(true),
          "backup-info.json":        check(true),
          "checksums.sha256":        check(true),
          "health.json":             check(true),
          "signature.json":          check(true),
          "README.txt":              check(true),
          "restore/restore.sh":      check(true),
          "restore/restore.ps1":     check(true),
          "restore/verify.sh":       check(true),
          "restore/restore.json":    check(true),
          "sql/valid_syntax":        check(true, "SQL passed literal-\\n guard"),
        } as Record<string, { ok: boolean; reason?: string }>,
      };
      const failedComponents = Object.entries(validation.components).filter(([, v]) => !v.ok);
      (validation as any).ok = failedComponents.length === 0;
      (validation as any).failed_count = failedComponents.length;
      parts.push({ name: "validation.json", content: JSON.stringify(validation, null, 2) });

      // README.txt
      const readme = `Backup Package
=========================
Created:        ${startedAtDate.toISOString()}
Backup version: 3
App version:    ${APP_VERSION}
Encrypted:      ${encryptEnabled ? "yes (AES-256)" : "no"}

CONTENTS
--------
  manifest.json / backup-info.json  High-level summary
  project-info.json                 Full DB + storage + app metadata
  validation.json                   Per-file export report
  health.json                       Health score & pass/fail per component
  signature.json                    Unique backup identity (UUID + hashes)
  checksums.sha256                  SHA-256 for every file in this ZIP
  database.json                     JSON snapshot of app tables (portable)
  database/database.sql             Full SQL dump (schema + data)
  database/schema.sql               Schema only
  database/data.sql                 Data only (INSERTs)
  database/stats.json               Row counts + size stats
  database/storage.sql              Storage bucket definitions
  database/policies.sql             RLS policies
  database/extensions.sql           Postgres extensions
  database/cron.sql                 pg_cron scheduled jobs
  database/auth.json                Auth providers metadata (no secrets)
  database/realtime.json            Realtime publications
  media-manifest.json               Storage file listing
  media/<bucket>/<path>             Actual binary media files
  restore/restore.sh                Linux/macOS restore driver
  restore/restore.ps1               Windows PowerShell restore driver
  restore/verify.sh                 Integrity check driver

RESTORE
-------
1. Unzip this archive.
2. If encrypted (*.enc), decrypt it via the Backup Center UI first.
3. Verify integrity:
     cd restore && bash verify.sh
   (or: sha256sum -c checksums.sha256)
4. Point the restore script at a fresh Postgres database:
     export DATABASE_URL="postgres://user:pass@host:5432/db"
     bash restore/restore.sh
   The script applies files in this order:
     extensions.sql -> schema.sql -> data.sql
     -> policies.sql -> storage.sql -> cron.sql
5. Re-upload media/ using the Backup Center "Restore" button
   (uses the Supabase Storage API and preserves paths).

VALIDATION
----------
- validation.json lists every expected file and whether it is present.
- health.json gives an overall pass/fail score and per-component checks.
- Any missing / empty file marks the backup as FAILED at creation time.

TROUBLESHOOTING
---------------
- "psql: command not found"          -> install PostgreSQL client tools.
- schema.sql errors on extensions    -> run extensions.sql first as superuser.
- "role does not exist"              -> ensure target project has the same
                                        roles (anon, authenticated, service_role).
- data.sql conflicts                 -> restore into an empty database, or
                                        the ON CONFLICT DO NOTHING clauses
                                        will skip pre-existing rows.
- Media upload fails                 -> re-run the Backup Center Restore.

This package is self-describing and requires no manual editing.
`;
      parts.push({ name: "README.txt", content: readme });

      // Signature.json (initial — hashes patched in second pass)
      // Use crypto.randomUUID() when available for a stable backup UUID.
      const backupUuid = (globalThis.crypto as any)?.randomUUID?.() ??
        `bkp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const signatureInit = {
        backup_uuid: backupUuid,
        created_at: startedAtDate.toISOString(),
        app: "platform",
        app_version: APP_VERSION,
        backup_version: 3,
        generator_version: "backup-center/3.0",
        sha256: null as string | null,
        md5:    null as string | null,
      };
      parts.push({ name: "signature.json", content: JSON.stringify(signatureInit, null, 2) });

      // Health.json (initial — score patched in second pass with final checks)
      const healthInit = {
        generated_at: new Date().toISOString(),
        health_score: 100,
        overall_status: "Production Ready",
        checks: {} as Record<string, boolean>,
      };
      parts.push({ name: "health.json", content: JSON.stringify(healthInit, null, 2) });

      // FIRST PASS BUILD
      const built = await buildFullZip(
        parts,
        "full",
        files,
        databaseFiles.length ? databaseFiles : undefined,
        {
          database_sql_included: !!sqlDump,
          extras_included: !!extras,
          total_tables: sqlDump?.stats.tables ?? extras?.project_info.total_tables ?? null,
          total_rows_exported: sqlDump?.stats.rows ?? null,
          total_buckets: extras?.project_info.total_buckets ?? null,
          total_users: extras?.project_info.total_users ?? null,
          total_files: extras?.project_info.total_files ?? null,
          extras_counts: extras?.counts ?? null,
          encrypted: encryptEnabled,
          backup_uuid: backupUuid,
          export_started_at: startedAtDate.toISOString(),
        },
        {
          skipDownload: true,
          restoreFiles: restoreScripts(),
          includeChecksums: true,
        },
      );

      // SECOND PASS — patch sizes/timing/health/signature/checksums into ZIP
      setProgress({ label: "Finalizing (sizes + health + signature)", done: 4, total: 6 });
      const compressedSize = built.blob.size;
      const uncompressedSize =
        parts.reduce((s, p) => s + new Blob([p.content]).size, 0) +
        databaseFiles.reduce((s, f) => s + new Blob([f.content]).size, 0) +
        mediaBytesTotal;
      const compressionRatio = uncompressedSize
        ? +(compressedSize / uncompressedSize).toFixed(4)
        : null;

      const finishedAtDate = new Date();
      const durationMs = finishedAtDate.getTime() - startedAt;
      const timing = {
        export_started_at:  startedAtDate.toISOString(),
        export_finished_at: finishedAtDate.toISOString(),
        export_duration_ms: durationMs,
        export_duration_seconds: +(durationMs / 1000).toFixed(2),
      };
      const sizes = {
        database_size_bytes:      dbSizeBytes,
        media_size_bytes:         mediaBytesTotal,
        storage_size_bytes:       storageSizeBytes,
        uncompressed_backup_bytes: uncompressedSize,
        compressed_backup_bytes:   compressedSize,
        compression_ratio:         compressionRatio,
      };

      const outerZip = await JSZip.loadAsync(built.blob);

      // Merge sizes/timing into project-info.json
      const patchedProjectInfo = { ...projectInfo, sizes, timing };
      outerZip.file("project-info.json", JSON.stringify(patchedProjectInfo, null, 2));

      // Merge sizes into database/stats.json (if present)
      const statsEntry = outerZip.file("database/stats.json");
      if (statsEntry) {
        const existing = JSON.parse(await statsEntry.async("string"));
        outerZip.file(
          "database/stats.json",
          JSON.stringify({ ...existing, sizes, timing }, null, 2),
        );
      }

      // Merge timing into manifest.json + backup-info.json
      for (const infoName of ["manifest.json", "backup-info.json"]) {
        const e = outerZip.file(infoName);
        if (e) {
          const existing = JSON.parse(await e.async("string"));
          outerZip.file(infoName, JSON.stringify({ ...existing, ...timing, sizes }, null, 2));
        }
      }

      // Common helpers used by both restore manifest + health checks.
      const has = (p: string) => !!outerZip.file(p);
      const mediaFolder = outerZip.folder("media");
      const hasMedia = !!(mediaFolder && Object.keys((mediaFolder as any).files ?? {}).length > 0)
        || files.length > 0;

      // ---- restore/restore.json — master restore manifest (auto-discovered)
      // Written FIRST so downstream health/validation/manifest patches can
      // record its presence.
      const ORDERED_RESTORE_STEPS: { file: string; required: boolean; depends_on: string[]; validation: boolean; type: string }[] = [
        { file: "database/extensions.sql", required: true,  depends_on: [],                            validation: true,  type: "sql" },
        { file: "database/storage.sql",    required: true,  depends_on: ["database/extensions.sql"],   validation: true,  type: "sql" },
        { file: "database/schema.sql",     required: true,  depends_on: ["database/extensions.sql"],   validation: true,  type: "sql" },
        { file: "database/policies.sql",   required: true,  depends_on: ["database/schema.sql"],       validation: true,  type: "sql" },
        { file: "database/realtime.json",  required: false, depends_on: ["database/schema.sql"],       validation: true,  type: "json-config" },
        { file: "database/auth.json",      required: false, depends_on: [],                            validation: true,  type: "json-config" },
        { file: "database/cron.sql",       required: false, depends_on: ["database/schema.sql"],       validation: true,  type: "sql" },
        { file: "database/data.sql",       required: true,  depends_on: ["database/schema.sql"],       validation: true,  type: "sql" },
        { file: "media/",                  required: false, depends_on: ["database/storage.sql"],      validation: true,  type: "media-folder" },
        { file: "verify",                  required: true,  depends_on: [],                            validation: true,  type: "post-check" },
      ];

      const knownFiles = new Set(ORDERED_RESTORE_STEPS.map((s) => s.file));
      const discovered: { file: string; required: boolean; depends_on: string[]; validation: boolean; type: string }[] = [];
      outerZip.forEach((relPath, obj) => {
        if (obj.dir) return;
        if (knownFiles.has(relPath)) return;
        if (relPath.startsWith("media/")) return;
        const type = relPath.endsWith(".sql") ? "sql"
                   : relPath.endsWith(".json") ? "json-meta"
                   : relPath.endsWith(".sha256") ? "checksum"
                   : relPath.startsWith("restore/") ? "restore-script"
                   : "misc";
        discovered.push({ file: relPath, required: false, depends_on: [], validation: type === "json-meta", type });
      });
      discovered.sort((a, b) => a.file.localeCompare(b.file));

      const allSteps = [...ORDERED_RESTORE_STEPS, ...discovered];
      const restoreComponents = allSteps.map((s, i) => ({
        file: s.file,
        type: s.type,
        order: i + 1,
        required: s.required,
        depends_on: s.depends_on,
        validation: s.validation,
        checksum_available: s.file === "verify" || s.file === "media/" ? false : has("checksums.sha256"),
        present: s.file === "verify" ? true
               : s.file === "media/" ? hasMedia
               : has(s.file),
      }));

      const restoreMissing = restoreComponents
        .filter((c) => c.required && !c.present && c.file !== "verify" && c.file !== "media/")
        .map((c) => c.file);

      const restoreManifest = {
        backup_version: "2.0",
        manifest_version: 1,
        app: "platform",
        app_version: APP_VERSION,
        generated_at: new Date().toISOString(),
        backup_uuid: backupUuid,
        compatibility: {
          min_backup_version: "1.0",
          max_backup_version: "2.x",
          postgres_version: (extras?.project_info as any)?.pg_version ?? null,
          supabase_version: "cloud",
          application_version: APP_VERSION,
        },
        restore_modes: {
          full:          ORDERED_RESTORE_STEPS.map((s) => s.file),
          database_only: ["database/extensions.sql","database/schema.sql","database/data.sql","verify"],
          media_only:    ["database/storage.sql","media/","verify"],
          schema_only:   ["database/extensions.sql","database/schema.sql","verify"],
          data_only:     ["database/data.sql","verify"],
          security_only: ["database/policies.sql","verify"],
          configuration_only: ["database/realtime.json","database/auth.json","database/cron.sql","verify"],
        },
        restore_order: ORDERED_RESTORE_STEPS.map((s) => s.file),
        dependencies: {
          "schema.sql":   ["extensions.sql"],
          "policies.sql": ["schema.sql"],
          "data.sql":     ["schema.sql"],
          "media":        ["storage.sql"],
          "cron.sql":     ["schema.sql"],
          "realtime.json":["schema.sql"],
        },
        components: restoreComponents,
        post_restore_tasks: [
          { id: "refresh_schema_cache", description: "Refresh PostgREST schema cache",       sql: "NOTIFY pgrst, 'reload schema';" },
          { id: "reload_postgrest",     description: "Reload PostgREST configuration",       sql: "NOTIFY pgrst, 'reload config';" },
          { id: "verify_buckets",       description: "Verify all storage buckets exist and match storage.sql" },
          { id: "verify_policies",      description: "Verify RLS policies match policies.sql" },
          { id: "verify_extensions",    description: "Verify extensions from extensions.sql are installed" },
          { id: "verify_realtime",      description: "Verify publications/tables in realtime.json" },
          { id: "verify_auth",          description: "Verify auth providers listed in auth.json are configured" },
        ],
        validation: {
          missing_required_files: restoreMissing,
          ok: restoreMissing.length === 0,
        },
      };
      outerZip.file("restore/restore.json", JSON.stringify(restoreManifest, null, 2));

      // Patch manifest.json + backup-info.json to record the restore manifest.
      for (const infoName of ["manifest.json", "backup-info.json"]) {
        const e = outerZip.file(infoName);
        if (!e) continue;
        const existing = JSON.parse(await e.async("string"));
        const scripts: string[] = Array.isArray(existing.restore_scripts) ? [...existing.restore_scripts] : [];
        if (!scripts.includes("restore.json")) scripts.push("restore.json");
        outerZip.file(infoName, JSON.stringify({
          ...existing,
          restore_scripts: scripts,
          restore_manifest: "restore/restore.json",
          restore_manifest_ok: restoreMissing.length === 0,
        }, null, 2));
      }

      // Patch validation.json to reflect restore.json presence.
      const vEntry = outerZip.file("validation.json");
      if (vEntry) {
        const v = JSON.parse(await vEntry.async("string"));
        v.components = v.components ?? {};
        v.components["restore/restore.json"] = { ok: true };
        const failed = Object.entries(v.components).filter(([, c]: any) => !c.ok);
        v.ok = failed.length === 0 && restoreMissing.length === 0;
        v.failed_count = failed.length;
        v.restore_missing_required = restoreMissing;
        outerZip.file("validation.json", JSON.stringify(v, null, 2));
      }

      // Health checks — derived from actual ZIP contents (future-proof)
      const checks: Record<string, boolean> = {
        Database:        has("database/database.sql"),
        Schema:          has("database/schema.sql"),
        Data:            has("database/data.sql"),
        Storage:         has("database/storage.sql"),
        Policies:        has("database/policies.sql"),
        Extensions:      has("database/extensions.sql"),
        Realtime:        has("database/realtime.json"),
        Auth:            has("database/auth.json"),
        Media:           hasMedia,
        Checksums:       has("checksums.sha256"),
        "Restore Scripts": has("restore/restore.sh") && has("restore/restore.ps1") && has("restore/verify.sh"),
        "Restore Manifest": has("restore/restore.json"),
        Validation:      has("validation.json"),
      };
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.values(checks).length;
      const healthScore = Math.round((passed / total) * 100);
      const overallStatus =
        healthScore === 100 ? "Production Ready" :
        healthScore >= 80  ? "Degraded" : "Failed";
      const health = {
        generated_at: new Date().toISOString(),
        health_score: healthScore,
        checks_passed: passed,
        checks_total: total,
        checks,
        overall_status: overallStatus,
      };
      outerZip.file("health.json", JSON.stringify(health, null, 2));


      // FAIL the backup if any expected file is missing / empty.
      const emptyExports: string[] = [];
      for (const dbFileName of ["database.sql", "schema.sql", "data.sql"]) {
        const e = outerZip.file(`database/${dbFileName}`);
        if (e) {
          const s = await e.async("string");
          if (!s.trim()) emptyExports.push(`database/${dbFileName}`);
        }
      }
      // JSON files must parse
      const badJson: string[] = [];
      for (const jf of ["manifest.json","backup-info.json","project-info.json","validation.json","health.json","signature.json","media-manifest.json","database.json","database/stats.json","database/realtime.json","database/auth.json","restore/restore.json"]) {
        const e = outerZip.file(jf);
        if (!e) continue;
        try { JSON.parse(await e.async("string")); } catch { badJson.push(jf); }
      }
      const productionReady = overallStatus === "Production Ready" && emptyExports.length === 0 && badJson.length === 0 && restoreMissing.length === 0;

      // Recompute checksums.sha256 over final content set (excluding itself + signature which we hash last).
      outerZip.remove("checksums.sha256");
      const entries: { path: string; obj: JSZip.JSZipObject }[] = [];
      outerZip.forEach((relPath, obj) => {
        if (!obj.dir && relPath !== "checksums.sha256" && relPath !== "signature.json") {
          entries.push({ path: relPath, obj });
        }
      });
      entries.sort((a, b) => a.path.localeCompare(b.path));
      const chkLines: string[] = [];
      for (const e of entries) {
        const bytes = await e.obj.async("uint8array");
        const hex = await sha256Hex(bytes);
        chkLines.push(`${hex}  ${e.path}`);
      }
      const checksumsFileContent = chkLines.join("\n") + "\n";
      outerZip.file("checksums.sha256", checksumsFileContent);

      // Signature.json — hash the aggregated checksums file for a stable backup fingerprint
      const chkBytes = new TextEncoder().encode(checksumsFileContent);
      const contentSha = await sha256Hex(chkBytes);
      const contentMd = md5Hex(chkBytes);
      const signature = {
        ...signatureInit,
        finalized_at: new Date().toISOString(),
        sha256: contentSha,
        md5: contentMd,
        production_ready: productionReady,
        empty_exports: emptyExports,
        invalid_json: badJson,
      };
      outerZip.file("signature.json", JSON.stringify(signature, null, 2));

      // Re-generate the final ZIP blob.
      const finalizedBlob = await outerZip.generateAsync({ type: "blob", compression: "DEFLATE" });

      // Verify the ZIP before we announce success.
      setProgress({ label: "Verifying backup", done: 5, total: 6 });
      const report = await verifyFullBackupZip(finalizedBlob);
      setVerifyReport(report);
      if (!report.ok || !productionReady) {
        toast.error(
          !productionReady
            ? `Backup FAILED — missing/empty: ${[...emptyExports, ...badJson].join(", ") || "component check"}`
            : "Verification failed — see report below",
        );
        return;
      }

      // Checksums (of the plain ZIP; encrypted output also gets its own below).
      const zipBytes = new Uint8Array(await finalizedBlob.arrayBuffer());
      const sha = await sha256Hex(zipBytes);
      const md = md5Hex(zipBytes);
      setLastChecksum({ sha256: sha, md5: md, filename: built.filename });

      // Companion checksums.json
      const checksumsBlob = new Blob(
        [JSON.stringify({
          filename: built.filename,
          size: finalizedBlob.size,
          sha256: sha,
          md5: md,
          backup_uuid: backupUuid,
          ...timing,
          sizes,
        }, null, 2)],
        { type: "application/json" },
      );

      // Optional encryption
      let finalBlob: Blob = finalizedBlob;
      let finalName = built.filename;
      let finalSha = sha;
      let finalMd = md;
      if (encryptEnabled) {
        finalBlob = await encryptBlobAes256(finalizedBlob, encryptPassword);
        finalName = `${built.filename}.enc`;
        const encBytes = new Uint8Array(await finalBlob.arrayBuffer());
        finalSha = await sha256Hex(encBytes);
        finalMd = md5Hex(encBytes);
        setLastChecksum({ sha256: finalSha, md5: finalMd, filename: finalName });
      }

      download(finalBlob, finalName);
      download(checksumsBlob, `${finalName}.checksums.json`);
      setLastFile(finalName);
      setEncryptPassword("");

      // Persist history entry.
      try {
        await runRecord({
          data: {
            filename: finalName,
            backup_type: "full",
            size_bytes: finalBlob.size,
            sha256: finalSha,
            md5: finalMd,
            verified: true,
            encrypted: encryptEnabled,
            app_version: APP_VERSION,
            total_tables: sqlDump?.stats.tables ?? null,
            total_rows: sqlDump?.stats.rows ?? null,
            media_files: files.length,
          },
        });
        await refreshHistoryAndHealth();
      } catch (e: any) {
        console.warn("history record failed:", e?.message);
      }

      setProgress({ label: "Done", done: 6, total: 6 });
      toast.success(
        `Full backup verified & downloaded (${files.length} media files${sqlDump ? `, ${sqlDump.stats.rows} rows in ${sqlDump.stats.tables} tables` : ""}, ${fmtDur(Math.round(durationMs/1000))})`,
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Full backup failed");
    } finally { setBusy(null); setProgress(null); }
  }



  // Dry-run validation of an uploaded ZIP without touching DB or storage.
  async function onValidate(file: File) {
    setBusy("validate");
    setValidateReport(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let blob: Blob = file;
      if (isEncryptedBackup(bytes)) {
        const pw = window.prompt("Backup is encrypted. Enter password:");
        if (!pw) { setBusy(null); return; }
        const plain = await decryptBackup(bytes, pw);
        blob = new Blob([plain as unknown as BlobPart]);
      }
      let currentBuckets: string[] | undefined;
      try { currentBuckets = await runGetBuckets({}); } catch { /* ignore */ }
      const report = await dryRunValidateZip(blob, currentBuckets);
      setValidateReport(report);
      if (report.ok) toast.success("Backup validated — no issues found");
      else toast.error("Validation failed — see report");
    } catch (e: any) {
      toast.error(e?.message ?? "Validation failed");
    } finally { setBusy(null); }
  }

  // Ask the admin to confirm before running a real restore.
  async function stageRestore(file: File) {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let workingFile = file;
      if (isEncryptedBackup(bytes)) {
        const pw = window.prompt("Backup is encrypted. Enter password to restore:");
        if (!pw) return;
        const plain = await decryptBackup(bytes, pw);
        workingFile = new File([plain as unknown as BlobPart], file.name.replace(/\.enc$/i, ""));
      }
      const zip = await JSZip.loadAsync(workingFile);
      let info: any = {};
      const infoEntry = zip.file("backup-info.json");
      if (infoEntry) info = JSON.parse(await infoEntry.async("text"));
      let stats: any = {};
      const statsEntry = zip.file("database/stats.json");
      if (statsEntry) stats = JSON.parse(await statsEntry.async("text"));
      const mm = zip.file("media-manifest.json");
      let mediaFiles = 0;
      if (mm) {
        const parsed = JSON.parse(await mm.async("text"));
        for (const b of parsed.buckets ?? []) mediaFiles += (b.files ?? []).length;
      }
      setPendingRestoreFile(workingFile);
      setPreRestore({
        filename: file.name,
        size: file.size,
        backupAppVersion: info.app_version,
        backupGeneratedAt: info.generated_at,
        tables: stats.tables ?? info.total_tables,
        rows: stats.rows ?? info.total_rows_exported,
        mediaFiles,
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not read backup");
    }
  }


  async function onRestoreFile(file: File) {
    setBusy("restore");
    try {
      // Decrypt on the fly if the file is encrypted.
      let workingFile = file;
      const rawBytes = new Uint8Array(await file.arrayBuffer());
      if (isEncryptedBackup(rawBytes)) {
        const pw = window.prompt("Backup is encrypted. Enter password to restore:");
        if (!pw) { setBusy(null); return; }
        const plain = await decryptBackup(rawBytes, pw);
        workingFile = new File([plain as unknown as BlobPart], file.name.replace(/\.enc$/i, ""));
      }
      const zip = await JSZip.loadAsync(workingFile);

      // 1) Apply SQL schema then data if present (one-click restore).
      const schemaEntry = zip.file("database/schema.sql");
      const dataEntry = zip.file("database/data.sql");
      let schemaResult: any = null;
      let dataResult: any = null;
      if (schemaEntry) {
        setProgress({ label: "Restoring schema", done: 0, total: 1 });
        const sql = await schemaEntry.async("text");
        schemaResult = await runRestoreSql({ data: { sql, phase: "schema" } });
        setProgress({ label: "Restoring schema", done: 1, total: 1 });
      }
      if (dataEntry) {
        setProgress({ label: "Restoring data", done: 0, total: 1 });
        const sql = await dataEntry.async("text");
        dataResult = await runRestoreSql({ data: { sql, phase: "data" } });
        setProgress({ label: "Restoring data", done: 1, total: 1 });
      }

      // 2) Database dry-run verify (legacy JSON summary, if present)
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

      const sqlBits: string[] = [];
      if (schemaResult) sqlBits.push(`schema ${schemaResult.ok}/${schemaResult.total}`);
      if (dataResult) sqlBits.push(`data ${dataResult.ok}/${dataResult.total}`);
      toast.success(
        `Restore complete — ${sqlBits.join(", ")}${sqlBits.length ? " · " : ""}${dbSummary.rows} rows in ${dbSummary.tables} tables verified, ${mediaRestored} media files uploaded`,
      );
      await refreshHistoryAndHealth();
    } catch (e: any) {
      toast.error(e?.message ?? "Restore failed");
    } finally { setBusy(null); setProgress(null); }
  }

  const validateInput = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <AdminPageHeader title="System Backup" description="Snapshot the database and media into a portable ZIP, or restore an archive on any Supabase project. Super admin only." />

      <BackupHealthCard health={health} />

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
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
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
          </div>

          <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 text-xs sm:flex-row sm:items-center">
            <label className="flex items-center gap-2">
              <Checkbox checked={encryptEnabled} onCheckedChange={(v) => setEncryptEnabled(!!v)} />
              <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypt backup (AES-256)</span>
            </label>
            {encryptEnabled && (
              <Input
                type="password"
                placeholder="Password (min 8 chars)"
                value={encryptPassword}
                onChange={(e) => setEncryptPassword(e.target.value)}
                className="max-w-xs"
                autoComplete="new-password"
              />
            )}
            <span className="text-muted-foreground sm:ml-auto">
              Applies only to Full Backup. Password is never stored.
            </span>
          </div>

          {progress && busy === "full" && (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span>{progress.label}</span>
                <span className="font-mono">{progress.done} / {progress.total}</span>
              </div>
              <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} />
            </div>
          )}

          <BackupVerificationPanel
            report={verifyReport}
            sha256={lastChecksum?.sha256}
            md5={lastChecksum?.md5}
            filename={lastChecksum?.filename ?? lastFile}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" /> Restore backup</CardTitle>
          <CardDescription>Upload a backup ZIP — schema, data, buckets, and media are restored to this project. Works across projects, localhost, and new domains.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInput}
            type="file"
            accept=".zip,application/zip,.enc"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) stageRestore(f);
              e.target.value = "";
            }}
          />
          <input
            ref={validateInput}
            type="file"
            accept=".zip,application/zip,.enc"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onValidate(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fileInput.current?.click()} disabled={!!busy}>
              {busy === "restore" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Restore Backup
            </Button>
            <Button onClick={() => validateInput.current?.click()} disabled={!!busy} variant="outline">
              {busy === "validate" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Validate Backup (dry run)
            </Button>
          </div>

          {progress && busy !== "full" && (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span>{progress.label}</span>
                <span className="font-mono">{progress.done} / {progress.total}</span>
              </div>
              <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} />
            </div>
          )}

          {validateReport && (
            <BackupVerificationPanel report={validateReport} />
          )}

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-200">
            <ShieldAlert className="mr-1 inline h-3.5 w-3.5" />
            Restore applies schema and data through the admin restore endpoint. Existing rows with matching primary keys are kept (INSERT ... ON CONFLICT DO NOTHING).
          </div>
          {lastFile && (
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Last download: <span className="font-mono">{lastFile}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><HistoryIcon className="h-4 w-4" /> Backup History</CardTitle>
            <CardDescription>Recent backups with checksums and verification status. Expired rows are pruned automatically.</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Label className="text-muted-foreground">Retention:</Label>
            <Select
              value={retention}
              onValueChange={async (v) => {
                setRetention(v);
                try {
                  await runSetRetention({ data: { value: v as any } });
                  toast.success(`Retention set to ${v}`);
                } catch (e: any) {
                  toast.error(e?.message ?? "Failed to update retention");
                }
              }}
            >
              <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <BackupHistoryTable
            rows={history}
            onDelete={async (id) => {
              try {
                await runDelete({ data: { id } });
                toast.success("Backup entry deleted");
                await refreshHistoryAndHealth();
              } catch (e: any) {
                toast.error(e?.message ?? "Delete failed");
              }
            }}
          />
        </CardContent>
      </Card>

      <PreRestoreDialog
        open={!!preRestore}
        info={preRestore}
        onCancel={() => { setPreRestore(null); setPendingRestoreFile(null); }}
        onConfirm={async () => {
          const f = pendingRestoreFile;
          setPreRestore(null);
          setPendingRestoreFile(null);
          if (f) await onRestoreFile(f);
        }}
      />
    </div>
  );
}

