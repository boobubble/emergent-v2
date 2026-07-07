import { createServerFn } from "@tanstack/react-start";

/**
 * Public, unauthenticated preflight for the Deployment Wizard.
 * Runs on the Cloudflare Worker — the fact that it responds at all proves
 * SSR / Workers is live. Reports only booleans + names, never secret values.
 */
export type CheckState = "ok" | "fail" | "warn";
export type CheckItem = {
  key: string;
  label: string;
  state: CheckState;
  message: string;
  fix?: string;
};
export type DeploymentCheckResult = {
  ranAt: string;
  runtime: { name: string; ok: boolean };
  checks: CheckItem[];
  allGreen: boolean;
};

const REQUIRED_BUCKETS = ["avatars", "feed-media", "brand-assets", "stickers"];

export const runDeploymentCheck = createServerFn({ method: "GET" }).handler(
  async (): Promise<DeploymentCheckResult> => {
    const checks: CheckItem[] = [];

    // 1. Runtime — if this handler responded, the Worker is live.
    const runtime =
      typeof (globalThis as any).WebSocketPair !== "undefined"
        ? "Cloudflare Workers"
        : typeof process !== "undefined" && process.versions?.node
          ? `Node.js ${process.versions.node}`
          : "Unknown";
    checks.push({
      key: "runtime",
      label: "Server runtime reachable",
      state: "ok",
      message: `Running on ${runtime}`,
    });

    // 2. Server-side env vars (never echoed, only presence).
    const requiredServerEnv = [
      "SUPABASE_URL",
      "SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];
    const missing = requiredServerEnv.filter((k) => !process.env[k]);
    checks.push({
      key: "env",
      label: "Required environment variables",
      state: missing.length === 0 ? "ok" : "fail",
      message:
        missing.length === 0
          ? `All ${requiredServerEnv.length} server variables set`
          : `Missing: ${missing.join(", ")}`,
      fix:
        missing.length === 0
          ? undefined
          : "Add the missing keys to your hosting environment (Cloudflare Worker vars, .env, or platform dashboard) and redeploy.",
    });

    // 3. Supabase reachability (public REST ping with publishable key).
    const url = process.env.SUPABASE_URL;
    const pub = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (url && pub) {
      try {
        const r = await fetch(`${url}/rest/v1/`, {
          headers: { apikey: pub, Authorization: `Bearer ${pub}` },
        });
        checks.push({
          key: "supabase",
          label: "Backend connection (Supabase)",
          state: r.ok || r.status === 404 ? "ok" : "fail",
          message: `Reached ${new URL(url).host} (HTTP ${r.status})`,
          fix: r.ok
            ? undefined
            : "Verify SUPABASE_URL points to the correct project and the publishable key is valid.",
        });
      } catch (e: any) {
        checks.push({
          key: "supabase",
          label: "Backend connection (Supabase)",
          state: "fail",
          message: e?.message ?? "Network error",
          fix: "Check the SUPABASE_URL value and that the project is not paused.",
        });
      }
    } else {
      checks.push({
        key: "supabase",
        label: "Backend connection (Supabase)",
        state: "fail",
        message: "Skipped — env vars missing",
        fix: "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY first.",
      });
    }

    // 4. Storage buckets (needs service role).
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && svc) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.listBuckets();
        if (error) throw error;
        const names = new Set((data ?? []).map((b) => b.name));
        const missingBuckets = REQUIRED_BUCKETS.filter((n) => !names.has(n));
        checks.push({
          key: "storage",
          label: "Storage buckets provisioned",
          state:
            missingBuckets.length === 0
              ? "ok"
              : missingBuckets.length === REQUIRED_BUCKETS.length
                ? "fail"
                : "warn",
          message:
            missingBuckets.length === 0
              ? `All ${REQUIRED_BUCKETS.length} required buckets exist`
              : `Missing: ${missingBuckets.join(", ")}`,
          fix:
            missingBuckets.length === 0
              ? undefined
              : "The installer will create these automatically in the Database step. No manual action required.",
        });
      } catch (e: any) {
        checks.push({
          key: "storage",
          label: "Storage buckets provisioned",
          state: "fail",
          message: e?.message ?? "Unable to list buckets",
          fix: "Verify SUPABASE_SERVICE_ROLE_KEY has storage admin scope.",
        });
      }
    } else {
      checks.push({
        key: "storage",
        label: "Storage buckets provisioned",
        state: "warn",
        message: "Skipped — service role key missing",
        fix: "Set SUPABASE_SERVICE_ROLE_KEY so the installer can create buckets.",
      });
    }

    // 5. Required services — auth + database via REST discovery.
    if (url && pub) {
      try {
        const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: pub } });
        checks.push({
          key: "auth",
          label: "Auth service",
          state: r.ok ? "ok" : "warn",
          message: r.ok ? "Auth endpoint responding" : `HTTP ${r.status}`,
          fix: r.ok
            ? undefined
            : "Auth may still be starting — retry in ~30 seconds.",
        });
      } catch {
        checks.push({
          key: "auth",
          label: "Auth service",
          state: "fail",
          message: "Unreachable",
          fix: "Confirm the Supabase project is active.",
        });
      }
    }

    const allGreen = checks.every((c) => c.state === "ok");
    return {
      ranAt: new Date().toISOString(),
      runtime: { name: runtime, ok: true },
      checks,
      allGreen,
    };
  },
);
