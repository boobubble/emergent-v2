#!/usr/bin/env node
/**
 * Apply Phase 4A Pages CMS migrations (search indexes + taxonomy).
 * Requires SUPABASE_DB_URL or DATABASE_URL.
 *
 * Usage:
 *   node scripts/apply-pages-cms-phase4a.mjs --dry-run
 *   node scripts/apply-pages-cms-phase4a.mjs --taxonomy-only
 *   node scripts/apply-pages-cms-phase4a.mjs --search-only
 *   node scripts/apply-pages-cms-phase4a.mjs --all
 *
 * Default without flags: dry-run safety report only (does not apply).
 * Search indexes require explicit --search-only or --all after safety review approval.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import postgres from "postgres";

const EXPECTED_REF = "aofjhfsecwsrcvvvcfcy";
const DELETED_REF = "zemkntcobnppphxiptkn";
const SEARCH = "supabase/migrations/20260808120000_pages_cms_search_trgm.sql";
const TAXONOMY = "supabase/migrations/20260808121000_pages_cms_phase4a_taxonomy.sql";
const root = process.cwd();

function loadEnv() {
  const out = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      if (out[m[1]] == null) out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  return out;
}

function refFromDbUrl(dbUrl) {
  const m = dbUrl.match(/([a-z0-9]+)\.supabase\.co/i);
  return m?.[1] ?? null;
}

const args = new Set(process.argv.slice(2));
const env = loadEnv();
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
const apiUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY;

const wantSearch = args.has("--search-only") || args.has("--all");
const wantTaxonomy = args.has("--taxonomy-only") || args.has("--all");
const dryRun = args.has("--dry-run") || (!wantSearch && !wantTaxonomy);

if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL / DATABASE_URL — cannot apply. Migrations are committed for review.");
  process.exit(dryRun ? 0 : 1);
}

const ref = refFromDbUrl(dbUrl);
if (ref === DELETED_REF) throw new Error(`Refusing deleted project ${DELETED_REF}`);
if (ref && ref !== EXPECTED_REF) console.warn(`Warning: DB ref ${ref}, expected ${EXPECTED_REF}`);

async function snapshotLahore() {
  if (!apiUrl || !key) return null;
  const res = await fetch(
    `${apiUrl}/rest/v1/custom_pages?slug=eq.lahore-chat-room&select=id,slug,updated_at,page_type,country_id,city_id,content`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return null;
  const hash = createHash("sha256").update(row.content || "").digest("hex");
  return {
    id: row.id,
    slug: row.slug,
    updated_at: row.updated_at,
    page_type: row.page_type,
    country_id: row.country_id,
    city_id: row.city_id,
    content_len: (row.content || "").length,
    content_sha256: hash,
  };
}

const sql = postgres(dbUrl, { max: 1, prepare: false });

try {
  const before = await snapshotLahore();
  console.log("Lahore before:", before);

  const ext = await sql`
    SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'
  `;
  console.log("pg_trgm installed:", ext.length > 0);

  if (dryRun) {
    console.log("DRY RUN — no SQL applied.");
    console.log("Search migration:", SEARCH);
    console.log("Taxonomy migration:", TAXONOMY);
    console.log("Re-run with --taxonomy-only and/or --search-only / --all after approval.");
    process.exit(0);
  }

  if (wantSearch) {
    const searchSql = readFileSync(join(root, SEARCH), "utf8");
    console.log("Applying search indexes…");
    await sql.unsafe(searchSql);
    console.log("Search indexes applied.");
  }

  if (wantTaxonomy) {
    const taxSql = readFileSync(join(root, TAXONOMY), "utf8");
    if (/insert\s+into\s+public\.custom_pages/i.test(taxSql)) {
      throw new Error("Taxonomy migration must not insert custom_pages");
    }
    console.log("Applying taxonomy seed…");
    await sql.unsafe(taxSql);
    const counts = await sql`
      SELECT
        (SELECT count(*) FROM page_states s JOIN page_countries c ON c.id = s.country_id WHERE c.slug = 'india') AS india_states,
        (SELECT count(*) FROM page_cities ci JOIN page_countries c ON c.id = ci.country_id WHERE c.slug = 'india') AS india_cities,
        (SELECT count(*) FROM page_states s JOIN page_countries c ON c.id = s.country_id WHERE c.slug = 'pakistan') AS pakistan_states,
        (SELECT count(*) FROM page_cities ci JOIN page_countries c ON c.id = ci.country_id WHERE c.slug = 'pakistan') AS pakistan_cities,
        (SELECT count(*) FROM page_categories) AS categories,
        (SELECT count(*) FROM page_keyword_groups) AS keyword_groups,
        (SELECT count(*) FROM page_templates) AS templates
    `;
    console.log("Taxonomy counts:", counts[0]);
  }

  const after = await snapshotLahore();
  console.log("Lahore after:", after);
  if (before && after) {
    const ok =
      before.id === after.id &&
      before.updated_at === after.updated_at &&
      before.content_sha256 === after.content_sha256 &&
      before.page_type === after.page_type &&
      before.country_id === after.country_id &&
      before.city_id === after.city_id;
    if (!ok) throw new Error("Lahore integrity check FAILED after Phase 4A apply");
    console.log("Lahore integrity: PASS");
  }
} finally {
  await sql.end({ timeout: 5 });
}
