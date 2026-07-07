import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2, Cloud, Database,
  Settings, Rocket, PlayCircle, ArrowRight, RefreshCw, Copy, Download,
  Sparkles, Mail, Radio, ShieldCheck, HardDrive, Server, PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import {
  checkRuntime, checkEnv, checkDatabase, checkAuth, checkStorage,
  checkRealtime, checkAi, checkEmail, getDeploymentInfo, clearDeployCheckCache,
  type CategoryResult, type CheckCategory, type CheckItem, type CheckState,
  type DeploymentInfo,
} from "@/lib/deploy-check.functions";

export const Route = createFileRoute("/deploy")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Deployment Wizard — BooBubble" },
      { name: "description", content: "One-click deployment checker: verify runtime, backend, environment, storage, and services before install." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeployWizard,
});

const STEPS = [
  { id: "supabase", label: "Connect Supabase", icon: Database },
  { id: "env",      label: "Configure Environment", icon: Settings },
  { id: "deploy",   label: "Deploy", icon: Cloud },
  { id: "check",    label: "Deployment Check", icon: PlayCircle },
  { id: "installer",label: "Open Installer", icon: Rocket },
] as const;

const CATEGORIES: { key: CheckCategory; label: string; icon: typeof Server }[] = [
  { key: "runtime",  label: "Runtime",       icon: Server },
  { key: "env",      label: "Environment",   icon: Settings },
  { key: "database", label: "Database",      icon: Database },
  { key: "storage",  label: "Storage",       icon: HardDrive },
  { key: "auth",     label: "Authentication",icon: ShieldCheck },
  { key: "realtime", label: "Realtime",      icon: Radio },
  { key: "ai",       label: "AI",            icon: Sparkles },
  { key: "email",    label: "Email",         icon: Mail },
];

function StateIcon({ state, className = "h-5 w-5" }: { state: CheckState; className?: string }) {
  if (state === "ok") return <CheckCircle2 className={`${className} text-green-500`} aria-label="Pass" />;
  if (state === "warn") return <AlertTriangle className={`${className} text-amber-500`} aria-label="Warning" />;
  if (state === "fail") return <XCircle className={`${className} text-red-500`} aria-label="Fail" />;
  return <Loader2 className={`${className} text-muted-foreground animate-spin`} aria-label="Running" />;
}

function categoryState(items: CheckItem[] | undefined): CheckState | "pending" {
  if (!items || items.length === 0) return "pending";
  if (items.some((i) => i.state === "fail")) return "fail";
  if (items.some((i) => i.state === "warn")) return "warn";
  return "ok";
}

