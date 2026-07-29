import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useServerFn, ae as Card, ag as CardHeader, ah as CardTitle, ai as CardDescription, af as CardContent, B as Button } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { P as Progress } from "./progress-CwWlrCUG.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { b8 as Server, p as Settings, b9 as Database, ba as HardDrive, au as ShieldCheck, i as Radio, a as Sparkles, b4 as Mail, bw as Cloud, bx as CirclePlay, b2 as Rocket, ab as ArrowRight, a0 as LoaderCircle, by as Copy, aI as Download, bz as CircleCheck, bA as PartyPopper, bd as RefreshCw, T as TriangleAlert, bB as CircleX } from "../_libs/lucide-react.mjs";
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
import "./client-H8IXbXWR.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
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
import "./app-version-8YDb-xNu.mjs";
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
import "../_libs/radix-ui__react-progress.mjs";
const clearDeployCheckCache = createServerFn({
  method: "POST"
}).middleware([withRateLimit("api")]).inputValidator((d) => d ?? {}).handler(createSsrRpc("cb0c6322729c2419cea2991a22a37cc7395b3c8734892d0ec6aee5a5b5dc45ae"));
const checkRuntime = createServerFn({
  method: "GET"
}).handler(createSsrRpc("f8a5da6671501701944dfe0a2e7372bbc05a5124bb10eb2a646dd396c6383c1d"));
const checkEnv = createServerFn({
  method: "GET"
}).handler(createSsrRpc("977c21034f51dd649d64e5b9f73baf8e09371a2fe03c9521d0950d382def1a3c"));
const checkDatabase = createServerFn({
  method: "GET"
}).handler(createSsrRpc("32b83b810e6596c16f0aeb6cfefeb67800168e162743eccb190bce58b47abe7b"));
const checkAuth = createServerFn({
  method: "GET"
}).handler(createSsrRpc("aef26b7bc6dc9c68010d4d23199dda9f05002497df672a5df92bfe911a89e3e0"));
const checkStorage = createServerFn({
  method: "GET"
}).handler(createSsrRpc("df77482e56e300bfcd7faec1942d1333f3dfb5495d55c9c51106692732f9e4e6"));
const checkRealtime = createServerFn({
  method: "GET"
}).handler(createSsrRpc("30a125c9c8b2e85c0187f379ea78ee34c701e030d6a85f9523b5a1f2d0e6a519"));
const checkAi = createServerFn({
  method: "GET"
}).handler(createSsrRpc("073367386c1d4a439ae34f938237958435be02fc7fbdbf5d3dd307bb495b0887"));
const checkEmail = createServerFn({
  method: "GET"
}).handler(createSsrRpc("944cf63a029419b2deab9193e1761098f7ba53454a1deaa391e2248d7464c0f7"));
const getDeploymentInfo = createServerFn({
  method: "GET"
}).handler(createSsrRpc("9f59f4978b8c612b26829c1f2ceb9f5b120a3dbbbd65f74629f0901b8951d53c"));
const STEPS = [{
  id: "supabase",
  label: "Connect Supabase",
  icon: Database
}, {
  id: "env",
  label: "Configure Environment",
  icon: Settings
}, {
  id: "deploy",
  label: "Deploy",
  icon: Cloud
}, {
  id: "check",
  label: "Deployment Check",
  icon: CirclePlay
}, {
  id: "installer",
  label: "Open Installer",
  icon: Rocket
}];
const CATEGORIES = [{
  key: "runtime",
  label: "Runtime",
  icon: Server
}, {
  key: "env",
  label: "Environment",
  icon: Settings
}, {
  key: "database",
  label: "Database",
  icon: Database
}, {
  key: "storage",
  label: "Storage",
  icon: HardDrive
}, {
  key: "auth",
  label: "Authentication",
  icon: ShieldCheck
}, {
  key: "realtime",
  label: "Realtime",
  icon: Radio
}, {
  key: "ai",
  label: "AI",
  icon: Sparkles
}, {
  key: "email",
  label: "Email",
  icon: Mail
}];
function StateIcon({
  state,
  className = "h-5 w-5"
}) {
  if (state === "ok") return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: `${className} text-green-500`, "aria-label": "Pass" });
  if (state === "warn") return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: `${className} text-amber-500`, "aria-label": "Warning" });
  if (state === "fail") return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: `${className} text-red-500`, "aria-label": "Fail" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: `${className} text-muted-foreground animate-spin`, "aria-label": "Running" });
}
function categoryState(items) {
  if (!items || items.length === 0) return "pending";
  if (items.some((i) => i.state === "fail")) return "fail";
  if (items.some((i) => i.state === "warn")) return "warn";
  return "ok";
}
function DeployWizard() {
  const [step, setStep] = reactExports.useState(0);
  const [busy, setBusy] = reactExports.useState(false);
  const [results, setResults] = reactExports.useState({});
  const [info, setInfo] = reactExports.useState(null);
  const [runningCats, setRunningCats] = reactExports.useState(/* @__PURE__ */ new Set());
  const summaryRef = reactExports.useRef(null);
  const runners = reactExports.useMemo(() => {
    const fns = {
      runtime: useServerFn(checkRuntime),
      env: useServerFn(checkEnv),
      database: useServerFn(checkDatabase),
      auth: useServerFn(checkAuth),
      storage: useServerFn(checkStorage),
      realtime: useServerFn(checkRealtime),
      ai: useServerFn(checkAi),
      email: useServerFn(checkEmail)
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
      backup: async () => ({
        category: "backup",
        items: [],
        durationMs: 0
      })
    };
  }, []);
  const infoFn = useServerFn(getDeploymentInfo);
  const clearCacheFn = useServerFn(clearDeployCheckCache);
  async function runOne(cat, opts = {}) {
    setRunningCats((s) => new Set(s).add(cat));
    try {
      if (opts.force) {
        await clearCacheFn({
          data: {
            category: cat
          }
        }).catch(() => {
        });
      }
      const r = await runners[cat]();
      setResults((prev) => ({
        ...prev,
        [cat]: r
      }));
    } catch (e) {
      setResults((prev) => ({
        ...prev,
        [cat]: {
          category: cat,
          durationMs: 0,
          items: [{
            key: cat,
            category: cat,
            critical: cat !== "ai" && cat !== "email",
            label: `${cat} check`,
            state: "fail",
            message: e?.message ?? "Check failed unexpectedly",
            fix: "Retry, or check hosting logs for details."
          }]
        }
      }));
    } finally {
      setRunningCats((s) => {
        const n = new Set(s);
        n.delete(cat);
        return n;
      });
    }
  }
  async function runAll(opts = {}) {
    setBusy(true);
    setResults({});
    try {
      if (opts.force) await clearCacheFn({
        data: {}
      }).catch(() => {
      });
      await Promise.all([...CATEGORIES.map((c) => runOne(c.key)), infoFn().then(setInfo).catch(() => {
      })]);
    } finally {
      setBusy(false);
    }
  }
  const allItems = reactExports.useMemo(() => Object.values(results).flatMap((r) => r?.items ?? []), [results]);
  const totalExpected = CATEGORIES.length;
  const completedCats = CATEGORIES.filter((c) => results[c.key]).length;
  const progressPct = Math.round(completedCats / totalExpected * 100);
  const criticalItems = allItems.filter((i) => i.critical);
  const criticalPassed = criticalItems.length > 0 && criticalItems.every((i) => i.state === "ok");
  const failedCritical = criticalItems.filter((i) => i.state === "fail");
  const scoreable = allItems.filter((i) => i.state !== "info");
  const passed = scoreable.filter((i) => i.state === "ok").length;
  const warns = scoreable.filter((i) => i.state === "warn").length;
  const healthScore = scoreable.length === 0 ? 0 : Math.round((passed + warns * 0.5) / scoreable.length * 100);
  const hasRun = completedCats > 0;
  function buildReport() {
    return {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      healthScore,
      criticalPassed,
      deploymentInfo: info,
      categories: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, {
        state: categoryState(v?.items),
        durationMs: v?.durationMs,
        items: v?.items
      }]))
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
    const blob = new Blob([JSON.stringify(buildReport(), null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-report-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  reactExports.useEffect(() => {
    if (STEPS[step].id === "check" && !hasRun && !busy) {
      void runAll();
    }
  }, [step]);
  const canProceed = criticalPassed;
  const currentStep = STEPS[step];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh bg-background p-3 sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl space-y-4 sm:space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-bold", children: "Deployment Wizard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-muted-foreground", children: "Verify your deployment before running the installer." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Estimated setup time: 2–5 minutes" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { "aria-label": "Deployment steps", className: "grid grid-cols-2 sm:grid-cols-5 gap-2", children: STEPS.map((s, i) => {
      const Icon = s.icon;
      const active = i === step;
      const done = i < step;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStep(i), "aria-current": active ? "step" : void 0, className: `flex flex-col items-center gap-1 rounded-lg border p-2 sm:p-3 text-xs transition focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary bg-primary/5" : done ? "border-green-500/50 bg-green-500/5" : "border-border"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-5 w-5 ${done ? "text-green-500" : active ? "text-primary" : "text-muted-foreground"}`, "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          "Step ",
          i + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-center leading-tight", children: s.label })
      ] }, s.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(currentStep.icon, { className: "h-5 w-5", "aria-hidden": true }),
          currentStep.label
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: stepDescription(currentStep.id) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        currentStep.id === "supabase" && /* @__PURE__ */ jsxRuntimeExports.jsx(SupabaseStep, {}),
        currentStep.id === "env" && /* @__PURE__ */ jsxRuntimeExports.jsx(EnvStep, {}),
        currentStep.id === "deploy" && /* @__PURE__ */ jsxRuntimeExports.jsx(DeployStep, {}),
        currentStep.id === "check" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckStep, { busy, runAll, results, runOne, runningCats, progressPct, healthScore, criticalPassed, failedCritical, info, copyReport, exportReport, summaryRef, hasRun }),
        currentStep.id === "installer" && /* @__PURE__ */ jsxRuntimeExports.jsx(InstallerStep, { canProceed }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse sm:flex-row gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStep((s) => Math.max(0, s - 1)), disabled: step === 0, "aria-label": "Previous step", children: "Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setStep((s) => Math.min(STEPS.length - 1, s + 1)), disabled: step === STEPS.length - 1 || currentStep.id === "check" && !canProceed, className: "flex-1", "aria-label": "Next step", children: [
            currentStep.id === "check" && !canProceed ? "Pass all critical checks to continue" : "Next",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4", "aria-hidden": true })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function SupabaseStep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "Create (or reuse) a Supabase project. From ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Settings → API" }),
      ", copy:"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "Project URL" }),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "SUPABASE_URL" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "anon / publishable key" }),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "SUPABASE_PUBLISHABLE_KEY" }),
        " & ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "VITE_SUPABASE_PUBLISHABLE_KEY" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "service_role key" }),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "SUPABASE_SERVICE_ROLE_KEY" }),
        " (server-only)"
      ] })
    ] })
  ] });
}
function EnvStep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Set these in your hosting environment:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "rounded bg-muted p-3 text-xs overflow-x-auto", children: `SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
LOVABLE_API_KEY=...   # optional, enables AI` })
  ] });
}
function DeployStep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Build and deploy the app:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "rounded bg-muted p-3 text-xs overflow-x-auto", children: `bunx supabase db push   # apply migrations
npm run build           # build the Worker bundle
npx wrangler deploy     # publish to Cloudflare` })
  ] });
}
function CheckStep({
  busy,
  runAll,
  results,
  runOne,
  runningCats,
  progressPct,
  healthScore,
  criticalPassed,
  failedCritical,
  info,
  copyReport,
  exportReport,
  summaryRef,
  hasRun
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    hasRun && failedCritical.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: summaryRef, role: "alert", className: "rounded-lg border border-red-500/50 bg-red-500/10 p-3 sm:p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-sm sm:text-base text-red-700 dark:text-red-300", children: [
        failedCritical.length,
        " issue",
        failedCritical.length !== 1 ? "s" : "",
        " require attention"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-sm", children: failedCritical.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: f.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: f.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
          const el = document.getElementById(`cat-${f.category}`);
          el?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }, "aria-label": `Jump to ${f.category} section`, children: "Fix" })
      ] }, f.key)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => runAll({
        force: true
      }), disabled: busy, className: "flex-1", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin", "aria-hidden": true }),
        "Running checks…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlay, { className: "mr-2 h-4 w-4", "aria-hidden": true }),
        "Run Deployment Check"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: copyReport, disabled: !hasRun, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-2 h-4 w-4", "aria-hidden": true }),
        "Copy Report"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: exportReport, disabled: !hasRun, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4", "aria-hidden": true }),
        "Export JSON"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", "aria-live": "polite", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs sm:text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Deployment Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          progressPct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progressPct, "aria-label": "Deployment check progress" }),
      hasRun && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Overall health score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: healthScore >= 90 ? "default" : healthScore >= 60 ? "secondary" : "destructive", children: [
          healthScore,
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground uppercase", children: "Installation Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: [
        CATEGORIES.map((c) => {
          const state = categoryState(results[c.key]?.items);
          const running = runningCats.has(c.key);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
            running || state === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StateIcon, { state, className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.label })
          ] }, c.key);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm font-medium", children: [
          criticalPassed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-500", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 text-muted-foreground", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Deployment Ready" })
        ] })
      ] })
    ] }),
    hasRun && criticalPassed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-2 border-green-500/50 bg-green-500/5 p-4 sm:p-6 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-10 w-10 text-green-500 mx-auto", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-bold", children: "Deployment Ready" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Your server is correctly configured. You can now safely continue to the installer." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/installer", children: [
        "Open Installer ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4", "aria-hidden": true })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: CATEGORIES.map((c) => {
      const r = results[c.key];
      const state = categoryState(r?.items);
      const running = runningCats.has(c.key);
      const Icon = c.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: `cat-${c.key}`, className: "rounded-lg border overflow-hidden", "aria-labelledby": `cat-title-${c.key}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-2 p-3 bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { id: `cat-title-${c.key}`, className: "font-medium text-sm truncate", children: c.label }),
            r && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: state === "ok" ? "default" : state === "warn" ? "secondary" : "destructive", className: "ml-1", children: state === "ok" ? "Healthy" : state === "warn" ? "Warning" : state === "fail" ? "Failed" : "Pending" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => runOne(c.key, {
            force: true
          }), disabled: running, "aria-label": `Retry ${c.label} checks`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${running ? "animate-spin" : ""}`, "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 hidden sm:inline", children: "Retry" })
          ] })
        ] }),
        r && r.items.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: r.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StateIcon, { state: item.state }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: item.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs uppercase font-semibold ${item.state === "ok" ? "text-green-600" : item.state === "warn" ? "text-amber-600" : "text-red-600"}`, children: item.state })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5 break-words", children: item.message }),
            item.fix && item.state !== "ok" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs rounded bg-muted p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Fix: " }),
              item.fix
            ] })
          ] })
        ] }, item.key)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-xs text-muted-foreground", children: running ? "Running…" : "Not yet run." })
      ] }, c.key);
    }) }),
    info && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 sm:p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground uppercase", children: "Deployment Information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Application Version", value: info.appVersion }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Installer Version", value: info.installerVersion }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Backup Version", value: info.backupVersion }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Deployment Date", value: new Date(info.deploymentDate).toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Runtime", value: info.runtime }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Supabase Region", value: info.supabaseRegion }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Storage Provider", value: info.storageProvider }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "AI Provider", value: info.aiProvider })
      ] })
    ] })
  ] });
}
function InfoRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 border-b border-border/50 py-1 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-mono text-xs sm:text-sm truncate", children: value })
  ] });
}
function InstallerStep({
  canProceed
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 text-sm", children: canProceed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "All critical checks passed." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/installer", children: [
      "Open Installer ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4", "aria-hidden": true })
    ] }) })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border border-amber-500/50 bg-amber-500/10 p-3", children: "Run the Deployment Check first and resolve all critical items before opening the installer." }) });
}
function stepDescription(id) {
  switch (id) {
    case "supabase":
      return "Get your project keys from the Supabase dashboard.";
    case "env":
      return "Load the required environment variables into your host.";
    case "deploy":
      return "Push migrations and deploy the app to Cloudflare.";
    case "check":
      return "One-click preflight — verifies runtime, backend, env, storage, and services.";
    case "installer":
      return "Continue to the in-app installer to create your admin account.";
  }
}
export {
  DeployWizard as component
};
