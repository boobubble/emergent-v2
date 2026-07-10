import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Tables that are safe to snapshot. Keep this list explicit so we never
// accidentally export auth/internal data.
const BACKUP_TABLES = [
  "profiles",
  "app_settings",
  "posts",
  "comments",
  "reactions",
  "hashtags",
  "messages",
  "confessions",
  "confession_replies",
  "feedback_reports",
  "feedback_comments",
  "feedback_votes",
  "custom_pages",
  "url_rules",
  "word_filters",
  "trio_rooms",
  "user_roles",
  "user_chat_themes",
  "user_feed_themes",
  "chat_themes",
  "feed_themes",
] as const;

type TableSnapshot = { table: string; rows: any[]; count: number; truncated: boolean };

async function requireAdmin(context: any) {
  const { data: ok } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
  if (!ok) throw new Error("Forbidden");
}

export const backupDatabase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const MAX_ROWS = 5000;
    const tables: TableSnapshot[] = [];
    for (const t of BACKUP_TABLES) {
      try {
        const { data, error, count } = await supabaseAdmin
          .from(t as any)
          .select("*", { count: "exact" })
          .limit(MAX_ROWS);
        if (error) {
          tables.push({ table: t, rows: [], count: 0, truncated: false });
          continue;
        }
        tables.push({
          table: t,
          rows: data ?? [],
          count: count ?? (data?.length ?? 0),
          truncated: (count ?? 0) > MAX_ROWS,
        });
      } catch {
        tables.push({ table: t, rows: [], count: 0, truncated: false });
      }
    }
    return {
      version: 1,
      kind: "database",
      generated_at: new Date().toISOString(),
      tables,
    };
  });

export const backupMediaManifest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const out: any[] = [];
    for (const b of buckets ?? []) {
      const files: any[] = [];
      async function walk(prefix: string) {
        const { data } = await supabaseAdmin.storage.from(b.name).list(prefix, {
          limit: 1000, sortBy: { column: "name", order: "asc" },
        });
        for (const item of data ?? []) {
          const full = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id === null) {
            await walk(full);
          } else {
            const { data: pub } = supabaseAdmin.storage.from(b.name).getPublicUrl(full);
            files.push({
              path: full,
              size: (item.metadata as any)?.size ?? null,
              mime: (item.metadata as any)?.mimetype ?? null,
              public_url: b.public ? pub.publicUrl : null,
            });
          }
        }
      }
      try { await walk(""); } catch { /* ignore */ }
      out.push({ name: b.name, public: b.public, files });
    }
    return {
      version: 1,
      kind: "media-manifest",
      generated_at: new Date().toISOString(),
      buckets: out,
    };
  });

export const restoreBackupDryRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ summary: z.record(z.string(), z.number()) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    // Restore is intentionally a dry-run: real cloud restore must use a
    // point-in-time snapshot from the database provider. We report what
    // would be touched so the admin can confirm.
    return {
      ok: true,
      dry_run: true,
      tables: Object.entries(data.summary).map(([table, rows]) => ({ table, rows })),
      note: "Restore is recorded for audit only. For a true rollback, request a point-in-time restore.",
    };
  });

// --- Media file download / upload (portable backup & restore) ---

const bucketPathSchema = z.object({
  bucket: z.string().min(1).max(63),
  path: z.string().min(1).max(1024),
});

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  // btoa is available in Workers/Node18+
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const downloadMediaFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bucketPathSchema.parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: blob, error } = await supabaseAdmin.storage.from(data.bucket).download(data.path);
    if (error || !blob) throw new Error(error?.message ?? "Download failed");
    const buf = new Uint8Array(await blob.arrayBuffer());
    return {
      bucket: data.bucket,
      path: data.path,
      mime: blob.type || "application/octet-stream",
      size: buf.byteLength,
      contentBase64: toBase64(buf),
    };
  });

export const ensureStorageBucket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ name: z.string().min(1).max(63), public: z.boolean().default(false) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const existing = await supabaseAdmin.storage.getBucket(data.name);
    if (existing.data) {
      if (existing.data.public !== data.public) {
        await supabaseAdmin.storage.updateBucket(data.name, { public: data.public });
      }
      return { ok: true, created: false };
    }
    const { error } = await supabaseAdmin.storage.createBucket(data.name, { public: data.public });
    if (error) throw new Error(error.message);
    return { ok: true, created: true };
  });

