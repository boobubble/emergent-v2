import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DELETED_REF = "zemkntcobnppphxiptkn";
const root = process.cwd();

function loadEnv() {
  const out = {};
  for (const file of [".env.local", ".env", ".env.production"]) {
    const envPath = join(root, file);
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  return out;
}

function refFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

function refFromJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload.ref || payload.project_ref || null;
  } catch {
    return null;
  }
}

const env = { ...loadEnv(), ...process.env };
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const anon = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const urlRef = refFromUrl(url);
const anonRef = refFromJwt(anon);
const serviceRef = refFromJwt(service);

const report = {
  deletedProjectRef: DELETED_REF,
  activeProjectRef: urlRef,
  envFilesRead: [".env.local", ".env", ".env.production"].filter((f) => existsSync(join(root, f))),
  staleDeletedRefInEnv: urlRef === DELETED_REF,
  keyProjectAlignment: {
    urlRef,
    anonRef,
    serviceRef,
    aligned: Boolean(urlRef && urlRef === anonRef && urlRef === serviceRef),
  },
  connectivity: null,
  schema: null,
  seoMigrationColumns: null,
};

if (urlRef === DELETED_REF) {
  console.log(JSON.stringify({ ...report, error: "Active URL points at deleted project — aborting." }, null, 2));
  process.exit(1);
}

async function probe() {
  if (!url || !service) {
    report.connectivity = { ok: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" };
    return;
  }
  const health = await fetch(`${url}/rest/v1/`, { headers: { apikey: service, Authorization: `Bearer ${service}` } });
  report.connectivity = { ok: health.status < 500, status: health.status, projectRef: urlRef };

  const tables = ["seo_settings", "seo_global", "profiles", "app_settings", "custom_pages"];
  const tableChecks = {};
  for (const table of tables) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=0`, {
      headers: { apikey: service, Authorization: `Bearer ${service}`, Prefer: "count=exact" },
    });
    const range = res.headers.get("content-range") || "";
    const count = range.includes("/") ? range.split("/")[1] : null;
    tableChecks[table] = { ok: res.status !== 404, status: res.status, count };
  }
  report.schema = { tables: tableChecks };

  const cols = ["json_ld_type", "route_type", "template_variables"];
  const colRes = await fetch(`${url}/rest/v1/seo_settings?select=${encodeURIComponent(cols.join(","))}&limit=1`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` },
  });
  const colBody = await colRes.text();
  report.seoMigrationColumns = {
    present: colRes.ok,
    status: colRes.status,
    message: colRes.ok ? "all three columns accessible" : colBody.slice(0, 200),
  };

  const sampleRes = await fetch(`${url}/rest/v1/seo_settings?select=page_key,route_path,enabled&limit=3`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` },
  });
  report.seoSettingsSampleCount = sampleRes.ok ? (await sampleRes.json()).length : 0;
}

await probe();
console.log(JSON.stringify(report, null, 2));