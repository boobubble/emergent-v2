import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn } from "./router-CYWPFaDK.mjs";
import { g as getMyGamification, c as claimSeasonTier } from "./gamification-engine.functions-CTvD5DWu.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { O as Trophy, a as Sparkles, W as Lock, a1 as Target, bz as CircleCheck } from "../_libs/lucide-react.mjs";
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
function Bar({
  value,
  max
}) {
  const pct = Math.min(100, Math.round(value / Math.max(1, max) * 100));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: {
    width: `${pct}%`
  } }) });
}
function Card({
  row,
  icon
}) {
  const done = !!row.progress?.completed_at;
  const p = row.progress?.progress ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-2xl border p-4 ${done ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-xl bg-muted", children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-primary" }) : icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: row.name }),
      row.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: row.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { value: p, max: row.target }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center justify-between text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          p,
          "/",
          row.target
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "+",
          row.reward_coins,
          "🪙 · +",
          row.reward_xp,
          "xp"
        ] })
      ] })
    ] })
  ] }) });
}
function Page() {
  const fn = useServerFn(getMyGamification);
  const claim = useServerFn(claimSeasonTier);
  const qc = useQueryClient();
  const {
    data
  } = useQuery({
    queryKey: ["my-gamification"],
    queryFn: () => fn({})
  });
  const claimMut = useMutation({
    mutationFn: (v) => claim({
      data: v
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["my-gamification"]
    })
  });
  if (!data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-sm text-muted-foreground", children: "Loading…" });
  const dailies = data.quests.filter((q) => q.cadence === "daily");
  const weeklies = data.quests.filter((q) => q.cadence === "weekly");
  const monthlies = data.quests.filter((q) => q.cadence === "monthly");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl space-y-8 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-2xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-6 w-6 text-primary" }),
        " Gamification"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Overall completion: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
          data.completionPct,
          "%"
        ] })
      ] })
    ] }),
    data.season && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Season" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: data.season.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Tier ",
            data.seasonProgress?.tier ?? 0,
            " · ",
            data.seasonProgress?.xp ?? 0,
            " XP"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6 text-primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4", children: data.tiers.map((t) => {
        const reached = (data.seasonProgress?.tier ?? 0) >= t.tier;
        const claimed = (data.seasonProgress?.claimed_tiers ?? []).includes(t.tier);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !reached || claimed || claimMut.isPending, onClick: () => claimMut.mutate({
          seasonId: data.season.id,
          tier: t.tier
        }), className: `rounded-xl border p-3 text-left text-xs transition-all ${reached ? "border-primary/40 bg-card hover:bg-primary/10" : "border-border bg-muted/30 text-muted-foreground"} ${claimed ? "opacity-60" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-bold", children: [
            t.premium_only && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
            " Tier ",
            t.tier
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "+",
            t.reward_coins,
            "🪙 · +",
            t.reward_xp,
            "xp"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px]", children: claimed ? "Claimed" : reached ? "Claim" : `${t.xp_required} XP` })
        ] }, t.id);
      }) })
    ] }),
    dailies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 flex items-center gap-2 text-sm font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
        " Daily Quests"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: dailies.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { row: q, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" }) }, q.id)) })
    ] }),
    weeklies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 flex items-center gap-2 text-sm font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
        " Weekly Quests"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: weeklies.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { row: q, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" }) }, q.id)) })
    ] }),
    monthlies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 flex items-center gap-2 text-sm font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
        " Monthly Missions"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: monthlies.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { row: q, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" }) }, q.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 flex items-center gap-2 text-sm font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }),
        " Achievements"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: data.achievements.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { row: a, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5" }) }, a.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-bold", children: "Lifetime Milestones" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: data.milestones.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { row: m, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5" }) }, m.id)) })
    ] })
  ] });
}
export {
  Page as component
};
