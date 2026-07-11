import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Post-Installation Setup Wizard — server functions.
 *
 * These endpoints are intentionally UNAUTHENTICATED because they run once,
 * before any user exists. Every write is guarded by a strict server-side
 * check: no super_admin role must currently exist. Once an owner is
 * created (and first_run_completed is set), all endpoints refuse further
 * writes.
 */

async function assertWizardOpen() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "super_admin");
  if (error) throw new Error(`Role check failed: ${error.message}`);
  if ((count ?? 0) > 0) throw new Error("Setup wizard is disabled: Super Admin already exists.");

  const { data: firstRun } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "first_run_completed")
    .maybeSingle();
  if ((firstRun?.value as any)?.completed === true) {
    throw new Error("Setup wizard is disabled: first-run setup already completed.");
  }
}

export const getOwnerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ count: superCount, error: rolesErr }, { data: install }, { data: firstRun }] = await Promise.all([
    supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin"),
    supabaseAdmin.rpc("get_install_status"),
    supabaseAdmin.from("app_settings").select("value").eq("key", "first_run_completed").maybeSingle(),
  ]);

  if (rolesErr) {
    return { hasOwner: false, installed: false, firstRunCompleted: false, error: rolesErr.message };
  }

  const installed = !!(install as any)?.installed;
  const firstRunCompleted = (firstRun?.value as any)?.completed === true;
  return { hasOwner: (superCount ?? 0) > 0, installed, firstRunCompleted };
});

const CommunityInput = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  language: z.string().trim().min(2).max(10).default("en"),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
  currency: z.string().trim().min(2).max(8).default("USD"),
  logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")).default(""),
  faviconUrl: z.string().trim().url().max(500).optional().or(z.literal("")).default(""),
  homepage: z.enum(["welcome", "hero"]).default("welcome"),
});

/**
 * Save community info + homepage selection + seed missing default settings.
 * Only allowed while wizard is open (no owner + first_run not completed).
 */
export const saveCommunitySetup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CommunityInput.parse(data))
  .handler(async ({ data }) => {
    await assertWizardOpen();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Overwrite community info + homepage selection (user-chosen).
    const now = new Date().toISOString();
    const writes = [
      {
        key: "community",
        value: {
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          language: data.language,
          timezone: data.timezone,
          currency: data.currency,
          logo_url: data.logoUrl || null,
          favicon_url: data.faviconUrl || null,
        },
        updated_at: now,
      },
      {
        key: "homepage",
        value: { default: data.homepage },
        updated_at: now,
      },
    ];

    const { error: upErr } = await supabaseAdmin
      .from("app_settings")
      .upsert(writes as any, { onConflict: "key" });
    if (upErr) throw new Error(`Failed to save community info: ${upErr.message}`);

    // Seed defaults ONLY when missing (never overwrite existing values).
    const defaults: Record<string, any> = {
      chat_defaults: { slow_mode_sec: 0, allow_media: true, allow_links: true },
      feed_defaults: { allow_comments: true, allow_reactions: true, default_visibility: "public" },
      wallet_defaults: { starting_balance: 0, daily_bonus: 10, currency: data.currency },
      xp_defaults: { post: 5, comment: 2, reaction: 1, daily_login: 10 },
      notification_defaults: { email: true, push: true, in_app: true },
      gamification_defaults: { enabled: true, level_curve: "linear" },
    };

    const keys = Object.keys(defaults);
    const { data: existing } = await supabaseAdmin
      .from("app_settings")
      .select("key")
      .in("key", keys);
    const have = new Set((existing ?? []).map((r: any) => r.key));
    const toInsert = keys
      .filter((k) => !have.has(k))
      .map((k) => ({ key: k, value: defaults[k], updated_at: now }));
    if (toInsert.length > 0) {
      const { error: insErr } = await supabaseAdmin.from("app_settings").insert(toInsert as any);
      if (insErr) throw new Error(`Failed to seed defaults: ${insErr.message}`);
    }

    return { ok: true, seeded: toInsert.map((r) => r.key) };
  });

const CreateOwnerInput = z.object({
  fullName: z.string().trim().min(1).max(120),
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
});

