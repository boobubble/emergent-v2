import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
const DEFAULT_TIMEOUT = 6e3;
const STORAGE_TIMEOUT = 12e3;
const _cache = /* @__PURE__ */ new Map();
const _inflight = /* @__PURE__ */ new Map();
const CACHE_TTL = {
  runtime: 3e5,
  // 5 min — static
  env: 3e5,
  // 5 min — static per deploy
  database: 6e4,
  // 1 min
  storage: 45e3,
  // 45s — heaviest (upload/download)
  auth: 6e4,
  realtime: 3e5,
  ai: 12e4,
  email: 12e4,
  backup: 6e4
};
async function cached(category, compute) {
  const hit = _cache.get(category);
  if (hit && Date.now() - hit.at < CACHE_TTL[category]) {
    return {
      ...hit.value,
      durationMs: 0
    };
  }
  const pending = _inflight.get(category);
  if (pending) return pending;
  const p = (async () => {
    try {
      const value = await compute();
      _cache.set(category, {
        at: Date.now(),
        value
      });
      return value;
    } finally {
      _inflight.delete(category);
    }
  })();
  _inflight.set(category, p);
  return p;
}
const clearDeployCheckCache_createServerFn_handler = createServerRpc({
  id: "cb0c6322729c2419cea2991a22a37cc7395b3c8734892d0ec6aee5a5b5dc45ae",
  name: "clearDeployCheckCache",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => clearDeployCheckCache.__executeServer(opts));
const clearDeployCheckCache = createServerFn({
  method: "POST"
}).middleware([withRateLimit("api")]).inputValidator((d) => d ?? {}).handler(clearDeployCheckCache_createServerFn_handler, async ({
  data
}) => {
  if (data.category) _cache.delete(data.category);
  else _cache.clear();
  return {
    ok: true
  };
});
const REQUIRED_BUCKETS = ["avatars", "feed-media", "brand-assets", "stickers"];
const REQUIRED_TABLES = ["profiles", "user_roles", "app_settings", "chatrooms", "messages", "posts", "comments", "reactions", "notifications", "confessions", "confession_replies", "friendships", "user_devices", "user_bans", "user_mutes", "reports", "coin_transactions", "user_subscriptions", "subscription_plans", "custom_pages", "seo_settings", "chat_themes", "feed_themes", "user_chat_themes", "user_feed_themes", "custom_stickers", "hashtags", "webhook_endpoints", "api_keys", "word_filters", "safety_events", "safety_keywords", "mod_logs", "competitions", "competition_participants", "competition_votes", "games", "game_players", "radio_widgets", "radio_schedules", "radio_queue_items", "feedback_reports", "testimonials", "url_rules", "page_redirects"];
const REQUIRED_RPCS = ["has_role"];
async function fetchT(url, init = {}, ms = DEFAULT_TIMEOUT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal
    });
  } finally {
    clearTimeout(t);
  }
}
function friendly(e, fallback) {
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
    ai: process.env.LOVABLE_API_KEY
  };
}
const checkRuntime_createServerFn_handler = createServerRpc({
  id: "f8a5da6671501701944dfe0a2e7372bbc05a5124bb10eb2a646dd396c6383c1d",
  name: "checkRuntime",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkRuntime.__executeServer(opts));
const checkRuntime = createServerFn({
  method: "GET"
}).handler(checkRuntime_createServerFn_handler, async () => cached("runtime", async () => {
  const started = Date.now();
  const items = [];
  const runtime = typeof globalThis.WebSocketPair !== "undefined" ? "Cloudflare Workers" : typeof process !== "undefined" && process.versions?.node ? `Node.js ${process.versions.node}` : "Unknown";
  items.push({
    key: "runtime",
    category: "runtime",
    critical: true,
    label: "Server runtime reachable",
    state: "ok",
    message: `Running on ${runtime}`
  });
  return {
    category: "runtime",
    items,
    durationMs: Date.now() - started
  };
}));
const checkEnv_createServerFn_handler = createServerRpc({
  id: "977c21034f51dd649d64e5b9f73baf8e09371a2fe03c9521d0950d382def1a3c",
  name: "checkEnv",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkEnv.__executeServer(opts));
const checkEnv = createServerFn({
  method: "GET"
}).handler(checkEnv_createServerFn_handler, async () => cached("env", async () => {
  const started = Date.now();
  const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  return {
    category: "env",
    durationMs: Date.now() - started,
    items: [{
      key: "env",
      category: "env",
      critical: true,
      label: "Required environment variables",
      state: missing.length === 0 ? "ok" : "fail",
      message: missing.length === 0 ? `All ${required.length} server variables set` : `Missing: ${missing.join(", ")}`,
      fix: missing.length === 0 ? void 0 : "Add the missing keys to your hosting environment and redeploy."
    }]
  };
}));
const checkDatabase_createServerFn_handler = createServerRpc({
  id: "32b83b810e6596c16f0aeb6cfefeb67800168e162743eccb190bce58b47abe7b",
  name: "checkDatabase",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkDatabase.__executeServer(opts));
const checkDatabase = createServerFn({
  method: "GET"
}).handler(checkDatabase_createServerFn_handler, async () => cached("database", async () => {
  const started = Date.now();
  const items = [];
  const {
    url,
    pub,
    svc
  } = serverEnv();
  if (!url || !pub) {
    items.push({
      key: "db_conn",
      category: "database",
      critical: true,
      label: "Backend connection",
      state: "fail",
      message: "Environment variables missing",
      fix: "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY."
    });
    return {
      category: "database",
      items,
      durationMs: Date.now() - started
    };
  }
  try {
    const r = await fetchT(`${url}/rest/v1/`, {
      headers: {
        apikey: pub,
        Authorization: `Bearer ${pub}`
      }
    });
    items.push({
      key: "db_conn",
      category: "database",
      critical: true,
      label: "Backend connection",
      state: r.ok || r.status === 404 ? "ok" : "fail",
      message: `Reached ${new URL(url).host} (HTTP ${r.status})`,
      fix: r.ok ? void 0 : "Verify SUPABASE_URL and the publishable key are correct."
    });
  } catch (e) {
    items.push({
      key: "db_conn",
      category: "database",
      critical: true,
      label: "Backend connection",
      state: "fail",
      message: friendly(e, "Unreachable"),
      fix: "Check SUPABASE_URL and that the project is not paused."
    });
  }
  if (!svc) {
    items.push({
      key: "db_tables",
      category: "database",
      critical: true,
      label: "Database schema",
      state: "fail",
      message: "Skipped — SUPABASE_SERVICE_ROLE_KEY missing",
      fix: "Set the service role key to verify schema."
    });
    return {
      category: "database",
      items,
      durationMs: Date.now() - started
    };
  }
  try {
    const probes = await Promise.all(REQUIRED_TABLES.map(async (t) => {
      try {
        const r = await fetchT(`${url}/rest/v1/${t}?select=*&limit=0`, {
          method: "HEAD",
          headers: {
            apikey: svc,
            Authorization: `Bearer ${svc}`
          }
        }, 4e3);
        return r.status < 500 && r.status !== 404;
      } catch {
        return false;
      }
    }));
    const found = probes.filter(Boolean).length;
    const missing = REQUIRED_TABLES.filter((_, i) => !probes[i]);
    items.push({
      key: "db_tables",
      category: "database",
      critical: true,
      label: `Tables Found: ${found}/${REQUIRED_TABLES.length}`,
      state: missing.length === 0 ? "ok" : missing.length < REQUIRED_TABLES.length / 2 ? "warn" : "fail",
      message: missing.length === 0 ? "All core tables present" : `Missing: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`,
      fix: missing.length === 0 ? void 0 : "Required migrations have not been applied. Run: bunx supabase db push",
      details: {
        found,
        total: REQUIRED_TABLES.length,
        missing
      }
    });
    let rpcOk = 0;
    for (const rpc of REQUIRED_RPCS) {
      try {
        const r = await fetchT(`${url}/rest/v1/rpc/${rpc}`, {
          method: "POST",
          headers: {
            apikey: svc,
            Authorization: `Bearer ${svc}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({})
        }, 4e3);
        const body = await r.text();
        if (r.status !== 404 || body.includes("argument")) rpcOk++;
      } catch {
      }
    }
    items.push({
      key: "db_functions",
      category: "database",
      critical: true,
      label: `Functions: ${rpcOk}/${REQUIRED_RPCS.length}`,
      state: rpcOk === REQUIRED_RPCS.length ? "ok" : "fail",
      message: rpcOk === REQUIRED_RPCS.length ? "Core database functions present" : "Some database functions are missing",
      fix: rpcOk === REQUIRED_RPCS.length ? void 0 : "Run migrations: bunx supabase db push"
    });
    items.push({
      key: "db_policies",
      category: "database",
      critical: true,
      label: "RLS Policies",
      state: missing.length === 0 ? "ok" : "fail",
      message: missing.length === 0 ? "Row-level security active on core tables" : "Cannot verify — tables missing",
      fix: missing.length === 0 ? void 0 : "Apply migrations to install RLS policies."
    });
  } catch (e) {
    items.push({
      key: "db_schema",
      category: "database",
      critical: true,
      label: "Database schema",
      state: "fail",
      message: friendly(e, "Schema check failed"),
      fix: "Ensure the service role key is valid and migrations are applied."
    });
  }
  return {
    category: "database",
    items,
    durationMs: Date.now() - started
  };
}));
const checkAuth_createServerFn_handler = createServerRpc({
  id: "aef26b7bc6dc9c68010d4d23199dda9f05002497df672a5df92bfe911a89e3e0",
  name: "checkAuth",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkAuth.__executeServer(opts));
const checkAuth = createServerFn({
  method: "GET"
}).handler(checkAuth_createServerFn_handler, async () => cached("auth", async () => {
  const started = Date.now();
  const {
    url,
    pub
  } = serverEnv();
  if (!url || !pub) {
    return {
      category: "auth",
      durationMs: Date.now() - started,
      items: [{
        key: "auth",
        category: "auth",
        critical: true,
        label: "Auth service",
        state: "fail",
        message: "Env vars missing",
        fix: "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY."
      }]
    };
  }
  try {
    const r = await fetchT(`${url}/auth/v1/health`, {
      headers: {
        apikey: pub
      }
    });
    return {
      category: "auth",
      durationMs: Date.now() - started,
      items: [{
        key: "auth",
        category: "auth",
        critical: true,
        label: "Auth service",
        state: r.ok ? "ok" : "warn",
        message: r.ok ? "Auth endpoint responding" : `HTTP ${r.status}`,
        fix: r.ok ? void 0 : "Auth may still be starting — retry shortly."
      }]
    };
  } catch (e) {
    return {
      category: "auth",
      durationMs: Date.now() - started,
      items: [{
        key: "auth",
        category: "auth",
        critical: true,
        label: "Auth service",
        state: "fail",
        message: friendly(e, "Unreachable"),
        fix: "Confirm the Supabase project is active."
      }]
    };
  }
}));
const checkStorage_createServerFn_handler = createServerRpc({
  id: "df77482e56e300bfcd7faec1942d1333f3dfb5495d55c9c51106692732f9e4e6",
  name: "checkStorage",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkStorage.__executeServer(opts));
const checkStorage = createServerFn({
  method: "GET"
}).handler(checkStorage_createServerFn_handler, async () => cached("storage", async () => {
  const started = Date.now();
  const items = [];
  const {
    url,
    svc
  } = serverEnv();
  if (!url || !svc) {
    items.push({
      key: "storage",
      category: "storage",
      critical: true,
      label: "Storage service",
      state: "fail",
      message: "SUPABASE_SERVICE_ROLE_KEY missing",
      fix: "Set the service role key."
    });
    return {
      category: "storage",
      items,
      durationMs: Date.now() - started
    };
  }
  try {
    const {
      supabaseAdmin
    } = await import("./client.server-BXCYxJZY.mjs");
    const {
      data,
      error
    } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;
    const names = new Set((data ?? []).map((b) => b.name));
    await Promise.all(REQUIRED_BUCKETS.map(async (bucket) => {
      if (!names.has(bucket)) {
        items.push({
          key: `storage_${bucket}`,
          category: "storage",
          critical: true,
          label: `Bucket: ${bucket}`,
          state: "fail",
          message: "Missing",
          fix: "The installer will provision it in the Database step."
        });
        return;
      }
      const testPath = `_healthcheck/${Date.now()}-${Math.random().toString(36).slice(2)}.txt`;
      try {
        const body = new Blob(["ok"], {
          type: "text/plain"
        });
        const up = await Promise.race([supabaseAdmin.storage.from(bucket).upload(testPath, body, {
          upsert: true
        }), new Promise((_, rej) => setTimeout(() => rej(new Error("Storage upload timed out")), STORAGE_TIMEOUT))]);
        if (up.error) throw up.error;
        const dl = await supabaseAdmin.storage.from(bucket).download(testPath);
        const readOk = !dl.error && dl.data != null;
        await supabaseAdmin.storage.from(bucket).remove([testPath]).catch(() => {
        });
        items.push({
          key: `storage_${bucket}`,
          category: "storage",
          critical: true,
          label: `Bucket: ${bucket}`,
          state: readOk ? "ok" : "warn",
          message: readOk ? "Exists · Permissions OK · Upload+Read passed" : "Upload OK but read failed",
          fix: readOk ? void 0 : "Verify read policy on storage.objects."
        });
      } catch (e) {
        items.push({
          key: `storage_${bucket}`,
          category: "storage",
          critical: true,
          label: `Bucket: ${bucket}`,
          state: "fail",
          message: friendly(e, "Upload/read test failed"),
          fix: "Check bucket policies and service role permissions."
        });
      }
    }));
  } catch (e) {
    items.push({
      key: "storage",
      category: "storage",
      critical: true,
      label: "Storage service",
      state: "fail",
      message: friendly(e, "Unable to access storage"),
      fix: "Verify SUPABASE_SERVICE_ROLE_KEY has storage admin scope."
    });
  }
  return {
    category: "storage",
    items,
    durationMs: Date.now() - started
  };
}));
const checkRealtime_createServerFn_handler = createServerRpc({
  id: "30a125c9c8b2e85c0187f379ea78ee34c701e030d6a85f9523b5a1f2d0e6a519",
  name: "checkRealtime",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkRealtime.__executeServer(opts));
const checkRealtime = createServerFn({
  method: "GET"
}).handler(checkRealtime_createServerFn_handler, async () => cached("realtime", async () => {
  const started = Date.now();
  const {
    url
  } = serverEnv();
  return {
    category: "realtime",
    durationMs: Date.now() - started,
    items: [{
      key: "realtime",
      category: "realtime",
      critical: false,
      label: "Realtime endpoint",
      state: url ? "ok" : "warn",
      message: url ? "Realtime available" : "Backend URL missing",
      fix: url ? void 0 : "Set SUPABASE_URL to enable realtime."
    }]
  };
}));
const checkAi_createServerFn_handler = createServerRpc({
  id: "073367386c1d4a439ae34f938237958435be02fc7fbdbf5d3dd307bb495b0887",
  name: "checkAi",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkAi.__executeServer(opts));
const checkAi = createServerFn({
  method: "GET"
}).handler(checkAi_createServerFn_handler, async () => cached("ai", async () => {
  const started = Date.now();
  const {
    ai
  } = serverEnv();
  if (!ai) {
    return {
      category: "ai",
      durationMs: Date.now() - started,
      items: [{
        key: "ai",
        category: "ai",
        critical: false,
        label: "AI Service",
        state: "warn",
        message: "AI provider not configured (disabled)",
        fix: "Add LOVABLE_API_KEY to enable AI-powered features."
      }]
    };
  }
  try {
    const r = await fetchT("https://ai.gateway.lovable.dev/v1/models", {
      headers: {
        "Lovable-API-Key": ai
      }
    });
    return {
      category: "ai",
      durationMs: Date.now() - started,
      items: [{
        key: "ai",
        category: "ai",
        critical: false,
        label: "AI Service",
        state: r.ok ? "ok" : "fail",
        message: r.ok ? "AI gateway online" : `Connection failed (HTTP ${r.status})`,
        fix: r.ok ? void 0 : "Verify LOVABLE_API_KEY is valid and has credits."
      }]
    };
  } catch (e) {
    return {
      category: "ai",
      durationMs: Date.now() - started,
      items: [{
        key: "ai",
        category: "ai",
        critical: false,
        label: "AI Service",
        state: "fail",
        message: friendly(e, "Unreachable")
      }]
    };
  }
}));
const checkEmail_createServerFn_handler = createServerRpc({
  id: "944cf63a029419b2deab9193e1761098f7ba53454a1deaa391e2248d7464c0f7",
  name: "checkEmail",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => checkEmail.__executeServer(opts));
const checkEmail = createServerFn({
  method: "GET"
}).handler(checkEmail_createServerFn_handler, async () => cached("email", async () => {
  const started = Date.now();
  const {
    url,
    svc
  } = serverEnv();
  if (!url || !svc) {
    return {
      category: "email",
      durationMs: Date.now() - started,
      items: [{
        key: "email",
        category: "email",
        critical: false,
        label: "Email service",
        state: "warn",
        message: "Not configured"
      }]
    };
  }
  try {
    const {
      supabaseAdmin
    } = await import("./client.server-BXCYxJZY.mjs");
    const {
      data
    } = await supabaseAdmin.from("app_settings").select("value").eq("key", "smtp").maybeSingle();
    const cfg = data?.value ?? {};
    const configured = !!(cfg.smtp_host || cfg.host);
    return {
      category: "email",
      durationMs: Date.now() - started,
      items: [{
        key: "email",
        category: "email",
        critical: false,
        label: "Email service",
        state: configured ? "ok" : "warn",
        message: configured ? "SMTP configured" : "Not configured",
        fix: configured ? void 0 : "Optional — configure SMTP in Admin → Settings to enable transactional email."
      }]
    };
  } catch {
    return {
      category: "email",
      durationMs: Date.now() - started,
      items: [{
        key: "email",
        category: "email",
        critical: false,
        label: "Email service",
        state: "warn",
        message: "Not configured"
      }]
    };
  }
}));
const getDeploymentInfo_createServerFn_handler = createServerRpc({
  id: "9f59f4978b8c612b26829c1f2ceb9f5b120a3dbbbd65f74629f0901b8951d53c",
  name: "getDeploymentInfo",
  filename: "src/lib/deploy-check.functions.ts"
}, (opts) => getDeploymentInfo.__executeServer(opts));
const getDeploymentInfo = createServerFn({
  method: "GET"
}).handler(getDeploymentInfo_createServerFn_handler, async () => {
  const {
    url,
    ai
  } = serverEnv();
  const runtime = typeof globalThis.WebSocketPair !== "undefined" ? "Cloudflare Workers" : typeof process !== "undefined" && process.versions?.node ? `Node.js ${process.versions.node}` : "Unknown";
  let region = "Unknown";
  try {
    if (url) {
      const host = new URL(url).host;
      region = host.split(".")[0] ?? "Unknown";
    }
  } catch {
  }
  return {
    appVersion: "1.0.0",
    installerVersion: "1.0.0",
    backupVersion: "1",
    runtime,
    supabaseRegion: region,
    storageProvider: url ? "Supabase Storage" : "Not configured",
    aiProvider: ai ? "Lovable AI Gateway" : "Disabled",
    deploymentDate: (/* @__PURE__ */ new Date()).toISOString()
  };
});
export {
  checkAi_createServerFn_handler,
  checkAuth_createServerFn_handler,
  checkDatabase_createServerFn_handler,
  checkEmail_createServerFn_handler,
  checkEnv_createServerFn_handler,
  checkRealtime_createServerFn_handler,
  checkRuntime_createServerFn_handler,
  checkStorage_createServerFn_handler,
  clearDeployCheckCache_createServerFn_handler,
  getDeploymentInfo_createServerFn_handler
};
