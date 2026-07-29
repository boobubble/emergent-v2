import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, b as useServerFn, aH as getAnalytics, aI as getRealtimeOverview, ae as Card, af as CardContent, u as useAppSettings, aF as updateSetting, ag as CardHeader, ah as CardTitle, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { S as Skeleton } from "./skeleton-CsqSgU8F.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { J as UsersRound, ay as Newspaper, aZ as FileText, bM as Wifi, g as MessageSquare, o as Gamepad2, a$ as ChartColumn, ak as Mic, a as Sparkles, x as Bell, be as Wrench } from "../_libs/lucide-react.mjs";
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
const QUICK = [
  { key: "feed", label: "Social Feed", icon: Newspaper },
  { key: "games", label: "Games", icon: Gamepad2 },
  { key: "voice", label: "Voice Rooms", icon: Mic },
  { key: "ai", label: "AI Tools", icon: Sparkles },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "maintenance", label: "Maintenance Mode", icon: Wrench }
];
function QuickToggles() {
  const { modules, raw, refresh } = useAppSettings();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (p) => saveSetting({ data: p }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Saved");
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const maintenance = Boolean(raw.maintenance?.enabled);
  const toggle = (item, v) => {
    if (item.key === "maintenance") {
      mut.mutate({ key: "maintenance", value: { enabled: v } });
    } else {
      mut.mutate({ key: "modules", value: { ...modules, [item.key]: v } });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Quick settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fast access to the most important toggles." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3", children: QUICK.map((item) => {
      const Icon = item.icon;
      const on = item.key === "maintenance" ? maintenance : modules[item.key];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "label",
        {
          className: "flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1 text-sm font-medium", children: item.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: !!on, onCheckedChange: (v) => toggle(item, v), disabled: mut.isPending })
          ]
        },
        item.key
      );
    }) }) })
  ] });
}
function AdminDashboard() {
  const {
    user
  } = useAuth();
  const fetchAnalytics = useServerFn(getAnalytics);
  const fetchLive = useServerFn(getRealtimeOverview);
  const analytics = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => fetchAnalytics({}),
    staleTime: 6e4
  });
  const live = useQuery({
    queryKey: ["admin", "live"],
    queryFn: () => fetchLive({}),
    refetchInterval: 15e3
  });
  const stats = [{
    key: "users",
    label: "Total Users",
    icon: UsersRound,
    tint: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    value: analytics.data?.totalUsers,
    href: "/admin/users"
  }, {
    key: "posts",
    label: "Total Posts",
    icon: Newspaper,
    tint: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    value: analytics.data?.postsTotal,
    href: "/admin/social-feed"
  }, {
    key: "pages",
    label: "Total Pages",
    icon: FileText,
    tint: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    value: void 0,
    href: "/admin/pages"
  }, {
    key: "online",
    label: "Online Users",
    icon: Wifi,
    tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    value: live.data?.onlineUsers,
    href: "/admin/users"
  }, {
    key: "comments",
    label: "Total Comments",
    icon: MessageSquare,
    tint: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    value: analytics.data?.messages24,
    href: "/admin/chatrooms"
  }, {
    key: "games",
    label: "Total Games",
    icon: Gamepad2,
    tint: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    value: analytics.data?.games24,
    href: "/admin/games"
  }];
  const series = analytics.data?.newUsersByDay ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-semibold tracking-tight", children: [
      "Welcome back",
      user?.username ? `, ${user.username}` : ""
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: stats.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: s.href, className: "group", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60 transition hover:border-primary/40 hover:shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: s.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-10 w-10 place-items-center rounded-full ${s.tint}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-4.5 w-4.5" }) }),
        analytics.isLoading || live.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-16" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold tabular-nums", children: (s.value ?? 0).toLocaleString() })
      ] })
    ] }) }) }, s.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider", children: "Statistics" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/analytics", className: "text-xs text-primary hover:underline", children: "View analytics" })
      ] }),
      analytics.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MiniBarChart, { data: series })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QuickToggles, {})
  ] });
}
function MiniBarChart({
  data
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const labelFor = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString(void 0, {
      weekday: "short"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-48 items-end gap-2 sm:gap-4", children: [
      data.map((d) => {
        const h = Math.max(4, Math.round(d.count / max * 100));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex h-full w-full items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all", style: {
            height: `${h}%`
          }, title: `${d.count} new users` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: labelFor(d.day) })
        ] }, d.day);
      }),
      data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center text-xs text-muted-foreground", children: "No data yet." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[11px] text-muted-foreground", children: "New users · last 7 days" })
  ] });
}
export {
  AdminDashboard as component
};
