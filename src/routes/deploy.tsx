import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2, Cloud, Database,
  Settings, Rocket, PlayCircle, ArrowRight,
} from "lucide-react";
import { runDeploymentCheck, type DeploymentCheckResult, type CheckState } from "@/lib/deploy-check.functions";

export const Route = createFileRoute("/deploy")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Deployment Wizard — BooBubble" },
      { name: "description", content: "One-click deployment checker: verify Cloudflare, backend, environment, storage, and services before install." },
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

function StateIcon({ state }: { state: CheckState }) {
  if (state === "ok") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (state === "warn") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

function DeployWizard() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DeploymentCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const check = useServerFn(runDeploymentCheck);

  async function runCheck() {
    setBusy(true);
    setError(null);
    try {
      const r = await check();
      setResult(r);
    } catch (e: any) {
      setError(e?.message ?? "Failed to run deployment check");
    } finally {
      setBusy(false);
    }
  }

  const canProceed = result?.criticalPassed === true;
  const hasFailures = result?.checks.some((c) => c.state === "fail") ?? false;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Deployment Wizard</h1>
          <p className="text-muted-foreground">Verify your deployment before running the installer.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`flex flex-1 min-w-[110px] flex-col items-center gap-1 rounded-lg border p-3 text-xs transition ${
                  active ? "border-primary bg-primary/5" : done ? "border-green-500/50 bg-green-500/5" : "border-border"
                }`}
              >
                <Icon className={`h-5 w-5 ${done ? "text-green-500" : active ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium">Step {i + 1}</span>
                <span className="text-muted-foreground">{s.label}</span>
              </button>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5" />; })()}
              {STEPS[step].label}
            </CardTitle>
            <CardDescription>{stepDescription(STEPS[step].id)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {STEPS[step].id === "supabase" && (
              <div className="space-y-2 text-sm">
                <p>Create (or reuse) a Supabase project. From <em>Settings → API</em>, copy:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><code>Project URL</code> → <code>SUPABASE_URL</code></li>
                  <li><code>anon / publishable key</code> → <code>SUPABASE_PUBLISHABLE_KEY</code> &amp; <code>VITE_SUPABASE_PUBLISHABLE_KEY</code></li>
                  <li><code>service_role key</code> → <code>SUPABASE_SERVICE_ROLE_KEY</code> (server-only, never expose)</li>
                </ul>
              </div>
            )}
            {STEPS[step].id === "env" && (
              <div className="space-y-2 text-sm">
                <p>Set these in your hosting environment (Cloudflare Worker vars, <code>.env</code>, or platform dashboard):</p>
                <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">{`SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...`}</pre>
                <p className="text-muted-foreground">The <code>VITE_*</code> pair ships to the browser; the others are server-only.</p>
              </div>
            )}
            {STEPS[step].id === "deploy" && (
              <div className="space-y-2 text-sm">
                <p>Build and deploy the app:</p>
                <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">{`bunx supabase db push   # apply migrations
npm run build           # build the Worker bundle
npx wrangler deploy     # publish to Cloudflare`}</pre>
                <p className="text-muted-foreground">Once the URL responds, come back and run the checker.</p>
              </div>
            )}
            {STEPS[step].id === "check" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={runCheck} disabled={busy} className="flex-1">
                    {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running checks…</> : <><PlayCircle className="mr-2 h-4 w-4" />Run Deployment Check</>}
                  </Button>
                </div>

                {error && (
                  <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                {result && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ran at {new Date(result.ranAt).toLocaleTimeString()}</span>
                      <Badge variant={canProceed ? "default" : hasFailures ? "destructive" : "secondary"}>
                        {canProceed ? "All checks passed" : hasFailures ? "Action required" : "Warnings"}
                      </Badge>
                    </div>
                    <ul className="divide-y rounded border">
                      {result.checks.map((c) => (
                        <li key={c.key} className="flex items-start gap-3 p-3">
                          <StateIcon state={c.state} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm">{c.label}</span>
                              <span className={`text-xs uppercase font-semibold ${
                                c.state === "ok" ? "text-green-600" : c.state === "warn" ? "text-amber-600" : "text-red-600"
                              }`}>{c.state}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{c.message}</div>
                            {c.fix && c.state !== "ok" && (
                              <div className="mt-1 text-xs rounded bg-muted p-2">
                                <span className="font-semibold">Fix: </span>{c.fix}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {STEPS[step].id === "installer" && (
              <div className="space-y-3 text-sm">
                {canProceed ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">All checks passed — you're ready to install.</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/installer">Open Installer <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </>
                ) : (
                  <div className="rounded border border-amber-500/50 bg-amber-500/10 p-3">
                    Run the Deployment Check first and resolve any red items before opening the installer.
                  </div>
                )}
              </div>
            )}

            {/* Nav */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              <Button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={
                  step === STEPS.length - 1 ||
                  (STEPS[step].id === "check" && !canProceed)
                }
                className="flex-1"
              >
                {STEPS[step].id === "check" && !canProceed ? "Pass all checks to continue" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
