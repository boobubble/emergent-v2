#!/usr/bin/env node
import { BASELINE, KNOWN_REDIRECTS, PRODUCTION_ORIGIN } from "./config.mjs";
import { addCount, emptyCounts, parseArgs, probe } from "./http.mjs";

const args = parseArgs(process.argv);
const base = args.base || PRODUCTION_ORIGIN;
const sitemapUrl = `${base.replace(/\/$/, "")}/sitemap.xml`;

console.log(`Sitemap gate  ${sitemapUrl}  baseline=${BASELINE.commit} (${BASELINE.sitemap.total} locs, 5xx=0)`);

const sm = await fetch(sitemapUrl, {
  headers: { "User-Agent": "YaarzoGuard/1.0", Accept: "application/xml,text/xml,text/html" },
});
if (sm.status >= 500) {
  console.error(`HARD FAIL: sitemap.xml HTTP ${sm.status}`);
  process.exit(1);
}
if (!sm.ok) {
  console.error(`FAIL: sitemap.xml HTTP ${sm.status}`);
  process.exit(1);
}

const xml = await sm.text();
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!locs.length) {
  console.error("FAIL: sitemap has no <loc> entries");
  process.exit(1);
}

const counts = emptyCounts();
const failures = [];
const redirects = [];
const noindex = [];

for (const loc of locs) {
  const path = new URL(loc).pathname;
  const known = KNOWN_REDIRECTS[path] || KNOWN_REDIRECTS[`${path}/`];
  const row = await probe(base, path, { follow: false });
  addCount(counts, row.status);
  const line = `${row.status}  ${path}${row.title ? `  ${row.title}` : ""}`;
  if (row.status >= 500) {
    console.log(`FAIL ${line}`);
    failures.push({ ...row, reason: "5xx" });
    continue;
  }
  if (row.status === 404) {
    console.log(`FAIL ${line}`);
    failures.push({ ...row, reason: "404-in-sitemap" });
    continue;
  }
  if (row.status >= 300 && row.status < 400) {
    if (known && row.status === known.status) {
      console.log(`OK   ${line} (documented redirect)`);
      redirects.push({ ...row, documented: true });
    } else {
      console.log(`FAIL ${line} → ${row.location || "?"}`);
      failures.push({ ...row, reason: "unexpected-redirect" });
      redirects.push({ ...row, documented: false });
    }
    continue;
  }
  if (row.status !== 200) {
    console.log(`FAIL ${line}`);
    failures.push({ ...row, reason: `status-${row.status}` });
    continue;
  }
  if (/noindex/i.test(row.robots || "")) {
    console.log(`FAIL ${line}  robots=${row.robots}`);
    noindex.push(row);
    failures.push({ ...row, reason: "noindex-in-sitemap" });
    continue;
  }
  console.log(`OK   ${line}`);
}

console.log("COUNTS", JSON.stringify(counts));
if (counts["5xx"] > 0) {
  console.error("HARD FAIL: sitemap loc returned 5xx (blocks deployment).");
}
if (failures.length) {
  console.error("FAILURES", JSON.stringify(failures.map((f) => ({ path: f.path, status: f.status, reason: f.reason, location: f.location })), null, 2));
  process.exit(1);
}
if (BASELINE.sitemap.total && locs.length !== BASELINE.sitemap.total) {
  console.warn(`WARN: loc count ${locs.length} != baseline ${BASELINE.sitemap.total} (not a 5xx fail; confirm intentional sitemap change).`);
}
console.log("Sitemap gate passed.");
