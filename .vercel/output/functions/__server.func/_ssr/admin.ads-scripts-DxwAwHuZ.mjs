import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, Y as getAllSettings, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, B as Button, ac as Label, a0 as Input, ad as Textarea } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { T as ToggleRow } from "./SettingsSection-DpMwxV3D.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { M as Megaphone, bn as CodeXml, T as TriangleAlert } from "../_libs/lucide-react.mjs";
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
const SLOT_DEFAULT = {
  enabled: false,
  slot_id: "",
  format: "auto",
  full_width_responsive: true
};
const ADS_DEFAULT = {
  enabled: false,
  provider: "adsense",
  publisher_id: "",
  auto_ads: false,
  slots: {
    header: {
      ...SLOT_DEFAULT
    },
    sidebar: {
      ...SLOT_DEFAULT
    },
    in_feed: {
      ...SLOT_DEFAULT
    },
    footer: {
      ...SLOT_DEFAULT
    }
  },
  custom_html_header: "",
  custom_html_sidebar: "",
  custom_html_in_feed: "",
  custom_html_footer: ""
};
const SCRIPTS_DEFAULT = {
  header_script: "",
  footer_script: "",
  enabled: true
};
function AdsScriptsPage() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const {
    data
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings({})
  });
  const [ads, setAds] = reactExports.useState(ADS_DEFAULT);
  const [scripts, setScripts] = reactExports.useState(SCRIPTS_DEFAULT);
  reactExports.useEffect(() => {
    if (!data) return;
    const a = data.ads || {};
    setAds({
      ...ADS_DEFAULT,
      ...a,
      slots: {
        ...ADS_DEFAULT.slots,
        ...a.slots || {}
      }
    });
    setScripts({
      ...SCRIPTS_DEFAULT,
      ...data.scripts || {}
    });
  }, [data]);
  const saveAds = useMutation({
    mutationFn: () => saveSetting({
      data: {
        key: "ads",
        value: ads
      }
    }),
    onSuccess: () => {
      toast.success("Ads saved");
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const saveScripts = useMutation({
    mutationFn: () => saveSetting({
      data: {
        key: "scripts",
        value: scripts
      }
    }),
    onSuccess: () => {
      toast.success("Scripts saved");
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const updateSlot = (key, patch) => setAds((s) => ({
    ...s,
    slots: {
      ...s.slots,
      [key]: {
        ...s.slots[key],
        ...patch
      }
    }
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Ads & Scripts", description: "Google AdSense placements, custom ad HTML, and global header / footer script injection." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "ads", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "ads", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Ads"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "scripts", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CodeXml, { className: "mr-1.5 h-3.5 w-3.5" }),
          "Header / Footer Scripts"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "ads", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Advertising" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "Master switch for all ad placements site-wide." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveAds.mutate(), disabled: saveAds.isPending, children: saveAds.isPending ? "Saving…" : "Save changes" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Ads enabled", desc: "Turn off to hide all ad slots instantly.", value: ads.enabled, onChange: (v) => setAds({
            ...ads,
            enabled: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Provider" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm", value: ads.provider, onChange: (e) => setAds({
                ...ads,
                provider: e.target.value
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "adsense", children: "Google AdSense" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "custom", children: "Custom HTML / other network" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "AdSense Publisher ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "ca-pub-XXXXXXXXXXXXXXXX", value: ads.publisher_id, onChange: (e) => setAds({
                ...ads,
                publisher_id: e.target.value
              }), disabled: ads.provider !== "adsense" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Find it in AdSense → Account → Account information." })
            ] })
          ] }),
          ads.provider === "adsense" && /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable Auto Ads", desc: "Let Google AdSense auto-place ads anywhere on the page. Slots below are ignored when on.", value: ads.auto_ads, onChange: (v) => setAds({
            ...ads,
            auto_ads: v
          }) })
        ] }) }),
        ["header", "sidebar", "in_feed", "footer"].map((key) => {
          const slot = ads.slots[key];
          const labels = {
            header: "Header (top of every page)",
            sidebar: "Sidebar",
            in_feed: "In-feed (between posts)",
            footer: "Footer (bottom of every page)"
          };
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: labels[key] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [
                  "Slot key: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1.5 py-0.5 text-[11px]", children: key })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "", value: slot.enabled, onChange: (v) => updateSlot(key, {
                enabled: v
              }) })
            ] }),
            ads.provider === "adsense" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Ad Slot ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "1234567890", value: slot.slot_id, onChange: (e) => updateSlot(key, {
                  slot_id: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Format" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm", value: slot.format, onChange: (e) => updateSlot(key, {
                  format: e.target.value
                }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "auto", children: "Auto (responsive)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fluid", children: "Fluid" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rectangle", children: "Rectangle" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "horizontal", children: "Horizontal" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "vertical", children: "Vertical" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Full-width responsive", value: slot.full_width_responsive, onChange: (v) => updateSlot(key, {
                full_width_responsive: v
              }) }) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Custom HTML" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, className: "font-mono text-xs", placeholder: `<!-- Paste banner / network HTML for ${key} slot -->`, value: ads[`custom_html_${key}`], onChange: (e) => setAds({
                ...ads,
                [`custom_html_${key}`]: e.target.value
              }) })
            ] })
          ] }) }, key);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-amber-500/30 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Ad slots only render where ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-amber-100 px-1 dark:bg-amber-900/40", children: '<AdSlot slot="…"/>' }),
            " is mounted in the app. Add them in the feed, sidebars, or headers as needed."
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "scripts", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Custom Scripts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "Inject analytics, pixels, or any third-party widget. Header scripts load early; footer scripts load after the page." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveScripts.mutate(), disabled: saveScripts.isPending, children: saveScripts.isPending ? "Saving…" : "Save changes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Scripts enabled", desc: "Turn off to immediately stop injecting custom scripts site-wide.", value: scripts.enabled, onChange: (v) => setScripts({
          ...scripts,
          enabled: v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
            "Header script (injected into ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "<head>" }),
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 8, className: "mt-1.5 font-mono text-xs", placeholder: `<!-- e.g. Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"><\/script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','G-XXXX');<\/script>`, value: scripts.header_script, onChange: (e) => setScripts({
            ...scripts,
            header_script: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
            "Footer script (injected before ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "</body>" }),
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 8, className: "mt-1.5 font-mono text-xs", placeholder: `<!-- e.g. chat widget, Meta pixel <noscript> fallback -->`, value: scripts.footer_script, onChange: (e) => setScripts({
            ...scripts,
            footer_script: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-amber-500/30 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Only paste scripts you trust. Anything saved here runs in every visitor's browser with full access to your site." })
        ] }) })
      ] }) }) })
    ] })
  ] });
}
export {
  AdsScriptsPage as component
};
