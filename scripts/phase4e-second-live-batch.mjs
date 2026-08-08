#!/usr/bin/env node
/**
 * Phase 4E — Second controlled live SEO batch (9 pages only).
 *
 *   npx tsx scripts/phase4e-second-live-batch.mjs --snapshot
 *   npx tsx scripts/phase4e-second-live-batch.mjs --validate
 *   npx tsx scripts/phase4e-second-live-batch.mjs --publish
 *   npx tsx scripts/phase4e-second-live-batch.mjs --verify
 *   npx tsx scripts/phase4e-second-live-batch.mjs --all
 *
 * Never publishes pages outside SECOND_LIVE_BATCH.
 * Does not rewrite page content. status draft→published, noindex true→false only.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  composePublicCmsHtml,
} from "../src/lib/pages-cms/public-links.ts";
import { auditInitialCmsHtml } from "../src/lib/pages-cms/public-page-ssr.ts";
import { recalculateInternalLinkCount } from "../src/lib/pages-cms/internal-links.ts";

const root = process.cwd();
const LAHORE_ID = "e26569bc-f359-47a6-9646-2da179ee183a";
const LAHORE_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";

const SECOND_LIVE_BATCH = [
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

const ALREADY_PUBLISHED = [
  "lahore-chat-room",
  "pakistan-chat-room",
  "karachi-chat-room",
  "islamabad-chat-room",
  "india-chat-room",
  "delhi-chat-room",
  "mumbai-chat-room",
  "girls-chat-room",
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
      "id,slug,status,noindex,title,h1,meta_title,meta_description,canonical_url,content,intro_content,content_status,updated_at,published_at,page_type,country_id,state_id,city_id,category_id,template_id,keyword_group_id,primary_keyword,internal_link_count,seo_score,internal_links_json",
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
    seo_score: p.seo_score,
  };
}

async function counts(sb) {
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
  return { publishedCount, draftCount, noindexCount };
}

async function snapshot(sb) {
  const c = await counts(sb);
  const pages = await loadPages(sb, [...SECOND_LIVE_BATCH, "lahore-chat-room"]);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, snapshotRow(p)]));
  const doc = {
    captured_at: new Date().toISOString(),
    ...c,
    batch: SECOND_LIVE_BATCH.map((s) => bySlug[s] || { slug: s, missing: true }),
    lahore: bySlug["lahore-chat-room"] || null,
  };
  writeFileSync("/tmp/phase4e-snapshot.json", JSON.stringify(doc, null, 2));
  console.log("=== PRE-PUBLISH SNAPSHOT ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function validatePage(sb, page, redirects) {
  const fails = [];
  if (!page) return { ok: false, fails: ["missing page"], ready: false };
  if (page.status !== "draft" || page.noindex !== true) {
    fails.push(`expected draft+noindex got ${page.status}/${page.noindex}`);
  }
  if (page.content_status !== "complete") fails.push(`content_status=${page.content_status}`);
  if (!page.h1?.trim()) fails.push("missing h1");
  if (!page.title?.trim()) fails.push("missing title");
  if (!page.meta_title?.trim() || !page.meta_description?.trim()) fails.push("missing meta");
  const blob = `${page.intro_content || ""}${page.content || ""}${page.h1 || ""}${page.meta_title || ""}`;
  if (/\{[a-z_]+\}/i.test(blob)) fails.push("unresolved tokens");
  if ((page.content || "").replace(/<[^>]+>/g, "").trim().length < 300) fails.push("thin content");
  if (redirects.has(page.slug)) fails.push("redirect conflict from_slug");

  const { data: links, error } = await sb
    .from("page_internal_links")
    .select("target_url,target_page_id,anchor_text")
    .eq("page_id", page.id);
  if (error) fails.push(`links error: ${error.message}`);
  for (const l of links || []) {
    const slug = (l.target_url || "").replace(/^\//, "");
    if (!slug) {
      fails.push("empty target_url");
      continue;
    }
    const { data: target } = await sb.from("custom_pages").select("id,slug,status").eq("slug", slug).maybeSingle();
    if (!target) fails.push(`broken link target /${slug}`);
  }

  const composed = composePublicCmsHtml({ intro: page.intro_content, content: page.content });
  if (!composed.trim()) fails.push("empty composed html");

  // READY gate: draft + noindex + complete + meta/h1 present (Phase 4C.1 definition)
  const ready =
    page.status === "draft" &&
    page.noindex === true &&
    page.content_status === "complete" &&
    !!page.h1?.trim() &&
    !!page.meta_title?.trim() &&
    !!page.meta_description?.trim() &&
    fails.length === 0;

  return { ok: fails.length === 0 && ready, fails, ready, link_count: (links || []).length };
}

async function validate(sb) {
  const { data: redirs } = await sb.from("page_redirects").select("from_slug");
  const redirects = new Set((redirs || []).map((r) => r.from_slug));
  const pages = await loadPages(sb, SECOND_LIVE_BATCH);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const results = [];
  for (const slug of SECOND_LIVE_BATCH) {
    const v = await validatePage(sb, bySlug[slug], redirects);
    results.push({ slug, ...v });
  }
  const doc = {
    passed: results.filter((r) => r.ok).map((r) => r.slug),
    failed: results.filter((r) => !r.ok),
    results,
  };
  writeFileSync("/tmp/phase4e-validate.json", JSON.stringify(doc, null, 2));
  console.log("=== PRE-PUBLISH VALIDATION ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function publish(sb, validation) {
  const passed = new Set(validation?.passed || []);
  const attempted = [];
  const published = [];
  const skipped = [];

  for (const slug of SECOND_LIVE_BATCH) {
    attempted.push(slug);
    if (!passed.has(slug)) {
      skipped.push({ slug, reason: "validation_failed" });
      continue;
    }
    const before = (await loadPages(sb, [slug]))[0];
    const contentHashBefore = sha(before?.content);
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
      .select("id,slug,status,noindex,published_at,updated_at,content")
      .maybeSingle();
    if (error) {
      skipped.push({ slug, reason: error.message });
      continue;
    }
    if (!data) {
      skipped.push({ slug, reason: "update matched 0 rows" });
      continue;
    }
    if (sha(data.content) !== contentHashBefore) {
      skipped.push({ slug, reason: "content hash changed unexpectedly" });
      continue;
    }
    published.push({
      id: data.id,
      slug: data.slug,
      status: data.status,
      noindex: data.noindex,
      published_at: data.published_at,
      content_hash_unchanged: true,
    });
  }

  const doc = { attempted, published, skipped };
  writeFileSync("/tmp/phase4e-publish.json", JSON.stringify(doc, null, 2));
  console.log("=== PUBLISH RESULT ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function verifyDb(sb) {
  const batch = await loadPages(sb, SECOND_LIVE_BATCH);
  const prior = await loadPages(sb, ALREADY_PUBLISHED);
  const c = await counts(sb);

  const batchOk = batch.every((p) => p.status === "published" && p.noindex === false);
  const priorOk = prior.every((p) => p.status === "published" && p.noindex === false);

  const { data: remainingDrafts } = await sb
    .from("custom_pages")
    .select("slug,status,noindex")
    .eq("status", "draft");

  const lahore = (await loadPages(sb, ["lahore-chat-room"]))[0];
  const lahoreBeforeAt = lahore.updated_at;
  const lahoreHashBefore = sha(lahore.content);
  await recalculateInternalLinkCount(sb, LAHORE_ID, { refreshJsonCache: true });
  const lahoreAfter = (await loadPages(sb, ["lahore-chat-room"]))[0];

  const doc = {
    published_count: c.publishedCount,
    draft_count: c.draftCount,
    noindex_count: c.noindexCount,
    expected_published: 17,
    batch_published_ok: batchOk,
    prior_still_published_ok: priorOk,
    batch: batch.map((p) => ({
      slug: p.slug,
      status: p.status,
      noindex: p.noindex,
      content_hash: sha(p.content),
    })),
    remaining_drafts: (remainingDrafts || []).map((p) => ({
      slug: p.slug,
      status: p.status,
      noindex: p.noindex,
    })),
    remaining_drafts_all_noindex: (remainingDrafts || []).every((p) => p.noindex === true),
    lahore: {
      id: lahore.id,
      slug: lahore.slug,
      status: lahore.status,
      noindex: lahore.noindex,
      content_hash: sha(lahore.content),
      content_hash_ok: sha(lahore.content) === LAHORE_HASH && lahoreHashBefore === LAHORE_HASH,
      updated_at_before_cache: lahoreBeforeAt,
      updated_at_after_cache: lahoreAfter.updated_at,
      cache_refresh_preserved: String(lahoreBeforeAt) === String(lahoreAfter.updated_at),
    },
  };
  writeFileSync("/tmp/phase4e-verify-db.json", JSON.stringify(doc, null, 2));
  console.log("=== POST-PUBLISH DB ===");
  console.log(JSON.stringify(doc, null, 2));
  if (!batchOk) throw new Error("Batch publish DB check failed");
  if (!priorOk) throw new Error("Prior published set changed — STOP");
  if (c.publishedCount !== 17) throw new Error(`Expected 17 published, got ${c.publishedCount}`);
  if (!doc.remaining_drafts_all_noindex) throw new Error("Draft without noindex — STOP");
  if (!doc.lahore.content_hash_ok) throw new Error("Lahore hash changed — STOP");
  if (!doc.lahore.cache_refresh_preserved) throw new Error("Lahore updated_at bumped by cache — STOP");
  return doc;
}

async function fetchPublic(path) {
  const url = `${PUBLIC_ORIGIN}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Googlebot/2.1 phase4e-verify", accept: "text/html" },
      redirect: "follow",
    });
    const html = await res.text();
    return { url, status: res.status, html };
  } catch (e) {
    return { url, status: 0, error: String(e), html: "" };
  }
}

async function verifyPublic(sb) {
  const newSlugs = SECOND_LIVE_BATCH;
  const samplePrior = ["lahore-chat-room", "pakistan-chat-room", "india-chat-room"];
  const http = {};

  for (const slug of newSlugs) {
    const res = await fetchPublic(`/${slug}`);
    const audit = auditInitialCmsHtml(res.html || "", {
      expectedCanonical: `${PUBLIC_ORIGIN}/${slug}`,
      expectIndexable: true,
    });
    http[slug] = {
      status: res.status,
      error: res.error || null,
      ssr_ok: audit.ok,
      ssr_failures: audit.failures,
      h1_count: audit.h1Count,
      h1s: audit.h1Texts.slice(0, 2),
      robots: audit.robots,
      canonical: audit.canonical,
      unresolved_tokens: /\{[a-z_]+\}/i.test(res.html || ""),
    };
  }

  for (const slug of samplePrior) {
    const res = await fetchPublic(`/${slug}`);
    const audit = auditInitialCmsHtml(res.html || "", {
      expectedCanonical: `${PUBLIC_ORIGIN}/${slug}`,
      expectIndexable: true,
    });
    http[slug] = {
      status: res.status,
      ssr_ok: audit.ok,
      ssr_failures: audit.failures,
      h1_count: audit.h1Count,
      robots: audit.robots,
      canonical: audit.canonical,
    };
  }

  // Draft sample must 404
  const { data: draftSample } = await sb
    .from("custom_pages")
    .select("slug")
    .eq("status", "draft")
    .limit(2);
  const draftHttp = {};
  for (const d of draftSample || []) {
    const res = await fetchPublic(`/${d.slug}`);
    draftHttp[d.slug] = res.status;
  }

  // Sitemap
  const sm = await fetchPublic("/sitemap.xml");
  const locs = [...(sm.html || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const lastmods = [...(sm.html || "").matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  const cmsLocs = locs.filter((u) => SECOND_LIVE_BATCH.some((s) => u.endsWith(`/${s}`)) || ALREADY_PUBLISHED.some((s) => u.endsWith(`/${s}`)));
  const draftLeak = (draftSample || []).some((d) => locs.some((u) => u.endsWith(`/${d.slug}`)));

  // Internal links on hubs
  const pk = await fetchPublic("/pakistan-chat-room");
  const ind = await fetchPublic("/india-chat-room");
  const girls = await fetchPublic("/girls-chat-room");
  const linkCheck = (html, targets) => {
    const visible = (html || "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    return Object.fromEntries(
      targets.map((t) => [t, visible.includes(`href="/${t}"`) || visible.includes(`href='/${t}'`)]),
    );
  };

  const doc = {
    http,
    draft_http: draftHttp,
    sitemap: {
      status: sm.status,
      total_locs: locs.length,
      cms_published_locs: cmsLocs.length,
      expected_cms: 17,
      has_all_17: ALREADY_PUBLISHED.concat(SECOND_LIVE_BATCH).every((s) =>
        locs.some((u) => u.endsWith(`/${s}`)),
      ),
      draft_leak: draftLeak,
      sample_lastmods: lastmods.slice(0, 5),
      lastmods_meaningful: lastmods.every((d) => /^\d{4}-\d{2}-\d{2}/.test(d)),
    },
    activated_links: {
      pakistan_hub: linkCheck(pk.html, [
        "rawalpindi-chat-room",
        "faisalabad-chat-room",
        "multan-chat-room",
      ]),
      india_hub: linkCheck(ind.html, [
        "bengaluru-chat-room",
        "hyderabad-india-chat-room",
        "chennai-chat-room",
        "kolkata-chat-room",
      ]),
      category_sample: linkCheck(girls.html, ["dating-chat-room", "friendship-chat-room"]),
    },
  };
  writeFileSync("/tmp/phase4e-verify-public.json", JSON.stringify(doc, null, 2));
  console.log("=== POST-PUBLISH PUBLIC ===");
  console.log(JSON.stringify(doc, null, 2));
  return doc;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const env = loadEnv();
  const sb = sbClient(env);
  const runAll = args.has("--all") || args.size === 0;

  let validation = null;
  if (runAll || args.has("--snapshot")) await snapshot(sb);
  if (runAll || args.has("--validate")) validation = await validate(sb);
  if (runAll || args.has("--publish")) {
    if (!validation) validation = await validate(sb);
    if (!validation.passed?.length) throw new Error("No pages passed validation — refuse publish");
    if (validation.failed?.length) {
      console.error("Some pages failed validation:", validation.failed);
      throw new Error("Validation incomplete — refuse partial publish of failed pages");
    }
    await publish(sb, validation);
  }
  if (runAll || args.has("--verify")) {
    await verifyDb(sb);
    await verifyPublic(sb);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
