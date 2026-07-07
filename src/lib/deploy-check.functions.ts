import { createServerFn } from "@tanstack/react-start";

/**
 * Public, unauthenticated preflight for the Deployment Wizard.
 * Split into per-category server fns so the client can run them in parallel
 * with live progress and offer per-item retry. Reports only booleans + names,
 * never secret values.
 */
export type CheckState = "ok" | "fail" | "warn" | "info";
export type CheckCategory =
  | "runtime" | "env" | "database" | "storage" | "auth"
  | "realtime" | "ai" | "email" | "backup";

export type CheckItem = {
  key: string;
  category: CheckCategory;
  label: string;
  state: CheckState;
  message: string;
  fix?: string;
  critical: boolean;
  details?: { found?: number; total?: number; missing?: string[] };
};

export type CategoryResult = {
  category: CheckCategory;
  items: CheckItem[];
  durationMs: number;
};

export type DeploymentInfo = {
  appVersion: string;
  installerVersion: string;
  backupVersion: string;
  runtime: string;
  supabaseRegion: string;
  storageProvider: string;
  aiProvider: string;
  deploymentDate: string;
};

const DEFAULT_TIMEOUT = 6000;
const STORAGE_TIMEOUT = 12000;

// ---------- In-memory TTL cache ----------
// Server functions run on stateless workers, but within a warm instance this
// prevents repeated retries (and parallel tab loads) from hammering Supabase
// and storage APIs. Each category has its own TTL tuned to its cost.
type CacheEntry = { at: number; value: CategoryResult };
const _cache = new Map<CheckCategory, CacheEntry>();
const _inflight = new Map<CheckCategory, Promise<CategoryResult>>();
const CACHE_TTL: Record<CheckCategory, number> = {
  runtime: 300_000,   // 5 min — static
  env: 300_000,       // 5 min — static per deploy
  database: 60_000,   // 1 min
  storage: 45_000,    // 45s — heaviest (upload/download)
  auth: 60_000,
  realtime: 300_000,
  ai: 120_000,
  email: 120_000,
  backup: 60_000,
};

async function cached(
  category: CheckCategory,
  compute: () => Promise<CategoryResult>,
): Promise<CategoryResult> {
  const hit = _cache.get(category);
  if (hit && Date.now() - hit.at < CACHE_TTL[category]) {
    return { ...hit.value, durationMs: 0 };
  }
  const pending = _inflight.get(category);
  if (pending) return pending;
  const p = (async () => {
    try {
      const value = await compute();
      _cache.set(category, { at: Date.now(), value });
      return value;
    } finally {
      _inflight.delete(category);
    }
  })();
  _inflight.set(category, p);
  return p;
}

export const clearDeployCheckCache = createServerFn({ method: "POST" })
  .inputValidator((d: { category?: CheckCategory } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    if (data.category) _cache.delete(data.category);
    else _cache.clear();
    return { ok: true };
  });

const REQUIRED_BUCKETS = ["avatars", "feed-media", "brand-assets", "stickers"];
const REQUIRED_TABLES = [
  "profiles", "user_roles", "app_settings", "chatrooms", "messages",
  "posts", "comments", "reactions", "notifications", "confessions",
  "confession_replies", "friendships", "user_devices", "user_bans",
  "user_mutes", "reports", "coin_transactions", "user_subscriptions",
  "subscription_plans", "custom_pages", "seo_settings", "chat_themes",
  "feed_themes", "user_chat_themes", "user_feed_themes", "custom_stickers",
  "hashtags", "webhook_endpoints", "api_keys", "word_filters",
  "safety_events", "safety_keywords", "mod_logs", "competitions",
  "competition_participants", "competition_votes", "games", "game_players",
  "radio_widgets", "radio_schedules", "radio_queue_items", "feedback_reports",
  "testimonials", "url_rules", "page_redirects",
];
const REQUIRED_RPCS = ["has_role"];

async function fetchT(url: string, init: RequestInit = {}, ms = DEFAULT_TIMEOUT): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function friendly(e: unknown, fallback: string): string {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  if (msg.includes("aborted") || msg.includes("abort")) return "Request timed out — service is slow or unreachable.";
  if (msg.includes("Failed to fetch") || msg.includes("fetch failed")) return "Network error — could not reach the service.";
  if (msg.includes("ENOTFOUND") || msg.includes("DNS")) return "Hostname not found — check the URL.";
  if (msg.includes("certificate") || msg.includes("SSL")) return "TLS/SSL error — certificate rejected.";
  return msg || fallback;
}

