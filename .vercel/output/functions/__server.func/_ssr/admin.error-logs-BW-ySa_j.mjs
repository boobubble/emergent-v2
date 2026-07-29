import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, aJ as AdminPageHeader, a0 as Input, B as Button } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { o as objectType, s as stringType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "tslib";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
const listSchema = objectType({
  q: stringType().optional(),
  severity: stringType().optional(),
  route: stringType().optional(),
  userId: stringType().uuid().optional(),
  unresolvedOnly: booleanType().optional(),
  limit: numberType().int().min(1).max(500).optional()
});
const listClientErrorLogs = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => listSchema.parse(input ?? {})).handler(createSsrRpc("628c9e3634fbc889e9b3fef4af2beb28ec95d70d3ddaeb7c72d90c7edb847d36"));
const resolveClientErrorLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("a7503f40011204dcbc25e5638f167cd6bf992498c6faf25bd9175c9d770c90e1"));
const deleteClientErrorLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("f6f22a24aa17d1a34b9f66960b7af47ce6d1b888f6fcd1274fcb7f884bc9cdcb"));
const exportClientErrorLogsCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).validator((input) => listSchema.parse(input ?? {})).handler(createSsrRpc("a628f26ef7cf86ea5c08a819549f703e6b48f6af100c9d20a581bc1aed70f5e0"));
const SEVERITIES = ["info", "warn", "error", "fatal"];
function Page() {
  const qc = useQueryClient();
  const fetchLogs = useServerFn(listClientErrorLogs);
  const resolveFn = useServerFn(resolveClientErrorLog);
  const deleteFn = useServerFn(deleteClientErrorLog);
  const exportFn = useServerFn(exportClientErrorLogsCsv);
  const [q, setQ] = reactExports.useState("");
  const [severity, setSeverity] = reactExports.useState("");
  const [routeFilter, setRouteFilter] = reactExports.useState("");
  const [unresolvedOnly, setUnresolvedOnly] = reactExports.useState(true);
  const [selected, setSelected] = reactExports.useState(null);
  const filters = reactExports.useMemo(() => ({
    q: q || void 0,
    severity: severity || void 0,
    route: routeFilter || void 0,
    unresolvedOnly
  }), [q, severity, routeFilter, unresolvedOnly]);
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["admin-error-logs", filters],
    queryFn: () => fetchLogs({
      data: filters
    }),
    staleTime: 15e3
  });
  reactExports.useEffect(() => {
    const ch = supabase.channel("admin-client-error-logs").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "client_error_logs"
    }, () => {
      void refetch();
    }).subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [refetch]);
  const resolveMut = useMutation({
    mutationFn: (id) => resolveFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Marked resolved");
      void qc.invalidateQueries({
        queryKey: ["admin-error-logs"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const deleteMut = useMutation({
    mutationFn: (id) => deleteFn({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Deleted");
      setSelected(null);
      void qc.invalidateQueries({
        queryKey: ["admin-error-logs"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  async function exportCsv() {
    try {
      const {
        csv
      } = await exportFn({
        data: filters
      });
      const blob = new Blob([csv], {
        type: "text/csv"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `client-error-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.message);
    }
  }
  const rows = data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Error Logs", description: "Client-side runtime errors captured from users in production. Search by route, user, severity, or message." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search message…", value: q, onChange: (e) => setQ(e.target.value), className: "max-w-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Route filter…", value: routeFilter, onChange: (e) => setRouteFilter(e.target.value), className: "max-w-[160px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: severity, onChange: (e) => setSeverity(e.target.value), className: "h-9 rounded-md border border-input bg-background px-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All severities" }),
        SEVERITIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: unresolvedOnly, onChange: (e) => setUnresolvedOnly(e.target.checked) }),
        "Unresolved only"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => void refetch(), children: "Refresh" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => void exportCsv(), children: "Export CSV" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr_360px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-xl border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px_72px_1fr_100px] gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "When" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Severity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Route" })
        ] }),
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-sm text-muted-foreground", children: "Loading…" }),
        !isLoading && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-sm text-muted-foreground", children: "No error logs yet." }),
        rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelected(r), className: `grid w-full grid-cols-[140px_72px_1fr_100px] gap-2 border-b border-border/60 px-3 py-2 text-left text-xs hover:bg-muted/50 ${selected?.id === r.id ? "bg-muted/60" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: new Date(r.created_at).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeverityBadge, { severity: r.severity, resolved: !!r.resolved_at }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: r.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-muted-foreground", children: r.route ?? "—" })
        ] }, r.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-card p-4 text-sm", children: !selected ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Select a log entry for details." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SeverityBadge, { severity: selected.severity, resolved: !!selected.resolved_at }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            !selected.resolved_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => resolveMut.mutate(selected.id), children: "Resolve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: () => deleteMut.mutate(selected.id), children: "Delete" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Message", value: selected.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Route", value: selected.route }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "URL", value: selected.url }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "User", value: selected.user_id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Browser", value: `${selected.browser ?? "?"} · ${selected.os ?? "?"} · ${selected.device ?? "?"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "Screen", value: selected.screen }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { label: "App", value: `${selected.app_version ?? "?"} / ${selected.build_version ?? "?"}` }),
        selected.stack && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: "Stack" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-[10px]", children: selected.stack })
        ] }),
        selected.component_stack && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: "Component stack" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-[10px]", children: selected.component_stack })
        ] }),
        selected.metadata && Object.keys(selected.metadata).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: "Metadata" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px]", children: JSON.stringify(selected.metadata, null, 2) })
        ] })
      ] }) })
    ] })
  ] });
}
function SeverityBadge({
  severity,
  resolved
}) {
  const tone = severity === "fatal" ? "destructive" : severity === "error" ? "destructive" : severity === "warn" ? "secondary" : "outline";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: tone, className: "text-[10px] uppercase", children: [
    severity,
    resolved ? " ✓" : ""
  ] });
}
function Detail({
  label,
  value
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 break-all text-xs", children: value })
  ] });
}
export {
  Page as component
};
