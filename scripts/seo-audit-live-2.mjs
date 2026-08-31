import { readFile, writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (compatible; YaarzoSeoAudit/1.0)";
const decode = (s) => String(s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function fetchUrl(url, opts = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: opts.method || "GET",
      redirect: opts.redirect || "manual",
      headers: { "User-Agent": UA, Accept: opts.accept || "text/html,*/*" },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const hdr = {};
    res.headers.forEach((v, k) => { hdr[k.toLowerCase()] = v; });
    return {
      url, status: res.status, location: hdr.location || null, type: hdr["content-type"] || null,
      bytes: buf.length, ms: Date.now() - t0, xRobots: hdr["x-robots-tag"] || null,
      cache: hdr["cache-control"] || null, hsts: hdr["strict-transport-security"] || null,
      body: buf.toString("utf8"), error: null,
    };
  } catch (e) {
    return { url, status: 0, location: null, type: null, bytes: 0, ms: Date.now() - t0, error: e.message, cause: e.cause?.reason || e.cause?.code || null, body: null };
  }
}

function meta(html, attr, key) {
  const a = String(html).match(new RegExp(`${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"));
  const b = String(html).match(new RegExp(`content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i"));
  return decode(a?.[1] || b?.[1] || "") || null;
}
function countAttr(html, attr, key) {
  return [...String(html).matchAll(new RegExp(`${attr}=["']${key}["']`, "gi"))].length;
}
function parse(html) {
  if (!html) return null;
  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1].replace(/<[^>]+>/g, "").trim()));
  const descs = [...html.matchAll(/name=["']description["'][^>]*content=["']([^"']*)["']/gi)].map((m) => decode(m[1]));
  const canons = [...html.matchAll(/rel=["']canonical["'][^>]*href=["']([^"']*)["']/gi)].map((m) => m[1]);
  const robots = [...html.matchAll(/name=["']robots["'][^>]*content=["']([^"']*)["']/gi)].map((m) => decode(m[1]));
  const headings = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    tag: m[1].toLowerCase(), text: decode(m[2].replace(/<[^>]+>/g, "")).trim(),
  }));
  const h1 = headings.filter((h) => h.tag === "h1").map((h) => h.text);
  const jsonld = [...html.matchAll(/type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try { return { valid: true, parsed: JSON.parse(m[1]) }; } catch (e) { return { valid: false, error: String(e) }; }
  });
  const types = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n["@type"]) types.push(n["@type"]);
    if (n["@graph"]) walk(n["@graph"]);
  };
  jsonld.forEach((b) => b.valid && walk(b.parsed));
  const hrefs = [...html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["']/gi)].map((m) => m[1]);
  const imgs = [...html.matchAll(/<img\b([^>]*)>/gi)].map((m) => {
    const tag = m[1];
    const a = (n) => (tag.match(new RegExp(`${n}=["']([^"']*)["']`, "i")) || [])[1] ?? null;
    return { src: a("src"), alt: a("alt"), hasAlt: /\salt=/i.test(tag), w: a("width"), h: a("height"), loading: a("loading") };
  });
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const levels = headings.map((h) => Number(h.tag[1]));
  let skipped = false;
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skipped = true;
  return {
    titles: [...new Set(titles)], titleCount: titles.length,
    descriptions: [...new Set(descs)], descCount: descs.length,
    canonicals: [...new Set(canons)], canonCount: canons.length,
    robots: [...new Set(robots)], robotsCount: robots.length,
    h1, h1Count: h1.length, headings, emptyHeadings: headings.filter((h) => !h.text).length, skippedHierarchy: skipped,
    jsonld, jsonLdTypes: types.flat(), jsonLdValid: jsonld.length ? jsonld.every((b) => b.valid) : true,
    hasAggregateRating: JSON.stringify(jsonld).includes("AggregateRating"),
    hrefs: [...new Set(hrefs)], imgs, wordCount: text ? text.split(/\s+/).length : 0,
    textStart: text.slice(0, 400), hasLoading: text.length < 80 && /Loading/i.test(text),
    ssrContent: text.length > 120,
    og: { title: meta(html, "property", "og:title"), description: meta(html, "property", "og:description"), url: meta(html, "property", "og:url"), type: meta(html, "property", "og:type"), image: meta(html, "property", "og:image"), titleCount: countAttr(html, "property", "og:title"), descCount: countAttr(html, "property", "og:description"), urlCount: countAttr(html, "property", "og:url"), imageCount: countAttr(html, "property", "og:image") },
    twitter: { card: meta(html, "name", "twitter:card"), image: meta(html, "name", "twitter:image") },
    body: html,
  };
}

function pageReport(fetched) {
  const seo = parse(fetched.body);
  const selfCanon = seo?.canonicals?.[0] || null;
  const indexable = !(seo?.robots || []).some((r) => /noindex/i.test(r)) && !String(fetched.xRobots || "").toLowerCase().includes("noindex");
  return {
    url: fetched.url, status: fetched.status, location: fetched.location, error: fetched.error, cause: fetched.cause,
    ms: fetched.ms, bytes: fetched.bytes, xRobots: fetched.xRobots,
    title: seo?.titles?.[0] || null, description: seo?.descriptions?.[0] || null, canonical: selfCanon,
    canonicalSelf: selfCanon ? (selfCanon.replace(/\/$/, "") === fetched.url.replace(/\/$/, "") || selfCanon === fetched.url) : false,
    robots: seo?.robots || [], indexable, h1: seo?.h1 || [], h1Count: seo?.h1Count || 0,
    ssrContent: !!seo?.ssrContent, hasLoading: !!seo?.hasLoading, wordCount: seo?.wordCount || 0,
    jsonLdTypes: seo?.jsonLdTypes || [], jsonLdValid: seo?.jsonLdValid, hasAggregateRating: seo?.hasAggregateRating,
    duplicates: seo ? { title: seo.titleCount > 1, desc: seo.descCount > 1, canonical: seo.canonCount > 1, ogTitle: seo.og.titleCount > 1, ogDesc: seo.og.descCount > 1, robots: seo.robotsCount > 1 } : null,
    og: seo?.og, twitter: seo?.twitter, headings: seo?.headings || [], emptyHeadings: seo?.emptyHeadings,
    skippedHierarchy: seo?.skippedHierarchy, hrefs: seo?.hrefs || [], imgs: seo?.imgs || [],
    textStart: seo?.textStart || "",
    flags: detectQuality(fetched.url, seo),
  };
}

function detectQuality(url, seo) {
  if (!seo) return [];
  const t = (seo.textStart || "").toLowerCase();
  const flags = [];
  if (/lorem ipsum|todo:|tbd\b|placeholder|coming soon|\[insert|xxx+\b/i.test(seo.textStart)) flags.push("placeholder");
  if (/internal note|do not publish|research note|draft only|ai prompt|system prompt/i.test(seo.textStart + JSON.stringify(seo.headings))) flags.push("internal-notes");
  if ((seo.textStart.match(/#\w+/g) || []).length >= 8) flags.push("hashtag-dump");
  if (seo.wordCount < 150) flags.push("thin");
  if (seo.h1Count !== 1) flags.push("h1-count-" + seo.h1Count);
  if (seo.headings.some((h) => /(chat room.*){3,}/i.test(h.text))) flags.push("keyword-stuffed-heading");
  return flags;
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

const prev = JSON.parse(await readFile("tmp-seo-audit-partial.json", "utf8"));
const sitemapLocs = prev._allLocs;

const representative = ["/", "/chatroom", "/feed", "/communities", "/competitions", "/poetry", "/india-chat-room", "/pakistan-chat-room", "/lahore-chat-room", "/delhi-chat-room", "/chennai-chat-room", "/islamabad-chat-room"];
const landingExtra = ["/mumbai-chat-room", "/karachi-chat-room", "/bengaluru-chat-room", "/hyderabad-india-chat-room", "/kolkata-chat-room", "/multan-chat-room", "/faisalabad-chat-room", "/rawalpindi-chat-room", "/girls-chat-room", "/friendship-chat-room", "/dating-chat-room", "/usa-chat-room", "/uk-chat-room", "/teen-chat-room", "/english-chat-room-free-online-chat", "/chatib-alternative-chat-room", "/about-us", "/contact-us", "/free-chat-room", "/random-chat-room", "/chatrooms", "/find-friends", "/games", "/welcome", "/heropage"];
const invalids = ["/this-page-definitely-does-not-exist-xyz123", "/chat-room-fake-city-zzzz", "/admin/not-a-real-page-zzz", "/poetry/not-a-real-poem-slug-zzz"];
const redirectTests = [
  { url: "http://yaarzo.com/", note: "http homepage" },
  { url: "http://www.yaarzo.com/", note: "http www homepage" },
  { url: "https://www.yaarzo.com/", note: "https www homepage" },
  { url: "https://yaarzo.com/india-chat-room/", note: "trailing slash city" },
  { url: "https://yaarzo.com/chatrooms", note: "legacy chatrooms slug" },
  { url: "https://yaarzo.com/mehfil", note: "mehfil alias" },
];

async function mapLimit(items, n, fn) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

const repFetched = await mapLimit(representative, 5, (p) => fetchUrl("https://yaarzo.com" + p));
const landFetched = await mapLimit(landingExtra, 5, (p) => fetchUrl("https://yaarzo.com" + p));
const smFetched = await mapLimit(sitemapLocs, 5, (loc) => fetchUrl(loc));
const invFetched = await mapLimit(invalids, 4, (p) => fetchUrl("https://yaarzo.com" + p));

const out = {
  representative: repFetched.map(pageReport),
  landings: landFetched.map(pageReport),
  sitemapChecks: smFetched.map((r) => {
    const seo = parse(r.body);
    return { loc: r.url, status: r.status, location: r.location, type: r.type, error: r.error, robots: seo?.robots || [], noindex: (seo?.robots || []).some((x) => /noindex/i.test(x)), canonical: seo?.canonicals?.[0] || null, title: seo?.titles?.[0] || null, wordCount: seo?.wordCount || 0 };
  }),
  invalids: invFetched.map(pageReport),
  redirectHops: [],
};

for (const item of redirectTests) {
  out.redirectHops.push({ note: item.note, url: item.url, hops: await follow(item.url) });
}

const og = await fetchUrl("https://yaarzo.com/og/yaarzo-share.png", { accept: "image/*" });
out.ogImage = { status: og.status, type: og.type, bytes: og.bytes };

await writeFile("tmp-seo-audit-pages.json", JSON.stringify(out, null, 2));
console.log("saved", { reps: out.representative.length, landings: out.landings.length, sm: out.sitemapChecks.length });
console.log("redirects", out.redirectHops.map((r) => ({ note: r.note, hops: r.hops.map((h) => h.status + (h.error ? ":" + h.cause : "") + (h.location ? "->" + h.location : "")) })));
console.log("invalids", out.invalids.map((p) => p.url.replace("https://yaarzo.com", "") + "=" + p.status + " canon=" + p.canonical));
