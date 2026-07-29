import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { r as LogIn, g as MessageSquare, c9 as MessagesSquare, U as Users, ay as Newspaper, x as Bell, i as Radio } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
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
const CHANNELS = [{
  key: "chat",
  label: "Chat Realtime",
  icon: MessageSquare,
  description: "Public + private room messages.",
  status: "active"
}, {
  key: "dm",
  label: "DM Realtime",
  icon: MessagesSquare,
  description: "Direct messages between friends.",
  status: "active"
}, {
  key: "presence",
  label: "Presence System",
  icon: Users,
  description: "Online / typing indicators.",
  status: "active"
}, {
  key: "feed",
  label: "Feed Realtime",
  icon: Newspaper,
  description: "New posts, reactions and comments.",
  status: "active"
}, {
  key: "notifications",
  label: "Notifications Realtime",
  icon: Bell,
  description: "Live in-app notification delivery.",
  status: "active"
}];
function StatusBadge({
  status
}) {
  const tone = status === "active" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : status === "degraded" ? "bg-amber-500/15 text-amber-600 dark:text-amber-300" : "bg-red-500/15 text-red-600 dark:text-red-300";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `h-5 border-0 px-1.5 text-[10px] capitalize ${tone}`, children: status });
}
function RealtimePage() {
  const {
    raw,
    refresh
  } = useAppSettings();
  const presenceMessages = raw.presence_messages !== false;
  const save = useServerFn(updateSetting);
  const mut = useMutation({
    mutationFn: async (value) => save({
      data: {
        key: "presence_messages",
        value
      }
    }),
    onSuccess: () => {
      void refresh();
      toast.success("Presence messages updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Realtime", description: "Monitoring placeholders for live channels. Live metrics ship in a later step — current realtime implementation is unchanged." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Show Presence Messages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "Display lightweight join/leave system lines inside public chatrooms. Anti-spam: join after 10s connected, leave after 15s offline, 60s cooldown per user." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: presenceMessages, onCheckedChange: (v) => mut.mutate(v), disabled: mut.isPending })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: CHANNELS.map((c) => {
      const Icon = c.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: c.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: c.status }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Subs", value: "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Msg/s", value: "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Errors", value: "—" })
        ] })
      ] }) }, c.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center gap-2 p-8 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-7 w-7 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: "Debug stream placeholder — wire to Supabase Realtime metrics later." })
    ] }) })
  ] });
}
function Metric({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/30 p-2 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-mono font-semibold", children: value })
  ] });
}
export {
  RealtimePage as component
};
