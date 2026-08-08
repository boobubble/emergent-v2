#!/usr/bin/env node
/**
 * Phase 4C — Lahore taxonomy map + priority-set content differentiation + conservative internal links.
 *
 * Usage:
 *   npx tsx scripts/phase4c-priority-set.mjs --propose-lahore
 *   npx tsx scripts/phase4c-priority-set.mjs --apply-lahore
 *   npx tsx scripts/phase4c-priority-set.mjs --improve-content
 *   npx tsx scripts/phase4c-priority-set.mjs --link
 *   npx tsx scripts/phase4c-priority-set.mjs --report
 *   npx tsx scripts/phase4c-priority-set.mjs --all
 *
 * Prefers SUPABASE_DB_URL; falls back to SUPABASE_SERVICE_ROLE_KEY.
 * Never publishes. Never regenerates Lahore body content.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { deriveContentStatus, computeSeoScore } from "../src/lib/pages-cms/template-engine.ts";
import { LAHORE_MAPPING_PLAN } from "../src/lib/pages-cms/phase4a/taxonomy-data.ts";
import {
  PHASE4C_PRIORITY as PRIORITY,
  PHASE4C_ALL_PRIORITY as ALL_PRIORITY,
  buildDifferentiatedContent,
  planPriorityInternalLinks,
  pickAnchor,
  cityAnchors,
  similarity,
  normalizeCity,
} from "../src/lib/pages-cms/phase4c-priority.ts";

const root = process.cwd();
const LAHORE_ID = LAHORE_MAPPING_PLAN.custom_page_id;
const EXPECTED_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";

function loadEnv() {
  const out = { ...process.env };
  for (const file of [".env.local", ".env", "/tmp/.sb_service.env"]) {
    const p = file.startsWith("/") ? file : join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      if (out[m[1]] == null || out[m[1]] === "") out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  // Privileged token files written by local tooling (never commit)
  if ((!out.SUPABASE_SERVICE_ROLE_KEY || out.SUPABASE_SERVICE_ROLE_KEY === "") && existsSync("/tmp/.sb_service")) {
    out.SUPABASE_SERVICE_ROLE_KEY = readFileSync("/tmp/.sb_service", "utf8").trim();
  }
  return out;
}

function sha(content) {
  return createHash("sha256").update(content || "").digest("hex");
}

function createDb(env) {
  const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
  if (dbUrl) {
    const sql = postgres(dbUrl, { max: 1, prepare: false, ssl: "require" });
    return { mode: "postgres", sql, async end() { await sql.end({ timeout: 5 }); } };
  }
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("BLOCKED: need SUPABASE_DB_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return { mode: "service", sb, async end() {} };
}

async function resolveTaxonomy(db) {
  if (db.mode === "postgres") {
    const sql = db.sql;
    const countries = await sql`SELECT id, slug, name FROM public.page_countries WHERE is_active = true`;
    const states = await sql`SELECT id, slug, name, country_id FROM public.page_states WHERE is_active = true`;
    const cities = await sql`SELECT id, slug, name, country_id, state_id FROM public.page_cities WHERE is_active = true`;
    const categories = await sql`SELECT id, slug, name FROM public.page_categories WHERE is_active = true`;
    const kgs = await sql`SELECT id, slug, name FROM public.page_keyword_groups WHERE is_active = true`;
    const tpls = await sql`SELECT id, slug, name FROM public.page_templates WHERE is_active = true`;
    return packTaxonomy(countries, states, cities, categories, kgs, tpls);
  }
  const sb = db.sb;
  const [countries, states, cities, categories, kgs, tpls] = await Promise.all([
    sb.from("page_countries").select("id,slug,name").eq("is_active", true),
    sb.from("page_states").select("id,slug,name,country_id").eq("is_active", true),
    sb.from("page_cities").select("id,slug,name,country_id,state_id").eq("is_active", true),
    sb.from("page_categories").select("id,slug,name").eq("is_active", true),
    sb.from("page_keyword_groups").select("id,slug,name").eq("is_active", true),
    sb.from("page_templates").select("id,slug,name").eq("is_active", true),
  ]);
  for (const r of [countries, states, cities, categories, kgs, tpls]) {
    if (r.error) throw r.error;
  }
  return packTaxonomy(countries.data, states.data, cities.data, categories.data, kgs.data, tpls.data);
}

function packTaxonomy(countries, states, cities, categories, kgs, tpls) {
  const by = (rows) => Object.fromEntries(rows.map((r) => [r.slug, r]));
  return {
    countries,
    states,
    cities,
    categories,
    countryBySlug: by(countries),
    stateBySlugCountry: Object.fromEntries(
      states.map((s) => {
        const cslug = countries.find((c) => c.id === s.country_id)?.slug;
        return [`${cslug}:${s.slug}`, s];
      }),
    ),
    cityBySlugCountry: Object.fromEntries(
      cities.map((ci) => {
        const cslug = countries.find((c) => c.id === ci.country_id)?.slug;
        return [`${cslug}:${ci.slug}`, ci];
      }),
    ),
    categoryBySlug: by(categories),
    kgBySlug: by(kgs),
    tplBySlug: by(tpls),
  };
}

async function fetchLahore(db) {
  if (db.mode === "postgres") {
    return (await db.sql`
      SELECT id, slug, title, status, noindex, page_type, country_id, state_id, city_id, category_id,
             keyword_group_id, template_id, primary_keyword, h1, meta_title, meta_description,
             updated_at, content
      FROM public.custom_pages WHERE id = ${LAHORE_ID}::uuid
    `)[0];
  }
  const { data, error } = await db.sb
    .from("custom_pages")
    .select(
      "id,slug,title,status,noindex,page_type,country_id,state_id,city_id,category_id,keyword_group_id,template_id,primary_keyword,h1,meta_title,meta_description,updated_at,content",
    )
    .eq("id", LAHORE_ID)
    .single();
  if (error) throw error;
  return data;
}

function buildLahoreDiff(before, tax) {
  const pk = tax.countryBySlug.pakistan;
  const punjab = tax.stateBySlugCountry["pakistan:punjab"];
  const lahoreCity = tax.cityBySlugCountry["pakistan:lahore"];
  const chatRooms = tax.categoryBySlug["chat-rooms"];
  const kg = tax.kgBySlug["city-chat-room"];
  const tpl = tax.tplBySlug["city-chat-room"];
  if (!pk || !punjab || !lahoreCity || !chatRooms || !kg || !tpl) {
    throw new Error("Missing taxonomy IDs for Lahore mapping");
  }
  const proposed = {
    page_type: "city",
    country_id: pk.id,
    state_id: punjab.id,
    city_id: lahoreCity.id,
    category_id: chatRooms.id,
    keyword_group_id: kg.id,
    template_id: tpl.id,
    primary_keyword: "lahore chat room",
  };
  return {
    id: before.id,
    before: {
      page_type: before.page_type,
      country_id: before.country_id,
      state_id: before.state_id,
      city_id: before.city_id,
      category_id: before.category_id,
      keyword_group_id: before.keyword_group_id,
      template_id: before.template_id,
      primary_keyword: before.primary_keyword,
      updated_at: before.updated_at,
      content_hash: sha(before.content),
    },
    after: proposed,
    labels: {
      country: pk.name,
      state: punjab.name,
      city: lahoreCity.name,
      category: chatRooms.name,
      keyword_group: kg.name,
      template: tpl.name,
    },
    preserved: {
      slug: before.slug,
      title: before.title,
      status: before.status,
      noindex: before.noindex,
      content_hash: sha(before.content),
      h1: before.h1,
      meta_title: before.meta_title,
      meta_description: before.meta_description,
    },
    will_not_change: [
      "slug",
      "title",
      "content",
      "status",
      "noindex",
      "meta_title",
      "meta_description",
      "h1",
      "intro_content",
      "faq_content",
      "cta_content",
    ],
  };
}

async function proposeLahore(db, tax) {
  const before = await fetchLahore(db);
  if (!before) throw new Error("Lahore row missing");
  const diff = buildLahoreDiff(before, tax);
  writeFileSync("/tmp/phase4c-lahore-propose.json", JSON.stringify(diff, null, 2));
  console.log("=== LAHORE PROPOSED DIFF (taxonomy-only) ===");
  console.log(JSON.stringify(diff, null, 2));
  return diff;
}

async function applyLahore(db, tax) {
  const diff = await proposeLahore(db, tax);
  const beforeHash = diff.before.content_hash;
  const beforeUpdated = diff.before.updated_at;

  let after;
  if (db.mode === "postgres") {
    const updated = await db.sql`
      UPDATE public.custom_pages SET
        page_type = ${diff.after.page_type},
        country_id = ${diff.after.country_id}::uuid,
        state_id = ${diff.after.state_id}::uuid,
        city_id = ${diff.after.city_id}::uuid,
        category_id = ${diff.after.category_id}::uuid,
        keyword_group_id = ${diff.after.keyword_group_id}::uuid,
        template_id = ${diff.after.template_id}::uuid,
        primary_keyword = ${diff.after.primary_keyword},
        updated_at = now()
      WHERE id = ${LAHORE_ID}::uuid
        AND slug = 'lahore-chat-room'
        AND status = 'published'
      RETURNING id, slug, title, status, noindex, page_type, country_id, state_id, city_id, category_id,
                keyword_group_id, template_id, primary_keyword, updated_at, content, h1, meta_title, meta_description
    `;
    after = updated[0];
  } else {
    const { data, error } = await db.sb
      .from("custom_pages")
      .update({
        page_type: diff.after.page_type,
        country_id: diff.after.country_id,
        state_id: diff.after.state_id,
        city_id: diff.after.city_id,
        category_id: diff.after.category_id,
        keyword_group_id: diff.after.keyword_group_id,
        template_id: diff.after.template_id,
        primary_keyword: diff.after.primary_keyword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", LAHORE_ID)
      .eq("slug", "lahore-chat-room")
      .eq("status", "published")
      .select(
        "id,slug,title,status,noindex,page_type,country_id,state_id,city_id,category_id,keyword_group_id,template_id,primary_keyword,updated_at,content,h1,meta_title,meta_description",
      )
      .maybeSingle();
    if (error) throw error;
    after = data;
  }
  if (!after) throw new Error("Lahore update matched 0 rows — STOP");

  const result = {
    ok:
      after.id === LAHORE_ID &&
      after.slug === "lahore-chat-room" &&
      after.title === diff.preserved.title &&
      after.status === "published" &&
      sha(after.content) === beforeHash &&
      after.page_type === "city" &&
      after.city_id === diff.after.city_id,
    before_updated_at: beforeUpdated,
    after_updated_at: after.updated_at,
    content_hash_unchanged: sha(after.content) === beforeHash,
    expected_hash_ok: sha(after.content) === EXPECTED_HASH,
    taxonomy_attached: !!(
      after.country_id &&
      after.state_id &&
      after.city_id &&
      after.category_id &&
      after.keyword_group_id &&
      after.template_id
    ),
    after_row: {
      ...after,
      content: undefined,
      content_len: after.content?.length,
      content_hash: sha(after.content),
    },
  };
  writeFileSync("/tmp/phase4c-lahore-apply.json", JSON.stringify(result, null, 2));
  console.log("=== LAHORE APPLY RESULT ===");
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) throw new Error("Lahore integrity failed after taxonomy map");
  return result;
}

async function loadPriorityPages(db) {
  if (db.mode === "postgres") {
    return await db.sql`
      SELECT p.id, p.slug, p.title, p.status, p.noindex, p.page_type,
             p.country_id, p.state_id, p.city_id, p.category_id,
             p.keyword_group_id, p.template_id, p.primary_keyword, p.h1,
             p.meta_title, p.meta_description, p.intro_content, p.content,
             p.cta_content, p.faq_content, p.content_status, p.seo_score,
             p.internal_link_count, p.updated_at,
             co.name AS country_name, st.name AS state_name, ci.name AS city_name, ca.name AS category_name
      FROM public.custom_pages p
      LEFT JOIN public.page_countries co ON co.id = p.country_id
      LEFT JOIN public.page_states st ON st.id = p.state_id
      LEFT JOIN public.page_cities ci ON ci.id = p.city_id
      LEFT JOIN public.page_categories ca ON ca.id = p.category_id
      WHERE p.slug = ANY(${db.sql.array([...ALL_PRIORITY])})
      ORDER BY p.slug
    `;
  }
  const { data: pages, error } = await db.sb
    .from("custom_pages")
    .select(
      "id,slug,title,status,noindex,page_type,country_id,state_id,city_id,category_id,keyword_group_id,template_id,primary_keyword,h1,meta_title,meta_description,intro_content,content,cta_content,faq_content,content_status,seo_score,internal_link_count,updated_at",
    )
    .in("slug", [...ALL_PRIORITY]);
  if (error) throw error;
  const countryIds = [...new Set(pages.map((p) => p.country_id).filter(Boolean))];
  const stateIds = [...new Set(pages.map((p) => p.state_id).filter(Boolean))];
  const cityIds = [...new Set(pages.map((p) => p.city_id).filter(Boolean))];
  const categoryIds = [...new Set(pages.map((p) => p.category_id).filter(Boolean))];
  const [countries, states, cities, categories] = await Promise.all([
    countryIds.length
      ? db.sb.from("page_countries").select("id,name").in("id", countryIds)
      : { data: [] },
    stateIds.length ? db.sb.from("page_states").select("id,name").in("id", stateIds) : { data: [] },
    cityIds.length ? db.sb.from("page_cities").select("id,name").in("id", cityIds) : { data: [] },
    categoryIds.length
      ? db.sb.from("page_categories").select("id,name").in("id", categoryIds)
      : { data: [] },
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

async function improveContent(db) {
  const pages = await loadPriorityPages(db);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const updated = [];

  for (const page of pages) {
    if (page.slug === "lahore-chat-room") {
      updated.push({ slug: page.slug, skipped: "lahore_content_preserved" });
      continue;
    }
    if (page.status !== "draft") {
      updated.push({ slug: page.slug, skipped: `status=${page.status}` });
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

    const built = buildDifferentiatedContent(page, {
      siblings,
      hubSlug,
      hubLabel,
      priorityCities,
    });

    const content_status = deriveContentStatus(built.content);
    const seo_score = computeSeoScore({
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      h1: built.h1,
      primary_keyword: page.primary_keyword,
      content: built.content,
      noindex: page.noindex,
    });

    if (db.mode === "postgres") {
      await db.sql`
        UPDATE public.custom_pages SET
          intro_content = ${built.intro},
          content = ${built.content},
          cta_content = ${db.sql.json(built.cta)},
          faq_content = ${db.sql.json(built.faq)},
          h1 = COALESCE(h1, ${built.h1}),
          content_status = ${content_status},
          seo_score = ${seo_score},
          updated_at = now()
        WHERE id = ${page.id}::uuid AND status = 'draft'
      `;
    } else {
      const { error } = await db.sb
        .from("custom_pages")
        .update({
          intro_content: built.intro,
          content: built.content,
          cta_content: built.cta,
          faq_content: built.faq,
          h1: page.h1 || built.h1,
          content_status,
          seo_score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", page.id)
        .eq("status", "draft");
      if (error) throw error;
    }

    updated.push({
      slug: page.slug,
      updated: true,
      content_status,
      seo_score,
      content_len: built.content.length,
    });
  }

  writeFileSync("/tmp/phase4c-content.json", JSON.stringify(updated, null, 2));
  console.log("=== CONTENT IMPROVEMENT ===");
  console.log(JSON.stringify(updated, null, 2));
  return updated;
}

async function upsertLink(db, pageId, targetPageId, targetUrl, anchorText, sortOrder) {
  if (db.mode === "postgres") {
    await db.sql`
      INSERT INTO public.page_internal_links (
        page_id, target_page_id, anchor_text, target_url, sort_order, is_manual, updated_at
      ) VALUES (
        ${pageId}::uuid, ${targetPageId}::uuid, ${anchorText}, ${targetUrl}, ${sortOrder}, true, now()
      )
      ON CONFLICT (page_id, target_url, anchor_text) DO NOTHING
    `;
    return;
  }
  const { data: existing, error: e1 } = await db.sb
    .from("page_internal_links")
    .select("id")
    .eq("page_id", pageId)
    .eq("target_url", targetUrl)
    .eq("anchor_text", anchorText)
    .maybeSingle();
  if (e1) throw e1;
  if (existing) return;
  const { error } = await db.sb.from("page_internal_links").insert({
    page_id: pageId,
    target_page_id: targetPageId,
    anchor_text: anchorText,
    target_url: targetUrl,
    sort_order: sortOrder,
    is_manual: true,
    updated_at: new Date().toISOString(),
  });
  if (error && !String(error.message || "").includes("duplicate")) throw error;
}

async function refreshLinkCache(db, pageId) {
  let links;
  if (db.mode === "postgres") {
    links = await db.sql`
      SELECT id, anchor_text, target_url, target_page_id, sort_order, is_manual
      FROM public.page_internal_links
      WHERE page_id = ${pageId}::uuid
      ORDER BY sort_order ASC
    `;
    await db.sql`
      UPDATE public.custom_pages SET
        internal_link_count = ${links.length},
        internal_links_json = ${db.sql.json(links)}
      WHERE id = ${pageId}::uuid
    `;
    return links.length;
  }
  const { data, error } = await db.sb
    .from("page_internal_links")
    .select("id,anchor_text,target_url,target_page_id,sort_order,is_manual")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  links = data || [];
  const { error: e2 } = await db.sb
    .from("custom_pages")
    .update({
      internal_link_count: links.length,
      internal_links_json: links,
    })
    .eq("id", pageId);
  if (e2) throw e2;
  return links.length;
}

async function applyLinks(db) {
  const pages = await loadPriorityPages(db);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const cityNameBySlug = Object.fromEntries(
    [...PRIORITY.pk_cities, ...PRIORITY.in_cities].map((s) => [s, bySlug[s]?.city_name || "city"]),
  );
  const categoryNameBySlug = Object.fromEntries(
    PRIORITY.categories.map((s) => [s, bySlug[s]?.category_name || bySlug[s]?.title || s]),
  );
  const planned = planPriorityInternalLinks({ cityNameBySlug, categoryNameBySlug });
  const linkLog = [];

  for (const link of planned) {
    const from = bySlug[link.from];
    const to = bySlug[link.to];
    if (!from || !to) throw new Error(`Missing page for link ${link.from} → ${link.to}`);
    const sortOrder = linkLog.filter((l) => l.from === link.from).length;
    await upsertLink(db, from.id, to.id, `/${link.to}`, link.anchor, sortOrder);
    linkLog.push(link);
  }

  const counts = {};
  for (const slug of ALL_PRIORITY) {
    const p = bySlug[slug];
    if (!p) throw new Error(`Missing priority page ${slug}`);
    counts[slug] = await refreshLinkCache(db, p.id);
  }

  const out = { link_count: linkLog.length, per_page_counts: counts, sample_links: linkLog.slice(0, 40) };
  writeFileSync("/tmp/phase4c-links.json", JSON.stringify({ ...out, all_links: linkLog }, null, 2));
  console.log("=== INTERNAL LINKS ===");
  console.log(JSON.stringify(out, null, 2));
  return out;
}

async function report(db) {
  const pages = await loadPriorityPages(db);
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const ids = pages.map((p) => p.id);

  let links;
  if (db.mode === "postgres") {
    links = await db.sql`
      SELECT l.page_id, l.anchor_text, l.target_url, l.target_page_id, p.slug AS from_slug
      FROM public.page_internal_links l
      JOIN public.custom_pages p ON p.id = l.page_id
      WHERE l.page_id = ANY(${db.sql.array(ids)}::uuid[])
      ORDER BY p.slug, l.sort_order
    `;
  } else {
    const { data, error } = await db.sb
      .from("page_internal_links")
      .select("page_id,anchor_text,target_url,target_page_id")
      .in("page_id", ids);
    if (error) throw error;
    const idToSlug = Object.fromEntries(pages.map((p) => [p.id, p.slug]));
    links = (data || []).map((l) => ({ ...l, from_slug: idToSlug[l.page_id] }));
  }

  const outgoing = {};
  for (const l of links) {
    if (!outgoing[l.from_slug]) outgoing[l.from_slug] = [];
    outgoing[l.from_slug].push({ anchor: l.anchor_text, url: l.target_url });
  }

  const pkCityPages = PRIORITY.pk_cities.map((s) => bySlug[s]).filter(Boolean);
  const pairs = [];
  for (let i = 0; i < pkCityPages.length; i++) {
    for (let j = i + 1; j < pkCityPages.length; j++) {
      const a = pkCityPages[i];
      const b = pkCityPages[j];
      // Exclude Lahore's preserved long-form body from same-template avg among drafts
      if (a.slug === "lahore-chat-room" || b.slug === "lahore-chat-room") continue;
      const sim = similarity(
        normalizeCity(a.content, a.city_name),
        normalizeCity(b.content, b.city_name),
      );
      pairs.push({ a: a.slug, b: b.slug, sim: Number(sim.toFixed(3)) });
    }
  }
  const avgSim = pairs.length ? pairs.reduce((s, p) => s + p.sim, 0) / pairs.length : 0;

  const rows = [];
  for (const slug of ALL_PRIORITY) {
    const p = bySlug[slug];
    if (!p) {
      rows.push({ slug, classification: "BLOCKED", reason: "missing page" });
      continue;
    }
    const out = outgoing[slug] || [];
    const contentLen = (p.content || "").length;
    let classification = "READY FOR PUBLICATION";
    const notes = [];
    if (p.status === "draft") {
      classification = "NEEDS CONTENT WORK";
      notes.push("still draft+noindex — Phase 4C does not publish");
    }
    if (p.slug !== "lahore-chat-room" && contentLen < 400) {
      classification = "NEEDS CONTENT WORK";
      notes.push("short content");
    }
    if ((p.internal_link_count || 0) === 0 && p.slug !== "lahore-chat-room") {
      classification = "NEEDS CONTENT WORK";
      notes.push("no internal links yet");
    }
    if (p.slug === "lahore-chat-room") {
      if (p.page_type === "city" && p.city_id) {
        classification = "READY FOR PUBLICATION";
        notes.push("already published; taxonomy mapped; content preserved");
      } else {
        classification = "BLOCKED";
        notes.push("taxonomy not mapped");
      }
    }
    if (p.status === "draft" && p.page_type === "city") {
      classification = "NEEDS CONTENT WORK";
      notes.push("improved but keep draft until publish approval");
    }

    rows.push({
      slug: p.slug,
      title: p.title,
      h1: p.h1,
      primary_keyword: p.primary_keyword,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      content_length: contentLen,
      content_status: p.content_status,
      seo_score: p.seo_score,
      internal_link_count: p.internal_link_count,
      outgoing_links: out,
      status: p.status,
      noindex: p.noindex,
      page_type: p.page_type,
      classification,
      notes,
    });
  }

  const lahore = bySlug["lahore-chat-room"];
  const reportDoc = {
    phase: "4C",
    pk_city_draft_avg_similarity_after_normalize: Number(avgSim.toFixed(3)),
    similarity_pairs_sample: pairs.slice(0, 10),
    lahore: lahore
      ? {
          id: lahore.id,
          slug: lahore.slug,
          title: lahore.title,
          status: lahore.status,
          page_type: lahore.page_type,
          primary_keyword: lahore.primary_keyword,
          country_id: lahore.country_id,
          state_id: lahore.state_id,
          city_id: lahore.city_id,
          category_id: lahore.category_id,
          keyword_group_id: lahore.keyword_group_id,
          template_id: lahore.template_id,
          content_hash: sha(lahore.content),
          content_hash_ok: sha(lahore.content) === EXPECTED_HASH,
          updated_at: lahore.updated_at,
          internal_link_count: lahore.internal_link_count,
        }
      : null,
    pages: rows,
    classifications: {
      READY_FOR_PUBLICATION: rows
        .filter((r) => r.classification === "READY FOR PUBLICATION")
        .map((r) => r.slug),
      NEEDS_CONTENT_WORK: rows
        .filter((r) => r.classification === "NEEDS CONTENT WORK")
        .map((r) => r.slug),
      BLOCKED: rows.filter((r) => r.classification === "BLOCKED").map((r) => r.slug),
    },
  };
  writeFileSync("/tmp/phase4c-report.json", JSON.stringify(reportDoc, null, 2));
  console.log("=== PHASE 4C REPORT ===");
  console.log(JSON.stringify(reportDoc, null, 2));
  return reportDoc;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const env = loadEnv();
  const proposeOnly = args.has("--propose-lahore");
  const applyLahoreFlag = args.has("--apply-lahore");
  const improve = args.has("--improve-content");
  const link = args.has("--link");
  const reportFlag = args.has("--report");
  const all = args.has("--all");

  const db = createDb(env);
  console.log(`Phase 4C DB mode: ${db.mode}`);
  try {
    const tax = await resolveTaxonomy(db);

    if (proposeOnly) {
      await proposeLahore(db, tax);
      return;
    }

    if (all || applyLahoreFlag) {
      await proposeLahore(db, tax);
      await applyLahore(db, tax);
    }
    if (all || improve) await improveContent(db);
    if (all || link) await applyLinks(db);
    if (all || reportFlag || applyLahoreFlag || improve || link) await report(db);

    if (!proposeOnly && !applyLahoreFlag && !improve && !link && !reportFlag && !all) {
      console.log(
        "Usage: --propose-lahore | --apply-lahore | --improve-content | --link | --report | --all",
      );
    }
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
