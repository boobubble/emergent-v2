const UA = "Mozilla/5.0 (compatible; YaarzoSeoAudit/1.0; +https://yaarzo.com/)";

async function fetchUrl(url, opts = {}) {
  const method = opts.method || "GET";
  const redirect = opts.redirect || "manual";
  const headers = { "User-Agent": opts.ua || UA, Accept: opts.accept || "*/*", ...(opts.headers || {}) };
  const t0 = Date.now();
  const res = await fetch(url, { method, redirect, headers });
  const buf = method === "HEAD" ? null : Buffer.from(await res.arrayBuffer());
  const ms = Date.now() - t0;
  const hdr = {};
  res.headers.forEach((v, k) => { hdr[k.toLowerCase()] = v; });
  return {
    url,
    status: res.status,
    redirected: res.redirected,
    location: hdr.location || null,
    type: hdr["content-type"] || null,
    bytes: buf?.length ?? Number(hdr["content-length"] || 0),
    ms,
    headers: hdr,
    body: buf && (opts.text !== false) ? buf.toString("utf8") : null,
    buf,
  };
}

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function allMatches(html, re) {
  return [...String(html || "").matchAll(re)].map((m) => decode(m[1].trim()));
}

function meta(html, attr, key) {
  const a = String(html).match(new RegExp(`${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"));
  const b = String(html).match(new RegExp(`content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i"));
  return a?.[1] || b?.[1] || null;
}

function countMeta(html, attr, key) {
  const r1 = [...String(html).matchAll(new RegExp(`${attr}=["']${key}["']`, "gi"))];
  return r1.length;
}

function parseHead(html) {
  const titles = allMatches(html, /<title[^>]*>([\s\S]*?)<\/title>/gi);
  const descriptions = [
    ...allMatches(html, /name=["']description["'][^>]*content=["']([^"']*)["']/gi),
    ...allMatches(html, /content=["']([^"']*)["'][^>]*name=["']description["']/gi),
  ];
  const canonicals = [
    ...allMatches(html, /rel=["']canonical["'][^>]*href=["']([^"']*)["']/gi),
    ...allMatches(html, /href=["']([^"']*)["'][^>]*rel=["']canonical["']/gi),
  ];
  const robots = [
    ...allMatches(html, /name=["']robots["'][^>]*content=["']([^"']*)["']/gi),
    ...allMatches(html, /content=["']([^"']*)["'][^>]*name=["']robots["']/gi),
  ];
  const h1 = allMatches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((t) => t.replace(/<[^>]+>/g, "").trim());
  const h2 = allMatches(html, /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi).map((t) => t.replace(/<[^>]+>/g, "").trim());
  const h3 = allMatches(html, /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi).map((t) => t.replace(/<[^>]+>/g, "").trim());
  const headings = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    tag: m[1].toLowerCase(),
    text: decode(m[2].replace(/<[^>]+>/g, "")).trim(),
  }));
  const jsonld = [...html.matchAll(/type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try {
      return { valid: true, parsed: JSON.parse(m[1]) };
    } catch (e) {
      return { valid: false, error: String(e), raw: m[1].slice(0, 200) };
    }
  });
  const hrefs = [...html.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const imgs = [...html.matchAll(/<img\b([^>]*)>/gi)].map((m) => {
    const tag = m[1];
    const attr = (name) => (tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i")) || [])[1] || null;
    return { src: attr("src"), alt: attr("alt"), w: attr("width"), h: attr("height"), loading: attr("loading") };
  });
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    titles: [...new Set(titles)],
    titleCount: titles.length,
    descriptions: [...new Set(descriptions)],
    descCount: descriptions.length,
    canonicals: [...new Set(canonicals)],
    canonCount: canonicals.length,
    robots: [...new Set(robots)],
    robotsCount: robots.length,
    h1,
    h1Count: h1.length,
    h2,
    h3,
    headings,
    jsonld,
    hrefs,
    imgs,
    textSample: text.slice(0, 400),
    textWords: text ? text.split(/\s+/).length : 0,
    hasLoadingOnly: /^\s*Loading[.…]/i.test(text) || (text.trim() === "Loading…" || text.trim() === "Loading..."),
    og: {
      title: meta(html, "property", "og:title"),
      description: meta(html, "property", "og:description"),
      url: meta(html, "property", "og:url"),
      type: meta(html, "property", "og:type"),
      image: meta(html, "property", "og:image"),
      titleCount: countMeta(html, "property", "og:title"),
      descCount: countMeta(html, "property", "og:description"),
      urlCount: countMeta(html, "property", "og:url"),
      typeCount: countMeta(html, "property", "og:type"),
      imageCount: countMeta(html, "property", "og:image"),
    },
    twitter: {
      card: meta(html, "name", "twitter:card"),
      title: meta(html, "name", "twitter:title"),
      description: meta(html, "name", "twitter:description"),
      image: meta(html, "name", "twitter:image"),
      cardCount: countMeta(html, "name", "twitter:card"),
    },
  };
}

function jsonLdTypes(blocks) {
  const types = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n["@type"]) types.push(n["@type"]);
    if (n["@graph"]) walk(n["@graph"]);
  };
  for (const b of blocks) if (b.valid) walk(b.parsed);
  return types.flat();
}

async function parseSitemap(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => decode(m[1].trim()));
  const isIndex = /<sitemapindex/i.test(xml);
  return { isIndex, locs: [...new Set(locs)], rawCount: locs.length };
}

const out = { startedAt: new Date().toISOString() };

// 1 homepage + robots + sitemap
const home = await fetchUrl("https://yaarzo.com/");
out.homepage = { status: home.status, ms: home.ms, bytes: home.bytes, type: home.type, headers: {
  "x-robots-tag": home.headers["x-robots-tag"] || null,
  "cache-control": home.headers["cache-control"] || null,
  "content-security-policy": home.headers["content-security-policy"] ? "present" : null,
  "strict-transport-security": home.headers["strict-transport-security"] || null,
  "x-frame-options": home.headers["x-frame-options"] || null,
  "content-type": home.type,
}, seo: parseHead(home.body) };
out.homepage.seo.jsonLdTypes = jsonLdTypes(out.homepage.seo.jsonld);

const robots = await fetchUrl("https://yaarzo.com/robots.txt");
out.robots = { status: robots.status, type: robots.type, body: robots.body };

const sm = await fetchUrl("https://yaarzo.com/sitemap.xml");
out.sitemapIndex = { status: sm.status, type: sm.type, ...(await parseSitemap(sm.body || "")) };

const childMaps = [];
if (out.sitemapIndex.isIndex) {
  for (const loc of out.sitemapIndex.locs) {
    const child = await fetchUrl(loc);
    const parsed = await parseSitemap(child.body || "");
    childMaps.push({ loc, status: child.status, type: child.type, urlCount: parsed.rawCount, unique: parsed.locs.length });
    out._allLocs = (out._allLocs || []).concat(parsed.locs);
  }
} else {
  out._allLocs = out.sitemapIndex.locs;
}
out.childSitemaps = childMaps;
const allLocs = out._allLocs || [];
const dupes = allLocs.filter((u, i) => allLocs.indexOf(u) !== i);
out.sitemapSummary = {
  totalRaw: allLocs.length,
  unique: [...new Set(allLocs)].length,
  duplicates: [...new Set(dupes)],
};

const uniqueLocs = [...new Set(allLocs)];
out.sitemapUrlsSample = uniqueLocs.slice(0, 30);

await import("node:fs/promises").then((fs) => fs.writeFile("tmp-seo-audit-partial.json", JSON.stringify({ ...out, _allLocs: uniqueLocs }, null, 2)));
console.log(JSON.stringify({
  homeStatus: home.status,
  homeMs: home.ms,
  robotsStatus: robots.status,
  sitemapStatus: sm.status,
  sitemapIsIndex: out.sitemapIndex.isIndex,
  childMaps: childMaps.length,
  uniqueUrls: uniqueLocs.length,
  duplicates: out.sitemapSummary.duplicates.length,
}, null, 2));
console.log("---ROBOTS---");
console.log(robots.body);
console.log("---SITEMAP HEAD---");
console.log((sm.body || "").slice(0, 1500));
