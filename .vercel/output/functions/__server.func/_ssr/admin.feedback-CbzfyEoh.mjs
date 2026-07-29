import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { b as useServerFn, aK as useAdminSetting, ac as Label, a0 as Input, B as Button, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, aM as Switch, ad as Textarea, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { l as listFeedback, g as getFeedbackStats, a as adminUpdateFeedback, b as adminDeleteFeedback } from "./feedback.functions-c6GuNUDn.mjs";
import { a as FEEDBACK_STATUSES, S as STATUS_META, b as FEEDBACK_CATEGORIES, C as CATEGORY_META, F as FEEDBACK_DEFAULTS } from "./feedback-config-DIeqYcnl.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a0 as LoaderCircle, j as ChevronUp, bv as Pin, l as Star, h as MessageCircle, Y as Coins, b as Save, c0 as PinOff, a as Sparkles, d as Trash2, a$ as ChartColumn } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
function AdminFeedback() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Feedback & Bug Reports" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage submissions, statuses, rewards, and analytics." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "queue", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "queue", children: "Queue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "analytics", children: "Analytics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "settings", children: "Settings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "queue", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueueTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "analytics", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, {}) })
    ] })
  ] });
}
function QueueTab() {
  const list = useServerFn(listFeedback);
  const [status, setStatus] = reactExports.useState("all");
  const [category, setCategory] = reactExports.useState("all");
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-feedback", status, category],
    queryFn: () => list({
      data: {
        status,
        category,
        sort: "recent",
        limit: 200
      }
    })
  });
  const [editing, setEditing] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All status" }),
          FEEDBACK_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: STATUS_META[s].label }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: setCategory, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All categories" }),
          FEEDBACK_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: CATEGORY_META[c].label }, c))
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-xl border border-border bg-card", children: [
      (data ?? []).map((r) => {
        const Cat = CATEGORY_META[r.category] ?? CATEGORY_META.other;
        const St = STATUS_META[r.status] ?? STATUS_META.open;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setEditing(r), className: "flex w-full items-start gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-12 w-10 flex-col items-center justify-center rounded-lg border border-border bg-background", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: r.upvote_count })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              r.is_pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3 w-3 text-primary" }),
              r.is_showcased && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-amber-400 text-amber-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "truncate text-sm font-medium", children: r.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] ${Cat.tone}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Cat.icon, { className: "h-3 w-3" }),
                " ",
                Cat.label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] ${St.tone}`, children: St.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3" }),
                " ",
                r.comment_count
              ] })
            ] })
          ] })
        ] }, r.id);
      }),
      (data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "No reports." })
    ] }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(EditDialog, { row: editing, onClose: () => setEditing(null) })
  ] });
}
function EditDialog({
  row,
  onClose
}) {
  const qc = useQueryClient();
  const update = useServerFn(adminUpdateFeedback);
  const remove = useServerFn(adminDeleteFeedback);
  const [status, setStatus] = reactExports.useState(row.status);
  const [priority, setPriority] = reactExports.useState(row.priority);
  const [pinned, setPinned] = reactExports.useState(row.is_pinned);
  const [showcased, setShowcased] = reactExports.useState(!!row.is_showcased);
  const [note, setNote] = reactExports.useState(row.admin_note ?? "");
  const [xp, setXp] = reactExports.useState(0);
  const [coins, setCoins] = reactExports.useState(0);
  const save = useMutation({
    mutationFn: () => update({
      data: {
        id: row.id,
        status,
        priority,
        is_pinned: pinned,
        is_showcased: showcased,
        admin_note: note,
        reward: xp > 0 || coins > 0 ? {
          xp,
          coins
        } : void 0
      }
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["admin-feedback"]
      });
      qc.invalidateQueries({
        queryKey: ["feedback"]
      });
      onClose();
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: () => remove({
      data: {
        id: row.id
      }
    }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["admin-feedback"]
      });
      onClose();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "pr-8", children: row.title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEEDBACK_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: STATUS_META[s].label }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: priority, onValueChange: (v) => setPriority(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["low", "normal", "high", "critical"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between rounded-md border border-border p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm flex items-center gap-2", children: [
          pinned ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PinOff, { className: "h-4 w-4 text-muted-foreground" }),
          "Pin to top"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: pinned, onCheckedChange: setPinned })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between rounded-md border border-border p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-4 w-4 ${showcased ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}` }),
          "Showcase on home / signup"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: showcased, onCheckedChange: setShowcased })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Admin note (visible to user)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: note, onChange: (e) => setNote(e.target.value), rows: 3, maxLength: 2e3 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          " Reward author"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "XP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 1e3, value: xp, onChange: (e) => setXp(Number(e.target.value) || 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Coins" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 1e3, value: coins, onChange: (e) => setCoins(Number(e.target.value) || 0) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-wrap gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", size: "sm", onClick: () => del.mutate(), disabled: del.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 h-4 w-4" }),
        " Delete"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
          "Save"
        ] })
      ] })
    ] })
  ] }) });
}
function AnalyticsTab() {
  const stats = useServerFn(getFeedbackStats);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-feedback-stats"],
    queryFn: () => stats({})
  });
  if (isLoading || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total reports", value: data.total }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Open", value: data.open }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "This week", value: data.thisWeek })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "By category", children: data.byCategory.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: CATEGORY_META[c.category]?.label ?? c.category, value: c.count }, c.category)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "By status", children: data.byStatus.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: STATUS_META[s.status]?.label ?? s.status, value: s.count }, s.status)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Most requested features", children: [
        data.topFeatures.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: r.title, value: r.upvote_count }, r.id)),
        data.topFeatures.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Most reported bugs", children: [
        data.topBugs.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: r.title, value: r.upvote_count }, r.id)),
        data.topBugs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Top contributors", children: [
        data.topContributors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: c.username ?? c.user_id.slice(0, 8), value: c.count }, c.user_id)),
        data.topContributors.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {})
      ] })
    ] })
  ] });
}
function StatCard({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold tabular-nums", children: value })
  ] });
}
function Panel({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-2 text-sm font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-primary" }),
      " ",
      title
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children })
  ] });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums text-muted-foreground", children: value })
  ] });
}
function Empty() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No data." });
}
function SettingsTab() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("feedback", FEEDBACK_DEFAULTS);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Enable module", checked: values.enabled, onChange: (b) => set("enabled", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Allow comments", checked: values.allowComments, onChange: (b) => set("allowComments", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Allow upvotes", checked: values.allowUpvotes, onChange: (b) => set("allowUpvotes", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Allow screenshots", checked: values.allowScreenshots, onChange: (b) => set("allowScreenshots", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Allow anonymous submissions", checked: values.allowAnonymous, onChange: (b) => set("allowAnonymous", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Duplicate suggestion detection", checked: values.duplicateDetection, onChange: (b) => set("duplicateDetection", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Notify author on status change", checked: values.notifyOnStatusChange, onChange: (b) => set("notifyOnStatusChange", b) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-amber-400 text-amber-400" }),
        " Showcase"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs text-muted-foreground", children: "Pick individual reports in the Queue tab — toggle “Showcase on home / signup”. They appear publicly in the surfaces enabled below." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Show on home page", checked: values.showcaseOnHome, onChange: (b) => set("showcaseOnHome", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Show on signup / sign-in page", checked: values.showcaseOnSignup, onChange: (b) => set("showcaseOnSignup", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Section title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.showcaseTitle, maxLength: 80, onChange: (e) => set("showcaseTitle", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Max items shown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 24, value: values.showcaseLimit, onChange: (e) => set("showcaseLimit", Math.max(1, Math.min(24, Number(e.target.value) || 6))) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4 text-primary" }),
        " Rewards"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RewardRow, { label: "On submit", xp: values.rewardOnSubmit.xp, coins: values.rewardOnSubmit.coins, onChange: (xp, coins) => set("rewardOnSubmit", {
          xp,
          coins
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RewardRow, { label: "When marked Fixed", xp: values.rewardOnFixed.xp, coins: values.rewardOnFixed.coins, onChange: (xp, coins) => set("rewardOnFixed", {
          xp,
          coins
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, children: [
      saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
      "Save settings"
    ] }) })
  ] });
}
function Toggle({
  label,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked, onCheckedChange: onChange })
  ] });
}
function RewardRow({
  label,
  xp,
  coins,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "XP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: xp, onChange: (e) => onChange(Number(e.target.value) || 0, coins) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Coins" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: coins, onChange: (e) => onChange(xp, Number(e.target.value) || 0) })
      ] })
    ] })
  ] });
}
export {
  AdminFeedback as component
};
