#!/usr/bin/env node
import { spawn } from "node:child_process";
import { BASELINE, PRODUCTION_ORIGIN, testsForModule } from "./config.mjs";
import { parseArgs } from "./http.mjs";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true, cwd: process.cwd() });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`));
    });
  });
}

const args = parseArgs(process.argv);
const httpBase = args.skipHttp || args.offline ? "" : args.base || PRODUCTION_ORIGIN;
const tests = testsForModule("all");

console.log(`Predeploy gate  baseline=${BASELINE.commit}`);
console.log("1/4 focused regression tests");
await run("npx", ["vitest", "run", ...tests]);

if (args.skipBuild) {
  console.warn("2/4 production build SKIPPED (--skip-build). Deployment is NOT considered safe.");
} else {
  console.log("2/4 production build");
  await run("npm", ["run", "build"]);
}

if (!httpBase) {
  console.warn("3/4 golden routes SKIPPED (--skip-http/--offline).");
  console.warn("4/4 sitemap gate SKIPPED.");
  console.warn("Re-run with --live or --base <origin> before calling a deploy safe.");
  process.exit(0);
}

console.log(`3/4 golden routes  ${httpBase}`);
await run("node", ["scripts/guard/golden-routes.mjs", "--base", httpBase]);

console.log(`4/4 sitemap gate  ${httpBase}`);
await run("node", ["scripts/guard/sitemap-gate.mjs", "--base", httpBase]);

console.log("Predeploy gate passed. Safe to consider deploy if git matches the tested tree.");
