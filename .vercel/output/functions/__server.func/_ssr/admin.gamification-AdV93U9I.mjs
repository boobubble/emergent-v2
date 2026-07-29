import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn } from "./router-CYWPFaDK.mjs";
import { l as listGamCatalog, u as upsertGamRow, d as deleteGamRow, a as getGamificationAnalytics } from "./gamification-engine.functions-CTvD5DWu.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { O as Trophy, a$ as ChartColumn, c as Plus, d as Trash2, a1 as Target, a as Sparkles, aq as Calendar } from "../_libs/lucide-react.mjs";
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
const TABS = [{
  key: "gam_achievements",
  label: "Achievements",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }),
  fields: ["key", "name", "description", "event_type", "target", "reward_coins", "reward_xp", "reward_badge", "category", "active"]
}, {
  key: "gam_quests",
  label: "Quests",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
  fields: ["key", "name", "cadence", "event_type", "target", "reward_coins", "reward_xp", "active"]
}, {
  key: "gam_milestones",
  label: "Milestones",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
  fields: ["key", "name", "event_type", "target", "reward_coins", "reward_xp", "reward_badge", "active"]
}, {
  key: "gam_seasons",
  label: "Seasons",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
  fields: ["key", "name", "description", "starts_at", "ends_at", "active"]
}, {
  key: "gam_season_tiers",
  label: "Season Tiers",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
  fields: ["season_id", "tier", "xp_required", "reward_coins", "reward_xp", "reward_badge", "premium_only"]
}];
function AdminGamification() {
  const listFn = useServerFn(listGamCatalog);
  const upFn = useServerFn(upsertGamRow);
  const delFn = useServerFn(deleteGamRow);
  const anFn = useServerFn(getGamificationAnalytics);
  const qc = useQueryClient();
  const [tab, setTab] = reactExports.useState("gam_achievements");
  const [draft, setDraft] = reactExports.useState({});
  const {
    data
  } = useQuery({
    queryKey: ["gam-catalog"],
    queryFn: () => listFn({})
  });
  const {
    data: analytics
  } = useQuery({
    queryKey: ["gam-analytics"],
    queryFn: () => anFn({})
  });
  const upsert = useMutation({
    mutationFn: (row) => upFn({
      data: {
        table: tab,
        row
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["gam-catalog"]
      });
      setDraft({});
    }
  });
  const del = useMutation({
    mutationFn: (id) => delFn({
      data: {
        table: tab,
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["gam-catalog"]
    })
  });
  const active = TABS.find((t) => t.key === tab);
  const rows = data?.[tab === "gam_achievements" ? "achievements" : tab === "gam_quests" ? "quests" : tab === "gam_milestones" ? "milestones" : tab === "gam_seasons" ? "seasons" : "tiers"] ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-2xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-6 w-6 text-primary" }),
        " Gamification"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage achievements, quests, milestones, and the season pass. Rewards run through the existing Wallet, XP, Badges & Notifications systems." })
    ] }),
    analytics && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase text-muted-foreground", children: "Quest completion (7d)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
          Math.round((analytics.questCompletionRate ?? 0) * 100),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase text-muted-foreground", children: "Events (7d)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: Object.values(analytics.events7d ?? {}).reduce((a, b) => a + b, 0) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase text-muted-foreground", children: "Top event" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: Object.entries(analytics.events7d ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 text-xs uppercase text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3 w-3" }),
          " Events by type"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 text-xs", children: Object.entries(analytics.events7d ?? {}).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-border bg-muted/40 px-2 py-1", children: [
          k,
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: v })
        ] }, k)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-wrap gap-2", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
      setTab(t.key);
      setDraft({});
    }, className: `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${tab === t.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`, children: [
      t.icon,
      " ",
      t.label
    ] }, t.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 text-sm font-bold", children: [
        "New ",
        active.label.slice(0, -1)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: active.fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: f }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: String(draft[f] ?? ""), onChange: (e) => setDraft({
          ...draft,
          [f]: e.target.value
        }), className: "mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-sm" })
      ] }, f)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        const row = {};
        for (const f of active.fields) {
          const v = draft[f];
          if (v === "" || v === void 0) continue;
          const numFields = ["target", "reward_coins", "reward_xp", "tier", "xp_required"];
          const boolFields = ["active", "premium_only"];
          row[f] = numFields.includes(f) ? Number(v) : boolFields.includes(f) ? v === "true" || v === true : v;
        }
        upsert.mutate(row);
      }, className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
        " Save"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "overflow-hidden rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        active.fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 font-semibold", children: f }, f)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
        active.fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: String(r[f] ?? "") }, f)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => del.mutate(String(r.id)), className: "text-red-500 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
      ] }, String(r.id))) })
    ] }) })
  ] });
}
export {
  AdminGamification as component
};
