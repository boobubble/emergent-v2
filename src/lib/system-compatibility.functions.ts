/**
 * Pre-installation System Compatibility probe.
 * Read-only checks: Postgres version, Supabase project status, Storage, Auth, Realtime.
 * Does not touch bootstrap or migration logic.
 */
import { createServerFn } from "@tanstack/react-start";
import { withRateLimit } from "./rate-limit-middleware";

export type CompatState = "ok" | "warn" | "fail" | "unknown";

export interface CompatCheck {
  key: string;
  label: string;
  state: CompatState;
  detail: string;
  fix?: string;
}

export interface SystemCompatibility {
  ok: boolean;
  checkedAt: string;
  postgresVersion?: string;
  postgresMajor?: number;
  projectStatus?: string;
  checks: CompatCheck[];
}

const MIN_PG_MAJOR = 14;

export const getSystemCompatibility = createServerFn({ method: "POST" }).middleware([withRateLimit("api")]).handler(
  async (): Promise<SystemCompatibility> => {
    const { assertInstallerAllowed } = await import("./installer-guard.server");
    await assertInstallerAllowed();
    const checks: CompatCheck[] = [];
    let postgresVersion: string | undefined;
    let postgresMajor: number | undefined;
    let projectStatus: string | undefined;

    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const dbUrl = process.env.SUPABASE_DB_URL;

    // ---- Postgres version (needs SUPABASE_DB_URL) ----
    if (!dbUrl) {
      checks.push({
        key: "pg_version",
        label: "PostgreSQL Version",
        state: "unknown",
        detail: "SUPABASE_DB_URL not set — cannot query server version.",
        fix: "Add SUPABASE_DB_URL from Supabase → Project Settings → Database.",
      });
    } else {
      try {
        const { default: postgres } = await import("postgres");
        const sql = postgres(dbUrl, {
          ssl: "require",
          prepare: false,
          max: 1,
          idle_timeout: 5,
          connect_timeout: 8,
        });
        try {
          const rows = await sql<{ v: string; setting: string }[]>`
            SELECT version() as v, current_setting('server_version') as setting
          `;
          postgresVersion = String(rows[0]?.v ?? "");
          const setting = String(rows[0]?.setting ?? "");
          const m = setting.match(/^(\d+)/);
          postgresMajor = m ? Number(m[1]) : undefined;
          if (postgresMajor && postgresMajor >= MIN_PG_MAJOR) {
            checks.push({
              key: "pg_version",
              label: "PostgreSQL Version",
              state: "ok",
              detail: `PostgreSQL ${setting} (>= ${MIN_PG_MAJOR} required)`,
            });
          } else {
            checks.push({
              key: "pg_version",
              label: "PostgreSQL Version",
              state: "warn",
              detail: `PostgreSQL ${setting || "unknown"} — recommended ${MIN_PG_MAJOR}+`,
              fix: "Upgrade your Supabase project to PostgreSQL 14 or newer.",
            });
          }
        } finally {
          await sql.end({ timeout: 3 });
        }
      } catch (e) {
        checks.push({
          key: "pg_version",
          label: "PostgreSQL Version",
          state: "fail",
          detail: e instanceof Error ? e.message : "Unable to query PostgreSQL",
          fix: "Verify SUPABASE_DB_URL host, password and that the database is reachable.",
        });
      }
    }

    // ---- Supabase project status (REST ping) ----
    if (!url || !anon) {
      checks.push({
        key: "project_status",
        label: "Supabase Project Status",
        state: "fail",
        detail: "SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY missing.",
        fix: "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in your environment.",
      });
    } else {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const r = await fetch(`${url}/rest/v1/`, {
          headers: { apikey: anon, Authorization: `Bearer ${anon}` },
          signal: controller.signal,
        });
        clearTimeout(timer);
        projectStatus = `HTTP ${r.status}`;
        if (r.ok || r.status === 404) {
          checks.push({
            key: "project_status",
            label: "Supabase Project Status",
            state: "ok",
            detail: `Reachable (${projectStatus})`,
          });
        } else {
          checks.push({
            key: "project_status",
            label: "Supabase Project Status",
            state: "warn",
            detail: `Unexpected response ${projectStatus}`,
            fix: "Confirm the project is not paused and the URL/key match.",
          });
        }
      } catch (e) {
        checks.push({
          key: "project_status",
          label: "Supabase Project Status",
          state: "fail",
          detail: e instanceof Error ? e.message : "Project unreachable",
          fix: "Check network egress and that your Supabase project is not paused.",
        });
      }
    }

    // ---- Storage availability ----
    if (!url || !service) {
      checks.push({
        key: "storage",
        label: "Storage Availability",
        state: service ? "warn" : "unknown",
        detail: "Requires SUPABASE_SERVICE_ROLE_KEY to list buckets.",
        fix: "Add SUPABASE_SERVICE_ROLE_KEY to enable full storage checks.",
      });
    } else {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const r = await fetch(`${url}/storage/v1/bucket`, {
          headers: { apikey: service, Authorization: `Bearer ${service}` },
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (r.ok) {
          const buckets = (await r.json()) as any[];
          checks.push({
            key: "storage",
            label: "Storage Availability",
            state: "ok",
            detail: `${Array.isArray(buckets) ? buckets.length : 0} bucket(s) available`,
          });
        } else {
          checks.push({
            key: "storage",
            label: "Storage Availability",
            state: "warn",
            detail: `Storage API returned HTTP ${r.status}`,
            fix: "Verify service role key and that Storage is enabled for this project.",
          });
        }
      } catch (e) {
        checks.push({
          key: "storage",
          label: "Storage Availability",
          state: "fail",
          detail: e instanceof Error ? e.message : "Storage API unreachable",
          fix: "Storage endpoint could not be reached — check network and project status.",
        });
      }
    }

    // ---- Auth enabled ----
    if (!url || !anon) {
      checks.push({
        key: "auth",
        label: "Authentication Enabled",
        state: "fail",
        detail: "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY.",
        fix: "Set both env vars to reach the Auth service.",
      });
    } else {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const r = await fetch(`${url}/auth/v1/settings`, {
          headers: { apikey: anon },
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (r.ok) {
          const settings = (await r.json()) as any;
          const providers = Object.entries(settings?.external ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k);
          const emailOn = settings?.external?.email !== false;
          checks.push({
            key: "auth",
            label: "Authentication Enabled",
            state: "ok",
            detail: `Auth online — providers: ${
              [emailOn ? "email" : null, ...providers].filter(Boolean).join(", ") || "email"
            }`,
          });
        } else {
          checks.push({
            key: "auth",
            label: "Authentication Enabled",
            state: "warn",
            detail: `Auth service returned HTTP ${r.status}`,
            fix: "Enable Auth in Supabase → Authentication and confirm the anon key is correct.",
          });
        }
      } catch (e) {
        checks.push({
          key: "auth",
          label: "Authentication Enabled",
          state: "fail",
          detail: e instanceof Error ? e.message : "Auth API unreachable",
          fix: "Auth endpoint not reachable — check network and that Auth is enabled.",
        });
      }
    }

    // ---- Realtime enabled ----
    if (!url || !anon) {
      checks.push({
        key: "realtime",
        label: "Realtime Enabled",
        state: "fail",
        detail: "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY.",
      });
    } else {
      try {
        const wsUrl = url.replace(/^http/, "ws") + `/realtime/v1/websocket?apikey=${anon}&vsn=1.0.0`;
        // Basic reachability via HEAD to the HTTP endpoint; websockets can't be probed directly here.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const r = await fetch(`${url}/realtime/v1/api/tenants/health`, {
          headers: { apikey: anon, Authorization: `Bearer ${anon}` },
          signal: controller.signal,
        }).catch(() => null);
        clearTimeout(timer);
        if (r && (r.ok || r.status === 404 || r.status === 401)) {
          // 401/404 still mean the service is up and answering
          checks.push({
            key: "realtime",
            label: "Realtime Enabled",
            state: "ok",
            detail: `Realtime service reachable (${wsUrl.split("?")[0]})`,
          });
        } else {
          checks.push({
            key: "realtime",
            label: "Realtime Enabled",
            state: "warn",
            detail: r ? `Realtime returned HTTP ${r.status}` : "Realtime endpoint not responding",
            fix: "Enable Realtime in Supabase → Database → Replication.",
          });
        }
      } catch (e) {
        checks.push({
          key: "realtime",
          label: "Realtime Enabled",
          state: "fail",
          detail: e instanceof Error ? e.message : "Realtime unreachable",
        });
      }
    }

    const ok = checks.every((c) => c.state === "ok" || c.state === "warn");
    return {
      ok,
      checkedAt: new Date().toISOString(),
      postgresVersion,
      postgresMajor,
      projectStatus,
      checks,
    };
  },
);
