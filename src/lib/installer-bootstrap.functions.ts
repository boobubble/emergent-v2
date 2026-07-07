/**
 * One-click schema bootstrap for self-hosted installs.
 *
 * Applies every bundled migration to the target Supabase Postgres using the
 * direct database connection (SUPABASE_DB_URL). Idempotent: tracks applied
 * migrations in a dedicated `public._installer_migrations` table so retries,
 * resumes and repeat installs never re-apply or overwrite existing data.
 *
 * Required env:
 *   SUPABASE_DB_URL  — postgres connection string
 *                      (Supabase → Project Settings → Database → Connection string → URI)
 *
 * Everything else in the deployment (tables, indexes, RLS, triggers,
 * functions, seed data, storage policies) ships inside the bundled
 * migrations, so nothing has to be done manually via SQL.
 */
import { createServerFn } from "@tanstack/react-start";
import { BUNDLED_MIGRATIONS, BUNDLED_MIGRATION_COUNT } from "./bundled-migrations";

// ── Types ────────────────────────────────────────────────────────────────

export interface BootstrapStatus {
  ready: boolean;
  dbUrlPresent: boolean;
  serviceRolePresent: boolean;
  totalBundled: number;
  applied: number;
  pending: number;
  lastApplied?: string;
  message: string;
}

export interface BootstrapLogEntry {
  ts: string;
  level: "info" | "ok" | "warn" | "error";
  name: string;
  msg: string;
  ms?: number;
}

export interface BootstrapResult {
  ok: boolean;
  applied: string[];
  skipped: string[];
  failed?: { name: string; error: string };
  log: BootstrapLogEntry[];
  totalMs: number;
  verified?: VerifyResult;
}

export interface VerifyResult {
  ok: boolean;
  checks: { label: string; ok: boolean; detail?: string }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────

function nowIso() { return new Date().toISOString().slice(11, 23); }
function friendly(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err ?? "unknown error");
  if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return "Database host not reachable — check SUPABASE_DB_URL.";
  if (/password authentication failed/i.test(m)) return "Database password rejected — check the password in SUPABASE_DB_URL.";
  if (/no pg_hba/i.test(m)) return "This IP is not allowed to connect. Use the pooler connection string (port 6543) or allow this host in Supabase.";
  if (/SSL/i.test(m) && /required/i.test(m)) return "SSL required — append `?sslmode=require` to SUPABASE_DB_URL.";
  if (/ETIMEDOUT|ECONNREFUSED/i.test(m)) return "Cannot reach the database (timeout). Check the connection string and network.";
  return m;
}

async function openClient() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) throw new Error("SUPABASE_DB_URL is not set. Add it to your environment and retry.");
  const { default: postgres } = await import("postgres");
  // ssl:'require' handles managed Postgres; disable prepared statements for pooler compatibility.
  return postgres(url, { ssl: "require", prepare: false, max: 1, idle_timeout: 20, connect_timeout: 15 });
}

const TRACK_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS public._installer_migrations (
    name         TEXT PRIMARY KEY,
    applied_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    checksum     TEXT NOT NULL,
    duration_ms  INTEGER NOT NULL DEFAULT 0
  );
