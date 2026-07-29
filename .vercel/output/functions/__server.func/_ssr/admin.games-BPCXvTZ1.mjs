import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aK as useAdminSetting, aJ as AdminPageHeader, B as Button } from "./router-CYWPFaDK.mjs";
import { S as SettingsCard, T as ToggleRow, N as NumberField } from "./SettingsSection-DpMwxV3D.mjs";
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
const GAME_LIST = ["tic_tac_toe", "rock_paper_scissors", "connect_four", "checkers", "chess", "trivia"];
const DEFAULTS = {
  enabled: Object.fromEntries(GAME_LIST.map((g) => [g, true])),
  reward_multiplier: 1,
  max_concurrent_matches: 100,
  lobby_timeout_sec: 120,
  turn_timeout_sec: 45,
  tournaments_enabled: false,
  tournament_entry_fee: 25,
  tournament_prize_pool: 500,
  spectators_allowed: true,
  mod_live_games: true
};
function GamesPage() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("games", DEFAULTS);
  const toggleGame = (g, v) => set("enabled", {
    ...values.enabled,
    [g]: v
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Games", description: "Enable mini-games, configure rewards, and moderate live matches.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, children: saving ? "Saving…" : "Save changes" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Available games", description: "Enable or disable individual games.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: GAME_LIST.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value: values.enabled?.[g] ?? true, onChange: (v) => toggleGame(g, v) }, g)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Match settings", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Reward multiplier", step: 0.1, value: values.reward_multiplier, onChange: (v) => set("reward_multiplier", v), hint: "Scales XP & coin payouts." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max concurrent matches", value: values.max_concurrent_matches, onChange: (v) => set("max_concurrent_matches", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Lobby timeout (sec)", value: values.lobby_timeout_sec, onChange: (v) => set("lobby_timeout_sec", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Turn timeout (sec)", value: values.turn_timeout_sec, onChange: (v) => set("turn_timeout_sec", v) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Tournaments", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable tournaments", desc: "Scheduled bracket events.", value: values.tournaments_enabled, onChange: (v) => set("tournaments_enabled", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Entry fee (coins)", value: values.tournament_entry_fee, onChange: (v) => set("tournament_entry_fee", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Prize pool (coins)", value: values.tournament_prize_pool, onChange: (v) => set("tournament_prize_pool", v) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Live moderation", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Allow spectators", desc: "Public matches viewable by others.", value: values.spectators_allowed, onChange: (v) => set("spectators_allowed", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Moderator live access", desc: "Mods can join & abort live games.", value: values.mod_live_games, onChange: (v) => set("mod_live_games", v) })
      ] })
    ] })
  ] });
}
export {
  GamesPage as component
};
