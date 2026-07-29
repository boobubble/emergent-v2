import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a1 as readStoredBan, B as Button, a2 as clearStoredBan } from "./router-CYWPFaDK.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { aS as ShieldAlert, _ as Clock, A as ArrowLeft } from "../_libs/lucide-react.mjs";
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
function formatRemaining(iso) {
  if (!iso) return {
    label: "This ban is permanent.",
    critical: true
  };
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return {
    label: "Your ban has just expired — try signing in again.",
    critical: false
  };
  const mins = Math.floor(diff / 6e4);
  if (mins < 60) return {
    label: `${mins} minute${mins === 1 ? "" : "s"} remaining`,
    critical: false
  };
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) {
    const m = mins % 60;
    return {
      label: `${hrs}h ${m}m remaining`,
      critical: false
    };
  }
  const days = Math.floor(hrs / 24);
  return {
    label: `${days} day${days === 1 ? "" : "s"} remaining`,
    critical: false
  };
}
function BannedPage() {
  const [ban, setBan] = reactExports.useState(null);
  const [, setTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    setBan(readStoredBan());
    const id = setInterval(() => setTick((n) => n + 1), 3e4);
    return () => clearInterval(id);
  }, []);
  const remaining = formatRemaining(ban?.expires_at ?? null);
  const expired = !!ban?.expires_at && new Date(ban.expires_at).getTime() <= Date.now();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-7 w-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-xl font-semibold tracking-tight", children: "Your account is suspended" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "You've been signed out because a moderator banned this account." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/30 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: ban?.reason?.trim() ? ban.reason : "No reason was provided by the moderator." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-2 rounded-xl border p-4 ${remaining.critical ? "border-destructive/30 bg-destructive/5" : "bg-muted/30"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: `mt-0.5 h-4 w-4 ${remaining.critical ? "text-destructive" : "text-muted-foreground"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: remaining.label }),
          ban?.expires_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [
            "Until ",
            new Date(ban.expires_at).toLocaleString()
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-xs text-muted-foreground", children: "If you believe this is a mistake, contact the moderation team. Creating another account to bypass the suspension may result in a permanent ban." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/welcome", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Back to landing"
      ] }) }),
      expired && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => clearStoredBan(), children: "Try signing in" }) })
    ] })
  ] }) });
}
export {
  BannedPage as component
};
