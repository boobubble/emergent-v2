import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://yaarzo.com";
const outDir = new URL("../../yaarzo.com-audit/", import.meta.url);
mkdirSync(fileURLToPath(outDir), { recursive: true });

const ua = {
  "User-Agent": "YaarzoAuditRefresh/1.0",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function pick(html, re) {
  const m = html.match(re);
  return m ? decode(m[1].trim()) : null;
}

function all(html, re) {
  return [...html.matchAll(re)].map((m) => decode(m[1].trim()));
}

function wordCount(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

async function probe(path, { follow = false } = {}) {
  const url = path.startsWith("http") ? path : BASE + path;
  const t0 = Date.now();
  const res = await fetch(url, { headers: ua, redirect: follow ? "follow" : "manual" });
  const html = await res.text();
  const headers = {};
  for (const k of [
    "content-type",
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
    "location",
  ]) {
    const v = res.headers.get(k);
    if (v) headers[k] = v;
  }
  const jsonLd = [];
  for (const raw of all(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      jsonLd.push(JSON.parse(raw));
    } catch {
      jsonLd.push({ invalid: true, raw: raw.slice(0, 200) });
    }
  }
  const h1s = all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((s) => s.replace(/<[^>]+>/g, "").trim());
  const canonicals = [
    ...all(html, /rel=["']canonical["'][^>]+href=["']([^"']*)["']/gi),
    ...all(html, /href=["']([^"']*)["'][^>]+rel=["']canonical["']/gi),
  ];
  return {
    url,
    path: path.startsWith("http") ? new URL(path).pathname : path,
    status: res.status,
    ms: Date.now() - t0,
    headers,
    title: pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description:
      pick(html, /name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      pick(html, /content=["']([^"']*)["'][^>]+name=["']description["']/i),
    robots:
      pick(html, /name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
      pick(html, /content=["']([^"']*)["'][^>]+name=["']robots["']/i),
    canonicals,
    ogTitle:
      pick(html, /property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ||
      pick(html, /content=["']([^"']*)["'][^>]+property=["']og:title["']/i),
    h1s,
    wordCount: wordCount(html),
    jsonLdTypes: jsonLd.flatMap((j) => {
      const t = j?.["@type"] || j?.["@graph"]?.map((n) => n?.["@type"]).filter(Boolean);
      return Array.isArray(t) ? t : t ? [t] : [];
    }),
    jsonLdCount: jsonLd.length,
    boobubble: /boobubble/i.test(html),
    doubledCanonical: canonicals.some((c) => /yaarzo\.com\/yaarzo\.com/i.test(c)),
    location: res.headers.get("location"),
  };
}

const extras = [
  "/__yaarzo-nonexistent-route-test__",
  "/llms.txt",
  "/blog",
  "/blog/yahoo",
  "/robots.txt",
];

const sm = await fetch(`${BASE}/sitemap.xml`, { headers: ua });
const smText = await sm.text();
const locs = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

const sitemapRows = [];
for (const loc of locs) {
  sitemapRows.push(await probe(new URL(loc).pathname));
}

const extraRows = [];
for (const p of extras) extraRows.push(await probe(p));

let www = { ok: false, error: null, status: null };
try {
  const r = await fetch("https://www.yaarzo.com/", { headers: ua, redirect: "manual" });
  www = { ok: true, status: r.status, location: r.headers.get("location") };
} catch (e) {
  www = { ok: false, error: String(e.message || e), status: null };
}

const robots = extraRows.find((r) => r.path === "/robots.txt");
const home = sitemapRows.find((r) => r.path === "/");

const payload = {
  capturedAt: new Date().toISOString(),
  previousScore: 28,
  previousCritical: "29/35 sitemap HTTP 500",
  sitemapHttp: sm.status,
  locCount: locs.length,
  www,
  homeSecurity: home?.headers || {},
  sitemapRows,
  extraRows,
};

writeFileSync(fileURLToPath(new URL("./live-refresh.json", outDir)), JSON.stringify(payload, null, 2));
console.log(JSON.stringify({
  locCount: locs.length,
  sitemap200: sitemapRows.filter((r) => r.status === 200).length,
  sitemap5xx: sitemapRows.filter((r) => r.status >= 500).length,
  sitemap404: sitemapRows.filter((r) => r.status === 404).length,
  sitemap3xx: sitemapRows.filter((r) => r.status >= 300 && r.status < 400).length,
  doubledCanonical: sitemapRows.filter((r) => r.doubledCanonical).map((r) => r.path),
  boobubble: [...sitemapRows, ...extraRows].filter((r) => r.boobubble).map((r) => ({ path: r.path, title: r.title })),
  noindex: sitemapRows.filter((r) => /noindex/i.test(r.robots || "")).map((r) => r.path),
  missingH1: sitemapRows.filter((r) => !r.h1s.length).map((r) => r.path),
  www,
}, null, 2));
