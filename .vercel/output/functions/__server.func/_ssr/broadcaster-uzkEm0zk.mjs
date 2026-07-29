import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as useRouterState, L as Link, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, b as useServerFn, B as Button, m as cn } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as getBroadcasterAccess } from "./broadcaster.functions-qVw6vjOe.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { aS as ShieldAlert, i as Radio, aQ as LayoutDashboard, bk as Boxes, a$ as ChartColumn, ak as Mic, bl as ListMusic, aq as Calendar, M as Megaphone, p as Settings, C as CircleQuestionMark } from "../_libs/lucide-react.mjs";
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
const NAV = [{
  to: "/broadcaster",
  label: "Dashboard",
  icon: LayoutDashboard,
  exact: true
}, {
  to: "/broadcaster/widgets",
  label: "Live Widgets",
  icon: Boxes
}, {
  to: "/broadcaster/analytics",
  label: "Analytics",
  icon: ChartColumn
}, {
  to: "/broadcaster/mic",
  label: "Mic & Audio",
  icon: Mic
}, {
  to: "/broadcaster/queue",
  label: "Queue Manager",
  icon: ListMusic
}, {
  to: "/broadcaster/schedule",
  label: "Schedule",
  icon: Calendar
}, {
  to: "/broadcaster/announcements",
  label: "Announcements",
  icon: Megaphone
}];
function BroadcasterLayout() {
  const {
    user,
    ready
  } = useAuth();
  const fetchAccess = useServerFn(getBroadcasterAccess);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["broadcaster-access", user?.id],
    queryFn: () => fetchAccess(),
    enabled: !!user && ready,
    staleTime: 3e4
  });
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  if (!ready || isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-sm text-muted-foreground", children: "Loading studio…" });
  }
  if (!user || !data?.isBroadcaster) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-lg font-semibold", children: "Broadcaster access required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Ask an admin for a DJ or RJ role." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back to app" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r bg-card/40 min-h-screen sticky top-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-5 py-4 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Broadcaster" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-1", children: NAV.map((n) => {
        const Icon = n.icon;
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: n.to, className: cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition", active ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
          n.label
        ] }, n.to);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
          " Back to app"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-4 w-4" }),
          " ",
          data?.roles?.join(" · ")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "md:hidden border-b bg-background/80 backdrop-blur sticky top-0 z-30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Broadcaster Studio" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "px-2 pb-2 flex gap-1 overflow-x-auto", children: NAV.map((n) => {
          const Icon = n.icon;
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: n.to, className: cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
            n.label
          ] }, n.to);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "p-4 md:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] })
  ] }) });
}
export {
  BroadcasterLayout as component
};
