import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useQuery, b as useMutation, a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { aJ as AdminPageHeader, b as useServerFn, b$ as listPlans, c0 as adminDeletePlan, B as Button, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent, c1 as adminListPayments, c2 as adminApprovePayment, c3 as adminRejectPayment, ac as Label, c4 as getSubscriptionMode, c5 as adminSetSubscriptionMode, a0 as Input, ad as Textarea, c6 as adminSubscriptionStats, c7 as adminUpsertPlan, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, aM as Switch, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { c as Plus, a4 as PenLine, d as Trash2, z as Check, X, a0 as LoaderCircle } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const DEFAULT_PERKS = {
  no_ads: false,
  premium_themes: false,
  premium_games: false,
  creator_tools: false,
  vip_badge: false,
  custom_username_effects: false,
  premium_radio_requests: false,
  premium_chatrooms: false,
  premium_feed_features: false,
  featured_room: false,
  dj_perks: false
};
function AdminSubscriptions() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Subscriptions & Membership", description: "Manage plans, approve manual payments, and configure subscription mode." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "plans", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "plans", children: "Plans" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "payments", children: "Payments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "settings", children: "Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "analytics", children: "Analytics" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "plans", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlansTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "payments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "analytics", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTab, {}) })
    ] })
  ] });
}
function PlansTab() {
  const fetchPlans = useServerFn(listPlans);
  const {
    data: plans,
    refetch
  } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => fetchPlans()
  });
  const [editing, setEditing] = reactExports.useState(null);
  const del = useServerFn(adminDeletePlan);
  const delMut = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Deleted");
      refetch();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setEditing({
      ...emptyPlan()
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
      " New plan"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: (plans ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            p.name,
            p.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-primary/15 px-1.5 text-[10px] text-primary", children: p.badge })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            p.slug,
            " · ",
            p.tier
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditing(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
            if (confirm(`Delete ${p.name}?`)) delMut.mutate(p.id);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          p.currency_symbol,
          p.monthly_price,
          "/mo · ",
          p.currency_symbol,
          p.yearly_price,
          "/yr"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Max personal rooms: ",
          p.max_personal_chatrooms,
          " · ",
          p.active ? "Active" : "Disabled"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "ml-4 list-disc text-xs text-muted-foreground", children: (p.features ?? []).slice(0, 4).map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: f }, i)) })
      ] })
    ] }, p.id)) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(PlanEditor, { plan: editing, onClose: () => {
      setEditing(null);
      refetch();
    } })
  ] });
}
function emptyPlan() {
  return {
    id: void 0,
    slug: "",
    name: "",
    description: "",
    badge: "",
    tier: "vip",
    currency_code: "INR",
    currency_symbol: "₹",
    monthly_price: 99,
    yearly_price: 999,
    trial_days: 0,
    features: ["No ads", "VIP badge"],
    perks: {
      ...DEFAULT_PERKS,
      no_ads: true,
      vip_badge: true,
      premium_themes: true
    },
    max_personal_chatrooms: 1,
    sort_order: 10,
    active: true,
    is_default: false
  };
}
function PlanEditor({
  plan,
  onClose
}) {
  const [v, setV] = reactExports.useState({
    ...plan,
    features: plan.features ?? [],
    perks: {
      ...DEFAULT_PERKS,
      ...plan.perks ?? {}
    }
  });
  const [featuresText, setFeaturesText] = reactExports.useState((plan.features ?? []).join("\n"));
  const upsert = useServerFn(adminUpsertPlan);
  const mut = useMutation({
    mutationFn: () => upsert({
      data: {
        id: v.id,
        slug: v.slug,
        name: v.name,
        description: v.description || null,
        badge: v.badge || null,
        tier: v.tier,
        currency_code: v.currency_code,
        currency_symbol: v.currency_symbol,
        monthly_price: Number(v.monthly_price),
        yearly_price: Number(v.yearly_price),
        trial_days: Number(v.trial_days),
        features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
        perks: v.perks,
        max_personal_chatrooms: Number(v.max_personal_chatrooms),
        sort_order: Number(v.sort_order),
        active: !!v.active,
        is_default: !!v.is_default
      }
    }),
    onSuccess: () => {
      toast.success("Saved");
      onClose();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: v.id ? "Edit plan" : "New plan" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Slug", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.slug, onChange: (e) => setV({
        ...v,
        slug: e.target.value
      }), placeholder: "vip" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.name, onChange: (e) => setV({
        ...v,
        name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Badge (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.badge, onChange: (e) => setV({
        ...v,
        badge: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tier", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.tier, onValueChange: (x) => setV({
        ...v,
        tier: x
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "free", children: "Free" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vip", children: "VIP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "creator", children: "Creator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Currency code (3 letters)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.currency_code, onChange: (e) => setV({
        ...v,
        currency_code: e.target.value.toUpperCase()
      }), maxLength: 3 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Currency symbol", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.currency_symbol, onChange: (e) => setV({
        ...v,
        currency_symbol: e.target.value
      }), maxLength: 4 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Monthly price", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.monthly_price, onChange: (e) => setV({
        ...v,
        monthly_price: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Yearly price", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.yearly_price, onChange: (e) => setV({
        ...v,
        yearly_price: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trial days", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.trial_days, onChange: (e) => setV({
        ...v,
        trial_days: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Max personal chatrooms", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.max_personal_chatrooms, onChange: (e) => setV({
        ...v,
        max_personal_chatrooms: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sort order", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.sort_order, onChange: (e) => setV({
        ...v,
        sort_order: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.description, onChange: (e) => setV({
          ...v,
          description: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Features (one per line)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: featuresText, onChange: (e) => setFeaturesText(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Perks (locked features unlocked by this plan)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-2 gap-2 rounded-xl border p-3", children: Object.keys(DEFAULT_PERKS).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-3 py-1.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: k.replaceAll("_", " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!v.perks[k], onCheckedChange: (b) => setV({
            ...v,
            perks: {
              ...v.perks,
              [k]: b
            }
          }) })
        ] }, k)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!v.active, onCheckedChange: (b) => setV({
          ...v,
          active: b
        }) }),
        " Active"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!v.is_default, onCheckedChange: (b) => setV({
          ...v,
          is_default: b
        }) }),
        " Default (free) plan"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, children: [
        mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Save"
      ] })
    ] })
  ] }) });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    children
  ] });
}
function PaymentsTab() {
  const [status, setStatus] = reactExports.useState("pending");
  const fetchPayments = useServerFn(adminListPayments);
  const qc = useQueryClient();
  const {
    data,
    refetch
  } = useQuery({
    queryKey: ["admin-sub-payments", status],
    queryFn: () => fetchPayments({
      data: {
        status
      }
    })
  });
  const approveFn = useServerFn(adminApprovePayment);
  const rejectFn = useServerFn(adminRejectPayment);
  const approve = useMutation({
    mutationFn: (id) => approveFn({
      data: {
        paymentId: id
      }
    }),
    onSuccess: () => {
      toast.success("Approved");
      refetch();
      qc.invalidateQueries({
        queryKey: ["my-subscription"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const reject = useMutation({
    mutationFn: (id) => rejectFn({
      data: {
        paymentId: id
      }
    }),
    onSuccess: () => {
      toast.success("Rejected");
      refetch();
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      (data ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center justify-between gap-3 p-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
            p.user?.username ?? p.user_id.slice(0, 8),
            " → ",
            p.plan?.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            p.currency_code,
            " ",
            p.amount,
            " · ",
            p.billing_cycle,
            " · ",
            new Date(p.created_at).toLocaleString()
          ] }),
          p.proof_reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
            "Ref: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: p.proof_reference })
          ] }),
          p.admin_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs italic text-muted-foreground", children: [
            "Note: ",
            p.admin_note
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded px-2 py-0.5 text-xs font-bold ${p.status === "approved" ? "bg-green-500/20 text-green-700" : p.status === "rejected" ? "bg-red-500/20 text-red-700" : "bg-amber-500/20 text-amber-700"}`, children: p.status }),
          p.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => approve.mutate(p.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 h-4 w-4" }),
              " Approve"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => reject.mutate(p.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-4 w-4" }),
              " Reject"
            ] })
          ] })
        ] })
      ] }) }, p.id)),
      (data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "No payments to show." })
    ] })
  ] });
}
function SettingsTab() {
  const fetchCfg = useServerFn(getSubscriptionMode);
  const setMode = useServerFn(adminSetSubscriptionMode);
  const qc = useQueryClient();
  const {
    data: cfg
  } = useQuery({
    queryKey: ["sub-cfg"],
    queryFn: () => fetchCfg()
  });
  const [mode, setModeState] = reactExports.useState("optional");
  const [instr, setInstr] = reactExports.useState("");
  const [curr, setCurr] = reactExports.useState("INR");
  const [sym, setSym] = reactExports.useState("₹");
  if (cfg && mode === "optional" && !instr && cfg.mode) {
    setModeState(cfg.mode);
    setInstr(cfg.payment_instructions || "");
    setCurr(cfg.default_currency || "INR");
    setSym(cfg.default_currency_symbol || "₹");
  }
  const save = useMutation({
    mutationFn: () => setMode({
      data: {
        mode,
        payment_instructions: instr,
        default_currency: curr,
        default_currency_symbol: sym
      }
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["sub-cfg"]
      });
      qc.invalidateQueries({
        queryKey: ["subscription-mode"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Subscription mode" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mode, onValueChange: (v) => setModeState(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "off", children: "Off — hide subscriptions everywhere" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "optional", children: "Optional — users can upgrade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "required", children: "Required — must pick a plan after signup" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Default currency code", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 3, value: curr, onChange: (e) => setCurr(e.target.value.toUpperCase()) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Default currency symbol", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 4, value: sym, onChange: (e) => setSym(e.target.value) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment instructions (shown in checkout)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: instr, onChange: (e) => setInstr(e.target.value), placeholder: "e.g. Send payment to UPI: yourname@upi" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: [
        save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Save"
      ] })
    ] })
  ] }) });
}
function AnalyticsTab() {
  const fn = useServerFn(adminSubscriptionStats);
  const {
    data
  } = useQuery({
    queryKey: ["sub-stats"],
    queryFn: () => fn()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total subscribers", value: data?.total ?? 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active", value: data?.active ?? 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Expired", value: data?.expired ?? 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending payments", value: data?.pendingPayments ?? 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "md:col-span-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Revenue (last 30 days)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "text-sm", children: Object.entries(data?.revenue30d ?? {}).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No approved payments yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: Object.entries(data.revenue30d).map(([c, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: c }),
        ": ",
        Number(v).toFixed(2)
      ] }, c)) }) })
    ] })
  ] });
}
function StatCard({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: value })
  ] }) });
}
export {
  AdminSubscriptions as component
};
