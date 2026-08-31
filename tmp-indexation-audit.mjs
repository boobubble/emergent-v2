import { writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (compatible; YaarzoIndexAudit/1.0)";

async function fetchUrl(url, opts = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: opts.method || "GET",
      redirect: opts.redirect || "manual",
      headers: { "User-Agent": UA, Accept: opts.accept || "*/*" },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const hdr = {};
    res.headers.forEach((v, k) => {
      hdr[k.toLowerCase()] = v;
    });
    return {
      url,
      status: res.status,
      location: hdr.location || null,
      type: hdr["content-type"] || null,
      xRobots: hdr["x-robots-tag"] || null,
      cache: hdr["cache-control"] || null,
      bytes: buf.length,
      ms: Date.now() - t0,
      body: opts.skipBody ? null : buf.toString("utf8"),
      error: null,
    };
  } catch (e) {
    return {
      url,
      status: 0,
      location: null,
      type: null,
      xRobots: null,
      bytes: 0,
      ms: Date.now() - t0,
      body: null,
      error: e.message,
      cause: e.cause?.reason || e.cause?.code || null,
    };
  }
}

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function parseHtml(html) {
  if (!html) return null;
  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) =>
    decode(m[1].replace(/<[^>]+>/g, "").trim()),
  );
  const descs = [...html.matchAll(/name=["']description["'][^>]*content=["']([^"']*)["']/gi)].map((m) => decode(m[1]));
  const canons = [...html.matchAll(/rel=["']canonical["'][^>]*href=["']([^"']*)["']/gi)].map((m) => m[1]);
  const robots = [...html.matchAll(/name=["']robots["'][^>]*content=["']([^"']*)["']/gi)].map((m) => decode(m[1]));
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    decode(m[2] ? m[2] : m[1].replace(/<[^>]+>/g, "")).trim(),
  );
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")).trim());
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    titles,
    titleCount: titles.length,
    descs,
    descCount: descs.length,
    canons,
    canonCount: canons.length,
    robots,
    robotsCount: robots.length,
    h1: h1s,
    wordCount: text ? text.split(/\s+/).length : 0,
    textStart: text.slice(0, 220),
    loadingOnly: text.length < 80 && /Loading/i.test(text),
  };
}

async function follow(url, max = 5) {
  const hops = [];
  let current = url;
  for (let i = 0; i < max; i++) {
    const r = await fetchUrl(current);
    hops.push({ url: current, status: r.status, location: r.location, type: r.type, error: r.error, cause: r.cause });
    if (![301, 302, 303, 307, 308].includes(r.status) || !r.location) break;
    current = new URL(r.location, current).href;
  }
  return hops;
}

function page(fetched) {
  const seo = parseHtml(fetched.body);
  const canon = seo?.canons?.[0] || null;
  const noindex = (seo?.robots || []).some((r) => /noindex|none/i.test(r)) || /noindex/i.test(fetched.xRobots || "");
  const self =
    canon &&
    (canon.replace(/\/$/, "") === fetched.url.replace(/\/$/, "") || canon === fetched.url);
  return {
    url: fetched.url,
    status: fetched.status,
    location: fetched.location,
    type: fetched.type,
    xRobots: fetched.xRobots,
    error: fetched.error,
    cause: fetched.cause,
    title: seo?.titles?.[0] || null,
    description: seo?.descs?.[0] || null,
    canonical: canon,
    canonCount: seo?.canonCount || 0,
    robots: seo?.robots || [],
    indexable: !noindex && fetched.status === 200,
    selfCanonical: !!self,
    h1: seo?.h1 || [],
    wordCount: seo?.wordCount || 0,
    loadingOnly: !!seo?.loadingOnly,
    textStart: seo?.textStart || "",
  };
}

async function mapLimit(items, n, fn) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

const robots = await fetchUrl("https://yaarzo.com/robots.txt", { accept: "text/plain,*/*" });
const sitemap = await fetchUrl("https://yaarzo.com/sitemap.xml", { accept: "application/xml,text/xml,*/*" });

const isIndex = /<sitemapindex/i.test(sitemap.body || "");
const childSitemaps = [...(sitemap.body || "").matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>/gi)].map((m) => decode(m[1]));
const locs = [...(sitemap.body || "").matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => decode(m[1]));
const lastmods = [...(sitemap.body || "").matchAll(/<lastmod>([^<]+)<\/lastmod>/gi)].map((m) => m[1]);
const locCounts = {};
for (const l of locs) locCounts[l] = (locCounts[l] || 0) + 1;
const dupLocs = Object.entries(locCounts).filter(([, n]) => n > 1);

let allSitemapDocs = [{ url: "https://yaarzo.com/sitemap.xml", status: sitemap.status, type: sitemap.type, isIndex, locs, lastmodCount: lastmods.length, bytes: sitemap.bytes, error: sitemap.error }];
if (isIndex) {
  for (const child of childSitemaps) {
    const c = await fetchUrl(child, { accept: "application/xml,*/*" });
    const clocs = [...(c.body || "").matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => decode(m[1]));
    allSitemapDocs.push({ url: child, status: c.status, type: c.type, isIndex: false, locs: clocs, lastmodCount: [...(c.body || "").matchAll(/<lastmod>/gi)].length, bytes: c.bytes, error: c.error });
  }
}

const allLocs = [...new Set(allSitemapDocs.flatMap((d) => d.locs || []))];

const sitemapChecks = await mapLimit(allLocs, 4, async (loc) => {
  const r = await fetchUrl(loc);
  const p = page(r);
  return {
    loc,
    status: r.status,
    location: r.location,
    xRobots: r.xRobots,
    robots: p.robots,
    noindex: !p.indexable && r.status === 200,
    canonical: p.canonical,
    selfCanonical: p.selfCanonical,
    title: p.title,
    wordCount: p.wordCount,
    loadingOnly: p.loadingOnly,
    query: loc.includes("?"),
  };
});

const canonicalTargets = [
  "/",
  "/chatroom",
  "/communities",
  "/competitions",
  "/poetry",
  "/india-chat-room",
  "/pakistan-chat-room",
  "/lahore-chat-room",
  "/delhi-chat-room",
  "/mumbai-chat-room",
  "/chennai-chat-room",
  "/bengaluru-chat-room",
  "/hyderabad-india-chat-room",
  "/kolkata-chat-room",
  "/karachi-chat-room",
  "/islamabad-chat-room",
  "/rawalpindi-chat-room",
  "/faisalabad-chat-room",
  "/girls-chat-room",
  "/friendship-chat-room",
  "/dating-chat-room",
  "/usa-chat-room",
  "/uk-chat-room",
  "/english-chat-room-free-online-chat",
];

const canonPages = await mapLimit(canonicalTargets, 4, async (p) => page(await fetchUrl("https://yaarzo.com" + p)));

const privateRoutes = ["/login", "/signup", "/admin", "/account", "/settings", "/notifications", "/api/public/feedback-showcase"];
const privatePages = await mapLimit(privateRoutes, 4, async (p) => page(await fetchUrl("https://yaarzo.com" + p)));

const invalids = [
  "/this-page-definitely-does-not-exist-xyz123",
  "/chat-room-fake-city-zzzz",
  "/ahmedabad-chat-room",
  "/community/not-a-real-community-zzz",
  "/competitions/not-a-real-comp-zzz",
  "/poetry/not-a-real-poem-slug-zzz",
  "/page",
];
const invalidPages = await mapLimit(invalids, 4, async (p) => page(await fetchUrl("https://yaarzo.com" + p)));

const redirectTests = [
  "http://yaarzo.com/",
  "http://www.yaarzo.com/",
  "https://www.yaarzo.com/",
  "https://yaarzo.com/",
  "https://yaarzo.com/delhi-chat-room",
  "https://yaarzo.com/delhi-chat-room/",
  "https://yaarzo.com/pakistani-chat-rooms",
  "https://yaarzo.com/pakistani-chat-room",
  "https://yaarzo.com/pakistan-chat-rooms",
  "https://yaarzo.com/pakistan-chat-room",
  "https://yaarzo.com/lahore-chat-rooms",
  "https://yaarzo.com/lahore-chat-room",
  "https://yaarzo.com/chatrooms",
  "https://yaarzo.com/chatroom",
];
const redirectHops = [];
for (const u of redirectTests) redirectHops.push({ url: u, hops: await follow(u) });

const paramTests = [
  "/feed?tab=account",
  "/feed?tab=trending",
  "/communities?sort=trending",
  "/communities?category=gaming",
  "/poetry?category=Love",
  "/search?q=lahore",
  "/chatroom?room=lobby",
];
const paramPages = await mapLimit(paramTests, 4, async (p) => page(await fetchUrl("https://yaarzo.com" + p)));

const extraStatus = ["/about-us", "/privacy-policy", "/terms-conditions", "/welcome", "/heropage", "/u/not-a-real-user-zzz", "/hall-of-fame"];
const extraPages = await mapLimit(extraStatus, 4, async (p) => page(await fetchUrl("https://yaarzo.com" + p)));

const out = {
  robots: { status: robots.status, type: robots.type, xRobots: robots.xRobots, body: robots.body, bytes: robots.bytes },
  sitemapRaw: { status: sitemap.status, type: sitemap.type, xRobots: sitemap.xRobots, bytes: sitemap.bytes, isIndex, childSitemaps, locCount: locs.length, uniqueLocs: allLocs.length, lastmodCount: lastmods.length, dupLocs, xmlStart: (sitemap.body || "").slice(0, 180), error: sitemap.error },
  allSitemapDocs,
  sitemapChecks,
  canonPages,
  privatePages,
  invalidPages,
  redirectHops,
  paramPages,
  extraPages,
};

await writeFile("tmp-indexation-audit.json", JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      robots: robots.status,
      sitemap: sitemap.status,
      type: sitemap.type,
      isIndex,
      unique: allLocs.length,
      dups: dupLocs.length,
      smStatus: sitemapChecks.reduce((a, s) => {
        a[s.status] = (a[s.status] || 0) + 1;
        return a;
      }, {}),
      private: privatePages.map((p) => p.url.replace("https://yaarzo.com", "") + "=" + p.status + " robots=" + (p.robots[0] || p.xRobots)),
      invalids: invalidPages.map((p) => p.url.replace("https://yaarzo.com", "") + "=" + p.status + " canon=" + p.canonical + " robots=" + (p.robots[0] || "")),
      redirects: redirectHops.map((r) => ({
        u: r.url,
        hops: r.hops.map((h) => h.status + (h.error ? ":" + (h.cause || h.error) : "") + (h.location ? "->" + h.location : "")),
      })),
    },
    null,
    2,
  ),
);
