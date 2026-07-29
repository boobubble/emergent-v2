import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aJ as AdminPageHeader, aK as useAdminSetting, bu as HOME_PAGE_KEY, ae as Card, af as CardContent, B as Button, bv as HomepagePage, bw as HeroPageAdmin } from "./router-CYWPFaDK.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { R as RadioGroup, a as RadioGroupItem } from "./radio-group-BYXGCyZJ.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { b as Save, H as House, a as Sparkles } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/radix-ui__react-radio-group.mjs";
function ActivePageToggle() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting(HOME_PAGE_KEY, {
    mode: "welcome"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Active Landing Page" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Choose which page unauthenticated visitors see. Only one can be active — the other tab still saves settings for later." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        " ",
        saving ? "Saving…" : "Save active page"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { value: values.mode, onValueChange: (v) => set("mode", v), className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${values.mode === "welcome" ? "border-primary bg-primary/5" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "welcome", className: "mt-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-4 w-4" }),
            " Welcome Page"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Classic landing at ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "/welcome" }),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${values.mode === "hero" ? "border-primary bg-primary/5" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "hero", className: "mt-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
            " Hero Homepage"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Premium long-scroll landing at ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "/heropage" }),
            "."
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function LandingSettingsTabs() {
  const {
    values
  } = useAdminSetting(HOME_PAGE_KEY, {
    mode: "welcome"
  });
  const activeMode = values.mode === "hero" ? "hero" : "welcome";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeMode, className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "grid w-full grid-cols-1", children: activeMode === "welcome" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "welcome", className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-4 w-4" }),
      " Welcome Page"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "hero", className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
      " Hero Homepage"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "welcome", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HomepagePage, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hero", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeroPageAdmin, {}) })
  ] });
}
function LandingAdmin() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Landing Pages", description: "Pick which page unauthenticated visitors see. Settings for the active page appear below." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ActivePageToggle, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LandingSettingsTabs, {})
  ] });
}
export {
  LandingAdmin as component
};
