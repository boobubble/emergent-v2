import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { F as FUTURE_FLAG_DEFAULTS, a as FUTURE_MODULES } from "./future-modules-Cv8KqWM7.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a6 as ChevronRight } from "../_libs/lucide-react.mjs";
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
const CATEGORY_LABEL = {
  economy: "Economy",
  engagement: "Engagement",
  social: "Social",
  commerce: "Commerce",
  premium: "Premium",
  ai: "AI"
};
const STATUS_STYLES = {
  planned: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  beta: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  deprecated: "bg-red-500/15 text-red-600 dark:text-red-400"
};
function UpcomingHub() {
  const {
    raw,
    refresh
  } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);
  const flags = {
    ...FUTURE_FLAG_DEFAULTS,
    ...raw.future_flags ?? {}
  };
  const mut = useMutation({
    mutationFn: (next) => saveSetting({
      data: {
        key: "future_flags",
        value: next
      }
    }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
      toast.success("Updated");
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const toggle = (key, v) => mut.mutate({
    ...flags,
    [key]: v
  });
  const groups = {
    economy: [],
    engagement: [],
    social: [],
    commerce: [],
    premium: [],
    ai: []
  };
  for (const m of FUTURE_MODULES) groups[m.category].push(m);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Upcoming Modules", description: "Architecture-ready placeholders. Flip a flag to expose the module's UI once it's implemented. All modules ship disabled by default." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground", children: [
      "These toggles control ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-background px-1 py-0.5", children: "app_settings.future_flags" }),
      ". Enabling a flag does not implement the feature — it only signals readiness to the client."
    ] }),
    Object.keys(groups).map((cat) => groups[cat].length === 0 ? null : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: CATEGORY_LABEL[cat] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "divide-y p-0", children: groups[cat].map((m) => {
        const Icon = m.icon;
        const on = Boolean(flags[m.key]);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: m.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-[10px] uppercase ${STATUS_STYLES[m.status]}`, children: m.status.replace("_", " ") }),
              m.dependsOn?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "needs: ",
                m.dependsOn.join(", ")
              ] }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: m.description })
          ] }),
          m.adminRoute ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/upcoming/$key", params: {
            key: m.key
          }, className: "hidden items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted sm:inline-flex", children: [
            "Details ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: on, onCheckedChange: (v) => toggle(m.key, v), disabled: mut.isPending || m.status === "deprecated" })
        ] }, m.key);
      }) }) })
    ] }, cat))
  ] });
}
export {
  UpcomingHub as component
};
