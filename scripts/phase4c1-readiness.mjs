#!/usr/bin/env node
/**
 * Phase 4C.1 — Publication readiness + lastmod integrity.
 *
 *   npx tsx scripts/phase4c1-readiness.mjs --apply-migration
 *   npx tsx scripts/phase4c1-readiness.mjs --lahore-seo
 *   npx tsx scripts/phase4c1-readiness.mjs --improve-drafts
 *   npx tsx scripts/phase4c1-readiness.mjs --audit-links
 *   npx tsx scripts/phase4c1-readiness.mjs --verify-lastmod
 *   npx tsx scripts/phase4c1-readiness.mjs --report
 *   npx tsx scripts/phase4c1-readiness.mjs --all
 *
 * Never publishes. Lahore body content is never rewritten.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { deriveContentStatus, computeSeoScore } from "../src/lib/pages-cms/template-engine.ts";
import { LAHORE_MAPPING_PLAN } from "../src/lib/pages-cms/phase4a/taxonomy-data.ts";
import {
  PHASE4C_PRIORITY as PRIORITY,
  PHASE4C1_DRAFT_SLUGS,
  PHASE4C_ALL_PRIORITY as ALL_PRIORITY,
  buildDifferentiatedContent,
  planPriorityInternalLinks,
  auditInternalLinks,
  pickAnchor,
  cityAnchors,
  similarity,
  normalizeCity,
} from "../src/lib/pages-cms/phase4c-priority.ts";
import { recalculateInternalLinkCount } from "../src/lib/pages-cms/internal-links.ts";
import { formatSitemapLastmod } from "../src/lib/seo/sitemap.ts";

const root = process.cwd();
const LAHORE_ID = LAHORE_MAPPING_PLAN.custom_page_id;
const EXPECTED_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";

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
  if ((!out.SUPABASE_SERVICE_ROLE_KEY || out.SUPABASE_SERVICE_ROLE_KEY === "") && existsSync("/tmp/.sb_service")) {
    out.SUPABASE_SERVICE_ROLE_KEY = readFileSync("/tmp/.sb_service", "utf8").trim();
  }
  if ((!out.SUPABASE_ACCESS_TOKEN || out.SUPABASE_ACCESS_TOKEN === "") && existsSync("/tmp/.sb_tok")) {
    out.SUPABASE_ACCESS_TOKEN = readFileSync("/tmp/.sb_tok", "utf8").trim();
  }
  return out;
}

function sha(content) {
  return createHash("sha256").update(content || "").digest("hex");
}

function sbClient(env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("BLOCKED: SUPABASE_SERVICE_ROLE_KEY required");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function mgmtQuery(env, query) {
  const token = env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("BLOCKED: SUPABASE_ACCESS_TOKEN required for migration SQL");
  const ref = env.SUPABASE_PROJECT_ID || "aofjhfsecwsrcvvvcfcy";
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`mgmt query ${res.status}: ${text.slice(0, 400)}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function applyMigration(env) {
  const sql = readFileSync(
    join(root, "supabase/migrations/20260808180000_pages_cms_phase4c1_updated_at_cache.sql"),
    "utf8",
  );
  await mgmtQuery(env, sql);
  const check = await mgmtQuery(
    env,
    `SELECT tgname, pg_get_triggerdef(oid) AS def FROM pg_trigger WHERE tgrelid = 'public.custom_pages'::regclass AND NOT tgisinternal`,
  );
  writeFileSync("/tmp/phase4c1-migration.json", JSON.stringify({ ok: true, triggers: check }, null, 2));
  console.log("=== MIGRATION APPLIED ===");
  console.log(JSON.stringify(check, null, 2));
}

async function verifyLastmod(env, sb) {
  // Capture Lahore updated_at, refresh link cache only, confirm unchanged.
  const { data: before, error } = await sb
    .from("custom_pages")
    .select("id,updated_at,internal_link_count,content")
    .eq("id", LAHORE_ID)
    .single();
  if (error) throw error;
  const beforeAt = before.updated_at;
  const count = await recalculateInternalLinkCount(sb, LAHORE_ID, { refreshJsonCache: true });
  const { data: after } = await sb
    .from("custom_pages")
    .select("updated_at,internal_link_count")
    .eq("id", LAHORE_ID)
    .single();

  // Also bump views-only via SQL and confirm lastmod preserved
  await mgmtQuery(
    env,
    `UPDATE public.custom_pages SET views = views WHERE id = '${LAHORE_ID}'::uuid RETURNING updated_at::text`,
  );
  const { data: afterViews } = await sb.from("custom_pages").select("updated_at").eq("id", LAHORE_ID).single();

  const result = {
    before_updated_at: beforeAt,
    after_cache_refresh_updated_at: after.updated_at,
    cache_refresh_preserved: String(beforeAt) === String(after.updated_at),
    link_count: count,
    after_views_noop_updated_at: afterViews.updated_at,
    views_noop_preserved: String(beforeAt) === String(afterViews.updated_at),
    sitemap_lastmod: formatSitemapLastmod(after.updated_at),
    content_hash_ok: sha(before.content) === EXPECTED_HASH,
  };
  writeFileSync("/tmp/phase4c1-lastmod-verify.json", JSON.stringify(result, null, 2));
  console.log("=== LASTMOD VERIFY ===");
  console.log(JSON.stringify(result, null, 2));
  if (!result.cache_refresh_preserved) throw new Error("FAIL: cache refresh changed updated_at");
  return result;
}

async function lahoreSeo(sb) {
  const { data: before, error } = await sb
    .from("custom_pages")
    .select(
      "id,slug,title,h1,meta_title,meta_description,canonical_url,primary_keyword,content,seo_score,updated_at,status,noindex",
    )
    .eq("id", LAHORE_ID)
    .single();
  if (error) throw error;
  if (sha(before.content) !== EXPECTED_HASH) throw new Error("Lahore content hash mismatch — STOP");

  const h1 = "Lahore Chat Room";
  const meta_title = "Lahore Chat Room | Free Online Chat on Yaarzo";
  const meta_description =
    "Join free Lahore chat rooms on Yaarzo. Meet people, talk in English or Urdu, and build friendly connections online.";
  const primary_keyword = "lahore chat room";
  const seo_score = computeSeoScore({
    meta_title,
    meta_description,
    h1,
    primary_keyword,
    content: before.content,
    noindex: before.noindex,
  });

  // SEO-only update (body untouched). Trigger should bump updated_at (editorial).
  const { data: after, error: upErr } = await sb
    .from("custom_pages")
    .update({
      h1,
      meta_title,
      meta_description,
      primary_keyword,
      seo_score,
      // keep canonical null → public renderer uses origin/slug (already correct live)
    })
    .eq("id", LAHORE_ID)
    .eq("slug", "lahore-chat-room")
    .select(
      "id,slug,title,h1,meta_title,meta_description,canonical_url,primary_keyword,content,seo_score,updated_at,status,noindex",
    )
    .single();
  if (upErr) throw upErr;

  const result = {
    before: {
      h1: before.h1,
      meta_title: before.meta_title,
      meta_description: before.meta_description,
      seo_score: before.seo_score,
      updated_at: before.updated_at,
      content_hash: sha(before.content),
    },
    after: {
      h1: after.h1,
      meta_title: after.meta_title,
      meta_description: after.meta_description,
      seo_score: after.seo_score,
      updated_at: after.updated_at,
      content_hash: sha(after.content),
      status: after.status,
      noindex: after.noindex,
      title: after.title,
      slug: after.slug,
    },
    body_unchanged: sha(after.content) === EXPECTED_HASH,
    rendered_h1_source: "h1 field (preferred) else title — both Lahore Chat Room",
    notes: [
      "Live page previously fell back to global SEO title/description because meta_* were null",
      "Public $slug route renders a single H1 from h1||title; body starts at H2 (no duplicate H1)",
      "Canonical remains https://{origin}/lahore-chat-room when canonical_url is null",
    ],
  };
  writeFileSync("/tmp/phase4c1-lahore-seo.json", JSON.stringify(result, null, 2));
  console.log("=== LAHORE SEO ===");
  console.log(JSON.stringify(result, null, 2));
  if (!result.body_unchanged) throw new Error("Lahore body changed — STOP");
  return result;
}

async function loadPages(sb, slugs) {
  const { data: pages, error } = await sb
    .from("custom_pages")
    .select(
      "id,slug,title,status,noindex,page_type,country_id,state_id,city_id,category_id,primary_keyword,h1,meta_title,meta_description,intro_content,content,cta_content,faq_content,content_status,seo_score,internal_link_count,updated_at,canonical_url",
    )
    .in("slug", slugs);
  if (error) throw error;
  const countryIds = [...new Set(pages.map((p) => p.country_id).filter(Boolean))];
  const stateIds = [...new Set(pages.map((p) => p.state_id).filter(Boolean))];
  const cityIds = [...new Set(pages.map((p) => p.city_id).filter(Boolean))];
  const categoryIds = [...new Set(pages.map((p) => p.category_id).filter(Boolean))];
  const [countries, states, cities, categories] = await Promise.all([
    countryIds.length ? sb.from("page_countries").select("id,name").in("id", countryIds) : { data: [] },
    stateIds.length ? sb.from("page_states").select("id,name").in("id", stateIds) : { data: [] },
    cityIds.length ? sb.from("page_cities").select("id,name").in("id", cityIds) : { data: [] },
    categoryIds.length ? sb.from("page_categories").select("id,name").in("id", categoryIds) : { data: [] },
  ]);
  const cmap = Object.fromEntries((countries.data || []).map((r) => [r.id, r.name]));
  const smap = Object.fromEntries((states.data || []).map((r) => [r.id, r.name]));
  const cimap = Object.fromEntries((cities.data || []).map((r) => [r.id, r.name]));
  const camap = Object.fromEntries((categories.data || []).map((r) => [r.id, r.name]));
  return pages
    .map((p) => ({
      ...p,
      country_name: cmap[p.country_id] || null,
      state_name: smap[p.state_id] || null,
      city_name: cimap[p.city_id] || null,
      category_name: camap[p.category_id] || null,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

async function improveDrafts(sb) {
  const pages = await loadPages(sb, [...ALL_PRIORITY]);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const updated = [];

  for (const slug of PHASE4C1_DRAFT_SLUGS) {
    const page = bySlug[slug];
    if (!page) {
      updated.push({ slug, skipped: "missing" });
      continue;
    }
    if (page.status !== "draft" || page.noindex !== true) {
      updated.push({ slug, skipped: `status=${page.status} noindex=${page.noindex}` });
      continue;
    }

    let siblings = [];
    let hubSlug = "";
    let hubLabel = "";
    let priorityCities = [];

    if (page.page_type === "city" && page.country_name === "Pakistan") {
      hubSlug = PRIORITY.pakistan_hub;
      hubLabel = "Pakistan chat room";
      siblings = PRIORITY.pk_cities
        .filter((s) => s !== page.slug)
        .map((s) => {
          const p = bySlug[s];
          return p
            ? {
                slug: s,
                name: p.city_name || s,
                anchor: pickAnchor(cityAnchors(p.city_name || "city"), page.slug + s),
              }
            : null;
        })
        .filter(Boolean);
    } else if (page.page_type === "city" && page.country_name === "India") {
      hubSlug = PRIORITY.india_hub;
      hubLabel = "India chat room";
      siblings = PRIORITY.in_cities
        .filter((s) => s !== page.slug)
        .map((s) => {
          const p = bySlug[s];
          return p
            ? {
                slug: s,
                name: p.city_name || s,
                anchor: pickAnchor(cityAnchors(p.city_name || "city"), page.slug + s),
              }
            : null;
        })
        .filter(Boolean);
    } else if (page.page_type === "country" && page.slug === PRIORITY.pakistan_hub) {
      priorityCities = PRIORITY.pk_cities.map((s) => {
        const p = bySlug[s];
        return { slug: s, title_hint: p?.city_name ? `${p.city_name} chat room` : s };
      });
    } else if (page.page_type === "country" && page.slug === PRIORITY.india_hub) {
      priorityCities = PRIORITY.in_cities.map((s) => {
        const p = bySlug[s];
        return { slug: s, title_hint: p?.city_name ? `${p.city_name} chat room` : s };
      });
    }

    const built = buildDifferentiatedContent(page, { siblings, hubSlug, hubLabel, priorityCities });
    const h1 = built.h1;
    const meta_title = built.meta_title || page.meta_title;
    const meta_description = built.meta_description || page.meta_description;
    const content_status = deriveContentStatus(built.content);
    const seo_score = computeSeoScore({
      meta_title,
      meta_description,
      h1,
      primary_keyword: page.primary_keyword,
      content: built.content,
      noindex: page.noindex,
    });

    // Guard: unresolved tokens
    const blob = `${built.intro}${built.content}${h1}${meta_title}${meta_description}`;
    if (/\{[a-z_]+\}/i.test(blob)) {
      updated.push({ slug, skipped: "unresolved_tokens", sample: blob.match(/\{[a-z_]+\}/i)?.[0] });
      continue;
    }

    const { error } = await sb
      .from("custom_pages")
      .update({
        intro_content: built.intro,
        content: built.content,
        cta_content: built.cta,
        faq_content: built.faq,
        h1,
        meta_title,
        meta_description,
        content_status,
        seo_score,
      })
      .eq("id", page.id)
      .eq("status", "draft")
      .eq("noindex", true);
    if (error) throw error;

    updated.push({
      slug,
      updated: true,
      content_len: built.content.length,
      content_status,
      seo_score,
      h1,
      meta_title,
    });
  }

  writeFileSync("/tmp/phase4c1-content.json", JSON.stringify(updated, null, 2));
  console.log("=== DRAFT CONTENT IMPROVEMENT ===");
  console.log(JSON.stringify(updated, null, 2));
  return updated;
}

async function auditLinks(sb) {
  const pages = await loadPages(sb, [...ALL_PRIORITY]);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const cityNameBySlug = Object.fromEntries(
    [...PRIORITY.pk_cities, ...PRIORITY.in_cities].map((s) => [s, bySlug[s]?.city_name || "city"]),
  );
  const categoryNameBySlug = Object.fromEntries(
    PRIORITY.categories.map((s) => [s, bySlug[s]?.category_name || bySlug[s]?.title || s]),
  );
  const planned = planPriorityInternalLinks({ cityNameBySlug, categoryNameBySlug });
  const planAudit = auditInternalLinks(planned);

  const ids = pages.map((p) => p.id);
  const { data: rows, error } = await sb
    .from("page_internal_links")
    .select("page_id,target_page_id,anchor_text,target_url")
    .in("page_id", ids);
  if (error) throw error;
  const idToSlug = Object.fromEntries(pages.map((p) => [p.id, p.slug]));
  const actual = (rows || []).map((r) => ({
    from: idToSlug[r.page_id],
    to: (r.target_url || "").replace(/^\//, ""),
    anchor: r.anchor_text,
  }));
  const actualAudit = auditInternalLinks(actual);

  const out = {
    planned_count: planned.length,
    actual_count: actual.length,
    plan_audit: planAudit,
    actual_audit: actualAudit,
    per_page_counts: Object.fromEntries(pages.map((p) => [p.slug, p.internal_link_count])),
  };
  writeFileSync("/tmp/phase4c1-link-audit.json", JSON.stringify(out, null, 2));
  console.log("=== LINK AUDIT ===");
  console.log(JSON.stringify(out, null, 2));
  return out;
}

function classifyPage(p, outgoing) {
  const notes = [];
  let classification = "READY";
  const blob = `${p.intro_content || ""}${p.content || ""}${p.h1 || ""}${p.meta_title || ""}${p.meta_description || ""}`;
  if (p.status !== "draft" || p.noindex !== true) {
    classification = "BLOCKED";
    notes.push("expected draft+noindex");
  }
  if (!p.h1?.trim()) {
    classification = classification === "BLOCKED" ? "BLOCKED" : "NEEDS WORK";
    notes.push("missing H1");
  }
  if (!p.meta_title?.trim() || !p.meta_description?.trim()) {
    classification = classification === "BLOCKED" ? "BLOCKED" : "NEEDS WORK";
    notes.push("missing meta");
  }
  if (/\{[a-z_]+\}/i.test(blob)) {
    classification = "BLOCKED";
    notes.push("unresolved tokens");
  }
  if ((p.content || "").length < 500) {
    classification = classification === "BLOCKED" ? "BLOCKED" : "NEEDS WORK";
    notes.push("thin content");
  }
  if ((p.internal_link_count || 0) < 2) {
    classification = classification === "BLOCKED" ? "BLOCKED" : "NEEDS WORK";
    notes.push("insufficient internal links");
  }
  if (classification === "READY") {
    notes.push("draft+noindex preserved; useful differentiation; SEO fields present");
  }
  return { classification, notes, outgoing_links: outgoing };
}

async function report(sb, beforeSim) {
  const pages = await loadPages(sb, [...ALL_PRIORITY]);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const ids = pages.map((p) => p.id);
  const { data: linkRows } = await sb
    .from("page_internal_links")
    .select("page_id,anchor_text,target_url")
    .in("page_id", ids);
  const idToSlug = Object.fromEntries(pages.map((p) => [p.id, p.slug]));
  const outgoing = {};
  for (const l of linkRows || []) {
    const slug = idToSlug[l.page_id];
    if (!outgoing[slug]) outgoing[slug] = [];
    outgoing[slug].push({ anchor: l.anchor_text, url: l.target_url });
  }

  function avgPairs(slugs) {
    const list = slugs.map((s) => bySlug[s]).filter(Boolean);
    const pairs = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const sim = similarity(
          normalizeCity(a.content, a.city_name),
          normalizeCity(b.content, b.city_name),
        );
        pairs.push({ a: a.slug, b: b.slug, sim: Number(sim.toFixed(3)) });
      }
    }
    const avg = pairs.length ? pairs.reduce((s, p) => s + p.sim, 0) / pairs.length : 0;
    return { avg: Number(avg.toFixed(3)), pairs };
  }

  const pkCities = PRIORITY.pk_cities.filter((s) => s !== "lahore-chat-room");
  const pkSim = avgPairs(pkCities);
  const inSim = avgPairs([...PRIORITY.in_cities]);
  const hubVsCity = [];
  for (const hub of [PRIORITY.pakistan_hub, PRIORITY.india_hub]) {
    const cities = hub === PRIORITY.pakistan_hub ? pkCities : [...PRIORITY.in_cities];
    for (const cs of cities) {
      const a = bySlug[hub];
      const b = bySlug[cs];
      if (!a || !b) continue;
      hubVsCity.push({
        a: hub,
        b: cs,
        sim: Number(similarity(a.content, normalizeCity(b.content, b.city_name)).toFixed(3)),
      });
    }
  }
  const catSim = avgPairs([...PRIORITY.categories]);

  const rows = [];
  for (const slug of PHASE4C1_DRAFT_SLUGS) {
    const p = bySlug[slug];
    if (!p) {
      rows.push({ slug, classification: "BLOCKED", reason: "missing" });
      continue;
    }
    const { classification, notes, outgoing_links } = classifyPage(p, outgoing[slug] || []);
    rows.push({
      slug: p.slug,
      title: p.title,
      h1: p.h1,
      primary_keyword: p.primary_keyword,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      content_length: (p.content || "").length,
      content_status: p.content_status,
      seo_score: p.seo_score,
      internal_link_count: p.internal_link_count,
      status: p.status,
      noindex: p.noindex,
      page_type: p.page_type,
      classification,
      notes,
      outgoing_links,
    });
  }

  const lahore = bySlug["lahore-chat-room"];
  const reportDoc = {
    phase: "4C.1",
    similarity: {
      before_pk_city_avg: beforeSim ?? 0.846,
      pakistan_city_to_city_avg: pkSim.avg,
      india_city_to_city_avg: inSim.avg,
      category_to_category_avg: catSim.avg,
      country_hub_vs_city_sample: hubVsCity.slice(0, 8),
      pakistan_pairs_sample: pkSim.pairs.slice(0, 8),
      india_pairs_sample: inSim.pairs.slice(0, 8),
    },
    lahore: lahore
      ? {
          id: lahore.id,
          slug: lahore.slug,
          title: lahore.title,
          h1: lahore.h1,
          meta_title: lahore.meta_title,
          meta_description: lahore.meta_description,
          seo_score: lahore.seo_score,
          content_hash: sha(lahore.content),
          content_hash_ok: sha(lahore.content) === EXPECTED_HASH,
          status: lahore.status,
          noindex: lahore.noindex,
          updated_at: lahore.updated_at,
          sitemap_lastmod: formatSitemapLastmod(lahore.updated_at),
        }
      : null,
    pages: rows,
    classifications: {
      READY: rows.filter((r) => r.classification === "READY").map((r) => r.slug),
      NEEDS_WORK: rows.filter((r) => r.classification === "NEEDS WORK").map((r) => r.slug),
      BLOCKED: rows.filter((r) => r.classification === "BLOCKED").map((r) => r.slug),
    },
    first_publish_batch_recommended: rows
      .filter((r) => r.classification === "READY")
      .map((r) => r.slug),
  };
  writeFileSync("/tmp/phase4c1-report.json", JSON.stringify(reportDoc, null, 2));
  console.log("=== PHASE 4C.1 REPORT ===");
  console.log(JSON.stringify(reportDoc, null, 2));
  return reportDoc;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const env = loadEnv();
  const sb = sbClient(env);
  const all = args.has("--all");

  if (all || args.has("--apply-migration")) await applyMigration(env);
  if (all || args.has("--verify-lastmod")) await verifyLastmod(env, sb);
  if (all || args.has("--lahore-seo")) await lahoreSeo(sb);
  if (all || args.has("--improve-drafts")) await improveDrafts(sb);
  if (all || args.has("--audit-links")) await auditLinks(sb);
  if (all || args.has("--report") || all) await report(sb, 0.846);

  if (
    !all &&
    ![
      "--apply-migration",
      "--verify-lastmod",
      "--lahore-seo",
      "--improve-drafts",
      "--audit-links",
      "--report",
    ].some((a) => args.has(a))
  ) {
    console.log(
      "Usage: --apply-migration | --verify-lastmod | --lahore-seo | --improve-drafts | --audit-links | --report | --all",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
