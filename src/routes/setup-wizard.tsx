import { createFileRoute, useNavigate, Navigate, redirect, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CheckCircle2, Loader2, PartyPopper, UserPlus, ArrowRight, Settings2,
  Upload, Trash2, Image as ImageIcon, AlertTriangle, XCircle, ShieldCheck, Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import {
  getOwnerStatus, saveCommunitySetup, createOwner,
  uploadCommunityAsset, runInstallationHealthCheck,
  type HealthCheck, type HealthState,
} from "@/lib/owner-setup.functions";
import { APP_VERSION } from "@/lib/app-version";

export const Route = createFileRoute("/setup-wizard")({
  beforeLoad: async () => {
    const status = await getOwnerStatus({});
    if (!status.installed) throw redirect({ to: "/installer" as any });
    if (status.hasOwner || status.firstRunCompleted) throw redirect({ to: "/login" as any });
  },
  component: SetupWizardPage,
});

type Step = 1 | 2 | 3 | 4 | 5;
type AssetKind = "logo" | "favicon" | "hero";

function SetupWizardPage() {
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getOwnerStatus);
  const runSaveCommunity = useServerFn(saveCommunitySetup);
  const runCreateOwner = useServerFn(createOwner);
  const runUpload = useServerFn(uploadCommunityAsset);
  const runHealth = useServerFn(runInstallationHealthCheck);

  const { data: status, isLoading } = useQuery({
    queryKey: ["owner-setup-status"],
    queryFn: () => fetchStatus({}),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);

  // Community
  const [cName, setCName] = useState("");
  const [cTagline, setCTagline] = useState("");
  const [cDescription, setCDescription] = useState("");
  const [cLanguage, setCLanguage] = useState("en");
  const [cTimezone, setCTimezone] = useState(
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC"
  );
  const [cCurrency, setCCurrency] = useState("USD");
  const [cLogo, setCLogo] = useState("");
  const [cFavicon, setCFavicon] = useState("");
  const [cHero, setCHero] = useState("");
  const [homepage, setHomepage] = useState<"welcome" | "hero">("welcome");

  // Admin
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Health
  const [health, setHealth] = useState<HealthCheck[] | null>(null);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [healthRunning, setHealthRunning] = useState(false);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Checking installation…
      </div>
    );
  }
  if (!status) return <div className="grid min-h-screen place-items-center bg-background">Unable to verify status.</div>;
  if (!status.installed) return <Navigate to={"/installer" as any} replace />;
  // Only redirect away when we haven't started the wizard flow (step 1).
  // Once the owner is created (step 4+), hasOwner becomes true and we must stay
  // on the wizard to show the health check and ready screens.
  if (step === 1 && (status.hasOwner || status.firstRunCompleted)) {
    return <Navigate to="/login" replace />;
  }

  async function fileToBase64(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function uploadAsset(kind: AssetKind, file: File): Promise<string> {
    const base64 = await fileToBase64(file);
    const res = await runUpload({
      data: { kind, filename: file.name, contentType: file.type || "application/octet-stream", base64 },
    });
    return res.url;
  }

  async function handleSaveCommunity(e: React.FormEvent) {
    e.preventDefault();
    if (!cName.trim()) {
      toast.error("Community name is required.");
      return;
    }
    setBusy(true);
    try {
      await runSaveCommunity({
        data: {
          name: cName, tagline: cTagline, description: cDescription,
          language: cLanguage, timezone: cTimezone, currency: cCurrency,
          logoUrl: cLogo, faviconUrl: cFavicon,
          homepage,
        },
      });
      toast.success("Community settings saved.");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save community settings.");
    } finally {
      setBusy(false);
    }
  }

  async function runHealthChecks() {
    setHealthRunning(true);
    setHealth(null);
    setHealthOk(null);
    try {
      const res = await runHealth({});
      setHealth(res.checks);
      setHealthOk(res.ok);
    } catch (err: any) {
      toast.error(err?.message || "Health check failed.");
      setHealthOk(false);
    } finally {
      setHealthRunning(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match.");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username))
      return toast.error("Username must be 3–32 characters (letters, numbers, underscore).");

    setBusy(true);
    try {
      await runCreateOwner({ data: { fullName, username, email, password } });
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        toast.error(`Owner account created, but auto sign-in failed: ${signInErr.message}`);
      }
      setStep(4);
      // Kick off health checks
      void runHealthChecks();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create Super Admin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <StepIndicator step={step} />

        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <CardTitle className="mt-2 text-2xl">Installation Completed Successfully</CardTitle>
              <CardDescription>
                Your BooBubble Community has been installed successfully.
                <br />
                Let's finish the final setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <PartyPopper className="h-10 w-10 text-primary" />
              <Button size="lg" onClick={() => setStep(2)}>
                Continue Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" /> Community Setup
              </CardTitle>
              <CardDescription>Configure the basics and upload your community assets.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCommunity} className="space-y-4">
                <div>
                  <Label htmlFor="cName">Community Name *</Label>
                  <Input id="cName" value={cName} onChange={(e) => setCName(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="cTagline">Tagline</Label>
                  <Input id="cTagline" value={cTagline} onChange={(e) => setCTagline(e.target.value)} maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="cDescription">Description</Label>
                  <Textarea id="cDescription" value={cDescription} onChange={(e) => setCDescription(e.target.value)} maxLength={2000} rows={3} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="cLanguage">Default Language</Label>
                    <Input id="cLanguage" value={cLanguage} onChange={(e) => setCLanguage(e.target.value)} placeholder="en" />
                  </div>
                  <div>
                    <Label htmlFor="cTimezone">Timezone</Label>
                    <Input id="cTimezone" value={cTimezone} onChange={(e) => setCTimezone(e.target.value)} placeholder="UTC" />
                  </div>
                  <div>
                    <Label htmlFor="cCurrency">Currency</Label>
                    <Input id="cCurrency" value={cCurrency} onChange={(e) => setCCurrency(e.target.value)} placeholder="USD" />
                  </div>
                </div>

                <div className="space-y-3 rounded-md border border-dashed p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Community Assets
                  </div>
                  <AssetUploader
                    kind="logo"
                    label="Community Logo"
                    hint="PNG, JPG, WEBP or SVG · max 2MB"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    value={cLogo}
                    onChange={setCLogo}
                    upload={(f) => uploadAsset("logo", f)}
                  />
                  <AssetUploader
                    kind="favicon"
                    label="Favicon"
                    hint="PNG, JPG, WEBP, SVG or ICO · max 512KB"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                    value={cFavicon}
                    onChange={setCFavicon}
                    upload={(f) => uploadAsset("favicon", f)}
                  />
                  <AssetUploader
                    kind="hero"
                    label="Hero Banner (optional)"
                    hint="PNG, JPG or WEBP · max 5MB"
                    accept="image/png,image/jpeg,image/webp"
                    value={cHero}
                    onChange={setCHero}
                    upload={(f) => uploadAsset("hero", f)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave any field empty to use the default BooBubble branding.
                  </p>
                </div>

                <div>
                  <Label>Homepage</Label>
                  <RadioGroup
                    value={homepage}
                    onValueChange={(v) => setHomepage(v as "welcome" | "hero")}
                    className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
                  >
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="welcome" id="hp-welcome" className="mt-1" />
                      <div>
                        <div className="font-medium">Welcome Page</div>
                        <div className="text-xs text-muted-foreground">Show the welcome landing as the default homepage.</div>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="hero" id="hp-hero" className="mt-1" />
                      <div>
                        <div className="font-medium">Hero Homepage</div>
                        <div className="text-xs text-muted-foreground">Show the marketing hero as the default homepage.</div>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={busy}>Back</Button>
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" /> Create Super Administrator
              </CardTitle>
              <CardDescription>This account will be the permanent platform owner with full permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
                  <p className="mt-1 text-[10px] text-muted-foreground">3–32 characters. Letters, numbers, underscore.</p>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                  <PasswordStrength value={password} />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
                </div>
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={busy}>Back</Button>
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Owner & Run Health Check
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Installation Health Check
              </CardTitle>
              <CardDescription>
                Verifying that all core services are online and configured properly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthList checks={health} running={healthRunning} />

              {health && health.some((c) => c.critical && c.state === "fail") && (
                <div className="mt-4 space-y-2">
                  {health.filter((c) => c.critical && c.state === "fail").map((c) => (
                    <div key={c.key} className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
                      <div className="font-semibold text-destructive">{c.label}</div>
                      <div className="mt-1 text-muted-foreground">This service requires attention before your community goes live.</div>
                      {c.problem && <div className="mt-2"><span className="font-medium">Problem:</span> {c.problem}</div>}
                      {c.reason && <div><span className="font-medium">Possible reason:</span> {c.reason}</div>}
                      {c.action && <div><span className="font-medium">Recommended action:</span> {c.action}</div>}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={runHealthChecks} disabled={healthRunning}>
                  {healthRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Re-run checks
                </Button>
                <Button
                  disabled={healthRunning || healthOk !== true}
                  onClick={() => setStep(5)}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Rocket className="h-7 w-7" />
              </div>
              <CardTitle className="mt-2 text-2xl">🎉 Community Ready</CardTitle>
              <CardDescription>Welcome to BooBubble! Your Super Admin account has been created successfully.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 rounded-md border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <SummaryRow label="Community" value={cName || "—"} />
                <SummaryRow label="Homepage" value={homepage === "hero" ? "Hero Homepage" : "Welcome Page"} />
                <SummaryRow label="Owner" value={fullName ? `${fullName} (@${username})` : `@${username}`} />
                <SummaryRow label="Installed Version" value={`v${APP_VERSION}`} />
                <SummaryRow label="Status" value="Ready for Production" tone="ok" />
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button asChild variant="outline">
                  <Link to={"/" as any}>Visit Community</Link>
                </Button>
                <Button onClick={() => navigate({ to: "/admin" as any })}>
                  Enter Admin Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- UI bits ------------------------------- */

function StepIndicator({ step }: { step: Step }) {
  const items = [
    { n: 1, label: "Install Complete" },
    { n: 2, label: "Community" },
    { n: 3, label: "Super Admin" },
    { n: 4, label: "Health Check" },
    { n: 5, label: "Ready" },
  ];
  return (
    <ol className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs">
      {items.map((it, i) => (
        <li key={it.n} className="flex items-center gap-2">
          <span
            className={`grid h-6 w-6 place-items-center rounded-full border ${
              step >= (it.n as Step)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 text-muted-foreground"
            }`}
          >
            {it.n}
          </span>
          <span className={step === (it.n as Step) ? "font-medium" : "text-muted-foreground"}>{it.label}</span>
          {i < items.length - 1 && <span className="mx-1 h-px w-6 bg-muted-foreground/30" />}
        </li>
      ))}
    </ol>
  );
}

function AssetUploader({
  kind, label, hint, accept, value, onChange, upload,
}: {
  kind: AssetKind;
  label: string;
  hint: string;
  accept: string;
  value: string;
  onChange: (url: string) => void;
  upload: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setBusy(true);
    setProgress(10);
    const tick = setInterval(() => setProgress((p) => Math.min(90, p + 10)), 150);
    try {
      const url = await upload(file);
      onChange(url);
      setProgress(100);
      toast.success(`${label} uploaded.`);
    } catch (e: any) {
      toast.error(e?.message ?? `Failed to upload ${label.toLowerCase()}`);
    } finally {
      clearInterval(tick);
      setBusy(false);
      setTimeout(() => setProgress(0), 400);
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) void handleFile(f);
      }}
      className={`flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center ${
        dragOver ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/40">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="truncate text-[11px] text-muted-foreground">
          {value ? "Uploaded · drag a new file or click Replace" : `Drag & drop or click to upload · ${hint}`}
        </div>
        {busy && (
          <div className="mt-1 h-1 w-full overflow-hidden rounded bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; void handleFile(f); e.target.value = ""; }}
      />
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()} className="gap-1.5">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => onChange("")} title={`Remove ${label}`}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <span className="sr-only">{kind}</span>
    </div>
  );
}

function HealthList({ checks, running }: { checks: HealthCheck[] | null; running: boolean }) {
  if (!checks) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
        {running ? "Running system checks…" : "Preparing checks…"}
      </div>
    );
  }
  return (
    <ul className="divide-y rounded-md border">
      {checks.map((c) => (
        <li key={c.key} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <StateIcon state={c.state} />
            <span className="font-medium">{c.label}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{c.detail}</span>
        </li>
      ))}
    </ul>
  );
}

function StateIcon({ state }: { state: HealthState }) {
  if (state === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (state === "warn") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-1 last:border-b-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${tone === "ok" ? "text-emerald-500" : ""}`}>{value}</span>
    </div>
  );
}
