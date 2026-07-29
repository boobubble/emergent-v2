import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { ae as Card, B as Button, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as TRANSACTION_LABELS, f as fetchWalletStats, a as fetchPackages, b as fetchProviders, c as fetchTransactions, d as fetchMyOrders, e as fetchTodayClaim, g as fetchLastClaim, h as claimDailyReward, i as createOrder, s as submitManualReceipt } from "./wallet-C6TvOTfT.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { Y as Coins, bI as Snowflake, bg as TrendingUp, bJ as TrendingDown, a2 as Gift, F as Flame, aJ as ShoppingBag, a as Sparkles } from "../_libs/lucide-react.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
function WalletPage() {
  const [userId, setUserId] = reactExports.useState(null);
  const [stats, setStats] = reactExports.useState(null);
  const [packages, setPackages] = reactExports.useState([]);
  const [providers, setProviders] = reactExports.useState([]);
  const [txs, setTxs] = reactExports.useState([]);
  const [orders, setOrders] = reactExports.useState([]);
  const [range, setRange] = reactExports.useState("all");
  const [kindFilter, setKindFilter] = reactExports.useState("all");
  const [buying, setBuying] = reactExports.useState(null);
  const [chosenProvider, setChosenProvider] = reactExports.useState("manual");
  const [receiptUrl, setReceiptUrl] = reactExports.useState("");
  const [claiming, setClaiming] = reactExports.useState(false);
  const [lastClaim, setLastClaim] = reactExports.useState(null);
  const [todayClaim, setTodayClaim] = reactExports.useState(null);
  reactExports.useEffect(() => {
    supabase.auth.getUser().then(({
      data
    }) => setUserId(data.user?.id ?? null));
  }, []);
  const reload = async () => {
    if (!userId) return;
    const since = rangeToDate(range);
    const [s, p, pv, t, o, td, lc] = await Promise.all([fetchWalletStats(userId), fetchPackages(true), fetchProviders(), fetchTransactions(userId, since), fetchMyOrders(userId), fetchTodayClaim(userId), fetchLastClaim(userId)]);
    setStats(s);
    setPackages(p);
    setProviders(pv);
    setTxs(t);
    setOrders(o);
    setTodayClaim(td);
    setLastClaim(lc);
  };
  reactExports.useEffect(() => {
    void reload();
  }, [userId, range]);
  const enabledProviders = reactExports.useMemo(() => providers.filter((p) => p.enabled), [providers]);
  reactExports.useEffect(() => {
    if (enabledProviders[0] && !enabledProviders.find((p) => p.key === chosenProvider)) {
      setChosenProvider(enabledProviders[0].key);
    }
  }, [enabledProviders, chosenProvider]);
  const filteredTxs = reactExports.useMemo(() => {
    if (kindFilter === "all") return txs;
    return txs.filter((t) => (t.wallet_kind ?? t.reason ?? "") === kindFilter);
  }, [txs, kindFilter]);
  const handleClaim = async () => {
    setClaiming(true);
    try {
      const r = await claimDailyReward();
      toast.success(`+${r.coins} coins · ${r.streak}-day streak`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaiming(false);
    }
  };
  const handleBuy = async () => {
    if (!buying) return;
    try {
      const order = await createOrder(buying.id, chosenProvider);
      if (chosenProvider === "manual") {
        toast.success("Order created — upload your payment receipt below.");
      } else if (chosenProvider === "razorpay") {
        toast.info("Razorpay checkout will open here once configured by admin.");
      } else {
        toast.info("Stripe checkout will open here once configured by admin.");
      }
      setBuying(null);
      await reload();
      if (chosenProvider === "manual") {
        const url = window.prompt("Paste the URL/screenshot of your payment receipt:");
        if (url) {
          await submitManualReceipt(order.id, url);
          toast.success("Receipt submitted for review.");
          await reload();
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create order");
    }
  };
  if (!userId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "mx-auto mb-4 h-10 w-10 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold", children: "Sign in to see your Wallet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "mt-4 inline-block underline", children: "Go to sign in" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl space-y-6 p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl md:text-3xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-7 w-7 text-yellow-500" }),
          " Wallet & Coins Store"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Buy, earn and spend platform coins." })
      ] }),
      stats?.wallet_frozen && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Snowflake, { className: "h-3 w-3" }),
        " Frozen"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-5 w-5 text-yellow-500" }), label: "Current balance", value: stats?.coins ?? 0, highlight: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-emerald-500" }), label: "Lifetime earned", value: stats?.coins_lifetime_earned ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-5 w-5 text-rose-500" }), label: "Lifetime spent", value: stats?.coins_lifetime_spent ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-5 w-5 text-purple-500" }), label: "Bonus coins", value: stats?.coins_bonus_total ?? 0, sub: `Purchased: ${stats?.coins_purchased_total ?? 0}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 md:p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-8 w-8 text-orange-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Daily Reward" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: todayClaim ? `Already claimed today · Streak: ${lastClaim?.streak ?? 1} day${(lastClaim?.streak ?? 1) > 1 ? "s" : ""}` : `Claim your coins today${lastClaim ? ` · Current streak ${lastClaim.streak} day${lastClaim.streak > 1 ? "s" : ""}` : ""}` })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleClaim, disabled: claiming || !!todayClaim, children: todayClaim ? "Claimed" : claiming ? "Claiming…" : "Claim" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "store", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "store", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4 mr-1" }),
          " Store"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "transactions", children: "Transactions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "orders", children: "My Orders" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "store", className: "mt-4", children: [
        enabledProviders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 mb-4 border-amber-500/30 bg-amber-500/10 text-sm", children: "No payment providers are enabled yet. Ask an admin to enable Manual, Razorpay or Stripe." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: packages.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 flex flex-col justify-between border-2 hover:border-primary transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: pkg.name }),
              pkg.badge && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: pkg.badge })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-baseline gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-5 w-5 text-yellow-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold", children: pkg.coins.toLocaleString() })
            ] }),
            pkg.bonus_coins > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
              " +",
              pkg.bonus_coins,
              " bonus"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold", children: pkg.currency === "INR" ? `₹${pkg.price_inr}` : `$${((pkg.price_usd_cents ?? 0) / 100).toFixed(2)}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: enabledProviders.length === 0 || !!stats?.wallet_frozen, onClick: () => setBuying(pkg), children: "Buy" })
          ] })
        ] }, pkg.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "transactions", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: range, onValueChange: (v) => setRange(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "today", children: "Today" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "week", children: "This week" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "This month" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All time" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kindFilter, onValueChange: setKindFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All types" }),
              Object.entries(TRANSACTION_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "divide-y", children: [
          filteredTxs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: "No transactions" }),
          filteredTxs.map((tx) => {
            const isCredit = (tx.amount ?? 0) >= 0;
            const kind = tx.wallet_kind ?? tx.reason ?? "coins";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: TRANSACTION_LABELS[kind] ?? kind }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  new Date(tx.created_at).toLocaleString(),
                  " · ",
                  tx.provider,
                  " · ",
                  tx.status
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-semibold ${isCredit ? "text-emerald-600" : "text-rose-600"}`, children: [
                isCredit ? "+" : "",
                tx.amount
              ] })
            ] }, tx.id);
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "orders", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "divide-y", children: [
        orders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: "No orders yet" }),
        orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
              o.coins,
              " coins ",
              o.bonus_coins > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-500", children: [
                "+ ",
                o.bonus_coins,
                " bonus"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              new Date(o.created_at).toLocaleString(),
              " · ",
              o.provider,
              o.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                " · ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: o.receipt_url, target: "_blank", rel: "noreferrer", className: "underline", children: "receipt" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: o.status === "paid" ? "default" : o.status === "failed" || o.status === "cancelled" ? "destructive" : "secondary", children: o.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: o.currency === "INR" ? `₹${o.amount}` : `$${(o.amount / 100).toFixed(2)}` })
          ] })
        ] }, o.id))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!buying, onOpenChange: (o) => !o && setBuying(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Buy ",
        buying?.coins.toLocaleString(),
        " coins"
      ] }) }),
      buying && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Coins" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: buying.coins })
        ] }),
        buying.bonus_coins > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-emerald-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bonus" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "+",
            buying.bonus_coins
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: buying.currency === "INR" ? `₹${buying.price_inr}` : `$${((buying.price_usd_cents ?? 0) / 100).toFixed(2)}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-xs text-muted-foreground", children: "Payment method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: chosenProvider, onValueChange: (v) => setChosenProvider(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: enabledProviders.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.key, children: p.key === "manual" ? "Manual (upload receipt)" : p.key === "razorpay" ? "Razorpay" : "Stripe" }, p.key)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setBuying(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleBuy, children: "Continue" })
      ] })
    ] }) })
  ] });
}
function StatCard({
  icon,
  label,
  value,
  sub,
  highlight
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-4 ${highlight ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-2xl font-bold", children: value.toLocaleString() }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: sub })
  ] });
}
function rangeToDate(r) {
  const now = /* @__PURE__ */ new Date();
  if (r === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (r === "week") return new Date(now.getTime() - 7 * 864e5);
  if (r === "month") return new Date(now.getTime() - 30 * 864e5);
  return void 0;
}
export {
  WalletPage as component
};
