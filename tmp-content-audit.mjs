const UA = "Mozilla/5.0 (compatible; YaarzoSeoAudit/1.0; +https://yaarzo.com/)";

const FOCUS = [
  "https://yaarzo.com/",
  "https://yaarzo.com/lahore-chat-room",
  "https://yaarzo.com/india-chat-room",
  "https://yaarzo.com/pakistan-chat-room",
  "https://yaarzo.com/teen-chat-room",
  "https://yaarzo.com/friendship-chat-room",
  "https://yaarzo.com/dating-chat-room",
  "https://yaarzo.com/girls-chat-room",
  "https://yaarzo.com/about-us",
  "https://yaarzo.com/contact-us",
  "https://yaarzo.com/privacy-policy",
  "https://yaarzo.com/terms-conditions",
  "https://yaarzo.com/blog",
  "https://yaarzo.com/blog/yahoo",
  "https://yaarzo.com/communities",
];

const EMPTY_PATTERNS = [
  /no public posts yet/i,
  /be one of the first members/i,
  /no posts yet/i,
  /no comments yet/i,
  /nothing here yet/i,
  /coming soon/i,
  /no results/i,
  /empty/i,
  /join to see/i,
  /sign in to/i,
  /no articles/i,
  /no blog/i,
];

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

function stripTags(html) {
  return decode(String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractMain(html) {
  const candidates = [];
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) candidates.push(main[1]);
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (article) candidates.push(article[1]);
  const cms = html.match(/id=["'](?:cms-page|page-content|blog-content|home-seo)["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/i);
  if (cms) candidates.push(cms[1]);
  const best = candidates.sort((a, b) => b.length - a.length)[0] || html;
  const cleaned = best
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ");
  return stripTags(cleaned);
}

function fullText(html) {
  return stripTags(
    html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
  );
}

function shingles(text, n = 5) {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const set = new Set();
  for (let i = 0; i <= words.length - n; i++) set.add(words.slice(i, i + n).join(" "));
  return set;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

async function fetchUrl(url) {
  const t0 = Date.now();
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
  });
  const body = await res.text();
  return { url, finalUrl: res.url, status: res.status, ms: Date.now() - t0, bytes: Buffer.byteLength(body), body };
}

function parsePage(html, url) {
  const titles = allMatches(html, /<title[^>]*>([\s\S]*?)<\/title>/gi).map(stripTags);
  const h1 = allMatches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags).filter(Boolean);
  const h2 = allMatches(html, /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi).map(stripTags).filter(Boolean);
  const canonicals = [
    ...allMatches(html, /rel=["']canonical["'][^>]*href=["']([^"']*)["']/gi),
    ...allMatches(html, /href=["']([^"']*)["'][^>]*rel=["']canonical["']/gi),
  ];
  const robots = [
    ...allMatches(html, /name=["']robots["'][^>]*content=["']([^"']*)["']/gi),
    ...allMatches(html, /content=["']([^"']*)["'][^>]*name=["']robots["']/gi),
  ];
  const desc = allMatches(html, /name=["']description["'][^>]*content=["']([^"']*)["']/gi);
  const main = extractMain(html);
  const text = fullText(html);
  const emptyHits = EMPTY_PATTERNS.filter((re) => re.test(html)).map((re) => re.source);
  const emptySnippets = [];
  for (const re of [
    /No public posts yet[\s\S]{0,80}/i,
    /Be one of the first members[\s\S]{0,80}/i,
    /No posts yet[\s\S]{0,80}/i,
    /No articles[\s\S]{0,80}/i,
  ]) {
    const m = html.match(re);
    if (m) emptySnippets.push(stripTags(m[0]).slice(0, 120));
  }
  const boo = [...html.matchAll(/boo\s?bubble/gi)].map((m) => m[0]);
  const author = allMatches(html, /(?:author|byline)[^>]*>([\s\S]*?)<\//gi).slice(0, 5).map(stripTags);
  const dates = allMatches(html, /datetime=["']([^"']+)["']/gi);
  const jsonld = [...html.matchAll(/type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try { return JSON.parse(m[1]); } catch { return null; }
  }).filter(Boolean);
  const types = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n["@type"]) types.push(n["@type"]);
    if (n["@graph"]) walk(n["@graph"]);
  };
  jsonld.forEach(walk);
  const title = titles[0] || "";
  const h1t = h1[0] || "";
  return {
    url,
    title,
    titles,
    description: desc[0] || null,
    canonical: canonicals[0] || null,
    robots: [...new Set(robots)],
    h1,
    h1Count: h1.length,
    h2: h2.slice(0, 12),
    h2Count: h2.length,
    titleEqualsH1: title && h1t && title.replace(/\s*[—–|-].*$/, "").trim().toLowerCase() === h1t.toLowerCase(),
    titleContainsH1: title && h1t && title.toLowerCase().includes(h1t.toLowerCase()),
    h1VsTitle: { title, h1: h1t, unique: !!(title && h1t && title.toLowerCase() !== h1t.toLowerCase()) },
    wordCountFull: text ? text.split(/\s+/).length : 0,
    wordCountMain: main ? main.split(/\s+/).length : 0,
    mainSample: main.slice(0, 500),
    textSample: text.slice(0, 400),
    emptyHits,
    emptySnippets,
    booBubble: [...new Set(boo)],
    booInTitle: /boo\s?bubble/i.test(title),
    author,
    dates: dates.slice(0, 5),
    jsonLdTypes: [...new Set(types.flat())],
    hasContact: /contact|email|@yaarzo|support/i.test(main),
    hasHttps: true,
    spaShell: /id=["']root["']/.test(html) && text.split(/\s+/).length < 40,
    errorShell: /something went wrong|application error|500/i.test(html) && /error/i.test(title),
  };
}

async function pool(items, n, fn) {
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

const sm = await fetchUrl("https://yaarzo.com/sitemap.xml");
const locs = [...(sm.body || "").matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => decode(m[1].trim()));
const urls = [...new Set([...locs, ...FOCUS])];

const pages = await pool(urls, 4, async (url) => {
  try {
    const r = await fetchUrl(url);
    return { ...parsePage(r.body, url), status: r.status, finalUrl: r.finalUrl, ms: r.ms, bytes: r.bytes };
  } catch (e) {
    return { url, status: 0, error: String(e) };
  }
});

const focusSet = new Set(FOCUS);
const focus = pages.filter((p) => focusSet.has(p.url.replace(/\/$/, "") === "https://yaarzo.com" ? "https://yaarzo.com/" : p.url) || FOCUS.includes(p.url));
const landers = pages.filter((p) => /-chat-room$/.test(p.url) || /chat-rooms?\//.test(p.url));

const shingleMap = new Map();
for (const p of pages) {
  if (p.status === 200 && p.mainSample) shingleMap.set(p.url, shingles(extractMainForSim(p)));
}

function extractMainForSim(p) {
  return (p.mainSample || "") + " " + (p.h2 || []).join(" ");
}

const pairs = [];
const landerPages = pages.filter((p) => p.status === 200 && /chat-room/.test(p.url));
for (let i = 0; i < landerPages.length; i++) {
  for (let j = i + 1; j < landerPages.length; j++) {
    const a = landerPages[i];
    const b = landerPages[j];
    const sa = shingles((a.h1?.[0] || "") + " " + (a.h2 || []).join(" ") + " " + (a.description || "") + " " + (a.mainSample || ""), 4);
    const sb = shingles((b.h1?.[0] || "") + " " + (b.h2 || []).join(" ") + " " + (b.description || "") + " " + (b.mainSample || ""), 4);
    const sim = jaccard(sa, sb);
    if (sim >= 0.15) pairs.push({ a: a.url, b: b.url, sim: Number(sim.toFixed(3)), wordsA: a.wordCountMain, wordsB: b.wordCountMain, h1a: a.h1?.[0], h1b: b.h1?.[0] });
  }
}
pairs.sort((x, y) => y.sim - x.sim);

const h1s = pages.filter((p) => p.status === 200).map((p) => ({ url: p.url, h1: p.h1?.[0] || "", title: p.title }));
const dupH1 = {};
for (const x of h1s) {
  const k = (x.h1 || "").toLowerCase();
  if (!k) continue;
  dupH1[k] = dupH1[k] || [];
  dupH1[k].push(x.url);
}

const result = {
  fetchedAt: new Date().toISOString(),
  sitemapStatus: sm.status,
  sitemapCount: locs.length,
  pages: pages.map((p) => {
    const { error, ...rest } = p;
    return rest;
  }),
  statusCounts: pages.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {}),
  focus: pages.filter((p) => FOCUS.some((f) => p.url === f || p.url === f + "/" || (f.endsWith("/") && p.url === f.slice(0, -1)))),
  nearDupes: pairs.slice(0, 25),
  duplicateH1s: Object.entries(dupH1).filter(([, u]) => u.length > 1),
  duplicateTitles: (() => {
    const m = {};
    for (const p of pages) {
      if (p.status !== 200 || !p.title) continue;
      const k = p.title.toLowerCase();
      m[k] = m[k] || [];
      m[k].push(p.url);
    }
    return Object.entries(m).filter(([, u]) => u.length > 1);
  })(),
  booPages: pages.filter((p) => p.booBubble?.length || p.booInTitle),
  thinPages: pages.filter((p) => p.status === 200 && p.wordCountMain < 300).map((p) => ({ url: p.url, words: p.wordCountMain, full: p.wordCountFull, h1: p.h1?.[0], title: p.title })),
};

await import("node:fs/promises").then((fs) => fs.writeFile("tmp-content-audit.json", JSON.stringify(result, null, 2)));
console.log(JSON.stringify({
  sitemap: locs.length,
  statusCounts: result.statusCounts,
  focusSummary: result.focus.map((p) => ({
    url: p.url.replace("https://yaarzo.com", ""),
    status: p.status,
    wordsMain: p.wordCountMain,
    wordsFull: p.wordCountFull,
    title: p.title,
    h1: p.h1,
    h1Count: p.h1Count,
    empty: p.emptySnippets,
    boo: p.booBubble,
    uniqueH1Title: p.h1VsTitle?.unique,
  })),
  nearDupes: result.nearDupes.slice(0, 12),
  dupH1: result.duplicateH1s,
  boo: result.booPages.map((p) => ({ url: p.url, title: p.title, hits: p.booBubble })),
  thin: result.thinPages,
}, null, 2));
