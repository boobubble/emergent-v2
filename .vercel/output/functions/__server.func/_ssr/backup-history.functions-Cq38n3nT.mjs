import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, n as numberType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
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
  } = await context.supabase.rpc("is_admin", {
    _user_id: context.userId
  });
  if (!ok) throw new Error("Forbidden");
}
function computeExpiry(retention) {
  if (!retention || retention === "forever") return null;
  const days = retention === "7d" ? 7 : retention === "30d" ? 30 : retention === "90d" ? 90 : null;
  if (!days) return null;
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
const recordSchema = objectType({
  filename: stringType().min(1).max(256),
  backup_type: enumType(["full", "quick", "media", "database"]).default("full"),
  size_bytes: numberType().int().nonnegative(),
  sha256: stringType().nullable().optional(),
  md5: stringType().nullable().optional(),
  verified: booleanType().default(false),
  encrypted: booleanType().default(false),
  app_version: stringType().nullable().optional(),
  total_tables: numberType().int().nullable().optional(),
  total_rows: numberType().int().nullable().optional(),
  media_files: numberType().int().nullable().optional(),
  notes: stringType().nullable().optional()
});
const recordBackupHistory_createServerFn_handler = createServerRpc({
  id: "c8dc05908bcfafe8309c06d116f0850bc89691661a0a3dbf6293c27266b995c8",
  name: "recordBackupHistory",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => recordBackupHistory.__executeServer(opts));
const recordBackupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => recordSchema.parse(d)).handler(recordBackupHistory_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  let retention = null;
  try {
    const {
      data: row
    } = await context.supabase.from("app_settings").select("value").eq("key", "backup_retention").maybeSingle();
    retention = row?.value ?? "30d";
    if (typeof retention !== "string") retention = JSON.stringify(retention).replace(/"/g, "");
  } catch {
    retention = "30d";
  }
  const expires_at = computeExpiry(retention);
  const {
    data: inserted,
    error
  } = await context.supabase.from("backup_history").insert({
    ...data,
    generated_by: context.userId,
    expires_at
  }).select("*").single();
  if (error) throw new Error(error.message);
  return inserted;
});
const listBackupHistory_createServerFn_handler = createServerRpc({
  id: "84c1c984ec18ade458ddcf3fc515f06af8a31fda847820478b950d58071edde3",
  name: "listBackupHistory",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => listBackupHistory.__executeServer(opts));
const listBackupHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(listBackupHistory_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    data,
    error
  } = await context.supabase.from("backup_history").select("*").order("generated_at", {
    ascending: false
  }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const deleteBackupHistory_createServerFn_handler = createServerRpc({
  id: "d6674633d78fc58660389116c1363ccf2c0db8459a5d2b2130f55f06a4552e6c",
  name: "deleteBackupHistory",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => deleteBackupHistory.__executeServer(opts));
const deleteBackupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteBackupHistory_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const {
    error
  } = await context.supabase.from("backup_history").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const markBackupVerified_createServerFn_handler = createServerRpc({
  id: "bd4924d1cd3a76392b82aaabb72738c280150427f254c19b1d8a0dfb6c0b31a3",
  name: "markBackupVerified",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => markBackupVerified.__executeServer(opts));
const markBackupVerified = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  verified: booleanType()
}).parse(d)).handler(markBackupVerified_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const {
    error
  } = await context.supabase.from("backup_history").update({
    verified: data.verified
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const markRestoreTested_createServerFn_handler = createServerRpc({
  id: "ecb7070c1281ba5545a77ec6769683758473aaf767b8abeae0658c2bea8d8718",
  name: "markRestoreTested",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => markRestoreTested.__executeServer(opts));
const markRestoreTested = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(markRestoreTested_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const {
    error
  } = await context.supabase.from("backup_history").update({
    last_restore_test_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getBackupRetention_createServerFn_handler = createServerRpc({
  id: "06688e981e347ab9968209b0aae4076a21dceb03f6c24ee56703a5ec7ba910cb",
  name: "getBackupRetention",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => getBackupRetention.__executeServer(opts));
const getBackupRetention = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getBackupRetention_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    data
  } = await context.supabase.from("app_settings").select("value").eq("key", "backup_retention").maybeSingle();
  const val = data?.value ?? "30d";
  return typeof val === "string" ? val : String(val);
});
const setBackupRetention_createServerFn_handler = createServerRpc({
  id: "bdf7bd93a27cc988cfb6bb523baf2c9b02b0f384b7d33a4045d410dad142720d",
  name: "setBackupRetention",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => setBackupRetention.__executeServer(opts));
const setBackupRetention = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  value: enumType(["7d", "30d", "90d", "forever"])
}).parse(d)).handler(setBackupRetention_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const {
    error
  } = await context.supabase.from("app_settings").upsert({
    key: "backup_retention",
    value: data.value
  }, {
    onConflict: "key"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getBackupHealth_createServerFn_handler = createServerRpc({
  id: "291a678cfd50827d0397c8fe1376c68e18533b588a3dea6974f352630e2ad99a",
  name: "getBackupHealth",
  filename: "src/lib/backup-history.functions.ts"
}, (opts) => getBackupHealth.__executeServer(opts));
const getBackupHealth = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getBackupHealth_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const [{
    data: latest
  }, tables, dbSize] = await Promise.all([context.supabase.from("backup_history").select("*").order("generated_at", {
    ascending: false
  }).limit(1).maybeSingle(), context.supabase.rpc("admin_list_public_tables"), context.supabase.rpc("admin_db_size")]);
  return {
    latest: latest ?? null,
    table_count: Array.isArray(tables.data) ? tables.data.length : 0,
    db_size_bytes: dbSize.data ?? 0
  };
});
export {
  deleteBackupHistory_createServerFn_handler,
  getBackupHealth_createServerFn_handler,
  getBackupRetention_createServerFn_handler,
  listBackupHistory_createServerFn_handler,
  markBackupVerified_createServerFn_handler,
  markRestoreTested_createServerFn_handler,
  recordBackupHistory_createServerFn_handler,
  setBackupRetention_createServerFn_handler
};
