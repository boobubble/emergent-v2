import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, ae as Card, ag as CardHeader, ah as CardTitle, B as Button, af as CardContent, aM as Switch, a0 as Input, ad as Textarea } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as listAnnouncements, l as listWidgets, d as createAnnouncement, u as updateAnnouncement, e as deleteAnnouncement } from "./broadcaster.functions-qVw6vjOe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { M as Megaphone, c0 as PinOff, bv as Pin, d as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const KIND_LABEL = {
  upcoming_show: "Upcoming Show",
  ticker: "Ticker",
  community: "Community"
};
function AnnouncementsPage() {
  const qc = useQueryClient();
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const fetchWidgets = useServerFn(listWidgets);
  const create = useServerFn(createAnnouncement);
  const update = useServerFn(updateAnnouncement);
  const remove = useServerFn(deleteAnnouncement);
  const [kind, setKind] = reactExports.useState("upcoming_show");
  const list = useQuery({
    queryKey: ["broadcaster-announcements", kind],
    queryFn: () => fetchAnnouncements({
      data: {
        kind
      }
    })
  });
  const widgets = useQuery({
    queryKey: ["broadcaster-widgets"],
    queryFn: () => fetchWidgets()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold", children: "Announcements" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: kind, onValueChange: (v) => setKind(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "upcoming_show", children: "Upcoming Show" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ticker", children: "Ticker" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "community", children: "Community" })
      ] }),
      ["upcoming_show", "ticker", "community"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: k, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreateForm, { kind: k, widgets: widgets.data ?? [], onCreate: async (payload) => {
          try {
            await create({
              data: {
                ...payload,
                kind: k
              }
            });
            qc.invalidateQueries({
              queryKey: ["broadcaster-announcements", k]
            });
            toast.success("Posted");
          } catch (e) {
            toast.error(e.message);
          }
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          (list.data ?? []).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: KIND_LABEL[a.kind] ?? a.kind }),
                a.pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Pinned" }),
                !a.active && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Disabled" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                  update({
                    data: {
                      id: a.id,
                      pinned: !a.pinned
                    }
                  }).then(() => qc.invalidateQueries({
                    queryKey: ["broadcaster-announcements", k]
                  }));
                }, children: a.pinned ? /* @__PURE__ */ jsxRuntimeExports.jsx(PinOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                  if (confirm("Delete announcement?")) remove({
                    data: {
                      id: a.id
                    }
                  }).then(() => qc.invalidateQueries({
                    queryKey: ["broadcaster-announcements", k]
                  }));
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: a.title }),
              a.body && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: a.body }),
              a.link && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.link, className: "text-xs text-primary", target: "_blank", rel: "noreferrer", children: a.link }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: a.active, onCheckedChange: (v) => update({
                    data: {
                      id: a.id,
                      active: v
                    }
                  }).then(() => qc.invalidateQueries({
                    queryKey: ["broadcaster-announcements", k]
                  })) }),
                  "Active"
                ] }),
                a.widget_id && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "widget-scoped" })
              ] })
            ] })
          ] }, a.id)),
          (list.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            "No ",
            KIND_LABEL[k].toLowerCase(),
            " announcements yet."
          ] })
        ] })
      ] }, k))
    ] })
  ] });
}
function CreateForm({
  kind,
  widgets,
  onCreate
}) {
  const [title, setTitle] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [link, setLink] = reactExports.useState("");
  const [widgetId, setWidgetId] = reactExports.useState("__global__");
  const [pinned, setPinned] = reactExports.useState(false);
  const [target, setTarget] = reactExports.useState({
    widget: true,
    chatbar: true,
    notifications: true,
    feed: true
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm", children: [
      "New ",
      KIND_LABEL[kind].toLowerCase()
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Title", value: title, onChange: (e) => setTitle(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Body (optional)", value: body, onChange: (e) => setBody(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Link (optional)", value: link, onChange: (e) => setLink(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: widgetId, onValueChange: setWidgetId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Scope" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__global__", children: "Global (all widgets)" }),
            widgets.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.name }, w.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: pinned, onCheckedChange: setPinned }),
          " Pin to top"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs", children: ["widget", "chatbar", "notifications", "feed"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: target[t], onCheckedChange: (v) => setTarget((s) => ({
          ...s,
          [t]: v
        })) }),
        t
      ] }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !title.trim(), onClick: async () => {
        await onCreate({
          title,
          body: body || null,
          link: link || null,
          widget_id: widgetId === "__global__" ? null : widgetId,
          pinned,
          target
        });
        setTitle("");
        setBody("");
        setLink("");
        setPinned(false);
      }, children: "Post" })
    ] })
  ] });
}
export {
  AnnouncementsPage as component
};
