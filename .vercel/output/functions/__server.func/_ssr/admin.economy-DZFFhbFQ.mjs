import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aK as useAdminSetting, aJ as AdminPageHeader, B as Button } from "./router-CYWPFaDK.mjs";
import { S as SettingsCard, N as NumberField, T as ToggleRow } from "./SettingsSection-DpMwxV3D.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
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
import "../_libs/lucide-react.mjs";
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
const DEFAULTS = {
  xp_per_message: 1,
  xp_per_post: 10,
  xp_per_comment: 3,
  xp_per_game_win: 25,
  coins_per_daily: 50,
  coins_per_game_win: 10,
  streak_bonus_coins: 5,
  streak_bonus_xp: 5,
  achievements_enabled: true,
  shop_enabled: true,
  shop_price_multiplier: 1,
  cooldown_message_sec: 2,
  cooldown_post_sec: 30,
  cooldown_reaction_sec: 1,
  daily_xp_cap: 500,
  daily_coin_cap: 250
};
function EconomyPage() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("economy", DEFAULTS);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Economy", description: "Tune XP, coins, streaks, shop pricing, and anti-farming cooldowns.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, children: saving ? "Saving…" : "Save changes" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "XP rewards", description: "Experience granted for user activity.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Per message", value: values.xp_per_message, onChange: (v) => set("xp_per_message", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Per post", value: values.xp_per_post, onChange: (v) => set("xp_per_post", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Per comment", value: values.xp_per_comment, onChange: (v) => set("xp_per_comment", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Per game win", value: values.xp_per_game_win, onChange: (v) => set("xp_per_game_win", v) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Coin rewards", description: "Coins issued for engagement.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Daily login", value: values.coins_per_daily, onChange: (v) => set("coins_per_daily", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Game win", value: values.coins_per_game_win, onChange: (v) => set("coins_per_game_win", v) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Streak bonuses", description: "Reward consecutive active days.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Bonus coins / streak day", value: values.streak_bonus_coins, onChange: (v) => set("streak_bonus_coins", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Bonus XP / streak day", value: values.streak_bonus_xp, onChange: (v) => set("streak_bonus_xp", v) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Shop & achievements", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Achievements", desc: "Unlock badges & milestones.", value: values.achievements_enabled, onChange: (v) => set("achievements_enabled", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Shop", desc: "Allow buying with coins.", value: values.shop_enabled, onChange: (v) => set("shop_enabled", v) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Shop price multiplier", step: 0.1, value: values.shop_price_multiplier, onChange: (v) => set("shop_price_multiplier", v), hint: "1.0 = base pricing. 1.5 = +50% across catalog." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Anti-farming cooldowns", description: "Minimum seconds between rewarded actions.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Message (sec)", value: values.cooldown_message_sec, onChange: (v) => set("cooldown_message_sec", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Post (sec)", value: values.cooldown_post_sec, onChange: (v) => set("cooldown_post_sec", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Reaction (sec)", value: values.cooldown_reaction_sec, onChange: (v) => set("cooldown_reaction_sec", v) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Daily caps", description: "Hard limits per user per day.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max XP / day", value: values.daily_xp_cap, onChange: (v) => set("daily_xp_cap", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max coins / day", value: values.daily_coin_cap, onChange: (v) => set("daily_coin_cap", v) })
      ] }) })
    ] })
  ] });
}
export {
  EconomyPage as component
};