export const createOwner = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CreateOwnerInput.parse(data))
  .handler(async ({ data }) => {
    await assertWizardOpen();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingUsername } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (existingUsername) throw new Error("Username is already taken.");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        username: data.username,
        full_name: data.fullName,
        display_name: data.fullName,
      },
    });
    if (createErr || !created?.user) {
      throw new Error(createErr?.message || "Failed to create user.");
    }
    const userId = created.user.id;

    await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: userId, username: data.username, display_name: data.fullName } as any,
        { onConflict: "id" }
      );

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "super_admin" as any });
    if (roleErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      throw new Error(`Failed to grant super_admin: ${roleErr.message}`);
    }

    // Mark first-run permanently completed so the wizard can never run again.
    const now = new Date().toISOString();
    await supabaseAdmin.from("app_settings").upsert(
      {
        key: "first_run_completed",
        value: { completed: true, completed_at: now, owner_id: userId },
        updated_at: now,
      } as any,
      { onConflict: "key" }
    );

    return { ok: true, userId, email: data.email };
  });

/* ------------------------------------------------------------------ */
/* Community asset upload (wizard-open only, uses brand-assets bucket) */
/* ------------------------------------------------------------------ */

const SIGNED_TTL_SECONDS = 60 * 60 * 24 * 365 * 10; // 10 years

const AssetInput = z.object({
  kind: z.enum(["logo", "favicon", "hero"]),
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(120),
  // base64-encoded file bytes (no data: prefix)
  base64: z.string().min(1).max(8_000_000), // ~6MB decoded
});

const ALLOWED_MIME: Record<"logo" | "favicon" | "hero", string[]> = {
  logo: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
  favicon: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"],
  hero: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
};

const MAX_BYTES: Record<"logo" | "favicon" | "hero", number> = {
  logo: 2 * 1024 * 1024,
  favicon: 512 * 1024,
  hero: 5 * 1024 * 1024,
};

