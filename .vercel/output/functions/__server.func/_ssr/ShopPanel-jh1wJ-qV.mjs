import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, a as useAuth } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as CATEGORY_LABEL, a as SHOP_BY_CATEGORY, s as stickerGifUrl, S as SHOP_BY_ID } from "./shop-catalog-QoXq-K4P.mjs";
import { g as getMyInventory, p as purchaseItem, e as equipItem } from "./rewards.functions-CJg2mUZV.mjs";
import { s as setLocalEquip } from "./EmojiPicker-DcAQqNHO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, Y as Coins, P as Palette, z as Check, W as Lock } from "../_libs/lucide-react.mjs";
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
import "./Avatar-CAZashHQ.mjs";
import "./country-flag-Bsg6nfgK.mjs";
const CATS = ["frame", "username_effect", "theme", "emoji_pack", "badge", "background"];
function ShopPanel({ onBack, onOpenThemes }) {
  const fetchInv = useServerFn(getMyInventory);
  const buy = useServerFn(purchaseItem);
  const equip = useServerFn(equipItem);
  const { user: authUser } = useAuth();
  const [coins, setCoins] = reactExports.useState(0);
  const [inv, setInv] = reactExports.useState([]);
  const [cat, setCat] = reactExports.useState("frame");
  const [busy, setBusy] = reactExports.useState(null);
  async function refresh() {
    const r = await fetchInv();
    setCoins(r.profile?.coins ?? 0);
    setInv(r.inventory);
  }
  reactExports.useEffect(() => {
    void refresh();
  }, []);
  const ownedIds = new Set(inv.map((i) => i.item_id));
  const equippedByCat = {};
  inv.forEach((i) => {
    if (i.equipped) equippedByCat[i.category] = i.item_id;
  });
  async function onBuy(item) {
    if (coins < item.price) {
      toast.error("Not enough coins");
      return;
    }
    setBusy(item.id);
    try {
      await buy({ data: { itemId: item.id } });
      const nothingEquipped = !equippedByCat[item.category];
      if (nothingEquipped) {
        try {
          await equip({ data: { itemId: item.id, equipped: true } });
          if (authUser?.id) setLocalEquip(authUser.id, item, true);
          toast.success(`${item.name} purchased & equipped!`);
        } catch {
          toast.success(`Purchased ${item.name}!`);
        }
      } else {
        toast.success(`Purchased ${item.name}!`);
      }
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBusy(null);
    }
  }
  async function onEquip(item, equipped) {
    setBusy(item.id);
    try {
      await equip({ data: { itemId: item.id, equipped } });
      if (authUser?.id) {
        if (equipped) {
          const prevId = equippedByCat[item.category];
          const prev = prevId ? SHOP_BY_ID[prevId] : void 0;
          if (prev) setLocalEquip(authUser.id, prev, false);
        }
        setLocalEquip(authUser.id, item, equipped);
      }
      toast.success(equipped ? `${item.name} equipped` : `${item.name} unequipped`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBack, className: "mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
      " Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-5 w-5 text-amber-500" }),
        " Shop"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-600 dark:text-amber-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4" }),
        " ",
        coins
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Cosmetics only — show off your style. No gambling, no trading." }),
    onOpenThemes && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onOpenThemes,
        className: "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-2 text-sm font-bold text-white hover:opacity-90",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4" }),
          " Browse Feed Themes"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex gap-1 overflow-x-auto rounded-full border border-border bg-background/50 p-1", children: CATS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setCat(c),
        className: `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${cat === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`,
        children: [
          CATEGORY_LABEL[c],
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 opacity-70", children: [
            "(",
            SHOP_BY_CATEGORY[c].length,
            ")"
          ] })
        ]
      },
      c
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2", children: SHOP_BY_CATEGORY[cat].map((item) => {
      const owned = ownedIds.has(item.id);
      const isEquipped = equippedByCat[cat] === item.id;
      const canAfford = coins >= item.price;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-2xl ${item.frameRing ?? ""}`, children: item.previewCp ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: stickerGifUrl(item.previewCp), alt: item.name, loading: "lazy", className: "h-10 w-10 object-contain" }) : item.preview }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-sm font-bold ${item.usernameClass ?? ""}`, children: item.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: item.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3 w-3" }),
              " ",
              item.price
            ] }),
            owned ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onEquip(item, !isEquipped),
                disabled: busy === item.id,
                className: `rounded-full px-3 py-1 text-[11px] font-bold ${isEquipped ? "bg-primary text-primary-foreground" : "border border-primary text-primary hover:bg-primary/10"}`,
                children: isEquipped ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-0.5 inline h-3 w-3" }),
                  " Equipped"
                ] }) : "Equip"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onBuy(item),
                disabled: !canAfford || busy === item.id,
                className: "rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
                children: !canAfford ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-0.5 inline h-3 w-3" }),
                  " Locked"
                ] }) : busy === item.id ? "…" : "Buy"
              }
            )
          ] })
        ] })
      ] }) }, item.id);
    }) })
  ] });
}
export {
  ShopPanel
};
