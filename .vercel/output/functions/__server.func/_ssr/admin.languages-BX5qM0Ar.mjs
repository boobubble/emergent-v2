import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aK as useAdminSetting, aJ as AdminPageHeader, bx as LANGUAGES } from "./router-CYWPFaDK.mjs";
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
  enabled: true,
  auto_detect: true,
  default_language: "en",
  supported_languages: LANGUAGES.map((l) => l.code),
  ai_translation_enabled: false
};
function AdminLanguagesPage() {
  const {
    values,
    set,
    patch,
    save,
    saving
  } = useAdminSetting("i18n", DEFAULTS);
  const toggleLang = (code) => {
    const has = values.supported_languages.includes(code);
    patch({
      supported_languages: has ? values.supported_languages.filter((c) => c !== code) : [...values.supported_languages, code]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-4 md:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Languages & i18n", description: "Configure multilingual support for the entire application." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Enable multilingual support", checked: values.enabled, onChange: (b) => set("enabled", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Auto-detect browser language on first visit", checked: values.auto_detect, onChange: (b) => set("auto_detect", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Enable AI translation for user content (coming soon)", checked: values.ai_translation_enabled, onChange: (b) => set("ai_translation_enabled", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Default language" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: values.default_language, onChange: (e) => set("default_language", e.target.value), className: "rounded-md border border-border bg-background px-2 py-1 text-sm", children: LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: l.code, children: [
          l.flag,
          " ",
          l.nativeName,
          " (",
          l.name,
          ")"
        ] }, l.code)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Supported languages" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Users can pick from any language enabled here. Disabled languages are hidden from the switcher." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: LANGUAGES.map((l) => {
        const on = values.supported_languages.includes(l.code);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => toggleLang(l.code), className: `flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${on ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: l.flag }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.nativeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "(",
              l.code,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2 w-2 rounded-full ${on ? "bg-primary" : "bg-muted"}` })
        ] }, l.code);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: save, disabled: saving, className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60", children: saving ? "Saving…" : "Save changes" }) })
  ] });
}
function Toggle({
  label,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", role: "switch", "aria-checked": checked, onClick: () => onChange(!checked), className: `relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}` }) })
  ] });
}
export {
  AdminLanguagesPage as component
};
