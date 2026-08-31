import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = "tmp-lh-p3a-live";
mkdirSync(outDir, { recursive: true });

function run(i) {
  const out = `${outDir}/run-${i}.json`;
  const userData = join(tmpdir(), `lh-p3a-live-${Date.now()}-${i}`);
  try {
    execFileSync(
      "npx",
      [
        "lighthouse",
        "https://yaarzo.com/",
        "--only-categories=performance",
        "--form-factor=mobile",
        "--screenEmulation.mobile",
        "--throttling-method=simulate",
        "--output=json",
        `--output-path=${out}`,
        `--chrome-flags=--headless=new --no-sandbox --disable-gpu --user-data-dir=${userData}`,
        "--quiet",
      ],
      { stdio: "inherit", shell: true },
    );
  } catch (err) {
    if (!existsSync(out)) throw err;
    console.warn(`lighthouse cleanup failed for run ${i}; using ${out}`);
  }
  return JSON.parse(readFileSync(out, "utf8"));
}

function ms(v) {
  if (v == null) return null;
  return Math.round(v);
}

function requests(lhr) {
  const items = lhr.audits["network-requests"]?.details?.items ?? [];
  const lcpMs = lhr.audits["largest-contentful-paint"]?.numericValue ?? 0;
  const js = items.filter((x) => (x.mimeType || "").includes("javascript") || /\.js(\?|$)/.test(x.url || ""));
  const firstPartyJs = js.filter((x) => /yaarzo\.com|\/assets\//.test(x.url || ""));
  const initialFirstPartyJs = firstPartyJs.filter((x) => (x.networkRequestTime ?? x.startTime ?? 0) < 1500 || /index-CVlEaeZ3|index-ULj8pC8e|CmsFooterLinks/.test(x.url || ""));
  const transfer = firstPartyJs.reduce((a, x) => a + (x.transferSize || 0), 0);
  const decoded = firstPartyJs.reduce((a, x) => a + (x.resourceSize || 0), 0);
  const initialTransfer = initialFirstPartyJs.reduce((a, x) => a + (x.transferSize || 0), 0);
  const initialDecoded = initialFirstPartyJs.reduce((a, x) => a + (x.resourceSize || 0), 0);
  const beforeLcp = items.filter((x) => {
    const t = x.networkEndTime ?? x.endTime ?? x.networkRequestTime ?? 0;
    return t > 0 && t <= lcpMs;
  });
  const thirdBeforeLcp = beforeLcp.filter((x) => {
    try {
      const host = new URL(x.url).hostname;
      return host && host !== "yaarzo.com" && !host.endsWith(".yaarzo.com");
    } catch {
      return false;
    }
  });
  const longTaskItems = lhr.audits["long-tasks"]?.details?.items ?? [];
  const breakdown = lhr.audits["mainthread-work-breakdown"]?.details?.items ?? [];
  const scripting = breakdown.find((x) => /script/i.test(x.group || x.label || ""));
  return {
    requestCount: items.length,
    iconReqs: items.filter((x) => /lucide|icon-|chevron-right|swords/.test(x.url || "")).length,
    googleFonts: items.filter((x) => /fonts\.googleapis|fonts\.gstatic/.test(x.url || "")).length,
    supabaseJs: items.filter((x) => /supabase|client-eager|auth-js/.test(x.url || "")).length,
    i18n: items.filter((x) => /i18next|i18n-/.test(x.url || "")).length,
    interWoff: items.filter((x) => /inter|fontsource|woff2/.test(x.url || "")).length,
    jsTransferKb: Math.round(transfer / 1024),
    jsDecodedKb: Math.round(decoded / 1024),
    initialJsTransferKb: Math.round(initialTransfer / 1024),
    initialJsDecodedKb: Math.round(initialDecoded / 1024),
    firstPartyJsUrls: firstPartyJs.map((x) => ({
      url: (x.url || "").replace("https://yaarzo.com", ""),
      transfer: x.transferSize,
      decoded: x.resourceSize,
      start: x.networkRequestTime ?? x.startTime,
    })),
    longTaskCount: longTaskItems.length,
    longTaskDurations: longTaskItems.map((x) => x.duration),
    scriptingMs: scripting?.duration ?? null,
    mainthreadMs: lhr.audits["mainthread-work-breakdown"]?.numericValue ?? null,
    thirdPartyBeforeLcp: thirdBeforeLcp.map((x) => x.url),
    ttfb: ms(lhr.audits["server-response-time"]?.numericValue ?? lhr.audits["time-to-first-byte"]?.numericValue),
    lcpBreakdown: lhr.audits["largest-contentful-paint-element"]?.details?.items?.[0] ?? null,
  };
}

const rows = [];
for (let i = 1; i <= 5; i++) {
  console.log(`\n=== Lighthouse live run ${i}/5 ===`);
  const lhr = run(i);
  const perf = Math.round((lhr.categories.performance.score ?? 0) * 100);
  const row = {
    run: i,
    lighthouse: lhr.lighthouseVersion,
    fetchTime: lhr.fetchTime,
    performance: perf,
    lcp: ms(lhr.audits["largest-contentful-paint"]?.numericValue),
    fcp: ms(lhr.audits["first-contentful-paint"]?.numericValue),
    tbt: ms(lhr.audits["total-blocking-time"]?.numericValue),
    cls: lhr.audits["cumulative-layout-shift"]?.numericValue,
    ...requests(lhr),
    lcpElement: lhr.audits["largest-contentful-paint-element"]?.displayValue
      ?? lhr.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet
      ?? lhr.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.node?.snippet,
  };
  console.log(JSON.stringify(row, null, 2));
  rows.push(row);
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const summary = {
  performance: { best: Math.max(...rows.map((r) => r.performance)), worst: Math.min(...rows.map((r) => r.performance)), median: median(rows.map((r) => r.performance)) },
  lcp: { best: Math.min(...rows.map((r) => r.lcp)), worst: Math.max(...rows.map((r) => r.lcp)), median: median(rows.map((r) => r.lcp)) },
  fcp: { best: Math.min(...rows.map((r) => r.fcp)), worst: Math.max(...rows.map((r) => r.fcp)), median: median(rows.map((r) => r.fcp)) },
  tbt: { best: Math.min(...rows.map((r) => r.tbt)), worst: Math.max(...rows.map((r) => r.tbt)), median: median(rows.map((r) => r.tbt)) },
  cls: { best: Math.min(...rows.map((r) => r.cls)), worst: Math.max(...rows.map((r) => r.cls)), median: median(rows.map((r) => r.cls)) },
  rows,
};
writeFileSync(`${outDir}/summary.json`, JSON.stringify(summary, null, 2));
console.log("\n=== SUMMARY ===");
console.log(JSON.stringify(summary, null, 2));
