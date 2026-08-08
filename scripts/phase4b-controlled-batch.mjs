#!/usr/bin/env node
/**
 * Phase 4B controlled SEO page batch — preview first, then optional generate.
 *
 * Usage:
 *   npx tsx scripts/phase4b-controlled-batch.mjs --preview
 *   npx tsx scripts/phase4b-controlled-batch.mjs --generate   # requires SERVICE_ROLE; draft+noindex+SKIP only
 *
 * Never overwrites Lahore. Never publishes.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  conflictLabelFromSources,
  previewBulkRow,
  resolveBulkDuplicate,
} from "../src/lib/pages-cms/bulk-generate.ts";
import { buildTemplateVars, renderTemplate, deriveContentStatus, computeSeoScore } from "../src/lib/pages-cms/template-engine.ts";
import { slugifyPageSlug, validatePageSlug } from "../src/lib/page-slug.ts";
import { customPageSitemapEntries } from "../src/lib/seo/sitemap.ts";

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
const args = new Set(process.argv.slice(2));
const doGenerate = args.has("--generate");
const doPreview = args.has("--preview") || !doGenerate;

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

const TOKEN_RE = /\{[a-z_]+\}/i;

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
  // token Jaccard
  const ta = new Set(na.split(/[^a-z0-9]+/).filter(Boolean));
  const tb = new Set(nb.split(/[^a-z0-9]+/).filter(Boolean));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / new Set([...ta, ...tb]).size;
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
  const stateById = Object.fromEntries((states || []).map((s) => [s.id, s]));
  const cityByKey = Object.fromEntries((cities || []).map((c) => {
    const cslug = countries.find((x) => x.id === c.country_id)?.slug;
    return [`${cslug}:${c.slug}`, c];
  }));
  const catBySlug = Object.fromEntries((categories || []).map((c) => [c.slug, c]));
  const kgBySlug = Object.fromEntries((keywordGroups || []).map((k) => [k.slug, k]));
  const tplBySlug = Object.fromEntries((templates || []).map((t) => [t.slug, t]));

  const countryKg = kgBySlug["country-chat-room"];
  const cityKg = kgBySlug["city-chat-room"];
  const countryTpl = tplBySlug["country-chat-room"];
  const cityTpl = tplBySlug["city-chat-room"];
  const categoryTpl = tplBySlug["category-chat-room"];
  if (!countryKg || !cityKg || !countryTpl || !cityTpl || !categoryTpl) {
    throw new Error("Missing required keyword groups/templates from Phase 4A");
  }

  // Ephemeral category keyword patterns (DB may not have category-chat-room KG yet)
  const categoryKg = kgBySlug["category-chat-room"] || {
    id: cityKg.id, // preview-only placeholder; generate will upsert real KG
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

  // --- Category hubs (no country/city FK) ---
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
    const renderCta = (cta) => {
      if (!cta || typeof cta !== "object") return null;
      const out = {};
      for (const [k, v] of Object.entries(cta)) {
        out[k] = typeof v === "string" ? renderTemplate(v, vars) : v;
      }
      return out;
    };
    const renderFaq = (faq) => {
      if (!Array.isArray(faq)) return null;
      return faq.map((item) => ({
        q: typeof item?.q === "string" ? renderTemplate(item.q, vars) : item?.q,
        a: typeof item?.a === "string" ? renderTemplate(item.a, vars) : item?.a,
      }));
    };
    proposed.push({
      title: renderTemplate(titlePattern, vars) || primary,
      slug,
      h1: renderTemplate(h1Pattern, vars) || null,
      primary_keyword: primary,
      meta_title: renderTemplate(metaTitle, vars) || null,
      meta_description: renderTemplate(metaDesc, vars) || null,
      intro_content: categoryTpl.intro_template ? renderTemplate(categoryTpl.intro_template, vars) : null,
      content: categoryTpl.content_template ? renderTemplate(categoryTpl.content_template, vars) : "",
      cta_content: renderCta(categoryTpl.cta_template),
      faq_content: renderFaq(categoryTpl.faq_template),
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
    });
  }

  // Annotate conflicts (includes intra-batch slug collisions)
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
    // If Ready and not generate=false, reserve slug for later rows
    if (ann.conflictLabel === "Ready" || ann.duplicateStatus === "ok") {
      usedSlugs.add(ann.slug);
    } else if (ann.conflictLabel === "Existing Page") {
      usedSlugs.add(ann.slug);
    }
    annotated.push(ann);
  }

  const previewRows = annotated.map((r) => {
    // Conflicted rows must never show generate=true in the report (even if
    // the batch flag was initially true before conflict annotation).
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
      batch: r.batch,
    };
  });

  const lahore = annotated.find((r) => r.slug === LAHORE_SLUG);
  const samples = {};
  for (const slug of ["pakistan-chat-room", "karachi-chat-room", "mumbai-chat-room", "girls-chat-room"]) {
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
      unresolved_tokens: unresolvedTokens(
        row.title, row.slug, row.h1, row.meta_title, row.meta_description, row.intro_content, row.content,
        row.cta_content, row.faq_content,
      ),
    };
  }

  // Content duplication among city drafts (Ready only)
  const cityReady = annotated.filter((r) => r.page_type === "city" && r.conflictLabel === "Ready" && r.generate);
  const pairs = [];
  for (let i = 0; i < Math.min(cityReady.length, 6); i++) {
    for (let j = i + 1; j < Math.min(cityReady.length, 6); j++) {
      const a = cityReady[i];
      const b = cityReady[j];
      // Normalize city names out for structural comparison
      const ca = (a.content || "")
        .replace(new RegExp(a.location.city, "gi"), "{CITY}")
        .replace(new RegExp(a.primary_keyword, "gi"), "{PK}");
      const cb = (b.content || "")
        .replace(new RegExp(b.location.city, "gi"), "{CITY}")
        .replace(new RegExp(b.primary_keyword, "gi"), "{PK}");
      pairs.push({
        a: a.slug,
        b: b.slug,
        content_similarity: Number(similarity(ca, cb).toFixed(3)),
        intro_similarity: Number(similarity(
          (a.intro_content || "").replace(new RegExp(a.location.city, "gi"), "{CITY}"),
          (b.intro_content || "").replace(new RegExp(b.location.city, "gi"), "{CITY}"),
        ).toFixed(3)),
      });
    }
  }
  const avgSim = pairs.length ? pairs.reduce((s, p) => s + p.content_similarity, 0) / pairs.length : 0;
  const duplication = {
    assessed_pairs: pairs,
    average_content_similarity_after_city_normalization: Number(avgSim.toFixed(3)),
    assessment:
      avgSim >= 0.95
        ? "EXCESSIVELY REPETITIVE — city pages are near-identical scaffolds with city-name substitution only. Do not publish/index at scale until differentiated content strategy exists."
        : avgSim >= 0.8
          ? "HIGHLY TEMPLATE-SIMILAR — expected for Phase 4B scaffolds; report before larger generation."
          : "Acceptable variation for a scaffold batch.",
  };

  const readyToGenerate = annotated.filter((r) => r.generate && r.conflictLabel === "Ready" && r.duplicateStatus === "ok");
  const skippedPreview = annotated.filter((r) => !r.generate || r.conflictLabel !== "Ready");

  const previewReport = {
    mode: "preview",
    preview_count: annotated.length,
    conflict_counts: {
      Ready: annotated.filter((r) => r.conflictLabel === "Ready").length,
      "Existing Page": annotated.filter((r) => r.conflictLabel === "Existing Page").length,
      "Reserved Route": annotated.filter((r) => r.conflictLabel === "Reserved Route").length,
      "Redirect Conflict": annotated.filter((r) => r.conflictLabel === "Redirect Conflict").length,
      Invalid: annotated.filter((r) => r.conflictLabel === "Invalid").length,
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
    ready_for_generation_count: readyToGenerate.length,
    skipped_or_conflict_count: skippedPreview.length,
    rows: previewRows,
    samples,
    unresolved_token_check: Object.fromEntries(
      Object.entries(samples).map(([k, v]) => [k, v.unresolved_tokens]),
    ),
    duplication,
    generate_gate: {
      service_role_present: !!service,
      will_insert_on_generate: readyToGenerate.map((r) => r.slug),
      will_never_insert: annotated.filter((r) => !r.generate).map((r) => r.slug),
    },
  };

  writeFileSync("/tmp/phase4b-preview.json", JSON.stringify(previewReport, null, 2));
  console.log("=== PHASE 4B PREVIEW ===");
  console.log(JSON.stringify({
    preview_count: previewReport.preview_count,
    conflict_counts: previewReport.conflict_counts,
    lahore_conflict: previewReport.lahore_conflict,
    ready_for_generation_count: previewReport.ready_for_generation_count,
    unresolved_token_check: previewReport.unresolved_token_check,
    duplication_assessment: duplication.assessment,
    avg_similarity: duplication.average_content_similarity_after_city_normalization,
    service_role_present: !!service,
  }, null, 2));
  console.log("Full preview written to /tmp/phase4b-preview.json");

  if (!doGenerate) {
    console.log("\nSTOP after preview (use --generate only after preview approval / with SERVICE_ROLE).");
    return;
  }

  if (!writeSb) {
    console.error("BLOCKED: SUPABASE_SERVICE_ROLE_KEY required to insert draft pages.");
    process.exit(2);
  }

  // Ensure category keyword group exists for FK integrity
  let categoryKgId = categoryKg.id;
  if (categoryKg._ephemeral || !kgBySlug["category-chat-room"]) {
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

  // Lahore before
  const { data: lahoreBefore } = await writeSb
    .from("custom_pages")
    .select("id,slug,status,updated_at,page_type,country_id,state_id,city_id,category_id,content")
    .eq("id", LAHORE_ID)
    .single();
  const beforeHash = createHash("sha256").update(lahoreBefore?.content || "").digest("hex");

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  const createdRows = [];

  for (const row of annotated) {
    if (!row.generate) {
      skipped++;
      continue;
    }
    if (row.conflictLabel !== "Ready" || row.duplicateStatus !== "ok") {
      skipped++;
      continue;
    }
    if (row.slug === LAHORE_SLUG) {
      skipped++;
      continue;
    }

    // Re-check conflict with service role (sees all statuses)
    const conflicts = await findConflicts(writeSb, row.slug);
    if (conflicts.length) {
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
      featured: false,
      layout: "boxed",
      sidebar_left: "none",
      sidebar_right: "none",
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
      nofollow: false,
      content_status,
      seo_score,
      internal_link_count: 0,
      published_at: null,
      updated_at: new Date().toISOString(),
    };

    const { data: ins, error } = await writeSb.from("custom_pages").insert(payload).select("id,slug,status,page_type,noindex,content_status,seo_score,internal_link_count").single();
    if (error) {
      failed++;
      errors.push({ slug: row.slug, error: error.message });
    } else {
      created++;
      createdRows.push(ins);
    }
  }

  // Lahore after
  const { data: lahoreAfter } = await writeSb
    .from("custom_pages")
    .select("id,slug,status,updated_at,page_type,country_id,state_id,city_id,category_id,content")
    .eq("id", LAHORE_ID)
    .single();
  const afterHash = createHash("sha256").update(lahoreAfter?.content || "").digest("hex");

  // Public visibility check (anon client)
  const publicProbe = await readSb
    .from("custom_pages")
    .select("id,slug,status")
    .eq("slug", "karachi-chat-room")
    .eq("status", "published")
    .maybeSingle();

  // Sitemap exclusion: drafts must not be in published+indexable set
  const { data: publishedForSitemap } = await writeSb
    .from("custom_pages")
    .select("slug,updated_at,published_at,noindex,status")
    .eq("status", "published");
  const sitemapEntries = customPageSitemapEntries(
    (publishedForSitemap || []).filter((p) => !p.noindex),
    new Set(),
    { canonical_domain: "https://yaarzo.com" },
  );
  const createdSlugs = createdRows.map((r) => r.slug);
  const sitemapLeak = sitemapEntries.filter((e) => createdSlugs.some((s) => e.loc.endsWith("/" + s)));

  // Accidental publish check
  const { data: accidentalPublish } = await writeSb
    .from("custom_pages")
    .select("id,slug,status")
    .in("slug", createdSlugs)
    .neq("status", "draft");

  const genReport = {
    mode: "generate",
    attempted: readyToGenerate.length,
    created,
    skipped,
    failed,
    errors,
    created_rows: createdRows,
    lahore_integrity: {
      sameId: lahoreAfter?.id === LAHORE_ID,
      sameSlug: lahoreAfter?.slug === LAHORE_SLUG,
      sameUpdated: lahoreBefore?.updated_at === lahoreAfter?.updated_at,
      sameHash: beforeHash === afterHash && afterHash === EXPECTED_HASH,
      page_type_null: lahoreAfter?.page_type == null,
      taxonomy_null: !lahoreAfter?.country_id && !lahoreAfter?.state_id && !lahoreAfter?.city_id && !lahoreAfter?.category_id,
      content_len: (lahoreAfter?.content || "").length,
    },
    public_visibility: {
      karachi_published_via_anon: publicProbe.data ?? null,
      note: "Draft pages must not appear as published via public read.",
    },
    sitemap: {
      published_count: publishedForSitemap?.length ?? 0,
      leaked_phase4b_drafts: sitemapLeak,
      ok: sitemapLeak.length === 0,
    },
    accidental_non_draft: accidentalPublish ?? [],
  };

  writeFileSync("/tmp/phase4b-generate.json", JSON.stringify(genReport, null, 2));
  console.log("=== PHASE 4B GENERATE ===");
  console.log(JSON.stringify(genReport, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
