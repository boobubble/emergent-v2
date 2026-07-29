import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { dv as Route$f, cv as loadFunZoneSummary, ct as FUN_META } from "./router-CYWPFaDK.mjs";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-gAgf0_IN.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, O as Trophy, aB as Crown, Y as Coins, bA as PartyPopper, a as Sparkles } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-avatar.mjs";
function RecapPage() {
  const data = Route$f.useLoaderData();
  const c = data.competition;
  const participants = data.participants ?? [];
  const allAwards = data.awards ?? [];
  const podium = allAwards.filter((a) => !a.award_type && (a.place ?? 0) > 0).sort((a, b) => a.place - b.place);
  const funAwards = allAwards.filter((a) => !!a.award_type);
  const [funSummary, setFunSummary] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!c?.id) return;
    loadFunZoneSummary(c.id).then((s) => setFunSummary(s.perCategory));
  }, [c?.id]);
  if (!c) return null;
  const totalVotes = c.total_votes || 1;
  const funTotal = funSummary ? Object.values(funSummary).reduce((n, e) => n + e.count, 0) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-background via-background to-background/95 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex max-w-5xl items-center gap-3 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/competitions/$slug", params: {
      slug: c.slug
    }, className: "inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3 w-3" }),
      " Back to competition"
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl px-4 py-8 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-fuchsia-500/10 to-rose-500/10 p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_40px_-5px_rgba(251,191,36,0.6)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-8 w-8 text-black" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-amber-300", children: "Battle Recap" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-black tracking-tight sm:text-3xl", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 mx-auto max-w-xl text-sm text-muted-foreground", children: c.description || "This chapter of the battle is closed. Here's the definitive recap." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Total votes", value: String(c.total_votes ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Participants", value: String(participants.length) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Winners", value: String(podium.length) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Fun Zone posts", value: String(funTotal) })
        ] })
      ] }),
      podium.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-lg font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5 text-amber-400" }),
          " Podium"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: podium.slice(0, 3).map((a) => {
          const p = participants.find((x) => x.id === a.participant_id);
          const pct = p ? Math.round(p.vote_count / totalVotes * 100) : 0;
          const tone = a.place === 1 ? "from-amber-400 to-yellow-500" : a.place === 2 ? "from-slate-300 to-slate-400" : "from-orange-400 to-amber-600";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/20 bg-black/20 p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-black`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "mx-auto mb-2 h-16 w-16 ring-2 ring-amber-400/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: a.profile?.avatar_url ?? void 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: {
                background: a.profile?.avatar_color ?? void 0
              }, children: (a.profile?.username ?? "?").slice(0, 1).toUpperCase() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "border border-amber-500/50 bg-amber-500/20 text-amber-200", children: [
              "#",
              a.place
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-bold", children: a.profile?.username ?? "Winner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs text-muted-foreground", children: p ? `${p.vote_count} votes · ${pct}%` : "—" }),
            a.rewards?.coins ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3 w-3" }),
              " ",
              a.rewards.coins
            ] }) : null
          ] }, a.id);
        }) }),
        podium.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: podium.slice(3).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            "#",
            a.place
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-8 w-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: a.profile?.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: (a.profile?.username ?? "?").slice(0, 1) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: a.profile?.username ?? "Winner" })
        ] }, a.id)) })
      ] }),
      funAwards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-lg font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-5 w-5 text-fuchsia-400" }),
          " Fun Zone Winners"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: funAwards.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-amber-500/5 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-12 w-12 ring-2 ring-fuchsia-400/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: a.profile?.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { children: (a.profile?.username ?? "?").slice(0, 1).toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-wider text-fuchsia-300", children: a.badge_label ?? a.award_type }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate font-semibold", children: [
              "@",
              a.profile?.username ?? "user"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-amber-300" })
        ] }, a.id)) })
      ] }),
      funSummary && funTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-lg font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-5 w-5 text-amber-300" }),
          " Fun Zone Highlights"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: Object.keys(FUN_META).map((cat) => {
          const meta = FUN_META[cat];
          const entry = funSummary[cat];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/competitions/$slug/fun/$type", params: {
            slug: c.slug,
            type: meta.slug
          }, search: {
            nominee: ""
          }, className: `rounded-2xl border border-white/10 bg-gradient-to-br ${meta.accent} p-3 hover:border-white/25`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: meta.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-bold", children: meta.plural }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              entry.count,
              " ",
              entry.count === 1 ? "post" : "posts"
            ] })
          ] }, cat);
        }) })
      ] })
    ] })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/10 bg-black/20 p-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-black", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label })
  ] });
}
export {
  RecapPage as component
};
