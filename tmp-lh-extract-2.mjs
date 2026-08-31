import { readFileSync } from "node:fs";

for (const run of [1, 3, 4, 5]) {
  const lhr = JSON.parse(readFileSync(`tmp-lh-p3a-live/run-${run}.json`, "utf8"));
  const a = lhr.audits;
  const pick = (id) => {
    const x = a[id];
    if (!x) return null;
    return {
      title: x.title,
      displayValue: x.displayValue,
      numericValue: x.numericValue,
      description: (x.description || "").slice(0, 240),
      details: x.details,
    };
  };
  console.log("\n\n######## RUN", run, "LCP", a["largest-contentful-paint"]?.numericValue, "FCP", a["first-contentful-paint"]?.numericValue);
  console.log("lcp-breakdown-insight", JSON.stringify(pick("lcp-breakdown-insight"), null, 2));
  console.log("lcp-discovery-insight", JSON.stringify(pick("lcp-discovery-insight"), null, 2)?.slice(0, 3000));
  console.log("document-latency-insight", JSON.stringify(pick("document-latency-insight"), null, 2)?.slice(0, 2000));
  console.log("render-blocking-insight", JSON.stringify(pick("render-blocking-insight"), null, 2)?.slice(0, 2000));
  const landing = (a["network-requests"]?.details?.items || []).find((x) => /\/api\/public\/landing/.test(x.url || ""));
  console.log("landing", landing && { start: landing.networkRequestTime, end: landing.networkEndTime, transfer: landing.transferSize, cache: landing.cache });
}
