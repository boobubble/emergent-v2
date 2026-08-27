#!/usr/bin/env node
import { execSync } from "node:child_process";
import {
  isProtectedPath,
  owningModules,
  resolveModuleId,
  MODULES,
} from "./config.mjs";
import { parseArgs } from "./http.mjs";

function gitLines(cmd) {
  try {
    const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/\\/g, "/"));
  } catch {
    return [];
  }
}

const IGNORE_PREFIXES = [
  "tmp-",
  "tmp/",
  "yaarzo.com-audit/",
  "_hold_",
  ".vercel/",
  "node_modules/",
  "tmp-lh-work/",
];

function isNoise(file) {
  const n = file.replace(/\\/g, "/");
  return IGNORE_PREFIXES.some((p) => n === p.replace(/\/$/, "") || n.startsWith(p));
}

const args = parseArgs(process.argv);
const moduleArg = args.module || args.rest[0];
const moduleId = resolveModuleId(moduleArg);
const includeUntracked = !process.argv.includes("--tracked-only");

if (!moduleArg) {
  console.log("Usage: npm run check:scope -- --module homepage");
  console.log("Modules:", Object.keys(MODULES).join(", "));
  console.log("Optional: --tracked-only (ignore untracked files)");
  process.exit(0);
}
if (!moduleId) {
  console.error(`Unknown module "${moduleArg}". Known: ${Object.keys(MODULES).join(", ")}`);
  process.exit(1);
}

const files = [
  ...gitLines("git diff --name-only HEAD"),
  ...(includeUntracked ? gitLines("git ls-files --others --exclude-standard") : []),
]
  .filter((f, i, all) => all.indexOf(f) === i)
  .filter((f) => !isNoise(f));

const allowDocs = (f) =>
  f.startsWith("docs/") ||
  f.startsWith(".cursor/rules/") ||
  f.startsWith("scripts/guard/") ||
  f === "package.json";

const protectedHits = [];
const crossHits = [];
const okHits = [];
const unknownHits = [];

for (const file of files) {
  if (allowDocs(file) && moduleId !== "global_shell") {
    okHits.push({ file, note: "tooling/docs" });
    continue;
  }
  const owners = owningModules(file);
  const protectedFile = isProtectedPath(file);
  const inModule = owners.includes(moduleId);
  if (protectedFile) {
    protectedHits.push({ file, owners, inModule });
  }
  if (inModule && !protectedFile) {
    okHits.push({ file, owners });
    continue;
  }
  if (!inModule && owners.length && owners.some((o) => o !== moduleId)) {
    crossHits.push({ file, owners, protectedFile });
    continue;
  }
  if (!inModule && !owners.length && !protectedFile) {
    unknownHits.push({ file });
  }
}

console.log(`Change-scope  module=${moduleId}  files=${files.length}`);
console.log(`OK (in-module or tooling): ${okHits.length}`);

if (protectedHits.length) {
  console.log("\nPROTECTED files in this diff (must justify + cross-module smoke):");
  for (const h of protectedHits) {
    console.log(`  - ${h.file}  owners=${h.owners.join(",") || "shared"}  in-task-module=${h.inModule}`);
  }
}
if (crossHits.length) {
  console.log("\nWARN: other-module files:");
  for (const h of crossHits) {
    console.log(`  - ${h.file}  owners=${h.owners.join(",")}${h.protectedFile ? "  PROTECTED" : ""}`);
  }
}
if (unknownHits.length) {
  console.log("\nWARN: unclassified files (confirm they belong to this task):");
  for (const h of unknownHits) console.log(`  - ${h.file}`);
}

const hard =
  (args.failOnProtected && protectedHits.some((h) => !h.inModule)) ||
  (args.failOnCross && crossHits.length > 0);

if (hard) {
  console.error("\nScope check failed (--fail-on-protected / --fail-on-cross). Override by omitting those flags.");
  process.exit(1);
}

if (protectedHits.length || crossHits.length) {
  console.log("\nScope check: warnings only (not a deploy blocker). Report protected edits in the task summary.");
} else {
  console.log("\nScope check: no protected or cross-module edits detected.");
}
