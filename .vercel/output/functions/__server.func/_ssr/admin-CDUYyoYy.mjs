import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { N as Navigate, L as Link, O as Outlet, f as useRouterState } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, b as useServerFn, _ as getMyRoles, $ as getOwnerStatus, B as Button, R as RouteErrorBoundary, a0 as Input } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as ADMIN_NAV, f as flattenAdminNav } from "./AdminNav-DaKVrF66.mjs";
import { S as Sheet, a as SheetContent } from "./sheet-CorLZxGP.mjs";
import { S as ScrollArea } from "./scroll-area-88D-EwEX.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { u as useThemeMode } from "./use-theme-mode-DLsH6S68.mjs";
import { u as useAdminMode } from "./admin-mode-C63OAOLU.mjs";
import { A as APP_VERSION } from "./app-version-8YDb-xNu.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { au as ShieldCheck, N as Search, a as Sparkles, A as ArrowLeft, aN as Menu, H as House, a6 as ChevronRight, a8 as Moon, aO as Monitor, a7 as Sun, aP as ChevronDown } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__number.mjs";
function AdminLayout() {
  const {
    user,
    ready
  } = useAuth();
  const fetchRoles = useServerFn(getMyRoles);
  const fetchOwnerStatus = useServerFn(getOwnerStatus);
  const {
    data: ownerStatus,
    isLoading: ownerLoading
  } = useQuery({
    queryKey: ["owner-status-guard"],
    queryFn: () => fetchOwnerStatus({}),
    enabled: true,
    staleTime: 6e4
  });
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: () => fetchRoles({}),
    enabled: !!user && ready,
    staleTime: 3e4
  });
  if (ownerLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-sm text-muted-foreground", children: "Checking setup…" });
  }
  if (ownerStatus?.installed && !ownerStatus?.hasOwner) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/setup-wizard", replace: true });
  }
  if (!ready || isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-sm text-muted-foreground", children: "Checking access…" });
  }
  if (isError || !data?.isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-lg font-semibold", children: "Admin access required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "You don't have permission to view this page." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back to app" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { isSuper: data.isSuperAdmin });
}
function AdminShell({
  isSuper
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen w-full bg-muted/40 dark:bg-[#0b0d12]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden md:flex md:w-[260px] md:flex-col md:border-r md:border-white/5 md:bg-[#10131a] md:text-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent, { isSuper }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { side: "left", className: "w-72 border-r border-white/5 bg-[#10131a] p-0 text-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent, { isSuper, onNavigate: () => setOpen(false) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, { onMenu: () => setOpen(true) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-x-hidden p-4 sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-full max-w-6xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading module…" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteErrorBoundary, { section: "Admin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }) }) }) })
    ] })
  ] });
}
function SidebarContent({
  isSuper,
  onNavigate
}) {
  const path = useRouterState({
    select: (s) => s.location.pathname
  });
  const {
    mode,
    setMode,
    isAdvanced
  } = useAdminMode();
  const [query, setQuery] = reactExports.useState("");
  const [openGroups, setOpenGroups] = reactExports.useState({});
  const visibleGroups = reactExports.useMemo(() => {
    return ADMIN_NAV.filter((g) => (g.superOnly ? isSuper : true) && (g.advanced ? isSuper && isAdvanced : true)).map((g) => {
      if (!g.children) return g;
      const children = g.children.filter((c) => (c.superOnly ? isSuper : true) && (c.advanced ? isSuper && isAdvanced : true));
      return {
        ...g,
        children
      };
    }).filter((g) => g.to || g.children && g.children.length);
  }, [isSuper, isAdvanced]);
  reactExports.useEffect(() => {
    for (const g of visibleGroups) {
      if (!g.children) continue;
      if (g.children.some((c) => path === c.to || path.startsWith(c.to + "/"))) {
        setOpenGroups((prev) => prev[g.label] ? prev : {
          ...prev,
          [g.label]: true
        });
      }
    }
  }, [path, visibleGroups]);
  const flatMatches = reactExports.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return flattenAdminNav(visibleGroups).filter((i) => {
      const hay = [i.label, i.description ?? "", i.groupLabel, ...i.keywords ?? []].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [visibleGroups, query]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-14 items-center gap-2.5 border-b border-white/5 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-md bg-primary/20 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold text-white", children: "Admin Panel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-slate-400", children: isSuper ? "Super Admin" : "Admin" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b border-white/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search…", className: "h-8 border-white/10 bg-white/[0.04] pl-7 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary/40" })
      ] }),
      isSuper && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] p-0.5 text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMode("basic"), className: `flex-1 rounded px-2 py-1 transition ${mode === "basic" ? "bg-white/10 font-medium text-white" : "text-slate-400 hover:text-white"}`, children: "Basic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setMode("advanced"), className: `inline-flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 transition ${mode === "advanced" ? "bg-white/10 font-medium text-white" : "text-slate-400 hover:text-white"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
          "Advanced"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 px-2 py-3", children: flatMatches ? /* @__PURE__ */ jsxRuntimeExports.jsx(FlatResults, { items: flatMatches, path, onNavigate, query }) : /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-0.5", children: visibleGroups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(GroupNode, { group: g, path, open: !!openGroups[g.label], onToggle: () => setOpenGroups((p) => ({
      ...p,
      [g.label]: !p[g.label]
    })), onNavigate }, g.label)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t border-white/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full justify-start gap-2 border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10 hover:text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Back to app"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-slate-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-wider", children: "Version" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold text-slate-200", children: [
          "v",
          APP_VERSION
        ] })
      ] })
    ] })
  ] });
}
function GroupNode({
  group,
  path,
  open,
  onToggle,
  onNavigate
}) {
  const Icon = group.icon;
  if (group.to && !group.children?.length) {
    const active = group.to === "/admin" ? path === "/admin" : path === group.to || path.startsWith(group.to + "/");
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: group.to, onClick: onNavigate, className: `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: group.label }),
      active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto h-1.5 w-1.5 rounded-full bg-primary" })
    ] });
  }
  const Chev = open ? ChevronDown : ChevronRight;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onToggle, className: "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white", "aria-expanded": open, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: group.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Chev, { className: "ml-auto h-3.5 w-3.5 text-slate-500" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 space-y-0.5 pb-1 pl-9", children: group.children.map((c) => {
      const active = path === c.to || path.startsWith(c.to + "/");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: c.to, onClick: onNavigate, className: `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition ${active ? "bg-primary/15 text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.label }),
        c.badge && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-auto h-4 border-white/10 px-1.5 text-[9px] text-slate-300", children: c.badge })
      ] }, c.to);
    }) })
  ] });
}
function FlatResults({
  items,
  path,
  onNavigate,
  query
}) {
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-6 text-center text-xs text-slate-500", children: [
      "No settings match “",
      query,
      "”."
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children: items.map((i) => {
    const Icon = i.icon;
    const active = path === i.to || path.startsWith(i.to + "/");
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: i.to, onClick: onNavigate, className: `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"}`, children: [
      Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0 text-slate-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: i.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto truncate text-[10px] text-slate-500", children: i.groupLabel })
    ] }, i.to);
  }) });
}
function TopNav({
  onMenu
}) {
  const path = useRouterState({
    select: (s) => s.location.pathname
  });
  const flat = reactExports.useMemo(() => flattenAdminNav(), []);
  const current = reactExports.useMemo(() => {
    if (path === "/admin") return {
      to: "/admin",
      label: "Dashboard",
      groupLabel: "Dashboard"
    };
    return flat.find((i) => path === i.to || path.startsWith(i.to + "/"));
  }, [path, flat]);
  const {
    mode,
    setMode
  } = useThemeMode();
  const next = {
    light: "dark",
    dark: "system",
    system: "light"
  };
  const Icon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: onMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin", className: "hover:text-foreground", children: "Home" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 opacity-60" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium uppercase tracking-wide text-primary", children: current?.label ?? "Admin" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: `Theme: ${mode}`, onClick: () => setMode(next[mode]), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }) })
  ] });
}
export {
  AdminLayout as component
};
