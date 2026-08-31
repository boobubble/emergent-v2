const urls = [
  "https://yaarzo.com/",
  "https://yaarzo.com/lahore-chat-room",
  "https://yaarzo.com/about-us",
  "https://yaarzo.com/blog",
  "https://yaarzo.com/blog/yahoo",
  "https://yaarzo.com/feed",
  "https://yaarzo.com/communities",
];

const UA =
  "Mozilla/5.0 (compatible; YaarzoSchemaAudit/1.0; +https://yaarzo.com/)";

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

async function fetchPage(url) {
  const t0 = Date.now();
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
  });
  const html = await res.text();
  const ms = Date.now() - t0;
  const hdr = {};
  res.headers.forEach((v, k) => {
    hdr[k.toLowerCase()] = v;
  });
  return { url: res.url, requested: url, status: res.status, ms, html, hdr };
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    try {
      blocks.push({ valid: true, parsed: JSON.parse(raw), bytes: raw.length });
    } catch (e) {
      blocks.push({
        valid: false,
        error: String(e.message || e),
        rawPreview: raw.slice(0, 400),
        bytes: raw.length,
      });
    }
  }
  return blocks;
}

function typesFrom(node, acc = new Set()) {
  if (!node || typeof node !== "object") return acc;
  if (Array.isArray(node)) {
    for (const n of node) typesFrom(n, acc);
    return acc;
  }
  const t = node["@type"];
  if (typeof t === "string") acc.add(t);
  else if (Array.isArray(t)) t.forEach((x) => acc.add(String(x)));
  if (node["@graph"]) typesFrom(node["@graph"], acc);
  for (const [k, v] of Object.entries(node)) {
    if (k === "@type" || k === "@context") continue;
    if (v && typeof v === "object") typesFrom(v, acc);
  }
  return acc;
}

function stripTags(s) {
  return decode(String(s || "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function analyze(html) {
  const title = stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const canonical =
    (html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) ||
      [])[1] || null;
  const robots =
    (html.match(/name=["']robots["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]*name=["']robots["']/i) ||
      [])[1] || null;
  const desc =
    (html.match(/name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]*name=["']description["']/i) ||
      [])[1] || null;
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((x) =>
    stripTags(x[1]),
  );
  const microdata = {
    itemscope: (html.match(/itemscope/gi) || []).length,
    itemtype: [...html.matchAll(/itemtype=["']([^"']+)["']/gi)].map((x) => x[1]),
    itemprop: (html.match(/itemprop=/gi) || []).length,
  };
  const rdfa = {
    typeof: (html.match(/\btypeof=["']/gi) || []).length,
    vocab: (html.match(/\bvocab=["']/gi) || []).length,
    property: (html.match(/\bproperty=["'](?:og:|twitter:|fb:)/gi) || []).length,
    rdfaProperty: (html.match(/\bproperty=["'](?!og:|twitter:|fb:)[^"']+["']/gi) || [])
      .length,
  };
  const faqHints = {
    faqPageInHtml: /FAQPage/i.test(html),
    faqHeading: /<h[1-6][^>]*>[\s\S]{0,80}faq/i.test(html),
  };
  return { title, canonical, robots, desc, h1, microdata, rdfa, faqHints };
}

const out = [];
for (const url of urls) {
  try {
    const page = await fetchPage(url);
    const jsonld = extractJsonLd(page.html);
    const meta = analyze(page.html);
    const types = [];
    for (const b of jsonld) {
      if (b.valid) types.push(...typesFrom(b.parsed));
    }
    out.push({
      requested: url,
      finalUrl: page.url,
      status: page.status,
      ms: page.ms,
      bytes: page.html.length,
      meta,
      jsonld,
      types: [...new Set(types)],
      jsonLdCount: jsonld.length,
    });
    console.error(`OK ${page.status} ${url} jsonld=${jsonld.length} types=${types.join(",") || "-"}`);
  } catch (e) {
    out.push({ requested: url, error: String(e) });
    console.error(`ERR ${url} ${e}`);
  }
}

const { writeFileSync } = await import("fs");
writeFileSync("tmp-schema-refresh.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify({ pages: out.length, file: "tmp-schema-refresh.json" }));