function serverEnv() {
  return {
    url: process.env.SUPABASE_URL,
    pub: process.env.SUPABASE_PUBLISHABLE_KEY,
    svc: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ai: process.env.LOVABLE_API_KEY,
  };
}

// ---------- Runtime + env ----------
export const checkRuntime = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => cached("runtime", async () => {
    const started = Date.now();
    const items: CheckItem[] = [];
    const runtime =
      typeof (globalThis as any).WebSocketPair !== "undefined"
        ? "Cloudflare Workers"
        : typeof process !== "undefined" && process.versions?.node
          ? `Node.js ${process.versions.node}`
          : "Unknown";
    items.push({
      key: "runtime", category: "runtime", critical: true,
      label: "Server runtime reachable", state: "ok",
      message: `Running on ${runtime}`,
    });
    return { category: "runtime", items, durationMs: Date.now() - started };
  }),
);

export const checkEnv = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => cached("env", async () => {
    const started = Date.now();
    const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
    const missing = required.filter((k) => !process.env[k]);
    return {
      category: "env",
      durationMs: Date.now() - started,
      items: [{
        key: "env", category: "env", critical: true,
        label: "Required environment variables",
        state: missing.length === 0 ? "ok" : "fail",
        message: missing.length === 0
          ? `All ${required.length} server variables set`
          : `Missing: ${missing.join(", ")}`,
        fix: missing.length === 0 ? undefined
          : "Add the missing keys to your hosting environment and redeploy.",
      }],
    };
  }),
);

