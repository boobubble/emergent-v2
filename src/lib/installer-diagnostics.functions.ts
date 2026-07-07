/**
 * Installer diagnostics — read-only probes.
 * Kept separate from installer-bootstrap.functions.ts (bootstrap logic is untouched).
 */
import { createServerFn } from "@tanstack/react-start";

export interface EnvVarStatus {
  name: string;
  present: boolean;
  required: boolean;
  hint: string;
}
export interface EnvValidation {
  ok: boolean;
  vars: EnvVarStatus[];
}

export interface DbConnectionResult {
  ok: boolean;
  reachable: boolean;
  authenticated: boolean;
  ssl: boolean;
  serverVersion?: string;
  latencyMs?: number;
  friendlyError?: string;
}

function friendly(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err ?? "unknown error");
  if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return "Unable to connect to the database. Please verify your SUPABASE_DB_URL host.";
  if (/password authentication failed/i.test(m)) return "Database password rejected — please check the password inside SUPABASE_DB_URL.";
  if (/no pg_hba/i.test(m)) return "This host is not allowed to connect. Use the pooler URL (port 6543) or allow this IP in Supabase.";
  if (/SSL/i.test(m) && /required/i.test(m)) return "SSL is required — append `?sslmode=require` to SUPABASE_DB_URL.";
  if (/ETIMEDOUT|ECONNREFUSED/i.test(m)) return "Cannot reach the database (timeout). Check SUPABASE_DB_URL and your network.";
  return "Unable to connect to the database. Please verify your SUPABASE_DB_URL.";
}

export const getEnvValidation = createServerFn({ method: "GET" }).handler(async (): Promise<EnvValidation> => {
  const { assertInstallerAllowed } = await import("./installer-guard.server");
  await assertInstallerAllowed();
  const defs: Array<{ name: string; required: boolean; hint: string }> = [
    { name: "SUPABASE_URL",              required: true,  hint: "Your Supabase project URL" },
    { name: "SUPABASE_PUBLISHABLE_KEY",  required: true,  hint: "Anon / publishable key" },
    { name: "SUPABASE_SERVICE_ROLE_KEY", required: true,  hint: "Secret service-role key (server only)" },
    { name: "SUPABASE_DB_URL",           required: true,  hint: "Postgres URI (Project Settings → Database → Connection string)" },
    { name: "SITE_URL",                  required: false, hint: "Public URL of your site (used for emails/links)" },
  ];
  const vars: EnvVarStatus[] = defs.map((d) => ({
    name: d.name,
    required: d.required,
    hint: d.hint,
    present: !!process.env[d.name],
  }));
  return { ok: vars.every((v) => !v.required || v.present), vars };
});

export const testDatabaseConnection = createServerFn({ method: "POST" }).handler(async (): Promise<DbConnectionResult> => {
  const { assertInstallerAllowed } = await import("./installer-guard.server");
  await assertInstallerAllowed();
  if (!process.env.SUPABASE_DB_URL) {
    return {
      ok: false, reachable: false, authenticated: false, ssl: false,
      friendlyError: "SUPABASE_DB_URL is not set. Add it to your environment and retry.",
    };
  }
  const start = Date.now();
  try {
    const { default: postgres } = await import("postgres");
    const sql = postgres(process.env.SUPABASE_DB_URL, {
      ssl: "require", prepare: false, max: 1, idle_timeout: 5, connect_timeout: 10,
    });
    try {
      const rows = await sql`SELECT version() as v, current_database() as db`;
      const version = String(rows[0]?.v ?? "");
      return {
        ok: true, reachable: true, authenticated: true, ssl: true,
        serverVersion: version.split(" on ")[0] || version,
        latencyMs: Date.now() - start,
      };
    } finally { await sql.end({ timeout: 3 }); }
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      reachable: !/ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNREFUSED/i.test(raw),
      authenticated: !/password authentication failed/i.test(raw),
      ssl: !/SSL/i.test(raw),
      friendlyError: friendly(e),
    };
  }
});
