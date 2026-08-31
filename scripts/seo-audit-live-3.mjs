import { writeFile } from "node:fs/promises";

async function get(u) {
  const r = await fetch(u, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
  });
  const html = await r.text();
  const hdr = {};
  r.headers.forEach((v, k) => {
    hdr[k.toLowerCase()] = v;
  });
  return { status: r.status, html, hdr };
}

function pick(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || null;
  const robots = (html.match(/name=["']robots["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const canon = (html.match(/rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) || [])[1] || null;
  const desc = (html.match(/name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const jsonld = [...html.matchAll(/type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try {
      return JSON.parse(m[1]);
    } catch (e) {
      return { parseError: String(e), raw: m[1].slice(0, 400) };
    }
  });
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const css = [...html.matchAll(/<link[^>]+rel=["']stylesheet["']/gi)].length;
  const preload = [...html.matchAll(/<link[^>]+rel=["']preload["'][^>]*>/gi)].map((m) => m[0].slice(0, 180));
  const mixed = [...html.matchAll(/https?:\/\/|(?:src|href)=["']http:/gi)].filter((m) => m[0].startsWith("http:"));
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return { title, robots, canon, desc, jsonld, scripts, css, preload, mixedHttp: mixed.length, text };
}

const urls = [
  "https://yaarzo.com/",
  "https://yaarzo.com/india-chat-room",
  "https://yaarzo.com/lahore-chat-room",
  "https://yaarzo.com/competitions",
  "https://yaarzo.com/chatroom",
  "https://yaarzo.com/login",
  "https://yaarzo.com/admin",
  "https://yaarzo.com/account",
];

const out = [];
for (const u of urls) {
  const r = await get(u);
  out.push({
    url: u,
    status: r.status,
    bytes: r.html.length,
    xRobots: r.hdr["x-robots-tag"] || null,
    csp: r.hdr["content-security-policy"] || null,
    xfo: r.hdr["x-frame-options"] || null,
    hsts: r.hdr["strict-transport-security"] || null,
    cache: r.hdr["cache-control"] || null,
    ...pick(r.html),
  });
}

await writeFile("tmp-seo-audit-schema.json", JSON.stringify(out, null, 2));
console.log(
  out.map((p) => ({
    url: p.url,
    status: p.status,
    title: p.title,
    robots: p.robots,
    canon: p.canon,
    types: JSON.stringify(p.jsonld).match(/"@type":"[^"]+"/g),
    scripts: p.scripts.length,
    css: p.css,
    text: p.text,
  })),
);
