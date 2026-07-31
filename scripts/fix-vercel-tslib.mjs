import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const functionsRoot = path.join(root, ".vercel", "output", "functions");
const tslibSource = path.join(root, "node_modules", "tslib");

const TSLIB_IMPORT_RE =
  /(?:from\s+["']tslib["']|import\s*["']tslib["']|import\s*\(\s*["']tslib["']\s*\))/;

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findFuncDirs(dir) {
  const results = [];
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.name.endsWith(".func")) {
      results.push(fullPath);
      continue;
    }

    results.push(...(await findFuncDirs(fullPath)));
  }

  return results;
}

async function packageJsonReferencesTslib(funcDir) {
  const pkgPath = path.join(funcDir, "package.json");
  if (!(await exists(pkgPath))) return false;

  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    const deps = {
      ...pkg.dependencies,
      ...pkg.optionalDependencies,
      ...pkg.peerDependencies,
    };
    return Object.prototype.hasOwnProperty.call(deps, "tslib");
  } catch {
    return false;
  }
}

async function collectJsFiles(dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      results.push(...(await collectJsFiles(fullPath)));
      continue;
    }

    if (/\.(?:mjs|cjs|js)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

async function jsOutputImportsTslib(funcDir) {
  const files = await collectJsFiles(funcDir);

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    if (TSLIB_IMPORT_RE.test(content)) return true;
  }

  return false;
}

async function needsTslib(funcDir) {
  if (await packageJsonReferencesTslib(funcDir)) return true;
  return jsOutputImportsTslib(funcDir);
}

async function main() {
  if (!(await exists(functionsRoot))) {
    console.log("[fix-vercel-tslib] .vercel/output/functions not found; skipping.");
    return;
  }

  const funcDirs = await findFuncDirs(functionsRoot);
  const needingTslib = [];

  for (const funcDir of funcDirs) {
    if (await needsTslib(funcDir)) needingTslib.push(funcDir);
  }

  if (needingTslib.length === 0) {
    console.log("[fix-vercel-tslib] No function directories require tslib.");
    return;
  }

  if (!(await exists(tslibSource))) {
    console.error(
      "[fix-vercel-tslib] ERROR: Vercel function output requires tslib, but source package is missing:",
      tslibSource,
    );
    process.exit(1);
  }

  const fixed = [];

  for (const funcDir of needingTslib) {
    const dest = path.join(funcDir, "node_modules", "tslib");
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.cp(tslibSource, dest, { recursive: true });
    fixed.push(funcDir);
  }

  console.log("[fix-vercel-tslib] Copied node_modules/tslib into:");
  for (const funcDir of fixed) {
    console.log(`  - ${path.relative(root, funcDir)}`);
  }
}

main().catch((error) => {
  console.error("[fix-vercel-tslib] ERROR:", error);
  process.exit(1);
});
