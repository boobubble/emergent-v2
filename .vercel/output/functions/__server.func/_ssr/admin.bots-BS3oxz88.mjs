import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aK as useAdminSetting, aJ as AdminPageHeader, B as Button, ac as Label, a0 as Input, ad as Textarea } from "./router-CYWPFaDK.mjs";
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
const BOT_LIST = [{
  id: "fish",
  label: "Fish bot",
  desc: "Periodic catch-the-fish mini-game.",
  defaultName: "FishBot",
  defaultMessages: ["🎣 A big one just bit! Type !catch to reel it in.", "🐟 Schools of fish spotted nearby — !catch fast!", "🌊 The tide brought something shiny… !catch"]
}, {
  id: "wine",
  label: "Wine bot",
  desc: "Drops collectible bottles in chat.",
  defaultName: "WineBot",
  defaultMessages: ["🍷 A vintage bottle appears! Type !grab to claim it.", "🥂 Cellar restock — grab one with !grab."]
}, {
  id: "dig",
  label: "Dig bot",
  desc: "Treasure-dig coin reward bursts.",
  defaultName: "DigBot",
  defaultMessages: ["⛏️ Treasure spotted! Type !dig to start digging.", "💰 X marks the spot — !dig for coins!"]
}, {
  id: "trivia",
  label: "Trivia bot",
  desc: "Posts trivia questions with rewards.",
  defaultName: "TriviaBot",
  defaultMessages: ["❓ Trivia time! First correct answer wins.", "🧠 Quick question coming up — get ready!"]
}, {
  id: "ai",
  label: "AI bot",
  desc: "Responds to mentions using AI.",
  defaultName: "Aria",
  defaultMessages: ["👋 Mention me anytime with @Aria — I'm here to help."]
}];
const defaultBot = (id, interval = 600, cooldown = 60) => {
  const meta = BOT_LIST.find((b) => b.id === id);
  return {
    enabled: false,
    name: meta?.defaultName ?? id,
    interval_sec: interval,
    cooldown_sec: cooldown,
    rooms: "lobby",
    messages: (meta?.defaultMessages ?? []).join("\n")
  };
};
const DEFAULTS = {
  master_enabled: false,
  default_interval_sec: 600,
  default_cooldown_sec: 60,
  bots: Object.fromEntries(BOT_LIST.map((b) => [b.id, defaultBot(b.id)]))
};
function BotsPage() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("bots", DEFAULTS);
  const updateBot = (id, patch) => set("bots", {
    ...values.bots,
    [id]: {
      ...defaultBot(id),
      ...values.bots?.[id] ?? {},
      ...patch
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Bots", description: "Lightweight automated room companions with per-bot names, messages, and intervals.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, children: saving ? "Saving…" : "Save changes" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Global bot controls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable bots system", desc: "Master switch for every bot below.", value: values.master_enabled, onChange: (v) => set("master_enabled", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Default message interval (sec)", value: values.default_interval_sec, onChange: (v) => set("default_interval_sec", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Default cooldown (sec)", value: values.default_cooldown_sec, onChange: (v) => set("default_cooldown_sec", v) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-2", children: BOT_LIST.map((b) => {
      const cfg = values.bots?.[b.id] ?? defaultBot(b.id, values.default_interval_sec, values.default_cooldown_sec);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: b.label, description: b.desc, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enabled", value: cfg.enabled, onChange: (v) => updateBot(b.id, {
          enabled: v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Display name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: cfg.name, maxLength: 32, onChange: (e) => updateBot(b.id, {
            name: e.target.value
          }), placeholder: b.defaultName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Interval (sec)", value: cfg.interval_sec, onChange: (v) => updateBot(b.id, {
            interval_sec: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Cooldown (sec)", value: cfg.cooldown_sec, onChange: (v) => updateBot(b.id, {
            cooldown_sec: v
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Rooms (comma-separated channel IDs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: cfg.rooms, onChange: (e) => updateBot(b.id, {
            rooms: e.target.value
          }), placeholder: "lobby, games" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Default messages (one per line)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: cfg.messages, onChange: (e) => updateBot(b.id, {
            messages: e.target.value
          }), placeholder: b.defaultMessages.join("\n") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "The bot picks one line at random each interval." })
        ] })
      ] }, b.id);
    }) })
  ] });
}
export {
  BotsPage as component
};
