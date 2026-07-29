import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { d as getRequest } from "./server-DxoLgaf4.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
async function isInstalled() {
  try {
    const { supabaseAdmin } = await import("./client.server-BXCYxJZY.mjs");
    const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", "installer").maybeSingle();
    const v = data?.value ?? null;
    return !!v?.installed;
  } catch {
    return false;
  }
}
async function currentUserIsSuperAdmin() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return false;
  const req = getRequest();
  const authHeader = req?.headers?.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return false;
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: void 0, persistSession: false, autoRefreshToken: false }
  });
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) return false;
  const { data: hasRole } = await supabase.rpc("has_role", {
    _user_id: userRes.user.id,
    _role: "super_admin"
  });
  return !!hasRole;
}
async function assertInstallerAllowed() {
  const installed = await isInstalled();
  if (!installed) return;
  const ok = await currentUserIsSuperAdmin();
  if (!ok) {
    throw new Response("Unauthorized: installer endpoints require super admin after installation", {
      status: 401
    });
  }
}
function assertDestructiveInstallerAllowed() {
  if (process.env.INSTALLER_RESET_ALLOWED !== "true") {
    throw new Response(
      "Refusing to run destructive installer operation: set INSTALLER_RESET_ALLOWED=true on the server to enable.",
      { status: 403 }
    );
  }
}
export {
  assertDestructiveInstallerAllowed,
  assertInstallerAllowed
};
