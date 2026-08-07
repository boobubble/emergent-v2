#!/usr/bin/env node
/**
 * Apply Phase 1 Pages CMS taxonomy migration to the connected Supabase DB.
 * Requires SUPABASE_DB_URL (preferred) or DATABASE_URL — direct Postgres URI.
 * Refuses the deleted project ref. Does not start Phase 2.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DELETED_REF = "zemkntcobnppphxiptkn";
const EXPECTED_REF = "aofjhfsecwsrcvvvcfcy";
const MIGRATION = "supabase/migrations/20260807143000_pages_cms_taxonomy.sql";
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

function refFromUrl(url) {
  try {
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

function refFromDbUrl(dbUrl) {
  // postgres://...@db.<ref>.supabase.co:5432/postgres
  const m = dbUrl.match(/([a-z0-9]+)\.supabase\.co/i);
  return m?.[1] ?? null;
}

const env = { ...loadEnv(), ...process.env };
const apiUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const apiRef = refFromUrl(apiUrl);
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const publishable =
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY;

if (apiRef === DELETED_REF) {
  throw new Error(`Refusing to run against deleted project ${DELETED_REF}`);
}
if (apiRef && apiRef !== EXPECTED_REF) {
  console.warn(`Warning: SUPABASE_URL ref is ${apiRef}, expected ${EXPECTED_REF}`);
}

const migrationSql = readFileSync(join(root, MIGRATION), "utf8");
if (migrationSql.charCodeAt(0) === 0 || migrationSql.includes("\u0000")) {
  throw new Error("Migration file looks UTF-16 / binary — convert to UTF-8 before apply");
}
if (!migrationSql.includes("custom_pages_status_check")) {
  throw new Error("Migration missing custom_pages_status_check — aborting");
}
if (/UPDATE\s+public\.custom_pages[\s\S]*content_status/i.test(migrationSql)) {
  throw new Error("Migration still mass-updates custom_pages content_status — aborting");
}

async function restHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" };
}

async function snapshotLahore(key) {
  if (!apiUrl || !key) return null;
  const res = await fetch(
    `${apiUrl}/rest/v1/custom_pages?slug=eq.lahore-chat-room&select=id,slug,title,status,updated_at,published_at,meta_title,meta_description,canonical_url,noindex,content`,
    { headers: await restHeaders(key) },
  );
  if (!res.ok) throw new Error(`Lahore snapshot failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  if (!rows.length) throw new Error("Lahore page not found before migration");
  const row = rows[0];
  return {
    ...row,
    content_sha256: createHash("sha256").update(row.content || "").digest("hex"),
    content_len: (row.content || "").length,
  };
}

async function applyViaPostgres(url) {
  const dbRef = refFromDbUrl(url);
  if (dbRef === DELETED_REF) throw new Error(`DB URL points at deleted project ${DELETED_REF}`);
  const { default: postgres } = await import("postgres");
  const sql = postgres(url, { ssl: "require", prepare: false, max: 1, connect_timeout: 30 });
  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(migrationSql);
    });
  } finally {
    await sql.end({ timeout: 10 });
  }
}

async function verify(key) {
  if (!apiUrl || !key) return { ok: false, error: "Missing API URL or key for verify" };
  const tables = [
    "page_countries",
    "page_states",
    "page_cities",
    "page_categories",
    "page_keyword_groups",
    "page_templates",
    "page_internal_link_rules",
    "page_internal_links",
    "page_bulk_jobs",
    "page_history",
    "page_cms_settings",
    "page_saved_filters",
  ];
  const present = {};
  for (const t of tables) {
    const res = await fetch(`${apiUrl}/rest/v1/${t}?select=*&limit=1`, {
      headers: await restHeaders(key),
    });
    present[t] = res.status !== 404;
  }
  const colsRes = await fetch(
    `${apiUrl}/rest/v1/custom_pages?select=page_type,content_status,seo_score,internal_link_count,internal_links_json,scheduled_at,language&limit=1`,
    { headers: await restHeaders(key) },
  );
  const columnsOk = colsRes.ok;
  return { ok: Object.values(present).every(Boolean) && columnsOk, present, columnsOk, columnsStatus: colsRes.status };
}

async function main() {
  console.log(JSON.stringify({ apiRef, expectedRef: EXPECTED_REF, hasDbUrl: !!dbUrl, hasServiceKey: !!serviceKey, hasPublishable: !!publishable }, null, 2));

  if (!dbUrl) {
    console.error("BLOCKED: SUPABASE_DB_URL (or DATABASE_URL) is required to apply DDL.");
    console.error("Add the Postgres URI from Supabase → Project Settings → Database → Connection string.");
    process.exit(2);
  }

  const keyForRead = serviceKey || publishable;
  const before = await snapshotLahore(keyForRead);
  writeFileSync("/tmp/lahore-before-migration.json", JSON.stringify(before, null, 2));
  console.log("Lahore before:", { id: before.id, slug: before.slug, status: before.status, updated_at: before.updated_at, content_sha256: before.content_sha256 });

  console.log("Applying migration…");
  await applyViaPostgres(dbUrl);
  console.log("Migration SQL completed without thrown errors.");

  const after = await snapshotLahore(keyForRead);
  writeFileSync("/tmp/lahore-after-migration.json", JSON.stringify(after, null, 2));
  const integrity = {
    sameId: before.id === after.id,
    sameSlug: before.slug === after.slug,
    sameTitle: before.title === after.title,
    sameStatus: before.status === after.status,
    sameUpdatedAt: before.updated_at === after.updated_at,
    samePublishedAt: before.published_at === after.published_at,
    sameMetaTitle: before.meta_title === after.meta_title,
    sameMetaDescription: before.meta_description === after.meta_description,
    sameCanonical: before.canonical_url === after.canonical_url,
    sameContentSha: before.content_sha256 === after.content_sha256,
  };
  console.log("Lahore integrity:", integrity);
  if (!Object.values(integrity).every(Boolean)) {
    console.error("INTEGRITY FAILURE");
    process.exit(1);
  }

  const v = await verify(keyForRead);
  console.log("Verify:", JSON.stringify(v, null, 2));
  if (!v.ok) process.exit(1);
  console.log("APPLY_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
