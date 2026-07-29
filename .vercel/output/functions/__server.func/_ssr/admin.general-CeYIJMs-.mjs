import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, Y as getAllSettings, aF as updateSetting, aJ as AdminPageHeader, B as Button, ae as Card, af as CardContent, ac as Label, a0 as Input, ad as Textarea, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
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
const DEFAULTS = {
  site_name: "My Community",
  site_tagline: "Realtime chatrooms & social",
  site_description: "",
  signups_open: true,
  maintenance_mode: false
};
const DM_DELETE_DEFAULT = {
  min_role: "user"
};
function GeneralSettings() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const {
    data
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings({})
  });
  const [values, setValues] = reactExports.useState(DEFAULTS);
  const [dmDeleteRole, setDmDeleteRole] = reactExports.useState(DM_DELETE_DEFAULT.min_role);
  reactExports.useEffect(() => {
    if (!data) return;
    const g = data.general || {};
    setValues({
      ...DEFAULTS,
      ...g
    });
    const dd = data.dm_chat_delete?.min_role;
    if (dd === "user" || dd === "moderator" || dd === "admin" || dd === "super_admin") {
      setDmDeleteRole(dd);
    }
  }, [data]);
  const mut = useMutation({
    mutationFn: () => saveSetting({
      data: {
        key: "general",
        value: values
      }
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  const dmMut = useMutation({
    mutationFn: () => saveSetting({
      data: {
        key: "dm_chat_delete",
        value: {
          min_role: dmDeleteRole
        }
      }
    }),
    onSuccess: () => {
      toast.success("DM permission saved");
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  const set = (k, v) => setValues((s) => ({
    ...s,
    [k]: v
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "General", description: "Basic site identity and global toggles.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, children: mut.isPending ? "Saving…" : "Save changes" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "site_name", children: "Site name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "site_name", value: values.site_name, onChange: (e) => set("site_name", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "site_tagline", children: "Tagline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "site_tagline", value: values.site_tagline, onChange: (e) => set("site_tagline", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "site_description", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "site_description", rows: 3, value: values.site_description, onChange: (e) => set("site_description", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 border-t pt-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Open signups", desc: "Allow new users to create accounts.", value: values.signups_open, onChange: (v) => set("signups_open", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Maintenance mode", desc: "Hide the app from non-admins.", value: values.maintenance_mode, onChange: (v) => set("maintenance_mode", v) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "DM chat deletion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Minimum rank required to delete an entire direct-message conversation (removes messages for both sides)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dm_delete_role", className: "text-xs", children: "Minimum rank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "dm_delete_role", value: dmDeleteRole, onChange: (e) => setDmDeleteRole(e.target.value), className: "rounded-md border border-border bg-background px-3 py-1.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "user", children: "User (everyone)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderator", children: "Moderator+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Admin+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "super_admin", children: "Super Admin only" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => dmMut.mutate(), disabled: dmMut.isPending, children: dmMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) })
  ] });
}
function ToggleRow({
  label,
  desc,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: desc })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: value, onCheckedChange: onChange })
  ] });
}
export {
  GeneralSettings as component
};
