import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, d4 as getMehfilLeaderboard } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { M as MehfilShell } from "./MehfilShell-Czus6X_P.mjs";
import { W as WriterRankBadge } from "./WriterRankBadge-Ct9hdIy_.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { O as Trophy, bE as Medal } from "../_libs/lucide-react.mjs";
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
function LeaderboardPage() {
  const [range] = reactExports.useState("all");
  const fetchLb = useServerFn(getMehfilLeaderboard);
  const q = useQuery({
    queryKey: ["mehfil", "leaderboard", range],
    queryFn: () => fetchLb()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MehfilShell, { showBack: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl font-bold", children: "🏆 Poetry Hub Leaderboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Top poets ranked by upvotes, reads, and battle wins." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr_80px_80px_80px] gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Writer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Poems" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Upvotes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: "Wins" })
      ] }),
      q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-sm text-muted-foreground", children: "Loading…" }),
      (q.data ?? []).map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr_80px_80px_80px] gap-2 items-center px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: i === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-amber-500" }) : i === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-4 w-4 text-slate-400" }) : i === 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-4 w-4 text-orange-500" }) : i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          row.profile?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: row.profile.avatar_url, alt: "", className: "h-9 w-9 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-primary/10 grid place-items-center text-xs font-semibold", children: (row.profile?.display_name || row.profile?.username || "?").slice(0, 1).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: row.profile?.display_name || row.profile?.username || "Anonymous" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: row.writer_rank })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-sm font-medium", children: row.poems_published }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-sm font-medium", children: row.total_upvotes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-sm font-medium", children: row.battle_wins })
      ] }, row.user_id))
    ] })
  ] });
}
export {
  LeaderboardPage as component
};
