#!/usr/bin/env node
import {
  BASELINE,
  GOLDEN_ALL,
  GOLDEN_BLOG,
  GOLDEN_CMS,
  GOLDEN_NEGATIVE,
  MODULES,
  PROTECTED_FILES,
  testsForModule,
} from "./config.mjs";

const problems = [];
if (BASELINE.commit !== "82bdd7fe") problems.push("baseline commit mismatch");
if (BASELINE.sitemap.http5xx !== 0) problems.push("baseline 5xx must be 0");
if (GOLDEN_ALL.length < 15) problems.push("golden list too short");
if (!GOLDEN_CMS.includes("/lahore-chat-room")) problems.push("missing CMS golden slug");
if (!GOLDEN_BLOG.includes("/blog")) problems.push("missing /blog");
if (!GOLDEN_NEGATIVE.some((n) => n.status === 404)) problems.push("missing 404 negative");
if (PROTECTED_FILES.length < 10) problems.push("protected list too short");
if (!PROTECTED_FILES.includes("src/routes/$slug.tsx")) problems.push("$slug must be protected");
if (!MODULES.homepage || !MODULES.cms || !MODULES.blog) problems.push("core modules missing");
const allTests = testsForModule("all");
if (allTests.length < 8) problems.push("all-module tests too short");

if (problems.length) {
  console.error("Guard config self-check failed:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  JSON.stringify(
    {
      ok: true,
      baseline: BASELINE.commit,
      modules: Object.keys(MODULES),
      protected: PROTECTED_FILES.length,
      golden: GOLDEN_ALL.length,
      testsAll: allTests.length,
    },
    null,
    2,
  ),
);
