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
const createDemoAccount_createServerFn_handler = createServerRpc({
  id: "7ea6da22137390aa84848285aebdd04758001e4f38880c63ea02a67c0adffb01",
  name: "createDemoAccount",
  filename: "src/lib/demo-account.functions.ts"
}, (opts) => createDemoAccount.__executeServer(opts));
const createDemoAccount = createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).handler(createDemoAccount_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `demo+${rand}@palrgo.test`;
  const password = `Demo-${rand}-${Math.random().toString(36).slice(2, 8)}`;
  const username = `demo${rand}`;
  const {
    data: created,
    error: createErr
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      gender: "other",
      is_demo: true
    }
  });
  if (createErr || !created.user) {
    throw new Error(createErr?.message || "Could not create demo account");
  }
  const userId = created.user.id;
  let profileReady = false;
  for (let i = 0; i < 20; i++) {
    const {
      data
    } = await supabaseAdmin.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (data) {
      profileReady = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  if (profileReady) {
    await supabaseAdmin.from("profiles").update({
      coins: 1e3,
      bio: "👋 Demo account — exploring all the features!"
    }).eq("id", userId);
  }
  return {
    email,
    password,
    username
  };
});
const deleteDemoAccount_createServerFn_handler = createServerRpc({
  id: "99aab36e2ba5d7f93a6983476a5c7a80f5e9a9df8f8cbf6775d12e52a1ec0eec",
  name: "deleteDemoAccount",
  filename: "src/lib/demo-account.functions.ts"
}, (opts) => deleteDemoAccount.__executeServer(opts));
const deleteDemoAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("auth.write")]).handler(deleteDemoAccount_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: userRes,
    error: gErr
  } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (gErr || !userRes?.user) throw new Error("User not found");
  const u = userRes.user;
  const meta = u.user_metadata ?? {};
  const isDemoFlag = meta.is_demo === true;
  const emailOk = typeof u.email === "string" && /^demo\+[a-z0-9]+@palrgo\.test$/i.test(u.email);
  const notAnon = u.is_anonymous !== true;
  const {
    count: roleCount,
    error: roleErr
  } = await supabaseAdmin.from("user_roles").select("user_id", {
    count: "exact",
    head: true
  }).eq("user_id", userId);
  if (roleErr) throw new Error(roleErr.message);
  const hasNoRoles = (roleCount ?? 0) === 0;
  if (!isDemoFlag || !emailOk || !notAnon || !hasNoRoles) {
    throw new Error("Refusing to delete: account does not match demo profile");
  }
  const {
    error: rpcErr
  } = await supabaseAdmin.rpc("delete_user_cascade", {
    _user: userId
  });
  if (rpcErr) throw new Error(rpcErr.message);
  const {
    error: dErr
  } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (dErr) throw new Error(dErr.message);
  return {
    ok: true
  };
});
export {
  createDemoAccount_createServerFn_handler,
  deleteDemoAccount_createServerFn_handler
};
