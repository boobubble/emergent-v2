import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aG as AdminToggle, ac as Label, a0 as Input, ad as Textarea, B as Button } from "./router-CYWPFaDK.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { m as mergeDiscoveryWidgetsConfig } from "./discovery-widgets-config-cgdFDrdx.mjs";
import "../_libs/seroval.mjs";
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
function DiscoveryWidgetsAdmin() {
  const {
    raw,
    refresh
  } = useAppSettings();
  const [cfg, setCfg] = reactExports.useState(() => mergeDiscoveryWidgetsConfig(raw?.discovery_widgets));
  reactExports.useEffect(() => {
    setCfg(mergeDiscoveryWidgetsConfig(raw?.discovery_widgets));
  }, [raw]);
  const save = useServerFn(updateSetting);
  const mut = useMutation({
    mutationFn: (next) => save({
      data: {
        key: "discovery_widgets",
        value: next
      }
    }),
    onSuccess: async () => {
      await refresh();
      toast.success("Saved");
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const patchItem = (i, patch) => {
    setCfg((c) => {
      const items = c.items.slice();
      items[i] = {
        ...items[i],
        ...patch
      };
      return {
        ...c,
        items
      };
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Feed Discovery Widgets", description: "Promote platform modules inside the Feed. Widgets rotate intelligently based on user activity." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Master switch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Enable discovery widgets across the Feed." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: cfg.enabled, onCheckedChange: (v) => setCfg((c) => ({
          ...c,
          enabled: v
        })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Show after every N posts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 2, max: 30, value: cfg.insertEvery, onChange: (e) => setCfg((c) => ({
          ...c,
          insertEvery: Math.max(2, Number(e.target.value) || 6)
        })) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: cfg.items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-xl", children: it.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: it.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: it.to })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: it.enabled, onCheckedChange: (v) => patchItem(i, {
          enabled: v
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.title, onChange: (e) => patchItem(i, {
            title: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Icon (emoji)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.icon, onChange: (e) => patchItem(i, {
            icon: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: it.description, onChange: (e) => patchItem(i, {
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "CTA text" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.ctaText, onChange: (e) => patchItem(i, {
            ctaText: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Priority (1–10)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 10, value: it.priority, onChange: (e) => patchItem(i, {
              priority: Math.min(10, Math.max(1, Number(e.target.value) || 1))
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Min gap (posts)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 2, max: 50, value: it.frequency, onChange: (e) => patchItem(i, {
              frequency: Math.max(2, Number(e.target.value) || 6)
            }) })
          ] })
        ] })
      ] })
    ] }) }, it.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-3 z-10 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(cfg), disabled: mut.isPending, children: mut.isPending ? "Saving…" : "Save changes" }) })
  ] });
}
export {
  DiscoveryWidgetsAdmin as component
};