export const uploadMediaFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    bucketPathSchema.extend({
      contentBase64: z.string(),
      mime: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = fromBase64(data.contentBase64);
    const { error } = await supabaseAdmin.storage.from(data.bucket).upload(data.path, bytes, {
      contentType: data.mime || "application/octet-stream",
      upsert: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true, size: bytes.byteLength };
  });

// --- Install-time bucket provisioning ---
// Called by the installer on a fresh Supabase project to guarantee every
// bucket the app writes to exists. Storage POLICIES are already shipped in
// migrations; the bucket rows themselves cannot be created via SQL, so we
// create them here through the admin storage API. Idempotent.
const REQUIRED_BUCKETS: { name: string; public: boolean }[] = [
  { name: "avatars",      public: true  },
  { name: "feed-media",   public: true  },
  { name: "brand-assets", public: false },
  { name: "stickers",     public: true  },
];

export const ensureRequiredBuckets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const results: { name: string; created: boolean; ok: boolean; error?: string }[] = [];
    for (const b of REQUIRED_BUCKETS) {
      try {
        const existing = await supabaseAdmin.storage.getBucket(b.name);
        if (existing.data) {
          if (existing.data.public !== b.public) {
            await supabaseAdmin.storage.updateBucket(b.name, { public: b.public });
          }
          results.push({ name: b.name, created: false, ok: true });
          continue;
        }
        const { error } = await supabaseAdmin.storage.createBucket(b.name, { public: b.public });
        if (error) throw new Error(error.message);
        results.push({ name: b.name, created: true, ok: true });
      } catch (e: any) {
        results.push({ name: b.name, created: false, ok: false, error: e?.message ?? "failed" });
      }
    }
    return { results };
  });


// --- Full PostgreSQL dump (schema + data) for the public schema ---

