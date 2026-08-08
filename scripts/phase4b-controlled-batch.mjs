#!/usr/bin/env node
/**
 * Phase 4B / 4B.1 controlled SEO page batch — PREVIEW FIRST.
 *
 * Usage:
 *   npx tsx scripts/phase4b-controlled-batch.mjs --preview
 *   npx tsx scripts/phase4b-controlled-batch.mjs --preview --live-templates
 *   npx tsx scripts/phase4b-controlled-batch.mjs --generate --live-templates
 *
 * Auth for --generate (never VITE_/client keys):
 *   1. Prefer SUPABASE_DB_URL / DATABASE_URL for privileged inserts of
 *      already-validated payloads (domain logic still runs in JS first).
 *   2. Else SUPABASE_SERVICE_ROLE_KEY via Supabase admin client.
 *
 * --live-templates: use DB page_templates as-is (no seed overlay). Required for Phase 4B.2.
 * --allow-high-similarity: permit generation when avg similarity is high but < clone threshold.
 *
 * Never overwrites Lahore. Never publishes.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import {
  conflictLabelFromSources,
  previewBulkRow,
  resolveBulkDuplicate,
  buildAmbiguousCityIndex,
} from "../src/lib/pages-cms/bulk-generate.ts";
import {
  buildTemplateVars,
  renderTemplate,
  renderCtaTemplate,
  renderFaqTemplate,
  deriveContentStatus,
  computeSeoScore,
} from "../src/lib/pages-cms/template-engine.ts";
import { extractContentBlocks } from "../src/lib/pages-cms/city-page-context.ts";
import { slugifyPageSlug, validatePageSlug } from "../src/lib/page-slug.ts";
import { customPageSitemapEntries } from "../src/lib/seo/sitemap.ts";
import { TEMPLATES } from "../src/lib/pages-cms/phase4a/taxonomy-data.ts";

const root = process.cwd();
const BRAND = "Yaarzo";
const LAHORE_ID = "e26569bc-f359-47a6-9646-2da179ee183a";
const LAHORE_SLUG = "lahore-chat-room";
const EXPECTED_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";

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

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const anon = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
const args = new Set(process.argv.slice(2));
const doGenerate = args.has("--generate");
const doPreview = args.has("--preview") || !doGenerate;
const liveTemplates = args.has("--live-templates");
const allowHighSimilarity = args.has("--allow-high-similarity");

const PK_CITY_SLUGS = [
  "karachi", "islamabad", "rawalpindi", "faisalabad", "multan",
  "gujranwala", "peshawar", "quetta", "sialkot", "hyderabad",
];
const PK_CONFLICT_ONLY = ["lahore"]; // preview conflict / SKIP — never insert
const IN_CITY_SLUGS = [
  "delhi", "mumbai", "bengaluru", "hyderabad", "chennai",
  "kolkata", "pune", "ahmedabad", "surat", "jaipur",
];
const CATEGORY_SLUGS = ["girls-chat", "dating-chat", "friendship-chat", "free-chat", "random-chat"];

const SIMILARITY_SAMPLE_SLUGS = [
  "karachi-chat-room",
  "islamabad-chat-room",
  "rawalpindi-chat-room",
  "mumbai-chat-room",
  "delhi-chat-room",
  "bengaluru-chat-room",
  "hyderabad-india-chat-room",
  "hyderabad-pakistan-chat-room",
];

function unresolvedTokens(...parts) {
  const hits = [];
  for (const p of parts) {
    const s = typeof p === "string" ? p : JSON.stringify(p ?? "");
    const m = s.match(/\{[a-z_]+\}/gi);
    if (m) hits.push(...m);
  }
  return [...new Set(hits)];
}

async function findConflicts(sb, slug) {
  const reservedErr = validatePageSlug(slug);
  const conflicts = [];
  if (reservedErr) conflicts.push({ source: "reserved", message: reservedErr });

  const [{ data: page }, { data: redirect }] = await Promise.all([
    sb.from("custom_pages").select("id,slug,status").eq("slug", slug).maybeSingle(),
    sb.from("page_redirects").select("from_slug").eq("from_slug", slug).maybeSingle(),
  ]);
  if (page) conflicts.push({ source: "custom_page", existingId: page.id, message: `exists:${page.status}` });
  if (redirect) conflicts.push({ source: "redirect", message: "redirect source" });
  return conflicts;
}

function annotate(row, conflicts, handling = "skip") {
  const resolved = resolveBulkDuplicate(handling, conflicts, row.slug, 1);
  const sources = conflicts.map((c) => c.source);
  return {
    ...row,
    duplicateStatus: resolved.action,
    existingId: resolved.existingId ?? conflicts.find((c) => c.existingId)?.existingId,
    conflictLabel: conflictLabelFromSources(sources, resolved.action),
    conflictSlug: resolved.action !== "ok" ? row.slug : undefined,
  };
}

function similarity(a, b) {
  const na = (a || "").replace(/\s+/g, " ").trim().toLowerCase();
  const nb = (b || "").replace(/\s+/g, " ").trim().toLowerCase();
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = new Set(na.split(/[^a-z0-9]+/).filter(Boolean));
  const tb = new Set(nb.split(/[^a-z0-9]+/).filter(Boolean));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / new Set([...ta, ...tb]).size;
}

function normalizeCityPageText(text, cityName, primaryKeyword) {
  return (text || "")
    .replace(new RegExp(cityName, "gi"), "{CITY}")
    .replace(new RegExp(primaryKeyword, "gi"), "{PK}");
}

function mergeTemplate(dbTpl, seedTpl) {
  if (!seedTpl) return dbTpl;
  return {
    ...dbTpl,
    intro_template: seedTpl.intro_template ?? dbTpl?.intro_template,
    content_template: seedTpl.content_template ?? dbTpl?.content_template,
    meta_title_template: seedTpl.meta_title_template ?? dbTpl?.meta_title_template,
    meta_description_template: seedTpl.meta_description_template ?? dbTpl?.meta_description_template,
    h1_template: seedTpl.h1_template ?? dbTpl?.h1_template,
    cta_template: seedTpl.cta_template ?? dbTpl?.cta_template,
    faq_template: seedTpl.faq_template ?? dbTpl?.faq_template,
  };
}

async function main() {
  if (!url || !anon) throw new Error("Missing Supabase URL/publishable key");
  const readSb = createClient(url, anon);
  const writeSb = service ? createClient(url, service, { auth: { persistSession: false } }) : null;

  const [
    { data: countries },
    { data: states },
    { data: cities },
    { data: categories },
    { data: keywordGroups },
    { data: templates },
  ] = await Promise.all([
    readSb.from("page_countries").select("*").eq("is_active", true),
    readSb.from("page_states").select("*").eq("is_active", true),
    readSb.from("page_cities").select("*").eq("is_active", true),
    readSb.from("page_categories").select("*").eq("is_active", true),
    readSb.from("page_keyword_groups").select("*").eq("is_active", true),
    readSb.from("page_templates").select("*").eq("is_active", true),
  ]);

  const byCountrySlug = Object.fromEntries((countries || []).map((c) => [c.slug, c]));
  const countryById = Object.fromEntries((countries || []).map((c) => [c.id, c]));
  const stateById = Object.fromEntries((states || []).map((s) => [s.id, s]));
  const cityByKey = Object.fromEntries((cities || []).map((c) => {
    const cslug = countryById[c.country_id]?.slug;
    return [`${cslug}:${c.slug}`, c];
  }));
  const catBySlug = Object.fromEntries((categories || []).map((c) => [c.slug, c]));
  const kgBySlug = Object.fromEntries((keywordGroups || []).map((k) => [k.slug, k]));
  const tplBySlug = Object.fromEntries((templates || []).map((t) => [t.slug, t]));
  const seedTplBySlug = Object.fromEntries(TEMPLATES.map((t) => [t.slug, t]));

  const countryKg = kgBySlug["country-chat-room"];
  const cityKg = kgBySlug["city-chat-room"];

  // Phase 4B.2: --live-templates uses DB rows only (after migration apply).
  // Phase 4B.1 preview may overlay seed templates before migration is applied.
  const countryTpl = liveTemplates
    ? tplBySlug["country-chat-room"]
    : mergeTemplate(tplBySlug["country-chat-room"], seedTplBySlug["country-chat-room"]);
  const cityTpl = liveTemplates
    ? tplBySlug["city-chat-room"]
    : mergeTemplate(tplBySlug["city-chat-room"], seedTplBySlug["city-chat-room"]);
  const categoryTpl = liveTemplates
    ? tplBySlug["category-chat-room"]
    : mergeTemplate(tplBySlug["category-chat-room"], seedTplBySlug["category-chat-room"]);
  if (!countryKg || !cityKg || !countryTpl || !cityTpl || !categoryTpl) {
    throw new Error("Missing required keyword groups/templates from Phase 4A");
  }
  if (liveTemplates) {
    const cityHasBlocks = /data-block="nearby"/.test(cityTpl.content_template || "");
    const cityHasCta = !!(cityTpl.cta_template && Object.keys(cityTpl.cta_template).length);
    if (!cityHasBlocks || !cityHasCta) {
      throw new Error(
        "Live DB city template missing Phase 4B.1 content blocks/CTA. Apply template migration first.",
      );
    }
  }

  const categoryKg = kgBySlug["category-chat-room"] || {
    id: cityKg.id,
    name: "Category Chat Room",
    slug: "category-chat-room",
    primary_pattern: "{category} Room",
    title_pattern: "{primary_keyword} | {brand}",
    meta_title_pattern: "{primary_keyword} | {brand}",
    meta_description_pattern: "Explore {category} on {brand}. Chat online, meet people, and join free rooms in {year}.",
    h1_pattern: "{primary_keyword}",
    slug_pattern: "{category}-room",
    _ephemeral: !kgBySlug["category-chat-room"],
  };

  // Full taxonomy catalog for ambiguity + nearby blocks
  const cityCatalog = (cities || []).map((c) => {
    const country = countryById[c.country_id];
    const state = c.state_id ? stateById[c.state_id] : null;
    return {
      name: c.name,
      slug: c.slug,
      stateSlug: state?.slug ?? null,
      countrySlug: country?.slug ?? "",
    };
  }).filter((c) => c.countrySlug);
  const ambiguousCities = buildAmbiguousCityIndex(
    cityCatalog.map((c) => ({ name: c.name, slug: c.slug, countrySlug: c.countrySlug })),
  );

  const proposed = [];

  // --- Country pages ---
  for (const cslug of ["pakistan", "india"]) {
    const c = byCountrySlug[cslug];
    if (!c) throw new Error(`Missing country ${cslug}`);
    const loc = {
      countryId: c.id,
      countryName: c.name,
      countrySlug: c.slug,
      stateId: null,
      stateName: null,
      stateSlug: null,
      cityId: null,
      cityName: null,
      citySlug: null,
    };
    const row = previewBulkRow({
      page_type: "country",
      brand: BRAND,
      status: "draft",
      locations: [loc],
      category: null,
      keywordGroup: countryKg,
      template: countryTpl,
      duplicateHandling: "skip",
      noindex: true,
      language: "en",
      cityCatalog,
      ambiguousCities,
    }, loc);
    proposed.push({
      ...row,
      keyword_group: countryKg.slug,
      template: countryTpl.slug,
      status: "draft",
      noindex: true,
      batch: "country",
      generate: true,
    });
  }

  // --- Pakistan cities (incl Lahore conflict-only) ---
  for (const slug of [...PK_CITY_SLUGS, ...PK_CONFLICT_ONLY]) {
    const city = cityByKey[`pakistan:${slug}`];
    if (!city) throw new Error(`Missing Pakistan city ${slug}`);
    const st = city.state_id ? stateById[city.state_id] : null;
    const c = byCountrySlug.pakistan;
    const loc = {
      countryId: c.id,
      countryName: c.name,
      countrySlug: c.slug,
      stateId: st?.id ?? null,
      stateName: st?.name ?? null,
      stateSlug: st?.slug ?? null,
      cityId: city.id,
      cityName: city.name,
      citySlug: city.slug,
    };
    const row = previewBulkRow({
      page_type: "city",
      brand: BRAND,
      status: "draft",
      locations: [loc],
      category: null,
      keywordGroup: cityKg,
      template: cityTpl,
      duplicateHandling: "skip",
      noindex: true,
      language: "en",
      cityCatalog,
      ambiguousCities,
    }, loc);
    proposed.push({
      ...row,
      keyword_group: cityKg.slug,
      template: cityTpl.slug,
      status: "draft",
      noindex: true,
      batch: "pakistan-city",
      generate: !PK_CONFLICT_ONLY.includes(slug),
    });
  }

  // --- India cities ---
  for (const slug of IN_CITY_SLUGS) {
    const city = cityByKey[`india:${slug}`];
    if (!city) throw new Error(`Missing India city ${slug}`);
    const st = city.state_id ? stateById[city.state_id] : null;
    const c = byCountrySlug.india;
    const loc = {
      countryId: c.id,
      countryName: c.name,
      countrySlug: c.slug,
      stateId: st?.id ?? null,
      stateName: st?.name ?? null,
      stateSlug: st?.slug ?? null,
      cityId: city.id,
      cityName: city.name,
      citySlug: city.slug,
    };
    const row = previewBulkRow({
      page_type: "city",
      brand: BRAND,
      status: "draft",
      locations: [loc],
      category: null,
      keywordGroup: cityKg,
      template: cityTpl,
      duplicateHandling: "skip",
      noindex: true,
      language: "en",
      cityCatalog,
      ambiguousCities,
    }, loc);
    proposed.push({
      ...row,
      keyword_group: cityKg.slug,
      template: cityTpl.slug,
      status: "draft",
      noindex: true,
      batch: "india-city",
      generate: true,
    });
  }

  // --- Category hubs ---
  for (const cslug of CATEGORY_SLUGS) {
    const cat = catBySlug[cslug];
    if (!cat) throw new Error(`Missing category ${cslug}`);
    const vars0 = buildTemplateVars({
      brand: BRAND,
      country: "",
      state: "",
      city: "",
      category: cat.name,
      primary_keyword: "",
    });
    const primary = renderTemplate(categoryKg.primary_pattern, vars0).trim();
    const vars = buildTemplateVars({
      brand: BRAND,
      country: "",
      state: "",
      city: "",
      category: cat.name,
      primary_keyword: primary,
    });
    const slugPattern = categoryKg.slug_pattern || categoryTpl.slug_template || "{category}-room";
    const titlePattern = categoryKg.title_pattern || categoryTpl.title_template || "{primary_keyword} | {brand}";
    const metaTitle = categoryKg.meta_title_pattern || categoryTpl.meta_title_template || titlePattern;
    const metaDesc = categoryKg.meta_description_pattern || categoryTpl.meta_description_template || "";
    const h1Pattern = categoryKg.h1_pattern || categoryTpl.h1_template || "{primary_keyword}";
    const slug = slugifyPageSlug(renderTemplate(slugPattern, vars));
    proposed.push({
      title: renderTemplate(titlePattern, vars) || primary,
      slug,
      h1: renderTemplate(h1Pattern, vars) || null,
      primary_keyword: primary,
      meta_title: renderTemplate(metaTitle, vars) || null,
      meta_description: renderTemplate(metaDesc, vars) || null,
      intro_content: categoryTpl.intro_template ? renderTemplate(categoryTpl.intro_template, vars) : null,
      content: categoryTpl.content_template ? renderTemplate(categoryTpl.content_template, vars) : "",
      cta_content: renderCtaTemplate(categoryTpl.cta_template, vars),
      faq_content: renderFaqTemplate(categoryTpl.faq_template, vars),
      location: { country: null, state: null, city: null },
      category: cat.name,
      country_id: null,
      state_id: null,
      city_id: null,
      category_id: cat.id,
      keyword_group_id: categoryKg.id,
      template_id: categoryTpl.id,
      page_type: "category",
      keyword_group: categoryKg.slug,
      template: categoryTpl.slug,
      status: "draft",
      noindex: true,
      batch: "category",
      generate: true,
      slug_disambiguated: false,
    });
  }

  // Annotate conflicts
  const annotated = [];
  const usedSlugs = new Set();
  for (const row of proposed) {
    const conflicts = await findConflicts(readSb, row.slug);
    if (usedSlugs.has(row.slug) && !conflicts.some((c) => c.source === "custom_page")) {
      conflicts.push({
        source: "custom_page",
        existingId: annotated.find((a) => a.slug === row.slug)?.existingId,
        message: `batch collision: slug already proposed earlier in this Phase 4B preview`,
      });
    }
    const ann = annotate(row, conflicts, "skip");
    if (ann.conflictLabel === "Ready" || ann.duplicateStatus === "ok" || ann.conflictLabel === "Existing Page") {
      usedSlugs.add(ann.slug);
    }
    annotated.push(ann);
  }

  const previewRows = annotated.map((r) => {
    const willGenerate =
      !!r.generate &&
      r.conflictLabel === "Ready" &&
      r.duplicateStatus === "ok" &&
      r.slug !== LAHORE_SLUG;
    return {
      title: r.title,
      slug: r.slug,
      page_type: r.page_type,
      country: r.location?.country ?? null,
      state: r.location?.state ?? null,
      city: r.location?.city ?? null,
      category: r.category,
      primary_keyword: r.primary_keyword,
      keyword_group: r.keyword_group,
      template: r.template,
      status: r.status,
      noindex: r.noindex,
      conflict: r.conflictLabel,
      duplicateStatus: r.duplicateStatus,
      existingId: r.existingId ?? null,
      generate: willGenerate,
      slug_disambiguated: !!r.slug_disambiguated,
      batch: r.batch,
    };
  });

  const lahore = annotated.find((r) => r.slug === LAHORE_SLUG);
  const hyIn = annotated.find((r) => r.slug === "hyderabad-india-chat-room");
  const hyPk = annotated.find((r) => r.slug === "hyderabad-pakistan-chat-room");

  const samples = {};
  for (const slug of ["pakistan-chat-room", "karachi-chat-room", "mumbai-chat-room", "girls-chat-room", "hyderabad-india-chat-room", "hyderabad-pakistan-chat-room"]) {
    const row = annotated.find((r) => r.slug === slug);
    if (!row) continue;
    samples[slug] = {
      seo_title: row.meta_title,
      slug: row.slug,
      h1: row.h1,
      meta_description: row.meta_description,
      intro: row.intro_content,
      content: row.content,
      cta: row.cta_content ?? null,
      faq: row.faq_content ?? null,
      blocks: extractContentBlocks(row.content || ""),
      unresolved_tokens: unresolvedTokens(
        row.title, row.slug, row.h1, row.meta_title, row.meta_description, row.intro_content, row.content,
        row.cta_content, row.faq_content,
      ),
    };
  }

  // Content differentiation among selected city drafts
  const sampleRows = SIMILARITY_SAMPLE_SLUGS
    .map((s) => annotated.find((r) => r.slug === s))
    .filter(Boolean);
  const pairs = [];
  const blockDiffSummary = {
    identical_blocks: {},
    differentiated_blocks: {},
  };
  for (const block of ["location", "nearby", "country_context", "how_it_works"]) {
    blockDiffSummary.identical_blocks[block] = 0;
    blockDiffSummary.differentiated_blocks[block] = 0;
  }

  for (let i = 0; i < sampleRows.length; i++) {
    for (let j = i + 1; j < sampleRows.length; j++) {
      const a = sampleRows[i];
      const b = sampleRows[j];
      const ca = normalizeCityPageText(a.content, a.location.city, a.primary_keyword);
      const cb = normalizeCityPageText(b.content, b.location.city, b.primary_keyword);
      const blocksA = extractContentBlocks(a.content || "");
      const blocksB = extractContentBlocks(b.content || "");
      const blockSims = {};
      for (const block of Object.keys(blockDiffSummary.identical_blocks)) {
        const ba = normalizeCityPageText(blocksA[block] || "", a.location.city, a.primary_keyword);
        const bb = normalizeCityPageText(blocksB[block] || "", b.location.city, b.primary_keyword);
        const sim = Number(similarity(ba, bb).toFixed(3));
        blockSims[block] = sim;
        if (sim >= 0.99) blockDiffSummary.identical_blocks[block]++;
        else blockDiffSummary.differentiated_blocks[block]++;
      }
      pairs.push({
        a: a.slug,
        b: b.slug,
        content_similarity: Number(similarity(ca, cb).toFixed(3)),
        intro_similarity: Number(similarity(
          normalizeCityPageText(a.intro_content || "", a.location.city, a.primary_keyword),
          normalizeCityPageText(b.intro_content || "", b.location.city, b.primary_keyword),
        ).toFixed(3)),
        block_similarity: blockSims,
        drivers: {
          a_state: a.location.state,
          b_state: b.location.state,
          a_country: a.location.country,
          b_country: b.location.country,
          a_disambiguated: !!a.slug_disambiguated,
          b_disambiguated: !!b.slug_disambiguated,
        },
      });
    }
  }
  const avgSim = pairs.length ? pairs.reduce((s, p) => s + p.content_similarity, 0) / pairs.length : 0;
  const stillClones = avgSim >= 0.95;
  const duplication = {
    sample_slugs: sampleRows.map((r) => r.slug),
    assessed_pairs: pairs,
    average_content_similarity_after_city_normalization: Number(avgSim.toFixed(3)),
    block_diff_summary: blockDiffSummary,
    differentiation_drivers: [
      "state/province in location_context",
      "related/nearby city lists from taxonomy (same state first)",
      "country_context paragraph keyed by country slug",
      "language_note using country name",
      "country-qualified slug when city name is ambiguous",
    ],
    assessment: stillClones
      ? "STILL ESSENTIALLY CLONES — STOP before generation; further differentiation required."
      : avgSim >= 0.8
        ? "IMPROVED BUT STILL HIGHLY TEMPLATE-SIMILAR — taxonomy-driven blocks differ; review before scale."
        : "Acceptable scaffold differentiation for Phase 4B controlled draft generation.",
    stop_before_generation_if_clones: stillClones,
  };

  const readyToGenerate = annotated.filter((r) => r.generate && r.conflictLabel === "Ready" && r.duplicateStatus === "ok");
  const skippedPreview = annotated.filter((r) => !r.generate || r.conflictLabel !== "Ready");

  const authRecommendation = {
    prefer: "SUPABASE_DB_URL (or DATABASE_URL) for privileged INSERT of validated payloads",
    fallback: "SUPABASE_SERVICE_ROLE_KEY via supabase-js admin client",
    never: "VITE_* / publishable keys for writes",
    db_url_present: !!dbUrl,
    service_role_present: !!service,
    rationale:
      "Phase 2 bulk engine validates slug conflicts, duplicate handling, content_status, seo_score, and draft/noindex in JS. " +
      "A privileged DB connection may then insert those payloads without exposing service-role to the client. " +
      "Service role remains acceptable for the same path when DB URL is unavailable, but must stay server-only.",
  };

  const previewReport = {
    mode: "preview",
    phase: liveTemplates ? "4B.2" : "4B.1",
    template_source: liveTemplates ? "database" : "database+seed_overlay",
    preview_count: annotated.length,
    conflict_counts: {
      Ready: annotated.filter((r) => r.conflictLabel === "Ready").length,
      "Existing Page": annotated.filter((r) => r.conflictLabel === "Existing Page").length,
      "Reserved Route": annotated.filter((r) => r.conflictLabel === "Reserved Route").length,
      "Redirect Conflict": annotated.filter((r) => r.conflictLabel === "Redirect Conflict").length,
      Invalid: annotated.filter((r) => r.conflictLabel === "Invalid").length,
    },
    city_slug_policy: {
      unique: "{city}-chat-room",
      ambiguous: "{city}-{country}-chat-room",
      ambiguous_city_names: [...ambiguousCities.names],
      ambiguous_city_slugs: [...ambiguousCities.slugs],
    },
    lahore_conflict: lahore
      ? {
          slug: lahore.slug,
          conflict: lahore.conflictLabel,
          duplicateStatus: lahore.duplicateStatus,
          existingId: lahore.existingId,
          generate_flag: lahore.generate,
          expected: "Existing Page → SKIP (not inserted)",
          ok:
            lahore.conflictLabel === "Existing Page" &&
            lahore.duplicateStatus === "skip" &&
            lahore.existingId === LAHORE_ID &&
            lahore.generate === false,
        }
      : { error: "Lahore missing from preview" },
    hyderabad_india: hyIn
      ? {
          slug: hyIn.slug,
          conflict: hyIn.conflictLabel,
          generate: hyIn.generate && hyIn.conflictLabel === "Ready",
          slug_disambiguated: hyIn.slug_disambiguated,
          expected: "Ready / hyderabad-india-chat-room",
          ok: hyIn.slug === "hyderabad-india-chat-room" && hyIn.conflictLabel === "Ready",
        }
      : { error: "missing" },
    hyderabad_pakistan: hyPk
      ? {
          slug: hyPk.slug,
          conflict: hyPk.conflictLabel,
          generate: hyPk.generate && hyPk.conflictLabel === "Ready",
          slug_disambiguated: hyPk.slug_disambiguated,
          expected: "Ready / hyderabad-pakistan-chat-room",
          ok: hyPk.slug === "hyderabad-pakistan-chat-room" && hyPk.conflictLabel === "Ready",
        }
      : { error: "missing" },
    ready_for_generation_count: readyToGenerate.length,
    skipped_or_conflict_count: skippedPreview.length,
    rows: previewRows,
    samples,
    unresolved_token_check: Object.fromEntries(
      Object.entries(samples).map(([k, v]) => [k, v.unresolved_tokens]),
    ),
    duplication,
    auth_recommendation: authRecommendation,
    generate_gate: {
      db_url_present: !!dbUrl,
      service_role_present: !!service,
      will_insert_on_generate: readyToGenerate.map((r) => r.slug),
      will_never_insert: annotated.filter((r) => !r.generate).map((r) => r.slug),
      blocked_reason: stillClones
        ? "Content still excessively repetitive — do not generate until differentiation improves."
        : (!dbUrl && !service)
          ? "No SUPABASE_DB_URL or SUPABASE_SERVICE_ROLE_KEY in this environment."
          : null,
    },
  };

  writeFileSync("/tmp/phase4b-preview.json", JSON.stringify(previewReport, null, 2));
  console.log("=== PHASE 4B.1 PREVIEW ===");
  console.log(JSON.stringify({
    preview_count: previewReport.preview_count,
    conflict_counts: previewReport.conflict_counts,
    lahore_conflict: previewReport.lahore_conflict,
    hyderabad_india: previewReport.hyderabad_india,
    hyderabad_pakistan: previewReport.hyderabad_pakistan,
    ready_for_generation_count: previewReport.ready_for_generation_count,
    unresolved_token_check: previewReport.unresolved_token_check,
    duplication_assessment: duplication.assessment,
    avg_similarity: duplication.average_content_similarity_after_city_normalization,
    block_diff_summary: blockDiffSummary,
    auth: {
      db_url_present: !!dbUrl,
      service_role_present: !!service,
    },
  }, null, 2));
  console.log("Full preview written to /tmp/phase4b-preview.json");

  if (!doGenerate) {
    console.log("\nSTOP after Phase 4B.1 preview (do not generate until explicitly approved).");
    return;
  }

  if (stillClones) {
    console.error("BLOCKED: content still essentially clones — refusing generation.");
    process.exit(3);
  }
  if (!allowHighSimilarity && avgSim >= 0.8) {
    console.error(
      "BLOCKED: average similarity still high. Re-run with --allow-high-similarity only for the approved Phase 4B.2 draft test batch.",
    );
    process.exit(3);
  }

  if (!dbUrl && !writeSb) {
    console.error("BLOCKED: need SUPABASE_DB_URL (preferred) or SUPABASE_SERVICE_ROLE_KEY for inserts.");
    process.exit(2);
  }

  // Ensure category keyword group exists for FK integrity
  let categoryKgId = categoryKg.id;
  if (categoryKg._ephemeral || !kgBySlug["category-chat-room"]) {
    if (!writeSb && !dbUrl) throw new Error("Cannot upsert category KG without privileged write access");
    if (writeSb) {
      const { data: upserted, error } = await writeSb
        .from("page_keyword_groups")
        .upsert({
          name: "Category Chat Room",
          slug: "category-chat-room",
          primary_pattern: "{category} Room",
          secondary_patterns: ["{category} rooms", "free {category}"],
          title_pattern: "{primary_keyword} | {brand}",
          meta_title_pattern: "{primary_keyword} | {brand}",
          meta_description_pattern: "Explore {category} on {brand}. Chat online, meet people, and join free rooms in {year}.",
          h1_pattern: "{primary_keyword}",
          slug_pattern: "{category}-room",
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "slug" })
        .select("id,slug")
        .single();
      if (error) throw new Error(`category KG upsert failed: ${error.message}`);
      categoryKgId = upserted.id;
    }
  }

  const sql = dbUrl
    ? postgres(dbUrl, { max: 1, prepare: false, ssl: "require" })
    : null;

  if (sql && (categoryKg._ephemeral || !kgBySlug["category-chat-room"])) {
    const upserted = await sql`
      INSERT INTO public.page_keyword_groups (
        name, slug, primary_pattern, secondary_patterns, title_pattern, meta_title_pattern,
        meta_description_pattern, h1_pattern, slug_pattern, is_active, updated_at
      ) VALUES (
        'Category Chat Room', 'category-chat-room', '{category} Room',
        ARRAY['{category} rooms', 'free {category}']::text[],
        '{primary_keyword} | {brand}', '{primary_keyword} | {brand}',
        'Explore {category} on {brand}. Chat online, meet people, and join free rooms in {year}.',
        '{primary_keyword}', '{category}-room', true, now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        primary_pattern = EXCLUDED.primary_pattern,
        is_active = true,
        updated_at = now()
      RETURNING id, slug
    `;
    categoryKgId = upserted[0].id;
  }

  async function insertValidated(payload) {
    // Reuse Phase 2 domain fields; privileged write only.
    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO public.custom_pages (
            slug, title, content, status, featured, layout, sidebar_left, sidebar_right,
            page_type, country_id, state_id, city_id, category_id, keyword_group_id, template_id,
            h1, primary_keyword, secondary_keywords, language, intro_content, faq_content, cta_content,
            meta_title, meta_description, noindex, nofollow, content_status, seo_score,
            internal_link_count, published_at, updated_at
          ) VALUES (
            ${payload.slug}, ${payload.title}, ${payload.content}, ${payload.status}, false, 'boxed', 'none', 'none',
            ${payload.page_type}, ${payload.country_id}, ${payload.state_id}, ${payload.city_id}, ${payload.category_id},
            ${payload.keyword_group_id}, ${payload.template_id},
            ${payload.h1}, ${payload.primary_keyword}, ${sql.array(payload.secondary_keywords ?? [])}::text[], ${payload.language},
            ${payload.intro_content}, ${sql.json(payload.faq_content ?? null)}, ${sql.json(payload.cta_content ?? null)},
            ${payload.meta_title}, ${payload.meta_description}, ${payload.noindex}, false,
            ${payload.content_status}, ${payload.seo_score}, 0, null, ${payload.updated_at}
          )
          RETURNING id, slug, status, page_type, noindex, content_status, seo_score, internal_link_count
        `;
        return { data: rows[0], error: null };
      } catch (e) {
        return { data: null, error: e };
      }
    }
    const { data, error } = await writeSb.from("custom_pages").insert(payload).select("id,slug,status,page_type,noindex,content_status,seo_score,internal_link_count").single();
    return { data, error };
  }

  // Lahore before
  const lahoreBeforeRes = writeSb
    ? await writeSb.from("custom_pages").select("id,slug,status,updated_at,page_type,country_id,state_id,city_id,category_id,content").eq("id", LAHORE_ID).single()
    : await sql`SELECT id, slug, status, updated_at, page_type, country_id, state_id, city_id, category_id, content FROM public.custom_pages WHERE id = ${LAHORE_ID}::uuid`;
  const lahoreBefore = writeSb ? lahoreBeforeRes.data : lahoreBeforeRes[0];
  const beforeHash = createHash("sha256").update(lahoreBefore?.content || "").digest("hex");

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  const createdRows = [];

  try {
    for (const row of annotated) {
      if (!row.generate || row.conflictLabel !== "Ready" || row.duplicateStatus !== "ok" || row.slug === LAHORE_SLUG) {
        skipped++;
        continue;
      }

      const conflictClient = writeSb || readSb;
      const conflicts = await findConflicts(conflictClient, row.slug);
      // With DB URL, also check via SQL for draft rows anon cannot see
      if (sql) {
        const existing = await sql`SELECT id, status FROM public.custom_pages WHERE slug = ${row.slug} LIMIT 1`;
        if (existing.length) {
          skipped++;
          continue;
        }
      } else if (conflicts.length) {
        skipped++;
        continue;
      }

      const content = row.content || "";
      const content_status = deriveContentStatus(content);
      const seo_score = computeSeoScore({
        meta_title: row.meta_title,
        meta_description: row.meta_description,
        h1: row.h1,
        primary_keyword: row.primary_keyword,
        content,
        noindex: true,
      });

      const payload = {
        slug: row.slug,
        title: row.title,
        content,
        status: "draft",
        page_type: row.page_type,
        country_id: row.country_id,
        state_id: row.state_id,
        city_id: row.city_id,
        category_id: row.category_id,
        keyword_group_id: row.page_type === "category" ? categoryKgId : row.keyword_group_id,
        template_id: row.template_id,
        h1: row.h1,
        primary_keyword: row.primary_keyword,
        secondary_keywords: [],
        language: "en",
        intro_content: row.intro_content,
        faq_content: row.faq_content ?? null,
        cta_content: row.cta_content ?? null,
        meta_title: row.meta_title,
        meta_description: row.meta_description,
        noindex: true,
        content_status,
        seo_score,
        updated_at: new Date().toISOString(),
      };

      const { data: ins, error } = await insertValidated(payload);
      if (error) {
        failed++;
        errors.push({ slug: row.slug, error: error.message || String(error) });
      } else {
        created++;
        createdRows.push(ins);
      }
    }

    const lahoreAfterRes = writeSb
      ? await writeSb.from("custom_pages").select("id,slug,status,updated_at,page_type,country_id,state_id,city_id,category_id,content").eq("id", LAHORE_ID).single()
      : await sql`SELECT id, slug, status, updated_at, page_type, country_id, state_id, city_id, category_id, content FROM public.custom_pages WHERE id = ${LAHORE_ID}::uuid`;
    const lahoreAfter = writeSb ? lahoreAfterRes.data : lahoreAfterRes[0];
    const afterHash = createHash("sha256").update(lahoreAfter?.content || "").digest("hex");

    const publicProbe = await readSb
      .from("custom_pages")
      .select("id,slug,status")
      .eq("slug", "karachi-chat-room")
      .eq("status", "published")
      .maybeSingle();

    const createdSlugs = createdRows.map((r) => r.slug);
    let publishedForSitemap = [];
    let sitemapEntries = [];
    let sitemapLeak = [];
    let sitemapError = null;
    try {
      if (writeSb) {
        const { data } = await writeSb.from("custom_pages").select("slug,updated_at,published_at,noindex,status").eq("status", "published");
        publishedForSitemap = data || [];
      } else if (sql) {
        publishedForSitemap = await sql`SELECT slug, updated_at, published_at, noindex, status FROM public.custom_pages WHERE status = 'published'`;
      }
      sitemapEntries = customPageSitemapEntries(
        (publishedForSitemap || []).filter((p) => !p.noindex),
        new Set(),
        { canonical_domain: "https://yaarzo.com" },
      );
      sitemapLeak = sitemapEntries.filter((e) => createdSlugs.some((s) => e.loc.endsWith("/" + s)));
    } catch (e) {
      // Generation itself succeeded; do not fail the whole run on post-check formatting bugs.
      sitemapError = e instanceof Error ? e.message : String(e);
      console.error("WARN: post-generation sitemap check failed:", sitemapError);
    }

    const genReport = {
      mode: "generate",
      attempted: readyToGenerate.length,
      created,
      skipped,
      failed,
      errors,
      created_rows: createdRows,
      write_path: sql ? "SUPABASE_DB_URL" : "SUPABASE_SERVICE_ROLE_KEY",
      lahore_integrity: {
        sameId: lahoreAfter?.id === LAHORE_ID,
        sameSlug: lahoreAfter?.slug === LAHORE_SLUG,
        sameUpdated: String(lahoreBefore?.updated_at) === String(lahoreAfter?.updated_at),
        sameHash: beforeHash === afterHash && afterHash === EXPECTED_HASH,
        page_type_null: lahoreAfter?.page_type == null,
        taxonomy_null: !lahoreAfter?.country_id && !lahoreAfter?.state_id && !lahoreAfter?.city_id && !lahoreAfter?.category_id,
        content_len: (lahoreAfter?.content || "").length,
      },
      public_visibility: {
        karachi_published_via_anon: publicProbe.data ?? null,
      },
      sitemap: {
        published_count: publishedForSitemap?.length ?? 0,
        leaked_phase4b_drafts: sitemapLeak,
        ok: sitemapError ? false : sitemapLeak.length === 0,
        error: sitemapError,
      },
    };

    writeFileSync("/tmp/phase4b-generate.json", JSON.stringify(genReport, null, 2));
    console.log("=== PHASE 4B GENERATE ===");
    console.log(JSON.stringify(genReport, null, 2));
  } finally {
    if (sql) await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
