import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { aJ as AdminPageHeader, ae as Card, af as CardContent, B as Button, aK as useAdminSetting, ac as Label, a0 as Input } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { D as DEFAULT_LIMITS } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { aS as ShieldAlert, d as Trash2, b as Save } from "../_libs/lucide-react.mjs";
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
function AbuseProtectionPage() {
  const qc = useQueryClient();
  const events = useQuery({
    queryKey: ["abuse-events"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("abuse_events").select("*").order("created_at", {
        ascending: false
      }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 3e4
  });
  const bans = useQuery({
    queryKey: ["abuse-bans"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rate_limit_bans").select("*").gt("banned_until", (/* @__PURE__ */ new Date()).toISOString()).order("banned_until", {
        ascending: false
      }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 3e4
  });
  const unban = useMutation({
    mutationFn: async (params) => {
      const {
        error
      } = await supabase.rpc("admin_clear_rate_limit_ban", {
        _key: params.key,
        _action: params.action ?? void 0
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Restriction cleared");
      qc.invalidateQueries({
        queryKey: ["abuse-bans"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const topOffenders = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const e of events.data ?? []) {
      const cur = map.get(e.key) ?? {
        key: e.key,
        hits: 0,
        lastReason: e.reason
      };
      cur.hits += 1;
      cur.lastReason = e.reason;
      map.set(e.key, cur);
    }
    return [...map.values()].sort((a, b) => b.hits - a.hits).slice(0, 10);
  }, [events.data]);
  const hitsToday = events.data?.length ?? 0;
  const activeBans = bans.data?.length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Abuse Protection", description: "Rate limits, spam detection and progressive restrictions." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Rate-limit hits (recent)", value: hitsToday }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active restrictions", value: activeBans }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Top offender", value: topOffenders[0]?.key ?? "—" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
        " Active temporary restrictions"
      ] }),
      bans.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "None right now." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (bans.data ?? []).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs truncate", children: b.key }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            b.action ?? "any",
            " · offenses: ",
            b.offense_count,
            " · until ",
            new Date(b.banned_until).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => unban.mutate({
          key: b.key,
          action: b.action
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
          " Clear"
        ] })
      ] }, b.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Top offenders (recent)" }),
      topOffenders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No offenders logged yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: topOffenders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: o.key }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            o.hits,
            " hits"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: o.lastReason })
        ] })
      ] }, o.key)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Recent events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-96 space-y-1 overflow-y-auto text-xs", children: [
        (events.data ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-b py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mr-2", children: e.action }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: e.key })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground whitespace-nowrap", children: [
            e.reason,
            " · ",
            new Date(e.created_at).toLocaleTimeString()
          ] })
        ] }, e.id)),
        events.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No events recorded." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LimitsEditor, {})
  ] });
}
function StatCard({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 truncate text-2xl font-semibold", children: value })
  ] }) });
}
function LimitsEditor() {
  const defaults = DEFAULT_LIMITS;
  const {
    values,
    patch,
    save,
    saving
  } = useAdminSetting("rate_limits", defaults);
  const [local, setLocal] = reactExports.useState(defaults);
  reactExports.useEffect(() => {
    setLocal({
      ...defaults,
      ...values
    });
  }, [values]);
  const update = (action, field, v) => {
    setLocal((s) => ({
      ...s,
      [action]: {
        ...s[action],
        [field]: v
      }
    }));
  };
  const commit = () => {
    patch(local);
    save();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Configurable limits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: commit, disabled: saving, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
        " ",
        saving ? "Saving…" : "Save"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Requests per window (seconds), per user (authenticated) or per IP (visitors). Admins bypass automatically." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: Object.entries(local).sort(([a], [b]) => a.localeCompare(b)).map(([action, def]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_5rem_5rem] items-center gap-2 rounded-md border p-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono truncate", children: action }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Limit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: def.limit, onChange: (e) => update(action, "limit", Math.max(1, Number(e.target.value) || 1)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Window (s)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: def.window, onChange: (e) => update(action, "window", Math.max(1, Number(e.target.value) || 1)) })
      ] })
    ] }, action)) })
  ] }) });
}
export {
  AbuseProtectionPage as component
};
