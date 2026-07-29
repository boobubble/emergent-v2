import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useAuth, g as useChat, P as BADGE_MAP } from "./router-CYWPFaDK.mjs";
import { A as Avatar } from "./Avatar-CAZashHQ.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, O as Trophy, F as Flame } from "../_libs/lucide-react.mjs";
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
function LeaderboardPage() {
  const {
    user
  } = useAuth();
  const {
    state
  } = useChat();
  const [tab, setTab] = reactExports.useState("xp");
  if (user?.isGuest) return /* @__PURE__ */ jsxRuntimeExports.jsx(GuestBlock, { label: "Leaderboard" });
  const all = Object.values(state.users).filter((u) => !u.isGuest && !u.isBot);
  const ranked = tab === "xp" ? [...all].sort((a, b) => b.xp - a.xp).slice(0, 25) : [...all].sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0) || (b.longestStreak ?? 0) - (a.longestStreak ?? 0)).slice(0, 25);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to chat"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-lg font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-warning" }),
        " Leaderboard"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-2xl px-6 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex gap-1 rounded-full border border-border bg-card p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("xp"), className: `flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "xp" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mr-1 inline h-3 w-3" }),
          " Top XP"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("streak"), className: `flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "streak" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "mr-1 inline h-3 w-3" }),
          " Top Streaks"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl border border-border bg-card", children: ranked.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border/50 p-3 last:border-b-0 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center font-bold text-muted-foreground", children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user: u, size: 36 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$username", params: {
            username: u.name
          }, className: "flex items-center gap-1 truncate text-sm font-medium hover:underline", children: [
            u.name,
            u.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-accent/20 px-1 text-[10px] font-bold uppercase text-accent", children: "Bot" }),
            (u.badges || []).slice(0, 3).map((bid) => {
              const b = BADGE_MAP[bid];
              if (!b) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: b.name, className: "text-xs", children: b.emoji }, bid);
            })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Lv ",
            u.level,
            " · 🔥 ",
            u.streak ?? 0
          ] })
        ] }),
        tab === "xp" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm text-accent", children: [
          u.xp,
          " XP"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm text-orange-400", children: [
          u.streak ?? 0,
          "d"
        ] })
      ] }, u.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-[10px] text-muted-foreground", children: "Streaks rise by signing in on consecutive days." })
    ] })
  ] });
}
function GuestBlock({
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background p-6 text-center text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm rounded-3xl border border-border bg-card p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "👤" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 text-lg font-bold", children: [
      label,
      " isn't available for guests"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Create an account to earn XP, badges and appear on the leaderboard." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to chat"
    ] })
  ] }) });
}
export {
  LeaderboardPage as component
};
