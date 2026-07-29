import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, r as recordType, s as stringType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
const BACKUP_TABLES = ["profiles", "app_settings", "posts", "comments", "reactions", "hashtags", "messages", "confessions", "confession_replies", "feedback_reports", "feedback_comments", "feedback_votes", "custom_pages", "url_rules", "word_filters", "trio_rooms", "user_roles", "user_chat_themes", "user_feed_themes", "chat_themes", "feed_themes"];
async function requireAdmin(context) {
  const {
    data: ok
  } = await context.supabase.rpc("is_admin", {
    _user_id: context.userId
  });
  if (!ok) throw new Error("Forbidden");
}
const backupDatabase_createServerFn_handler = createServerRpc({
  id: "76e6fc7a58c80573e13c5bfeba017853d4a6a4d55dd081d5b865f6c101e80106",
  name: "backupDatabase",
  filename: "src/lib/backup.functions.ts"
}, (opts) => backupDatabase.__executeServer(opts));
const backupDatabase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(backupDatabase_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const MAX_ROWS = 5e3;
  const tables = [];
  for (const t of BACKUP_TABLES) {
    try {
      const {
        data,
        error,
        count
      } = await supabaseAdmin.from(t).select("*", {
        count: "exact"
      }).limit(MAX_ROWS);
      if (error) {
        tables.push({
          table: t,
          rows: [],
          count: 0,
          truncated: false
        });
        continue;
      }
      tables.push({
        table: t,
        rows: data ?? [],
        count: count ?? data?.length ?? 0,
        truncated: (count ?? 0) > MAX_ROWS
      });
    } catch {
      tables.push({
        table: t,
        rows: [],
        count: 0,
        truncated: false
      });
    }
  }
  return {
    version: 1,
    kind: "database",
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    tables
  };
});
const backupMediaManifest_createServerFn_handler = createServerRpc({
  id: "ec4091dc2c2bc0f492380cf5fb79bc0983634c6a120aee38fada23fcb07ef97d",
  name: "backupMediaManifest",
  filename: "src/lib/backup.functions.ts"
}, (opts) => backupMediaManifest.__executeServer(opts));
const backupMediaManifest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(backupMediaManifest_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: buckets
  } = await supabaseAdmin.storage.listBuckets();
  const out = [];
  for (const b of buckets ?? []) {
    const files = [];
    async function walk(prefix) {
      const {
        data
      } = await supabaseAdmin.storage.from(b.name).list(prefix, {
        limit: 1e3,
        sortBy: {
          column: "name",
          order: "asc"
        }
      });
      for (const item of data ?? []) {
        const full = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          await walk(full);
        } else {
          const {
            data: pub
          } = supabaseAdmin.storage.from(b.name).getPublicUrl(full);
          files.push({
            path: full,
            size: item.metadata?.size ?? null,
            mime: item.metadata?.mimetype ?? null,
            public_url: b.public ? pub.publicUrl : null
          });
        }
      }
    }
    try {
      await walk("");
    } catch {
    }
    out.push({
      name: b.name,
      public: b.public,
      files
    });
  }
  return {
    version: 1,
    kind: "media-manifest",
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    buckets: out
  };
});
const restoreBackupDryRun_createServerFn_handler = createServerRpc({
  id: "c62ca6743b3701289cbb5ba9a86f49f0135d647ba9a9d961a1f456cd9e56f241",
  name: "restoreBackupDryRun",
  filename: "src/lib/backup.functions.ts"
}, (opts) => restoreBackupDryRun.__executeServer(opts));
const restoreBackupDryRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  summary: recordType(stringType(), numberType())
}).parse(d)).handler(restoreBackupDryRun_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  return {
    ok: true,
    dry_run: true,
    tables: Object.entries(data.summary).map(([table, rows]) => ({
      table,
      rows
    })),
    note: "Restore is recorded for audit only. For a true rollback, request a point-in-time restore."
  };
});
const bucketPathSchema = objectType({
  bucket: stringType().min(1).max(63),
  path: stringType().min(1).max(1024)
});
function toBase64(bytes) {
  let bin = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
function fromBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const downloadMediaFile_createServerFn_handler = createServerRpc({
  id: "3d1c2d5d2f2168644443aab81d77f0f19285c41b7f4a9aa1da4f8529f1cece90",
  name: "downloadMediaFile",
  filename: "src/lib/backup.functions.ts"
}, (opts) => downloadMediaFile.__executeServer(opts));
const downloadMediaFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => bucketPathSchema.parse(d)).handler(downloadMediaFile_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: blob,
    error
  } = await supabaseAdmin.storage.from(data.bucket).download(data.path);
  if (error || !blob) throw new Error(error?.message ?? "Download failed");
  const buf = new Uint8Array(await blob.arrayBuffer());
  return {
    bucket: data.bucket,
    path: data.path,
    mime: blob.type || "application/octet-stream",
    size: buf.byteLength,
    contentBase64: toBase64(buf)
  };
});
const ensureStorageBucket_createServerFn_handler = createServerRpc({
  id: "59be48f262706f05a7b6c8ff850a5fa83c33217a7186668b879a170cf283c6c1",
  name: "ensureStorageBucket",
  filename: "src/lib/backup.functions.ts"
}, (opts) => ensureStorageBucket.__executeServer(opts));
const ensureStorageBucket = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  name: stringType().min(1).max(63),
  public: booleanType().default(false)
}).parse(d)).handler(ensureStorageBucket_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const existing = await supabaseAdmin.storage.getBucket(data.name);
  if (existing.data) {
    if (existing.data.public !== data.public) {
      await supabaseAdmin.storage.updateBucket(data.name, {
        public: data.public
      });
    }
    return {
      ok: true,
      created: false
    };
  }
  const {
    error
  } = await supabaseAdmin.storage.createBucket(data.name, {
    public: data.public
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    created: true
  };
});
const uploadMediaFile_createServerFn_handler = createServerRpc({
  id: "de6be986d7e30dd814311362a6cdd7c697b6ebcf57d003dd11d8bbb29300ad56",
  name: "uploadMediaFile",
  filename: "src/lib/backup.functions.ts"
}, (opts) => uploadMediaFile.__executeServer(opts));
const uploadMediaFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => bucketPathSchema.extend({
  contentBase64: stringType(),
  mime: stringType().optional()
}).parse(d)).handler(uploadMediaFile_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const bytes = fromBase64(data.contentBase64);
  const {
    error
  } = await supabaseAdmin.storage.from(data.bucket).upload(data.path, bytes, {
    contentType: data.mime || "application/octet-stream",
    upsert: true
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    size: bytes.byteLength
  };
});
const REQUIRED_BUCKETS = [{
  name: "avatars",
  public: true
}, {
  name: "feed-media",
  public: true
}, {
  name: "brand-assets",
  public: false
}, {
  name: "stickers",
  public: true
}];
const ensureRequiredBuckets_createServerFn_handler = createServerRpc({
  id: "bc75a214afa83adcc42923f7f934130909277897a11b75349013e5ef58a9fa46",
  name: "ensureRequiredBuckets",
  filename: "src/lib/backup.functions.ts"
}, (opts) => ensureRequiredBuckets.__executeServer(opts));
const ensureRequiredBuckets = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(ensureRequiredBuckets_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const results = [];
  for (const b of REQUIRED_BUCKETS) {
    try {
      const existing = await supabaseAdmin.storage.getBucket(b.name);
      if (existing.data) {
        if (existing.data.public !== b.public) {
          await supabaseAdmin.storage.updateBucket(b.name, {
            public: b.public
          });
        }
        results.push({
          name: b.name,
          created: false,
          ok: true
        });
        continue;
      }
      const {
        error
      } = await supabaseAdmin.storage.createBucket(b.name, {
        public: b.public
      });
      if (error) throw new Error(error.message);
      results.push({
        name: b.name,
        created: true,
        ok: true
      });
    } catch (e) {
      results.push({
        name: b.name,
        created: false,
        ok: false,
        error: e?.message ?? "failed"
      });
    }
  }
  return {
    results
  };
});
function sqlLiteral(v) {
  if (v === null || v === void 0) return "NULL";
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
const dumpDatabaseSql_createServerFn_handler = createServerRpc({
  id: "93eadaa5e5b70991cf2956d89bd15639f213c72ac90835836b303b7b69a4708a",
  name: "dumpDatabaseSql",
  filename: "src/lib/backup.functions.ts"
}, (opts) => dumpDatabaseSql.__executeServer(opts));
const dumpDatabaseSql = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(dumpDatabaseSql_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: schemaSql,
    error: schemaErr
  } = await context.supabase.rpc("admin_export_schema_sql");
  if (schemaErr) throw new Error(`schema export failed: ${schemaErr.message}`);
  const {
    data: tableRows,
    error: tblErr
  } = await context.supabase.rpc("admin_list_public_tables");
  if (tblErr) throw new Error(`table list failed: ${tblErr.message}`);
  const tables = (tableRows ?? []).map((r) => r.table_name);
  const PAGE = 1e3;
  let dataSql = "-- ============================================\n";
  dataSql += "-- Platform Data Dump\n";
  dataSql += `-- Generated: ${(/* @__PURE__ */ new Date()).toISOString()}
`;
  dataSql += "-- ============================================\n\n";
  dataSql += "SET session_replication_role = replica;\n\n";
  let totalRows = 0;
  const tableStats = [];
  for (const table of tables) {
    let offset = 0;
    let tableCount = 0;
    let firstPage = true;
    let colNames = [];
    while (true) {
      const {
        data,
        error
      } = await supabaseAdmin.from(table).select("*").range(offset, offset + PAGE - 1);
      if (error) {
        dataSql += `-- ! Skipped ${table}: ${error.message}

`;
        break;
      }
      const rows = data ?? [];
      if (rows.length === 0) break;
      if (firstPage) {
        colNames = Object.keys(rows[0]);
        dataSql += `-- ${table}
`;
        firstPage = false;
      }
      const colList = colNames.map((c) => `"${c}"`).join(", ");
      for (const row of rows) {
        const vals = colNames.map((c) => sqlLiteral(row[c])).join(", ");
        dataSql += `INSERT INTO public."${table}" (${colList}) VALUES (${vals}) ON CONFLICT DO NOTHING;
`;
      }
      tableCount += rows.length;
      if (rows.length < PAGE) break;
      offset += PAGE;
    }
    if (tableCount > 0) dataSql += `
`;
    tableStats.push({
      table,
      rows: tableCount
    });
    totalRows += tableCount;
  }
  dataSql += "\nSET session_replication_role = DEFAULT;\n";
  const {
    splitSqlStatementsWithLines
  } = await import("./backup-restore.functions-DVxsWChD.mjs");
  const schemaStmts = splitSqlStatementsWithLines(schemaSql);
  const dataStmts = splitSqlStatementsWithLines(dataSql);
  const combined = [...schemaStmts.map((s) => ({
    ...s,
    file: "schema.sql"
  })), ...dataStmts.map((s) => ({
    ...s,
    file: "database.sql"
  }))];
  const {
    data: validation,
    error: validationErr
  } = await context.supabase.rpc("admin_validate_export_sql_stmts", {
    _stmts: combined.map((c) => c.text)
  });
  if (validationErr) throw new Error(`SQL restore validation failed: ${validationErr.message}`);
  if (!validation?.ok) {
    const idx = (validation?.failed_index ?? 1) - 1;
    const hit = combined[idx];
    const where = hit ? `${hit.file}:${hit.startLine}` : "unknown location";
    const stmt = validation?.failed_statement ?? hit?.text?.slice(0, 400) ?? "";
    const msg = validation?.message ?? "unknown error";
    const sqlstate = validation?.sqlstate ? ` [${validation.sqlstate}]` : "";
    const detail = validation?.detail ? `
  detail: ${validation.detail}` : "";
    const hint = validation?.hint ? `
  hint: ${validation.hint}` : "";
    throw new Error(`SQL restore validation failed at ${where}${sqlstate}: ${msg}${detail}${hint}
  statement: ${stmt}`);
  }
  const fullSql = schemaSql + "\n\n-- ============================================\n-- DATA\n-- ============================================\n\n" + dataSql;
  return {
    version: 1,
    kind: "database-sql",
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    schema_sql: schemaSql,
    data_sql: dataSql,
    full_sql: fullSql,
    stats: {
      tables: tables.length,
      rows: totalRows,
      per_table: tableStats
    }
  };
});
function ident(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}
function lit(v) {
  return sqlLiteral(v);
}
const exportBackupExtras_createServerFn_handler = createServerRpc({
  id: "4f7c04fe629f39fddd21a2f3ece558c12aafd300b8fa7bf0f04190f872c2ca68",
  name: "exportBackupExtras",
  filename: "src/lib/backup.functions.ts"
}, (opts) => exportBackupExtras.__executeServer(opts));
const exportBackupExtras = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(exportBackupExtras_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    data,
    error
  } = await context.supabase.rpc("admin_export_extras");
  if (error) throw new Error(`extras export failed: ${error.message}`);
  const x = data ?? {};
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let storageSql = `-- Platform Storage Dump
-- Generated: ${now}

`;
  for (const b of x.storage_buckets ?? []) {
    storageSql += `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection, owner)
VALUES (${lit(b.id)}, ${lit(b.name)}, ${lit(!!b.public)}, ${lit(b.file_size_limit ?? null)}, ${lit(b.allowed_mime_types ?? null)}, ${lit(b.avif_autodetection ?? false)}, ${lit(b.owner ?? null)})
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  avif_autodetection = EXCLUDED.avif_autodetection;

`;
  }
  let policiesSql = `-- Platform RLS Policies
-- Generated: ${now}

`;
  const tablesSeen = /* @__PURE__ */ new Set();
  for (const p of x.policies ?? []) {
    p.qualified_table ?? `${p.schemaname}.${p.tablename}`;
    const tkey = `${p.schemaname}.${p.tablename}`;
    if (!tablesSeen.has(tkey)) {
      policiesSql += `ALTER TABLE ${ident(p.schemaname)}.${ident(p.tablename)} ENABLE ROW LEVEL SECURITY;
`;
      tablesSeen.add(tkey);
    }
    const roles = Array.isArray(p.roles) ? p.roles.join(", ") : p.roles ?? "public";
    policiesSql += `DROP POLICY IF EXISTS ${ident(p.policyname)} ON ${ident(p.schemaname)}.${ident(p.tablename)};
`;
    policiesSql += `CREATE POLICY ${ident(p.policyname)} ON ${ident(p.schemaname)}.${ident(p.tablename)}
`;
    policiesSql += `  AS ${p.permissive ?? "PERMISSIVE"} FOR ${p.cmd ?? "ALL"} TO ${roles}`;
    if (p.qual) policiesSql += `
  USING (${p.qual})`;
    if (p.with_check) policiesSql += `
  WITH CHECK (${p.with_check})`;
    policiesSql += `;

`;
  }
  let extensionsSql = `-- Platform Extensions
-- Generated: ${now}

`;
  for (const e of x.extensions ?? []) {
    extensionsSql += `CREATE EXTENSION IF NOT EXISTS ${ident(e.name)} WITH SCHEMA ${ident(e.schema)};
`;
  }
  let cronSql = `-- Platform Scheduled Jobs (pg_cron)
-- Generated: ${now}

`;
  if ((x.cron_jobs ?? []).length === 0) {
    cronSql += `-- No cron jobs found (pg_cron may be disabled or empty).
`;
  } else {
    for (const j of x.cron_jobs ?? []) {
      const jobname = j.jobname ?? `job_${j.jobid}`;
      cronSql += `-- ${jobname} (active=${j.active})
`;
      cronSql += `SELECT cron.schedule(${lit(jobname)}, ${lit(j.schedule)}, $CRON$${j.command}$CRON$);

`;
    }
  }
  const realtimeJson = {
    generated_at: now,
    publications: x.publications ?? [],
    tables: x.realtime_tables ?? []
  };
  const authJson = {
    generated_at: now,
    note: "Provider secrets and SMTP credentials are managed outside the database and are never exported. Reconfigure them on the destination project.",
    providers_in_use: x.auth_providers ?? []
  };
  const projectInfo = {
    generated_at: now,
    backup_version: 2,
    pg_version: x.pg_version ?? null,
    total_tables: x.total_tables ?? null,
    total_buckets: x.total_buckets ?? null,
    total_users: x.total_users ?? null,
    total_files: x.total_files ?? null,
    migration_count: (x.migrations ?? []).length,
    migrations: x.migrations ?? []
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
      "auth.json": JSON.stringify(authJson, null, 2)
    },
    project_info: projectInfo,
    counts: {
      storage_buckets: (x.storage_buckets ?? []).length,
      policies: (x.policies ?? []).length,
      extensions: (x.extensions ?? []).length,
      cron_jobs: (x.cron_jobs ?? []).length,
      publications: (x.publications ?? []).length,
      realtime_tables: (x.realtime_tables ?? []).length
    }
  };
});
const exportBackupMetadataV2_createServerFn_handler = createServerRpc({
  id: "608c378fde795cb827c9d7b5aa94375e5db803d26df8fd5705881f17452a625f",
  name: "exportBackupMetadataV2",
  filename: "src/lib/backup.functions.ts"
}, (opts) => exportBackupMetadataV2.__executeServer(opts));
const exportBackupMetadataV2 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(exportBackupMetadataV2_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    data,
    error
  } = await context.supabase.rpc("admin_export_metadata_v2");
  if (error) throw new Error(`metadata v2 failed: ${error.message}`);
  return data ?? {};
});
export {
  backupDatabase_createServerFn_handler,
  backupMediaManifest_createServerFn_handler,
  downloadMediaFile_createServerFn_handler,
  dumpDatabaseSql_createServerFn_handler,
  ensureRequiredBuckets_createServerFn_handler,
  ensureStorageBucket_createServerFn_handler,
  exportBackupExtras_createServerFn_handler,
  exportBackupMetadataV2_createServerFn_handler,
  restoreBackupDryRun_createServerFn_handler,
  uploadMediaFile_createServerFn_handler
};
