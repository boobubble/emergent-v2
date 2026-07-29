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
const MIN_PG_MAJOR = 14;
const getSystemCompatibility_createServerFn_handler = createServerRpc({
  id: "12043de90bd0885d7df95c87b43c38e5ed14b9a799132b9fed8cf5e9a521f6f1",
  name: "getSystemCompatibility",
  filename: "src/lib/system-compatibility.functions.ts"
}, (opts) => getSystemCompatibility.__executeServer(opts));
const getSystemCompatibility = createServerFn({
  method: "POST"
}).middleware([withRateLimit("api")]).handler(getSystemCompatibility_createServerFn_handler, async () => {
  const {
    assertInstallerAllowed
  } = await import("./installer-guard.server-mwuhcPGS.mjs");
  await assertInstallerAllowed();
  const checks = [];
  let postgresVersion;
  let postgresMajor;
  let projectStatus;
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    checks.push({
      key: "pg_version",
      label: "PostgreSQL Version",
      state: "unknown",
      detail: "SUPABASE_DB_URL not set — cannot query server version.",
      fix: "Add SUPABASE_DB_URL from Supabase → Project Settings → Database."
    });
  } else {
    try {
      const {
        default: postgres
      } = await import("../_libs/postgres.mjs");
      const sql = postgres(dbUrl, {
        ssl: "require",
        prepare: false,
        max: 1,
        idle_timeout: 5,
        connect_timeout: 8
      });
      try {
        const rows = await sql`
            SELECT version() as v, current_setting('server_version') as setting
          `;
        postgresVersion = String(rows[0]?.v ?? "");
        const setting = String(rows[0]?.setting ?? "");
        const m = setting.match(/^(\d+)/);
        postgresMajor = m ? Number(m[1]) : void 0;
        if (postgresMajor && postgresMajor >= MIN_PG_MAJOR) {
          checks.push({
            key: "pg_version",
            label: "PostgreSQL Version",
            state: "ok",
            detail: `PostgreSQL ${setting} (>= ${MIN_PG_MAJOR} required)`
          });
        } else {
          checks.push({
            key: "pg_version",
            label: "PostgreSQL Version",
            state: "warn",
            detail: `PostgreSQL ${setting || "unknown"} — recommended ${MIN_PG_MAJOR}+`,
            fix: "Upgrade your Supabase project to PostgreSQL 14 or newer."
          });
        }
      } finally {
        await sql.end({
          timeout: 3
        });
      }
    } catch (e) {
      checks.push({
        key: "pg_version",
        label: "PostgreSQL Version",
        state: "fail",
        detail: e instanceof Error ? e.message : "Unable to query PostgreSQL",
        fix: "Verify SUPABASE_DB_URL host, password and that the database is reachable."
      });
    }
  }
  if (!url || !anon) {
    checks.push({
      key: "project_status",
      label: "Supabase Project Status",
      state: "fail",
      detail: "SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY missing.",
      fix: "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in your environment."
    });
  } else {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6e3);
      const r = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`
        },
        signal: controller.signal
      });
      clearTimeout(timer);
      projectStatus = `HTTP ${r.status}`;
      if (r.ok || r.status === 404) {
        checks.push({
          key: "project_status",
          label: "Supabase Project Status",
          state: "ok",
          detail: `Reachable (${projectStatus})`
        });
      } else {
        checks.push({
          key: "project_status",
          label: "Supabase Project Status",
          state: "warn",
          detail: `Unexpected response ${projectStatus}`,
          fix: "Confirm the project is not paused and the URL/key match."
        });
      }
    } catch (e) {
      checks.push({
        key: "project_status",
        label: "Supabase Project Status",
        state: "fail",
        detail: e instanceof Error ? e.message : "Project unreachable",
        fix: "Check network egress and that your Supabase project is not paused."
      });
    }
  }
  if (!url || !service) {
    checks.push({
      key: "storage",
      label: "Storage Availability",
      state: service ? "warn" : "unknown",
      detail: "Requires SUPABASE_SERVICE_ROLE_KEY to list buckets.",
      fix: "Add SUPABASE_SERVICE_ROLE_KEY to enable full storage checks."
    });
  } else {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6e3);
      const r = await fetch(`${url}/storage/v1/bucket`, {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`
        },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (r.ok) {
        const buckets = await r.json();
        checks.push({
          key: "storage",
          label: "Storage Availability",
          state: "ok",
          detail: `${Array.isArray(buckets) ? buckets.length : 0} bucket(s) available`
        });
      } else {
        checks.push({
          key: "storage",
          label: "Storage Availability",
          state: "warn",
          detail: `Storage API returned HTTP ${r.status}`,
          fix: "Verify service role key and that Storage is enabled for this project."
        });
      }
    } catch (e) {
      checks.push({
        key: "storage",
        label: "Storage Availability",
        state: "fail",
        detail: e instanceof Error ? e.message : "Storage API unreachable",
        fix: "Storage endpoint could not be reached — check network and project status."
      });
    }
  }
  if (!url || !anon) {
    checks.push({
      key: "auth",
      label: "Authentication Enabled",
      state: "fail",
      detail: "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY.",
      fix: "Set both env vars to reach the Auth service."
    });
  } else {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6e3);
      const r = await fetch(`${url}/auth/v1/settings`, {
        headers: {
          apikey: anon
        },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (r.ok) {
        const settings = await r.json();
        const providers = Object.entries(settings?.external ?? {}).filter(([, v]) => v).map(([k]) => k);
        const emailOn = settings?.external?.email !== false;
        checks.push({
          key: "auth",
          label: "Authentication Enabled",
          state: "ok",
          detail: `Auth online — providers: ${[emailOn ? "email" : null, ...providers].filter(Boolean).join(", ") || "email"}`
        });
      } else {
        checks.push({
          key: "auth",
          label: "Authentication Enabled",
          state: "warn",
          detail: `Auth service returned HTTP ${r.status}`,
          fix: "Enable Auth in Supabase → Authentication and confirm the anon key is correct."
        });
      }
    } catch (e) {
      checks.push({
        key: "auth",
        label: "Authentication Enabled",
        state: "fail",
        detail: e instanceof Error ? e.message : "Auth API unreachable",
        fix: "Auth endpoint not reachable — check network and that Auth is enabled."
      });
    }
  }
  if (!url || !anon) {
    checks.push({
      key: "realtime",
      label: "Realtime Enabled",
      state: "fail",
      detail: "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY."
    });
  } else {
    try {
      const wsUrl = url.replace(/^http/, "ws") + `/realtime/v1/websocket?apikey=${anon}&vsn=1.0.0`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6e3);
      const r = await fetch(`${url}/realtime/v1/api/tenants/health`, {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`
        },
        signal: controller.signal
      }).catch(() => null);
      clearTimeout(timer);
      if (r && (r.ok || r.status === 404 || r.status === 401)) {
        checks.push({
          key: "realtime",
          label: "Realtime Enabled",
          state: "ok",
          detail: `Realtime service reachable (${wsUrl.split("?")[0]})`
        });
      } else {
        checks.push({
          key: "realtime",
          label: "Realtime Enabled",
          state: "warn",
          detail: r ? `Realtime returned HTTP ${r.status}` : "Realtime endpoint not responding",
          fix: "Enable Realtime in Supabase → Database → Replication."
        });
      }
    } catch (e) {
      checks.push({
        key: "realtime",
        label: "Realtime Enabled",
        state: "fail",
        detail: e instanceof Error ? e.message : "Realtime unreachable"
      });
    }
  }
  const ok = checks.every((c) => c.state === "ok" || c.state === "warn");
  return {
    ok,
    checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
    postgresVersion,
    postgresMajor,
    projectStatus,
    checks
  };
});
export {
  getSystemCompatibility_createServerFn_handler
};
