import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aK as useAdminSetting, aJ as AdminPageHeader, B as Button, ae as Card, af as CardContent, aG as AdminToggle, ac as Label, a0 as Input, ad as Textarea } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { b as Save, M as Megaphone, E as Eye, e as EyeOff, aO as Monitor, bN as Smartphone, bO as Earth } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const SURFACE_META = {
  feed: { label: "Feed", description: "Social feed timeline.", supportsEveryN: true },
  chatroom: { label: "Chatrooms", description: "Lobby and chatroom views.", supportsEveryN: false },
  dm: { label: "Direct Messages", description: "1:1 conversations.", supportsEveryN: false },
  profile: { label: "Profiles", description: "User profile pages.", supportsEveryN: false },
  find_friends: { label: "Find Friends", description: "Discovery & suggestions.", supportsEveryN: true },
  games: { label: "Games", description: "Games lobby and game pages.", supportsEveryN: false },
  custom_page: { label: "Custom Pages", description: "CMS pages created in the admin.", supportsEveryN: false }
};
const FORMAT_META = {
  adsense: { label: "Google AdSense", description: "Uses the AdSense publisher/slot IDs from Ads & Scripts." },
  custom_html: { label: "Custom HTML", description: "Free-form HTML injected into the slot." },
  banner: { label: "Banner", description: "Image banner with click-through URL." },
  sponsor_block: { label: "Sponsor Block", description: "Branded sponsor card / call-out." },
  affiliate_widget: { label: "Affiliate", description: "Affiliate product / referral widget." }
};
const DEFAULT_PLACEMENT = {
  enabled: false,
  formats: ["adsense"],
  device: "all",
  audience: "all",
  maxPerPage: 2,
  everyNItems: 0,
  customHtml: "",
  sponsorHtml: ""
};
const AD_PLACEMENTS_DEFAULTS = {
  enabled: false,
  premiumAdFree: true,
  hideForGuests: false,
  globalMaxPerPage: 6,
  placements: {
    feed: { ...DEFAULT_PLACEMENT, everyNItems: 5 },
    chatroom: { ...DEFAULT_PLACEMENT },
    dm: { ...DEFAULT_PLACEMENT, audience: "guests" },
    profile: { ...DEFAULT_PLACEMENT },
    find_friends: { ...DEFAULT_PLACEMENT, everyNItems: 8 },
    games: { ...DEFAULT_PLACEMENT },
    custom_page: { ...DEFAULT_PLACEMENT }
  }
};
const SURFACES = Object.keys(SURFACE_META);
const FORMATS = Object.keys(FORMAT_META);
function AdPlacementsPage() {
  const {
    values,
    set,
    patch,
    save,
    saving
  } = useAdminSetting("ad_placements", AD_PLACEMENTS_DEFAULTS);
  const updatePlacement = (surface, next) => {
    patch({
      placements: {
        ...values.placements,
        [surface]: {
          ...values.placements[surface],
          ...next
        }
      }
    });
  };
  const toggleFormat = (surface, format) => {
    const cur = values.placements[surface].formats;
    const next = cur.includes(format) ? cur.filter((f) => f !== format) : [...cur, format];
    updatePlacement(surface, {
      formats: next
    });
  };
  const enabledCount = SURFACES.filter((s) => values.placements[s].enabled).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Ad Placements", description: "Visual placement manager. Decide where ads appear without editing code. Existing AdSense / custom HTML containers are preserved.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      " ",
      saving ? "Saving…" : "Save changes"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Enable Placement Manager" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Master switch. When off, only the legacy Ads & Scripts slots render." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: values.enabled, onCheckedChange: (v) => set("enabled", v) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Premium ad-free mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hide every placement for users with an active premium subscription." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: values.premiumAdFree, onCheckedChange: (v) => set("premiumAdFree", v) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Hide all ads for guests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Overrides per-placement audience rules." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: values.hideForGuests, onCheckedChange: (v) => set("hideForGuests", v) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "global-max", children: "Global max ads per page" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "global-max", type: "number", min: 0, max: 50, value: values.globalMaxPerPage, onChange: (e) => set("globalMaxPerPage", Math.max(0, Number(e.target.value) || 0)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "0 = no global cap." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: values.enabled ? "default" : "secondary", children: values.enabled ? "Active" : "Disabled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
              enabledCount,
              " surfaces on"
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: SURFACES[0], className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "flex h-auto w-full flex-wrap justify-start gap-1", children: SURFACES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: s, className: "text-xs", children: [
        SURFACE_META[s].label,
        values.placements[s].enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "ml-1.5 h-3 w-3 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "ml-1.5 h-3 w-3 opacity-50" })
      ] }, s)) }),
      SURFACES.map((surface) => {
        const meta = SURFACE_META[surface];
        const p = values.placements[surface];
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: surface, className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-semibold", children: [
                meta.label,
                " ads"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: meta.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: p.enabled, onCheckedChange: (v) => updatePlacement(surface, {
              enabled: v
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3.5 w-3.5" }),
                "Device"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.device, onValueChange: (v) => updatePlacement(surface, {
                device: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Desktop & mobile" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "desktop", children: "Desktop only" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mobile", children: "Mobile only" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "h-3.5 w-3.5" }),
                " Audience"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.audience, onValueChange: (v) => updatePlacement(surface, {
                audience: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Everyone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "guests", children: "Guests only" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "registered", children: "Registered users only" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `max-${surface}`, children: "Max ads per page" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `max-${surface}`, type: "number", min: 0, max: 20, value: p.maxPerPage, onChange: (e) => updatePlacement(surface, {
                maxPerPage: Math.max(0, Number(e.target.value) || 0)
              }) })
            ] }),
            meta.supportsEveryN && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `every-${surface}`, children: "Insert ad every N items" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `every-${surface}`, type: "number", min: 0, max: 50, value: p.everyNItems, onChange: (e) => updatePlacement(surface, {
                everyNItems: Math.max(0, Number(e.target.value) || 0)
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "0 = disabled. Common: every 5 feed posts." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Allowed formats" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: FORMATS.map((f) => {
              const active = p.formats.includes(f);
              return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggleFormat(surface, f), className: `rounded-md border px-2.5 py-1 text-xs transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"}`, title: FORMAT_META[f].description, children: FORMAT_META[f].label }, f);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `html-${surface}`, children: "Custom HTML / Banner" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: `html-${surface}`, rows: 4, placeholder: `<div>Custom banner for ${meta.label.toLowerCase()}…</div>`, value: p.customHtml ?? "", onChange: (e) => updatePlacement(surface, {
                customHtml: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `sponsor-${surface}`, children: "Sponsor / Affiliate block" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: `sponsor-${surface}`, rows: 4, placeholder: "<a href='https://partner.example/?ref=…'>Sponsored by…</a>", value: p.sponsorHtml ?? "", onChange: (e) => updatePlacement(surface, {
                sponsorHtml: e.target.value
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "AdSense slot IDs and the global script loader are managed in",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Settings → Ads & Scripts" }),
            ". This page only controls",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "where" }),
            " placements appear."
          ] })
        ] }) }) }, surface);
      })
    ] })
  ] });
}
export {
  AdPlacementsPage as component
};
