import JSZip from "jszip";

export type VerifyCheck = { name: string; ok: boolean; detail?: string };
export type VerifyReport = {
  ok: boolean;
  checks: VerifyCheck[];
  size: number;
  info?: any;
  stats?: { tables: number; rows: number };
};

const REQUIRED_FULL = [
  "manifest.json",
  "backup-info.json",
  "database.json",
  "media-manifest.json",
  "database/database.sql",
  "database/schema.sql",
  "database/data.sql",
  "database/stats.json",
];

export async function verifyFullBackupZip(blob: Blob): Promise<VerifyReport> {
  const checks: VerifyCheck[] = [];
  let ok = true;
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(blob);
    checks.push({ name: "ZIP integrity", ok: true });
  } catch (e: any) {
    return {
      ok: false,
      size: blob.size,
      checks: [{ name: "ZIP integrity", ok: false, detail: e?.message ?? "corrupt" }],
    };
  }

  for (const path of REQUIRED_FULL) {
    const f = zip.file(path);
    if (!f) {
      checks.push({ name: path, ok: false, detail: "missing" });
      ok = false;
      continue;
    }
    const bytes = await f.async("uint8array");
    if (bytes.byteLength === 0) {
      checks.push({ name: path, ok: false, detail: "empty" });
      ok = false;
    } else {
      checks.push({ name: path, ok: true, detail: `${bytes.byteLength} bytes` });
    }
  }

  let info: any = undefined;
  const infoEntry = zip.file("backup-info.json");
  if (infoEntry) {
    try {
      info = JSON.parse(await infoEntry.async("text"));
      const missing = ["app_version", "generated_at"].filter((k) => !info[k]);
      checks.push({
        name: "backup-info fields",
        ok: missing.length === 0,
        detail: missing.length ? `missing: ${missing.join(", ")}` : undefined,
      });
      if (missing.length) ok = false;
    } catch (e: any) {
      checks.push({ name: "backup-info fields", ok: false, detail: e?.message });
      ok = false;
    }
  }

  let stats: { tables: number; rows: number } | undefined;
  const sEntry = zip.file("database/stats.json");
  if (sEntry) {
    try {
      const s = JSON.parse(await sEntry.async("text"));
      stats = { tables: Number(s.tables ?? 0), rows: Number(s.rows ?? 0) };
    } catch {
      // ignore
    }
  }

  const sqlEntry = zip.file("database/database.sql");
  if (sqlEntry) {
    const head = (await sqlEntry.async("text")).slice(0, 300);
    const hasHeader = head.includes("Platform Schema Dump");
    checks.push({
      name: "database.sql header",
      ok: hasHeader,
      detail: hasHeader ? undefined : "missing generator header",
    });
    if (!hasHeader) ok = false;
  }

  return { ok, checks, size: blob.size, info, stats };
}

// Lighter check for the dry-run path — same core assertions plus optional
// storage bucket comparison.
export async function dryRunValidateZip(
  blob: Blob,
  currentBuckets?: string[],
): Promise<VerifyReport & { bucketDiff?: { missing: string[]; extra: string[] } }> {
  const rep = await verifyFullBackupZip(blob);
  let bucketDiff: { missing: string[]; extra: string[] } | undefined;
  if (currentBuckets) {
    try {
      const zip = await JSZip.loadAsync(blob);
      const mm = zip.file("media-manifest.json");
      if (mm) {
        const m = JSON.parse(await mm.async("text"));
        const backupBuckets: string[] = (m.buckets ?? []).map((b: any) => b.name);
        bucketDiff = {
          missing: backupBuckets.filter((b) => !currentBuckets.includes(b)),
          extra: currentBuckets.filter((b) => !backupBuckets.includes(b)),
        };
      }
    } catch {
      // ignore
    }
  }
  return { ...rep, bucketDiff };
}
