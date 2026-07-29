import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useServerFn, O as isNavigableSlug } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as listPoetryBattles } from "./mehfil-battles.functions-CWdxXdpf.mjs";
import { M as MehfilShell } from "./MehfilShell-Czus6X_P.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a3 as Swords, U as Users, _ as Clock, O as Trophy } from "../_libs/lucide-react.mjs";
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
import "./use-mehfil-label-BWBPC7g6.mjs";
import "./mehfil-admin.functions-BntRjkJU.mjs";
const TABS = [{
  key: "active",
  label: "🔥 Live"
}, {
  key: "upcoming",
  label: "⏳ Upcoming"
}, {
  key: "ended",
  label: "🏆 Past Winners"
}];
function ChallengesPage() {
  const [scope, setScope] = reactExports.useState("active");
  const fetchBattles = useServerFn(listPoetryBattles);
  const q = useQuery({
    queryKey: ["mehfil", "battles", scope],
    queryFn: () => fetchBattles({
      data: {
        scope
      }
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MehfilShell, { showBack: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl font-bold", children: "⚔️ Poetry Battles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Weekly, themed and community challenges. Winners earn XP, coins and a Hall of Fame entry." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 flex gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setScope(t.key), className: `rounded-lg px-4 py-1.5 text-sm font-semibold transition ${scope === t.key ? "bg-primary text-primary-foreground shadow" : "hover:bg-muted"}`, children: t.label }, t.key)) }),
    q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-sm text-muted-foreground", children: "Loading…" }),
    q.data && q.data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-border/60 p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "mx-auto h-8 w-8 text-muted-foreground/60" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "No ",
        scope,
        " battles right now. Check back soon."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: (q.data ?? []).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(BattleCard, { battle: b }, b.id)) })
  ] });
}
function BattleCard({
  battle
}) {
  const endsIn = new Date(battle.end_at).getTime() - Date.now();
  const days = Math.max(0, Math.floor(endsIn / 864e5));
  const className = "group block overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-lg transition";
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    battle.banner_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: battle.banner_url, alt: "", className: "h-32 w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 w-full bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-amber-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-10 w-10 text-white/80" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider", children: [
        battle.category && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full px-2 py-0.5", style: {
          backgroundColor: `${battle.category.color ?? "#8b5cf6"}22`,
          color: battle.category.color ?? "#8b5cf6"
        }, children: battle.category.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: battle.status.toUpperCase() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-serif text-lg font-bold group-hover:text-primary", children: battle.name }),
      battle.mehfil_theme && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs italic text-muted-foreground", children: [
        "Theme: ",
        battle.mehfil_theme
      ] }),
      battle.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-2 text-sm text-muted-foreground", children: battle.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
          " ",
          battle.total_participants,
          " entries"
        ] }),
        battle.status === "live" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-primary font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
          " ",
          days,
          "d left"
        ] }),
        battle.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-amber-500 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
          " Ended"
        ] })
      ] })
    ] })
  ] });
  if (!isNavigableSlug(battle.slug)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: content });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions/$slug", params: {
    slug: battle.slug
  }, className, children: content });
}
export {
  ChallengesPage as component
};