`;

// tiny non-crypto hash — good enough to notice tampering between runs
function checksum(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return "h" + (h >>> 0).toString(16) + ":" + s.length;
}

// ── Status ───────────────────────────────────────────────────────────────

export const getBootstrapStatus = createServerFn({ method: "GET" }).handler(async (): Promise<BootstrapStatus> => {
  const dbUrlPresent = !!process.env.SUPABASE_DB_URL;
  const serviceRolePresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const totalBundled = BUNDLED_MIGRATION_COUNT;

  if (!dbUrlPresent) {
    return {
      ready: false,
      dbUrlPresent, serviceRolePresent, totalBundled, applied: 0, pending: totalBundled,
      message: "SUPABASE_DB_URL is required to bootstrap the schema. Get it from Supabase → Project Settings → Database → Connection string (URI).",
    };
  }

  try {
    const sql = await openClient();
    try {
      await sql.unsafe(TRACK_TABLE_SQL);
      const rows = await sql`SELECT name FROM public._installer_migrations ORDER BY name`;
      const applied = rows.length;
      const last = rows[rows.length - 1]?.name as string | undefined;
      return {
        ready: applied === totalBundled,
        dbUrlPresent, serviceRolePresent, totalBundled, applied,
        pending: Math.max(totalBundled - applied, 0),
        lastApplied: last,
        message: applied === totalBundled
          ? "Schema is fully applied."
          : applied === 0
            ? "Database is empty — ready to bootstrap."
            : `Resume available: ${applied}/${totalBundled} migrations already applied.`,
      };
    } finally { await sql.end({ timeout: 5 }); }
  } catch (e) {
    return {
      ready: false,
      dbUrlPresent, serviceRolePresent, totalBundled, applied: 0, pending: totalBundled,
      message: friendly(e),
    };
  }
});

// ── Run bootstrap (idempotent, resumable) ────────────────────────────────

export const runSchemaBootstrap = createServerFn({ method: "POST" }).handler(async (): Promise<BootstrapResult> => {
  const started = Date.now();
  const log: BootstrapLogEntry[] = [];
  const applied: string[] = [];
  const skipped: string[] = [];
  const push = (level: BootstrapLogEntry["level"], name: string, msg: string, ms?: number) =>
    log.push({ ts: nowIso(), level, name, msg, ms });

  let sql: Awaited<ReturnType<typeof openClient>> | null = null;
  try {
    push("info", "connect", "Opening database connection…");
    sql = await openClient();
    push("ok", "connect", "Connected.");

    // Ensure tracking table exists (safe on repeat runs).
    push("info", "_installer_migrations", "Ensuring tracking table…");
    await sql.unsafe(TRACK_TABLE_SQL);

    const rows = await sql`SELECT name FROM public._installer_migrations`;
    const done = new Set(rows.map((r) => (r as { name: string }).name));

    for (const m of BUNDLED_MIGRATIONS) {
      if (done.has(m.name)) {
        skipped.push(m.name);
        push("info", m.name, "already applied — skipped");
        continue;
      }
      const cs = checksum(m.sql);
      const t0 = Date.now();
      push("info", m.name, "applying…");
      try {
        // Each migration runs inside its own transaction so a failure rolls
        // that migration back cleanly and leaves the rest of the DB untouched.
        await sql.begin(async (tx) => {
          await tx.unsafe(m.sql);
          await tx`
            INSERT INTO public._installer_migrations (name, checksum, duration_ms)
            VALUES (${m.name}, ${cs}, ${Date.now() - t0})
            ON CONFLICT (name) DO NOTHING
          `;
        });
        applied.push(m.name);
        push("ok", m.name, "applied", Date.now() - t0);
      } catch (e) {
        const err = friendly(e);
        push("error", m.name, err, Date.now() - t0);
        return {
          ok: false,
          applied, skipped,
          failed: { name: m.name, error: err },
          log,
          totalMs: Date.now() - started,
        };
      }
    }

    push("ok", "done", `Applied ${applied.length}, skipped ${skipped.length}.`);
    const verified = await verifyInternal(sql);
    push(verified.ok ? "ok" : "warn", "verify", verified.ok ? "Schema verification passed." : "Schema verification found issues.");
    return { ok: true, applied, skipped, log, totalMs: Date.now() - started, verified };
  } catch (e) {
    push("error", "connect", friendly(e));
    return { ok: false, applied, skipped, log, totalMs: Date.now() - started, failed: { name: "connect", error: friendly(e) } };
  } finally {
    if (sql) { try { await sql.end({ timeout: 5 }); } catch { /* noop */ } }
  }
});

// ── Verification ─────────────────────────────────────────────────────────

async function verifyInternal(sql: Awaited<ReturnType<typeof openClient>>): Promise<VerifyResult> {
  const checks: VerifyResult["checks"] = [];
  async function check(label: string, q: () => Promise<boolean>, ok_detail?: string) {
    try {
      const ok = await q();
      checks.push({ label, ok, detail: ok ? ok_detail : "missing" });
    } catch (e) {
      checks.push({ label, ok: false, detail: friendly(e) });
    }
  }

  const requiredTables = [
    "profiles", "user_roles", "app_settings", "chatrooms", "messages",
    "posts", "comments", "notifications", "subscription_plans", "safety_events",
  ];
  for (const t of requiredTables) {
    await check(`table public.${t}`, async () => {
      const r = await sql`SELECT to_regclass(${"public." + t}) AS x`;
      return !!r[0]?.x;
    }, "present");
  }

  const requiredFns = ["has_role", "is_admin", "bootstrap_first_admin", "get_install_status", "complete_installation"];
  for (const f of requiredFns) {
    await check(`function public.${f}`, async () => {
      const r = await sql`
        SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = ${f} LIMIT 1
      `;
      return r.length > 0;
    }, "present");
  }

  await check("RLS enabled on profiles", async () => {
    const r = await sql`SELECT relrowsecurity FROM pg_class WHERE oid = 'public.profiles'::regclass`;
    return !!r[0]?.relrowsecurity;
  });

  return { ok: checks.every((c) => c.ok), checks };
}

export const verifyInstallation = createServerFn({ method: "GET" }).handler(async (): Promise<VerifyResult> => {
  const sql = await openClient();
  try { return await verifyInternal(sql); }
  finally { await sql.end({ timeout: 5 }); }
});

// ── Reset (destructive; dev only — gated by explicit token) ──────────────

export const resetBootstrapTracker = createServerFn({ method: "POST" })
  .inputValidator((d: { confirm: string }) => d)
  .handler(async ({ data }) => {
    if (data.confirm !== "I UNDERSTAND") {
      throw new Error("Refusing to reset without explicit confirmation.");
    }
    const sql = await openClient();
    try {
      await sql`DROP TABLE IF EXISTS public._installer_migrations`;
      return { ok: true };
    } finally { await sql.end({ timeout: 5 }); }
  });
