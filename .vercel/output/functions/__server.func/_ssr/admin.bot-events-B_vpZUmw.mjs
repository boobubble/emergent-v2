import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aK as useAdminSetting, aV as DEFAULT_BOT_EVENTS_CONFIG, aJ as AdminPageHeader, B as Button, o as computeEventState, p as BOT_EVENT_META, ac as Label } from "./router-CYWPFaDK.mjs";
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
const INTERVAL_PRESETS = [30, 45, 60, 120];
const DURATION_PRESETS = [5, 10, 15];
const KINDS = ["fish", "dig", "wine"];
function fmt(ms) {
  const t = Math.max(0, Math.floor(ms / 1e3));
  return `${Math.floor(t / 60)}m ${String(t % 60).padStart(2, "0")}s`;
}
function BotEventsPage() {
  const {
    values,
    patch,
    save,
    saving
  } = useAdminSetting("bot_events", DEFAULT_BOT_EVENTS_CONFIG);
  const [now, setNow] = reactExports.useState(Date.now());
  reactExports.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1e3);
    return () => window.clearInterval(id);
  }, []);
  const updateKind = (k, changes) => patch({
    [k]: {
      ...DEFAULT_BOT_EVENTS_CONFIG[k],
      ...values[k] || {},
      ...changes
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Bot Events", description: "Schedule Fish, Dig and Wine as community-wide events. Everyone can join during each open window, once per round.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, children: saving ? "Saving…" : "Save changes" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Live status", description: "What every user in the chatroom is seeing right now.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: KINDS.map((k) => {
      const cfg = values[k] || DEFAULT_BOT_EVENTS_CONFIG[k];
      const s = computeEventState(k, cfg, now);
      const meta = BOT_EVENT_META[k];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: meta.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: meta.label }),
          !cfg.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground", children: "Off" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm", children: s.live ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-emerald-500", children: [
          "🟢 LIVE · ends ",
          fmt(s.msUntilClose)
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Starts in ",
          fmt(s.msUntilOpen)
        ] }) }),
        s.golden && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] font-semibold text-amber-500", children: "✨ Golden round · 2× rewards" })
      ] }, k);
    }) }) }),
    KINDS.map((k) => {
      const cfg = values[k] || DEFAULT_BOT_EVENTS_CONFIG[k];
      const meta = BOT_EVENT_META[k];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: `${meta.emoji} ${meta.label}`, description: `Global schedule for ${meta.command}.`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enabled", desc: "When off, users see a friendly disabled notice.", value: cfg.enabled, onChange: (v) => updateKind(k, {
          enabled: v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Open every" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            INTERVAL_PRESETS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: cfg.interval_min === m ? "default" : "outline", onClick: () => updateKind(k, {
              interval_min: m
            }), children: m >= 60 ? `${m / 60}h` : `${m}m` }, m)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "", value: cfg.interval_min, onChange: (v) => updateKind(k, {
                interval_min: Math.max(1, Math.floor(Number(v)))
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "min (custom)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Open for" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            DURATION_PRESETS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: cfg.duration_min === m ? "default" : "outline", onClick: () => updateKind(k, {
              duration_min: m
            }), children: [
              m,
              "m"
            ] }, m)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "", value: cfg.duration_min, onChange: (v) => updateKind(k, {
                duration_min: Math.max(1, Math.floor(Number(v)))
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "min (custom)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Duration is capped to the interval length." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Max attempts per user per event", value: cfg.max_attempts, onChange: (v) => updateKind(k, {
            max_attempts: Math.max(1, Math.floor(Number(v)))
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Golden event chance (0–1)", step: 0.05, value: cfg.bonus_chance, onChange: (v) => updateKind(k, {
            bonus_chance: Math.max(0, Math.min(1, Number(v)))
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable golden bonus events", desc: `Occasional 2× ${meta.label} rounds (${meta.goldenLabel}).`, value: cfg.bonus_enabled, onChange: (v) => updateKind(k, {
          bonus_enabled: v
        }) })
      ] }, k);
    })
  ] });
}
export {
  BotEventsPage as component
};
