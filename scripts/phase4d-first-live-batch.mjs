#!/usr/bin/env node
/**
 * Phase 4D — First controlled live SEO batch (7 pages only).
 *
 *   npx tsx scripts/phase4d-first-live-batch.mjs --snapshot
 *   npx tsx scripts/phase4d-first-live-batch.mjs --validate
 *   npx tsx scripts/phase4d-first-live-batch.mjs --publish
 *   npx tsx scripts/phase4d-first-live-batch.mjs --verify
 *   npx tsx scripts/phase4d-first-live-batch.mjs --all
 *
 * Never publishes pages outside FIRST_LIVE_BATCH.
 * Does not rewrite page content.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  composePublicCmsHtml,
  extractRelativeCmsHrefSlugs,
  filterUnpublishedCmsLinks,
} from "../src/lib/pages-cms/public-links.ts";
import { formatSitemapLastmod, customPageSitemapEntries } from "../src/lib/seo/sitemap.ts";
import { recalculateInternalLinkCount } from "../src/lib/pages-cms/internal-links.ts";

const root = process.cwd();
const LAHORE_ID = "e26569bc-f359-47a6-9646-2da179ee183a";
const LAHORE_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";

const FIRST_LIVE_BATCH = [
  "pakistan-chat-room",
  "karachi-chat-room",
  "islamabad-chat-room",
  "india-chat-room",
  "delhi-chat-room",
  "mumbai-chat-room",
  "girls-chat-room",
];

const MUST_STAY_DRAFT = [
  "rawalpindi-chat-room",
  "faisalabad-chat-room",
  "multan-chat-room",
  "bengaluru-chat-room",
  "hyderabad-india-chat-room",
  "chennai-chat-room",
  "kolkata-chat-room",
  "dating-chat-room",
  "friendship-chat-room",
];

const PUBLIC_ORIGIN = process.env.PUBLIC_SITE_ORIGIN || "https://yaarzo.com";

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

async function loadPages(sb, slugs) {
  const { data, error } = await sb
    .from("custom_pages")
    .select(
      "id,slug,status,noindex,title,h1,meta_title,meta_description,canonical_url,content,intro_content,content_status,updated_at,published_at,page_type,country_id,state_id,city_id,category_id,template_id,keyword_group_id,primary_keyword,internal_link_count,seo_score",
    )
    .in("slug", slugs);
  if (error) throw error;
  return data || [];
}

function snapshotRow(p) {
  return {
    id: p.id,
    slug: p.slug,
    status: p.status,
    noindex: p.noindex,
    title: p.title,
    h1: p.h1,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    canonical_url: p.canonical_url,
    content_hash: sha(p.content),
    content_len: (p.content || "").length,
    intro_len: (p.intro_content || "").length,
    content_status: p.content_status,
    updated_at: p.updated_at,
    published_at: p.published_at,
    page_type: p.page_type,
    country_id: p.country_id,
    state_id: p.state_id,
    city_id: p.city_id,
    category_id: p.category_id,
    template_id: p.template_id,
    keyword_group_id: p.keyword_group_id,
    primary_keyword: p.primary_keyword,
    internal_link_count: p.internal_link_count,
    seo_score: p.seo_score,
  };
}

async function snapshot(sb) {
  const { count: publishedCount } = await sb
    .from("custom_pages")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  const { count: draftCount } = await sb
    .from("custom_pages")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");
  const pages = await loadPages(sb, [...FIRST_LIVE_BATCH, "lahore-chat-room"]);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, snapshotRow(p)]));
  const doc = {
    captured_at: new Date().toISOString(),
    published_count: publishedCount,
    draft_count: draftCount,
    batch: FIRST_LIVE_BATCH.map((s) => bySlug[s] || { slug: s, missing: true }),
    lahore: bySlug["lahore-chat-room"] || null,
  };
  writeFileSync("/tmp/phase4d-snapshot.json", JSON.stringify(doc, null, 2));
  console.log("=== PRE-PUBLISH SNAPSHOT ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function validatePage(sb, page, redirects) {
  const fails = [];
  if (!page) return { ok: false, fails: ["missing page"] };
  if (page.status !== "draft" || page.noindex !== true) fails.push(`expected draft+noindex got ${page.status}/${page.noindex}`);
  if (page.content_status !== "complete") fails.push(`content_status=${page.content_status}`);
  if (!page.h1?.trim()) fails.push("missing h1");
  if (!page.title?.trim()) fails.push("missing title");
  if (!page.meta_title?.trim() || !page.meta_description?.trim()) fails.push("missing meta");
  const blob = `${page.intro_content || ""}${page.content || ""}${page.h1 || ""}${page.meta_title || ""}`;
  if (/\{[a-z_]+\}/i.test(blob)) fails.push("unresolved tokens");
  if ((page.content || "").replace(/<[^>]+>/g, "").trim().length < 300) fails.push("thin content");

  // duplicate slug already unique by DB; check redirects from this slug
  if (redirects.has(page.slug)) fails.push("redirect conflict from_slug");

  // internal links
  const { data: links, error } = await sb
    .from("page_internal_links")
    .select("target_url,target_page_id,anchor_text")
    .eq("page_id", page.id);
  if (error) fails.push(`links error: ${error.message}`);
  for (const l of links || []) {
    const slug = (l.target_url || "").replace(/^\//, "");
    if (!slug) {
      fails.push(`empty target_url`);
      continue;
    }
    if (!l.target_page_id) {
      // allow but warn — still check custom_pages
    }
    const { data: target } = await sb.from("custom_pages").select("id,slug,status").eq("slug", slug).maybeSingle();
    if (!target) fails.push(`broken link target /${slug}`);
  }

  // composed public html should be non-empty
  const composed = composePublicCmsHtml({ intro: page.intro_content, content: page.content });
  if (!composed.trim()) fails.push("empty composed html");

  return { ok: fails.length === 0, fails, link_count: (links || []).length };
}

async function validate(sb) {
  const { data: redirs } = await sb.from("page_redirects").select("from_slug");
  const redirects = new Set((redirs || []).map((r) => r.from_slug));
  const pages = await loadPages(sb, FIRST_LIVE_BATCH);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const results = [];
  for (const slug of FIRST_LIVE_BATCH) {
    const v = await validatePage(sb, bySlug[slug], redirects);
    results.push({ slug, ...v });
  }
  const doc = {
    passed: results.filter((r) => r.ok).map((r) => r.slug),
    failed: results.filter((r) => !r.ok),
    results,
  };
  writeFileSync("/tmp/phase4d-validate.json", JSON.stringify(doc, null, 2));
  console.log("=== PRE-PUBLISH VALIDATION ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function publish(sb, validation) {
  const passed = new Set(validation?.passed || []);
  const attempted = [];
  const published = [];
  const skipped = [];

  for (const slug of FIRST_LIVE_BATCH) {
    attempted.push(slug);
    if (!passed.has(slug)) {
      skipped.push({ slug, reason: "validation_failed" });
      continue;
    }
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from("custom_pages")
      .update({
        status: "published",
        noindex: false,
        published_at: now,
      })
      .eq("slug", slug)
      .eq("status", "draft")
      .eq("noindex", true)
      .select("id,slug,status,noindex,published_at,updated_at")
      .maybeSingle();
    if (error) {
      skipped.push({ slug, reason: error.message });
      continue;
    }
    if (!data) {
      skipped.push({ slug, reason: "update matched 0 rows" });
      continue;
    }
    published.push(data);
  }

  const doc = { attempted, published, skipped };
  writeFileSync("/tmp/phase4d-publish.json", JSON.stringify(doc, null, 2));
  console.log("=== PUBLISH RESULT ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function verifyDb(sb) {
  const batch = await loadPages(sb, FIRST_LIVE_BATCH);
  const stay = await loadPages(sb, MUST_STAY_DRAFT);
  const { count: publishedCount } = await sb
    .from("custom_pages")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  const { count: draftCount } = await sb
    .from("custom_pages")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");
  const { count: noindexCount } = await sb
    .from("custom_pages")
    .select("*", { count: "exact", head: true })
    .eq("noindex", true);

  const batchOk = batch.every((p) => p.status === "published" && p.noindex === false);
  const stayOk = stay.every((p) => p.status === "draft" && p.noindex === true);

  const lahore = (await loadPages(sb, ["lahore-chat-room"]))[0];
  const lahoreBeforeAt = lahore.updated_at;
  await recalculateInternalLinkCount(sb, LAHORE_ID, { refreshJsonCache: true });
  const lahoreAfter = (await loadPages(sb, ["lahore-chat-room"]))[0];

  const doc = {
    published_count: publishedCount,
    draft_count: draftCount,
    noindex_count: noindexCount,
    batch_published_ok: batchOk,
    batch: batch.map((p) => ({ slug: p.slug, status: p.status, noindex: p.noindex })),
    must_stay_draft_ok: stayOk,
    must_stay_draft: stay.map((p) => ({ slug: p.slug, status: p.status, noindex: p.noindex })),
    lahore: {
      id: lahore.id,
      slug: lahore.slug,
      status: lahore.status,
      noindex: lahore.noindex,
      content_hash: sha(lahore.content),
      content_hash_ok: sha(lahore.content) === LAHORE_HASH,
      updated_at_before_cache: lahoreBeforeAt,
      updated_at_after_cache: lahoreAfter.updated_at,
      cache_refresh_preserved: String(lahoreBeforeAt) === String(lahoreAfter.updated_at),
    },
  };
  writeFileSync("/tmp/phase4d-verify-db.json", JSON.stringify(doc, null, 2));
  console.log("=== POST-PUBLISH DB ===");
  console.log(JSON.stringify(doc, null, 2));
  if (!batchOk) throw new Error("Batch publish DB check failed");
  if (!stayOk) throw new Error("Draft preservation failed — STOP");
  if (!doc.lahore.content_hash_ok) throw new Error("Lahore hash changed — STOP");
  if (!doc.lahore.cache_refresh_preserved) throw new Error("Lahore updated_at bumped by cache — STOP");
  return doc;
}

async function fetchPublic(path) {
  const url = `${PUBLIC_ORIGIN}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "phase4d-verify/1.0", accept: "text/html" },
      redirect: "follow",
    });
    const html = await res.text();
    return { url, status: res.status, html };
  } catch (e) {
    return { url, status: 0, error: String(e), html: "" };
  }
}

function analyzeHtml(html, slug) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || null;
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
    [])[1] || null;
  const robots = (html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i) ||
    [])[1] || null;
  const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i) ||
    [])[1] || null;
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim(),
  );
  const unresolved = /\{[a-z_]+\}/i.test(html);
  const draftLeak = /status["']?\s*:\s*["']draft["']/i.test(html) || /noindex["']?\s*:\s*true/i.test(html);
  return {
    title,
    description: desc,
    robots,
    canonical,
    h1_count: h1s.length,
    h1s: h1s.slice(0, 3),
    unresolved_tokens: unresolved,
    draft_leak_heuristic: draftLeak,
    has_slug_text: html.toLowerCase().includes(slug.split("-")[0]),
  };
}

async function verifyPublic(sb) {
  const slugs = [...FIRST_LIVE_BATCH, "lahore-chat-room"];
  // unpublished targets for link filter demo
  const { data: unpublished } = await sb
    .from("custom_pages")
    .select("slug")
    .neq("status", "published");
  const unpublishedSlugs = (unpublished || []).map((r) => r.slug);

  const http = {};
  for (const slug of slugs) {
    const res = await fetchPublic(`/${slug}`);
    http[slug] = {
      status: res.status,
      error: res.error || null,
      ...analyzeHtml(res.html || "", slug),
      // content may be client-hydrated; also verify DB publicHtml filter logic
    };
  }

  // Sitemap
  const sm = await fetchPublic("/sitemap.xml");
  const sitemapBody = sm.html || "";
  const sitemapHas = {};
  for (const slug of [...FIRST_LIVE_BATCH, "lahore-chat-room", ...MUST_STAY_DRAFT]) {
    sitemapHas[slug] = sitemapBody.includes(`/${slug}<`) || sitemapBody.includes(`/${slug}</loc>`);
  }

  // DB-level sitemap helper parity
  const { data: publishedPages } = await sb
    .from("custom_pages")
    .select("slug,updated_at,published_at,noindex")
    .eq("status", "published");
  const helperEntries = customPageSitemapEntries(
    publishedPages || [],
    new Set(),
    { canonical_domain: "yaarzo.com" },
  );

  // Link filter: sample pakistan content against unpublished
  const pk = (await loadPages(sb, ["pakistan-chat-room"]))[0];
  const composed = composePublicCmsHtml({ intro: pk.intro_content, content: pk.content });
  const filtered = filterUnpublishedCmsLinks(composed, unpublishedSlugs);
  const hrefsBefore = extractRelativeCmsHrefSlugs(composed);
  const hrefsAfter = extractRelativeCmsHrefSlugs(filtered);
  const suppressed = hrefsBefore.filter((s) => unpublishedSlugs.includes(s) && !hrefsAfter.includes(s));

  const doc = {
    http,
    sitemap_http_status: sm.status,
    sitemap_includes: sitemapHas,
    sitemap_helper_locs: helperEntries.map((e) => e.loc),
    sitemap_helper_count_custom: helperEntries.length,
    unpublished_link_suppression: {
      hrefs_before: hrefsBefore,
      hrefs_after: hrefsAfter,
      suppressed_unpublished_targets: suppressed,
      ok: suppressed.length === hrefsBefore.filter((s) => unpublishedSlugs.includes(s)).length,
    },
  };
  writeFileSync("/tmp/phase4d-verify-public.json", JSON.stringify(doc, null, 2));
  console.log("=== PUBLIC / SITEMAP VERIFY ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function report(snap, validation, publishResult, dbVerify, publicVerify) {
  const doc = {
    phase: "4D",
    pages_attempted: FIRST_LIVE_BATCH,
    pages_published: (publishResult?.published || []).map((p) => p.slug),
    pages_skipped_failed: publishResult?.skipped || validation?.failed || [],
    final_published_count: dbVerify?.published_count,
    remaining_draft_count: dbVerify?.draft_count,
    public_http: Object.fromEntries(
      Object.entries(publicVerify?.http || {}).map(([k, v]) => [k, { status: v.status, h1_count: v.h1_count, title: v.title, canonical: v.canonical, robots: v.robots }]),
    ),
    sitemap_includes_live: publicVerify?.sitemap_includes,
    unpublished_link_handling: publicVerify?.unpublished_link_suppression,
    lahore: dbVerify?.lahore,
    snapshot_published_before: snap?.published_count,
  };
  writeFileSync("/tmp/phase4d-report.json", JSON.stringify(doc, null, 2));
  console.log("=== PHASE 4D REPORT ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const env = loadEnv();
  const sb = sbClient(env);
  const all = args.has("--all");

  let snap, validation, publishResult, dbVerify, publicVerify;
  if (all || args.has("--snapshot")) snap = await snapshot(sb);
  if (all || args.has("--validate")) validation = await validate(sb);
  if (all || args.has("--publish")) {
    if (!validation) validation = await validate(sb);
    publishResult = await publish(sb, validation);
  }
  if (all || args.has("--verify")) {
    dbVerify = await verifyDb(sb);
    publicVerify = await verifyPublic(sb);
  }
  if (all || args.has("--report") || all) {
    if (!snap && existsSync("/tmp/phase4d-snapshot.json")) snap = JSON.parse(readFileSync("/tmp/phase4d-snapshot.json", "utf8"));
    if (!validation && existsSync("/tmp/phase4d-validate.json")) validation = JSON.parse(readFileSync("/tmp/phase4d-validate.json", "utf8"));
    if (!publishResult && existsSync("/tmp/phase4d-publish.json")) publishResult = JSON.parse(readFileSync("/tmp/phase4d-publish.json", "utf8"));
    if (!dbVerify && existsSync("/tmp/phase4d-verify-db.json")) dbVerify = JSON.parse(readFileSync("/tmp/phase4d-verify-db.json", "utf8"));
    if (!publicVerify && existsSync("/tmp/phase4d-verify-public.json")) publicVerify = JSON.parse(readFileSync("/tmp/phase4d-verify-public.json", "utf8"));
    await report(snap, validation, publishResult, dbVerify, publicVerify);
  }

  if (
    !all &&
    !["--snapshot", "--validate", "--publish", "--verify", "--report"].some((a) => args.has(a))
  ) {
    console.log("Usage: --snapshot | --validate | --publish | --verify | --report | --all");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
