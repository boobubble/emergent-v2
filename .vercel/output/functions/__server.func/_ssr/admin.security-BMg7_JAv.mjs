import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { aK as useAdminSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aM as Switch, B as Button } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { cb as FingerprintPattern, aS as ShieldAlert, d as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
const DEFAULTS = {
  enabled: false
};
function SecurityPage() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("device_security", DEFAULTS);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Security", description: "Authentication, sessions, and device-level ban enforcement." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FingerprintPattern, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Device ban enforcement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: values.enabled ? "default" : "outline", children: values.enabled ? "On" : "Off" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "When enabled, every browser is hashed into a fingerprint on sign-in. Banning a user also bans every device they've used, so a fresh account from the same browser is blocked at signup — even on a different IP. Works best alongside email/phone verification; can be bypassed by a different browser, private mode, or another device." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: values.enabled, onCheckedChange: (v) => set("enabled", v), "aria-label": "Toggle device ban enforcement" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: save, disabled: saving, children: saving ? "Saving…" : "Save" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BannedDevicesPanel, {})
  ] });
}
function BannedDevicesPanel() {
  const qc = useQueryClient();
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const load = async () => {
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from("banned_devices").select("fingerprint, reason, created_at").order("created_at", {
      ascending: false
    }).limit(100);
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    void load();
  }, []);
  const del = useMutation({
    mutationFn: async (fp) => {
      const {
        error
      } = await supabase.from("banned_devices").delete().eq("fingerprint", fp);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Device unbanned");
      void load();
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Banned devices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-auto", children: rows.length })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Loading…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground", children: "No devices banned yet. Bans applied while device security is on will appear here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y rounded-md border", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 p-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "truncate font-mono text-[11px]", title: r.fingerprint, children: [
        r.fingerprint.slice(0, 12),
        "…",
        r.fingerprint.slice(-6)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: r.reason ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto whitespace-nowrap text-muted-foreground", children: new Date(r.created_at).toLocaleDateString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => del.mutate(r.fingerprint), disabled: del.isPending, "aria-label": "Unban device", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
    ] }, r.fingerprint)) })
  ] }) });
}
export {
  SecurityPage as component
};
