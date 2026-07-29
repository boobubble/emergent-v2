import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { g as useChat, P as BADGE_MAP } from "./router-CYWPFaDK.mjs";
import { F as FrameAvatar, C as CosmeticName, r as rankFor } from "./EmojiPicker-DcAQqNHO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { O as Trophy, F as Flame, Y as Coins } from "../_libs/lucide-react.mjs";
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
import "./shop-catalog-QoXq-K4P.mjs";
import "./country-flag-Bsg6nfgK.mjs";
function LeaderboardPanel() {
  const { state } = useChat();
  const [tab, setTab] = reactExports.useState("xp");
  const all = Object.values(state.users).filter((u) => !u.isGuest && !u.isBot);
  const ranked = tab === "xp" ? [...all].sort((a, b) => b.xp - a.xp).slice(0, 25) : tab === "coins" ? [...all].sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0)).slice(0, 25) : [...all].sort(
    (a, b) => (b.streak ?? 0) - (a.streak ?? 0) || (b.longestStreak ?? 0) - (a.longestStreak ?? 0)
  ).slice(0, 25);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-xl font-bold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-yellow-500" }),
      " Leaderboard"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 mb-3 flex gap-1 rounded-full border border-border bg-background/50 p-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab("xp"),
          className: `flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "xp" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mr-1 inline h-3 w-3" }),
            " Top XP"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab("streak"),
          className: `flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "streak" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "mr-1 inline h-3 w-3" }),
            " Streaks"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab("coins"),
          className: `flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "coins" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "mr-1 inline h-3 w-3" }),
            " Coins"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border bg-background/50", children: ranked.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-3 border-b border-border/50 p-3 last:border-b-0 hover:bg-muted/30",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center font-bold text-muted-foreground", children: i + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/u/$username",
                params: { username: u.name },
                className: "flex items-center gap-1 truncate text-sm font-medium hover:underline",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: u.id, name: u.name }),
                  (u.badges || []).slice(0, 3).map((bid) => {
                    const b = BADGE_MAP[bid];
                    if (!b) return null;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: b.name, className: "text-xs", children: b.emoji }, bid);
                  })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
              u.level > 1 && rankFor(u.level).minLevel > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${rankFor(u.level).chip}`, children: rankFor(u.level).title }),
              "Lv ",
              u.level,
              " · 🔥 ",
              u.streak ?? 0
            ] })
          ] }),
          tab === "xp" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm text-primary", children: [
            u.xp,
            " XP"
          ] }) : tab === "coins" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm text-amber-500", children: [
            u.coins ?? 0,
            " 🪙"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm text-orange-400", children: [
            u.streak ?? 0,
            "d"
          ] })
        ]
      },
      u.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-[10px] text-muted-foreground", children: "Earn XP and coins through posts, games, and daily activity." })
  ] });
}
export {
  LeaderboardPanel
};
