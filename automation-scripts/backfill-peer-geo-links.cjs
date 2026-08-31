/**
 * Backfill peer city/country links into page_internal_links.
 *
 * Default is dry-run (prints the plan, writes nothing).
 *
 *   node automation-scripts/backfill-peer-geo-links.cjs
 *   node automation-scripts/backfill-peer-geo-links.cjs --apply
 *
 * The TypeScript planner in src/lib/content-automation/peer-geo-backfill.ts is
 * the source of truth; this script mirrors it for a one-off CLI run.
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const APPLY = process.argv.includes("--apply");
const PEER_GEO_LINK_SOURCE = "peer_geo";

const CITY_CATEGORIES = new Set([
  "india_city",
  "pakistan_city",
  "us_city",
  "uk_city",
  "canada_city",
  "australia_city",
  "city_subcategory",
]);
const CATEGORY_CLUSTER = {
  india_city: "india",
  pakistan_city: "pakistan",
  us_city: "usa",
  uk_city: "uk",
  canada_city: "canada",
  australia_city: "australia",
};

const SITE_HOSTS = /^(www\.)?yaarzo\.com$/i;

function normalizeInternalHref(raw) {
  let s = String(raw || "").trim();
  if (!s) return null;
  s = s.split("#")[0].split("?")[0].trim();
  if (!s) return null;
  let path = s;
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (!SITE_HOSTS.test(u.hostname)) return null;
      path = u.pathname || "/";
    } catch {
      return null;
    }
  } else if (!s.startsWith("/")) {
    return null;
  }
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  const legacy = path.match(/^\/p\/([^/]+)$/i);
  if (legacy) path = `/${legacy[1]}`;
  return path.toLowerCase();
}

function extractInternalHrefs(html) {
  const found = [];
  const re = /href\s*=\s*(["'])([^"']*?)\1/gi;
  let m;
  while ((m = re.exec(html || ""))) {
    const n = normalizeInternalHref(m[2]);
    if (n) found.push(n);
  }
  return found;
}

function isCityPage(p) {
  const t = (p.page_type || "").toLowerCase();
  if (t === "city" || t === "state") return true;
  return CITY_CATEGORIES.has((p.category || "").toLowerCase());
}
function isCountryPage(p) {
  const t = (p.page_type || "").toLowerCase();
  if (t === "country" || t === "hub") return true;
  return (p.category || "").toLowerCase() === "country";
}
function isGeoPage(p) {
  return isCityPage(p) || isCountryPage(p);
}
function slugCluster(slug) {
  return slug.replace(/-chat-room$/i, "").replace(/-chat$/i, "").toLowerCase().trim();
}
function geoClusterKey(page) {
  if (page.country_id && String(page.country_id).trim()) return `id:${page.country_id.trim()}`;
  const cat = (page.category || "").toLowerCase();
  if (CATEGORY_CLUSTER[cat]) return `slug:${CATEGORY_CLUSTER[cat]}`;
  if (isCountryPage(page) || isCityPage(page)) {
    const base = slugCluster(page.slug);
    return base ? `slug:${base}` : null;
  }
  return null;
}
function slugOf(p) {
  const cat = (p.category || "").toLowerCase();
  if (CATEGORY_CLUSTER[cat]) return CATEGORY_CLUSTER[cat];
  if (isCountryPage(p)) return slugCluster(p.slug);
  return null;
}
function sameGeoCluster(a, b) {
  const ka = geoClusterKey(a);
  const kb = geoClusterKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  const sa = ka.startsWith("id:") ? slugOf(a) : ka.slice("slug:".length);
  const sb = kb.startsWith("id:") ? slugOf(b) : kb.slice("slug:".length);
  return !!(sa && sb && sa === sb);
}
function peerAnchorLabel(page) {
  const raw = (page.h1 || page.title || page.slug).replace(/\s+/g, " ").trim();
  const stripped = raw.replace(/\s*[|–—].*$/, "").replace(/\s+chat(\s+room)?$/i, "").trim();
  return stripped || page.slug.replace(/-/g, " ");
}
function byPriority(a, b) {
  return (b.link_priority ?? 0) - (a.link_priority ?? 0);
}
function pickPeerPages(source, pool, max = 3) {
  if (!isGeoPage(source)) return [];
  let resolved = source;
  if ((source.category || "").toLowerCase() === "city_subcategory" && !source.country_id) {
    const prefix = source.slug.toLowerCase();
    const parent = pool
      .filter((p) => isCityPage(p) && (p.category || "").toLowerCase() !== "city_subcategory")
      .filter((p) => prefix.startsWith(p.slug.replace(/-chat-room$/i, "").toLowerCase()))
      .sort((a, b) => b.slug.length - a.slug.length)[0];
    if (parent) {
      resolved = { ...source, country_id: parent.country_id || source.country_id, category: parent.category || source.category };
    }
  }
  const candidates = pool.filter((p) => {
    if (p.id === resolved.id || p.slug === resolved.slug) return false;
    if (!isGeoPage(p)) return false;
    return sameGeoCluster(resolved, p);
  });
  const picked = [];
  const seen = new Set();
  const add = (p) => {
    if (!p || picked.length >= max) return;
    if (seen.has(p.slug)) return;
    seen.add(p.slug);
    picked.push(p);
  };
  if (isCityPage(resolved)) {
    add(candidates.filter(isCountryPage).sort(byPriority)[0]);
    for (const c of candidates.filter(isCityPage).sort(byPriority)) add(c);
  } else {
    for (const c of candidates.filter(isCityPage).sort(byPriority)) add(c);
  }
  if (picked.length === 0) {
    for (const slug of ["international-chat-room", "online-chat-room", "friendship-chat-room", "free-chat-room"]) {
      add(pool.find((p) => p.slug === slug));
    }
  }
  return picked;
}

async function main() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_URL) in .env.local");
    process.exit(1);
  }
  const sb = createClient(url, key);

  const { data: pages, error: pageErr } = await sb
    .from("custom_pages")
    .select("id, slug, title, h1, content, status, page_type, category, country_id, city_id, link_priority")
    .eq("status", "published");
  if (pageErr) throw new Error(pageErr.message);

  const { data: blogs, error: blogErr } = await sb.from("blog_posts").select("slug, content").eq("status", "published");
  if (blogErr) throw new Error(blogErr.message);

  const { data: graph, error: graphErr } = await sb.from("page_internal_links").select("page_id, target_url");
  if (graphErr) throw new Error(graphErr.message);

  const incoming = {};
  const bump = (dest) => {
    incoming[dest] = (incoming[dest] || 0) + 1;
  };
  const idToPath = new Map(pages.map((p) => [p.id, `/${p.slug}`]));

  for (const p of pages) {
    const src = `/${p.slug}`;
    for (const href of extractInternalHrefs(p.content || "")) {
      if (href !== src) bump(href);
    }
  }
  for (const b of blogs || []) {
    const src = `/blog/${b.slug}`;
    for (const href of extractInternalHrefs(b.content || "")) {
      if (href !== src) bump(href);
    }
  }
  for (const row of graph || []) {
    const src = idToPath.get(row.page_id);
    const dest = normalizeInternalHref(row.target_url);
    if (src && dest && dest !== src) bump(dest);
  }

  const geoPool = pages.filter(isGeoPage);
  const orphans = geoPool.filter((p) => (incoming[`/${p.slug}`] || 0) === 0);
  const existing = new Set((graph || []).map((row) => `${row.page_id}|${normalizeInternalHref(row.target_url) || row.target_url}`));

  const inserts = [];
  const seen = new Set();
  const skipped = [];
  for (const source of orphans) {
    const peers = pickPeerPages(source, pages, 3);
    if (peers.length === 0) {
      skipped.push(source.slug);
      continue;
    }
    const edges = [];
    for (const peer of peers) {
      edges.push([source, peer], [peer, source]);
    }
    for (const [from, to] of edges) {
      const targetUrl = `/${to.slug}`;
      const key = `${from.id}|${targetUrl}`;
      if (existing.has(key) || seen.has(key)) continue;
      seen.add(key);
      inserts.push({
        page_id: from.id,
        source_slug: from.slug,
        target_page_id: to.id,
        target_url: targetUrl,
        anchor_text: peerAnchorLabel(to),
      });
    }
  }

  const bySource = {};
  for (const row of inserts) {
    (bySource[row.source_slug] ||= []).push(row.target_url);
  }

  console.log(APPLY ? "APPLY MODE" : "DRY RUN (pass --apply to write)");
  console.log(`Geo orphans: ${orphans.length}`);
  console.log(`Skipped (no peers): ${skipped.length}${skipped.length ? ` — ${skipped.join(", ")}` : ""}`);
  console.log(`Planned inserts: ${inserts.length}`);
  console.log(`Pages touched: ${Object.keys(bySource).length}`);
  for (const [slug, urls] of Object.entries(bySource).sort()) {
    console.log(`  ${slug} → ${urls.join(", ")}`);
  }

  if (!APPLY) {
    console.log("\nNo writes. Re-run with --apply to insert page_internal_links rows.");
    return;
  }

  let inserted = 0;
  const touched = new Set();
  for (const row of inserts) {
    const { error } = await sb.from("page_internal_links").insert({
      page_id: row.page_id,
      target_page_id: row.target_page_id,
      target_url: row.target_url,
      anchor_text: row.anchor_text,
      sort_order: 200,
      is_manual: true,
      source: PEER_GEO_LINK_SOURCE,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (/duplicate|unique/i.test(error.message || "")) continue;
      throw new Error(error.message);
    }
    inserted += 1;
    touched.add(row.page_id);
  }
  console.log(`\nInserted ${inserted} rows across ${touched.size} pages.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
