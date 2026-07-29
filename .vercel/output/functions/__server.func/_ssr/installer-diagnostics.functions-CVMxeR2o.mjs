import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
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
function friendly(err) {
  const m = err instanceof Error ? err.message : String(err ?? "unknown error");
  if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return "Unable to connect to the database. Please verify your SUPABASE_DB_URL host.";
  if (/password authentication failed/i.test(m)) return "Database password rejected — please check the password inside SUPABASE_DB_URL.";
  if (/no pg_hba/i.test(m)) return "This host is not allowed to connect. Use the pooler URL (port 6543) or allow this IP in Supabase.";
  if (/SSL/i.test(m) && /required/i.test(m)) return "SSL is required — append `?sslmode=require` to SUPABASE_DB_URL.";
  if (/ETIMEDOUT|ECONNREFUSED/i.test(m)) return "Cannot reach the database (timeout). Check SUPABASE_DB_URL and your network.";
  return "Unable to connect to the database. Please verify your SUPABASE_DB_URL.";
}
const getEnvValidation_createServerFn_handler = createServerRpc({
  id: "33346c472edebcb0648b8dcb6f549014c4a74bef6334b8a06e893f8b32cae9d9",
  name: "getEnvValidation",
  filename: "src/lib/installer-diagnostics.functions.ts"
}, (opts) => getEnvValidation.__executeServer(opts));
const getEnvValidation = createServerFn({
  method: "GET"
}).handler(getEnvValidation_createServerFn_handler, async () => {
  const {
    assertInstallerAllowed
  } = await import("./installer-guard.server-mwuhcPGS.mjs");
  await assertInstallerAllowed();
  const defs = [{
    name: "SUPABASE_URL",
    required: true,
    hint: "Your Supabase project URL"
  }, {
    name: "SUPABASE_PUBLISHABLE_KEY",
    required: true,
    hint: "Anon / publishable key"
  }, {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    hint: "Secret service-role key (server only)"
  }, {
    name: "SUPABASE_DB_URL",
    required: true,
    hint: "Postgres URI (Project Settings → Database → Connection string)"
  }, {
    name: "SITE_URL",
    required: false,
    hint: "Public URL of your site (used for emails/links)"
  }];
  const vars = defs.map((d) => ({
    name: d.name,
    required: d.required,
    hint: d.hint,
    present: !!process.env[d.name]
  }));
  return {
    ok: vars.every((v) => !v.required || v.present),
    vars
  };
});
const testDatabaseConnection_createServerFn_handler = createServerRpc({
  id: "abea224403a1795ed57c910fdd98c994f19a9c502a68ef3646e031ae1ef98cf7",
  name: "testDatabaseConnection",
  filename: "src/lib/installer-diagnostics.functions.ts"
}, (opts) => testDatabaseConnection.__executeServer(opts));
const testDatabaseConnection = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).handler(testDatabaseConnection_createServerFn_handler, async () => {
  const {
    assertInstallerAllowed
  } = await import("./installer-guard.server-mwuhcPGS.mjs");
  await assertInstallerAllowed();
  if (!process.env.SUPABASE_DB_URL) {
    return {
      ok: false,
      reachable: false,
      authenticated: false,
      ssl: false,
      friendlyError: "SUPABASE_DB_URL is not set. Add it to your environment and retry."
    };
  }
  const start = Date.now();
  try {
    const {
      default: postgres
    } = await import("../_libs/postgres.mjs");
    const sql = postgres(process.env.SUPABASE_DB_URL, {
      ssl: "require",
      prepare: false,
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10
    });
    try {
      const rows = await sql`SELECT version() as v, current_database() as db`;
      const version = String(rows[0]?.v ?? "");
      return {
        ok: true,
        reachable: true,
        authenticated: true,
        ssl: true,
        serverVersion: version.split(" on ")[0] || version,
        latencyMs: Date.now() - start
      };
    } finally {
      await sql.end({
        timeout: 3
      });
    }
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      reachable: !/ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNREFUSED/i.test(raw),
      authenticated: !/password authentication failed/i.test(raw),
      ssl: !/SSL/i.test(raw),
      friendlyError: friendly(e)
    };
  }
});
export {
  getEnvValidation_createServerFn_handler,
  testDatabaseConnection_createServerFn_handler
};
