import { readFileSync } from "node:fs";

const lhr = JSON.parse(readFileSync("tmp-lh-p3a-live/run-1.json", "utf8"));
const audits = lhr.audits;
const keys = Object.keys(audits).filter((k) => /lcp|render|bootup|mainthread|network-request|font|unused-js|legacy|preload|redirect|document-latency|first-contentful/i.test(k));
console.log("audit keys", keys);

function brief(id) {
  const a = audits[id];
  if (!a) return null;
  return {
    id,
    title: a.title,
    displayValue: a.displayValue,
    numericValue: a.numericValue,
    score: a.score,
    items: a.details?.items?.slice?.(0, 8) ?? a.details?.nodes?.slice?.(0, 3) ?? undefined,
    type: a.details?.type,
    headings: a.details?.headings?.map((h) => h.key || h.label),
  };
}

for (const id of [
  "largest-contentful-paint",
  "largest-contentful-paint-element",
  "lcp-lazy-loaded",
  "prioritize-lcp-image",
  "render-blocking-resources",
  "bootup-time",
  "mainthread-work-breakdown",
  "network-requests",
  "network-rtt",
  "network-server-latency",
  "redirects",
  "unminified-javascript",
  "unused-javascript",
  "font-display",
  "preload-fonts",
  "uses-rel-preload",
  "critical-request-chains",
]) {
  const b = brief(id);
  if (b) console.log("\n===", id, "===\n", JSON.stringify(b, null, 2).slice(0, 2500));
}

const insights = lhr.insights || lhr.audits?.insights;
console.log("\ninsights keys", insights && Object.keys(insights));
if (lhr.trace) console.log("has trace");
const extra = lhr.configSettings;
console.log("throttling", extra?.throttling, extra?.throttlingMethod, extra?.formFactor);

const items = audits["network-requests"]?.details?.items ?? [];
const interesting = items.map((x) => ({
  url: (x.url || "").replace("https://yaarzo.com", ""),
  mime: x.mimeType,
  transfer: x.transferSize,
  resource: x.resourceSize,
  start: x.networkRequestTime,
  end: x.networkEndTime,
  priority: x.priority,
  rendererStart: x.networkRequestTime,
})).slice(0, 30);
console.log("\nfirst requests", JSON.stringify(interesting, null, 2));

const lcpEl = audits["largest-contentful-paint-element"];
console.log("\nlcp element raw details keys", lcpEl && Object.keys(lcpEl.details || {}));
console.log(JSON.stringify(lcpEl?.details, null, 2)?.slice(0, 4000));
