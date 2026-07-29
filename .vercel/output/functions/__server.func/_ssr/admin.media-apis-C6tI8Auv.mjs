import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aG as AdminToggle, ac as Label, a0 as Input, B as Button } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { m as mergeMediaConfig, M as MEDIA_DEFAULTS } from "./media-providers-config-Do_nLlCF.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { aG as Youtube, ax as ExternalLink, b6 as KeyRound, e as EyeOff, E as Eye, I as Image, b as Save } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
function MediaApisPage() {
  const {
    raw,
    refresh
  } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);
  const [draft, setDraft] = reactExports.useState(() => mergeMediaConfig(raw.media));
  const [reveal, setReveal] = reactExports.useState({
    youtube: false,
    giphy: false
  });
  reactExports.useEffect(() => {
    setDraft(mergeMediaConfig(raw.media));
  }, [JSON.stringify(raw.media ?? {})]);
  const mut = useMutation({
    mutationFn: (next) => saveSetting({
      data: {
        key: "media",
        value: next
      }
    }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
      toast.success("Saved");
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const update = (patch) => {
    const next = structuredClone(draft);
    patch(next);
    setDraft(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Media APIs", description: "YouTube and Giphy integration for the chat composer." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground", children: [
      "Saved to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-background px-1 py-0.5", children: "app_settings.media" }),
      ". These keys are designed for client-side use — restrict them by HTTP referrer in the YouTube / Giphy developer consoles before going live."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 place-items-center rounded-md ${draft.youtube.enabled ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "YouTube Data API v3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://console.cloud.google.com/apis/library/youtube.googleapis.com", target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground", children: [
              "Get key ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Lets users share YouTube videos in chat by URL." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: draft.youtube.enabled, onCheckedChange: (v) => update((d) => {
          d.youtube.enabled = v;
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: draft.youtube.enabled ? "space-y-3" : "space-y-3 opacity-60 pointer-events-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-3 w-3" }),
            " API key"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: reveal.youtube ? "text" : "password", className: "h-9 text-xs font-mono", value: draft.youtube.apiKey, onChange: (e) => update((d) => {
              d.youtube.apiKey = e.target.value;
            }), placeholder: "AIzaSy...", autoComplete: "off" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "icon", className: "h-9 w-9 shrink-0", onClick: () => setReveal((r) => ({
              ...r,
              youtube: !r.youtube
            })), children: reveal.youtube ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Required only for search. URL-based sharing works without a key, but oEmbed previews use the key when present." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Default embed privacy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.youtube.defaultPrivacy, onValueChange: (v) => update((d) => {
            d.youtube.defaultPrivacy = v;
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "public", className: "text-xs", children: "Public (youtube.com)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unlisted", className: "text-xs", children: "Cookieless (youtube-nocookie.com)" })
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 place-items-center rounded-md ${draft.giphy.enabled ? "bg-fuchsia-500/15 text-fuchsia-400" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Giphy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://developers.giphy.com/dashboard/", target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground", children: [
              "Get key ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Lets users search and share GIFs in chat." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: draft.giphy.enabled, onCheckedChange: (v) => update((d) => {
          d.giphy.enabled = v;
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: draft.giphy.enabled ? "space-y-3" : "space-y-3 opacity-60 pointer-events-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-3 w-3" }),
            " API key"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: reveal.giphy ? "text" : "password", className: "h-9 text-xs font-mono", value: draft.giphy.apiKey, onChange: (e) => update((d) => {
              d.giphy.apiKey = e.target.value;
            }), placeholder: "Paste Giphy SDK / API key", autoComplete: "off" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "icon", className: "h-9 w-9 shrink-0", onClick: () => setReveal((r) => ({
              ...r,
              giphy: !r.giphy
            })), children: reveal.giphy ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Content rating" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.giphy.rating, onValueChange: (v) => update((d) => {
              d.giphy.rating = v;
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "g", className: "text-xs", children: "G — family-safe" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pg", className: "text-xs", children: "PG" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pg-13", className: "text-xs", children: "PG-13 (default)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "r", className: "text-xs", children: "R — mature" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Results per page" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 6, max: 50, className: "h-9 text-xs", value: draft.giphy.pageSize, onChange: (e) => update((d) => {
              d.giphy.pageSize = Math.max(6, Math.min(50, Number(e.target.value) || 24));
            }) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-3 flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDraft(MEDIA_DEFAULTS), disabled: mut.isPending, children: "Reset to defaults" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mut.mutate(draft), disabled: mut.isPending, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        " Save changes"
      ] })
    ] })
  ] });
}
export {
  MediaApisPage as component
};
