import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle, Loader2, Rocket, Cloud, Server, Shield, KeyRound, Database, UserPlus, Palette, PartyPopper, Terminal, Copy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  detectInstallMode, fetchInstallStatus, isValidEnvatoCode, isValidOfflineKey,
  completeInstallation, bootstrapFirstAdmin, type InstallMode,
} from "@/lib/installer";
import { toast } from "sonner";

export const Route = createFileRoute("/installer")({ component: InstallerPage });

const STEPS = [
  { id: "welcome",   label: "Welcome",       icon: Rocket },
  { id: "license",   label: "License",       icon: KeyRound },
  { id: "reqs",      label: "Requirements",  icon: Shield },
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
  if (alreadyInstalled) return <Navigate to="/" replace />;

  // Skip DB step entirely in cloud mode
  const visibleSteps = STEPS.filter((s) => !(s.id === "db" && mode === "cloud"));
  const current = visibleSteps[step];

  const go = (delta: number) => setStep((s) => Math.max(0, Math.min(visibleSteps.length - 1, s + delta)));

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
    if (!adminEmail || !adminPass || !adminUser) { toast.error("Fill all fields"); return; }
    const strength = passwordStrength(adminPass);
    if (strength.score < 4) {
      toast.error("Password must be strong: 12+ chars, upper/lower, number, symbol");
      return;
    }
    if (adminRecovery && !adminRecovery.includes("@")) {
      toast.error("Recovery email looks invalid"); return;
    }
    setBusy(true);
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
      await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
      await bootstrapFirstAdmin();
      // Persist security prefs on profile (best-effort)
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user?.id) {
          await supabase.from("profiles").update({
            // @ts-ignore — columns may be added by admin later
            recovery_email: adminRecovery || null,
            two_factor_opt_in: admin2FA,
          } as any).eq("id", u.user.id);
        }
      } catch { /* non-fatal */ }
      toast.success("Admin account created");
      go(1);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create admin");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      await completeInstallation({ license_type: licenseType, license_key: licenseKey, site_name: siteName, mode });
      try {
        await supabase.from("app_settings").upsert({ key: "general", value: { site_name: siteName } }, { onConflict: "key" });
      } catch { /* non-fatal */ }
      // Load post-install dashboard stats
      try {
        const { data } = await supabase.rpc("installer_get_extras");
        const d = (data as any) ?? {};
        setPostStats({
          users: d.users ?? 0,
          buckets: d.storage_buckets ?? 0,
          cron: d.cron_jobs ?? 0,
        });
      } catch { setPostStats({ users: 0, buckets: 0, cron: 0 }); }
      toast.success("Installation complete!");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to finalize install");
    } finally {
      setBusy(false);
    }
  }

  async function importDemoData() {
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
          <Badge variant={mode === "cloud" ? "default" : "secondary"} className="gap-1">
            {mode === "cloud" ? <Cloud className="h-3 w-3" /> : <Server className="h-3 w-3" />}
            {mode === "cloud" ? "Lovable Cloud" : "Self-Hosted"}
          </Badge>
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
                        setHealth((h) => ({ ...h, smtp: { state: "pending", msg: "Sending test email…" } }));
                        try {
                          const { error } = await supabase.auth.resetPasswordForEmail(smtpTestEmail.trim(), {
                            redirectTo: `${window.location.origin}/auth`,
                          });
                          if (error) throw error;
                          setHealth((h) => ({ ...h, smtp: { state: "ok", msg: `Test email sent to ${smtpTestEmail}` } }));
                          toast.success("Test email dispatched — check your inbox");
                        } catch (e: any) {
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
                    <h3 className="text-xl font-bold">🎉 Installation Complete</h3>
                    <p className="text-sm text-muted-foreground">Your BooBubble site is live and ready.</p>
                  </div>
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
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button onClick={() => navigate({ to: "/admin" as any })} className="w-full">Go to Admin</Button>
                    <Button onClick={() => navigate({ to: "/" })} variant="outline" className="w-full">Open Site</Button>
                    <Button onClick={importDemoData} variant="secondary" className="w-full">Import Demo</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                    <PartyPopper className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Ready to install</h3>
                    <p className="text-sm text-muted-foreground">Clicking Finish locks the installer and shows your dashboard.</p>
                  </div>
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

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Need help? See <a href="/SELF_HOSTING.md" className="underline">self-hosting docs</a> or contact support.
        </p>
      </div>
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
    case "db":       return "Connect to your self-hosted Supabase project.";
    case "admin":    return "Create the first super admin account.";
    case "branding": return "Pick a site name. More options inside admin.";
    case "finish":   return mode === "cloud" ? "Almost done!" : "Ready to lock and launch.";
    default: return "";
  }
}
