#!/usr/bin/env node
import {
  BASELINE,
  GOLDEN_ALL,
  GOLDEN_NEGATIVE,
  KNOWN_REDIRECTS,
  MODULE_GOLDEN,
  PRODUCTION_ORIGIN,
  resolveModuleId,
} from "./config.mjs";
import { addCount, emptyCounts, parseArgs, probe } from "./http.mjs";

const args = parseArgs(process.argv);
const base = args.base || PRODUCTION_ORIGIN;
const moduleId = args.module ? resolveModuleId(args.module) : null;
const paths = moduleId && MODULE_GOLDEN[moduleId] ? MODULE_GOLDEN[moduleId] : GOLDEN_ALL;
const negatives =
  moduleId && moduleId !== "all"
    ? GOLDEN_NEGATIVE.filter((n) => paths.includes(n.path) || n.path.startsWith("/__"))
    : GOLDEN_NEGATIVE;

console.log(`Golden routes  base=${base}  module=${moduleId || "all"}  baseline=${BASELINE.commit}`);

const counts = emptyCounts();
const failures = [];

async function checkExpected200(path) {
  const known = KNOWN_REDIRECTS[path];
  const row = await probe(base, path, { follow: false });
  addCount(counts, row.status);
  if (known) {
    const locOk = !known.location || (row.location || "").replace(/\/$/, "") === known.location.replace(/\/$/, "") || row.location === known.location;
    const ok = row.status === known.status && locOk;
    console.log(`${ok ? "OK " : "FAIL"} ${row.status} ${path} (known redirect → ${known.location})`);
    if (!ok) failures.push({ ...row, expected: known });
    return;
  }
  const ok = row.status === 200;
  console.log(`${ok ? "OK " : "FAIL"} ${row.status} ${path}${row.title ? `  ${row.title}` : ""}`);
  if (row.status >= 500) failures.push({ ...row, expected: 200, hard: "5xx" });
  else if (!ok) failures.push({ ...row, expected: 200 });
}

async function checkNegative({ path, status }) {
  const row = await probe(base, path, { follow: false });
  addCount(counts, row.status);
  const ok = row.status === status && row.status < 500;
  console.log(`${ok ? "OK " : "FAIL"} ${row.status} ${path} (expected ${status})`);
  if (row.status >= 500) failures.push({ ...row, expected: status, hard: "5xx" });
  else if (!ok) failures.push({ ...row, expected: status });
}

const uniquePaths = [...new Set(paths.filter((p) => !p.includes("__yaarzo-nonexistent")))];
for (const path of uniquePaths) {
  await checkExpected200(path);
}
for (const neg of negatives) {
  await checkNegative(neg);
}

console.log("COUNTS", JSON.stringify(counts));
if (counts["5xx"] > 0) {
  console.error("HARD FAIL: golden route returned 5xx (blocks deployment).");
}
if (failures.length) {
  console.error("FAILURES", JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log("Golden route smoke passed.");
