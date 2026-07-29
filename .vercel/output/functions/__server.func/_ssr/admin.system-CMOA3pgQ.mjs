import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { aJ as AdminPageHeader, ae as Card, ag as CardHeader, ah as CardTitle, ai as CardDescription, af as CardContent, B as Button } from "./router-CYWPFaDK.mjs";
import { f as fetchInstallStatus, r as resetInstallation } from "./installer-Zqriv3Yc.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { B as Bug, b6 as KeyRound, b5 as History, b7 as ListOrdered, b8 as Server, i as Radio, b9 as Database, ba as HardDrive, aC as Activity, R as RotateCcw, bz as CircleCheck, T as TriangleAlert } from "../_libs/lucide-react.mjs";
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
function SystemPage() {
  const navigate = useNavigate();
  const [status, setStatus] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [confirm, setConfirm] = reactExports.useState(false);
  reactExports.useEffect(() => {
    fetchInstallStatus().then(setStatus);
  }, []);
  async function onReset() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    try {
      await resetInstallation();
      toast.success("Installer reset. Redirecting…");
      setTimeout(() => navigate({
        to: "/installer"
      }), 600);
    } catch (e) {
      toast.error(e?.message ?? "Reset failed");
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "System", description: "Monitoring, health checks, and installer controls. Super admin only." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [{
      to: "/admin/error-logs",
      label: "Error Logs",
      icon: Bug
    }, {
      to: "/admin/api",
      label: "API Logs",
      icon: KeyRound
    }, {
      to: "/admin/activity-logs",
      label: "Auth Logs",
      icon: History
    }, {
      to: "/admin/system/queue",
      label: "Queue Status",
      icon: ListOrdered
    }, {
      to: "/admin/system/jobs",
      label: "Background Jobs",
      icon: Server
    }, {
      to: "/admin/realtime",
      label: "Realtime Status",
      icon: Radio
    }, {
      to: "/admin/system/database",
      label: "Database Health",
      icon: Database
    }, {
      to: "/admin/system/storage",
      label: "Storage Health",
      icon: HardDrive
    }, {
      to: "/admin/performance",
      label: "Performance Metrics",
      icon: Activity
    }].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: item.to, className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium hover:bg-muted/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-4 w-4 text-primary" }),
      item.label
    ] }, item.to)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-4 w-4" }),
        " Cloud Backend"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "System internals are managed via Lovable Cloud." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
          " Installer"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Lock state for the /installer setup wizard." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-3", children: status?.installed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-sm space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-emerald-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
          " Installed"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          status.installed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "At: ",
            new Date(status.installed_at).toLocaleString(),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {})
          ] }),
          "License: ",
          status.license_type ?? "—",
          " • Mode: ",
          status.mode ?? "—",
          " • Version: ",
          status.version ?? "—"
        ] }),
        confirm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs", children: "This will clear the installer lock. Anyone with the URL can run /installer again — including creating a new super admin if none exists. Continue?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: confirm ? "destructive" : "outline", onClick: onReset, disabled: busy, size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-2 h-3.5 w-3.5" }),
            confirm ? "Yes, Reset Installer" : "Reset Installer Lock"
          ] }),
          confirm && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setConfirm(false), children: "Cancel" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
          " Installer is unlocked"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The setup wizard has not been locked yet. Complete installation at /installer to enable this control." })
      ] }) })
    ] })
  ] });
}
export {
  SystemPage as component
};
