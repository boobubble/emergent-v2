import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn } from "./router-CYWPFaDK.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { r as rankFor, l as levelProgress } from "./EmojiPicker-DcAQqNHO.mjs";
import { g as getMyInventory } from "./rewards.functions-CJg2mUZV.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { O as Trophy, a as Sparkles, Y as Coins, Z as Zap, F as Flame, a2 as Gift } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "./Avatar-CAZashHQ.mjs";
import "./shop-catalog-QoXq-K4P.mjs";
import "./country-flag-Bsg6nfgK.mjs";
function RewardsWidget({ meId, onOpenChest, onOpenSpin, onOpenShop }) {
  const fetchInv = useServerFn(getMyInventory);
  const [coins, setCoins] = reactExports.useState(0);
  const [xp, setXp] = reactExports.useState(0);
  const [streak, setStreak] = reactExports.useState(0);
  async function refresh() {
    try {
      const r = await fetchInv();
      if (r?.profile) {
        setCoins(r.profile.coins ?? 0);
        setXp(r.profile.xp ?? 0);
        setStreak(r.profile.streak ?? 0);
      }
    } catch (e) {
      console.error(e);
    }
  }
  reactExports.useEffect(() => {
    if (!meId) return;
    void refresh();
    const ch = supabase.channel(`rewards-w-${meId}-${Math.random().toString(36).slice(2, 8)}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${meId}` }, (payload) => {
      const n = payload.new;
      if (typeof n.coins === "number") setCoins(n.coins);
      if (typeof n.xp === "number") setXp(n.xp);
      if (typeof n.streak === "number") setStreak(n.streak);
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  const lp = levelProgress(xp);
  const rank = rankFor(lp.level);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 p-[1px] shadow-[0_20px_60px_-15px_rgba(251,191,36,0.45)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/30 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/90 via-amber-950/70 to-slate-950/90 p-4 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 shadow-lg shadow-amber-500/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-white drop-shadow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "absolute -top-1 -right-1 h-3 w-3 text-amber-200 animate-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-extrabold tracking-tight text-white", children: "Rewards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-amber-300/80", children: "Your treasury" })
          ] })
        ] }),
        lp.level > 1 && rank.minLevel > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/10 ${rank.chip}`, children: rank.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-2.5 ring-1 ring-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider text-white/50", children: "Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-br from-amber-200 to-orange-400 bg-clip-text text-2xl font-black leading-none text-transparent", children: lp.level }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-white/40", children: [
              "/ ",
              lp.level + 1
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 p-2.5 ring-1 ring-amber-400/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300/80", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-2.5 w-2.5" }),
            " Coins"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 flex items-center gap-1 text-base font-extrabold text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]", children: coins.toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-2xl bg-white/5 p-2.5 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center justify-between text-[10px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-bold text-white/80", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-2.5 w-2.5 text-amber-300" }),
            " ",
            xp.toLocaleString(),
            " XP"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-white/50", children: [
            lp.intoLevel,
            "/",
            lp.toNext
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-700",
            style: { width: `${lp.pct}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center justify-between text-[10px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/50", children: [
            "to Lv ",
            lp.level + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-300 ring-1 ring-rose-400/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5" }),
            " ",
            streak,
            "d streak"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onOpenChest,
            className: "group relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/5 p-2.5 ring-1 ring-pink-400/30 transition-all hover:scale-[1.04] hover:ring-pink-300/60 hover:shadow-lg hover:shadow-pink-500/30",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-600 shadow shadow-pink-500/40 transition group-hover:rotate-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3.5 w-3.5 text-white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-extrabold text-white/90", children: "Daily" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onOpenSpin,
            className: "group relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/5 p-2.5 ring-1 ring-violet-400/30 transition-all hover:scale-[1.04] hover:ring-violet-300/60 hover:shadow-lg hover:shadow-violet-500/30",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-600 shadow shadow-violet-500/40 transition group-hover:rotate-180 duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-extrabold text-white/90", children: "Spin" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onOpenShop,
            className: "group relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/5 p-2.5 ring-1 ring-amber-400/30 transition-all hover:scale-[1.04] hover:ring-amber-300/60 hover:shadow-lg hover:shadow-amber-500/30",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-600 shadow shadow-amber-500/40 transition group-hover:-rotate-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5 text-white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-extrabold text-white/90", children: "Shop" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
export {
  RewardsWidget
};
