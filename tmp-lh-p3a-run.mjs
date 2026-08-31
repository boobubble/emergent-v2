import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const outDir = "tmp-lh-p3a";
mkdirSync(outDir, { recursive: true });

function run(i) {
  const out = `${outDir}/run-${i}.json`;
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
        "--chrome-flags=--headless=new --no-sandbox --disable-gpu --user-data-dir=" + `${process.env.TEMP || "C:/Users/WIN10~1/AppData/Local/Temp"}/lh-p3a-${i}`,
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
  const js = items.filter((x) => (x.mimeType || "").includes("javascript") || /\.js(\?|$)/.test(x.url || ""));
  const firstPartyJs = js.filter((x) => (x.url || "").includes("yaarzo.com") || (x.url || "").includes("/assets/"));
  const transfer = firstPartyJs.reduce((a, x) => a + (x.transferSize || 0), 0);
  const decoded = firstPartyJs.reduce((a, x) => a + (x.resourceSize || 0), 0);
  const longTasks = lhr.audits["long-tasks"]?.details?.items?.length
    ?? lhr.audits["mainthread-work-breakdown"]?.numericValue;
  return {
    requestCount: items.length,
    iconReqs: items.filter((x) => /lucide|icon-/.test(x.url || "")).length,
    googleFonts: items.filter((x) => /fonts\.googleapis|fonts\.gstatic/.test(x.url || "")).length,
    supabaseJs: items.filter((x) => /supabase|client-eager/.test(x.url || "")).length,
    i18n: items.filter((x) => /i18next/.test(x.url || "")).length,
    jsTransferKb: Math.round(transfer / 1024),
    jsDecodedKb: Math.round(decoded / 1024),
    longTasks,
  };
}

const rows = [];
for (let i = 1; i <= 5; i++) {
  const cached = `${outDir}/run-${i}.json`;
  console.log(`\n=== Lighthouse run ${i}/5${existsSync(cached) && i === 1 ? " (cached)" : ""} ===`);
  const lhr = existsSync(cached) && i === 1
    ? JSON.parse(readFileSync(cached, "utf8"))
    : run(i);
  const perf = Math.round((lhr.categories.performance.score ?? 0) * 100);
  const row = {
    run: i,
    performance: perf,
    lcp: ms(lhr.audits["largest-contentful-paint"]?.numericValue),
    fcp: ms(lhr.audits["first-contentful-paint"]?.numericValue),
    tbt: ms(lhr.audits["total-blocking-time"]?.numericValue),
    cls: lhr.audits["cumulative-layout-shift"]?.numericValue,
    ...requests(lhr),
    lcpElement: lhr.audits["largest-contentful-paint-element"]?.displayValue
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
