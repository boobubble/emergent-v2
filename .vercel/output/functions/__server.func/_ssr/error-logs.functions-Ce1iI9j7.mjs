import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, n as numberType, b as booleanType, s as stringType } from "../_libs/zod.mjs";
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
async function getSupabaseAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin;
}
async function assertAdmin(userId) {
  const sb = await getSupabaseAdmin();
  const {
    data,
    error
  } = await sb.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: admin only");
}
const listSchema = objectType({
  q: stringType().optional(),
  severity: stringType().optional(),
  route: stringType().optional(),
  userId: stringType().uuid().optional(),
  unresolvedOnly: booleanType().optional(),
  limit: numberType().int().min(1).max(500).optional()
});
function errorLogsTable(sb) {
  return sb.from("client_error_logs");
}
const listClientErrorLogs_createServerFn_handler = createServerRpc({
  id: "628c9e3634fbc889e9b3fef4af2beb28ec95d70d3ddaeb7c72d90c7edb847d36",
  name: "listClientErrorLogs",
  filename: "src/lib/error-logs.functions.ts"
}, (opts) => listClientErrorLogs.__executeServer(opts));
const listClientErrorLogs = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => listSchema.parse(input ?? {})).handler(listClientErrorLogs_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const sb = await getSupabaseAdmin();
  let query = errorLogsTable(sb).select("*").order("created_at", {
    ascending: false
  }).limit(data.limit ?? 200);
  if (data.severity) query = query.eq("severity", data.severity);
  if (data.route) query = query.ilike("route", `%${data.route}%`);
  if (data.userId) query = query.eq("user_id", data.userId);
  if (data.unresolvedOnly) query = query.is("resolved_at", null);
  if (data.q) query = query.ilike("message", `%${data.q}%`);
  const {
    data: rows,
    error
  } = await query;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const resolveClientErrorLog_createServerFn_handler = createServerRpc({
  id: "a7503f40011204dcbc25e5638f167cd6bf992498c6faf25bd9175c9d770c90e1",
  name: "resolveClientErrorLog",
  filename: "src/lib/error-logs.functions.ts"
}, (opts) => resolveClientErrorLog.__executeServer(opts));
const resolveClientErrorLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(resolveClientErrorLog_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const sb = await getSupabaseAdmin();
  const {
    error
  } = await errorLogsTable(sb).update({
    resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
    resolved_by: context.userId
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteClientErrorLog_createServerFn_handler = createServerRpc({
  id: "f6f22a24aa17d1a34b9f66960b7af47ce6d1b888f6fcd1274fcb7f884bc9cdcb",
  name: "deleteClientErrorLog",
  filename: "src/lib/error-logs.functions.ts"
}, (opts) => deleteClientErrorLog.__executeServer(opts));
const deleteClientErrorLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(deleteClientErrorLog_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const sb = await getSupabaseAdmin();
  const {
    error
  } = await errorLogsTable(sb).delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const exportClientErrorLogsCsv_createServerFn_handler = createServerRpc({
  id: "a628f26ef7cf86ea5c08a819549f703e6b48f6af100c9d20a581bc1aed70f5e0",
  name: "exportClientErrorLogsCsv",
  filename: "src/lib/error-logs.functions.ts"
}, (opts) => exportClientErrorLogsCsv.__executeServer(opts));
const exportClientErrorLogsCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => listSchema.parse(input ?? {})).handler(exportClientErrorLogsCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const sb = await getSupabaseAdmin();
  const {
    data: rows,
    error
  } = await errorLogsTable(sb).select("*").order("created_at", {
    ascending: false
  }).limit(data.limit ?? 1e3);
  if (error) throw new Error(error.message);
  const list = rows ?? [];
  const header = ["created_at", "severity", "route", "user_id", "message", "browser", "os", "device", "app_version"];
  const lines = [header.join(",")];
  for (const r of list) {
    lines.push([r.created_at, r.severity, r.route ?? "", r.user_id ?? "", `"${(r.message ?? "").replace(/"/g, '""')}"`, r.browser ?? "", r.os ?? "", r.device ?? "", r.app_version ?? ""].join(","));
  }
  return {
    csv: lines.join("\n")
  };
});
export {
  deleteClientErrorLog_createServerFn_handler,
  exportClientErrorLogsCsv_createServerFn_handler,
  listClientErrorLogs_createServerFn_handler,
  resolveClientErrorLog_createServerFn_handler
};
