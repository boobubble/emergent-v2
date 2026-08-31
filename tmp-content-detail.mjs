import fs from "node:fs/promises";

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'");
}

function stripTags(html) {
  return decode(String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function words(text) {
  return text.split(/\s+/).filter(Boolean);
}

function extractCmsBody(html) {
  // CMS pages typically wrap prose in prose/article/cms classes
  const chunks = [];
  const patterns = [
    /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
    /class=["'][^"']*(?:prose|cms-body|page-body|rich-text|seo-copy)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/gi,
    /<h1\b[^>]*>[\s\S]*?<\/h1>([\s\S]*?)(?:<footer\b|<nav\b|$)/gi,
  ];
  for (const re of patterns) {
    const m = [...html.matchAll(re)];
    for (const x of m) chunks.push(x[1] || x[0]);
  }
  const best = chunks.sort((a, b) => stripTags(b).length - stripTags(a).length)[0] || "";
  return stripTags(best.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "));
}

const UA = "Mozilla/5.0 (compatible; YaarzoSeoAudit/1.0; +https://yaarzo.com/)";
const urls = [
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
  "https://yaarzo.com/karachi-chat-room",
  "https://yaarzo.com/delhi-chat-room",
  "https://yaarzo.com/chennai-chat-room",
  "https://yaarzo.com/mumbai-chat-room",
  "https://yaarzo.com/islamabad-chat-room",
];

function hTags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))].map((m) => stripTags(m[1]));
}

function title(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]) : "";
}

async function analyze(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const cms = extractCmsBody(html);
  const h1 = hTags(html, "h1");
  const h2 = hTags(html, "h2");
  const h3 = hTags(html, "h3");
  // paragraphs
  const ps = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1])).filter((t) => t.length > 40);
  const lis = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
  const emails = [...html.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map((m) => m[0]);
  const boo = [...html.matchAll(/boo\s?bubble/gi)].map((m) => m[0]);
  const empty = [
    "No public posts yet",
    "Be one of the first members",
    "No posts yet",
    "Loading",
    "Sign in",
  ].filter((s) => html.includes(s));
  return {
    url,
    status: res.status,
    title: title(html),
    h1,
    h2,
    h3: h3.slice(0, 15),
    pCount: ps.length,
    paragraphs: ps.slice(0, 8),
    lastParagraphs: ps.slice(-3),
    listCount: lis.length,
    cmsWords: words(cms).length,
    pWords: words(ps.join(" ")).length,
    first800: (ps.join(" ")).slice(0, 800),
    emails: [...new Set(emails)],
    boo,
    empty,
    htmlBytes: Buffer.byteLength(html),
    hasArticle: /<article\b/i.test(html),
    hasAuthor: /author|written by|byline/i.test(html),
    hasDate: /datetime=|published|updated/i.test(html),
    blogCards: [...html.matchAll(/href=["'](\/blog\/[^"']+)["']/gi)].map((m) => m[1]).slice(0, 20),
    bodySnippet: stripTags(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")).slice(0, 600),
  };
}

const out = [];
for (const url of urls) {
  out.push(await analyze(url));
  process.stderr.write("ok " + url + "\n");
}

// similarity on paragraph text
function shingles(text, n = 6) {
  const w = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((x) => x.length > 2);
  const set = new Set();
  for (let i = 0; i <= w.length - n; i++) set.add(w.slice(i, i + n).join(" "));
  return set;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

const landers = out.filter((p) => /chat-room/.test(p.url));
const pairs = [];
for (let i = 0; i < landers.length; i++) {
  for (let j = i + 1; j < landers.length; j++) {
    const sa = shingles(landers[i].paragraphs.join(" "));
    const sb = shingles(landers[j].paragraphs.join(" "));
    const sim = jaccard(sa, sb);
    pairs.push({
      a: landers[i].url.replace("https://yaarzo.com/", ""),
      b: landers[j].url.replace("https://yaarzo.com/", ""),
      sim: Number(sim.toFixed(3)),
      pWordsA: landers[i].pWords,
      pWordsB: landers[j].pWords,
    });
  }
}
pairs.sort((a, b) => b.sim - a.sim);

await fs.writeFile("tmp-content-detail.json", JSON.stringify({ pages: out, pairs }, null, 2));
console.log(JSON.stringify({
  pages: out.map((p) => ({
    path: p.url.replace("https://yaarzo.com", "") || "/",
    status: p.status,
    title: p.title,
    h1: p.h1,
    h2: p.h2,
    pCount: p.pCount,
    pWords: p.pWords,
    cmsWords: p.cmsWords,
    empty: p.empty,
    boo: p.boo,
    emails: p.emails,
    hasArticle: p.hasArticle,
    hasAuthor: p.hasAuthor,
    hasDate: p.hasDate,
    blogCards: p.blogCards,
    firstPara: p.paragraphs[0] || null,
  })),
  topSim: pairs.filter((p) => p.sim >= 0.08).slice(0, 20),
}, null, 2));
