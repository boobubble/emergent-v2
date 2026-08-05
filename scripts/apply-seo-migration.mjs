import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DELETED_REF = "zemkntcobnppphxiptkn";
const root = process.cwd();

function loadEnv() {
  const out = {};
  for (const file of [".env.local", ".env"]) {
    const envPath = join(root, file);
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  return out;
}

function activeRef(env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

const env = { ...loadEnv(), ...process.env };
const ref = activeRef(env);
if (!ref) throw new Error("Missing SUPABASE_URL / VITE_SUPABASE_URL");
if (ref === DELETED_REF) {
  throw new Error(`Refusing to run: SUPABASE_URL points at deleted project ${DELETED_REF}`);
}

const migrationSql = readFileSync(join(root, "supabase/migrations/20260730180000_seo_full_route_editing.sql"), "utf8");
const TARGET_COLUMNS = ["json_ld_type", "route_type", "template_variables"];

async function verifyViaRest() {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" };
  const select = encodeURIComponent(TARGET_COLUMNS.join(","));
  const res = await fetch(`${url}/rest/v1/seo_settings?select=${select}&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  const body = await res.text();
  if (!res.ok) return { ok: false, error: `REST verify failed (${res.status}): ${body.slice(0, 300)}` };
  const countRes = await fetch(`${url}/rest/v1/seo_settings?select=page_key&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" } });
  const contentRange = countRes.headers.get("content-range") ?? "";
  const recordCount = contentRange.includes("/") ? contentRange.split("/")[1] : "?";
  return { ok: true, projectRef: ref, columns: TARGET_COLUMNS, recordCount };
}

async function applyViaPostgres(dbUrl) {
  const { default: postgres } = await import("postgres");
  const sql = postgres(dbUrl, { ssl: "require", prepare: false, max: 1, connect_timeout: 20 });
  try {
    await sql.unsafe(migrationSql);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function applyViaLinkedCli() {
  const { execSync } = await import("node:child_process");
  const sql = "ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS json_ld_type text; ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS route_type text; ALTER TABLE public.seo_settings ADD COLUMN IF NOT EXISTS template_variables jsonb;";
  execSync(`npx supabase db query --linked ${JSON.stringify(sql)}`, { cwd: root, encoding: "utf8", stdio: "pipe" });
}

async function main() {
  console.log(`Project ref: ${ref}`);
  const pre = await verifyViaRest();
  if (pre.ok) {
    console.log("Migration already applied.", JSON.stringify(pre, null, 2));
    return;
  }
  console.log("Pre-check:", pre.error);

  const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
  if (dbUrl) {
    console.log("Applying via SUPABASE_DB_URL...");
    await applyViaPostgres(dbUrl);
  } else {
    console.log("Applying via supabase db query --linked...");
    await applyViaLinkedCli();
  }

  const post = await verifyViaRest();
  if (!post.ok) {
    console.error("Post-check failed:", post.error);
    process.exit(1);
  }
  console.log("Migration applied successfully.", JSON.stringify(post, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});