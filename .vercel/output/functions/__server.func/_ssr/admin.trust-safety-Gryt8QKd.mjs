import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { aJ as AdminPageHeader, b as useServerFn, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent, ac as Label, B as Button, a0 as Input, aG as AdminToggle } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { S as Skeleton } from "./skeleton-CsqSgU8F.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as updateTrustSafetySettings, l as listWordFiltersExtended, a as upsertWordFilter, d as deleteWordFilter, b as listTrustViolations, c as getTrustSafetySettings } from "./trust-safety.functions-CIMNTEvE.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { S as Shield, b1 as Funnel, aU as Link2, aw as Gavel, a_ as ScrollText, b as Save, d as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
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
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
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
const WORD_ACTIONS = ["replace", "reject", "warn", "temp_mute", "permanent_mute", "shadow_mute", "add_violation_point"];
const PENALTY_ACTIONS = ["warn", "temp_mute", "permanent_mute", "permanent_ban"];
function TrustSafetyAdmin() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Trust & Safety", description: "One reusable framework for account maturity, DM privacy, bad-word filtering, URL rules, and automatic penalties." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "unlocks", className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "unlocks", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "mr-1 h-3 w-3" }),
          "Feature Unlocks"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "words", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "mr-1 h-3 w-3" }),
          "Bad Words"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "urls", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "mr-1 h-3 w-3" }),
          "URL Rules"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "penalties", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "mr-1 h-3 w-3" }),
          "Violation & Penalty Rules"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "logs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "mr-1 h-3 w-3" }),
          "Violation Logs"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "unlocks", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UnlocksTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "words", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WordsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "urls", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UrlsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "penalties", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PenaltiesTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "logs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogsTab, {}) })
    ] })
  ] });
}
function useSettings() {
  const fetchFn = useServerFn(getTrustSafetySettings);
  return useQuery({
    queryKey: ["trust-safety-settings"],
    queryFn: () => fetchFn()
  });
}
function UnlocksTab() {
  const qc = useQueryClient();
  const q = useSettings();
  const saveFn = useServerFn(updateTrustSafetySettings);
  const [form, setForm] = reactExports.useState({});
  if (q.isLoading || !q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" });
  const cur = {
    ...q.data,
    ...form
  };
  const save = async () => {
    try {
      await saveFn({
        data: form
      });
      toast.success("Saved");
      setForm({});
      qc.invalidateQueries({
        queryKey: ["trust-safety-settings"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const setUnlock = (k, v) => setForm((f) => ({
    ...f,
    feature_unlocks: {
      ...cur.feature_unlocks,
      [k]: v
    }
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Account Maturity & Feature Unlocks" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Trust & Safety enabled", checked: !!cur.enabled, onCheckedChange: (v) => setForm((f) => ({
        ...f,
        enabled: v
      })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unlock mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: cur.unlock_mode, onChange: (e) => setForm((f) => ({
            ...f,
            unlock_mode: e.target.value
          })), className: "mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "level", children: "Minimum Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "age", children: "Minimum Account Age (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "verified", children: "Verified only" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumField, { label: "Minimum Account Age (days)", value: cur.min_account_age_days, onChange: (v) => setForm((f) => ({
          ...f,
          min_account_age_days: v
        })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { compact: true, label: "Require verified", checked: !!cur.require_verified, onCheckedChange: (v) => setForm((f) => ({
          ...f,
          require_verified: v
        })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Feature Unlock Levels" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Users below the required level fall back to defaults (DM open, no advanced controls)." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumField, { label: "DM Privacy Settings", value: cur.feature_unlocks?.dm_privacy ?? 5, onChange: (v) => setUnlock("dm_privacy", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumField, { label: "Custom Message Requests", value: cur.feature_unlocks?.message_requests ?? 10, onChange: (v) => setUnlock("message_requests", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumField, { label: "Advanced Safety Controls", value: cur.feature_unlocks?.advanced_safety ?? 15, onChange: (v) => setUnlock("advanced_safety", v) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: Object.keys(form).length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
        "Save"
      ] }) })
    ] })
  ] });
}
function WordsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWordFiltersExtended);
  const saveFn = useServerFn(upsertWordFilter);
  const delFn = useServerFn(deleteWordFilter);
  const q = useQuery({
    queryKey: ["word-filters-ext"],
    queryFn: () => listFn()
  });
  const [draft, setDraft] = reactExports.useState({
    pattern: "",
    match_mode: "word",
    category: "abuse",
    actions: ["replace"],
    violation_points: 1
  });
  const toggleAction = (a) => setDraft((d) => ({
    ...d,
    actions: d.actions.includes(a) ? d.actions.filter((x) => x !== a) : [...d.actions, a]
  }));
  const add = async () => {
    if (!draft.pattern.trim()) return;
    try {
      await saveFn({
        data: {
          ...draft,
          pattern: draft.pattern.trim()
        }
      });
      toast.success("Added");
      setDraft({
        pattern: "",
        match_mode: "word",
        category: draft.category,
        actions: draft.actions,
        violation_points: draft.violation_points
      });
      qc.invalidateQueries({
        queryKey: ["word-filters-ext"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const remove = async (id) => {
    if (!confirm("Delete this word rule?")) return;
    try {
      await delFn({
        data: {
          id
        }
      });
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["word-filters-ext"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const toggleActive = async (id, pattern, active, current) => {
    try {
      await saveFn({
        data: {
          id,
          pattern,
          match_mode: current.match_mode ?? "word",
          category: current.category ?? "general",
          actions: current.actions ?? ["replace"],
          violation_points: current.violation_points ?? 1,
          active
        }
      });
      qc.invalidateQueries({
        queryKey: ["word-filters-ext"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Bad Words" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Applied to Feed Posts, Poetry, Comments, Captions, Competition submissions. Private DMs are excluded — only URL masking runs there." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Add rule" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Pattern" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.pattern, onChange: (e) => setDraft((d) => ({
              ...d,
              pattern: e.target.value
            })), placeholder: "badword" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.category, onChange: (e) => setDraft((d) => ({
              ...d,
              category: e.target.value
            })), placeholder: "abuse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Match mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: draft.match_mode, onChange: (e) => setDraft((d) => ({
              ...d,
              match_mode: e.target.value
            })), className: "mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "word", children: "Whole word" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "substring", children: "Substring" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "regex", children: "Regex" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Violation points" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 100, value: draft.violation_points, onChange: (e) => setDraft((d) => ({
              ...d,
              violation_points: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Actions (combine)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: WORD_ACTIONS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: draft.actions.includes(a) ? "default" : "outline", onClick: () => toggleAction(a), children: a }, a)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: add, children: "Add rule" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" }),
        (q.data ?? []).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: String(w.pattern) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: String(w.match_mode) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: String(w.category ?? "general") }),
          (w.actions ?? []).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: a }, a)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "+",
            String(w.violation_points ?? 1),
            " pts"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: Boolean(w.active), onCheckedChange: (v) => toggleActive(w.id, w.pattern, v, w) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: () => remove(w.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
          ] })
        ] }, w.id)),
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No rules yet." })
      ] })
    ] })
  ] });
}
function UrlsTab() {
  const qc = useQueryClient();
  const q = useSettings();
  const saveFn = useServerFn(updateTrustSafetySettings);
  if (!q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" });
  const cur = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "URL Rules" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "The URL allow/block list is shared with existing Moderation. Manage it in the dedicated screen:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/moderation", className: "inline-flex w-fit", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "mr-1 h-4 w-4" }),
        "Open Moderation → URL Rules"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Behaviour for blocked URLs in Public Content (Feed / Poetry / Comments / Competitions)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex gap-2", children: ["replace", "reject"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: cur.public_url_action === v ? "default" : "outline", onClick: async () => {
          await saveFn({
            data: {
              public_url_action: v
            }
          });
          toast.success("Saved");
          qc.invalidateQueries({
            queryKey: ["trust-safety-settings"]
          });
        }, children: v === "replace" ? "Replace with ****" : "Reject submission" }, v)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
          "Blocked URLs inside private DMs are always ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "masked for the receiver only" }),
          " — the sender's text is never modified."
        ] })
      ] })
    ] })
  ] });
}
function PenaltiesTab() {
  const qc = useQueryClient();
  const q = useSettings();
  const saveFn = useServerFn(updateTrustSafetySettings);
  const [form, setForm] = reactExports.useState({});
  if (!q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" });
  const cur = {
    ...q.data,
    ...form
  };
  const updateThreshold = (i, patch) => {
    const next = [...cur.penalty_thresholds];
    next[i] = {
      ...next[i],
      ...patch
    };
    setForm((f) => ({
      ...f,
      penalty_thresholds: next
    }));
  };
  const addThreshold = () => setForm((f) => ({
    ...f,
    penalty_thresholds: [...cur.penalty_thresholds, {
      points: 0,
      action: "warn",
      duration_minutes: 0
    }]
  }));
  const removeThreshold = (i) => setForm((f) => ({
    ...f,
    penalty_thresholds: cur.penalty_thresholds.filter((_, x) => x !== i)
  }));
  const setVp = (k, v) => setForm((f) => ({
    ...f,
    violation_points: {
      ...cur.violation_points,
      [k]: v
    }
  }));
  const save = async () => {
    try {
      await saveFn({
        data: form
      });
      toast.success("Saved");
      setForm({});
      qc.invalidateQueries({
        queryKey: ["trust-safety-settings"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Violation Point Values" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "grid gap-3 sm:grid-cols-3", children: Object.entries(cur.violation_points).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(NumField, { label: k, value: v, onChange: (x) => setVp(k, x) }, k)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Automatic Penalties (highest matching threshold applies)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        cur.penalty_thresholds.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-4 rounded-lg border bg-card p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumField, { label: "Points ≥", value: t.points, onChange: (v) => updateThreshold(i, {
            points: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: t.action, onChange: (e) => updateThreshold(i, {
              action: e.target.value
            }), className: "mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm", children: PENALTY_ACTIONS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a, children: a }, a)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumField, { label: "Duration (mins)", value: t.duration_minutes, onChange: (v) => updateThreshold(i, {
            duration_minutes: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => removeThreshold(i), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 h-3 w-3" }),
            "Remove"
          ] }) })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: addThreshold, children: "+ Add threshold" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: Object.keys(form).length === 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
      "Save"
    ] }) })
  ] });
}
function LogsTab() {
  const fetchFn = useServerFn(listTrustViolations);
  const q = useQuery({
    queryKey: ["trust-violations"],
    queryFn: () => fetchFn({
      data: {
        limit: 200
      }
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Violation Logs" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1 text-xs font-mono", children: [
      q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" }),
      (q.data ?? []).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 border-b py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: new Date(l.created_at).toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: String(l.type) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { children: [
          "+",
          String(l.points),
          " pts"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "user=",
          String(l.user_id).slice(0, 12)
        ] }),
        l.ref_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "ref=",
          String(l.ref_type ?? "?"),
          ":",
          String(l.ref_id).slice(0, 12)
        ] }),
        l.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          '"',
          l.reason,
          '"'
        ] })
      ] }, l.id)),
      q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No violations recorded." })
    ] })
  ] });
}
function NumField({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: value ?? 0, onChange: (e) => onChange(Number(e.target.value)), className: "mt-1" })
  ] });
}
function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  compact = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start justify-between gap-3 rounded-lg border bg-card p-3 ${compact ? "" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked, onCheckedChange })
  ] });
}
export {
  TrustSafetyAdmin as component
};
