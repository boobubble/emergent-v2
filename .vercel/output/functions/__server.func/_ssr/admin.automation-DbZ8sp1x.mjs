import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppSettings, b as useServerFn, aF as updateSetting, aJ as AdminPageHeader, ae as Card, af as CardContent } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { C as Collapsible } from "./Collapsible-BYvkEmuh.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { T as ToggleRow, N as NumberField } from "./SettingsSection-DpMwxV3D.mjs";
import { u as useAdminMode } from "./admin-mode-C63OAOLU.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { Z as Zap, au as ShieldCheck, bN as Smartphone, a as Sparkles } from "../_libs/lucide-react.mjs";
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
const CONFIG = {
  recommended: { label: "Recommended", icon: Sparkles, className: "border-primary/40 bg-primary/10 text-primary" },
  "new-communities": { label: "Best for new communities", icon: Zap, className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  mobile: { label: "Optimized for mobile", icon: Smartphone, className: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  advanced: { label: "Advanced", icon: ShieldCheck, className: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" }
};
function RecommendedBadge({ variant }) {
  const c = CONFIG[variant];
  const Icon = c.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `h-5 gap-1 px-1.5 text-[10px] font-medium ${c.className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
    c.label
  ] });
}
const DEFAULTS = {
  level: "low",
  digestEnabled: true,
  rehydrateEnabled: false,
  cooldownSec: 300
};
const LEVEL_DESC = {
  off: "No automated actions. You drive everything manually.",
  low: "Light nudges only — daily digests, occasional re-engagement.",
  medium: "Balanced automation — recommended for most communities.",
  high: "Aggressive — frequent prompts, automated boosts and refills."
};
function AutomationPage() {
  const {
    raw,
    modules,
    refresh
  } = useAppSettings();
  const {
    isAdvanced
  } = useAdminMode();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const current = {
    ...DEFAULTS,
    ...raw.automation || {}
  };
  const mut = useMutation({
    mutationFn: (next) => saveSetting({
      data: {
        key: "automation",
        value: {
          ...current,
          ...next
        }
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Automation", description: "Smart automation runs behind the scenes. Pick a level — fine-tune later if needed." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Automation level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecommendedBadge, { variant: "recommended" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4", children: ["off", "low", "medium", "high"].map((lvl) => {
        const active = current.level === lvl;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => mut.mutate({
          level: lvl
        }), disabled: mut.isPending, className: `rounded-lg border p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border/60 bg-background hover:border-primary/40"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold uppercase tracking-wide", children: lvl }) }, lvl);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: LEVEL_DESC[current.level] })
    ] }) }),
    current.level !== "off" && isAdvanced && /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible, { title: "Advanced automation", description: "Cooldowns, digests and re-engagement rules.", badge: /* @__PURE__ */ jsxRuntimeExports.jsx(RecommendedBadge, { variant: "advanced" }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Daily digest emails", desc: "Send a daily activity summary to opted-in users.", value: current.digestEnabled, onChange: (v) => mut.mutate({
        digestEnabled: v
      }) }),
      modules.notifications && /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Re-engagement pings", desc: "Notify dormant users when their rooms have activity.", value: current.rehydrateEnabled, onChange: (v) => mut.mutate({
        rehydrateEnabled: v
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: "Cooldown (seconds)", value: current.cooldownSec, min: 30, step: 30, onChange: (v) => mut.mutate({
        cooldownSec: v
      }), hint: "Minimum delay between automated actions per user." })
    ] }),
    current.level !== "off" && !isAdvanced && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "px-1 text-xs text-muted-foreground", children: [
      "Switch to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Advanced mode" }),
      " in the sidebar to tune cooldowns and rules."
    ] })
  ] });
}
export {
  AutomationPage as component
};
