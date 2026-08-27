#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
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
if (BASELINE.guardrailsCommit !== "b0809284") problems.push("guardrails baseline commit mismatch");
if (BASELINE.sitemap.http5xx !== 0) problems.push("baseline 5xx must be 0");
if (GOLDEN_ALL.length < 15) problems.push("golden list too short");
if (!GOLDEN_CMS.includes("/lahore-chat-room")) problems.push("missing CMS golden slug");
if (!GOLDEN_BLOG.includes("/blog")) problems.push("missing /blog");
if (!GOLDEN_NEGATIVE.some((n) => n.status === 404)) problems.push("missing 404 negative");
if (PROTECTED_FILES.length < 10) problems.push("protected list too short");
if (!PROTECTED_FILES.includes("src/routes/$slug.tsx")) problems.push("$slug must be protected");
if (!MODULES.homepage || !MODULES.cms || !MODULES.blog) problems.push("core modules missing");
if (!MODULES.guardrails) problems.push("GUARDRAILS module missing");
const allTests = testsForModule("all");
if (allTests.length < 8) problems.push("all-module tests too short");

const alwaysApplyPath = ".cursor/rules/yaarzo-module-guardrails.mdc";
if (!existsSync(alwaysApplyPath)) {
  problems.push("missing always-apply rule .cursor/rules/yaarzo-module-guardrails.mdc");
} else {
  const text = readFileSync(alwaysApplyPath, "utf8");
  if (!/^---[\s\S]*?alwaysApply:\s*true[\s\S]*?---/m.test(text)) {
    problems.push("yaarzo-module-guardrails.mdc must set alwaysApply: true");
  }
  if (!/infer the primary module|auto-detect TASK MODULE/i.test(text)) {
    problems.push("always-apply rule must auto-detect TASK MODULE");
  }
  if (!/TASK MODULE:/.test(text) || !/override/i.test(text)) {
    problems.push("always-apply rule must keep TASK MODULE: as a supported override");
  }
  if (!/\bGUARDRAILS\b/.test(text)) {
    problems.push("always-apply rule must include GUARDRAILS module");
  }
}

const requiredRules = [
  "yaarzo-module-guardrails.mdc",
  "yaarzo-css-safety.mdc",
  "yaarzo-routing-safety.mdc",
  "yaarzo-homepage.mdc",
  "yaarzo-custom-pages.mdc",
  "yaarzo-blog.mdc",
  "yaarzo-feed-chatroom.mdc",
];
for (const name of requiredRules) {
  const path = `.cursor/rules/${name}`;
  if (!existsSync(path)) problems.push(`missing rule ${path}`);
}

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
      guardrailsCommit: BASELINE.guardrailsCommit,
      alwaysApply: true,
      autoDetect: true,
      taskModuleOverride: true,
      modules: Object.keys(MODULES),
      protected: PROTECTED_FILES.length,
      golden: GOLDEN_ALL.length,
      testsAll: allTests.length,
    },
    null,
    2,
  ),
);
