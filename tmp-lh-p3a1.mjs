import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = "tmp-lh-p3a1c";
mkdirSync(outDir, { recursive: true });

function waitForJson(path, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (existsSync(path)) {
        try {
          const lhr = JSON.parse(readFileSync(path, "utf8"));
          if (lhr.audits && lhr.categories) return resolve(lhr);
        } catch {
          /* still writing */
        }
      }
      if (Date.now() - start > timeoutMs) return reject(new Error(`timeout waiting for ${path}`));
      setTimeout(tick, 1500);
    };
    tick();
  });
}

function runChild(i, out) {
  const userData = join(tmpdir(), `lh-p3a1c-${Date.now()}-${i}`);
  return new Promise((resolve, reject) => {
    const child = spawn(
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
    child.on("error", reject);
    child.on("close", (code) => resolve(code));
  });
}

async function run(i) {
  const out = `${outDir}/run-${i}.json`;
  if (existsSync(out)) unlinkSync(out);
  const childDone = runChild(i, out);
  const lhr = await Promise.race([
    waitForJson(out, 180_000),
    childDone.then((code) => {
      if (existsSync(out)) return JSON.parse(readFileSync(out, "utf8"));
      throw new Error(`lighthouse exited ${code} without ${out}`);
    }),
  ]);
  await Promise.race([childDone, new Promise((r) => setTimeout(r, 8000))]);
  return lhr;
}

function ms(v) {
  if (v == null) return null;
  return Math.round(v);
}

function lcpRenderDelay(lhr) {
  const items = lhr.audits["lcp-breakdown-insight"]?.details?.items ?? [];
  const table = items.find((x) => x.type === "table");
  const rows = table?.items ?? [];
  const ttfb = rows.find((x) => x.subpart === "timeToFirstByte");
  const render = rows.find((x) => x.subpart === "elementRenderDelay");
  const loadDelay = rows.find((x) => x.subpart === "resourceLoadDelay");
  const loadTime = rows.find((x) => x.subpart === "resourceLoadTime");
  return {
    ttfbMs: ttfb ? ms(ttfb.duration) : null,
    renderDelayMs: render ? ms(render.duration) : null,
    loadDelayMs: loadDelay ? ms(loadDelay.duration) : null,
    loadTimeMs: loadTime ? ms(loadTime.duration) : null,
  };
}

function cssFacts(lhr) {
  const items = lhr.audits["network-requests"]?.details?.items ?? [];
  const css = items.filter((x) => (x.mimeType || "").includes("css") || /\.css(\?|$)/.test(x.url || ""));
  const firstPartyCss = css.filter((x) => /yaarzo\.com|\/assets\//.test(x.url || ""));
  const blocking = lhr.audits["render-blocking-insight"];
  const styleLayout = (lhr.audits["mainthread-work-breakdown"]?.details?.items ?? []).find((x) => x.group === "styleLayout");
  return {
    cssTransferKb: Math.round(firstPartyCss.reduce((a, x) => a + (x.transferSize || 0), 0) / 1024),
    cssDecodedKb: Math.round(firstPartyCss.reduce((a, x) => a + (x.resourceSize || 0), 0) / 1024),
    cssUrls: firstPartyCss.map((x) => ({
      url: (x.url || "").replace("https://yaarzo.com", ""),
      transfer: x.transferSize,
      decoded: x.resourceSize,
    })),
    renderBlockingMs: blocking?.details?.items?.[0]?.wastedMs ?? 0,
    renderBlockingDisplay: blocking?.displayValue ?? null,
    styleLayoutMs: styleLayout ? ms(styleLayout.duration) : null,
    requestCount: items.length,
    lcpLabel: lhr.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.node?.nodeLabel ?? null,
  };
}

const rows = [];
for (let i = 1; i <= 5; i++) {
  console.log(`\n=== Lighthouse 3A.1 run ${i}/5 ===`);
  const lhr = await run(i);
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
    ...lcpRenderDelay(lhr),
    ...cssFacts(lhr),
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
