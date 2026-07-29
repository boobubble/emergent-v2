import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as claimDailyChest, g as getMyInventory } from "./rewards.functions-CJg2mUZV.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, a2 as Gift, F as Flame, z as Check } from "../_libs/lucide-react.mjs";
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
const REWARDS = [20, 25, 30, 40, 50, 75, 150];
function DailyChestPanel({ onBack }) {
  const claim = useServerFn(claimDailyChest);
  const fetchInv = useServerFn(getMyInventory);
  const [streak, setStreak] = reactExports.useState(0);
  const [claimedToday, setClaimedToday] = reactExports.useState(false);
  const [claiming, setClaiming] = reactExports.useState(false);
  reactExports.useEffect(() => {
    void fetchInv().then((r) => {
      if (r?.profile) setStreak(r.profile.streak ?? 0);
    });
  }, [fetchInv]);
  reactExports.useEffect(() => {
    setClaimedToday(false);
  }, []);
  const dayInCycle = (streak - 1 + 7) % 7 + 1;
  async function onClaim() {
    setClaiming(true);
    try {
      const res = await claim();
      if (res.alreadyClaimed) {
        setClaimedToday(true);
        toast.info("Already claimed today — come back tomorrow!");
      } else {
        setStreak(res.streak ?? streak);
        setClaimedToday(true);
        toast.success(`+${res.coins} 🪙 Daily reward (Day ${res.dayInCycle})`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaiming(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBack, className: "mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
      " Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-xl font-bold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-5 w-5 text-pink-500" }),
      " Daily Chest"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Sign in every day to climb the reward ladder. Day 7 = big chest!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 text-orange-500" }),
          " Streak: ",
          streak,
          "d"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Today: Day ",
          dayInCycle
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-7 gap-1.5", children: REWARDS.map((amt, i) => {
        const day = i + 1;
        const isToday = day === dayInCycle;
        const isPast = day < dayInCycle;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `rounded-xl border p-2 text-center ${isToday ? "border-primary bg-primary/10 ring-2 ring-primary" : isPast ? "border-border bg-muted/30 opacity-60" : "border-border bg-background/50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: [
                "Day ",
                day
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-1 text-lg", children: day === 7 ? "🎁" : "🪙" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold", children: [
                "+",
                amt
              ] })
            ]
          },
          day
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClaim,
          disabled: claiming || claimedToday,
          className: "mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
          children: claimedToday ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 inline h-4 w-4" }),
            " Claimed today"
          ] }) : claiming ? "Claiming…" : `Claim Day ${dayInCycle} reward`
        }
      )
    ] })
  ] });
}
export {
  DailyChestPanel
};
