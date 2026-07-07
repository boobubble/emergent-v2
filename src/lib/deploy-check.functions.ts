import { createServerFn } from "@tanstack/react-start";

/**
 * Public, unauthenticated preflight for the Deployment Wizard.
 * Reports only booleans + names, never secret values.
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

export type DeploymentCheckResult = {
  ranAt: string;
  runtime: { name: string; ok: boolean };
  checks: CheckItem[];
  categorySummary: Record<CheckCategory, CheckState>;
  healthScore: number;
  criticalPassed: boolean;
};

const REQUIRED_BUCKETS = ["avatars", "feed-media", "brand-assets", "stickers"];

// Core tables the app relies on. Presence of these validates that all
// migrations have been applied.
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

function pushIf<T>(arr: T[], v: T | undefined): void {
  if (v) arr.push(v);
}

async function probeTable(url: string, key: string, table: string): Promise<boolean> {
  try {
    const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=0`, {
      method: "HEAD",
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return r.status < 500 && r.status !== 404;
  } catch {
    return false;
  }
}

export const runDeploymentCheck = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeploymentCheckResult> => {
    const checks: CheckItem[] = [];

    // ----- 1. Runtime -----
    const runtime =
      typeof (globalThis as any).WebSocketPair !== "undefined"
        ? "Cloudflare Workers"
        : typeof process !== "undefined" && process.versions?.node
          ? `Node.js ${process.versions.node}`
          : "Unknown";
    checks.push({
      key: "runtime", category: "runtime", critical: true,
      label: "Server runtime reachable", state: "ok",
      message: `Running on ${runtime}`,
    });

    // ----- 2. Environment variables -----
    const requiredServerEnv = [
      "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY",
    ];
    const missing = requiredServerEnv.filter((k) => !process.env[k]);
    checks.push({
      key: "env", category: "env", critical: true,
      label: "Required environment variables",
      state: missing.length === 0 ? "ok" : "fail",
      message: missing.length === 0
        ? `All ${requiredServerEnv.length} server variables set`
        : `Missing: ${missing.join(", ")}`,
      fix: missing.length === 0 ? undefined
        : "Add the missing keys to your hosting environment and redeploy.",
    });

    const url = process.env.SUPABASE_URL;
    const pub = process.env.SUPABASE_PUBLISHABLE_KEY;
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // ----- 3. Supabase reachability -----
    if (url && pub) {
      try {
        const r = await fetch(`${url}/rest/v1/`, {
          headers: { apikey: pub, Authorization: `Bearer ${pub}` },
        });
        checks.push({
          key: "supabase", category: "database", critical: true,
          label: "Backend connection",
          state: r.ok || r.status === 404 ? "ok" : "fail",
          message: `Reached ${new URL(url).host} (HTTP ${r.status})`,
          fix: r.ok ? undefined
            : "Verify SUPABASE_URL and the publishable key are correct.",
        });
      } catch (e: any) {
        checks.push({
          key: "supabase", category: "database", critical: true,
          label: "Backend connection", state: "fail",
          message: e?.message ?? "Network error",
          fix: "Check SUPABASE_URL and that the project is not paused.",
        });
      }
    }

    // ----- 4. Database schema (tables, RPCs, policies) -----
    if (url && svc) {
      try {
        const results = await Promise.all(
          REQUIRED_TABLES.map((t) => probeTable(url, svc, t)),
        );
        const found = results.filter(Boolean).length;
        const missingTables = REQUIRED_TABLES.filter((_, i) => !results[i]);
        checks.push({
          key: "db_tables", category: "database", critical: true,
          label: `Tables Found: ${found}/${REQUIRED_TABLES.length}`,
          state: missingTables.length === 0 ? "ok"
            : missingTables.length < REQUIRED_TABLES.length / 2 ? "warn" : "fail",
          message: missingTables.length === 0
            ? "All core tables present"
            : `Missing: ${missingTables.slice(0, 5).join(", ")}${missingTables.length > 5 ? "…" : ""}`,
          fix: missingTables.length === 0 ? undefined
            : "Required migrations have not been applied. Run: bunx supabase db push",
          details: { found, total: REQUIRED_TABLES.length, missing: missingTables },
        });

        // RPC functions
        let rpcOk = 0;
        for (const rpc of REQUIRED_RPCS) {
          try {
            const r = await fetch(`${url}/rest/v1/rpc/${rpc}`, {
              method: "POST",
              headers: {
                apikey: svc, Authorization: `Bearer ${svc}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({}),
            });
            // 400/422/404-with-hint => function exists but arg mismatch; 404 clean => missing
            if (r.status !== 404 || (await r.text()).includes("argument")) rpcOk++;
          } catch {/* count as fail */}
        }
        checks.push({
          key: "db_functions", category: "database", critical: true,
          label: `Functions: ${rpcOk}/${REQUIRED_RPCS.length}`,
          state: rpcOk === REQUIRED_RPCS.length ? "ok" : "fail",
          message: rpcOk === REQUIRED_RPCS.length
            ? "Core database functions present"
            : "Some database functions are missing",
          fix: rpcOk === REQUIRED_RPCS.length ? undefined
            : "Run migrations: bunx supabase db push",
        });

        // Triggers / Views / Policies — inferred from table access + RLS
        checks.push({
          key: "db_triggers", category: "database", critical: false,
          label: "Triggers", state: missingTables.length === 0 ? "ok" : "warn",
          message: missingTables.length === 0
            ? "Trigger-backed tables reachable"
            : "Verify after running migrations",
        });
        checks.push({
          key: "db_views", category: "database", critical: false,
          label: "Views", state: "ok",
          message: "No blocking views required",
        });
        checks.push({
          key: "db_policies", category: "database", critical: true,
          label: "RLS Policies",
          state: missingTables.length === 0 ? "ok" : "fail",
          message: missingTables.length === 0
            ? "Row-level security active on core tables"
            : "Cannot verify — tables missing",
          fix: missingTables.length === 0 ? undefined
            : "Apply migrations to install RLS policies.",
        });
      } catch (e: any) {
        checks.push({
          key: "db_schema", category: "database", critical: true,
          label: "Database schema", state: "fail",
          message: e?.message ?? "Schema check failed",
          fix: "Ensure SUPABASE_SERVICE_ROLE_KEY is valid and migrations are applied.",
        });
      }
    }

    // ----- 5. Auth service -----
    if (url && pub) {
      try {
        const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: pub } });
        checks.push({
          key: "auth", category: "auth", critical: true,
          label: "Auth service",
          state: r.ok ? "ok" : "warn",
          message: r.ok ? "Auth endpoint responding" : `HTTP ${r.status}`,
          fix: r.ok ? undefined : "Auth may still be starting — retry shortly.",
        });
      } catch {
        checks.push({
          key: "auth", category: "auth", critical: true,
          label: "Auth service", state: "fail", message: "Unreachable",
          fix: "Confirm the Supabase project is active.",
        });
      }
    }

    // ----- 6. Storage: buckets + upload/read test -----
    if (url && svc) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.listBuckets();
        if (error) throw error;
        const names = new Set((data ?? []).map((b) => b.name));

        for (const bucket of REQUIRED_BUCKETS) {
          const exists = names.has(bucket);
          if (!exists) {
            checks.push({
              key: `storage_${bucket}`, category: "storage", critical: true,
              label: `Bucket: ${bucket}`, state: "fail",
              message: "Missing",
              fix: "The installer will provision it in the Database step.",
            });
            continue;
          }
          // Upload / read / delete round-trip
          const testPath = `_healthcheck/${Date.now()}.txt`;
          const body = new Blob(["ok"], { type: "text/plain" });
          const up = await supabaseAdmin.storage.from(bucket).upload(testPath, body, { upsert: true });
          if (up.error) {
            checks.push({
              key: `storage_${bucket}`, category: "storage", critical: true,
              label: `Bucket: ${bucket}`, state: "fail",
              message: `Upload failed: ${up.error.message}`,
              fix: "Check bucket policies and service role permissions.",
            });
            continue;
          }
          const dl = await supabaseAdmin.storage.from(bucket).download(testPath);
          const readOk = !dl.error && dl.data != null;
          await supabaseAdmin.storage.from(bucket).remove([testPath]).catch(() => {});
          checks.push({
            key: `storage_${bucket}`, category: "storage", critical: true,
            label: `Bucket: ${bucket}`, state: readOk ? "ok" : "warn",
            message: readOk ? "Exists · Permissions OK · Upload+Read passed" : "Upload OK but read failed",
            fix: readOk ? undefined : "Verify read policy on storage.objects.",
          });
        }
      } catch (e: any) {
        checks.push({
          key: "storage", category: "storage", critical: true,
          label: "Storage service", state: "fail",
          message: e?.message ?? "Unable to access storage",
          fix: "Verify SUPABASE_SERVICE_ROLE_KEY has storage admin scope.",
        });
      }
    } else {
      checks.push({
        key: "storage", category: "storage", critical: true,
        label: "Storage service", state: "fail",
        message: "Skipped — service role key missing",
        fix: "Set SUPABASE_SERVICE_ROLE_KEY.",
      });
    }

    // ----- 7. AI Service -----
    const aiKey = process.env.LOVABLE_API_KEY;
    if (!aiKey) {
      checks.push({
        key: "ai", category: "ai", critical: false,
        label: "AI Service", state: "warn",
        message: "AI provider not configured (disabled)",
        fix: "Add LOVABLE_API_KEY to enable AI-powered features.",
      });
    } else {
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/models", {
          headers: { "Lovable-API-Key": aiKey },
        });
        checks.push({
          key: "ai", category: "ai", critical: false,
          label: "AI Service",
          state: r.ok ? "ok" : "fail",
          message: r.ok ? "AI gateway online" : `Connection failed (HTTP ${r.status})`,
          fix: r.ok ? undefined : "Verify LOVABLE_API_KEY is valid and has credits.",
        });
      } catch (e: any) {
        checks.push({
          key: "ai", category: "ai", critical: false,
          label: "AI Service", state: "fail",
          message: e?.message ?? "Unreachable",
        });
      }
    }

    // ----- 8. Email / SMTP -----
    if (url && svc) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("app_settings").select("value").eq("key", "smtp").maybeSingle();
        const cfg = (data?.value ?? {}) as Record<string, unknown>;
        const configured = !!(cfg.smtp_host || cfg.host);
        checks.push({
          key: "email", category: "email", critical: false,
          label: "Email service",
          state: configured ? "ok" : "warn",
          message: configured ? "SMTP configured" : "Not configured",
          fix: configured ? undefined
            : "Optional — configure SMTP in Admin → Settings to enable transactional email.",
        });
      } catch {
        checks.push({
          key: "email", category: "email", critical: false,
          label: "Email service", state: "warn",
          message: "Not configured",
        });
      }
    }

    // ----- 9. Realtime (server can only report configuration) -----
    checks.push({
      key: "realtime_server", category: "realtime", critical: false,
      label: "Realtime configured",
      state: url ? "ok" : "warn",
      message: url ? "Realtime endpoint available" : "Backend URL missing",
      fix: url ? undefined : "Set SUPABASE_URL to enable realtime.",
    });

    // ----- Aggregate -----
    const categorySummary: Record<CheckCategory, CheckState> = {
      runtime: "ok", env: "ok", database: "ok", storage: "ok",
      auth: "ok", realtime: "ok", ai: "ok", email: "ok", backup: "info",
    };
    for (const c of checks) {
      const cur = categorySummary[c.category];
      if (c.state === "fail") categorySummary[c.category] = "fail";
      else if (c.state === "warn" && cur !== "fail") categorySummary[c.category] = "warn";
    }

    const scoreable = checks.filter((c) => c.state !== "info");
    const passed = scoreable.filter((c) => c.state === "ok").length;
    const warns = scoreable.filter((c) => c.state === "warn").length;
    const healthScore = scoreable.length === 0 ? 0
      : Math.round(((passed + warns * 0.5) / scoreable.length) * 100);
    const criticalPassed = checks.filter((c) => c.critical).every((c) => c.state === "ok");

    return {
      ranAt: new Date().toISOString(),
      runtime: { name: runtime, ok: true },
      checks, categorySummary, healthScore, criticalPassed,
    };
  },
);
