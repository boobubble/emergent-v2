import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, aH as getAnalytics, aI as getRealtimeOverview, aN as getTopUsers, aJ as AdminPageHeader, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { S as Skeleton } from "./skeleton-CsqSgU8F.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { bM as Wifi, bF as Hash, o as Gamepad2, aZ as FileText, U as Users, bg as TrendingUp, g as MessageSquare } from "../_libs/lucide-react.mjs";
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
function AnalyticsPage() {
  const fetchAnalytics = useServerFn(getAnalytics);
  const fetchLive = useServerFn(getRealtimeOverview);
  const fetchTop = useServerFn(getTopUsers);
  const a = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => fetchAnalytics({}),
    staleTime: 3e4,
    refetchInterval: 6e4
  });
  const live = useQuery({
    queryKey: ["admin", "live"],
    queryFn: () => fetchLive({}),
    refetchInterval: 15e3
  });
  const top = useQuery({
    queryKey: ["admin", "topusers"],
    queryFn: () => fetchTop({}),
    staleTime: 6e4
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Analytics", description: "Lightweight overview of community activity.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500" })
      ] }),
      "Live"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Wifi, label: "Online now", value: live.data?.onlineUsers, loading: live.isLoading, tone: "ok" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Hash, label: "Active rooms", value: live.data?.activeRooms, loading: live.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Gamepad2, label: "Active games", value: live.data?.activeGames, loading: live.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: FileText, label: "Posts / min", value: live.data?.postsLastMinute, loading: live.isLoading })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Total users", value: a.data?.totalUsers, loading: a.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: TrendingUp, label: "New users 24h", value: a.data?.newUsers24, loading: a.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: MessageSquare, label: "Messages 24h", value: a.data?.messages24, loading: a.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: FileText, label: "Posts 24h", value: a.data?.posts24, loading: a.isLoading })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Daily signups (7d)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: a.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { data: (a.data?.newUsersByDay ?? []).map((d) => ({
          label: d.day.slice(5),
          value: d.count
        })) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Top rooms (24h messages)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2", children: a.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : (a.data?.topChannels ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No activity yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BarList, { items: (a.data?.topChannels ?? []).map((c) => ({
          label: c.channel,
          value: c.count
        })) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Top users by XP" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: top.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4", children: (top.data ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-border/60 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white", style: {
            background: u.avatar_url ? `url(${u.avatar_url}) center/cover` : u.avatar_color
          }, children: !u.avatar_url && (u.username?.[0] ?? "?").toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-medium", children: u.username }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
              "Lv ",
              u.level,
              " · ",
              u.xp,
              " XP"
            ] })
          ] })
        ] }, u.id)) }) })
      ] })
    ] })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value,
  loading,
  tone
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-baseline gap-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-12" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold tabular-nums", children: value ?? 0 }),
      tone === "ok" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500" })
    ] })
  ] }) });
}
function Sparkline({
  data
}) {
  if (!data.length) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No data." });
  const w = 320, h = 96, pad = 6;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => `${pad + i * step},${h - pad - d.value / max * (h - pad * 2)}`).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${w} ${h}`, className: "h-28 w-full", preserveAspectRatio: "none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { fill: "none", stroke: "hsl(var(--primary))", strokeWidth: "2", points }),
      data.map((d, i) => {
        const x = pad + i * step;
        const y = h - pad - d.value / max * (h - pad * 2);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: x, cy: y, r: "2.5", fill: "hsl(var(--primary))" }, i);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex justify-between text-[10px] text-muted-foreground", children: data.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: d.label }, d.label)) })
  ] });
}
function BarList({
  items
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: i.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-muted-foreground", children: i.value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 h-1.5 w-full rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-primary", style: {
      width: `${i.value / max * 100}%`
    } }) })
  ] }, i.label)) });
}
export {
  AnalyticsPage as component
};
