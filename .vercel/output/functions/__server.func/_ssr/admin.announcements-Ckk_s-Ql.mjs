import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, Y as getAllSettings, aO as updateAnnouncementsConfig, aP as canEditAnnouncements, aJ as AdminPageHeader, aM as Switch, B as Button, a0 as Input } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as DEFAULT_ANNOUNCEMENTS, A as ANNOUNCEMENTS_KEY } from "./ScheduledAnnouncements-CqUDiMdZ.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { aS as ShieldAlert, c as Plus, d as Trash2, b as Save } from "../_libs/lucide-react.mjs";
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
const MAX_ITEMS = 8;
const MIN_ITEMS = 4;
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function Page() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveAnnouncements = useServerFn(updateAnnouncementsConfig);
  const checkPerm = useServerFn(canEditAnnouncements);
  const qc = useQueryClient();
  const {
    data: settings
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings({})
  });
  const {
    data: perm
  } = useQuery({
    queryKey: ["can-edit-announcements"],
    queryFn: () => checkPerm({}),
    staleTime: 3e4
  });
  const [values, setValues] = reactExports.useState(DEFAULT_ANNOUNCEMENTS);
  reactExports.useEffect(() => {
    if (!settings) return;
    const v = settings[ANNOUNCEMENTS_KEY] ?? {};
    setValues({
      ...DEFAULT_ANNOUNCEMENTS,
      ...v,
      items: v.items ?? DEFAULT_ANNOUNCEMENTS.items
    });
  }, [settings]);
  const mut = useMutation({
    mutationFn: () => saveAnnouncements({
      data: values
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  const canEdit = !!perm?.allowed;
  const items = values.items ?? [];
  const updateItem = (id, p) => {
    if (!canEdit) return;
    setValues((s) => ({
      ...s,
      items: s.items.map((i) => i.id === id ? {
        ...i,
        ...p
      } : i)
    }));
  };
  const removeItem = (id) => {
    if (!canEdit || items.length <= MIN_ITEMS) return;
    setValues((s) => ({
      ...s,
      items: s.items.filter((i) => i.id !== id)
    }));
  };
  const addItem = () => {
    if (!canEdit || items.length >= MAX_ITEMS) return;
    setValues((s) => ({
      ...s,
      items: [...s.items, {
        id: uid(),
        text: "",
        link: "",
        intervalMinutes: 30,
        enabled: true
      }]
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Scheduled Announcements", description: "Auto-post special messages or links into chatrooms at fixed time intervals." }),
    perm && !canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "View-only access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          "Only admins and approved moderators can create or edit announcements. A super admin can grant moderators access from ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: 'Moderation → Staff Permissions → "Moderators can edit Announcements"' }),
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Enable scheduled announcements" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "When off, no announcements are posted." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!values.enabled, disabled: !canEdit, onCheckedChange: (v) => canEdit && setValues((s) => ({
        ...s,
        enabled: v
      })) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
          "Messages & links (",
          items.length,
          "/",
          MAX_ITEMS,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: addItem, disabled: !canEdit || items.length >= MAX_ITEMS, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add row"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "On" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Link (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Interval (min)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!it.enabled, disabled: !canEdit, onCheckedChange: (v) => updateItem(it.id, {
            enabled: v
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.text, readOnly: !canEdit, onChange: (e) => updateItem(it.id, {
            text: e.target.value
          }), placeholder: "e.g. 🎉 New event live now!" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.link ?? "", readOnly: !canEdit, onChange: (e) => updateItem(it.id, {
            link: e.target.value
          }), placeholder: "https://…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "w-32 px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, readOnly: !canEdit, value: it.intervalMinutes, onChange: (e) => updateItem(it.id, {
            intervalMinutes: Math.max(1, Number(e.target.value) || 1)
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeItem(it.id), disabled: !canEdit || items.length <= MIN_ITEMS, title: !canEdit ? "Read-only" : items.length <= MIN_ITEMS ? `Minimum ${MIN_ITEMS} rows` : "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }) })
        ] }, it.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border px-4 py-3 text-xs text-muted-foreground", children: "Each enabled row posts independently using its own interval. Announcements appear in the currently open public chatroom (DMs are skipped)." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mut.mutate(), disabled: !canEdit || mut.isPending, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
      " ",
      mut.isPending ? "Saving…" : "Save changes"
    ] }) })
  ] });
}
export {
  Page as component
};
