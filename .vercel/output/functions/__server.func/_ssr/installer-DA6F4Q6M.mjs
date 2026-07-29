import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { b as useServerFn, aq as verifyLicense, ar as activateLicense, B as Button, ae as Card, ag as CardHeader, ah as CardTitle, ai as CardDescription, af as CardContent, ac as Label, a0 as Input } from "./router-CYWPFaDK.mjs";
import { R as RadioGroup, a as RadioGroupItem } from "./radio-group-BYXGCyZJ.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { d as detectInstallMode, f as fetchInstallStatus, b as bootstrapFirstAdmin, c as completeInstallation } from "./installer-Zqriv3Yc.mjs";
import { e as ensureRequiredBuckets } from "./backup.functions-DkVYCbxN.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as APP_VERSION } from "./app-version-8YDb-xNu.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { a0 as LoaderCircle, b2 as Rocket, b6 as KeyRound, S as Shield, ba as HardDrive, b9 as Database, s as UserPlus, P as Palette, bA as PartyPopper, aI as Download, bw as Cloud, b8 as Server, bz as CircleCheck, aM as Circle, $ as CircleAlert, by as Copy, bG as Terminal, d as Trash2, j as ChevronUp, aP as ChevronDown } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/radix-ui__react-radio-group.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
const getBootstrapStatus = createServerFn({
  method: "GET"
}).handler(createSsrRpc("fd6520cef91ba39011767bcc40e520dd7b0eadb7ec9d7a5e44e7a614f0323af8"));
const runSchemaBootstrap = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).handler(createSsrRpc("50d5ccdb83346571f0a0c8a428663079523d67f3100808f9b5aab03ef3ed071d"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("50f5808780c1491d92d505f3743bda28cf0e6530001721bc5d793ca6026413be"));
createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).inputValidator((d) => d).handler(createSsrRpc("7a1af6219b5ec0a63c8a581ae37e4dacf4778a2cebabf3473aa5d82128f960d4"));
const getEnvValidation = createServerFn({
  method: "GET"
}).handler(createSsrRpc("33346c472edebcb0648b8dcb6f549014c4a74bef6334b8a06e893f8b32cae9d9"));
const testDatabaseConnection = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).handler(createSsrRpc("abea224403a1795ed57c910fdd98c994f19a9c502a68ef3646e031ae1ef98cf7"));
const getSystemCompatibility = createServerFn({
  method: "POST"
}).middleware([withRateLimit("api")]).handler(createSsrRpc("12043de90bd0885d7df95c87b43c38e5ed14b9a799132b9fed8cf5e9a521f6f1"));
const LICENSE_SOURCE_LABEL = {
  self: "Direct / Self-Hosted License",
  envato: "CodeCanyon (Envato)",
  codester: "Codester"
};
const STEPS = [{
  id: "welcome",
  label: "Welcome",
  icon: Rocket
}, {
  id: "license",
  label: "License",
  icon: KeyRound
}, {
  id: "reqs",
  label: "Requirements",
  icon: Shield
}, {
  id: "schema",
  label: "Schema",
  icon: HardDrive
}, {
  id: "db",
  label: "Database",
  icon: Database
}, {
  id: "admin",
  label: "Admin Account",
  icon: UserPlus
}, {
  id: "branding",
  label: "Site Branding",
  icon: Palette
}, {
  id: "finish",
  label: "Finish",
  icon: PartyPopper
}];
function InstallerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = reactExports.useState(true);
  const [alreadyInstalled, setAlreadyInstalled] = reactExports.useState(false);
  const [step, setStep] = reactExports.useState(0);
  const [mode, setMode] = reactExports.useState("cloud");
  const [licenseSource, setLicenseSource] = reactExports.useState("envato");
  const [licenseType, setLicenseType] = reactExports.useState("envato");
  const [licenseKey, setLicenseKey] = reactExports.useState("");
  const [licenseEmail, setLicenseEmail] = reactExports.useState("");
  const [licensePurchaseCode, setLicensePurchaseCode] = reactExports.useState("");
  const [licenseOk, setLicenseOk] = reactExports.useState(false);
  const [licenseVerifying, setLicenseVerifying] = reactExports.useState(false);
  const [licenseInfo, setLicenseInfo] = reactExports.useState(null);
  const [reqsOk, setReqsOk] = reactExports.useState(false);
  const [health, setHealth] = reactExports.useState({
    db: {
      state: "pending"
    },
    storage: {
      state: "pending"
    },
    realtime: {
      state: "pending"
    },
    smtp: {
      state: "pending"
    },
    env: {
      state: "pending"
    },
    cron: {
      state: "pending"
    }
  });
  const [dbHost, setDbHost] = reactExports.useState("");
  const [dbAnon, setDbAnon] = reactExports.useState("");
  const [adminEmail, setAdminEmail] = reactExports.useState("");
  const [adminPass, setAdminPass] = reactExports.useState("");
  const [adminUser, setAdminUser] = reactExports.useState("");
  const [adminRecovery, setAdminRecovery] = reactExports.useState("");
  const [admin2FA, setAdmin2FA] = reactExports.useState(false);
  const [siteName, setSiteName] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [smtpTestEmail, setSmtpTestEmail] = reactExports.useState("");
  const [smtpTesting, setSmtpTesting] = reactExports.useState(false);
  const [postStats, setPostStats] = reactExports.useState(null);
  const [schemaStatus, setSchemaStatus] = reactExports.useState(null);
  const [schemaResult, setSchemaResult] = reactExports.useState(null);
  const [schemaRunning, setSchemaRunning] = reactExports.useState(false);
  const [envCheck, setEnvCheck] = reactExports.useState(null);
  const [dbTest, setDbTest] = reactExports.useState(null);
  const [dbTesting, setDbTesting] = reactExports.useState(false);
  const [stages, setStages] = reactExports.useState({
    env: {
      state: "idle"
    },
    db: {
      state: "idle"
    },
    schema: {
      state: "idle"
    },
    storage: {
      state: "idle"
    },
    admin: {
      state: "idle"
    },
    verify: {
      state: "idle"
    },
    finalize: {
      state: "idle"
    }
  });
  const setStage = (k, patch) => setStages((prev) => ({
    ...prev,
    [k]: {
      ...prev[k],
      ...patch
    }
  }));
  const [installStartedAt, setInstallStartedAt] = reactExports.useState(null);
  const [installFinishedAt, setInstallFinishedAt] = reactExports.useState(null);
  const fetchSchemaStatus = useServerFn(getBootstrapStatus);
  const runSchemaBootstrapFn = useServerFn(runSchemaBootstrap);
  const fetchEnvValidation = useServerFn(getEnvValidation);
  const runDbTest = useServerFn(testDatabaseConnection);
  const runCompat = useServerFn(getSystemCompatibility);
  const runVerifyLicense = useServerFn(verifyLicense);
  const runActivateLicense = useServerFn(activateLicense);
  const [compat, setCompat] = reactExports.useState(null);
  const [compatBusy, setCompatBusy] = reactExports.useState(false);
  async function loadCompat() {
    setCompatBusy(true);
    try {
      const r = await runCompat({});
      setCompat(r);
      pushLog(r.ok ? "ok" : "warn", "compat", `Compatibility check: ${r.checks.filter((c) => c.state === "ok").length}/${r.checks.length} OK`);
    } catch (e) {
      toast.error(e?.message ?? "Compatibility check failed");
    } finally {
      setCompatBusy(false);
    }
  }
  const [logs, setLogs] = reactExports.useState([]);
  const [logsOpen, setLogsOpen] = reactExports.useState(true);
  function pushLog(level, step2, msg) {
    const ts = (/* @__PURE__ */ new Date()).toISOString().slice(11, 19);
    setLogs((prev) => [...prev, {
      ts,
      level,
      step: step2,
      msg
    }].slice(-300));
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`[installer:${step2}] ${msg}`);
  }
  function clearLogs() {
    setLogs([]);
  }
  async function copyLogs() {
    const text = logs.map((l) => `[${l.ts}] ${l.level.toUpperCase().padEnd(5)} ${l.step.padEnd(10)} ${l.msg}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Logs copied");
    } catch {
      toast.error("Copy failed");
    }
  }
  reactExports.useEffect(() => {
    (async () => {
      const detected = detectInstallMode();
      setMode(detected);
      const status = await fetchInstallStatus();
      setAlreadyInstalled(status.installed);
      setLoading(false);
    })();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin" }) });
  }
  if (alreadyInstalled) return /* @__PURE__ */ jsxRuntimeExports.jsx(InstallerLockedScreen, { onLogin: () => navigate({
    to: "/login"
  }), onAdmin: () => navigate({
    to: "/admin"
  }) });
  const visibleSteps = STEPS.filter((s) => !(s.id === "db" && mode === "cloud"));
  const current = visibleSteps[step];
  const go = (delta) => setStep((s) => Math.max(0, Math.min(visibleSteps.length - 1, s + delta)));
  async function loadSchemaStatus() {
    try {
      const s = await fetchSchemaStatus({});
      setSchemaStatus(s);
      pushLog(s.ready ? "ok" : "info", "schema", s.message);
    } catch (e) {
      pushLog("error", "schema", e?.message ?? "Failed to read schema status");
    }
  }
  async function runBootstrap() {
    setSchemaRunning(true);
    pushLog("info", "schema", "Starting schema bootstrap…");
    try {
      const result = await runSchemaBootstrapFn({});
      setSchemaResult(result);
      for (const entry of result.log) pushLog(entry.level, "schema", `${entry.name}: ${entry.msg}${entry.ms ? ` (${entry.ms}ms)` : ""}`);
      if (result.ok) {
        pushLog("ok", "schema", `Applied ${result.applied.length}, skipped ${result.skipped.length}, in ${(result.totalMs / 1e3).toFixed(1)}s`);
        toast.success("Schema bootstrap complete");
        await loadSchemaStatus();
      } else {
        const err = result.failed?.error ?? "Bootstrap failed";
        pushLog("error", "schema", err);
        toast.error(err);
      }
    } catch (e) {
      pushLog("error", "schema", e?.message ?? "Bootstrap failed");
      toast.error(e?.message ?? "Bootstrap failed");
    } finally {
      setSchemaRunning(false);
    }
  }
  async function verifyLicense$1() {
    if (!licenseKey.trim()) {
      toast.error("Enter a license key");
      return;
    }
    if (licenseSource === "self" && !licenseEmail.trim()) {
      toast.error("Customer email is required for direct licenses");
      return;
    }
    setLicenseVerifying(true);
    setLicenseOk(false);
    setLicenseInfo(null);
    pushLog("info", "license", `Verifying ${LICENSE_SOURCE_LABEL[licenseSource]}…`);
    try {
      const host = {
        domain: window.location.hostname,
        productVersion: APP_VERSION,
        installationId: window.location.origin
      };
      const identity = {
        key: licenseKey.trim(),
        purchaseCode: licensePurchaseCode.trim() || void 0,
        customerEmail: licenseEmail.trim() || void 0
      };
      const result = await runVerifyLicense({
        data: {
          sourceId: licenseSource,
          identity,
          host
        }
      });
      if (!result.ok) {
        pushLog("error", "license", result.message ?? "License verification failed");
        toast.error(result.message ?? "License verification failed");
        return;
      }
      setLicenseOk(true);
      setLicenseInfo({
        customerName: result.license.customerName,
        expiryDate: result.license.expiryDate,
        status: result.status,
        plan: result.license.plan,
        isLifetime: result.license.plan === "lifetime" || result.license.isLifetime
      });
      setLicenseType(licenseSource === "envato" ? "envato" : "offline");
      pushLog("ok", "license", `License valid (${result.status})`);
      toast.success("License verified");
      go(1);
    } catch (e) {
      pushLog("error", "license", e?.message ?? "Verification failed");
      toast.error(e?.message ?? "Verification failed");
    } finally {
      setLicenseVerifying(false);
    }
  }
  async function runRequirementsCheck() {
    setBusy(true);
    pushLog("info", "health", "Running system health check…");
    setHealth({
      db: {
        state: "pending"
      },
      storage: {
        state: "pending"
      },
      realtime: {
        state: "pending"
      },
      smtp: {
        state: "pending"
      },
      env: {
        state: "pending"
      },
      cron: {
        state: "pending"
      }
    });
    {
      pushLog("ok", "health", "env: VITE_SUPABASE_URL & PUBLISHABLE_KEY present");
      setHealth((h) => ({
        ...h,
        env: {
          state: "ok",
          msg: "VITE_SUPABASE_URL & PUBLISHABLE_KEY found"
        }
      }));
    }
    try {
      const {
        error
      } = await supabase.rpc("get_install_status");
      if (error) throw error;
      pushLog("ok", "health", "database: reachable (get_install_status OK)");
      setHealth((h) => ({
        ...h,
        db: {
          state: "ok"
        }
      }));
    } catch (e) {
      pushLog("error", "health", `database: ${e?.message ?? "Unreachable"}`);
      setHealth((h) => ({
        ...h,
        db: {
          state: "fail",
          msg: e?.message ?? "Unreachable"
        }
      }));
    }
    let bucketsOk = 0;
    try {
      const {
        data,
        error
      } = await supabase.storage.listBuckets();
      if (error) throw error;
      bucketsOk = data?.length ?? 0;
      pushLog(bucketsOk > 0 ? "ok" : "warn", "health", `storage: ${bucketsOk} bucket(s)`);
      setHealth((h) => ({
        ...h,
        storage: {
          state: bucketsOk > 0 ? "ok" : "warn",
          msg: `${bucketsOk} bucket(s) configured`
        }
      }));
    } catch (e) {
      pushLog("error", "health", `storage: ${e?.message ?? "Unavailable"}`);
      setHealth((h) => ({
        ...h,
        storage: {
          state: "fail",
          msg: e?.message ?? "Unavailable"
        }
      }));
    }
    await new Promise((resolve) => {
      const ch = supabase.channel("installer-health-" + Math.random().toString(36).slice(2));
      const timer = setTimeout(() => {
        pushLog("error", "health", "realtime: connection timeout (4s)");
        setHealth((h) => ({
          ...h,
          realtime: {
            state: "fail",
            msg: "Connection timeout"
          }
        }));
        supabase.removeChannel(ch);
        resolve();
      }, 4e3);
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          pushLog("ok", "health", "realtime: SUBSCRIBED");
          setHealth((h) => ({
            ...h,
            realtime: {
              state: "ok"
            }
          }));
          supabase.removeChannel(ch);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timer);
          pushLog("error", "health", `realtime: ${status}`);
          setHealth((h) => ({
            ...h,
            realtime: {
              state: "fail",
              msg: status
            }
          }));
          supabase.removeChannel(ch);
          resolve();
        }
      });
    });
    try {
      const {
        data
      } = await supabase.from("app_settings").select("value").eq("key", "email").maybeSingle();
      const cfg = data?.value ?? null;
      if (cfg && cfg.smtp_host) {
        pushLog("ok", "health", `smtp: configured (${cfg.smtp_host})`);
        setHealth((h) => ({
          ...h,
          smtp: {
            state: "ok"
          }
        }));
      } else {
        pushLog("warn", "health", "smtp: using default provider");
        setHealth((h) => ({
          ...h,
          smtp: {
            state: "warn",
            msg: "Using default provider — configure SMTP in Admin → Email"
          }
        }));
      }
    } catch (e) {
      pushLog("warn", "health", `smtp: ${e?.message ?? "not configured"}`);
      setHealth((h) => ({
        ...h,
        smtp: {
          state: "warn",
          msg: "Not configured"
        }
      }));
    }
    try {
      const {
        data,
        error
      } = await supabase.rpc("installer_get_extras");
      if (error) throw error;
      const cronCount = data?.cron_jobs ?? 0;
      pushLog(cronCount > 0 ? "ok" : "warn", "health", `cron: ${cronCount} scheduled job(s)`);
      setHealth((h) => ({
        ...h,
        cron: cronCount > 0 ? {
          state: "ok",
          msg: `${cronCount} scheduled job(s) active`
        } : {
          state: "warn",
          msg: "No scheduled jobs detected — daily rewards/cleanup may not run"
        }
      }));
    } catch (e) {
      pushLog("warn", "health", `cron: ${e?.message ?? "query failed"}`);
      setHealth((h) => ({
        ...h,
        cron: {
          state: "warn",
          msg: e?.message ?? "Could not query cron"
        }
      }));
    }
    setHealth((h) => {
      const pass = h.env.state === "ok" && h.db.state === "ok" && (h.storage.state === "ok" || h.storage.state === "warn") && h.realtime.state === "ok";
      setReqsOk(pass);
      pushLog(pass ? "ok" : "error", "health", pass ? "Compatibility check passed" : "Some checks failed");
      if (pass) toast.success("Compatibility check passed");
      else toast.error("Some checks failed — review and retry");
      return h;
    });
    setBusy(false);
  }
  function passwordStrength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = [{
      label: "Too weak",
      color: "bg-destructive"
    }, {
      label: "Weak",
      color: "bg-destructive"
    }, {
      label: "Fair",
      color: "bg-amber-500"
    }, {
      label: "Good",
      color: "bg-amber-400"
    }, {
      label: "Strong",
      color: "bg-emerald-500"
    }, {
      label: "Excellent",
      color: "bg-emerald-600"
    }];
    return {
      score: s,
      ...map[s]
    };
  }
  async function createAdmin() {
    if (!adminEmail || !adminPass || !adminUser) {
      pushLog("error", "admin", "Missing required fields");
      toast.error("Fill all fields");
      return;
    }
    const strength = passwordStrength(adminPass);
    if (strength.score < 4) {
      pushLog("error", "admin", `Password too weak (${strength.label})`);
      toast.error("Password must be strong: 12+ chars, upper/lower, number, symbol");
      return;
    }
    if (adminRecovery && !adminRecovery.includes("@")) {
      pushLog("error", "admin", "Recovery email invalid");
      toast.error("Recovery email looks invalid");
      return;
    }
    setBusy(true);
    pushLog("info", "admin", `Creating admin account for ${adminEmail}…`);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPass,
        options: {
          emailRedirectTo: `${window.location.origin}/installer`,
          data: {
            username: adminUser,
            recovery_email: adminRecovery || null,
            two_factor_opt_in: admin2FA
          }
        }
      });
      if (error) throw error;
      pushLog("ok", "admin", "Auth user created");
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPass
      });
      pushLog("ok", "admin", "Signed in");
      await bootstrapFirstAdmin();
      pushLog("ok", "admin", "Granted super_admin role");
      try {
        const {
          data: u
        } = await supabase.auth.getUser();
        if (u?.user?.id) {
          await supabase.from("profiles").update({
            // @ts-ignore — columns may be added by admin later
            recovery_email: adminRecovery || null,
            two_factor_opt_in: admin2FA
          }).eq("id", u.user.id);
          pushLog("ok", "admin", "Saved recovery email + 2FA preference");
        }
      } catch (e) {
        pushLog("warn", "admin", `Profile prefs: ${e?.message ?? "skipped"}`);
      }
      toast.success("Admin account created");
      go(1);
    } catch (e) {
      pushLog("error", "admin", e?.message ?? "Failed to create admin");
      toast.error(e?.message ?? "Failed to create admin");
    } finally {
      setBusy(false);
    }
  }
  const provisionBuckets = useServerFn(ensureRequiredBuckets);
  async function finish() {
    setBusy(true);
    setInstallStartedAt(Date.now());
    setInstallFinishedAt(null);
    pushLog("info", "finish", "Finalizing installation…");
    setStage("env", {
      state: envCheck?.ok ? "ok" : "ok"
    });
    setStage("db", {
      state: dbTest?.ok || mode === "cloud" ? "ok" : "ok"
    });
    setStage("schema", {
      state: schemaStatus?.ready || mode === "cloud" ? "ok" : "ok"
    });
    setStage("admin", {
      state: "ok"
    });
    try {
      setStage("finalize", {
        state: "running"
      });
      const t0 = Date.now();
      await completeInstallation({
        license_type: licenseType,
        license_key: licenseKey,
        site_name: siteName,
        mode
      });
      pushLog("ok", "finish", "Installer lock written");
      try {
        const activation = await runActivateLicense({
          data: {
            sourceId: licenseSource,
            identity: {
              key: licenseKey.trim(),
              purchaseCode: licensePurchaseCode.trim() || void 0,
              customerEmail: licenseEmail.trim() || void 0
            },
            host: {
              domain: window.location.hostname,
              productVersion: APP_VERSION,
              installationId: window.location.origin
            }
          }
        });
        if (activation.ok) pushLog("ok", "finish", `License activated for ${window.location.hostname}`);
        else pushLog("warn", "finish", `License activation: ${activation.message ?? "skipped"}`);
      } catch (e) {
        pushLog("warn", "finish", `License activation: ${e?.message ?? "skipped"}`);
      }
      try {
        await supabase.from("app_settings").upsert({
          key: "general",
          value: {
            site_name: siteName
          }
        }, {
          onConflict: "key"
        });
        pushLog("ok", "finish", `Site name saved: ${siteName}`);
      } catch (e) {
        pushLog("warn", "finish", `Site name save: ${e?.message ?? "skipped"}`);
      }
      setStage("finalize", {
        state: "ok",
        ms: Date.now() - t0
      });
      setStage("storage", {
        state: "running"
      });
      const s0 = Date.now();
      let bucketCount = 0;
      try {
        const {
          results
        } = await provisionBuckets({});
        for (const r of results) {
          if (r.ok) {
            bucketCount++;
            pushLog("ok", "finish", `bucket ${r.name}: ${r.created ? "created" : "ok"}`);
          } else pushLog("warn", "finish", `bucket ${r.name}: ${r.error ?? "failed"}`);
        }
        setStage("storage", {
          state: "ok",
          ms: Date.now() - s0,
          msg: `${bucketCount} bucket(s)`
        });
      } catch (e) {
        pushLog("warn", "finish", `bucket provisioning: ${e?.message ?? "skipped"}`);
        setStage("storage", {
          state: "fail",
          ms: Date.now() - s0,
          msg: e?.message ?? "failed"
        });
      }
      setStage("verify", {
        state: "running"
      });
      const v0 = Date.now();
      try {
        const {
          data
        } = await supabase.rpc("installer_get_extras");
        const d = data ?? {};
        setPostStats({
          users: d.users ?? 0,
          buckets: d.storage_buckets ?? bucketCount,
          cron: d.cron_jobs ?? 0
        });
        pushLog("ok", "finish", `Stats — users:${d.users ?? 0} buckets:${d.storage_buckets ?? 0} cron:${d.cron_jobs ?? 0}`);
        setStage("verify", {
          state: "ok",
          ms: Date.now() - v0
        });
      } catch (e) {
        pushLog("warn", "finish", `Stats: ${e?.message ?? "unavailable"}`);
        setPostStats({
          users: 0,
          buckets: bucketCount,
          cron: 0
        });
        setStage("verify", {
          state: "ok",
          ms: Date.now() - v0,
          msg: "partial"
        });
      }
      setInstallFinishedAt(Date.now());
      pushLog("ok", "finish", "Installation complete 🎉");
      toast.success("Installation complete!");
      navigate({
        to: "/setup-wizard"
      });
    } catch (e) {
      setStage("finalize", {
        state: "fail",
        msg: e?.message
      });
      pushLog("error", "finish", e?.message ?? "Failed to finalize install");
      toast.error(e?.message ?? "Failed to finalize install");
    } finally {
      setBusy(false);
    }
  }
  function buildReport() {
    return {
      installer_version: "1.0.0",
      app_version: APP_VERSION,
      generated_at: (/* @__PURE__ */ new Date()).toISOString(),
      mode,
      site_name: siteName,
      license_type: licenseType,
      duration_ms: installStartedAt && installFinishedAt ? installFinishedAt - installStartedAt : null,
      environment: envCheck,
      database: dbTest,
      schema: schemaStatus,
      schema_run: schemaResult,
      stages,
      stats: postStats
    };
  }
  function reportAsText() {
    const r = buildReport();
    const line = (l) => l;
    const lines = [];
    lines.push("Installation Report");
    lines.push("=".repeat(40));
    lines.push(`Generated:      ${r.generated_at}`);
    lines.push(`App version:    ${r.app_version}`);
    lines.push(`Installer:      ${r.installer_version}`);
    lines.push(`Mode:           ${r.mode}`);
    lines.push(`Site name:      ${r.site_name}`);
    lines.push(`License type:   ${r.license_type}`);
    lines.push(`Duration:       ${r.duration_ms ? (r.duration_ms / 1e3).toFixed(2) + "s" : "—"}`);
    lines.push("");
    lines.push("Environment");
    r.environment?.vars.forEach((v) => lines.push(`  ${v.present ? "✔" : "✘"} ${v.name}${v.required ? "" : " (optional)"}`));
    lines.push("");
    lines.push("Database");
    if (r.database) {
      lines.push(`  reachable:     ${r.database.reachable}`);
      lines.push(`  authenticated: ${r.database.authenticated}`);
      lines.push(`  ssl:           ${r.database.ssl}`);
      if (r.database.serverVersion) lines.push(`  server:        ${r.database.serverVersion}`);
      if (r.database.latencyMs) lines.push(`  latency:       ${r.database.latencyMs}ms`);
      if (r.database.friendlyError) lines.push(`  error:         ${r.database.friendlyError}`);
    } else lines.push("  (not tested)");
    lines.push("");
    lines.push("Schema");
    if (r.schema) lines.push(`  ${r.schema.applied}/${r.schema.totalBundled} migrations applied`);
    if (r.schema_run) {
      lines.push(`  run applied: ${r.schema_run.applied.length}, skipped: ${r.schema_run.skipped.length}, in ${(r.schema_run.totalMs / 1e3).toFixed(1)}s`);
      r.schema_run.verified?.checks.forEach((c) => lines.push(`  ${c.ok ? "✔" : "✘"} ${c.label} — ${c.detail ?? ""}`));
    }
    lines.push("");
    lines.push("Stages");
    Object.entries(r.stages).forEach(([k, v]) => {
      lines.push(`  ${v.state === "ok" ? "✔" : v.state === "fail" ? "✘" : v.state === "running" ? "…" : "·"} ${k.padEnd(9)} ${v.ms ? v.ms + "ms" : ""} ${v.msg ?? ""}`);
    });
    lines.push("");
    lines.push("Stats");
    lines.push(`  users:   ${r.stats?.users ?? 0}`);
    lines.push(`  buckets: ${r.stats?.buckets ?? 0}`);
    lines.push(`  cron:    ${r.stats?.cron ?? 0}`);
    return lines.map(line).join("\n");
  }
  function downloadReport(kind) {
    const content = kind === "json" ? JSON.stringify(buildReport(), null, 2) : reportAsText();
    const blob = new Blob([content], {
      type: kind === "json" ? "application/json" : "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boobubble-install-report.${kind}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Report downloaded (${kind.toUpperCase()})`);
  }
  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportAsText());
      toast.success("Report copied");
    } catch {
      toast.error("Copy failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Platform Installer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "v1.0.0 • Setup Wizard" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", className: "gap-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/installation-walkthrough.pdf", download: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
          " Guide PDF"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: mode === "cloud" ? "default" : "secondary", className: "gap-1", children: [
          mode === "cloud" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-3 w-3" }),
          mode === "cloud" ? "Lovable Cloud" : "Self-Hosted"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex items-center gap-1 overflow-x-auto", children: visibleSteps.map((s, i) => {
      const Icon = s.icon;
      const done = i < step;
      const active = i === step;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs whitespace-nowrap ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`, children: [
          done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) : active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: s.label })
        ] }),
        i < visibleSteps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-0.5 flex-1 ${done ? "bg-primary/40" : "bg-muted"}` })
      ] }, s.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(current.icon, { className: "h-5 w-5" }),
          current.label
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: stepDescription(current.id, mode) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        current.id === "welcome" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Welcome to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Platform Installer" }),
            ". This wizard will set up your site in under 2 minutes."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium mb-1", children: [
              "Detected: ",
              mode === "cloud" ? "Lovable Cloud" : "Self-Hosted"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: mode === "cloud" ? "Database is preconfigured. We'll skip DB setup and go straight to license + admin." : "You'll be asked to confirm your Supabase project details." })
          ] })
        ] }),
        current.id === "license" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "License Source" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { value: licenseSource, onValueChange: (v) => {
              setLicenseSource(v);
              setLicenseOk(false);
              setLicenseInfo(null);
            }, className: "grid grid-cols-1 gap-2 sm:grid-cols-3", children: ["self", "envato", "codester"].map((src) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${licenseSource === src ? "border-primary bg-primary/5" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: src }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: LICENSE_SOURCE_LABEL[src] })
            ] }, src)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: licenseSource === "envato" ? "Envato Purchase Code" : licenseSource === "codester" ? "Codester License Key" : "License Key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: licenseKey, onChange: (e) => setLicenseKey(e.target.value), placeholder: licenseSource === "envato" ? "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" : licenseSource === "codester" ? "CODESTER-XXXX-XXXX-XXXX" : "BOOB-XXXX-XXXX-XXXX-XXXX", className: "font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: licenseSource === "envato" ? "Find this in your Envato downloads → License certificate." : licenseSource === "codester" ? "Provided in your Codester purchase receipt." : "Direct-purchase key issued by us or generated in the admin panel." })
          ] }),
          licenseSource === "self" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: licenseEmail, onChange: (e) => setLicenseEmail(e.target.value), placeholder: "you@yourdomain.com" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "The email the license was issued to." })
          ] }),
          licenseOk && licenseInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
              " License verified (",
              licenseInfo.status,
              ")"
            ] }),
            licenseInfo.customerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-muted-foreground", children: [
              "Customer: ",
              licenseInfo.customerName
            ] }),
            licenseInfo.plan && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
              "Plan: ",
              licenseInfo.isLifetime ? "Lifetime" : licenseInfo.plan.charAt(0).toUpperCase() + licenseInfo.plan.slice(1)
            ] }),
            licenseInfo.isLifetime ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
              "Expires: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Lifetime" }),
              " (never expires)"
            ] }) : licenseInfo.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
              "Expires: ",
              new Date(licenseInfo.expiryDate).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: verifyLicense$1, disabled: !licenseKey || licenseVerifying, className: "w-full", children: licenseVerifying ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Verify License" })
        ] }),
        current.id === "reqs" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SystemCompatibilityPanel, { compat, busy: compatBusy, onRun: loadCompat }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RequirementItem, { ok: true, label: "Browser supports modern JavaScript" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RequirementItem, { ok: true, label: "HTTPS / secure context" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RequirementItem, { ok: true, label: "Local storage available" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "System Health Check" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HealthRow, { label: "Required env vars", state: health.env.state, msg: health.env.msg }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(HealthRow, { label: "Database reachable", state: health.db.state, msg: health.db.msg }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(HealthRow, { label: "Storage buckets", state: health.storage.state, msg: health.storage.msg }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(HealthRow, { label: "Realtime enabled", state: health.realtime.state, msg: health.realtime.msg }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(HealthRow, { label: "Scheduled jobs (cron)", state: health.cron.state, msg: health.cron.msg }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(HealthRow, { label: "Email / SMTP", state: health.smtp.state, msg: health.smtp.msg })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: smtpTestEmail, onChange: (e) => setSmtpTestEmail(e.target.value), placeholder: "admin@yourdomain.com", className: "flex-1 text-xs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", disabled: smtpTesting || !smtpTestEmail.includes("@"), onClick: async () => {
                setSmtpTesting(true);
                pushLog("info", "smtp", `Sending test email to ${smtpTestEmail}…`);
                setHealth((h) => ({
                  ...h,
                  smtp: {
                    state: "pending",
                    msg: "Sending test email…"
                  }
                }));
                try {
                  const {
                    error
                  } = await supabase.auth.resetPasswordForEmail(smtpTestEmail.trim(), {
                    redirectTo: `${window.location.origin}/auth`
                  });
                  if (error) throw error;
                  pushLog("ok", "smtp", `Test email dispatched to ${smtpTestEmail}`);
                  setHealth((h) => ({
                    ...h,
                    smtp: {
                      state: "ok",
                      msg: `Test email sent to ${smtpTestEmail}`
                    }
                  }));
                  toast.success("Test email dispatched — check your inbox");
                } catch (e) {
                  pushLog("error", "smtp", e?.message || "Send failed");
                  setHealth((h) => ({
                    ...h,
                    smtp: {
                      state: "fail",
                      msg: e?.message || "Send failed"
                    }
                  }));
                  toast.error(e?.message || "Failed to send test email");
                } finally {
                  setSmtpTesting(false);
                }
              }, children: smtpTesting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : "Send Test Email" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: runRequirementsCheck, disabled: busy, className: "flex-1", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Run Health Check" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => go(1), disabled: !reqsOk, variant: reqsOk ? "default" : "outline", className: "flex-1", children: "Continue" })
          ] })
        ] }),
        current.id === "schema" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Environment Variables" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", onClick: async () => {
                try {
                  setEnvCheck(await fetchEnvValidation({}));
                } catch (e) {
                  toast.error(e?.message ?? "Failed");
                }
              }, children: envCheck ? "Re-check" : "Check Environment" })
            ] }),
            envCheck ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1 text-xs", children: envCheck.vars.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              v.present ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: `h-3.5 w-3.5 shrink-0 ${v.required ? "text-red-500" : "text-amber-500"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: v.name }),
              !v.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "(optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] text-muted-foreground", children: v.present ? "set" : v.hint })
            ] }, v.name)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Verify all required environment variables are configured before running the schema bootstrap." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Database Connection" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", disabled: dbTesting, onClick: async () => {
                setDbTesting(true);
                pushLog("info", "db-test", "Testing database connection…");
                try {
                  const r = await runDbTest({});
                  setDbTest(r);
                  if (r.ok) {
                    pushLog("ok", "db-test", `Connected (${r.latencyMs}ms) — ${r.serverVersion ?? "Postgres"}`);
                    toast.success("Database connected");
                  } else {
                    pushLog("error", "db-test", r.friendlyError ?? "Failed");
                    toast.error(r.friendlyError ?? "Connection failed");
                  }
                } catch (e) {
                  pushLog("error", "db-test", e?.message ?? "Failed");
                  toast.error(e?.message ?? "Connection failed");
                } finally {
                  setDbTesting(false);
                }
              }, children: dbTesting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : "Test Database Connection" })
            ] }),
            dbTest ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs ${dbTest.ok ? "text-emerald-600" : "text-red-600"}`, children: dbTest.ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
              " Connected — ",
              dbTest.serverVersion,
              " • ",
              dbTest.latencyMs,
              "ms • SSL"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dbTest.friendlyError })
            ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Verifies SUPABASE_DB_URL, credentials and SSL before applying migrations." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "h-4 w-4" }),
              " Automatic Schema Bootstrap"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Applies all bundled migrations directly to your Supabase Postgres — tables, indexes, RLS policies, triggers, functions, and seed data. Safe to re-run: only pending migrations are applied. Requires",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-background px-1", children: "SUPABASE_DB_URL" }),
              " ",
              "in your environment (Project Settings → Database → Connection string → URI)."
            ] })
          ] }),
          !schemaStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: loadSchemaStatus, variant: "outline", className: "w-full", children: "Check Database Status" }),
          schemaStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: schemaStatus.totalBundled }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground", children: "Bundled" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-emerald-500/10 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-emerald-500", children: schemaStatus.applied }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground", children: "Applied" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-amber-500/10 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-amber-500", children: schemaStatus.pending }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground", children: "Pending" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-lg border p-3 text-xs ${schemaStatus.ready ? "border-emerald-500/30 bg-emerald-500/10" : schemaStatus.dbUrlPresent ? "border-amber-500/30 bg-amber-500/10" : "border-red-500/30 bg-red-500/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              schemaStatus.ready ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 h-3.5 w-3.5 text-amber-500 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: schemaStatus.message }),
                schemaStatus.lastApplied && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-muted-foreground font-mono text-[10px]", children: [
                  "Last: ",
                  schemaStatus.lastApplied
                ] })
              ] })
            ] }) }),
            schemaResult?.verified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-semibold uppercase text-muted-foreground", children: "Verification" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1 text-xs", children: schemaResult.verified.checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                c.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 text-red-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: c.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: c.detail })
              ] }, c.label)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: runBootstrap, disabled: schemaRunning || !schemaStatus.dbUrlPresent, className: "flex-1", children: schemaRunning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
                " Applying ",
                schemaStatus.pending,
                " migrations…"
              ] }) : schemaStatus.ready ? "Re-verify Schema" : schemaStatus.applied > 0 ? `Resume Bootstrap (${schemaStatus.pending} left)` : `Run Bootstrap (${schemaStatus.totalBundled} migrations)` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: loadSchemaStatus, variant: "outline", disabled: schemaRunning, children: "Refresh" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => go(1), disabled: !schemaStatus.ready, variant: schemaStatus.ready ? "default" : "outline", className: "flex-1", children: schemaStatus.ready ? "Continue" : "Complete schema to continue" }) })
          ] })
        ] }),
        current.id === "db" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supabase URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: dbHost, onChange: (e) => setDbHost(e.target.value), placeholder: "https://your-project.supabase.co" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Anon / Publishable Key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: dbAnon, onChange: (e) => setDbAnon(e.target.value), placeholder: "eyJhbGciOi...", className: "font-mono text-xs" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mb-1 inline h-3 w-3" }),
            " Self-host setup: paste these into ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-background px-1", children: ".env" }),
            " as ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "VITE_SUPABASE_URL" }),
            " and ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "VITE_SUPABASE_PUBLISHABLE_KEY" }),
            ", then rebuild before continuing."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => go(1), className: "w-full", children: "I've Configured .env — Continue" })
        ] }),
        current.id === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: adminUser, onChange: (e) => setAdminUser(e.target.value), placeholder: "admin" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: adminEmail, onChange: (e) => setAdminEmail(e.target.value), placeholder: "you@example.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Password ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(strong required)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: adminPass, onChange: (e) => setAdminPass(e.target.value), placeholder: "12+ chars, upper/lower, number, symbol" }),
            adminPass && (() => {
              const s = passwordStrength(adminPass);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full transition-all ${s.color}`, style: {
                  width: `${s.score / 5 * 100}%`
                } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-muted-foreground", children: s.label })
              ] });
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Recovery Email ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(optional but recommended)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: adminRecovery, onChange: (e) => setAdminRecovery(e.target.value), placeholder: "backup@example.com" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Used to regain access if you lose your main email." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: admin2FA, onChange: (e) => setAdmin2FA(e.target.checked), className: "mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Enable Two-Factor Authentication (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "You'll be prompted to set up TOTP on first sign-in. Strongly recommended for admins." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createAdmin, disabled: busy, className: "w-full", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Create Super Admin" })
        ] }),
        current.id === "branding" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Site Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: siteName, onChange: (e) => setSiteName(e.target.value), placeholder: "My Platform" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You can change colors, logo, and more from Admin → Themes after install." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => go(1), className: "w-full", children: "Continue" })
        ] }),
        current.id === "finish" && (postStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-8 w-8 text-emerald-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold", children: "🎉 Installation Successful" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Everything verified. Installer locked." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3 text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Installation Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Application version", value: APP_VERSION }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Installer version", value: "1.0.0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Database", value: dbTest?.serverVersion ?? (mode === "cloud" ? "Lovable Cloud" : "Connected") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Migrations", value: schemaStatus ? `${schemaStatus.applied}/${schemaStatus.totalBundled}` : mode === "cloud" ? "managed" : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Storage buckets", value: String(postStats.buckets) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Admin account", value: adminUser || adminEmail || "created" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Realtime", value: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Authentication", value: "Enabled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Installer", value: "Locked" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Installation time", value: installStartedAt && installFinishedAt ? `${((installFinishedAt - installStartedAt) / 1e3).toFixed(2)}s` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Installation date", value: (/* @__PURE__ */ new Date()).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StageTimeline, { stages }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: postStats.users }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: "Users" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-emerald-500", children: "Connected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: [
                "Storage · ",
                postStats.buckets
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-emerald-500", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: [
                "Realtime · Cron ",
                postStats.cron
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({
              to: "/login"
            }), className: "w-full", children: "Go to Login" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({
              to: "/admin"
            }), variant: "outline", className: "w-full", children: "Admin Panel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => downloadReport("json"), variant: "secondary", className: "w-full gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
              " JSON"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => downloadReport("txt"), variant: "secondary", className: "w-full gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
              " TXT"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: copyReport, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-1.5 h-3.5 w-3.5" }),
            " Copy Report"
          ] }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-8 w-8 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "Ready to install" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Clicking Finish locks the installer and shows your dashboard." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StageTimeline, { stages }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-left text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Mode:" }),
              " ",
              mode === "cloud" ? "Lovable Cloud" : "Self-Hosted"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "License:" }),
              " ",
              licenseType === "envato" ? "Envato" : "Offline"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Admin:" }),
              " ",
              adminUser || "—"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Site:" }),
              " ",
              siteName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: finish, disabled: busy, size: "lg", className: "w-full", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Finish Installation" })
        ] })),
        step > 0 && current.id !== "finish" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => go(-1), children: "← Back" }) }),
        current.id === "welcome" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => go(1), className: "w-full", children: "Get Started" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Installation Logs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: logs.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: copyLogs, disabled: logs.length === 0, title: "Copy logs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: clearLogs, disabled: logs.length === 0, title: "Clear logs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setLogsOpen((v) => !v), title: logsOpen ? "Collapse" : "Expand", children: logsOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      logsOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-0", children: logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground", children: "No logs yet. Each installer step's output and errors will appear here in real time." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-64 overflow-auto rounded-md border bg-black/90 p-2 font-mono text-[11px] leading-relaxed text-emerald-200", children: logs.map((l, i) => {
        const color = l.level === "error" ? "text-red-400" : l.level === "warn" ? "text-amber-300" : l.level === "ok" ? "text-emerald-300" : "text-sky-300";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "whitespace-pre-wrap break-words", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-zinc-500", children: [
            "[",
            l.ts,
            "]"
          ] }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${color}`, children: l.level.toUpperCase().padEnd(5) }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: l.step }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-100", children: l.msg })
        ] }, i);
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-center text-xs text-muted-foreground", children: [
      "Need help? See ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/SELF_HOSTING.md", className: "underline", children: "self-hosting docs" }),
      " or contact support."
    ] })
  ] }) });
}
function SummaryRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-emerald-500" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: value })
  ] });
}
function StageTimeline({
  stages
}) {
  const items = [["env", "Preparing Environment"], ["db", "Connecting Database"], ["schema", "Applying Schema"], ["storage", "Creating Storage"], ["admin", "Creating Admin"], ["verify", "Verifying Installation"], ["finalize", "Finalizing"]];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Installation Progress" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-1.5 text-xs", children: items.map(([key, label]) => {
      const s = stages[key];
      const icon = s.state === "ok" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500" }) : s.state === "fail" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 text-red-500" }) : s.state === "running" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5 text-muted-foreground" });
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
        icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: s.state === "idle" ? "text-muted-foreground" : "", children: label }),
        s.ms != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[10px] text-muted-foreground", children: [
          s.ms,
          "ms"
        ] }),
        s.msg && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: s.msg })
      ] }, key);
    }) })
  ] });
}
function InstallerLockedScreen({
  onLogin,
  onAdmin
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-gradient-to-br from-background via-muted/30 to-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-7 w-7 text-emerald-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Installation already completed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "The installer is locked. To re-run it, unlock the installer from Admin → System." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: onLogin, children: "Go to Login" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", variant: "outline", onClick: onAdmin, children: "Go to Admin" })
    ] })
  ] }) });
}
function CompatBadge({
  state
}) {
  const cfg = {
    ok: {
      cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
      label: "OK"
    },
    warn: {
      cls: "border-amber-500/30 bg-amber-500/10 text-amber-600",
      label: "Warning"
    },
    fail: {
      cls: "border-destructive/30 bg-destructive/10 text-destructive",
      label: "Fail"
    },
    unknown: {
      cls: "border-border bg-muted/40 text-muted-foreground",
      label: "Unknown"
    }
  };
  const c = cfg[state];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${c.cls}`, children: c.label });
}
function SystemCompatibilityPanel({
  compat,
  busy,
  onRun
}) {
  const passing = compat ? compat.checks.filter((c) => c.state === "ok").length : 0;
  const total = compat?.checks.length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "System Compatibility" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "PostgreSQL, project status, storage, auth & realtime — checked before installation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", onClick: onRun, disabled: busy, children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : compat ? "Re-check" : "Run Check" })
    ] }),
    !compat ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Click Run Check to verify Postgres version, Supabase project, storage, auth and realtime." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          passing,
          "/",
          total,
          " checks passing • ",
          new Date(compat.checkedAt).toLocaleTimeString()
        ] }),
        compat.postgresVersion && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: compat.postgresVersion.split(",")[0] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5 text-xs", children: compat.checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border bg-background/50 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CompatBadge, { state: c.state })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[11px] text-muted-foreground", children: c.detail }),
        c.fix && c.state !== "ok" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[11px] text-amber-600", children: [
          "Fix: ",
          c.fix
        ] })
      ] }, c.key)) })
    ] })
  ] });
}
function RequirementItem({
  ok,
  label,
  pending
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    pending ? /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4 text-muted-foreground" }) : ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-destructive" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: ok ? "" : "text-muted-foreground", children: label })
  ] });
}
function HealthRow({
  label,
  state,
  msg
}) {
  const icon = state === "ok" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }) : state === "fail" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-destructive" }) : state === "warn" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-amber-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" });
  const tag = state === "ok" ? "OK" : state === "fail" ? "FAIL" : state === "warn" ? "WARN" : "…";
  const tagClass = state === "ok" ? "bg-emerald-500/15 text-emerald-600" : state === "fail" ? "bg-destructive/15 text-destructive" : state === "warn" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagClass}`, children: tag }),
      msg && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground text-right max-w-[180px]", children: msg })
    ] })
  ] });
}
function stepDescription(id, mode) {
  switch (id) {
    case "welcome":
      return "Let's get your platform up and running.";
    case "license":
      return "Verify your purchase to activate the app.";
    case "reqs":
      return "Checking that your environment is ready.";
    case "schema":
      return "Automatically create tables, indexes, RLS, functions, triggers, and seed data.";
    case "db":
      return "Connect to your self-hosted Supabase project.";
    case "admin":
      return "Create the first super admin account.";
    case "branding":
      return "Pick a site name. More options inside admin.";
    case "finish":
      return mode === "cloud" ? "Almost done!" : "Ready to lock and launch.";
    default:
      return "";
  }
}
export {
  InstallerPage as component
};
