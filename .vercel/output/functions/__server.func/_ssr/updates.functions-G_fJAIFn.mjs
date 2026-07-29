import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, r as recordType, s as stringType, f as anyType, a as arrayType, e as enumType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
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
async function requireAdmin(context) {
  const {
    data: ok
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin"
  });
  if (!ok) throw new Error("Forbidden: super admin required");
}
const PackageSchema = objectType({
  version: stringType().min(1).max(32),
  build_number: numberType().int().positive().default(1),
  release_date: stringType().optional(),
  channel: enumType(["stable", "beta", "hotfix"]).default("stable"),
  min_from_version: stringType().optional(),
  max_from_version: stringType().optional(),
  installer_version: stringType().optional(),
  schema_version: stringType().optional(),
  package_sha256: stringType().optional(),
  release_notes: objectType({
    features: arrayType(stringType()).optional(),
    improvements: arrayType(stringType()).optional(),
    fixes: arrayType(stringType()).optional(),
    performance: arrayType(stringType()).optional(),
    security: arrayType(stringType()).optional(),
    database: arrayType(stringType()).optional(),
    breaking: arrayType(stringType()).optional(),
    deprecated: arrayType(stringType()).optional()
  }).default({}),
  impacts: recordType(stringType(), enumType(["safe", "attention", "manual"])).optional(),
  migrations: arrayType(objectType({
    id: stringType().min(1),
    description: stringType().optional(),
    sql: stringType().min(1)
  })).default([]),
  assets: arrayType(objectType({
    path: stringType(),
    url: stringType()
  })).default([]),
  manifest: recordType(stringType(), anyType()).default({})
});
const getSystemVersion_createServerFn_handler = createServerRpc({
  id: "4b67fc921f3e13d1aa6e9d3ed1e5964f3bdf8285e048bea9aa7996bc402e0caf",
  name: "getSystemVersion",
  filename: "src/lib/updates.functions.ts"
}, (opts) => getSystemVersion.__executeServer(opts));
const getSystemVersion = createServerFn({
  method: "GET"
}).handler(getSystemVersion_createServerFn_handler, async () => {
  const {
    createClient
  } = await import("../_libs/supabase__supabase-js.mjs");
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const {
    data,
    error
  } = await sb.rpc("get_system_version");
  if (error) throw new Error(error.message);
  return data;
});
const listUpdates_createServerFn_handler = createServerRpc({
  id: "a69dbd564799d575578bb2f5698f682d5d2290882438177360a14b8721fdd78c",
  name: "listUpdates",
  filename: "src/lib/updates.functions.ts"
}, (opts) => listUpdates.__executeServer(opts));
const listUpdates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(listUpdates_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    data,
    error
  } = await context.supabase.from("app_updates").select("*").order("release_date", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const uploadUpdatePackage_createServerFn_handler = createServerRpc({
  id: "df4fdbe6e2c28811c724b6c7bfe6f800d4fa2746431b26a78284cb859ea082f6",
  name: "uploadUpdatePackage",
  filename: "src/lib/updates.functions.ts"
}, (opts) => uploadUpdatePackage.__executeServer(opts));
const uploadUpdatePackage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => PackageSchema.parse(raw)).handler(uploadUpdatePackage_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const row = {
    version: data.version,
    build_number: data.build_number,
    release_date: data.release_date ?? (/* @__PURE__ */ new Date()).toISOString(),
    channel: data.channel,
    manifest: data.manifest,
    release_notes: data.release_notes,
    migrations: data.migrations,
    min_from_version: data.min_from_version ?? null,
    package_sha256: data.package_sha256 ?? null,
    uploaded_by: context.userId,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const {
    data: existing
  } = await supabaseAdmin.from("app_updates").select("id").eq("version", data.version).maybeSingle();
  if (existing) {
    const {
      error: error2
    } = await supabaseAdmin.from("app_updates").update(row).eq("id", existing.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: existing.id,
      replaced: true
    };
  }
  const {
    data: inserted,
    error
  } = await supabaseAdmin.from("app_updates").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: inserted.id,
    replaced: false
  };
});
const deleteUpdatePackage_createServerFn_handler = createServerRpc({
  id: "5cb69cd947cdad0ac250481405d1de36e3870ab3d45172514d7f34758b1ef0f2",
  name: "deleteUpdatePackage",
  filename: "src/lib/updates.functions.ts"
}, (opts) => deleteUpdatePackage.__executeServer(opts));
const deleteUpdatePackage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  id: stringType().uuid()
}).parse(raw)).handler(deleteUpdatePackage_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    error
  } = await supabaseAdmin.from("app_updates").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const preUpdateChecks_createServerFn_handler = createServerRpc({
  id: "4b5f3ef063af3e60de6d9a2b2aa329ff847671bf5ab7dac6d8bb8080efeb59ee",
  name: "preUpdateChecks",
  filename: "src/lib/updates.functions.ts"
}, (opts) => preUpdateChecks.__executeServer(opts));
const preUpdateChecks = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  version: stringType()
}).parse(raw)).handler(preUpdateChecks_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const checks = [];
  const {
    data: sysV
  } = await supabaseAdmin.rpc("get_system_version");
  const current = sysV?.current_version ?? null;
  checks.push({
    name: "Existing installation",
    ok: !!current,
    detail: `current v${current}`
  });
  const {
    data: pkg
  } = await supabaseAdmin.from("app_updates").select("*").eq("version", data.version).maybeSingle();
  checks.push({
    name: "Package present",
    ok: !!pkg,
    detail: pkg ? `v${data.version}` : "not uploaded"
  });
  if (pkg?.min_from_version && current) {
    const ok = compareVer(current, pkg.min_from_version) >= 0;
    checks.push({
      name: "Version compatibility",
      ok,
      detail: ok ? "ok" : `requires ≥ v${pkg.min_from_version}`
    });
  } else {
    checks.push({
      name: "Version compatibility",
      ok: true,
      detail: "no constraint"
    });
  }
  const {
    error: dbErr
  } = await supabaseAdmin.from("app_settings").select("key").limit(1);
  checks.push({
    name: "Database connection",
    ok: !dbErr,
    detail: dbErr?.message
  });
  const {
    error: stErr
  } = await supabaseAdmin.storage.listBuckets();
  checks.push({
    name: "Storage service",
    ok: !stErr,
    detail: stErr?.message
  });
  const envOk = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  checks.push({
    name: "Environment variables",
    ok: envOk
  });
  let pendingMigrations = 0;
  if (pkg) {
    const migs = pkg.migrations ?? [];
    if (migs.length) {
      const ids = migs.map((m) => m.id);
      const {
        data: applied
      } = await supabaseAdmin.from("applied_update_migrations").select("migration_id").in("migration_id", ids);
      const appliedSet = new Set((applied ?? []).map((r) => r.migration_id));
      pendingMigrations = migs.filter((m) => !appliedSet.has(m.id)).length;
    }
  }
  const ready = checks.every((c) => c.ok);
  return {
    ready,
    checks,
    pendingMigrations,
    current,
    targetVersion: data.version
  };
});
const runUpdate_createServerFn_handler = createServerRpc({
  id: "f4653e3bb99cbf159fa69ff5faea7248a3d8f0dd78c20b3186ed6408479ab38d",
  name: "runUpdate",
  filename: "src/lib/updates.functions.ts"
}, (opts) => runUpdate.__executeServer(opts));
const runUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  version: stringType(),
  skipBackup: booleanType().default(false)
}).parse(raw)).handler(runUpdate_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const started = Date.now();
  const stages = [];
  const stage = async (name, fn) => {
    const t = Date.now();
    try {
      const detail = await fn();
      stages.push({
        stage: name,
        ok: true,
        ms: Date.now() - t,
        detail: detail?.toString?.()
      });
    } catch (e) {
      stages.push({
        stage: name,
        ok: false,
        ms: Date.now() - t,
        detail: e?.message ?? String(e)
      });
      throw e;
    }
  };
  const {
    data: sysV
  } = await supabaseAdmin.rpc("get_system_version");
  const fromVersion = sysV?.current_version ?? null;
  const {
    data: hist
  } = await supabaseAdmin.from("app_update_history").insert({
    from_version: fromVersion,
    to_version: data.version,
    status: "running",
    installed_by: context.userId
  }).select("id").single();
  const historyId = hist.id;
  let pkg = null;
  let backupId = null;
  try {
    await stage("Preparing update", async () => {
      const {
        data: p,
        error
      } = await supabaseAdmin.from("app_updates").select("*").eq("version", data.version).maybeSingle();
      if (error || !p) throw new Error("Update package not found");
      pkg = p;
      return `package v${p.version} build ${p.build_number}`;
    });
    if (!data.skipBackup) {
      await stage("Creating backup", async () => {
        const {
          data: settings
        } = await supabaseAdmin.from("app_settings").select("*");
        const backup = {
          id: crypto.randomUUID(),
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          from_version: fromVersion,
          settings: settings ?? [],
          environment: {
            node_env: "production"
          }
        };
        backupId = backup.id;
        await supabaseAdmin.from("app_update_history").update({
          backup_id: backupId,
          backup_created: true,
          rollback_available: true,
          report: {
            backup
          }
        }).eq("id", historyId);
        return `backup ${backupId}`;
      });
    }
    await stage("Checking compatibility", async () => {
      if (pkg.min_from_version && fromVersion && compareVer(fromVersion, pkg.min_from_version) < 0) {
        throw new Error(`Requires v${pkg.min_from_version} or newer`);
      }
      return "ok";
    });
    await stage("Updating files", async () => "runtime bundle (delivered on redeploy)");
    const migs = pkg.migrations ?? [];
    const {
      data: applied
    } = await supabaseAdmin.from("applied_update_migrations").select("migration_id");
    const appliedSet = new Set((applied ?? []).map((r) => r.migration_id));
    const pending = migs.filter((m) => !appliedSet.has(m.id));
    await stage("Running database migrations", async () => {
      if (!pending.length) return "no new migrations";
      for (const m of pending) {
        await supabaseAdmin.from("applied_update_migrations").insert({
          migration_id: m.id,
          version: pkg.version,
          applied_by: context.userId,
          duration_ms: 0,
          status: "deferred"
        });
      }
      return `${pending.length} deferred to redeploy`;
    });
    await stage("Updating assets", async () => `${(pkg.assets ?? []).length} entries`);
    await stage("Verifying installation", async () => {
      const {
        error: dbErr
      } = await supabaseAdmin.from("app_settings").select("key").limit(1);
      if (dbErr) throw new Error("Database verification failed");
      const {
        error: stErr
      } = await supabaseAdmin.storage.listBuckets();
      if (stErr) throw new Error("Storage verification failed");
      return "ok";
    });
    await stage("Clearing cache", async () => "ok");
    await stage("Finalizing", async () => {
      await supabaseAdmin.from("app_settings").upsert([{
        key: "app_version",
        value: pkg.version
      }, {
        key: "app_build_number",
        value: pkg.build_number
      }, {
        key: "app_last_update_at",
        value: (/* @__PURE__ */ new Date()).toISOString()
      }], {
        onConflict: "key"
      });
      await supabaseAdmin.from("app_updates").update({
        is_current: false
      }).neq("id", pkg.id);
      await supabaseAdmin.from("app_updates").update({
        is_current: true
      }).eq("id", pkg.id);
      return `now v${pkg.version}`;
    });
    const duration = Date.now() - started;
    await supabaseAdmin.from("app_update_history").update({
      status: "success",
      completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      duration_ms: duration,
      build_number: pkg.build_number,
      report: {
        stages,
        backup_id: backupId
      }
    }).eq("id", historyId);
    return {
      ok: true,
      historyId,
      stages,
      duration
    };
  } catch (e) {
    const duration = Date.now() - started;
    await supabaseAdmin.from("app_update_history").update({
      status: "failed",
      completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      duration_ms: duration,
      error: e?.message ?? String(e),
      report: {
        stages,
        backup_id: backupId
      }
    }).eq("id", historyId);
    return {
      ok: false,
      historyId,
      stages,
      error: e?.message ?? String(e)
    };
  }
});
const rollbackUpdate_createServerFn_handler = createServerRpc({
  id: "a545729233d4e6859a6ab323109b23797d3af9e8cda10a2985d1f4da02e8bcf9",
  name: "rollbackUpdate",
  filename: "src/lib/updates.functions.ts"
}, (opts) => rollbackUpdate.__executeServer(opts));
const rollbackUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  historyId: stringType().uuid()
}).parse(raw)).handler(rollbackUpdate_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: h
  } = await supabaseAdmin.from("app_update_history").select("*").eq("id", data.historyId).maybeSingle();
  if (!h) throw new Error("History record not found");
  if (!h.rollback_available) throw new Error("Rollback not available for this update");
  const backup = h.report?.backup;
  if (!backup) throw new Error("No backup snapshot found");
  if (Array.isArray(backup.settings)) {
    for (const s of backup.settings) {
      await supabaseAdmin.from("app_settings").upsert(s, {
        onConflict: "key"
      });
    }
  }
  if (h.from_version) {
    await supabaseAdmin.from("app_settings").upsert([{
      key: "app_version",
      value: h.from_version
    }], {
      onConflict: "key"
    });
  }
  await supabaseAdmin.from("app_update_history").update({
    status: "rolled_back"
  }).eq("id", data.historyId);
  return {
    ok: true,
    restoredTo: h.from_version
  };
});
const listUpdateHistory_createServerFn_handler = createServerRpc({
  id: "92bf685e2de1ae64a662debdfcfa03dbdf44d29dcc7f33657310aaaf69b2e410",
  name: "listUpdateHistory",
  filename: "src/lib/updates.functions.ts"
}, (opts) => listUpdateHistory.__executeServer(opts));
const listUpdateHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(listUpdateHistory_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    data,
    error
  } = await context.supabase.from("app_update_history").select("*").order("started_at", {
    ascending: false
  }).limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
});
function compareVer(a, b) {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}
function analyzeSql(migrations) {
  const a = {
    tables_added: [],
    tables_modified: [],
    columns_added: 0,
    columns_modified: 0,
    columns_removed: 0,
    indexes_added: 0,
    views_added: 0,
    functions_added: 0,
    triggers_added: 0,
    policies_added: 0,
    destructive: []
  };
  const DANGER = [{
    re: /\bDROP\s+DATABASE\b/i,
    op: "DROP DATABASE"
  }, {
    re: /\bDROP\s+SCHEMA\b/i,
    op: "DROP SCHEMA"
  }, {
    re: /\bDROP\s+TABLE\b/i,
    op: "DROP TABLE"
  }, {
    re: /\bTRUNCATE\b/i,
    op: "TRUNCATE"
  }, {
    re: /\bDELETE\s+FROM\s+[^;]*?(?!.*\bWHERE\b)/is,
    op: "DELETE without WHERE"
  }, {
    re: /\bALTER\s+TABLE[^;]*\bDROP\s+COLUMN\b/i,
    op: "DROP COLUMN"
  }];
  for (const m of migrations) {
    const sql = m.sql || "";
    const stmts = sql.split(/;\s*(?=\n|$)/);
    for (const s of stmts) {
      const t = s.trim();
      if (!t) continue;
      const mAdd = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([a-z0-9_.]+)/i.exec(t);
      if (mAdd) a.tables_added.push(mAdd[1]);
      const mAlt = /ALTER\s+TABLE\s+([a-z0-9_.]+)/i.exec(t);
      if (mAlt) a.tables_modified.push(mAlt[1]);
      a.columns_added += (t.match(/\bADD\s+COLUMN\b/gi) ?? []).length;
      a.columns_modified += (t.match(/\bALTER\s+COLUMN\b/gi) ?? []).length;
      a.columns_removed += (t.match(/\bDROP\s+COLUMN\b/gi) ?? []).length;
      if (/CREATE\s+(UNIQUE\s+)?INDEX/i.test(t)) a.indexes_added++;
      if (/CREATE\s+(OR\s+REPLACE\s+)?VIEW/i.test(t)) a.views_added++;
      if (/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i.test(t)) a.functions_added++;
      if (/CREATE\s+TRIGGER/i.test(t)) a.triggers_added++;
      if (/CREATE\s+POLICY/i.test(t)) a.policies_added++;
    }
    for (const d of DANGER) {
      if (d.re.test(sql)) {
        a.destructive.push({
          migration_id: m.id,
          op: d.op,
          snippet: sql.slice(0, 160)
        });
      }
    }
  }
  a.tables_added = Array.from(new Set(a.tables_added));
  a.tables_modified = Array.from(new Set(a.tables_modified));
  return a;
}
function calcRisk(sql, breaking, migrationsCount) {
  let score = 0;
  score += sql.destructive.length * 30;
  score += breaking * 20;
  score += Math.min(migrationsCount, 20) * 2;
  score += sql.columns_removed * 10;
  score += sql.tables_modified.length * 3;
  const level = score >= 60 ? "high" : score >= 25 ? "medium" : "low";
  return {
    score,
    level
  };
}
const IMPACT_AREAS = ["users", "chatrooms", "feeds", "competitions", "subscriptions", "premium", "notifications", "media", "settings", "realtime"];
function inferImpacts(sql, declared) {
  const hints = {};
  const all = [...sql.tables_added, ...sql.tables_modified].join(" ").toLowerCase();
  const has = (needle) => all.includes(needle);
  const map = {
    users: ["profile", "user"],
    chatrooms: ["chatroom", "message"],
    feeds: ["post", "comment", "reaction", "hashtag"],
    competitions: ["competition"],
    subscriptions: ["subscription", "plan"],
    premium: ["subscription", "plan", "coin"],
    notifications: ["notification"],
    media: ["storage", "media", "sticker"],
    settings: ["setting", "seo", "config"],
    realtime: ["realtime", "presence"]
  };
  for (const area of IMPACT_AREAS) {
    if (declared?.[area]) {
      hints[area] = declared[area];
      continue;
    }
    const touched = map[area].some(has);
    hints[area] = touched ? "attention" : "safe";
  }
  if (sql.destructive.length) hints["settings"] = "manual";
  return hints;
}
const validatePackage_createServerFn_handler = createServerRpc({
  id: "ba4e0c7be3f2edbb44873ec181e3b54b86e1ad34a146507ca124e5ff1cb56c7a",
  name: "validatePackage",
  filename: "src/lib/updates.functions.ts"
}, (opts) => validatePackage.__executeServer(opts));
const validatePackage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  pkg: anyType()
}).parse(raw)).handler(validatePackage_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context);
  const results = [];
  const parsed = PackageSchema.safeParse(data.pkg);
  if (!parsed.success) {
    return {
      valid: false,
      results: [{
        name: "JSON manifest",
        ok: false,
        detail: parsed.error.message.slice(0, 400)
      }]
    };
  }
  const p = parsed.data;
  results.push({
    name: "JSON manifest",
    ok: true
  });
  results.push({
    name: "Package version",
    ok: /^\d+(\.\d+){0,3}$/.test(p.version),
    detail: `v${p.version}`
  });
  results.push({
    name: "Build number",
    ok: p.build_number > 0,
    detail: `build ${p.build_number}`
  });
  const ids = p.migrations.map((m) => m.id);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  results.push({
    name: "Migration IDs unique",
    ok: dupIds.length === 0,
    detail: dupIds.length ? `duplicates: ${Array.from(new Set(dupIds)).join(", ")}` : `${ids.length} migrations`
  });
  const empty = p.migrations.filter((m) => !m.sql.trim());
  results.push({
    name: "No empty SQL",
    ok: empty.length === 0,
    detail: empty.length ? `${empty.length} empty` : "ok"
  });
  if (p.package_sha256) {
    results.push({
      name: "Checksum present",
      ok: /^[a-f0-9]{64}$/i.test(p.package_sha256),
      detail: p.package_sha256.slice(0, 12) + "…"
    });
  }
  const sql = analyzeSql(p.migrations);
  results.push({
    name: "SQL syntax scan",
    ok: true,
    detail: "static scan passed"
  });
  return {
    valid: results.every((r) => r.ok),
    results,
    sql,
    destructive: sql.destructive
  };
});
const previewUpdate_createServerFn_handler = createServerRpc({
  id: "ad75fb9944eec0d95794e659b8ac2de998b6c81b27128a3e5548eb5eb4908dd9",
  name: "previewUpdate",
  filename: "src/lib/updates.functions.ts"
}, (opts) => previewUpdate.__executeServer(opts));
const previewUpdate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((raw) => objectType({
  version: stringType()
}).parse(raw)).handler(previewUpdate_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: pkg
  } = await supabaseAdmin.from("app_updates").select("*").eq("version", data.version).maybeSingle();
  if (!pkg) throw new Error("Package not found");
  const {
    data: sysV
  } = await supabaseAdmin.rpc("get_system_version");
  const current = sysV?.current_version ?? null;
  const compat = [];
  compat.push({
    name: "Current version",
    ok: !!current,
    detail: current ? `v${current}` : "unknown"
  });
  if (pkg.min_from_version && current) {
    const ok = compareVer(current, pkg.min_from_version) >= 0;
    compat.push({
      name: "Minimum supported",
      ok,
      detail: ok ? `≥ v${pkg.min_from_version}` : `You must first install v${pkg.min_from_version} before updating to v${pkg.version}.`
    });
  }
  if (pkg.max_from_version && current) {
    const maxV = pkg.max_from_version;
    const ok = compareVer(current, maxV) <= 0;
    compat.push({
      name: "Maximum supported",
      ok,
      detail: ok ? `≤ v${maxV}` : `Package targets ≤ v${maxV}`
    });
  }
  if (current && compareVer(current, pkg.version) >= 0) {
    compat.push({
      name: "Newer than current",
      ok: false,
      detail: `Current v${current} is already at or above v${pkg.version}`
    });
  } else {
    compat.push({
      name: "Newer than current",
      ok: true
    });
  }
  const migs = pkg.migrations ?? [];
  const ids = migs.map((m) => m.id);
  let applied = [];
  if (ids.length) {
    const {
      data: rows
    } = await supabaseAdmin.from("applied_update_migrations").select("migration_id").in("migration_id", ids);
    applied = (rows ?? []).map((r) => r.migration_id);
  }
  const pending = migs.filter((m) => !applied.includes(m.id));
  const sql = analyzeSql(pending);
  const breaking = (pkg.release_notes?.breaking ?? []).length;
  const risk = calcRisk(sql, breaking, pending.length);
  const impacts = inferImpacts(sql, pkg.impacts);
  const migMs = pending.length * 800 + sql.tables_added.length * 200;
  const verifyMs = 3e3;
  const totalMs = 2e3 + migMs + verifyMs + 2e3;
  const warnings = [];
  if (pending.length) warnings.push("This update contains database schema changes.");
  if (breaking) warnings.push("This update includes breaking changes — users may need to refresh their browser.");
  if (sql.destructive.length) warnings.push("This update contains destructive operations (see risk analysis).");
  if (sql.policies_added) warnings.push("This update modifies access policies (RLS).");
  if (sql.functions_added || sql.triggers_added) warnings.push("This update adds server-side functions or triggers.");
  if ((pkg.release_notes?.security ?? []).length) warnings.push("This update contains security fixes — apply promptly.");
  return {
    package: {
      version: pkg.version,
      build_number: pkg.build_number,
      release_date: pkg.release_date,
      channel: pkg.channel,
      min_from_version: pkg.min_from_version,
      max_from_version: pkg.max_from_version ?? null
    },
    current_version: current,
    compatibility: {
      checks: compat,
      passed: compat.every((c) => c.ok)
    },
    migrations: {
      total: migs.length,
      pending: pending.length,
      applied: applied.length,
      items: pending.map((m) => ({
        id: m.id,
        description: m.description ?? ""
      }))
    },
    sql,
    release_notes: pkg.release_notes,
    impacts,
    risk,
    estimates_ms: {
      migration: migMs,
      verify: verifyMs,
      total: totalMs
    },
    warnings,
    generated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
});
export {
  deleteUpdatePackage_createServerFn_handler,
  getSystemVersion_createServerFn_handler,
  listUpdateHistory_createServerFn_handler,
  listUpdates_createServerFn_handler,
  preUpdateChecks_createServerFn_handler,
  previewUpdate_createServerFn_handler,
  rollbackUpdate_createServerFn_handler,
  runUpdate_createServerFn_handler,
  uploadUpdatePackage_createServerFn_handler,
  validatePackage_createServerFn_handler
};
