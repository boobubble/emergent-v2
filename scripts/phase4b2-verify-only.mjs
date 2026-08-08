#!/usr/bin/env node
/**
 * Phase 4B.2 READ-ONLY verification. Never inserts/updates/deletes.
 * Usage: npx tsx scripts/phase4b2-verify-only.mjs
 * Requires SUPABASE_DB_URL in the environment.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { customPageSitemapEntries, formatSitemapLastmod } from "../src/lib/seo/sitemap.ts";

const root = process.cwd();
const LAHORE_ID = "e26569bc-f359-47a6-9646-2da179ee183a";
const EXPECTED_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";
const EXPECTED_UPDATED = "2026-08-04T08:29:37.012987+00:00";

const EXPECTED_DRAFT_SLUGS = [
  "pakistan-chat-room", "india-chat-room",
  "karachi-chat-room", "islamabad-chat-room", "rawalpindi-chat-room", "faisalabad-chat-room",
  "multan-chat-room", "gujranwala-chat-room", "peshawar-chat-room", "quetta-chat-room",
  "sialkot-chat-room", "hyderabad-pakistan-chat-room",
  "delhi-chat-room", "mumbai-chat-room", "bengaluru-chat-room", "hyderabad-india-chat-room",
  "chennai-chat-room", "kolkata-chat-room", "pune-chat-room", "ahmedabad-chat-room",
  "surat-chat-room", "jaipur-chat-room",
  "girls-chat-room", "dating-chat-room", "friendship-chat-room", "free-chat-room", "random-chat-room",
];

const SAMPLE_SLUGS = [
  "pakistan-chat-room", "karachi-chat-room", "mumbai-chat-room",
  "hyderabad-india-chat-room", "girls-chat-room",
];

function loadEnv() {
  const out = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      if (out[m[1]] == null || out[m[1]] === "") out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  return out;
}

function sha(content) {
  return createHash("sha256").update(content || "").digest("hex");
}

async function main() {
  const env = loadEnv();
  const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
  if (!dbUrl) {
    console.error("BLOCKED: SUPABASE_DB_URL required for read-only verification");
    process.exit(2);
  }

  // Smoke-test Date lastmod helper before DB work
  const dateSmoke = formatSitemapLastmod(new Date("2026-08-08T06:27:22.166Z"));
  if (dateSmoke !== "2026-08-08") throw new Error(`formatSitemapLastmod Date failed: ${dateSmoke}`);

  const sql = postgres(dbUrl, { max: 1, prepare: false, ssl: "require" });
  const anon = createClient(
    env.VITE_SUPABASE_URL || env.SUPABASE_URL,
    env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY,
  );

  try {
    const [counts] = await sql`
      SELECT
        COUNT(*)::int AS total_pages,
        COUNT(*) FILTER (WHERE status = 'draft')::int AS drafts,
        COUNT(*) FILTER (WHERE status = 'published')::int AS published,
        COUNT(*) FILTER (WHERE noindex = true)::int AS noindex_pages
      FROM public.custom_pages
    `;

    const pages = await sql`
      SELECT slug, title, status, noindex, page_type, created_at, updated_at
      FROM public.custom_pages ORDER BY created_at ASC
    `;
    const draftSlugs = pages.filter((p) => p.status === "draft").map((p) => p.slug).sort();
    const missing = EXPECTED_DRAFT_SLUGS.filter((s) => !draftSlugs.includes(s));
    const unexpectedDrafts = draftSlugs.filter((s) => !EXPECTED_DRAFT_SLUGS.includes(s));
    const bareHyderabad = pages.filter((p) => p.slug === "hyderabad-chat-room");
    const lahoreDupes = pages.filter((p) => p.slug === "lahore-chat-room");

    const samples = await sql`
      SELECT id, slug, title, status, noindex, page_type,
             country_id, state_id, city_id, category_id,
             keyword_group_id, template_id, primary_keyword, h1,
             meta_title, meta_description,
             (intro_content IS NOT NULL AND length(intro_content) > 0) AS has_intro,
             (content IS NOT NULL AND length(content) > 0) AS has_content,
             (cta_content IS NOT NULL) AS has_cta,
             (faq_content IS NOT NULL) AS has_faq,
             content_status, seo_score, internal_link_count, published_at
      FROM public.custom_pages
      WHERE slug = ANY(${sql.array(SAMPLE_SLUGS)})
      ORDER BY slug
    `;

    const hy = await sql`
      SELECT slug, status, noindex, page_type, country_id, city_id
      FROM public.custom_pages
      WHERE slug LIKE 'hyderabad%chat-room'
      ORDER BY slug
    `;

    const lahore = (await sql`
      SELECT id, slug, status, updated_at, page_type, country_id, state_id, city_id, category_id,
             template_id, keyword_group_id, content, noindex
      FROM public.custom_pages WHERE id = ${LAHORE_ID}::uuid
    `)[0];
    const lahoreHash = sha(lahore?.content);

    // Sitemap: only published+indexable should be included; drafts must not leak.
    const publishedRows = await sql`
      SELECT slug, updated_at, published_at, noindex, status
      FROM public.custom_pages WHERE status = 'published'
    `;
    // Exercise Date objects from postgres.js through the fixed helper
    const sitemapEntries = customPageSitemapEntries(
      publishedRows.filter((p) => !p.noindex),
      new Set(),
      { canonical_domain: "https://yaarzo.com" },
    );
    const draftLeak = sitemapEntries.filter((e) =>
      EXPECTED_DRAFT_SLUGS.some((s) => e.loc.endsWith("/" + s)),
    );

    // Public resolver checks via anon (published-only) + live HTTP
    const publicChecks = {};
    for (const slug of ["karachi-chat-room", "mumbai-chat-room", "hyderabad-india-chat-room", "lahore-chat-room"]) {
      const { data } = await anon
        .from("custom_pages")
        .select("id,slug,status")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      publicChecks[slug] = { published_via_anon: data };
    }

    const httpChecks = {};
    for (const slug of ["karachi-chat-room", "mumbai-chat-room", "hyderabad-india-chat-room", "lahore-chat-room"]) {
      try {
        const res = await fetch(`https://yaarzo.com/${slug}`, { redirect: "manual" });
        httpChecks[slug] = { status: res.status };
      } catch (e) {
        httpChecks[slug] = { error: e instanceof Error ? e.message : String(e) };
      }
    }

    let sitemapXmlHasDrafts = null;
    try {
      const xml = await (await fetch("https://yaarzo.com/sitemap.xml")).text();
      sitemapXmlHasDrafts = EXPECTED_DRAFT_SLUGS.filter((s) => xml.includes(`/${s}</loc>`) || xml.includes(`/${s}"`));
      httpChecks.sitemap_has_lahore = xml.includes("/lahore-chat-room");
    } catch (e) {
      sitemapXmlHasDrafts = { error: e instanceof Error ? e.message : String(e) };
    }

    const report = {
      mode: "verify-only",
      phase: "4B.2-recovery",
      counts,
      counts_ok:
        counts.total_pages === 28 &&
        counts.drafts === 27 &&
        counts.published === 1 &&
        counts.noindex_pages === 27,
      draft_slugs: draftSlugs,
      missing_expected_drafts: missing,
      unexpected_drafts: unexpectedDrafts,
      bare_hyderabad_absent: bareHyderabad.length === 0,
      lahore_slug_count: lahoreDupes.length,
      samples,
      hyderabad: hy,
      lahore_integrity: {
        sameId: lahore?.id === LAHORE_ID,
        sameSlug: lahore?.slug === "lahore-chat-room",
        published: lahore?.status === "published",
        noindex_false: lahore?.noindex === false,
        sameUpdated: String(lahore?.updated_at) === EXPECTED_UPDATED || String(lahore?.updated_at).startsWith("2026-08-04T08:29:37"),
        sameHash: lahoreHash === EXPECTED_HASH,
        content_len: (lahore?.content || "").length,
        page_type_null: lahore?.page_type == null,
        taxonomy_null: !lahore?.country_id && !lahore?.state_id && !lahore?.city_id && !lahore?.category_id,
        template_null: lahore?.template_id == null,
        keyword_group_null: lahore?.keyword_group_id == null,
        hash: lahoreHash,
      },
      sitemap: {
        date_helper_smoke: dateSmoke,
        published_entries: sitemapEntries.map((e) => e.loc),
        draft_leaks_in_helper: draftLeak,
        public_sitemap_draft_hits: sitemapXmlHasDrafts,
        ok:
          draftLeak.length === 0 &&
          (Array.isArray(sitemapXmlHasDrafts) ? sitemapXmlHasDrafts.length === 0 : false),
      },
      public_visibility: { anon: publicChecks, http: httpChecks },
    };

    writeFileSync("/tmp/phase4b2-verify.json", JSON.stringify(report, null, 2));
    console.log("=== PHASE 4B.2 VERIFY-ONLY ===");
    console.log(JSON.stringify({
      counts: report.counts,
      counts_ok: report.counts_ok,
      missing_expected_drafts: report.missing_expected_drafts,
      unexpected_drafts: report.unexpected_drafts,
      bare_hyderabad_absent: report.bare_hyderabad_absent,
      lahore_slug_count: report.lahore_slug_count,
      hyderabad: report.hyderabad,
      lahore_integrity: report.lahore_integrity,
      samples_summary: samples.map((s) => ({
        slug: s.slug,
        status: s.status,
        noindex: s.noindex,
        page_type: s.page_type,
        has_intro: s.has_intro,
        has_content: s.has_content,
        has_cta: s.has_cta,
        has_faq: s.has_faq,
        content_status: s.content_status,
        seo_score: s.seo_score,
        internal_link_count: s.internal_link_count,
        has_template: !!s.template_id,
        has_kg: !!s.keyword_group_id,
        has_h1: !!s.h1,
        primary_keyword: s.primary_keyword,
      })),
      sitemap: report.sitemap,
      public_visibility: report.public_visibility,
    }, null, 2));
    console.log("Full report: /tmp/phase4b2-verify.json");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
