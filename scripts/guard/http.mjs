const DEFAULT_UA = {
  "User-Agent": "YaarzoGuard/1.0",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

export function originFromBase(base) {
  return String(base || "").replace(/\/$/, "");
}

export async function probe(base, path, { follow = false } = {}) {
  const origin = originFromBase(base);
  const url = path.startsWith("http") ? path : `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  const started = Date.now();
  const res = await fetch(url, {
    headers: DEFAULT_UA,
    redirect: follow ? "follow" : "manual",
  });
  const body = await res.text();
  return {
    url,
    path,
    status: res.status,
    ms: Date.now() - started,
    location: res.headers.get("location"),
    finalUrl: res.url,
    title: (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || null,
    robots:
      (body.match(/name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
        body.match(/content=["']([^"']*)["'][^>]+name=["']robots["']/i) || [])[1] || null,
    snippet: res.status >= 500 ? body.slice(0, 240).replace(/\s+/g, " ") : undefined,
  };
}

export function classifyStatus(status) {
  if (status === 200) return "200";
  if (status >= 300 && status < 400) return "3xx";
  if (status === 404) return "404";
  if (status >= 500) return "5xx";
  return "other";
}

export function emptyCounts() {
  return { total: 0, 200: 0, "3xx": 0, 404: 0, "5xx": 0, other: 0 };
}

export function addCount(counts, status) {
  counts.total += 1;
  counts[classifyStatus(status)] += 1;
}

export function parseArgs(argv) {
  const out = { base: process.env.GUARD_BASE || process.env.SEO_VERIFY_BASE || "", rest: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--base" && argv[++i]) out.base = argv[i];
    else if (a === "--live") out.base = out.base || "https://yaarzo.com";
    else if (a === "--follow") out.follow = true;
    else if (a === "--offline") out.offline = true;
    else if (a === "--skip-build") out.skipBuild = true;
    else if (a === "--skip-http") out.skipHttp = true;
    else if (a === "--module" && argv[++i]) out.module = argv[i];
    else if (a === "--fail-on-protected") out.failOnProtected = true;
    else if (a === "--fail-on-cross") out.failOnCross = true;
    else out.rest.push(a);
  }
  return out;
}

export function fail(message, extra) {
  console.error(message);
  if (extra) console.error(extra);
  process.exitCode = 1;
}
