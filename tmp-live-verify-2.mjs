const htmlRes = await fetch("https://yaarzo.com/");
const html = await htmlRes.text();
const land = await (await fetch("https://yaarzo.com/api/public/landing")).json();

const needles = [
  "sandra498",
  "davidm",
  "sofiya31",
  "Latest Signups",
  "Famous Chat",
  "Popular Chat",
  "Quick Links",
  "Custom Pages",
  "CmsFooterLinks",
  "client-eager",
  "i18next",
  "fonts.googleapis",
  "fonts.gstatic",
  "ChatApp",
  "AuthDialogs",
  "GuestNickname",
  "adsbygoogle",
  "googletagmanager",
  "gtag(",
];

const modulePreloads = [...html.matchAll(/rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
const scripts = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
const uniqueScripts = [...new Set([...scripts, ...modulePreloads.filter((h) => h.endsWith(".js"))])];
const sizes = {};
for (const s of uniqueScripts) {
  const r = await fetch("https://yaarzo.com" + (s.startsWith("http") ? new URL(s).pathname : s));
  const buf = Buffer.from(await r.arrayBuffer());
  sizes[s] = { status: r.status, bytes: buf.length, gzip: r.headers.get("content-encoding"), cl: r.headers.get("content-length") };
}

const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || null;
const canon = (html.match(/rel="canonical"[^>]*href="([^"]+)"/i) || html.match(/href="([^"]+)"[^>]*rel="canonical"/i) || [])[1] || null;

const vercel = await fetch("https://yaarzo.com/", { method: "HEAD" });
const headers = {
  xVercelId: vercel.headers.get("x-vercel-id"),
  xVercelCache: vercel.headers.get("x-vercel-cache"),
  age: vercel.headers.get("age"),
  date: vercel.headers.get("date"),
};

console.log(JSON.stringify({
  http: htmlRes.status,
  headers,
  h1Count,
  title,
  canon,
  source: land.source,
  newMembers: (land.newMembers || []).length,
  featured: (land.featuredMembers || []).length,
  needles: Object.fromEntries(needles.map((k) => [k, html.includes(k)])),
  uniqueScripts,
  sizes,
  modulePreloads,
  htmlBytes: html.length,
}, null, 2));
