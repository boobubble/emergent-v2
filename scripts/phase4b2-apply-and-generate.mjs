#!/usr/bin/env node
/**
 * Phase 4B.2 — Apply template migration, live preview, controlled draft generation.
 *
 * Requires SUPABASE_DB_URL (or DATABASE_URL). Never uses VITE_/browser keys for writes.
 *
 * Usage:
 *   npx tsx scripts/phase4b2-apply-and-generate.mjs --check-connection
 *   npx tsx scripts/phase4b2-apply-and-generate.mjs --apply-templates-only
 *   npx tsx scripts/phase4b2-apply-and-generate.mjs --all
 *
 * --all flow:
 *   1) verify DB connection
 *   2) snapshot templates + Lahore + custom_pages count
 *   3) apply 20260808130000_pages_cms_phase4b1_templates.sql
 *   4) verify templates (IDs retained, CTA/FAQ present, no duplicates)
 *   5) verify Lahore + custom_pages count unchanged by migration
 *   6) spawn live-template preview; gate on Ready=27 / Existing=1
 *   7) spawn generate (validated domain logic + privileged DB writes)
 *   8) post-generate verification report
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import postgres from "postgres";

const root = process.cwd();
const EXPECTED_REF = "aofjhfsecwsrcvvvcfcy";
const LAHORE_ID = "e26569bc-f359-47a6-9646-2da179ee183a";
const LAHORE_SLUG = "lahore-chat-room";
const EXPECTED_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";
const MIGRATION = "supabase/migrations/20260808130000_pages_cms_phase4b1_templates.sql";

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

function sha(content) {
  return createHash("sha256").update(content || "").digest("hex");
}

const args = new Set(process.argv.slice(2));
const env = loadEnv();
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
const checkOnly = args.has("--check-connection");
const applyOnly = args.has("--apply-templates-only");
const runAll = args.has("--all");

function connectionReport() {
  return {
    SUPABASE_DB_URL: !!env.SUPABASE_DB_URL,
    DATABASE_URL: !!env.DATABASE_URL,
    dbUrl_present: !!dbUrl,
    dbUrl_looks_postgres: !!dbUrl && /^postgres(ql)?:\/\//i.test(dbUrl),
    dbUrl_host_hint: dbUrl ? (dbUrl.match(/@([^/:]+)/)?.[1] ?? "(unparsed)") : null,
    expected_ref: EXPECTED_REF,
    ref_match: dbUrl ? refFromDbUrl(dbUrl) === EXPECTED_REF : false,
    service_role_present: !!env.SUPABASE_SERVICE_ROLE_KEY,
    vite_key_used_for_writes: false,
  };
}

async function main() {
  console.log("=== Phase 4B.2 connection check ===");
  console.log(JSON.stringify(connectionReport(), null, 2));

  if (!dbUrl) {
    console.error(
      "BLOCKED: SUPABASE_DB_URL / DATABASE_URL missing in this environment. " +
        "Add the server-side Postgres URL (not VITE_/publishable keys) and re-run.",
    );
    process.exit(2);
  }

  const ref = refFromDbUrl(dbUrl);
  if (ref && ref !== EXPECTED_REF) {
    console.warn(`Warning: DB ref ${ref}, expected ${EXPECTED_REF}`);
  }

  const sql = postgres(dbUrl, { max: 1, prepare: false, ssl: "require" });
  try {
    const ping = await sql`select current_database() as db, current_user as usr, now() as ts`;
    console.log(JSON.stringify({
      connection_ok: true,
      database: ping[0].db,
      user: ping[0].usr,
      // do not print host/password
    }, null, 2));

    if (checkOnly) return;

    if (!applyOnly && !runAll) {
      console.log("Nothing to do. Use --check-connection | --apply-templates-only | --all");
      return;
    }

    // ---- Snapshot before template apply ----
    const templatesBefore = await sql`
      SELECT id, slug, name, is_default,
             (cta_template IS NOT NULL) AS has_cta,
             (faq_template IS NOT NULL) AS has_faq,
             left(coalesce(content_template,''), 80) AS content_prefix,
             updated_at
      FROM public.page_templates
      ORDER BY slug
    `;
    const cityBefore = templatesBefore.find((t) => t.slug === "city-chat-room");
    const countryBefore = templatesBefore.find((t) => t.slug === "country-chat-room");
    if (!cityBefore || !countryBefore) {
      throw new Error("Missing city-chat-room or country-chat-room template before apply — STOP");
    }

    const lahoreBefore = (await sql`
      SELECT id, slug, status, updated_at, page_type, country_id, state_id, city_id, category_id,
             template_id, keyword_group_id, content
      FROM public.custom_pages WHERE id = ${LAHORE_ID}::uuid
    `)[0];
    if (!lahoreBefore) throw new Error("Lahore row missing — STOP");
    const lahoreHashBefore = sha(lahoreBefore.content);
    if (lahoreHashBefore !== EXPECTED_HASH) {
      console.warn("Warning: Lahore content hash differs from Phase 0 baseline", {
        expected: EXPECTED_HASH,
        actual: lahoreHashBefore,
      });
    }

    const pagesCountBefore = (await sql`SELECT count(*)::int AS n FROM public.custom_pages`)[0].n;
    const slugDupBefore = await sql`
      SELECT slug, count(*)::int AS n FROM public.page_templates GROUP BY slug HAVING count(*) > 1
    `;

    console.log("=== Pre-apply snapshot ===");
    console.log(JSON.stringify({
      templates: templatesBefore.map((t) => ({
        id: t.id, slug: t.slug, name: t.name, is_default: t.is_default, has_cta: t.has_cta, has_faq: t.has_faq,
      })),
      city_template_id: cityBefore.id,
      country_template_id: countryBefore.id,
      custom_pages_count: pagesCountBefore,
      template_slug_duplicates: slugDupBefore,
      lahore: {
        id: lahoreBefore.id,
        slug: lahoreBefore.slug,
        updated_at: lahoreBefore.updated_at,
        page_type: lahoreBefore.page_type,
        template_id: lahoreBefore.template_id,
        content_sha256: lahoreHashBefore,
      },
    }, null, 2));

    // ---- Apply migration ----
    const migrationPath = join(root, MIGRATION);
    if (!existsSync(migrationPath)) throw new Error(`Missing migration ${MIGRATION}`);
    const migrationSql = readFileSync(migrationPath, "utf8");
    console.log(`Applying ${MIGRATION} ...`);
    await sql.unsafe(migrationSql);
    console.log("Template migration applied.");

    // ---- Post-apply verification ----
    const templatesAfter = await sql`
      SELECT id, slug, name, is_default, cta_template, faq_template,
             intro_template, content_template, meta_description_template, updated_at
      FROM public.page_templates
      ORDER BY slug
    `;
    const cityAfter = templatesAfter.find((t) => t.slug === "city-chat-room");
    const countryAfter = templatesAfter.find((t) => t.slug === "country-chat-room");
    const slugDupAfter = await sql`
      SELECT slug, count(*)::int AS n FROM public.page_templates GROUP BY slug HAVING count(*) > 1
    `;
    const pagesCountAfter = (await sql`SELECT count(*)::int AS n FROM public.custom_pages`)[0].n;
    const lahoreAfterMig = (await sql`
      SELECT id, slug, status, updated_at, page_type, country_id, state_id, city_id, category_id,
             template_id, keyword_group_id, content
      FROM public.custom_pages WHERE id = ${LAHORE_ID}::uuid
    `)[0];
    const lahoreHashAfterMig = sha(lahoreAfterMig.content);

    const templateVerify = {
      city_id_retained: cityAfter?.id === cityBefore.id,
      country_id_retained: countryAfter?.id === countryBefore.id,
      city_has_cta: !!(cityAfter?.cta_template && Object.keys(cityAfter.cta_template).length),
      city_has_faq: Array.isArray(cityAfter?.faq_template) && cityAfter.faq_template.length > 0,
      country_has_cta: !!(countryAfter?.cta_template && Object.keys(countryAfter.cta_template).length),
      country_has_faq: Array.isArray(countryAfter?.faq_template) && countryAfter.faq_template.length > 0,
      city_content_has_blocks: /data-block="nearby"/.test(cityAfter?.content_template || ""),
      no_duplicate_template_slugs: slugDupAfter.length === 0,
      custom_pages_count_unchanged: pagesCountBefore === pagesCountAfter,
      lahore_unchanged:
        lahoreAfterMig.id === LAHORE_ID &&
        lahoreAfterMig.slug === LAHORE_SLUG &&
        String(lahoreAfterMig.updated_at) === String(lahoreBefore.updated_at) &&
        lahoreHashAfterMig === lahoreHashBefore &&
        lahoreAfterMig.page_type == null &&
        lahoreAfterMig.country_id == null &&
        lahoreAfterMig.template_id == null,
    };

    console.log("=== Post-apply template verification ===");
    console.log(JSON.stringify({
      templateVerify,
      city_id: cityAfter?.id,
      country_id: countryAfter?.id,
      pagesCountBefore,
      pagesCountAfter,
    }, null, 2));

    const templateOk = Object.values(templateVerify).every(Boolean);
    writeFileSync("/tmp/phase4b2-template-apply.json", JSON.stringify({
      templatesBefore,
      templateVerify,
      city_id: cityAfter?.id,
      country_id: countryAfter?.id,
    }, null, 2));

    if (!templateOk) {
      console.error("STOP: template migration verification failed.");
      process.exit(3);
    }

    if (applyOnly) {
      console.log("Apply-only complete. STOP before generation.");
      return;
    }

    // ---- Live preview (DB templates only) ----
    console.log("=== Live-template preview ===");
    const preview = spawnSync(
      "npx",
      ["tsx", "scripts/phase4b-controlled-batch.mjs", "--preview", "--live-templates"],
      { cwd: root, encoding: "utf8", env: process.env, maxBuffer: 20_000_000 },
    );
    process.stdout.write(preview.stdout || "");
    if (preview.status !== 0) {
      process.stderr.write(preview.stderr || "");
      throw new Error(`Live preview failed with exit ${preview.status}`);
    }

    const previewReport = JSON.parse(readFileSync("/tmp/phase4b-preview.json", "utf8"));
    const counts = previewReport.conflict_counts || {};
    const previewGate = {
      ready: counts.Ready,
      existing: counts["Existing Page"],
      reserved: counts["Reserved Route"] ?? 0,
      redirect: counts["Redirect Conflict"] ?? 0,
      invalid: counts.Invalid ?? 0,
      hy_in_ok: previewReport.hyderabad_india?.ok === true,
      hy_pk_ok: previewReport.hyderabad_pakistan?.ok === true,
      lahore_ok: previewReport.lahore_conflict?.ok === true,
      live_templates: previewReport.template_source === "database",
    };
    const previewOk =
      previewGate.ready === 27 &&
      previewGate.existing === 1 &&
      previewGate.reserved === 0 &&
      previewGate.redirect === 0 &&
      previewGate.invalid === 0 &&
      previewGate.hy_in_ok &&
      previewGate.hy_pk_ok &&
      previewGate.lahore_ok &&
      previewGate.live_templates;

    console.log("=== Preview gate ===");
    console.log(JSON.stringify(previewGate, null, 2));
    if (!previewOk) {
      console.error("STOP: post-migration preview counts/expectations failed — not generating.");
      process.exit(4);
    }

    // ---- Generate ----
    console.log("=== Controlled generation (draft + noindex) ===");
    const gen = spawnSync(
      "npx",
      ["tsx", "scripts/phase4b-controlled-batch.mjs", "--generate", "--live-templates", "--allow-high-similarity"],
      { cwd: root, encoding: "utf8", env: process.env, maxBuffer: 20_000_000 },
    );
    process.stdout.write(gen.stdout || "");
    if (gen.status !== 0) {
      process.stderr.write(gen.stderr || "");
      throw new Error(`Generation failed with exit ${gen.status}`);
    }

    const genReport = JSON.parse(readFileSync("/tmp/phase4b-generate.json", "utf8"));

    // ---- Post-generate DB verification ----
    const createdSlugs = (genReport.created_rows || []).map((r) => r.slug);
    const createdRows = createdSlugs.length
      ? await sql`
          SELECT id, slug, title, status, noindex, page_type,
                 country_id, state_id, city_id, category_id,
                 keyword_group_id, template_id, primary_keyword, h1,
                 meta_title, meta_description, intro_content,
                 (content IS NOT NULL AND length(content) > 0) AS has_content,
                 (cta_content IS NOT NULL) AS has_cta,
                 (faq_content IS NOT NULL) AS has_faq,
                 content_status, seo_score, internal_link_count, published_at
          FROM public.custom_pages
          WHERE slug = ANY(${sql.array(createdSlugs)})
          ORDER BY slug
        `
      : [];

    const badStatus = createdRows.filter((r) => r.status !== "draft" || r.noindex !== true);
    const bareHyderabad = await sql`SELECT id, slug, status FROM public.custom_pages WHERE slug = 'hyderabad-chat-room'`;
    const hyBoth = await sql`
      SELECT slug, status, noindex, page_type, country_id, city_id
      FROM public.custom_pages
      WHERE slug IN ('hyderabad-india-chat-room', 'hyderabad-pakistan-chat-room')
      ORDER BY slug
    `;
    const lahoreFinal = (await sql`
      SELECT id, slug, status, updated_at, page_type, country_id, state_id, city_id, category_id,
             template_id, keyword_group_id, content
      FROM public.custom_pages WHERE id = ${LAHORE_ID}::uuid
    `)[0];
    const lahoreHashFinal = sha(lahoreFinal.content);
    const publishedLeak = createdSlugs.length
      ? await sql`
          SELECT slug, status FROM public.custom_pages
          WHERE slug = ANY(${sql.array(createdSlugs)}) AND status <> 'draft'
        `
      : [];
    const sitemapCandidates = createdSlugs.length
      ? await sql`
          SELECT slug FROM public.custom_pages
          WHERE status = 'published' AND coalesce(noindex, false) = false
            AND slug = ANY(${sql.array(createdSlugs)})
        `
      : [];

    const verify = {
      attempted: genReport.attempted,
      created: genReport.created,
      skipped: genReport.skipped,
      failed: genReport.failed,
      expected: { attempted_ready: 27, created: 27, skipped_min_lahore: 1, failed: 0 },
      all_draft_noindex: badStatus.length === 0,
      bare_hyderabad_absent: bareHyderabad.length === 0,
      hyderabad_both_present: hyBoth.length === 2,
      no_accidental_publish: publishedLeak.length === 0,
      sitemap_leak_count: sitemapCandidates.length,
      lahore_integrity: {
        sameId: lahoreFinal.id === LAHORE_ID,
        sameSlug: lahoreFinal.slug === LAHORE_SLUG,
        sameUpdated: String(lahoreFinal.updated_at) === String(lahoreBefore.updated_at),
        sameHash: lahoreHashFinal === lahoreHashBefore,
        page_type_null: lahoreFinal.page_type == null,
        taxonomy_null: !lahoreFinal.country_id && !lahoreFinal.state_id && !lahoreFinal.city_id && !lahoreFinal.category_id,
        template_null: lahoreFinal.template_id == null,
        keyword_group_null: lahoreFinal.keyword_group_id == null,
      },
      sample_rows: createdRows.slice(0, 6),
      hyderabad_rows: hyBoth,
    };

    writeFileSync("/tmp/phase4b2-verify.json", JSON.stringify(verify, null, 2));
    console.log("=== Phase 4B.2 verification ===");
    console.log(JSON.stringify(verify, null, 2));
    console.log("STOP after Phase 4B.2 — drafts only, not published/indexed.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