export const uploadCommunityAsset = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AssetInput.parse(data))
  .handler(async ({ data }) => {
    await assertWizardOpen();
    const allowed = ALLOWED_MIME[data.kind];
    if (!allowed.includes(data.contentType.toLowerCase())) {
      throw new Error(`Unsupported file type for ${data.kind}: ${data.contentType}`);
    }
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.length === 0) throw new Error("Empty file.");
    if (bytes.length > MAX_BYTES[data.kind]) {
      throw new Error(`File too large. Max ${(MAX_BYTES[data.kind] / 1024 / 1024).toFixed(1)} MB.`);
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = (data.filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `setup-wizard/${data.kind}-${Date.now()}.${ext || "bin"}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("brand-assets")
      .upload(path, bytes, { upsert: true, contentType: data.contentType });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("brand-assets")
      .createSignedUrl(path, SIGNED_TTL_SECONDS);
    if (sErr || !signed) throw new Error(`Failed to sign URL: ${sErr?.message ?? "unknown"}`);
    return { ok: true, url: signed.signedUrl, path };
  });

/* --------------------------- Health check --------------------------- */

export type HealthState = "ok" | "warn" | "fail";
export interface HealthCheck {
  key: string;
  label: string;
  state: HealthState;
  detail: string;
  problem?: string;
  reason?: string;
  action?: string;
  critical: boolean;
}

async function pingHttp(url: string, headers: Record<string, string>, timeoutMs = 5000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers, signal: controller.signal });
    return { ok: r.ok || r.status === 404 || r.status === 401, status: r.status };
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.message ?? "unreachable" };
  } finally {
    clearTimeout(t);
  }
}

export const runInstallationHealthCheck = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: boolean; checks: HealthCheck[]; checkedAt: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const checks: HealthCheck[] = [];

    const url = process.env.SUPABASE_URL || "";
    const anon = process.env.SUPABASE_PUBLISHABLE_KEY || "";
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    // Database + Supabase connection
    try {
      const { error } = await supabaseAdmin.from("app_settings").select("key", { head: true, count: "exact" }).limit(1);
      if (error) throw error;
      checks.push({ key: "db", label: "Database Connection", state: "ok", detail: "Database reachable", critical: true });
      checks.push({ key: "supabase", label: "Backend Connected", state: "ok", detail: "Backend services reachable", critical: true });
    } catch (e: any) {
      checks.push({
        key: "db", label: "Database Connection", state: "fail",
        detail: "Cannot reach the database",
        problem: "Database query failed.",
        reason: "The database may be paused, unreachable, or misconfigured.",
        action: "Resume the backend project and re-run the health check.",
        critical: true,
      });
      checks.push({ key: "supabase", label: "Backend Connected", state: "fail", detail: "Backend unreachable", critical: true });
    }

    // Auth
    if (!url || !anon) {
      checks.push({
        key: "auth", label: "Authentication Ready", state: "fail",
        detail: "Missing backend URL or public key.",
        problem: "Authentication service not configured.",
        reason: "Environment variables are missing.",
        action: "Reconnect the backend and reload.",
        critical: true,
      });
    } else {
      const r = await pingHttp(`${url}/auth/v1/settings`, { apikey: anon });
      checks.push({
        key: "auth", label: "Authentication Ready",
        state: r.ok ? "ok" : "fail",
        detail: r.ok ? "Auth service online" : `Auth service returned ${r.status || "error"}`,
        problem: r.ok ? undefined : "Authentication service is not responding.",
        reason: r.ok ? undefined : "The auth endpoint could not be reached.",
        action: r.ok ? undefined : "Verify the backend is running and try again.",
        critical: true,
      });
    }

    // Storage + required buckets
    try {
      const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
      if (error) throw error;
      const names = new Set((buckets ?? []).map((b) => b.name));
      const required = ["avatars", "brand-assets"];
      const missing = required.filter((n) => !names.has(n));
      checks.push({
        key: "storage", label: "Storage Ready",
        state: missing.length === 0 ? "ok" : "warn",
        detail: missing.length === 0
          ? `${buckets?.length ?? 0} bucket(s) available`
          : `Missing bucket(s): ${missing.join(", ")}`,
        problem: missing.length ? "Some storage buckets are missing." : undefined,
        reason: missing.length ? "The installer skipped bucket provisioning." : undefined,
        action: missing.length ? "Re-run bucket provisioning from the installer." : undefined,
        critical: true,
      });
    } catch {
      checks.push({
        key: "storage", label: "Storage Ready", state: "fail",
        detail: "Storage service unreachable",
        problem: "Cannot list storage buckets.",
        reason: "The storage endpoint could not be reached.",
        action: "Confirm storage is enabled on the backend.",
        critical: true,
      });
    }

    // Realtime
    if (url && anon) {
      const r = await pingHttp(`${url}/realtime/v1/api/tenants/health`, { apikey: anon, Authorization: `Bearer ${anon}` });
      checks.push({
        key: "realtime", label: "Realtime Enabled",
        state: r.ok ? "ok" : "warn",
        detail: r.ok ? "Realtime service reachable" : "Realtime not responding",
        problem: r.ok ? undefined : "Realtime is not responding.",
        reason: r.ok ? undefined : "Realtime may be disabled for this project.",
        action: r.ok ? undefined : "Enable Realtime for the required tables.",
        critical: false,
      });
    } else {
      checks.push({ key: "realtime", label: "Realtime Enabled", state: "warn", detail: "Skipped", critical: false });
    }

    // Feature tables (lightweight existence probes)
    const featureProbes: { key: string; label: string; table: string }[] = [
      { key: "wallet", label: "Wallet Ready", table: "coin_transactions" },
      { key: "xp", label: "XP System Ready", table: "gam_event_log" },
      { key: "notifications", label: "Notifications Ready", table: "notifications" },
      { key: "games", label: "Games Ready", table: "games" },
      { key: "radio", label: "Radio Ready", table: "radio_widgets" },
      { key: "scheduler", label: "Scheduler Ready", table: "radio_schedules" },
    ];
    for (const p of featureProbes) {
      try {
        const { error } = await supabaseAdmin.from(p.table as any).select("*", { head: true, count: "exact" }).limit(1);
        if (error) throw error;
        checks.push({ key: p.key, label: p.label, state: "ok", detail: "Module tables present", critical: false });
      } catch {
        checks.push({
          key: p.key, label: p.label, state: "warn",
          detail: "Module tables missing",
          problem: `${p.label.replace(" Ready", "")} tables not found.`,
          reason: "Migrations for this module may not have been applied.",
          action: "Re-run the installer database step.",
          critical: false,
        });
      }
    }

    // License (best-effort — not blocking)
    try {
      const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", "license").maybeSingle();
      const licensed = !!(data?.value as any)?.valid || !!(data?.value as any)?.key;
      checks.push({
        key: "license", label: "License Valid",
        state: licensed ? "ok" : "warn",
        detail: licensed ? "License on record" : "No license recorded (open source / local install)",
        critical: false,
      });
    } catch {
      checks.push({ key: "license", label: "License Valid", state: "warn", detail: "Unable to verify license", critical: false });
    }

    const criticalFail = checks.some((c) => c.critical && c.state === "fail");
    // Public svc-key presence must never leak — only report boolean-ish detail
    void svc;
    return { ok: !criticalFail, checks, checkedAt: new Date().toISOString() };
  },
);