function DeployWizard() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Partial<Record<CheckCategory, CategoryResult>>>({});
  const [info, setInfo] = useState<DeploymentInfo | null>(null);
  const [runningCats, setRunningCats] = useState<Set<CheckCategory>>(new Set());
  const summaryRef = useRef<HTMLDivElement | null>(null);

  const runners: Record<CheckCategory, () => Promise<CategoryResult>> = useMemo(() => {
    const fns = {
      runtime: useServerFn(checkRuntime),
      env: useServerFn(checkEnv),
      database: useServerFn(checkDatabase),
      auth: useServerFn(checkAuth),
      storage: useServerFn(checkStorage),
      realtime: useServerFn(checkRealtime),
      ai: useServerFn(checkAi),
      email: useServerFn(checkEmail),
    };
    return {
      runtime: () => fns.runtime(),
      env: () => fns.env(),
      database: () => fns.database(),
      auth: () => fns.auth(),
      storage: () => fns.storage(),
      realtime: () => fns.realtime(),
      ai: () => fns.ai(),
      email: () => fns.email(),
      backup: async () => ({ category: "backup" as const, items: [], durationMs: 0 }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const infoFn = useServerFn(getDeploymentInfo);
  const clearCacheFn = useServerFn(clearDeployCheckCache);

  async function runOne(cat: CheckCategory, opts: { force?: boolean } = {}) {
    setRunningCats((s) => new Set(s).add(cat));
    try {
      if (opts.force) {
        await clearCacheFn({ data: { category: cat } }).catch(() => {});
      }
      const r = await runners[cat]();
      setResults((prev) => ({ ...prev, [cat]: r }));
    } catch (e: any) {
      setResults((prev) => ({
        ...prev,
        [cat]: {
          category: cat, durationMs: 0,
          items: [{
            key: cat, category: cat, critical: cat !== "ai" && cat !== "email",
            label: `${cat} check`, state: "fail",
            message: e?.message ?? "Check failed unexpectedly",
            fix: "Retry, or check hosting logs for details.",
          }],
        },
      }));
    } finally {
      setRunningCats((s) => { const n = new Set(s); n.delete(cat); return n; });
    }
  }

  async function runAll(opts: { force?: boolean } = {}) {
    setBusy(true);
    setResults({});
    try {
      if (opts.force) await clearCacheFn({ data: {} }).catch(() => {});
      await Promise.all([
        ...CATEGORIES.map((c) => runOne(c.key)),
        infoFn().then(setInfo).catch(() => {}),
      ]);
    } finally {
      setBusy(false);
    }
  }

  // Derived
  const allItems = useMemo(
    () => Object.values(results).flatMap((r) => r?.items ?? []),
    [results],
  );
  const totalExpected = CATEGORIES.length; // categories completed / total
  const completedCats = CATEGORIES.filter((c) => results[c.key]).length;
  const progressPct = Math.round((completedCats / totalExpected) * 100);
  const criticalItems = allItems.filter((i) => i.critical);
  const criticalPassed = criticalItems.length > 0 && criticalItems.every((i) => i.state === "ok");
  const failedCritical = criticalItems.filter((i) => i.state === "fail");
  const scoreable = allItems.filter((i) => i.state !== "info");
  const passed = scoreable.filter((i) => i.state === "ok").length;
  const warns = scoreable.filter((i) => i.state === "warn").length;
  const healthScore = scoreable.length === 0 ? 0
    : Math.round(((passed + warns * 0.5) / scoreable.length) * 100);
  const hasRun = completedCats > 0;

  function buildReport() {
    return {
      generatedAt: new Date().toISOString(),
      healthScore,
      criticalPassed,
      deploymentInfo: info,
      categories: Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, {
          state: categoryState(v?.items),
          durationMs: v?.durationMs,
          items: v?.items,
        }]),
      ),
    };
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildReport(), null, 2));
      toast.success("Deployment report copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  function exportReport() {
    const blob = new Blob([JSON.stringify(buildReport(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Auto-run once when user reaches the check step
  useEffect(() => {
    if (STEPS[step].id === "check" && !hasRun && !busy) {
      void runAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const canProceed = criticalPassed;
  const currentStep = STEPS[step];

  return (
    <div className="min-h-dvh bg-background p-3 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Deployment Wizard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Verify your deployment before running the installer.
          </p>
          <p className="text-xs text-muted-foreground">Estimated setup time: 2–5 minutes</p>
        </header>

        {/* Stepper */}
        <nav aria-label="Deployment steps" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                aria-current={active ? "step" : undefined}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 sm:p-3 text-xs transition focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "border-primary bg-primary/5" : done ? "border-green-500/50 bg-green-500/5" : "border-border"
                }`}
              >
                <Icon className={`h-5 w-5 ${done ? "text-green-500" : active ? "text-primary" : "text-muted-foreground"}`} aria-hidden />
                <span className="font-medium">Step {i + 1}</span>
                <span className="text-muted-foreground text-center leading-tight">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <currentStep.icon className="h-5 w-5" aria-hidden />
              {currentStep.label}
            </CardTitle>
            <CardDescription>{stepDescription(currentStep.id)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep.id === "supabase" && <SupabaseStep />}
            {currentStep.id === "env" && <EnvStep />}
            {currentStep.id === "deploy" && <DeployStep />}
            {currentStep.id === "check" && (
              <CheckStep
                busy={busy} runAll={runAll} results={results} runOne={runOne}
                runningCats={runningCats} progressPct={progressPct}
                healthScore={healthScore} criticalPassed={criticalPassed}
                failedCritical={failedCritical} info={info}
                copyReport={copyReport} exportReport={exportReport}
                summaryRef={summaryRef} hasRun={hasRun}
              />
            )}
            {currentStep.id === "installer" && (
              <InstallerStep canProceed={canProceed} />
            )}

            {/* Nav */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                aria-label="Previous step"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={
                  step === STEPS.length - 1 ||
                  (currentStep.id === "check" && !canProceed)
                }
                className="flex-1"
                aria-label="Next step"
              >
                {currentStep.id === "check" && !canProceed
                  ? "Pass all critical checks to continue"
                  : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------- Step components -------------- */

function SupabaseStep() {
  return (
    <div className="space-y-2 text-sm">
      <p>Create (or reuse) a Supabase project. From <em>Settings → API</em>, copy:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><code>Project URL</code> → <code>SUPABASE_URL</code></li>
        <li><code>anon / publishable key</code> → <code>SUPABASE_PUBLISHABLE_KEY</code> &amp; <code>VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
        <li><code>service_role key</code> → <code>SUPABASE_SERVICE_ROLE_KEY</code> (server-only)</li>
      </ul>
    </div>
  );
}

function EnvStep() {
  return (
    <div className="space-y-2 text-sm">
      <p>Set these in your hosting environment:</p>
      <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">{`SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
LOVABLE_API_KEY=...   # optional, enables AI`}</pre>
    </div>
  );
}

function DeployStep() {
  return (
    <div className="space-y-2 text-sm">
      <p>Build and deploy the app:</p>
      <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">{`bunx supabase db push   # apply migrations
npm run build           # build the Worker bundle
npx wrangler deploy     # publish to Cloudflare`}</pre>
    </div>
  );
}

function CheckStep({
  busy, runAll, results, runOne, runningCats, progressPct, healthScore,
  criticalPassed, failedCritical, info, copyReport, exportReport, summaryRef, hasRun,
}: {
  busy: boolean;
  runAll: () => void;
  results: Partial<Record<CheckCategory, CategoryResult>>;
  runOne: (c: CheckCategory) => void;
  runningCats: Set<CheckCategory>;
  progressPct: number;
  healthScore: number;
  criticalPassed: boolean;
  failedCritical: CheckItem[];
  info: DeploymentInfo | null;
  copyReport: () => void;
  exportReport: () => void;
  summaryRef: React.MutableRefObject<HTMLDivElement | null>;
  hasRun: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Failure summary */}
      {hasRun && failedCritical.length > 0 && (
        <div
          ref={summaryRef}
          role="alert"
          className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 sm:p-4 space-y-2"
        >
          <div className="font-semibold text-sm sm:text-base text-red-700 dark:text-red-300">
            {failedCritical.length} issue{failedCritical.length !== 1 ? "s" : ""} require attention
          </div>
          <ul className="space-y-1.5 text-sm">
            {failedCritical.map((f) => (
              <li key={f.key} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.message}</div>
                </div>
                <Button
                  size="sm" variant="outline"
                  onClick={() => {
                    const el = document.getElementById(`cat-${f.category}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  aria-label={`Jump to ${f.category} section`}
                >
                  Fix
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={runAll} disabled={busy} className="flex-1">
          {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />Running checks…</>
            : <><PlayCircle className="mr-2 h-4 w-4" aria-hidden />Run Deployment Check</>}
        </Button>
        <Button variant="outline" onClick={copyReport} disabled={!hasRun}>
          <Copy className="mr-2 h-4 w-4" aria-hidden />Copy Report
        </Button>
        <Button variant="outline" onClick={exportReport} disabled={!hasRun}>
          <Download className="mr-2 h-4 w-4" aria-hidden />Export JSON
        </Button>
      </div>

      {/* Progress + score */}
      <div className="space-y-2" aria-live="polite">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium">Deployment Progress</span>
          <span className="text-muted-foreground">{progressPct}%</span>
        </div>
        <Progress value={progressPct} aria-label="Deployment check progress" />
        {hasRun && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall health score</span>
            <Badge variant={healthScore >= 90 ? "default" : healthScore >= 60 ? "secondary" : "destructive"}>
              {healthScore}%
            </Badge>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase">Installation Progress</div>
        <ol className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((c) => {
            const state = categoryState(results[c.key]?.items);
            const running = runningCats.has(c.key);
            return (
              <li key={c.key} className="flex items-center gap-2 text-sm">
                {running || state === "pending"
                  ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                  : <StateIcon state={state as CheckState} className="h-4 w-4" />}
                <span>{c.label}</span>
              </li>
            );
          })}
          <li className="flex items-center gap-2 text-sm font-medium">
            {criticalPassed
              ? <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
              : <Loader2 className="h-4 w-4 text-muted-foreground" aria-hidden />}
            <span>Deployment Ready</span>
          </li>
        </ol>
      </div>

      {/* Success screen */}
      {hasRun && criticalPassed && (
        <div className="rounded-lg border-2 border-green-500/50 bg-green-500/5 p-4 sm:p-6 text-center space-y-3">
          <PartyPopper className="h-10 w-10 text-green-500 mx-auto" aria-hidden />
          <h2 className="text-xl sm:text-2xl font-bold">Deployment Ready</h2>
          <p className="text-sm text-muted-foreground">
            Your server is correctly configured. You can now safely continue to the installer.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/installer">Open Installer <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
          </Button>
        </div>
      )}

      {/* Per-category results */}
      <div className="space-y-3">
        {CATEGORIES.map((c) => {
          const r = results[c.key];
          const state = categoryState(r?.items);
          const running = runningCats.has(c.key);
          const Icon = c.icon;
          return (
            <section
              key={c.key} id={`cat-${c.key}`}
              className="rounded-lg border overflow-hidden"
              aria-labelledby={`cat-title-${c.key}`}
            >
              <header className="flex items-center justify-between gap-2 p-3 bg-muted/40">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <h3 id={`cat-title-${c.key}`} className="font-medium text-sm truncate">{c.label}</h3>
                  {r && (
                    <Badge
                      variant={state === "ok" ? "default" : state === "warn" ? "secondary" : "destructive"}
                      className="ml-1"
                    >
                      {state === "ok" ? "Healthy" : state === "warn" ? "Warning" : state === "fail" ? "Failed" : "Pending"}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm" variant="ghost" onClick={() => runOne(c.key)}
                  disabled={running}
                  aria-label={`Retry ${c.label} checks`}
                >
                  <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} aria-hidden />
                  <span className="ml-1 hidden sm:inline">Retry</span>
                </Button>
              </header>
              {r && r.items.length > 0 ? (
                <ul className="divide-y">
                  {r.items.map((item) => (
                    <li key={item.key} className="flex items-start gap-3 p-3">
                      <StateIcon state={item.state} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-sm">{item.label}</span>
                          <span className={`text-xs uppercase font-semibold ${
                            item.state === "ok" ? "text-green-600"
                              : item.state === "warn" ? "text-amber-600"
                              : "text-red-600"
                          }`}>{item.state}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 break-words">{item.message}</div>
                        {item.fix && item.state !== "ok" && (
                          <div className="mt-1 text-xs rounded bg-muted p-2">
                            <span className="font-semibold">Fix: </span>{item.fix}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-xs text-muted-foreground">
                  {running ? "Running…" : "Not yet run."}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Deployment information */}
      {info && (
        <div className="rounded-lg border p-3 sm:p-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase">Deployment Information</div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <InfoRow label="Application Version" value={info.appVersion} />
            <InfoRow label="Installer Version" value={info.installerVersion} />
            <InfoRow label="Backup Version" value={info.backupVersion} />
            <InfoRow label="Deployment Date" value={new Date(info.deploymentDate).toLocaleString()} />
            <InfoRow label="Runtime" value={info.runtime} />
            <InfoRow label="Supabase Region" value={info.supabaseRegion} />
            <InfoRow label="Storage Provider" value={info.storageProvider} />
            <InfoRow label="AI Provider" value={info.aiProvider} />
          </dl>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-border/50 py-1 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-xs sm:text-sm truncate">{value}</dd>
    </div>
  );
}

function InstallerStep({ canProceed }: { canProceed: boolean }) {
  return (
    <div className="space-y-3 text-sm">
      {canProceed ? (
        <>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            <span className="font-medium">All critical checks passed.</span>
          </div>
          <Button asChild className="w-full">
            <Link to="/installer">Open Installer <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
          </Button>
        </>
      ) : (
        <div className="rounded border border-amber-500/50 bg-amber-500/10 p-3">
          Run the Deployment Check first and resolve all critical items before opening the installer.
        </div>
      )}
    </div>
  );
}

function stepDescription(id: (typeof STEPS)[number]["id"]) {
  switch (id) {
    case "supabase": return "Get your project keys from the Supabase dashboard.";
    case "env":      return "Load the required environment variables into your host.";
    case "deploy":   return "Push migrations and deploy the app to Cloudflare.";
    case "check":    return "One-click preflight — verifies runtime, backend, env, storage, and services.";
    case "installer":return "Continue to the in-app installer to create your admin account.";
  }
}
