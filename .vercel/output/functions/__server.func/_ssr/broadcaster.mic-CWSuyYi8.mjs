import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent, a0 as Input, B as Button } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { l as listWidgets, f as goLive, h as endLive, s as setMic } from "./broadcaster.functions-qVw6vjOe.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { i as Radio, ak as Mic, c3 as MicOff } from "../_libs/lucide-react.mjs";
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
function MicPage() {
  const qc = useQueryClient();
  const fetchWidgets = useServerFn(listWidgets);
  const go = useServerFn(goLive);
  const end = useServerFn(endLive);
  const mic = useServerFn(setMic);
  const widgets = useQuery({
    queryKey: ["broadcaster-widgets"],
    queryFn: () => fetchWidgets()
  });
  const [widgetId, setWidgetId] = reactExports.useState("");
  const [show, setShow] = reactExports.useState("");
  const goMut = useMutation({
    mutationFn: () => go({
      data: {
        widget_id: widgetId,
        show_title: show || void 0
      }
    }),
    onSuccess: () => toast.success("You're live"),
    onError: (e) => toast.error(e.message)
  });
  const endMut = useMutation({
    mutationFn: () => end({
      data: {
        widget_id: widgetId
      }
    }),
    onSuccess: () => toast.success("Show ended")
  });
  const micOn = useMutation({
    mutationFn: (active) => mic({
      data: {
        widget_id: widgetId,
        active
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["broadcaster-widgets"]
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Go live" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: widgetId, onValueChange: setWidgetId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose widget" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (widgets.data ?? []).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.name }, w.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Show title (optional)", value: show, onChange: (e) => setShow(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !widgetId, onClick: () => goMut.mutate(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4 mr-1" }),
          " Go live"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !widgetId, variant: "outline", onClick: () => endMut.mutate(), children: "End show" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !widgetId, variant: "outline", onClick: () => micOn.mutate(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4 mr-1" }),
          " Mic on"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !widgetId, variant: "outline", onClick: () => micOn.mutate(false), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "h-4 w-4 mr-1" }),
          " Mic off"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mic state is a presence indicator (🎙). Real voice transport not yet wired." })
    ] })
  ] }) });
}
export {
  MicPage as component
};
