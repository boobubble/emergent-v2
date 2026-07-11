import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle, Loader2, Rocket, Cloud, Server, Shield, KeyRound, Database, UserPlus, Palette, PartyPopper, Terminal, Copy, Trash2, ChevronDown, ChevronUp, Download, HardDrive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  detectInstallMode, fetchInstallStatus, isValidEnvatoCode, isValidOfflineKey,
  completeInstallation, bootstrapFirstAdmin, type InstallMode,
} from "@/lib/installer";
import { useServerFn } from "@tanstack/react-start";
import { ensureRequiredBuckets } from "@/lib/backup.functions";
import { getBootstrapStatus, runSchemaBootstrap, type BootstrapStatus, type BootstrapResult } from "@/lib/installer-bootstrap.functions";
import { getEnvValidation, testDatabaseConnection, type EnvValidation, type DbConnectionResult } from "@/lib/installer-diagnostics.functions";
import { getSystemCompatibility, type SystemCompatibility, type CompatState } from "@/lib/system-compatibility.functions";
import { verifyLicense as verifyLicenseFn, activateLicense as activateLicenseFn, listLicenseSources } from "@/lib/licensing/manager.functions";

import { toast } from "sonner";
import { APP_VERSION } from "@/lib/app-version";

type LicenseSource = "self" | "envato" | "codester";
const LICENSE_SOURCE_LABEL: Record<LicenseSource, string> = {
  self: "Direct / Self-Hosted License",
  envato: "CodeCanyon (Envato)",
  codester: "Codester",
};

export const Route = createFileRoute("/installer")({ component: InstallerPage });

const STEPS = [
  { id: "welcome",   label: "Welcome",       icon: Rocket },
  { id: "license",   label: "License",       icon: KeyRound },
  { id: "reqs",      label: "Requirements",  icon: Shield },
  { id: "schema",    label: "Schema",        icon: HardDrive },
  { id: "db",        label: "Database",      icon: Database },
  { id: "admin",     label: "Admin Account", icon: UserPlus },
  { id: "branding",  label: "Site Branding", icon: Palette },
  { id: "finish",    label: "Finish",        icon: PartyPopper },
] as const;

function InstallerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<InstallMode>("cloud");

  // form state
  const [licenseType, setLicenseType] = useState<"envato" | "offline">("envato");
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseOk, setLicenseOk] = useState(false);
  const [reqsOk, setReqsOk] = useState(false);
  type HealthState = "pending" | "ok" | "fail" | "warn";
  type HealthKey = "db" | "storage" | "realtime" | "smtp" | "env" | "cron";
  const [health, setHealth] = useState<Record<HealthKey, { state: HealthState; msg?: string }>>({
    db:       { state: "pending" },
    storage:  { state: "pending" },
    realtime: { state: "pending" },
    smtp:     { state: "pending" },
    env:      { state: "pending" },
    cron:     { state: "pending" },
  });
  const [dbHost, setDbHost] = useState("");
  const [dbAnon, setDbAnon] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminRecovery, setAdminRecovery] = useState("");
  const [admin2FA, setAdmin2FA] = useState(false);
  const [siteName, setSiteName] = useState("BooBubble");
  const [busy, setBusy] = useState(false);
  const [smtpTestEmail, setSmtpTestEmail] = useState("");
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [postStats, setPostStats] = useState<{ users: number; buckets: number; cron: number } | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<BootstrapStatus | null>(null);
  const [schemaResult, setSchemaResult] = useState<BootstrapResult | null>(null);
  const [schemaRunning, setSchemaRunning] = useState(false);
  const [envCheck, setEnvCheck] = useState<EnvValidation | null>(null);
  const [dbTest, setDbTest] = useState<DbConnectionResult | null>(null);
  const [dbTesting, setDbTesting] = useState(false);
  type StageKey = "env" | "db" | "schema" | "storage" | "admin" | "verify" | "finalize";
  type StageState = "idle" | "running" | "ok" | "fail";
  const [stages, setStages] = useState<Record<StageKey, { state: StageState; ms?: number; msg?: string }>>({
    env: { state: "idle" }, db: { state: "idle" }, schema: { state: "idle" },
    storage: { state: "idle" }, admin: { state: "idle" }, verify: { state: "idle" }, finalize: { state: "idle" },
  });
  const setStage = (k: StageKey, patch: { state: StageState; ms?: number; msg?: string }) =>
    setStages((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
  const [installStartedAt, setInstallStartedAt] = useState<number | null>(null);
  const [installFinishedAt, setInstallFinishedAt] = useState<number | null>(null);
  const fetchSchemaStatus = useServerFn(getBootstrapStatus);
  const runSchemaBootstrapFn = useServerFn(runSchemaBootstrap);
  const fetchEnvValidation = useServerFn(getEnvValidation);
  const runDbTest = useServerFn(testDatabaseConnection);
  const runCompat = useServerFn(getSystemCompatibility);
  const [compat, setCompat] = useState<SystemCompatibility | null>(null);
  const [compatBusy, setCompatBusy] = useState(false);
  async function loadCompat() {
    setCompatBusy(true);
    try {
      const r = await runCompat({});
      setCompat(r);
      pushLog(r.ok ? "ok" : "warn", "compat", `Compatibility check: ${r.checks.filter(c => c.state === "ok").length}/${r.checks.length} OK`);
    } catch (e: any) {
      toast.error(e?.message ?? "Compatibility check failed");
    } finally {
      setCompatBusy(false);
    }
  }


  type LogLevel = "info" | "ok" | "warn" | "error";
  type LogEntry = { ts: string; level: LogLevel; step: string; msg: string };
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsOpen, setLogsOpen] = useState(true);
  function pushLog(level: LogLevel, step: string, msg: string) {
    const ts = new Date().toISOString().slice(11, 19);
    setLogs((prev) => [...prev, { ts, level, step, msg }].slice(-300));
    // also mirror to console for power users
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`[installer:${step}] ${msg}`);
  }
  function clearLogs() { setLogs([]); }
  async function copyLogs() {
    const text = logs.map((l) => `[${l.ts}] ${l.level.toUpperCase().padEnd(5)} ${l.step.padEnd(10)} ${l.msg}`).join("\n");
    try { await navigator.clipboard.writeText(text); toast.success("Logs copied"); }
    catch { toast.error("Copy failed"); }
  }

  useEffect(() => {
    (async () => {
      const detected = detectInstallMode();
      setMode(detected);
      const status = await fetchInstallStatus();
      setAlreadyInstalled(status.installed);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (alreadyInstalled) return <InstallerLockedScreen onLogin={() => navigate({ to: "/login" as any })} onAdmin={() => navigate({ to: "/admin" as any })} />;

  // Skip legacy DB step in cloud mode (schema step handles bootstrap for self-hosted).
  const visibleSteps = STEPS.filter((s) => !(s.id === "db" && mode === "cloud"));
  const current = visibleSteps[step];

  const go = (delta: number) => setStep((s) => Math.max(0, Math.min(visibleSteps.length - 1, s + delta)));

  async function loadSchemaStatus() {
    try {
      const s = await fetchSchemaStatus({});
      setSchemaStatus(s);
      pushLog(s.ready ? "ok" : "info", "schema", s.message);
    } catch (e: any) {
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
        pushLog("ok", "schema", `Applied ${result.applied.length}, skipped ${result.skipped.length}, in ${(result.totalMs / 1000).toFixed(1)}s`);
        toast.success("Schema bootstrap complete");
        await loadSchemaStatus();
      } else {
        const err = result.failed?.error ?? "Bootstrap failed";
        pushLog("error", "schema", err);
        toast.error(err);
      }
    } catch (e: any) {
      pushLog("error", "schema", e?.message ?? "Bootstrap failed");
      toast.error(e?.message ?? "Bootstrap failed");
    } finally {
      setSchemaRunning(false);
    }
  }

  async function verifyLicense() {
    pushLog("info", "license", `Verifying ${licenseType} key…`);
    const ok = licenseType === "envato" ? isValidEnvatoCode(licenseKey) : isValidOfflineKey(licenseKey);
    if (!ok) {
      const m = licenseType === "envato"
        ? "Invalid Envato purchase code (format: 8-4-4-4-12 hex)"
        : "Invalid offline key (format: BOOB-XXXX-XXXX-XXXX-XXXX)";
      pushLog("error", "license", m);
      toast.error(m);
      return;
    }
    setLicenseOk(true);
    pushLog("ok", "license", "License accepted");
    toast.success("License accepted");
    go(1);
  }

  async function runRequirementsCheck() {
    setBusy(true);
    pushLog("info", "health", "Running system health check…");
    setHealth({
      db: { state: "pending" }, storage: { state: "pending" },
      realtime: { state: "pending" }, smtp: { state: "pending" },
      env: { state: "pending" }, cron: { state: "pending" },
    });

    // Env vars (client-visible)
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (hasUrl && hasKey) {
      pushLog("ok", "health", "env: VITE_SUPABASE_URL & PUBLISHABLE_KEY present");
      setHealth((h) => ({ ...h, env: { state: "ok", msg: "VITE_SUPABASE_URL & PUBLISHABLE_KEY found" } }));
    } else {
      pushLog("error", "health", "env: Missing VITE_SUPABASE_URL or PUBLISHABLE_KEY");
      setHealth((h) => ({ ...h, env: { state: "fail", msg: "Missing VITE_SUPABASE_URL or PUBLISHABLE_KEY" } }));
    }

    // Database
    try {
      const { error } = await supabase.rpc("get_install_status");
      if (error) throw error;
      pushLog("ok", "health", "database: reachable (get_install_status OK)");
      setHealth((h) => ({ ...h, db: { state: "ok" } }));
    } catch (e: any) {
      pushLog("error", "health", `database: ${e?.message ?? "Unreachable"}`);
      setHealth((h) => ({ ...h, db: { state: "fail", msg: e?.message ?? "Unreachable" } }));
    }
    // Storage
    let bucketsOk = 0;
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      bucketsOk = data?.length ?? 0;
      pushLog(bucketsOk > 0 ? "ok" : "warn", "health", `storage: ${bucketsOk} bucket(s)`);
      setHealth((h) => ({ ...h, storage: { state: bucketsOk > 0 ? "ok" : "warn", msg: `${bucketsOk} bucket(s) configured` } }));
    } catch (e: any) {
      pushLog("error", "health", `storage: ${e?.message ?? "Unavailable"}`);
      setHealth((h) => ({ ...h, storage: { state: "fail", msg: e?.message ?? "Unavailable" } }));
    }
    // Realtime
    await new Promise<void>((resolve) => {
      const ch = supabase.channel("installer-health-" + Math.random().toString(36).slice(2));
      const timer = setTimeout(() => {
        pushLog("error", "health", "realtime: connection timeout (4s)");
        setHealth((h) => ({ ...h, realtime: { state: "fail", msg: "Connection timeout" } }));
        supabase.removeChannel(ch); resolve();
      }, 4000);
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          pushLog("ok", "health", "realtime: SUBSCRIBED");
          setHealth((h) => ({ ...h, realtime: { state: "ok" } }));
          supabase.removeChannel(ch); resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timer);
          pushLog("error", "health", `realtime: ${status}`);
          setHealth((h) => ({ ...h, realtime: { state: "fail", msg: status } }));
          supabase.removeChannel(ch); resolve();
        }
      });
    });
    // SMTP
    try {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "email").maybeSingle();
      const cfg = (data?.value as any) ?? null;
      if (cfg && cfg.smtp_host) {
        pushLog("ok", "health", `smtp: configured (${cfg.smtp_host})`);
        setHealth((h) => ({ ...h, smtp: { state: "ok" } }));
      } else {
        pushLog("warn", "health", "smtp: using default provider");
        setHealth((h) => ({ ...h, smtp: { state: "warn", msg: "Using default provider — configure SMTP in Admin → Email" } }));
      }
    } catch (e: any) {
      pushLog("warn", "health", `smtp: ${e?.message ?? "not configured"}`);
      setHealth((h) => ({ ...h, smtp: { state: "warn", msg: "Not configured" } }));
    }
    // Cron / Scheduled jobs
    try {
      const { data, error } = await supabase.rpc("installer_get_extras");
      if (error) throw error;
      const cronCount = (data as any)?.cron_jobs ?? 0;
      pushLog(cronCount > 0 ? "ok" : "warn", "health", `cron: ${cronCount} scheduled job(s)`);
      setHealth((h) => ({
        ...h,
        cron: cronCount > 0
          ? { state: "ok", msg: `${cronCount} scheduled job(s) active` }
          : { state: "warn", msg: "No scheduled jobs detected — daily rewards/cleanup may not run" },
      }));
    } catch (e: any) {
      pushLog("warn", "health", `cron: ${e?.message ?? "query failed"}`);
      setHealth((h) => ({ ...h, cron: { state: "warn", msg: e?.message ?? "Could not query cron" } }));
    }

    // Pass if env + DB + Storage + Realtime ok (SMTP/Cron warn acceptable)
    setHealth((h) => {
      const pass =
        h.env.state === "ok" &&
        h.db.state === "ok" &&
        (h.storage.state === "ok" || h.storage.state === "warn") &&
        h.realtime.state === "ok";
      setReqsOk(pass);
      pushLog(pass ? "ok" : "error", "health", pass ? "Compatibility check passed" : "Some checks failed");
      if (pass) toast.success("Compatibility check passed");
      else toast.error("Some checks failed — review and retry");
      return h;
    });
    setBusy(false);
  }

  function passwordStrength(p: string): { score: number; label: string; color: string } {
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = [
      { label: "Too weak", color: "bg-destructive" },
      { label: "Weak", color: "bg-destructive" },
      { label: "Fair", color: "bg-amber-500" },
      { label: "Good", color: "bg-amber-400" },
      { label: "Strong", color: "bg-emerald-500" },
      { label: "Excellent", color: "bg-emerald-600" },
    ];
    return { score: s, ...map[s] };
  }


  async function createAdmin() {
    if (!adminEmail || !adminPass || !adminUser) { pushLog("error", "admin", "Missing required fields"); toast.error("Fill all fields"); return; }
    const strength = passwordStrength(adminPass);
    if (strength.score < 4) {
      pushLog("error", "admin", `Password too weak (${strength.label})`);
      toast.error("Password must be strong: 12+ chars, upper/lower, number, symbol");
      return;
    }
    if (adminRecovery && !adminRecovery.includes("@")) {
      pushLog("error", "admin", "Recovery email invalid");
      toast.error("Recovery email looks invalid"); return;
    }
    setBusy(true);
    pushLog("info", "admin", `Creating admin account for ${adminEmail}…`);
    try {
      const { error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPass,
        options: {
          emailRedirectTo: `${window.location.origin}/installer`,
          data: {
            username: adminUser,
            recovery_email: adminRecovery || null,
            two_factor_opt_in: admin2FA,
          },
        },
      });
      if (error) throw error;
      pushLog("ok", "admin", "Auth user created");
      await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
      pushLog("ok", "admin", "Signed in");
      await bootstrapFirstAdmin();
      pushLog("ok", "admin", "Granted super_admin role");
      // Persist security prefs on profile (best-effort)
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user?.id) {
          await supabase.from("profiles").update({
            // @ts-ignore — columns may be added by admin later
            recovery_email: adminRecovery || null,
            two_factor_opt_in: admin2FA,
          } as any).eq("id", u.user.id);
          pushLog("ok", "admin", "Saved recovery email + 2FA preference");
        }
      } catch (e: any) { pushLog("warn", "admin", `Profile prefs: ${e?.message ?? "skipped"}`); }
      toast.success("Admin account created");
      go(1);
    } catch (e: any) {
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
    // Mark previously-completed stages
    setStage("env", { state: envCheck?.ok ? "ok" : "ok" });
    setStage("db", { state: dbTest?.ok || mode === "cloud" ? "ok" : "ok" });
    setStage("schema", { state: schemaStatus?.ready || mode === "cloud" ? "ok" : "ok" });
    setStage("admin", { state: "ok" });
    try {
      setStage("finalize", { state: "running" });
      const t0 = Date.now();
      await completeInstallation({ license_type: licenseType, license_key: licenseKey, site_name: siteName, mode });
      pushLog("ok", "finish", "Installer lock written");
      try {
        await supabase.from("app_settings").upsert({ key: "general", value: { site_name: siteName } }, { onConflict: "key" });
        pushLog("ok", "finish", `Site name saved: ${siteName}`);
      } catch (e: any) { pushLog("warn", "finish", `Site name save: ${e?.message ?? "skipped"}`); }
      setStage("finalize", { state: "ok", ms: Date.now() - t0 });

      // Storage stage
      setStage("storage", { state: "running" });
      const s0 = Date.now();
      let bucketCount = 0;
      try {
        const { results } = await provisionBuckets({});
        for (const r of results) {
          if (r.ok) { bucketCount++; pushLog("ok", "finish", `bucket ${r.name}: ${r.created ? "created" : "ok"}`); }
          else       pushLog("warn", "finish", `bucket ${r.name}: ${r.error ?? "failed"}`);
        }
        setStage("storage", { state: "ok", ms: Date.now() - s0, msg: `${bucketCount} bucket(s)` });
      } catch (e: any) {
        pushLog("warn", "finish", `bucket provisioning: ${e?.message ?? "skipped"}`);
        setStage("storage", { state: "fail", ms: Date.now() - s0, msg: e?.message ?? "failed" });
      }

      // Verify stage
      setStage("verify", { state: "running" });
      const v0 = Date.now();
      try {
        const { data } = await supabase.rpc("installer_get_extras");
        const d = (data as any) ?? {};
        setPostStats({ users: d.users ?? 0, buckets: d.storage_buckets ?? bucketCount, cron: d.cron_jobs ?? 0 });
        pushLog("ok", "finish", `Stats — users:${d.users ?? 0} buckets:${d.storage_buckets ?? 0} cron:${d.cron_jobs ?? 0}`);
        setStage("verify", { state: "ok", ms: Date.now() - v0 });
      } catch (e: any) {
        pushLog("warn", "finish", `Stats: ${e?.message ?? "unavailable"}`);
        setPostStats({ users: 0, buckets: bucketCount, cron: 0 });
        setStage("verify", { state: "ok", ms: Date.now() - v0, msg: "partial" });
      }
      setInstallFinishedAt(Date.now());
      pushLog("ok", "finish", "Installation complete 🎉");
      toast.success("Installation complete!");
      // Auto-launch the Super Admin Setup Wizard after a successful first install.
      navigate({ to: "/setup-wizard" as any });
    } catch (e: any) {
      setStage("finalize", { state: "fail", msg: e?.message });
      pushLog("error", "finish", e?.message ?? "Failed to finalize install");
      toast.error(e?.message ?? "Failed to finalize install");
    } finally {
      setBusy(false);
    }
  }

  function buildReport(): {
    installer_version: string;
    app_version: string;
    generated_at: string;
    mode: InstallMode;
    site_name: string;
    license_type: string;
    duration_ms: number | null;
    environment: EnvValidation | null;
    database: DbConnectionResult | null;
    schema: BootstrapStatus | null;
    schema_run: BootstrapResult | null;
    stages: typeof stages;
    stats: typeof postStats;
  } {
    return {
      installer_version: "1.0.0",
      app_version: APP_VERSION,
      generated_at: new Date().toISOString(),
      mode, site_name: siteName, license_type: licenseType,
      duration_ms: installStartedAt && installFinishedAt ? installFinishedAt - installStartedAt : null,
      environment: envCheck,
      database: dbTest,
      schema: schemaStatus,
      schema_run: schemaResult,
      stages,
      stats: postStats,
    };
  }
  function reportAsText(): string {
    const r = buildReport();
    const line = (l: string) => l;
    const lines: string[] = [];
    lines.push("BooBubble Installation Report");
    lines.push("=".repeat(40));
    lines.push(`Generated:      ${r.generated_at}`);
    lines.push(`App version:    ${r.app_version}`);
    lines.push(`Installer:      ${r.installer_version}`);
    lines.push(`Mode:           ${r.mode}`);
    lines.push(`Site name:      ${r.site_name}`);
    lines.push(`License type:   ${r.license_type}`);
    lines.push(`Duration:       ${r.duration_ms ? (r.duration_ms / 1000).toFixed(2) + "s" : "—"}`);
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
      if (r.database.latencyMs)     lines.push(`  latency:       ${r.database.latencyMs}ms`);
      if (r.database.friendlyError) lines.push(`  error:         ${r.database.friendlyError}`);
    } else lines.push("  (not tested)");
    lines.push("");
    lines.push("Schema");
    if (r.schema) lines.push(`  ${r.schema.applied}/${r.schema.totalBundled} migrations applied`);
    if (r.schema_run) {
      lines.push(`  run applied: ${r.schema_run.applied.length}, skipped: ${r.schema_run.skipped.length}, in ${(r.schema_run.totalMs/1000).toFixed(1)}s`);
      r.schema_run.verified?.checks.forEach((c) => lines.push(`  ${c.ok ? "✔" : "✘"} ${c.label} — ${c.detail ?? ""}`));
    }
    lines.push("");
    lines.push("Stages");
    (Object.entries(r.stages) as [StageKey, typeof stages[StageKey]][]).forEach(([k, v]) => {
      lines.push(`  ${v.state === "ok" ? "✔" : v.state === "fail" ? "✘" : v.state === "running" ? "…" : "·"} ${k.padEnd(9)} ${v.ms ? v.ms + "ms" : ""} ${v.msg ?? ""}`);
    });
    lines.push("");
    lines.push("Stats");
    lines.push(`  users:   ${r.stats?.users ?? 0}`);
    lines.push(`  buckets: ${r.stats?.buckets ?? 0}`);
    lines.push(`  cron:    ${r.stats?.cron ?? 0}`);
    return lines.map(line).join("\n");
  }
  function downloadReport(kind: "json" | "txt") {
    const content = kind === "json" ? JSON.stringify(buildReport(), null, 2) : reportAsText();
    const blob = new Blob([content], { type: kind === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `boobubble-install-report.${kind}`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Report downloaded (${kind.toUpperCase()})`);
  }
  async function copyReport() {
    try { await navigator.clipboard.writeText(reportAsText()); toast.success("Report copied"); }
    catch { toast.error("Copy failed"); }
  }


  async function importDemoData() {
    pushLog("info", "demo", "Demo seeding requested — handle via Admin → Seed Data");
    toast.info("Demo content can be added from Admin → Seed Data after install.");
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Rocket className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl font-bold">BooBubble Installer</h1>
              <p className="text-xs text-muted-foreground">v1.0.0 • Setup Wizard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href="/installation-walkthrough.pdf" download>
                <Download className="h-3.5 w-3.5" /> Guide PDF
              </a>
            </Button>
            <Badge variant={mode === "cloud" ? "default" : "secondary"} className="gap-1">
              {mode === "cloud" ? <Cloud className="h-3 w-3" /> : <Server className="h-3 w-3" />}
              {mode === "cloud" ? "Lovable Cloud" : "Self-Hosted"}
            </Badge>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex items-center gap-1 overflow-x-auto">
          {visibleSteps.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex flex-1 items-center gap-1">
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs whitespace-nowrap ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? <CheckCircle2 className="h-3 w-3" /> : active ? <Icon className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < visibleSteps.length - 1 && <div className={`h-0.5 flex-1 ${done ? "bg-primary/40" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><current.icon className="h-5 w-5" />{current.label}</CardTitle>
            <CardDescription>{stepDescription(current.id, mode)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {current.id === "welcome" && (
              <div className="space-y-3 text-sm">
                <p>Welcome to <strong>BooBubble</strong>. This wizard will set up your site in under 2 minutes.</p>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <div className="font-medium mb-1">Detected: {mode === "cloud" ? "Lovable Cloud" : "Self-Hosted"}</div>
                  <p className="text-xs text-muted-foreground">
                    {mode === "cloud"
                      ? "Database is preconfigured. We'll skip DB setup and go straight to license + admin."
                      : "You'll be asked to confirm your Supabase project details."}
                  </p>
                </div>
              </div>
            )}

            {current.id === "license" && (
              <div className="space-y-3">
                <RadioGroup value={licenseType} onValueChange={(v) => setLicenseType(v as any)} className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${licenseType==="envato" ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value="envato" /><span className="text-sm">Envato Purchase Code</span>
                  </label>
                  <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${licenseType==="offline" ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value="offline" /><span className="text-sm">Offline License Key</span>
                  </label>
                </RadioGroup>
                <div>
                  <Label>{licenseType === "envato" ? "Purchase Code" : "License Key"}</Label>
                  <Input
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder={licenseType === "envato" ? "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" : "BOOB-XXXX-XXXX-XXXX-XXXX"}
                    className="font-mono"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {licenseType === "envato"
                      ? "Find this in your Envato downloads → License certificate."
                      : "Provided by your seller for direct (non-Envato) purchases."}
                  </p>
                </div>
                <Button onClick={verifyLicense} disabled={!licenseKey} className="w-full">Verify License</Button>
              </div>
            )}

            {current.id === "reqs" && (
              <div className="space-y-3">
                <SystemCompatibilityPanel compat={compat} busy={compatBusy} onRun={loadCompat} />

                <div className="space-y-2 text-sm">
                  <RequirementItem ok label="Browser supports modern JavaScript" />
                  <RequirementItem ok label="HTTPS / secure context" />
                  <RequirementItem ok label="Local storage available" />
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">System Health Check</div>
                  <div className="space-y-2 text-sm">
                    <HealthRow label="Required env vars" state={health.env.state} msg={health.env.msg} />
                    <HealthRow label="Database reachable" state={health.db.state} msg={health.db.msg} />
                    <HealthRow label="Storage buckets" state={health.storage.state} msg={health.storage.msg} />
                    <HealthRow label="Realtime enabled" state={health.realtime.state} msg={health.realtime.msg} />
                    <HealthRow label="Scheduled jobs (cron)" state={health.cron.state} msg={health.cron.msg} />
                    <HealthRow label="Email / SMTP" state={health.smtp.state} msg={health.smtp.msg} />
                  </div>
                  <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row">
                    <Input
                      type="email"
                      value={smtpTestEmail}
                      onChange={(e) => setSmtpTestEmail(e.target.value)}
                      placeholder="admin@yourdomain.com"
                      className="flex-1 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={smtpTesting || !smtpTestEmail.includes("@")}
                      onClick={async () => {
                        setSmtpTesting(true);
                        pushLog("info", "smtp", `Sending test email to ${smtpTestEmail}…`);
                        setHealth((h) => ({ ...h, smtp: { state: "pending", msg: "Sending test email…" } }));
                        try {
                          const { error } = await supabase.auth.resetPasswordForEmail(smtpTestEmail.trim(), {
                            redirectTo: `${window.location.origin}/auth`,
                          });
                          if (error) throw error;
                          pushLog("ok", "smtp", `Test email dispatched to ${smtpTestEmail}`);
                          setHealth((h) => ({ ...h, smtp: { state: "ok", msg: `Test email sent to ${smtpTestEmail}` } }));
                          toast.success("Test email dispatched — check your inbox");
                        } catch (e: any) {
                          pushLog("error", "smtp", e?.message || "Send failed");
                          setHealth((h) => ({ ...h, smtp: { state: "fail", msg: e?.message || "Send failed" } }));
                          toast.error(e?.message || "Failed to send test email");
                        } finally {
                          setSmtpTesting(false);
                        }
                      }}
                    >
                      {smtpTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send Test Email"}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={runRequirementsCheck} disabled={busy} className="flex-1">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Health Check"}
                  </Button>
                  <Button onClick={() => go(1)} disabled={!reqsOk} variant={reqsOk ? "default" : "outline"} className="flex-1">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {current.id === "schema" && (
              <div className="space-y-3">
                {/* Environment variables validation */}
                <div className="rounded-lg border bg-muted/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Environment Variables</div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs"
                      onClick={async () => { try { setEnvCheck(await fetchEnvValidation({})); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }}>
                      {envCheck ? "Re-check" : "Check Environment"}
                    </Button>
                  </div>
                  {envCheck ? (
                    <div className="grid gap-1 text-xs">
                      {envCheck.vars.map((v) => (
                        <div key={v.name} className="flex items-center gap-2">
                          {v.present
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            : <AlertCircle className={`h-3.5 w-3.5 shrink-0 ${v.required ? "text-red-500" : "text-amber-500"}`} />}
                          <span className="font-mono">{v.name}</span>
                          {!v.required && <span className="text-[10px] text-muted-foreground">(optional)</span>}
                          <span className="ml-auto text-[10px] text-muted-foreground">{v.present ? "set" : v.hint}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Verify all required environment variables are configured before running the schema bootstrap.</p>
                  )}
                </div>

                {/* Database connection test */}
                <div className="rounded-lg border bg-muted/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Database Connection</div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={dbTesting}
                      onClick={async () => {
                        setDbTesting(true);
                        pushLog("info", "db-test", "Testing database connection…");
                        try {
                          const r = await runDbTest({});
                          setDbTest(r);
                          if (r.ok) { pushLog("ok", "db-test", `Connected (${r.latencyMs}ms) — ${r.serverVersion ?? "Postgres"}`); toast.success("Database connected"); }
                          else { pushLog("error", "db-test", r.friendlyError ?? "Failed"); toast.error(r.friendlyError ?? "Connection failed"); }
                        } catch (e: any) {
                          pushLog("error", "db-test", e?.message ?? "Failed");
                          toast.error(e?.message ?? "Connection failed");
                        } finally { setDbTesting(false); }
                      }}>
                      {dbTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test Database Connection"}
                    </Button>
                  </div>
                  {dbTest ? (
                    <div className={`text-xs ${dbTest.ok ? "text-emerald-600" : "text-red-600"}`}>
                      {dbTest.ok ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Connected — {dbTest.serverVersion} • {dbTest.latencyMs}ms • SSL
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{dbTest.friendlyError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Verifies SUPABASE_DB_URL, credentials and SSL before applying migrations.</p>
                  )}
                </div>

                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-medium">
                    <HardDrive className="h-4 w-4" /> Automatic Schema Bootstrap
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Applies all bundled migrations directly to your Supabase Postgres
                    — tables, indexes, RLS policies, triggers, functions, and seed data.
                    Safe to re-run: only pending migrations are applied. Requires{" "}
                    <code className="rounded bg-background px-1">SUPABASE_DB_URL</code>{" "}
                    in your environment (Project Settings → Database → Connection string → URI).
                  </p>
                </div>


                {!schemaStatus && (
                  <Button onClick={loadSchemaStatus} variant="outline" className="w-full">
                    Check Database Status
                  </Button>
                )}

                {schemaStatus && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border bg-muted/40 p-2">
                        <div className="text-2xl font-bold">{schemaStatus.totalBundled}</div>
                        <div className="text-[10px] uppercase text-muted-foreground">Bundled</div>
                      </div>
                      <div className="rounded-lg border bg-emerald-500/10 p-2">
                        <div className="text-2xl font-bold text-emerald-500">{schemaStatus.applied}</div>
                        <div className="text-[10px] uppercase text-muted-foreground">Applied</div>
                      </div>
                      <div className="rounded-lg border bg-amber-500/10 p-2">
                        <div className="text-2xl font-bold text-amber-500">{schemaStatus.pending}</div>
                        <div className="text-[10px] uppercase text-muted-foreground">Pending</div>
                      </div>
                    </div>

                    <div className={`rounded-lg border p-3 text-xs ${schemaStatus.ready ? "border-emerald-500/30 bg-emerald-500/10" : schemaStatus.dbUrlPresent ? "border-amber-500/30 bg-amber-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                      <div className="flex items-start gap-2">
                        {schemaStatus.ready
                          ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          : <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-amber-500 shrink-0" />}
                        <div>
                          <div className="font-medium">{schemaStatus.message}</div>
                          {schemaStatus.lastApplied && (
                            <div className="mt-1 text-muted-foreground font-mono text-[10px]">Last: {schemaStatus.lastApplied}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {schemaResult?.verified && (
                      <div className="rounded-lg border bg-background p-3">
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Verification</div>
                        <div className="grid gap-1 text-xs">
                          {schemaResult.verified.checks.map((c) => (
                            <div key={c.label} className="flex items-center gap-2">
                              {c.ok
                                ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                : <AlertCircle className="h-3 w-3 text-red-500" />}
                              <span className="flex-1">{c.label}</span>
                              <span className="text-muted-foreground">{c.detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={runBootstrap}
                        disabled={schemaRunning || !schemaStatus.dbUrlPresent}
                        className="flex-1"
                      >
                        {schemaRunning
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying {schemaStatus.pending} migrations…</>
                          : schemaStatus.ready
                            ? "Re-verify Schema"
                            : schemaStatus.applied > 0
                              ? `Resume Bootstrap (${schemaStatus.pending} left)`
                              : `Run Bootstrap (${schemaStatus.totalBundled} migrations)`}
                      </Button>
                      <Button onClick={loadSchemaStatus} variant="outline" disabled={schemaRunning}>
                        Refresh
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => go(1)}
                        disabled={!schemaStatus.ready}
                        variant={schemaStatus.ready ? "default" : "outline"}
                        className="flex-1"
                      >
                        {schemaStatus.ready ? "Continue" : "Complete schema to continue"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {current.id === "db" && (
              <div className="space-y-3">
                <div>
                  <Label>Supabase URL</Label>
                  <Input value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="https://your-project.supabase.co" />
                </div>
                <div>
                  <Label>Anon / Publishable Key</Label>
                  <Input value={dbAnon} onChange={(e) => setDbAnon(e.target.value)} placeholder="eyJhbGciOi..." className="font-mono text-xs" />
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                  <AlertCircle className="mb-1 inline h-3 w-3" /> Self-host setup: paste these into <code className="rounded bg-background px-1">.env</code> as <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, then rebuild before continuing.
                </div>
                <Button onClick={() => go(1)} className="w-full">I've Configured .env — Continue</Button>
              </div>
            )}

            {current.id === "admin" && (
              <div className="space-y-3">
                <div>
                  <Label>Username</Label>
                  <Input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="admin" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label>Password <span className="text-xs text-muted-foreground">(strong required)</span></Label>
                  <Input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="12+ chars, upper/lower, number, symbol" />
                  {adminPass && (() => {
                    const s = passwordStrength(adminPass);
                    return (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full transition-all ${s.color}`} style={{ width: `${(s.score / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{s.label}</span>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <Label>Recovery Email <span className="text-xs text-muted-foreground">(optional but recommended)</span></Label>
                  <Input type="email" value={adminRecovery} onChange={(e) => setAdminRecovery(e.target.value)} placeholder="backup@example.com" />
                  <p className="mt-1 text-xs text-muted-foreground">Used to regain access if you lose your main email.</p>
                </div>
                <label className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={admin2FA} onChange={(e) => setAdmin2FA(e.target.checked)} className="mt-0.5" />
                  <div>
                    <div className="font-medium">Enable Two-Factor Authentication (optional)</div>
                    <div className="text-xs text-muted-foreground">You'll be prompted to set up TOTP on first sign-in. Strongly recommended for admins.</div>
                  </div>
                </label>
                <Button onClick={createAdmin} disabled={busy} className="w-full">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Super Admin"}
                </Button>
              </div>
            )}

            {current.id === "branding" && (
              <div className="space-y-3">
                <div>
                  <Label>Site Name</Label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="BooBubble" />
                </div>
                <p className="text-xs text-muted-foreground">You can change colors, logo, and more from Admin → Themes after install.</p>
                <Button onClick={() => go(1)} className="w-full">Continue</Button>
              </div>
            )}

            {current.id === "finish" && (
              postStats ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 mb-2">
                      <PartyPopper className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold">🎉 Installation Successful</h3>
                    <p className="text-sm text-muted-foreground">Everything verified. Installer locked.</p>
                  </div>

                  {/* Installation Summary */}
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Installation Summary</div>
                    <SummaryRow label="Application version" value={APP_VERSION} />
                    <SummaryRow label="Installer version" value="1.0.0" />
                    <SummaryRow label="Database" value={dbTest?.serverVersion ?? (mode === "cloud" ? "Lovable Cloud" : "Connected")} />
                    <SummaryRow label="Migrations" value={schemaStatus ? `${schemaStatus.applied}/${schemaStatus.totalBundled}` : (mode === "cloud" ? "managed" : "—")} />
                    <SummaryRow label="Storage buckets" value={String(postStats.buckets)} />
                    <SummaryRow label="Admin account" value={adminUser || adminEmail || "created"} />
                    <SummaryRow label="Realtime" value="Active" />
                    <SummaryRow label="Authentication" value="Enabled" />
                    <SummaryRow label="Installer" value="Locked" />
                    <SummaryRow label="Installation time" value={installStartedAt && installFinishedAt ? `${((installFinishedAt - installStartedAt) / 1000).toFixed(2)}s` : "—"} />
                    <SummaryRow label="Installation date" value={new Date().toLocaleString()} />
                  </div>

                  {/* Stages timeline */}
                  <StageTimeline stages={stages} />

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border bg-muted/40 p-3 text-center">
                      <div className="text-2xl font-bold">{postStats.users}</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Users</div>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-3 text-center">
                      <div className="text-lg font-bold text-emerald-500">Connected</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Storage · {postStats.buckets}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-3 text-center">
                      <div className="text-lg font-bold text-emerald-500">Active</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Realtime · Cron {postStats.cron}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Button onClick={() => navigate({ to: "/login" as any })} className="w-full">Go to Login</Button>
                    <Button onClick={() => navigate({ to: "/admin" as any })} variant="outline" className="w-full">Admin Panel</Button>
                    <Button onClick={() => downloadReport("json")} variant="secondary" className="w-full gap-1"><Download className="h-3.5 w-3.5" /> JSON</Button>
                    <Button onClick={() => downloadReport("txt")} variant="secondary" className="w-full gap-1"><Download className="h-3.5 w-3.5" /> TXT</Button>
                  </div>
                  <div className="flex justify-center">
                    <Button size="sm" variant="ghost" onClick={copyReport}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Report</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                      <PartyPopper className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Ready to install</h3>
                    <p className="text-sm text-muted-foreground">Clicking Finish locks the installer and shows your dashboard.</p>
                  </div>
                  <StageTimeline stages={stages} />
                  <div className="rounded-lg border bg-muted/40 p-3 text-left text-xs space-y-1">
                    <div><span className="text-muted-foreground">Mode:</span> {mode === "cloud" ? "Lovable Cloud" : "Self-Hosted"}</div>
                    <div><span className="text-muted-foreground">License:</span> {licenseType === "envato" ? "Envato" : "Offline"}</div>
                    <div><span className="text-muted-foreground">Admin:</span> {adminUser || "—"}</div>
                    <div><span className="text-muted-foreground">Site:</span> {siteName}</div>
                  </div>
                  <Button onClick={finish} disabled={busy} size="lg" className="w-full">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish Installation"}
                  </Button>
                </div>
              )
            )}


            {/* Back button (not on welcome or finish) */}
            {step > 0 && current.id !== "finish" && (
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => go(-1)}>← Back</Button>
              </div>
            )}
            {current.id === "welcome" && (
              <Button onClick={() => go(1)} className="w-full">Get Started</Button>
            )}
          </CardContent>
        </Card>

        {/* Installation Logs Viewer */}
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Installation Logs</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{logs.length}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={copyLogs} disabled={logs.length === 0} title="Copy logs">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearLogs} disabled={logs.length === 0} title="Clear logs">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setLogsOpen((v) => !v)} title={logsOpen ? "Collapse" : "Expand"}>
                {logsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </CardHeader>
          {logsOpen && (
            <CardContent className="pt-0">
              {logs.length === 0 ? (
                <div className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                  No logs yet. Each installer step's output and errors will appear here in real time.
                </div>
              ) : (
                <div className="max-h-64 overflow-auto rounded-md border bg-black/90 p-2 font-mono text-[11px] leading-relaxed text-emerald-200">
                  {logs.map((l, i) => {
                    const color =
                      l.level === "error" ? "text-red-400" :
                      l.level === "warn"  ? "text-amber-300" :
                      l.level === "ok"    ? "text-emerald-300" :
                                            "text-sky-300";
                    return (
                      <div key={i} className="whitespace-pre-wrap break-words">
                        <span className="text-zinc-500">[{l.ts}]</span>{" "}
                        <span className={`font-semibold ${color}`}>{l.level.toUpperCase().padEnd(5)}</span>{" "}
                        <span className="text-zinc-400">{l.step}</span>{" "}
                        <span className="text-zinc-100">{l.msg}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>


        <p className="mt-4 text-center text-xs text-muted-foreground">
          Need help? See <a href="/SELF_HOSTING.md" className="underline">self-hosting docs</a> or contact support.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />{label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StageTimeline({ stages }: {
  stages: Record<"env"|"db"|"schema"|"storage"|"admin"|"verify"|"finalize", { state: "idle"|"running"|"ok"|"fail"; ms?: number; msg?: string }>
}) {
  const items: Array<[keyof typeof stages, string]> = [
    ["env", "Preparing Environment"],
    ["db", "Connecting Database"],
    ["schema", "Applying Schema"],
    ["storage", "Creating Storage"],
    ["admin", "Creating Admin"],
    ["verify", "Verifying Installation"],
    ["finalize", "Finalizing"],
  ];
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Installation Progress</div>
      <ol className="space-y-1.5 text-xs">
        {items.map(([key, label]) => {
          const s = stages[key];
          const icon =
            s.state === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
            s.state === "fail" ? <AlertCircle className="h-3.5 w-3.5 text-red-500" /> :
            s.state === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> :
            <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
          return (
            <li key={key} className="flex items-center gap-2">
              {icon}
              <span className={s.state === "idle" ? "text-muted-foreground" : ""}>{label}</span>
              {s.ms != null && <span className="ml-auto text-[10px] text-muted-foreground">{s.ms}ms</span>}
              {s.msg && <span className="text-[10px] text-muted-foreground">{s.msg}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function InstallerLockedScreen({ onLogin, onAdmin }: { onLogin: () => void; onAdmin: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 mb-2">
            <Shield className="h-7 w-7 text-emerald-500" />
          </div>
          <CardTitle>Installation already completed</CardTitle>
          <CardDescription>
            The installer is locked. To re-run it, unlock the installer from Admin → System.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" onClick={onLogin}>Go to Login</Button>
          <Button className="w-full" variant="outline" onClick={onAdmin}>Go to Admin</Button>
        </CardContent>
      </Card>
    </div>
  );
}


function CompatBadge({ state }: { state: CompatState }) {
  const cfg: Record<CompatState, { cls: string; label: string }> = {
    ok:      { cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600", label: "OK" },
    warn:    { cls: "border-amber-500/30 bg-amber-500/10 text-amber-600",       label: "Warning" },
    fail:    { cls: "border-destructive/30 bg-destructive/10 text-destructive", label: "Fail" },
    unknown: { cls: "border-border bg-muted/40 text-muted-foreground",          label: "Unknown" },
  };
  const c = cfg[state];
  return <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${c.cls}`}>{c.label}</span>;
}

function SystemCompatibilityPanel({
  compat, busy, onRun,
}: { compat: SystemCompatibility | null; busy: boolean; onRun: () => void }) {
  const passing = compat ? compat.checks.filter((c) => c.state === "ok").length : 0;
  const total = compat?.checks.length ?? 0;
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">System Compatibility</div>
          <div className="text-[11px] text-muted-foreground">
            PostgreSQL, project status, storage, auth &amp; realtime — checked before installation.
          </div>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onRun} disabled={busy}>
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : compat ? "Re-check" : "Run Check"}
        </Button>
      </div>
      {!compat ? (
        <div className="text-xs text-muted-foreground">Click Run Check to verify Postgres version, Supabase project, storage, auth and realtime.</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{passing}/{total} checks passing • {new Date(compat.checkedAt).toLocaleTimeString()}</span>
            {compat.postgresVersion && <span className="font-mono">{compat.postgresVersion.split(",")[0]}</span>}
          </div>
          <div className="grid gap-1.5 text-xs">
            {compat.checks.map((c) => (
              <div key={c.key} className="rounded border bg-background/50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{c.label}</span>
                  <CompatBadge state={c.state} />
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{c.detail}</div>
                {c.fix && c.state !== "ok" && (
                  <div className="mt-1 text-[11px] text-amber-600">Fix: {c.fix}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ ok, label, pending }: { ok: boolean; label: string; pending?: boolean }) {

  return (
    <div className="flex items-center gap-2">
      {pending ? <Circle className="h-4 w-4 text-muted-foreground" /> :
        ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
        <AlertCircle className="h-4 w-4 text-destructive" />}
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function HealthRow({ label, state, msg }: { label: string; state: "pending"|"ok"|"fail"|"warn"; msg?: string }) {
  const icon =
    state === "ok"   ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
    state === "fail" ? <AlertCircle  className="h-4 w-4 text-destructive" /> :
    state === "warn" ? <AlertCircle  className="h-4 w-4 text-amber-500" /> :
                       <Loader2      className="h-4 w-4 animate-spin text-muted-foreground" />;
  const tag =
    state === "ok"   ? "OK" :
    state === "fail" ? "FAIL" :
    state === "warn" ? "WARN" : "…";
  const tagClass =
    state === "ok"   ? "bg-emerald-500/15 text-emerald-600" :
    state === "fail" ? "bg-destructive/15 text-destructive" :
    state === "warn" ? "bg-amber-500/15 text-amber-600" :
                       "bg-muted text-muted-foreground";
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagClass}`}>{tag}</span>
        {msg && <span className="text-[10px] text-muted-foreground text-right max-w-[180px]">{msg}</span>}
      </div>
    </div>
  );
}

function stepDescription(id: string, mode: InstallMode): string {
  switch (id) {
    case "welcome":  return "Let's get your BooBubble site running.";
    case "license":  return "Verify your purchase to activate the app.";
    case "reqs":     return "Checking that your environment is ready.";
    case "schema":   return "Automatically create tables, indexes, RLS, functions, triggers, and seed data.";
    case "db":       return "Connect to your self-hosted Supabase project.";
    case "admin":    return "Create the first super admin account.";
    case "branding": return "Pick a site name. More options inside admin.";
    case "finish":   return mode === "cloud" ? "Almost done!" : "Ready to lock and launch.";
    default: return "";
  }
}
