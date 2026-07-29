import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { aJ as AdminPageHeader, B as Button, aM as Switch } from "./router-CYWPFaDK.mjs";
import { f as formatClearReport, c as clearCaches } from "./cache-manager-cID9K-3q.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { ba as HardDrive, b9 as Database, bd as RefreshCw, bU as ServerCrash, a0 as LoaderCircle, d as Trash2, bz as CircleCheck, bG as Terminal } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./rate-limit-middleware-CAVrvtrO.mjs";
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
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
function Page() {
  const queryClient = useQueryClient();
  const [opts, setOpts] = reactExports.useState({
    localStorage: true,
    sessionStorage: true,
    queryCache: true,
    serviceWorkerCaches: true,
    reload: false
  });
  const [running, setRunning] = reactExports.useState(false);
  const [lastReport, setLastReport] = reactExports.useState(null);
  async function run() {
    setRunning(true);
    try {
      const report = await clearCaches({
        ...opts,
        queryClient
      });
      setLastReport(report);
      toast.success("Caches cleared", {
        description: formatClearReport(report)
      });
    } catch (e) {
      toast.error("Failed to clear caches", {
        description: e.message
      });
    } finally {
      setRunning(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Cache & Maintenance Tools", description: "Clear client-side caches, rebuild stale data, and recover from glitches." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "h-4 w-4" }), title: "Local storage", desc: "Drafts, preferences, and chat cache. Auth session is preserved.", checked: !!opts.localStorage, onChange: (v) => setOpts((o) => ({
        ...o,
        localStorage: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-4 w-4" }), title: "Session storage", desc: "Per-tab temporary data.", checked: !!opts.sessionStorage, onChange: (v) => setOpts((o) => ({
        ...o,
        sessionStorage: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }), title: "Query cache", desc: "In-memory React Query cache (forces refetch).", checked: !!opts.queryCache, onChange: (v) => setOpts((o) => ({
        ...o,
        queryCache: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ServerCrash, { className: "h-4 w-4" }), title: "Service worker caches", desc: "Cached assets and offline payloads (CacheStorage API).", checked: !!opts.serviceWorkerCaches, onChange: (v) => setOpts((o) => ({
        ...o,
        serviceWorkerCaches: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }), title: "Reload app after", desc: "Reload the page to rehydrate fresh.", checked: !!opts.reload, onChange: (v) => setOpts((o) => ({
        ...o,
        reload: v
      })) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: run, disabled: running, className: "gap-2", children: [
        running ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
        running ? "Clearing…" : "Clear selected caches"
      ] }),
      lastReport && !running && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
        formatClearReport(lastReport)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-muted/30 p-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 font-semibold text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-4 w-4" }),
        " Chat & Feed command"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Admins can also clear caches inline by typing",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-background px-1.5 py-0.5 font-mono text-foreground", children: "/clearcache" }),
        " ",
        "in any chatroom or in the feed composer. The command runs the default options above and never posts a public message."
      ] })
    ] })
  ] });
}
function Toggle({
  icon,
  title,
  desc,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-semibold text-foreground", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: desc })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked, onCheckedChange: onChange })
  ] });
}
export {
  Page as component
};
