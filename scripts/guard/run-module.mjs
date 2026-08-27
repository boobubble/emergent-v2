#!/usr/bin/env node
import { spawn } from "node:child_process";
import { resolveModuleId, testsForModule, MODULES, MODULE_GOLDEN, PRODUCTION_ORIGIN } from "./config.mjs";
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
const raw = args.module || args.rest[0] || "all";
const moduleId = raw === "all" ? "all" : resolveModuleId(raw);
if (raw !== "all" && !moduleId) {
  console.error(`Unknown module "${raw}". Known: ${Object.keys(MODULES).join(", ")}, all`);
  process.exit(1);
}

const tests = testsForModule(moduleId);
console.log(`Guard tests  module=${moduleId}\n  ${tests.join("\n  ")}`);
await run("npx", ["vitest", "run", ...tests]);

const httpBase = args.skipHttp || args.offline ? "" : args.base || PRODUCTION_ORIGIN;
if (httpBase && MODULE_GOLDEN[moduleId]) {
  console.log(`\nGolden subset against ${httpBase}`);
  await run("node", [
    "scripts/guard/golden-routes.mjs",
    "--base",
    httpBase,
    "--module",
    moduleId === "all" ? "all" : moduleId,
  ]);
} else {
  console.log("\nGolden HTTP subset skipped (--skip-http/--offline).");
}

console.log(`\nModule guard ${moduleId} passed.`);
