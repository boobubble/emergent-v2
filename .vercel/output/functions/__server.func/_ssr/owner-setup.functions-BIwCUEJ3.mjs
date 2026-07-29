import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, e as enumType, s as stringType, l as literalType } from "../_libs/zod.mjs";
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
async function assertWizardOpen() {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    count,
    error
  } = await supabaseAdmin.from("user_roles").select("*", {
    count: "exact",
    head: true
  }).eq("role", "super_admin");
  if (error) throw new Error(`Role check failed: ${error.message}`);
  if ((count ?? 0) > 0) throw new Error("Setup wizard is disabled: Super Admin already exists.");
  const {
    data: firstRun
  } = await supabaseAdmin.from("app_settings").select("value").eq("key", "first_run_completed").maybeSingle();
  if (firstRun?.value?.completed === true) {
    throw new Error("Setup wizard is disabled: first-run setup already completed.");
  }
}
const getOwnerStatus_createServerFn_handler = createServerRpc({
  id: "bcf401160e911f0ebcb3a38bfbdee41bc6c3e3202dec985efeaa3eb78d6e3099",
  name: "getOwnerStatus",
  filename: "src/lib/owner-setup.functions.ts"
}, (opts) => getOwnerStatus.__executeServer(opts));
const getOwnerStatus = createServerFn({
  method: "GET"
}).handler(getOwnerStatus_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const [{
    count: superCount,
    error: rolesErr
  }, {
    data: install
  }, {
    data: firstRun
  }] = await Promise.all([supabaseAdmin.from("user_roles").select("*", {
    count: "exact",
    head: true
  }).eq("role", "super_admin"), supabaseAdmin.rpc("get_install_status"), supabaseAdmin.from("app_settings").select("value").eq("key", "first_run_completed").maybeSingle()]);
  if (rolesErr) {
    return {
      hasOwner: false,
      installed: false,
      firstRunCompleted: false,
      error: rolesErr.message
    };
  }
  const installed = !!install?.installed;
  const firstRunCompleted = firstRun?.value?.completed === true;
  return {
    hasOwner: (superCount ?? 0) > 0,
    installed,
    firstRunCompleted
  };
});
const CommunityInput = objectType({
  name: stringType().trim().min(1).max(120),
  tagline: stringType().trim().max(200).optional().default(""),
  description: stringType().trim().max(2e3).optional().default(""),
  language: stringType().trim().min(2).max(10).default("en"),
  timezone: stringType().trim().min(1).max(64).default("UTC"),
  currency: stringType().trim().min(2).max(8).default("USD"),
  logoUrl: stringType().trim().url().max(500).optional().or(literalType("")).default(""),
  faviconUrl: stringType().trim().url().max(500).optional().or(literalType("")).default(""),
  homepage: enumType(["welcome", "hero"]).default("welcome")
});
const saveCommunitySetup_createServerFn_handler = createServerRpc({
  id: "b096ee15c36458b0d7535022b5619f0cd76279ba31067a48381ef9b36acfdefc",
  name: "saveCommunitySetup",
  filename: "src/lib/owner-setup.functions.ts"
}, (opts) => saveCommunitySetup.__executeServer(opts));
const saveCommunitySetup = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).inputValidator((data) => CommunityInput.parse(data)).handler(saveCommunitySetup_createServerFn_handler, async ({
  data
}) => {
  await assertWizardOpen();
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const writes = [{
    key: "community",
    value: {
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      language: data.language,
      timezone: data.timezone,
      currency: data.currency,
      logo_url: data.logoUrl || null,
      favicon_url: data.faviconUrl || null
    },
    updated_at: now
  }, {
    key: "homepage",
    value: {
      default: data.homepage
    },
    updated_at: now
  }];
  const {
    error: upErr
  } = await supabaseAdmin.from("app_settings").upsert(writes, {
    onConflict: "key"
  });
  if (upErr) throw new Error(`Failed to save community info: ${upErr.message}`);
  const defaults = {
    chat_defaults: {
      slow_mode_sec: 0,
      allow_media: true,
      allow_links: true
    },
    feed_defaults: {
      allow_comments: true,
      allow_reactions: true,
      default_visibility: "public"
    },
    wallet_defaults: {
      starting_balance: 0,
      daily_bonus: 10,
      currency: data.currency
    },
    xp_defaults: {
      post: 5,
      comment: 2,
      reaction: 1,
      daily_login: 10
    },
    notification_defaults: {
      email: true,
      push: true,
      in_app: true
    },
    gamification_defaults: {
      enabled: true,
      level_curve: "linear"
    }
  };
  const keys = Object.keys(defaults);
  const {
    data: existing
  } = await supabaseAdmin.from("app_settings").select("key").in("key", keys);
  const have = new Set((existing ?? []).map((r) => r.key));
  const toInsert = keys.filter((k) => !have.has(k)).map((k) => ({
    key: k,
    value: defaults[k],
    updated_at: now
  }));
  if (toInsert.length > 0) {
    const {
      error: insErr
    } = await supabaseAdmin.from("app_settings").insert(toInsert);
    if (insErr) throw new Error(`Failed to seed defaults: ${insErr.message}`);
  }
  return {
    ok: true,
    seeded: toInsert.map((r) => r.key)
  };
});
const CreateOwnerInput = objectType({
  fullName: stringType().trim().min(1).max(120),
  username: stringType().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: stringType().trim().email().max(255),
  password: stringType().min(8).max(200)
});
const createOwner_createServerFn_handler = createServerRpc({
  id: "f6a09b38bbc16b2695f359881b3c30da2c0982a5fb7f6b55173277d96293b991",
  name: "createOwner",
  filename: "src/lib/owner-setup.functions.ts"
}, (opts) => createOwner.__executeServer(opts));
const createOwner = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).inputValidator((data) => CreateOwnerInput.parse(data)).handler(createOwner_createServerFn_handler, async ({
  data
}) => {
  await assertWizardOpen();
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: existingUsername
  } = await supabaseAdmin.from("profiles").select("id").ilike("username", data.username).maybeSingle();
  if (existingUsername) throw new Error("Username is already taken.");
  const {
    data: created,
    error: createErr
  } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      username: data.username,
      full_name: data.fullName,
      display_name: data.fullName
    }
  });
  if (createErr || !created?.user) {
    throw new Error(createErr?.message || "Failed to create user.");
  }
  const userId = created.user.id;
  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    username: data.username,
    display_name: data.fullName
  }, {
    onConflict: "id"
  });
  const {
    error: roleErr
  } = await supabaseAdmin.from("user_roles").insert({
    user_id: userId,
    role: "super_admin"
  });
  if (roleErr) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {
    });
    throw new Error(`Failed to grant super_admin: ${roleErr.message}`);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await supabaseAdmin.from("app_settings").upsert({
    key: "first_run_completed",
    value: {
      completed: true,
      completed_at: now,
      owner_id: userId
    },
    updated_at: now
  }, {
    onConflict: "key"
  });
  return {
    ok: true,
    userId,
    email: data.email
  };
});
const SIGNED_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;
const AssetInput = objectType({
  kind: enumType(["logo", "favicon", "hero"]),
  filename: stringType().trim().min(1).max(200),
  contentType: stringType().trim().min(1).max(120),
  // base64-encoded file bytes (no data: prefix)
  base64: stringType().min(1).max(8e6)
  // ~6MB decoded
});
const ALLOWED_MIME = {
  logo: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
  favicon: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"],
  hero: ["image/png", "image/jpeg", "image/jpg", "image/webp"]
};
const MAX_BYTES = {
  logo: 2 * 1024 * 1024,
  favicon: 512 * 1024,
  hero: 5 * 1024 * 1024
};
const uploadCommunityAsset_createServerFn_handler = createServerRpc({
  id: "c283f16416662d40da82dda155729965674669099ec0392ab025b72be2c29163",
  name: "uploadCommunityAsset",
  filename: "src/lib/owner-setup.functions.ts"
}, (opts) => uploadCommunityAsset.__executeServer(opts));
const uploadCommunityAsset = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).inputValidator((data) => AssetInput.parse(data)).handler(uploadCommunityAsset_createServerFn_handler, async ({
  data
}) => {
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
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const ext = (data.filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `setup-wizard/${data.kind}-${Date.now()}.${ext || "bin"}`;
  const {
    error: upErr
  } = await supabaseAdmin.storage.from("brand-assets").upload(path, bytes, {
    upsert: true,
    contentType: data.contentType
  });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
  const {
    data: signed,
    error: sErr
  } = await supabaseAdmin.storage.from("brand-assets").createSignedUrl(path, SIGNED_TTL_SECONDS);
  if (sErr || !signed) throw new Error(`Failed to sign URL: ${sErr?.message ?? "unknown"}`);
  return {
    ok: true,
    url: signed.signedUrl,
    path
  };
});
async function pingHttp(url, headers, timeoutMs = 5e3) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers,
      signal: controller.signal
    });
    return {
      ok: r.ok || r.status === 404 || r.status === 401,
      status: r.status
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e?.message ?? "unreachable"
    };
  } finally {
    clearTimeout(t);
  }
}
const runInstallationHealthCheck_createServerFn_handler = createServerRpc({
  id: "3fcbf97b22720df7093c833b0affea3e506c435e382d3fcfce4797b3d3fb945b",
  name: "runInstallationHealthCheck",
  filename: "src/lib/owner-setup.functions.ts"
}, (opts) => runInstallationHealthCheck.__executeServer(opts));
const runInstallationHealthCheck = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).handler(runInstallationHealthCheck_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const checks = [];
  const url = process.env.SUPABASE_URL || "";
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY || "";
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  try {
    const {
      error
    } = await supabaseAdmin.from("app_settings").select("key", {
      head: true,
      count: "exact"
    }).limit(1);
    if (error) throw error;
    checks.push({
      key: "db",
      label: "Database Connection",
      state: "ok",
      detail: "Database reachable",
      critical: true
    });
    checks.push({
      key: "supabase",
      label: "Backend Connected",
      state: "ok",
      detail: "Backend services reachable",
      critical: true
    });
  } catch (e) {
    checks.push({
      key: "db",
      label: "Database Connection",
      state: "fail",
      detail: "Cannot reach the database",
      problem: "Database query failed.",
      reason: "The database may be paused, unreachable, or misconfigured.",
      action: "Resume the backend project and re-run the health check.",
      critical: true
    });
    checks.push({
      key: "supabase",
      label: "Backend Connected",
      state: "fail",
      detail: "Backend unreachable",
      critical: true
    });
  }
  if (!url || !anon) {
    checks.push({
      key: "auth",
      label: "Authentication Ready",
      state: "fail",
      detail: "Missing backend URL or public key.",
      problem: "Authentication service not configured.",
      reason: "Environment variables are missing.",
      action: "Reconnect the backend and reload.",
      critical: true
    });
  } else {
    const r = await pingHttp(`${url}/auth/v1/settings`, {
      apikey: anon
    });
    checks.push({
      key: "auth",
      label: "Authentication Ready",
      state: r.ok ? "ok" : "fail",
      detail: r.ok ? "Auth service online" : `Auth service returned ${r.status || "error"}`,
      problem: r.ok ? void 0 : "Authentication service is not responding.",
      reason: r.ok ? void 0 : "The auth endpoint could not be reached.",
      action: r.ok ? void 0 : "Verify the backend is running and try again.",
      critical: true
    });
  }
  try {
    const {
      data: buckets,
      error
    } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;
    const names = new Set((buckets ?? []).map((b) => b.name));
    const required = ["avatars", "brand-assets"];
    const missing = required.filter((n) => !names.has(n));
    checks.push({
      key: "storage",
      label: "Storage Ready",
      state: missing.length === 0 ? "ok" : "warn",
      detail: missing.length === 0 ? `${buckets?.length ?? 0} bucket(s) available` : `Missing bucket(s): ${missing.join(", ")}`,
      problem: missing.length ? "Some storage buckets are missing." : void 0,
      reason: missing.length ? "The installer skipped bucket provisioning." : void 0,
      action: missing.length ? "Re-run bucket provisioning from the installer." : void 0,
      critical: true
    });
  } catch {
    checks.push({
      key: "storage",
      label: "Storage Ready",
      state: "fail",
      detail: "Storage service unreachable",
      problem: "Cannot list storage buckets.",
      reason: "The storage endpoint could not be reached.",
      action: "Confirm storage is enabled on the backend.",
      critical: true
    });
  }
  if (url && anon) {
    const r = await pingHttp(`${url}/realtime/v1/api/tenants/health`, {
      apikey: anon,
      Authorization: `Bearer ${anon}`
    });
    checks.push({
      key: "realtime",
      label: "Realtime Enabled",
      state: r.ok ? "ok" : "warn",
      detail: r.ok ? "Realtime service reachable" : "Realtime not responding",
      problem: r.ok ? void 0 : "Realtime is not responding.",
      reason: r.ok ? void 0 : "Realtime may be disabled for this project.",
      action: r.ok ? void 0 : "Enable Realtime for the required tables.",
      critical: false
    });
  } else {
    checks.push({
      key: "realtime",
      label: "Realtime Enabled",
      state: "warn",
      detail: "Skipped",
      critical: false
    });
  }
  const featureProbes = [{
    key: "wallet",
    label: "Wallet Ready",
    table: "coin_transactions"
  }, {
    key: "xp",
    label: "XP System Ready",
    table: "gam_event_log"
  }, {
    key: "notifications",
    label: "Notifications Ready",
    table: "notifications"
  }, {
    key: "games",
    label: "Games Ready",
    table: "games"
  }, {
    key: "radio",
    label: "Radio Ready",
    table: "radio_widgets"
  }, {
    key: "scheduler",
    label: "Scheduler Ready",
    table: "radio_schedules"
  }];
  for (const p of featureProbes) {
    try {
      const {
        error
      } = await supabaseAdmin.from(p.table).select("*", {
        head: true,
        count: "exact"
      }).limit(1);
      if (error) throw error;
      checks.push({
        key: p.key,
        label: p.label,
        state: "ok",
        detail: "Module tables present",
        critical: false
      });
    } catch {
      checks.push({
        key: p.key,
        label: p.label,
        state: "warn",
        detail: "Module tables missing",
        problem: `${p.label.replace(" Ready", "")} tables not found.`,
        reason: "Migrations for this module may not have been applied.",
        action: "Re-run the installer database step.",
        critical: false
      });
    }
  }
  try {
    const {
      data
    } = await supabaseAdmin.from("app_settings").select("value").eq("key", "license").maybeSingle();
    const licensed = !!data?.value?.valid || !!data?.value?.key;
    checks.push({
      key: "license",
      label: "License Valid",
      state: licensed ? "ok" : "warn",
      detail: licensed ? "License on record" : "No license recorded (open source / local install)",
      critical: false
    });
  } catch {
    checks.push({
      key: "license",
      label: "License Valid",
      state: "warn",
      detail: "Unable to verify license",
      critical: false
    });
  }
  const criticalFail = checks.some((c) => c.critical && c.state === "fail");
  return {
    ok: !criticalFail,
    checks,
    checkedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
});
export {
  createOwner_createServerFn_handler,
  getOwnerStatus_createServerFn_handler,
  runInstallationHealthCheck_createServerFn_handler,
  saveCommunitySetup_createServerFn_handler,
  uploadCommunityAsset_createServerFn_handler
};
