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

