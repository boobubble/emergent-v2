import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, cF as getLeaderboard, B as Button } from "./router-CYWPFaDK.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-gAgf0_IN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, O as Trophy } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/radix-ui__react-avatar.mjs";
function LeaderboardPage() {
  const fn = useServerFn(getLeaderboard);
  const [range, setRange] = reactExports.useState("all");
  const {
    data
  } = useQuery({
    queryKey: ["competition-leaderboard", range],
    queryFn: () => fn({
      data: {
        range
      }
    })
  });
  const Row = ({
    r,
    unit,
    i
  }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-sm font-bold text-muted-foreground", children: i + 1 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: r.profile?.avatar_url ?? void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: {
        background: r.profile?.avatar_color ?? void 0
      }, children: (r.profile?.username ?? "?").slice(0, 1).toUpperCase() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1 truncate text-sm font-semibold", children: r.profile?.username ?? "Anonymous" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold tabular-nums", children: [
      r.count,
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: unit })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24 text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-4xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-lg font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-400" }),
        " Competition Leaderboard"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-4xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex gap-2", children: ["week", "month", "all"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: range === r ? "default" : "outline", onClick: () => setRange(r), children: r === "week" ? "Weekly" : r === "month" ? "Monthly" : "All Time" }, r)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "wins", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "wins", children: "Most Wins" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "votes", children: "Most Votes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "joins", children: "Most Joined" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "wins", className: "mt-4 space-y-2", children: (data?.wins ?? []).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { r, unit: "wins", i }, r.user_id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "votes", className: "mt-4 space-y-2", children: (data?.votes ?? []).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { r, unit: "votes", i }, r.user_id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "joins", className: "mt-4 space-y-2", children: (data?.joins ?? []).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { r, unit: "joined", i }, r.user_id)) })
      ] })
    ] })
  ] });
}
export {
  LeaderboardPage as component
};
