import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, aJ as AdminPageHeader, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent, B as Button, ad as Textarea, a0 as Input } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { q as listSafetyEvents, s as getSafetyOverview, v as resolveSafetyEvent, w as listSafetyKeywords, x as addSafetyKeyword, y as toggleSafetyKeyword, z as removeSafetyKeyword } from "./moderation.functions-BtSBLwCC.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { T as TriangleAlert, aS as ShieldAlert, au as ShieldCheck, d as Trash2 } from "../_libs/lucide-react.mjs";
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
const SEV_LABEL = {
  1: {
    label: "Suspicious",
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30"
  },
  2: {
    label: "High risk",
    color: "bg-orange-500/15 text-orange-600 border-orange-500/30"
  },
  3: {
    label: "Imminent",
    color: "bg-red-500/15 text-red-600 border-red-500/30"
  }
};
function SafetyPage() {
  const listFn = useServerFn(listSafetyEvents);
  const overviewFn = useServerFn(getSafetyOverview);
  const resolveFn = useServerFn(resolveSafetyEvent);
  const listKw = useServerFn(listSafetyKeywords);
  const addKw = useServerFn(addSafetyKeyword);
  const toggleKw = useServerFn(toggleSafetyKeyword);
  const removeKw = useServerFn(removeSafetyKeyword);
  const [status, setStatus] = reactExports.useState("pending");
  const overview = useQuery({
    queryKey: ["safety-overview"],
    queryFn: () => overviewFn()
  });
  const events = useQuery({
    queryKey: ["safety-events", status],
    queryFn: () => listFn({
      data: {
        status,
        limit: 100
      }
    })
  });
  const keywords = useQuery({
    queryKey: ["safety-keywords"],
    queryFn: () => listKw()
  });
  async function resolve(id, next) {
    try {
      await resolveFn({
        data: {
          id,
          status: next
        }
      });
      toast.success("Safety event updated");
      events.refetch();
      overview.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Safety Review", description: "Automated detection of illegal, violent or extremist content. Review flagged messages and manage keyword rules." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }), label: "Pending review", value: overview.data?.pending ?? "—", tone: "warn" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }), label: "Imminent threats (24h)", value: overview.data?.imminent24h ?? "—", tone: "danger" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }), label: "Blocked (24h)", value: overview.data?.blocked24h ?? "—", tone: "info" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between gap-2 space-y-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Flagged messages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "kept_blocked", children: "Kept blocked" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false_positive", children: "False positive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "escalated", children: "Escalated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        events.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }),
        events.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground", children: "No events." }),
        events.data?.map((e) => {
          const sev = SEV_LABEL[e.severity] ?? SEV_LABEL[1];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: sev.color, children: [
                "L",
                e.severity,
                " · ",
                sev.label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: e.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: e.action }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-muted-foreground", children: new Date(e.created_at).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded bg-muted/40 p-2 text-sm font-mono break-words", children: e.message_text }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [
              "Channel: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: e.channel_id ?? "—" }),
              " · User: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: e.user_id?.slice(0, 8) ?? "—" }),
              e.matched_pattern && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                " · Pattern: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: e.matched_pattern })
              ] })
            ] }),
            e.status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: () => resolve(e.id, "kept_blocked"), children: "Keep blocked" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => resolve(e.id, "false_positive"), children: "False positive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => resolve(e.id, "escalated"), children: "Escalate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => resolve(e.id, "approved"), children: "Approve" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [
              "Reviewed: ",
              e.status,
              e.reviewer_note ? ` — ${e.reviewer_note}` : ""
            ] })
          ] }, e.id);
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KeywordsPanel, { keywords: keywords.data ?? [], onAdd: async (payload) => {
      try {
        await addKw({
          data: payload
        });
        toast.success("Keyword added");
        keywords.refetch();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed");
      }
    }, onToggle: async (id, active) => {
      await toggleKw({
        data: {
          id,
          active
        }
      });
      keywords.refetch();
    }, onRemove: async (id) => {
      if (!confirm("Delete this keyword rule?")) return;
      await removeKw({
        data: {
          id
        }
      });
      keywords.refetch();
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { readOnly: true, value: "Level 1: silently logged for review. Level 2: message blocked + sender auto-muted 1h. Level 3: message blocked + sender chat-suspended 24h. Enforcement runs inside the database, so no client can bypass it.", className: "bg-muted/30 text-xs", rows: 3 })
  ] });
}
function StatCard({
  icon,
  label,
  value,
  tone
}) {
  const toneClass = tone === "danger" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-primary";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-10 w-10 place-items-center rounded-md bg-muted/50 ${toneClass}`, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-semibold ${toneClass}`, children: value })
    ] })
  ] }) });
}
function KeywordsPanel({
  keywords,
  onAdd,
  onToggle,
  onRemove
}) {
  const [pattern, setPattern] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("threats");
  const [severity, setSeverity] = reactExports.useState(2);
  const [matchMode, setMatchMode] = reactExports.useState("substring");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Keyword rules" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[1fr_140px_120px_120px_auto]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Pattern or phrase", value: pattern, onChange: (e) => setPattern(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: (v) => setCategory(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "violent_crime", children: "Violent crime" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "terrorism", children: "Terrorism" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "illegal_coordination", children: "Illegal coord." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "threats", children: "Threats" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dangerous_instructions", children: "Dangerous instr." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "self_harm", children: "Self-harm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(severity), onValueChange: (v) => setSeverity(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "L1 · log" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "L2 · block+mute" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "L3 · block+suspend" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: matchMode, onValueChange: (v) => setMatchMode(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "substring", children: "Substring" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "word", children: "Whole word" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "regex", children: "Regex" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: async () => {
          if (pattern.trim().length < 2) return;
          await onAdd({
            pattern: pattern.trim(),
            category,
            severity,
            match_mode: matchMode
          });
          setPattern("");
        }, children: "Add" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[420px] space-y-2 overflow-y-auto", children: keywords.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: SEV_LABEL[k.severity]?.color, children: [
          "L",
          k.severity
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: k.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: k.match_mode }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-mono break-words", children: k.pattern }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: k.active ? "secondary" : "outline", onClick: () => onToggle(k.id, !k.active), children: k.active ? "Active" : "Off" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onRemove(k.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, k.id)) })
    ] })
  ] });
}
export {
  SafetyPage as component
};
