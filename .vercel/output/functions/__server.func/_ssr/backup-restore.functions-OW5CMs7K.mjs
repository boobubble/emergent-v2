import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, e as enumType, s as stringType } from "../_libs/zod.mjs";
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
function splitSqlStatements(sql) {
  const out = [];
  let buf = "";
  let i = 0;
  let inSingle = false;
  let dollarTag = null;
  while (i < sql.length) {
    const ch = sql[i];
    const next2 = sql.substr(i, 2);
    if (!inSingle && !dollarTag && next2 === "--") {
      const eol = sql.indexOf("\n", i);
      const stop = eol === -1 ? sql.length : eol;
      buf += sql.slice(i, stop);
      i = stop;
      continue;
    }
    if (!inSingle) {
      const m = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        const tag = m[0];
        if (dollarTag === null) dollarTag = tag;
        else if (dollarTag === tag) dollarTag = null;
        buf += tag;
        i += tag.length;
        continue;
      }
    }
    if (!dollarTag && ch === "'") {
      inSingle = !inSingle;
      buf += ch;
      i++;
      continue;
    }
    if (!inSingle && !dollarTag && ch === ";") {
      const stmt = buf.trim();
      if (stmt) out.push(stmt);
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}
const restoreDatabaseSql_createServerFn_handler = createServerRpc({
  id: "b18caa2d5b824c8d828677e32ac57d2ed5a92937cfa661e6ae35b0c470847c41",
  name: "restoreDatabaseSql",
  filename: "src/lib/backup-restore.functions.ts"
}, (opts) => restoreDatabaseSql.__executeServer(opts));
const restoreDatabaseSql = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  sql: stringType().min(1).max(5e7),
  phase: enumType(["schema", "data", "full"]).default("full")
}).parse(d)).handler(restoreDatabaseSql_createServerFn_handler, async ({
  context,
  data
}) => {
  await requireAdmin(context);
  const stmts = splitSqlStatements(data.sql);
  let ok = 0;
  let failed = 0;
  const errors = [];
  for (const stmt of stmts) {
    const {
      error
    } = await context.supabase.rpc("admin_exec_sql", {
      _sql: stmt
    });
    if (error) {
      failed++;
      if (errors.length < 25) errors.push({
        stmt: stmt.slice(0, 160),
        message: error.message
      });
    } else {
      ok++;
    }
  }
  return {
    ok,
    failed,
    total: stmts.length,
    errors
  };
});
const getStorageBucketNames_createServerFn_handler = createServerRpc({
  id: "93633134f8394cd35a65e0685728d5cb9bd1d2ec15bbaaf2b11dd4844e8b5c08",
  name: "getStorageBucketNames",
  filename: "src/lib/backup-restore.functions.ts"
}, (opts) => getStorageBucketNames.__executeServer(opts));
const getStorageBucketNames = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getStorageBucketNames_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data
  } = await supabaseAdmin.storage.listBuckets();
  return (data ?? []).map((b) => b.name);
});
const purgeExpiredBackups_createServerFn_handler = createServerRpc({
  id: "9f3abf6627e7d9dd682a8e0b57b8b77cf6d314ab2262f83da9f7b86f11ce1aaf",
  name: "purgeExpiredBackups",
  filename: "src/lib/backup-restore.functions.ts"
}, (opts) => purgeExpiredBackups.__executeServer(opts));
const purgeExpiredBackups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(purgeExpiredBackups_createServerFn_handler, async ({
  context
}) => {
  await requireAdmin(context);
  const {
    data,
    error
  } = await context.supabase.rpc("backup_history_purge_expired");
  if (error) throw new Error(error.message);
  return {
    removed: data ?? 0
  };
});
export {
  getStorageBucketNames_createServerFn_handler,
  purgeExpiredBackups_createServerFn_handler,
  restoreDatabaseSql_createServerFn_handler
};
