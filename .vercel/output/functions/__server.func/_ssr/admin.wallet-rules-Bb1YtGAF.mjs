import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { aJ as AdminPageHeader, ae as Card, ac as Label, a0 as Input, B as Button, aM as Switch } from "./router-CYWPFaDK.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { c as Plus, b as Save, d as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/tanstack__react-query.mjs";
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
const sb = supabase;
const NUM_FIELDS = ["coin_cost", "coin_reward", "daily_limit", "weekly_limit", "monthly_limit", "cooldown_seconds", "min_xp_level", "min_account_age_days", "min_reputation", "max_per_event", "max_per_conversation", "max_per_day", "refund_window_seconds"];
function AdminWalletRulesPage() {
  const [rules, setRules] = reactExports.useState([]);
  const [events, setEvents] = reactExports.useState([]);
  const [newFeature, setNewFeature] = reactExports.useState({
    feature: "",
    label: ""
  });
  const [newEvent, setNewEvent] = reactExports.useState({
    name: "",
    price_multiplier: 1,
    reward_multiplier: 1,
    enabled: true
  });
  const load = async () => {
    const [r, e] = await Promise.all([sb.from("wallet_rules").select("*").order("label"), sb.from("wallet_bonus_events").select("*").order("created_at", {
      ascending: false
    })]);
    setRules(r.data ?? []);
    setEvents(e.data ?? []);
  };
  reactExports.useEffect(() => {
    void load();
  }, []);
  const patchRule = (id, patch) => setRules((rs) => rs.map((r) => r.id === id ? {
    ...r,
    ...patch
  } : r));
  const saveRule = async (r) => {
    const {
      error
    } = await sb.from("wallet_rules").update(r).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`Saved ${r.label}`);
  };
  const addFeature = async () => {
    if (!newFeature.feature || !newFeature.label) return toast.error("feature key and label required");
    const {
      error
    } = await sb.from("wallet_rules").insert({
      feature: newFeature.feature.trim(),
      label: newFeature.label.trim()
    });
    if (error) return toast.error(error.message);
    setNewFeature({
      feature: "",
      label: ""
    });
    void load();
  };
  const deleteRule = async (id) => {
    if (!confirm("Delete this feature rule?")) return;
    const {
      error
    } = await sb.from("wallet_rules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };
  const addEvent = async () => {
    if (!newEvent.name) return toast.error("event name required");
    const {
      error
    } = await sb.from("wallet_bonus_events").insert({
      name: newEvent.name,
      description: newEvent.description ?? null,
      feature: newEvent.feature || null,
      price_multiplier: newEvent.price_multiplier ?? 1,
      reward_multiplier: newEvent.reward_multiplier ?? 1,
      starts_at: newEvent.starts_at ?? (/* @__PURE__ */ new Date()).toISOString(),
      ends_at: newEvent.ends_at || null,
      enabled: newEvent.enabled ?? true
    });
    if (error) return toast.error(error.message);
    setNewEvent({
      name: "",
      price_multiplier: 1,
      reward_multiplier: 1,
      enabled: true
    });
    void load();
  };
  const toggleEvent = async (e) => {
    const {
      error
    } = await sb.from("wallet_bonus_events").update({
      enabled: !e.enabled
    }).eq("id", e.id);
    if (error) return toast.error(error.message);
    void load();
  };
  const deleteEvent = async (id) => {
    if (!confirm("Delete this bonus event?")) return;
    const {
      error
    } = await sb.from("wallet_bonus_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto space-y-6 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Wallet Rules Engine", description: "Configure pricing, limits, and bonus events for every coins-based feature. Changes apply immediately." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "rules", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "rules", children: "Feature Rules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "events", children: "Bonus Events" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "rules", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 flex flex-wrap gap-2 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feature key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newFeature.feature, onChange: (e) => setNewFeature((f) => ({
              ...f,
              feature: e.target.value
            })), placeholder: "e.g. sticker_pack" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newFeature.label, onChange: (e) => setNewFeature((f) => ({
              ...f,
              label: e.target.value
            })), placeholder: "Sticker Packs" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addFeature, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Add feature"
          ] })
        ] }),
        rules.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: r.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "key: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: r.feature })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.enabled ? "default" : "secondary", children: r.enabled ? "Enabled" : "Disabled" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: r.enabled, onCheckedChange: (v) => patchRule(r.id, {
                enabled: v
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => saveRule(r), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-1" }),
                "Save"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => deleteRule(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-destructive" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
            NUM_FIELDS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: f }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: r[f] ?? "", onChange: (e) => patchRule(r.id, {
                [f]: e.target.value === "" ? null : Number(e.target.value)
              }) })
            ] }, f)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "required_plan_slug" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.required_plan_slug ?? "", onChange: (e) => patchRule(r.id, {
                required_plan_slug: e.target.value || null
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "required_badge" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.required_badge ?? "", onChange: (e) => patchRule(r.id, {
                required_badge: e.target.value || null
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: r.premium_only, onCheckedChange: (v) => patchRule(r.id, {
                premium_only: v
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "premium_only" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: r.vip_only, onCheckedChange: (v) => patchRule(r.id, {
                vip_only: v
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "vip_only" })
            ] })
          ] })
        ] }, r.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "events", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 grid gap-3 md:grid-cols-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newEvent.name ?? "", onChange: (e) => setNewEvent((v) => ({
              ...v,
              name: e.target.value
            })), placeholder: "Double Coins Weekend" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feature (blank = all)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newEvent.feature ?? "", onChange: (e) => setNewEvent((v) => ({
              ...v,
              feature: e.target.value
            })), placeholder: "wallpaper" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price ×" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.05", value: newEvent.price_multiplier ?? 1, onChange: (e) => setNewEvent((v) => ({
              ...v,
              price_multiplier: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reward ×" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.05", value: newEvent.reward_multiplier ?? 1, onChange: (e) => setNewEvent((v) => ({
              ...v,
              reward_multiplier: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ends" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: newEvent.ends_at ?? "", onChange: (e) => setNewEvent((v) => ({
              ...v,
              ends_at: e.target.value
            })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-6 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addEvent, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Add event"
          ] }) })
        ] }),
        events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: e.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              e.feature ?? "all features",
              " · price ×",
              e.price_multiplier,
              " · reward ×",
              e.reward_multiplier,
              e.ends_at ? ` · ends ${new Date(e.ends_at).toLocaleString()}` : " · no end"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: e.enabled ? "default" : "secondary", children: e.enabled ? "Live" : "Paused" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: e.enabled, onCheckedChange: () => toggleEvent(e) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => deleteEvent(e.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-destructive" }) })
          ] })
        ] }, e.id))
      ] })
    ] })
  ] });
}
export {
  AdminWalletRulesPage as component
};
