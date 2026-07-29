import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
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
const listAuditLogs_createServerFn_handler = createServerRpc({
  id: "642a8c7dd9e36df96c5aacd4d5f7ee5edf0944a1925e9e8cbf2546cb7da210aa",
  name: "listAuditLogs",
  filename: "src/routes/admin.audit-logs.tsx"
}, (opts) => listAuditLogs.__executeServer(opts));
const listAuditLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAuditLogs_createServerFn_handler, async () => {
  const supabaseAdmin = await getSupabaseAdmin();
  const {
    data,
    error
  } = await supabaseAdmin.from("mod_logs").select("id, actor_id, action, target_type, target_id, payload, created_at").order("created_at", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});
export {
  listAuditLogs_createServerFn_handler
};