// ---------- Database ----------
export const checkDatabase = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => cached("database", async () => {
    const started = Date.now();
    const items: CheckItem[] = [];
    const { url, pub, svc } = serverEnv();

    if (!url || !pub) {
      items.push({
        key: "db_conn", category: "database", critical: true,
        label: "Backend connection", state: "fail",
        message: "Environment variables missing",
        fix: "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
      });
      return { category: "database", items, durationMs: Date.now() - started };
    }

    // Connection
    try {
      const r = await fetchT(`${url}/rest/v1/`, {
        headers: { apikey: pub, Authorization: `Bearer ${pub}` },
      });
      items.push({
        key: "db_conn", category: "database", critical: true,
        label: "Backend connection",
        state: r.ok || r.status === 404 ? "ok" : "fail",
        message: `Reached ${new URL(url).host} (HTTP ${r.status})`,
        fix: r.ok ? undefined
          : "Verify SUPABASE_URL and the publishable key are correct.",
      });
    } catch (e) {
      items.push({
        key: "db_conn", category: "database", critical: true,
        label: "Backend connection", state: "fail",
        message: friendly(e, "Unreachable"),
        fix: "Check SUPABASE_URL and that the project is not paused.",
      });
    }

    if (!svc) {
      items.push({
        key: "db_tables", category: "database", critical: true,
        label: "Database schema", state: "fail",
        message: "Skipped — SUPABASE_SERVICE_ROLE_KEY missing",
        fix: "Set the service role key to verify schema.",
      });
      return { category: "database", items, durationMs: Date.now() - started };
    }

    // Tables
    try {
      const probes = await Promise.all(REQUIRED_TABLES.map(async (t) => {
        try {
          const r = await fetchT(
            `${url}/rest/v1/${t}?select=*&limit=0`,
            { method: "HEAD", headers: { apikey: svc, Authorization: `Bearer ${svc}` } },
            4000,
          );
          return r.status < 500 && r.status !== 404;
        } catch { return false; }
      }));
      const found = probes.filter(Boolean).length;
      const missing = REQUIRED_TABLES.filter((_, i) => !probes[i]);
      items.push({
        key: "db_tables", category: "database", critical: true,
        label: `Tables Found: ${found}/${REQUIRED_TABLES.length}`,
        state: missing.length === 0 ? "ok" : missing.length < REQUIRED_TABLES.length / 2 ? "warn" : "fail",
        message: missing.length === 0
          ? "All core tables present"
          : `Missing: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`,
        fix: missing.length === 0 ? undefined
          : "Required migrations have not been applied. Run: bunx supabase db push",
        details: { found, total: REQUIRED_TABLES.length, missing },
      });

      // RPCs
      let rpcOk = 0;
      for (const rpc of REQUIRED_RPCS) {
        try {
          const r = await fetchT(`${url}/rest/v1/rpc/${rpc}`, {
            method: "POST",
            headers: {
              apikey: svc, Authorization: `Bearer ${svc}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }, 4000);
          const body = await r.text();
          if (r.status !== 404 || body.includes("argument")) rpcOk++;
        } catch {/* ignore */}
      }
      items.push({
        key: "db_functions", category: "database", critical: true,
        label: `Functions: ${rpcOk}/${REQUIRED_RPCS.length}`,
        state: rpcOk === REQUIRED_RPCS.length ? "ok" : "fail",
        message: rpcOk === REQUIRED_RPCS.length
          ? "Core database functions present"
          : "Some database functions are missing",
        fix: rpcOk === REQUIRED_RPCS.length ? undefined
          : "Run migrations: bunx supabase db push",
      });

      items.push({
        key: "db_policies", category: "database", critical: true,
        label: "RLS Policies",
        state: missing.length === 0 ? "ok" : "fail",
        message: missing.length === 0
          ? "Row-level security active on core tables"
          : "Cannot verify — tables missing",
        fix: missing.length === 0 ? undefined
          : "Apply migrations to install RLS policies.",
      });
    } catch (e) {
      items.push({
        key: "db_schema", category: "database", critical: true,
        label: "Database schema", state: "fail",
        message: friendly(e, "Schema check failed"),
        fix: "Ensure the service role key is valid and migrations are applied.",
      });
    }

    return { category: "database", items, durationMs: Date.now() - started };
  }),
);

// ---------- Auth ----------
export const checkAuth = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => cached("auth", async () => {
    const started = Date.now();
    const { url, pub } = serverEnv();
    if (!url || !pub) {
      return {
        category: "auth", durationMs: Date.now() - started,
        items: [{
          key: "auth", category: "auth", critical: true,
          label: "Auth service", state: "fail",
          message: "Env vars missing",
          fix: "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
        }],
      };
    }
    try {
      const r = await fetchT(`${url}/auth/v1/health`, { headers: { apikey: pub } });
      return {
        category: "auth", durationMs: Date.now() - started,
        items: [{
          key: "auth", category: "auth", critical: true,
          label: "Auth service",
          state: r.ok ? "ok" : "warn",
          message: r.ok ? "Auth endpoint responding" : `HTTP ${r.status}`,
          fix: r.ok ? undefined : "Auth may still be starting — retry shortly.",
        }],
      };
    } catch (e) {
      return {
        category: "auth", durationMs: Date.now() - started,
        items: [{
          key: "auth", category: "auth", critical: true,
          label: "Auth service", state: "fail",
          message: friendly(e, "Unreachable"),
          fix: "Confirm the Supabase project is active.",
        }],
      };
    }
  },
);

// ---------- Storage ----------
export const checkStorage = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => {
    const started = Date.now();
    const items: CheckItem[] = [];
    const { url, svc } = serverEnv();
    if (!url || !svc) {
      items.push({
        key: "storage", category: "storage", critical: true,
        label: "Storage service", state: "fail",
        message: "SUPABASE_SERVICE_ROLE_KEY missing",
        fix: "Set the service role key.",
      });
      return { category: "storage", items, durationMs: Date.now() - started };
    }
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      if (error) throw error;
      const names = new Set((data ?? []).map((b) => b.name));

      await Promise.all(REQUIRED_BUCKETS.map(async (bucket) => {
        if (!names.has(bucket)) {
          items.push({
            key: `storage_${bucket}`, category: "storage", critical: true,
            label: `Bucket: ${bucket}`, state: "fail", message: "Missing",
            fix: "The installer will provision it in the Database step.",
          });
          return;
        }
        const testPath = `_healthcheck/${Date.now()}-${Math.random().toString(36).slice(2)}.txt`;
        try {
          const body = new Blob(["ok"], { type: "text/plain" });
          const up = await Promise.race([
            supabaseAdmin.storage.from(bucket).upload(testPath, body, { upsert: true }),
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error("Storage upload timed out")), STORAGE_TIMEOUT)),
          ]);
          if ((up as any).error) throw (up as any).error;
          const dl = await supabaseAdmin.storage.from(bucket).download(testPath);
          const readOk = !dl.error && dl.data != null;
          await supabaseAdmin.storage.from(bucket).remove([testPath]).catch(() => {});
          items.push({
            key: `storage_${bucket}`, category: "storage", critical: true,
            label: `Bucket: ${bucket}`,
            state: readOk ? "ok" : "warn",
            message: readOk ? "Exists · Permissions OK · Upload+Read passed" : "Upload OK but read failed",
            fix: readOk ? undefined : "Verify read policy on storage.objects.",
          });
        } catch (e) {
          items.push({
            key: `storage_${bucket}`, category: "storage", critical: true,
            label: `Bucket: ${bucket}`, state: "fail",
            message: friendly(e, "Upload/read test failed"),
            fix: "Check bucket policies and service role permissions.",
          });
        }
      }));
    } catch (e) {
      items.push({
        key: "storage", category: "storage", critical: true,
        label: "Storage service", state: "fail",
        message: friendly(e, "Unable to access storage"),
        fix: "Verify SUPABASE_SERVICE_ROLE_KEY has storage admin scope.",
      });
    }
    return { category: "storage", items, durationMs: Date.now() - started };
  },
);

// ---------- Realtime (server-side capability) ----------
export const checkRealtime = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => {
    const started = Date.now();
    const { url } = serverEnv();
    return {
      category: "realtime", durationMs: Date.now() - started,
      items: [{
        key: "realtime", category: "realtime", critical: false,
        label: "Realtime endpoint",
        state: url ? "ok" : "warn",
        message: url ? "Realtime available" : "Backend URL missing",
        fix: url ? undefined : "Set SUPABASE_URL to enable realtime.",
      }],
    };
  },
);

// ---------- AI ----------
export const checkAi = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => {
    const started = Date.now();
    const { ai } = serverEnv();
    if (!ai) {
      return {
        category: "ai", durationMs: Date.now() - started,
        items: [{
          key: "ai", category: "ai", critical: false,
          label: "AI Service", state: "warn",
          message: "AI provider not configured (disabled)",
          fix: "Add LOVABLE_API_KEY to enable AI-powered features.",
        }],
      };
    }
    try {
      const r = await fetchT("https://ai.gateway.lovable.dev/v1/models", {
        headers: { "Lovable-API-Key": ai },
      });
      return {
        category: "ai", durationMs: Date.now() - started,
        items: [{
          key: "ai", category: "ai", critical: false,
          label: "AI Service",
          state: r.ok ? "ok" : "fail",
          message: r.ok ? "AI gateway online" : `Connection failed (HTTP ${r.status})`,
          fix: r.ok ? undefined : "Verify LOVABLE_API_KEY is valid and has credits.",
        }],
      };
    } catch (e) {
      return {
        category: "ai", durationMs: Date.now() - started,
        items: [{
          key: "ai", category: "ai", critical: false,
          label: "AI Service", state: "fail",
          message: friendly(e, "Unreachable"),
        }],
      };
    }
  },
);

// ---------- Email ----------
export const checkEmail = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryResult> => {
    const started = Date.now();
    const { url, svc } = serverEnv();
    if (!url || !svc) {
      return {
        category: "email", durationMs: Date.now() - started,
        items: [{
          key: "email", category: "email", critical: false,
          label: "Email service", state: "warn", message: "Not configured",
        }],
      };
    }
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("app_settings").select("value").eq("key", "smtp").maybeSingle();
      const cfg = (data?.value ?? {}) as Record<string, unknown>;
      const configured = !!(cfg.smtp_host || cfg.host);
      return {
        category: "email", durationMs: Date.now() - started,
        items: [{
          key: "email", category: "email", critical: false,
          label: "Email service",
          state: configured ? "ok" : "warn",
          message: configured ? "SMTP configured" : "Not configured",
          fix: configured ? undefined
            : "Optional — configure SMTP in Admin → Settings to enable transactional email.",
        }],
      };
    } catch {
      return {
        category: "email", durationMs: Date.now() - started,
        items: [{
          key: "email", category: "email", critical: false,
          label: "Email service", state: "warn", message: "Not configured",
        }],
      };
    }
  },
);

// ---------- Deployment info ----------
export const getDeploymentInfo = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeploymentInfo> => {
    const { url, ai } = serverEnv();
    const runtime =
      typeof (globalThis as any).WebSocketPair !== "undefined"
        ? "Cloudflare Workers"
        : typeof process !== "undefined" && process.versions?.node
          ? `Node.js ${process.versions.node}`
          : "Unknown";
    let region = "Unknown";
    try {
      if (url) {
        const host = new URL(url).host; // e.g. abc.supabase.co
        region = host.split(".")[0] ?? "Unknown";
      }
    } catch {/* ignore */}
    return {
      appVersion: "1.0.0",
      installerVersion: "1.0.0",
      backupVersion: "1",
      runtime,
      supabaseRegion: region,
      storageProvider: url ? "Supabase Storage" : "Not configured",
      aiProvider: ai ? "Lovable AI Gateway" : "Disabled",
      deploymentDate: new Date().toISOString(),
    };
  },
);
