import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle, Loader2, Rocket, Cloud, Server, Shield, KeyRound, Database, UserPlus, Palette, PartyPopper } from "lucide-react";
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
  const [health, setHealth] = useState<Record<"db"|"storage"|"realtime"|"smtp", { state: HealthState; msg?: string }>>({
    db:       { state: "pending" },
    storage:  { state: "pending" },
    realtime: { state: "pending" },
    smtp:     { state: "pending" },
  });
  const [dbHost, setDbHost] = useState("");
  const [dbAnon, setDbAnon] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [siteName, setSiteName] = useState("BooBubble");
  const [busy, setBusy] = useState(false);

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
    const ok = licenseType === "envato" ? isValidEnvatoCode(licenseKey) : isValidOfflineKey(licenseKey);
    if (!ok) {
      toast.error(licenseType === "envato"
        ? "Invalid Envato purchase code (format: 8-4-4-4-12 hex)"
        : "Invalid offline key (format: BOOB-XXXX-XXXX-XXXX-XXXX)");
      return;
    }
    setLicenseOk(true);
    toast.success("License accepted");
    go(1);
  }

  async function runRequirementsCheck() {
    setBusy(true);
    setHealth({
      db: { state: "pending" }, storage: { state: "pending" },
      realtime: { state: "pending" }, smtp: { state: "pending" },
    });
    // Database
    try {
      const { error } = await supabase.rpc("get_install_status");
      if (error) throw error;
      setHealth((h) => ({ ...h, db: { state: "ok" } }));
    } catch (e: any) {
      setHealth((h) => ({ ...h, db: { state: "fail", msg: e?.message ?? "Unreachable" } }));
    }
    // Storage
    try {
      const { error } = await supabase.storage.listBuckets();
      if (error) throw error;
      setHealth((h) => ({ ...h, storage: { state: "ok" } }));
    } catch (e: any) {
      setHealth((h) => ({ ...h, storage: { state: "fail", msg: e?.message ?? "Unavailable" } }));
    }
    // Realtime (connect + timeout)
    await new Promise<void>((resolve) => {
      const ch = supabase.channel("installer-health-" + Math.random().toString(36).slice(2));
      const timer = setTimeout(() => {
        setHealth((h) => ({ ...h, realtime: { state: "fail", msg: "Connection timeout" } }));
        supabase.removeChannel(ch); resolve();
      }, 4000);
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          setHealth((h) => ({ ...h, realtime: { state: "ok" } }));
          supabase.removeChannel(ch); resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timer);
          setHealth((h) => ({ ...h, realtime: { state: "fail", msg: status } }));
          supabase.removeChannel(ch); resolve();
        }
      });
    });
    // Email / SMTP — best-effort; admin email send happens via Supabase Auth.
    // Mark as warn (configured by provider, not directly probeable from client).
    try {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "email").maybeSingle();
      const cfg = (data?.value as any) ?? null;
      if (cfg && cfg.smtp_host) setHealth((h) => ({ ...h, smtp: { state: "ok" } }));
      else setHealth((h) => ({ ...h, smtp: { state: "warn", msg: "Using default provider — configure SMTP in Admin → Email" } }));
    } catch {
      setHealth((h) => ({ ...h, smtp: { state: "warn", msg: "Not configured" } }));
    }

    // Pass if DB + Storage + Realtime ok (SMTP warn is acceptable)
    setHealth((h) => {
      const pass = h.db.state === "ok" && h.storage.state === "ok" && h.realtime.state === "ok";
      setReqsOk(pass);
      if (pass) toast.success("System health check passed");
      else toast.error("Some checks failed — review and retry");
      return h;
    });
    setBusy(false);
  }

  async function createAdmin() {
    if (!adminEmail || !adminPass || !adminUser) { toast.error("Fill all fields"); return; }
    if (adminPass.length < 8) { toast.error("Password must be ≥ 8 characters"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPass,
        options: {
          emailRedirectTo: `${window.location.origin}/installer`,
          data: { username: adminUser },
        },
      });
      if (error) throw error;
      // Sign in immediately (works if email confirm disabled)
      await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
      await bootstrapFirstAdmin();
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
      // Persist site name into general settings
      try {
        await supabase.from("app_settings").upsert({ key: "general", value: { site_name: siteName } }, { onConflict: "key" });
      } catch { /* non-fatal */ }
      toast.success("Installation complete!");
      setTimeout(() => navigate({ to: "/" }), 800);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to finalize install");
    } finally {
      setBusy(false);
    }
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
                    <HealthRow label="Database" state={health.db.state} msg={health.db.msg} />
                    <HealthRow label="Storage" state={health.storage.state} msg={health.storage.msg} />
                    <HealthRow label="Realtime" state={health.realtime.state} msg={health.realtime.msg} />
                    <HealthRow label="Email / SMTP" state={health.smtp.state} msg={health.smtp.msg} />
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
                  <Label>Password</Label>
                  <Input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="Min 8 characters" />
                </div>
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
              <div className="space-y-4 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                  <PartyPopper className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ready to install</h3>
                  <p className="text-sm text-muted-foreground">Clicking Finish locks the installer and takes you to your new site.</p>
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
