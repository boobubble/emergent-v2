import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, aZ as adminCommunityReport, aJ as AdminPageHeader, ae as Card, af as CardContent } from "./router-CYWPFaDK.mjs";
import { C as CommunityBadges } from "./CommunityBadges-BE2_BUKN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { ap as Globe, U as Users, bt as Archive, bg as TrendingUp, bj as BadgeCheck, S as Shield, l as Star, a as Sparkles } from "../_libs/lucide-react.mjs";
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
import "./badge-CCbPDVfk.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
function AdminCommunityReports() {
  const fetchFn = useServerFn(adminCommunityReport);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-community-report"],
    queryFn: () => fetchFn({}),
    refetchInterval: 6e4
  });
  const t = data?.totals;
  const top = data?.topByMembers ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl space-y-4 px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Community Reports", description: "Platform-wide overview of community activity, trust badges and archive state." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Globe, label: "All communities", value: t?.all, loading: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Active", value: t?.active, loading: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Archive, label: "Archived", value: t?.archived, loading: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: TrendingUp, label: "New (7d)", value: t?.newLast7d, loading: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: BadgeCheck, label: "Verified", value: t?.verified, loading: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Shield, label: "Official", value: t?.official, loading: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Star, label: "Featured", value: t?.featured, loading: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Sparkles, label: "—", value: void 0, loading: false })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 mt-4 text-sm font-semibold", children: "Top communities by members" }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : top.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No communities yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: top.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/community/$slug", params: {
        slug: c.slug
      }, className: "flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-right text-sm font-semibold tabular-nums text-muted-foreground", children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 shrink-0 rounded-full bg-cover bg-center", style: {
          background: c.logo_url ? `url(${c.logo_url}) center/cover` : c.accent_color ?? "hsl(var(--muted))"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityBadges, { c })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "/",
            c.slug
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm tabular-nums text-muted-foreground", children: [
          c.member_count?.toLocaleString?.() ?? 0,
          " members"
        ] })
      ] }, c.id)) })
    ] })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value,
  loading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl font-semibold tabular-nums", children: loading ? "…" : (value ?? 0).toLocaleString() })
  ] }) });
}
export {
  AdminCommunityReports as component
};