function sqlLiteral(v: any): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "bigint") return v.toString();
  if (v instanceof Date) return `'${v.toISOString()}'::timestamptz`;
  if (Array.isArray(v) || typeof v === "object") {
    const j = JSON.stringify(v).replace(/'/g, "''");
    return `'${j}'::jsonb`;
  }
  const s = String(v).replace(/'/g, "''");
  return `'${s}'`;
}

export const dumpDatabaseSql = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Schema (extensions, tables, constraints, indexes, views, functions,
    //    triggers, RLS, policies, grants).
    // NOTE: call these RPCs via the user's authenticated client so that
    // auth.uid() resolves inside the SECURITY DEFINER function's is_admin
    // check. Under supabaseAdmin (service role) auth.uid() is NULL and the
    // guard rejects with 'forbidden'.
    const { data: schemaSql, error: schemaErr } = await (context.supabase as any)
      .rpc("admin_export_schema_sql");
    if (schemaErr) throw new Error(`schema export failed: ${schemaErr.message}`);

    // 2) Enumerate every public table (future-proof — no hardcoded list)
    const { data: tableRows, error: tblErr } = await (context.supabase as any)
      .rpc("admin_list_public_tables");
    if (tblErr) throw new Error(`table list failed: ${tblErr.message}`);
    const tables: string[] = (tableRows ?? []).map((r: any) => r.table_name);

    // 3) Emit INSERT statements per table, wrapped so triggers/RLS don't fire.
    const PAGE = 1000;
    let dataSql = "-- ============================================\n";
    dataSql += "-- BooBubble Data Dump\n";
    dataSql += `-- Generated: ${new Date().toISOString()}\n`;
    dataSql += "-- ============================================\n\n";
    dataSql += "SET session_replication_role = replica;\n\n";

    let totalRows = 0;
    const tableStats: { table: string; rows: number }[] = [];

    for (const table of tables) {
      let offset = 0;
      let tableCount = 0;
      let firstPage = true;
      let colNames: string[] = [];

      while (true) {
        const { data, error } = await supabaseAdmin
          .from(table as any)
          .select("*")
          .range(offset, offset + PAGE - 1);
        if (error) {
          dataSql += `-- ! Skipped ${table}: ${error.message}\n\n`;
          break;
        }
        const rows = data ?? [];
        if (rows.length === 0) break;
        if (firstPage) {
          colNames = Object.keys(rows[0] as unknown as Record<string, unknown>);
          dataSql += `-- ${table}\n`;
          firstPage = false;
        }
        const colList = colNames.map((c) => `"${c}"`).join(", ");
        for (const row of rows) {
          const vals = colNames.map((c) => sqlLiteral((row as any)[c])).join(", ");
          dataSql += `INSERT INTO public."${table}" (${colList}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
        }
        tableCount += rows.length;
        if (rows.length < PAGE) break;
        offset += PAGE;
      }
      if (tableCount > 0) dataSql += `\n`;
      tableStats.push({ table, rows: tableCount });
      totalRows += tableCount;
    }

    dataSql += "\nSET session_replication_role = DEFAULT;\n";

    const fullSql =
      (schemaSql as string) +
      "\n\n-- ============================================\n" +
      "-- DATA\n" +
      "-- ============================================\n\n" +
      dataSql;

    return {
      version: 1,
      kind: "database-sql",
      generated_at: new Date().toISOString(),
      schema_sql: schemaSql as string,
      data_sql: dataSql,
      full_sql: fullSql,
      stats: {
        tables: tables.length,
        rows: totalRows,
        per_table: tableStats,
      },
    };
  });


// --- Extras: storage config, RLS policies, extensions, realtime, cron, meta ---
// Reads live catalogs via a single admin RPC so future tables/buckets/jobs
// are included automatically. All output is formatted into files the ZIP
// builder drops into database/*.
function ident(s: string): string {
  return `"${String(s).replace(/"/g, '""')}"`;
}
function lit(v: any): string {
  return sqlLiteral(v);
}

export const exportBackupExtras = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await (context.supabase as any).rpc("admin_export_extras");
    if (error) throw new Error(`extras export failed: ${error.message}`);
    const x = (data ?? {}) as any;
    const now = new Date().toISOString();

    // storage.sql — bucket definitions (idempotent upserts)
    let storageSql = `-- BooBubble Storage Dump\n-- Generated: ${now}\n\n`;
    for (const b of x.storage_buckets ?? []) {
      storageSql +=
        `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection, owner)\n` +
        `VALUES (${lit(b.id)}, ${lit(b.name)}, ${lit(!!b.public)}, ${lit(b.file_size_limit ?? null)}, ` +
        `${lit(b.allowed_mime_types ?? null)}, ${lit(b.avif_autodetection ?? false)}, ${lit(b.owner ?? null)})\n` +
        `ON CONFLICT (id) DO UPDATE SET\n` +
        `  public = EXCLUDED.public,\n` +
        `  file_size_limit = EXCLUDED.file_size_limit,\n` +
        `  allowed_mime_types = EXCLUDED.allowed_mime_types,\n` +
        `  avif_autodetection = EXCLUDED.avif_autodetection;\n\n`;
    }

    // policies.sql — every RLS policy across public + storage
    let policiesSql = `-- BooBubble RLS Policies\n-- Generated: ${now}\n\n`;
    const tablesSeen = new Set<string>();
    for (const p of x.policies ?? []) {
      const qual = p.qualified_table ?? `${p.schemaname}.${p.tablename}`;
      const tkey = `${p.schemaname}.${p.tablename}`;
      if (!tablesSeen.has(tkey)) {
        policiesSql += `ALTER TABLE ${ident(p.schemaname)}.${ident(p.tablename)} ENABLE ROW LEVEL SECURITY;\n`;
        tablesSeen.add(tkey);
      }
      const roles = Array.isArray(p.roles) ? p.roles.join(", ") : (p.roles ?? "public");
      policiesSql += `DROP POLICY IF EXISTS ${ident(p.policyname)} ON ${ident(p.schemaname)}.${ident(p.tablename)};\n`;
      policiesSql += `CREATE POLICY ${ident(p.policyname)} ON ${ident(p.schemaname)}.${ident(p.tablename)}\n`;
      policiesSql += `  AS ${p.permissive ?? "PERMISSIVE"} FOR ${p.cmd ?? "ALL"} TO ${roles}`;
      if (p.qual) policiesSql += `\n  USING (${p.qual})`;
      if (p.with_check) policiesSql += `\n  WITH CHECK (${p.with_check})`;
      policiesSql += `;\n\n`;
      void qual;
    }

    // extensions.sql
    let extensionsSql = `-- BooBubble Extensions\n-- Generated: ${now}\n\n`;
    for (const e of x.extensions ?? []) {
      extensionsSql += `CREATE EXTENSION IF NOT EXISTS ${ident(e.name)} WITH SCHEMA ${ident(e.schema)};\n`;
    }

    // cron.sql — safe re-schedule via cron.schedule
    let cronSql = `-- BooBubble Scheduled Jobs (pg_cron)\n-- Generated: ${now}\n\n`;
    if ((x.cron_jobs ?? []).length === 0) {
      cronSql += `-- No cron jobs found (pg_cron may be disabled or empty).\n`;
    } else {
      for (const j of x.cron_jobs ?? []) {
        const jobname = j.jobname ?? `job_${j.jobid}`;
        cronSql += `-- ${jobname} (active=${j.active})\n`;
        cronSql += `SELECT cron.schedule(${lit(jobname)}, ${lit(j.schedule)}, $CRON$${j.command}$CRON$);\n\n`;
      }
    }

    // realtime.json
    const realtimeJson = {
      generated_at: now,
      publications: x.publications ?? [],
      tables: x.realtime_tables ?? [],
    };

    // auth.json — metadata only, never secrets
    const authJson = {
      generated_at: now,
      note: "Provider secrets and SMTP credentials are managed outside the database and are never exported. Reconfigure them on the destination project.",
      providers_in_use: x.auth_providers ?? [],
    };



    // project-info.json
    const projectInfo = {
      generated_at: now,
      backup_version: 2,
      pg_version: x.pg_version ?? null,
      total_tables: x.total_tables ?? null,
      total_buckets: x.total_buckets ?? null,
      total_users: x.total_users ?? null,
      total_files: x.total_files ?? null,
      migration_count: (x.migrations ?? []).length,
      migrations: x.migrations ?? [],
    };

    return {
      version: 2,
      generated_at: now,
      files: {
        "storage.sql": storageSql,
        "policies.sql": policiesSql,
        "extensions.sql": extensionsSql,
        "cron.sql": cronSql,
        "realtime.json": JSON.stringify(realtimeJson, null, 2),
        "auth.json": JSON.stringify(authJson, null, 2),
      },
      project_info: projectInfo,
      counts: {
        storage_buckets: (x.storage_buckets ?? []).length,
        policies: (x.policies ?? []).length,
        extensions: (x.extensions ?? []).length,
        cron_jobs: (x.cron_jobs ?? []).length,
        publications: (x.publications ?? []).length,
        realtime_tables: (x.realtime_tables ?? []).length,
      },
    };
  });


