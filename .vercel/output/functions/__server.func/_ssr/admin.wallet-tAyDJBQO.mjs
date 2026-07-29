import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { aJ as AdminPageHeader, ae as Card, a0 as Input, B as Button, aM as Switch, ac as Label } from "./router-CYWPFaDK.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as fetchPackages, b as fetchProviders } from "./wallet-C6TvOTfT.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { c as Plus, d as Trash2 } from "../_libs/lucide-react.mjs";
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
const sb = supabase;
function AdminWalletPage() {
  const [packages, setPackages] = reactExports.useState([]);
  const [providers, setProviders] = reactExports.useState([]);
  const [orders, setOrders] = reactExports.useState([]);
  const [flags, setFlags] = reactExports.useState([]);
  const [daily, setDaily] = reactExports.useState([]);
  const [newPkg, setNewPkg] = reactExports.useState({
    name: "",
    coins: 100,
    bonus_coins: 0,
    price_inr: 49,
    price_usd_cents: 99,
    badge: "",
    sort_order: 0
  });
  const [adjust, setAdjust] = reactExports.useState({
    user_id: "",
    amount: 100,
    direction: "credit",
    reason: ""
  });
  const [dailyDraft, setDailyDraft] = reactExports.useState({
    day: 1,
    coins: 10
  });
  const load = async () => {
    const [p, pv, ords, fl, dr] = await Promise.all([fetchPackages(false), fetchProviders(), sb.from("coin_payment_orders").select("*").order("created_at", {
      ascending: false
    }).limit(100).then((r) => r.data ?? []), sb.from("coin_feature_flags").select("*").order("feature").then((r) => r.data ?? []), sb.from("daily_reward_config").select("*").order("day_number").then((r) => r.data ?? [])]);
    setPackages(p);
    setProviders(pv);
    setOrders(ords);
    setFlags(fl);
    setDaily(dr);
  };
  reactExports.useEffect(() => {
    void load();
  }, []);
  const savePackage = async (pkg) => {
    const {
      error
    } = pkg.id ? await sb.from("coin_packages").update(pkg).eq("id", pkg.id) : await sb.from("coin_packages").insert(pkg);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    await load();
  };
  const addPackage = async () => {
    if (!newPkg.name) return toast.error("Name required");
    await savePackage({
      ...newPkg,
      is_active: true,
      currency: "INR",
      badge: newPkg.badge || null
    });
    setNewPkg({
      name: "",
      coins: 100,
      bonus_coins: 0,
      price_inr: 49,
      price_usd_cents: 99,
      badge: "",
      sort_order: 0
    });
  };
  const deletePackage = async (id) => {
    if (!window.confirm("Delete package?")) return;
    const {
      error
    } = await sb.from("coin_packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };
  const toggleProvider = async (key, enabled) => {
    const {
      error
    } = await sb.from("payment_providers").update({
      enabled
    }).eq("key", key);
    if (error) return toast.error(error.message);
    await load();
  };
  const toggleFlag = async (feature, enabled) => {
    const {
      error
    } = await sb.from("coin_feature_flags").update({
      enabled
    }).eq("feature", feature);
    if (error) return toast.error(error.message);
    await load();
  };
  const approve = async (id) => {
    const ref = window.prompt("Payment reference (optional):") || void 0;
    const {
      error
    } = await sb.rpc("admin_approve_coin_order", {
      _order_id: id,
      _payment_ref: ref
    });
    if (error) return toast.error(error.message);
    toast.success("Approved · coins credited");
    await load();
  };
  const reject = async (id) => {
    const note = window.prompt("Reason:") || void 0;
    const {
      error
    } = await sb.rpc("admin_reject_coin_order", {
      _order_id: id,
      _note: note
    });
    if (error) return toast.error(error.message);
    await load();
  };
  const doAdjust = async () => {
    if (!adjust.user_id) return toast.error("User ID required");
    const {
      error
    } = await sb.rpc("admin_adjust_coins", {
      _user: adjust.user_id,
      _amount: adjust.amount,
      _direction: adjust.direction,
      _reason: adjust.reason || "admin"
    });
    if (error) return toast.error(error.message);
    toast.success("Adjusted");
  };
  const freeze = async (frozen) => {
    if (!adjust.user_id) return toast.error("User ID required");
    const {
      error
    } = await sb.rpc("admin_set_wallet_frozen", {
      _user: adjust.user_id,
      _frozen: frozen
    });
    if (error) return toast.error(error.message);
    toast.success(frozen ? "Wallet frozen" : "Wallet unfrozen");
  };
  const saveDaily = async () => {
    const {
      error
    } = await sb.from("daily_reward_config").upsert({
      day_number: dailyDraft.day,
      coins: dailyDraft.coins
    });
    if (error) return toast.error(error.message);
    await load();
  };
  const deleteDaily = async (day) => {
    await sb.from("daily_reward_config").delete().eq("day_number", day);
    await load();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl p-4 md:p-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Wallet & Coins Store", description: "Manage packages, providers, orders, daily rewards, feature flags and user wallets." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "packages", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "packages", children: "Packages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "providers", children: "Providers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "orders", children: "Manual Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "daily", children: "Daily Rewards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "flags", children: "Feature Flags" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "users", children: "User Wallets" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "packages", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 grid gap-2 md:grid-cols-7", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name", value: newPkg.name, onChange: (e) => setNewPkg({
            ...newPkg,
            name: e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "Coins", value: newPkg.coins, onChange: (e) => setNewPkg({
            ...newPkg,
            coins: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "Bonus", value: newPkg.bonus_coins, onChange: (e) => setNewPkg({
            ...newPkg,
            bonus_coins: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "₹", value: newPkg.price_inr, onChange: (e) => setNewPkg({
            ...newPkg,
            price_inr: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "USD cents", value: newPkg.price_usd_cents, onChange: (e) => setNewPkg({
            ...newPkg,
            price_usd_cents: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Badge", value: newPkg.badge, onChange: (e) => setNewPkg({
            ...newPkg,
            badge: e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addPackage, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            " Add"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: packages.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 grid gap-2 md:grid-cols-8 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { defaultValue: p.name, onBlur: (e) => e.target.value !== p.name && savePackage({
            id: p.id,
            name: e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", defaultValue: p.coins, onBlur: (e) => +e.target.value !== p.coins && savePackage({
            id: p.id,
            coins: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", defaultValue: p.bonus_coins, onBlur: (e) => +e.target.value !== p.bonus_coins && savePackage({
            id: p.id,
            bonus_coins: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", defaultValue: p.price_inr ?? 0, onBlur: (e) => +e.target.value !== p.price_inr && savePackage({
            id: p.id,
            price_inr: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", defaultValue: p.price_usd_cents ?? 0, onBlur: (e) => +e.target.value !== p.price_usd_cents && savePackage({
            id: p.id,
            price_usd_cents: +e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { defaultValue: p.badge ?? "", onBlur: (e) => e.target.value !== (p.badge ?? "") && savePackage({
            id: p.id,
            badge: e.target.value || null
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: p.is_active, onCheckedChange: (v) => savePackage({
              id: p.id,
              is_active: v
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Active" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deletePackage(p.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, p.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "providers", className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enable/disable each payment method. Razorpay & Stripe checkout will activate once their secret keys are added." }),
        providers.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold capitalize", children: p.key }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              p.key === "manual" && "User uploads a receipt; you approve manually.",
              p.key === "razorpay" && "UPI, cards, netbanking (India).",
              p.key === "stripe" && "Global cards & wallets."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: p.enabled, onCheckedChange: (v) => toggleProvider(p.key, v) })
        ] }, p.key))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "orders", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "divide-y", children: [
        orders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: "No orders" }),
        orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 grid gap-2 md:grid-cols-6 items-center text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs truncate", children: o.user_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            o.coins,
            o.bonus_coins ? ` +${o.bonus_coins}` : "",
            " coins"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: o.currency === "INR" ? `₹${o.amount}` : `$${(o.amount / 100).toFixed(2)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: o.provider }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: o.status === "paid" ? "default" : o.status === "failed" ? "destructive" : "secondary", children: o.status }),
            o.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: o.receipt_url, target: "_blank", rel: "noreferrer", className: "ml-2 underline text-xs", children: "receipt" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
            o.status !== "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => approve(o.id), children: "Approve" }),
            o.status !== "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => reject(o.id), children: "Reject" })
          ] })
        ] }, o.id))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "daily", className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 grid gap-2 md:grid-cols-4 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Streak day" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: dailyDraft.day, onChange: (e) => setDailyDraft({
              ...dailyDraft,
              day: +e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Coins" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: dailyDraft.coins, onChange: (e) => setDailyDraft({
              ...dailyDraft,
              coins: +e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveDaily, children: "Save" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: daily.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Day ",
            d.day_number
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              d.coins,
              " coins"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteDaily(d.day_number), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }, d.day_number)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "flags", className: "mt-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Toggle each coin-spending feature." }),
        flags.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "capitalize", children: f.feature.replace("_", " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.enabled, onCheckedChange: (v) => toggleFlag(f.feature, v) })
        ] }, f.feature))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "users", className: "mt-4 space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "User ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: adjust.user_id, onChange: (e) => setAdjust({
            ...adjust,
            user_id: e.target.value
          }), placeholder: "uuid" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: adjust.amount, onChange: (e) => setAdjust({
              ...adjust,
              amount: +e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adjust.direction, onValueChange: (v) => setAdjust({
              ...adjust,
              direction: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "credit", children: "Credit (add / gift)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "debit", children: "Debit (remove / refund)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: adjust.reason, onChange: (e) => setAdjust({
              ...adjust,
              reason: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: doAdjust, children: "Apply" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => freeze(true), children: "Freeze wallet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => freeze(false), children: "Unfreeze" })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AdminWalletPage as component
};
