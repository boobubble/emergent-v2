import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
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
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROLE_RANK = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3
};
function dmChannelFor(meId, peerId) {
  return "dm:" + [meId, peerId].sort().join(":");
}
const deleteMyAccount_createServerFn_handler = createServerRpc({
  id: "20ce7016302de886fab72937295f2b261c82e5786ab6858aa65211a9e0c37947",
  name: "deleteMyAccount",
  filename: "src/lib/account-dm.functions.ts"
}, (opts) => deleteMyAccount.__executeServer(opts));
const deleteMyAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).handler(deleteMyAccount_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: roles
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if ((roles ?? []).some((r) => r.role === "super_admin")) {
    throw new Error("Super admins cannot self-delete. Ask another super admin.");
  }
  const {
    error: cascadeErr
  } = await supabaseAdmin.rpc("delete_user_cascade", {
    _user: userId
  });
  if (cascadeErr) throw new Error(cascadeErr.message);
  const {
    error: dErr
  } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (dErr) throw new Error(dErr.message);
  return {
    ok: true
  };
});
const deleteMyDmConversation_createServerFn_handler = createServerRpc({
  id: "2e996b1c8a635b2e8b950f6e186323fb86f196cb2e52d9129afffb636f1645d3",
  name: "deleteMyDmConversation",
  filename: "src/lib/account-dm.functions.ts"
}, (opts) => deleteMyDmConversation.__executeServer(opts));
const deleteMyDmConversation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => {
  if (!input || typeof input.peerId !== "string" || !UUID_RE.test(input.peerId)) {
    throw new Error("Invalid peer id");
  }
  return {
    peerId: input.peerId
  };
}).handler(deleteMyDmConversation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: setting
  } = await supabaseAdmin.from("app_settings").select("value").eq("key", "dm_chat_delete").maybeSingle();
  const minRoleRaw = setting?.value?.min_role ?? "user";
  const minRank = ROLE_RANK[minRoleRaw] ?? 0;
  const {
    data: roles
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const myRank = (roles ?? []).reduce((acc, r) => Math.max(acc, ROLE_RANK[r.role] ?? 0), 0);
  if (myRank < minRank) {
    throw new Error("You don't have permission to delete DM chats.");
  }
  const channelId = dmChannelFor(userId, data.peerId);
  const {
    error: mErr
  } = await supabaseAdmin.from("messages").delete().eq("channel_id", channelId);
  if (mErr) throw new Error(mErr.message);
  await supabaseAdmin.from("dm_reads").delete().eq("channel_id", channelId);
  return {
    ok: true,
    channelId
  };
});
export {
  deleteMyAccount_createServerFn_handler,
  deleteMyDmConversation_createServerFn_handler
};
