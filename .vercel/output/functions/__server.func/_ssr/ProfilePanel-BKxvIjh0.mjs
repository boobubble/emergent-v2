import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { cK as ChatErrorBoundary, w as useRemoteProfiles, g as useChat, cL as resolveDmTargetId, P as BADGE_MAP, S as TIER_COLOR, b as useServerFn, dC as getUserCompetitionShowcase, dD as getMehfilProfileSection, O as isNavigableSlug } from "./router-CYWPFaDK.mjs";
import { F as FrameAvatar, C as CosmeticName, R as RankChip } from "./EmojiPicker-DcAQqNHO.mjs";
import { d as useRecordProfileView } from "./use-profile-views-C79sW5i0.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { W as WriterRankBadge } from "./WriterRankBadge-Ct9hdIy_.mjs";
import { p as poemPreview } from "./mehfil-types-okfUX99d.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { h as MessageCircle, as as UserMinus, s as UserPlus, au as ShieldCheck, av as Ban, Y as Coins, F as Flame, O as Trophy, m as Award, aB as Crown, S as Shield, aA as ShieldHalf, bE as Medal, V as Vote, f as Heart, bg as TrendingUp, a as Sparkles, U as Users, Z as Zap, l as Star, bD as Feather, bR as BookOpen, E as Eye, a3 as Swords } from "../_libs/lucide-react.mjs";
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
function fmt(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n ?? 0);
}
const eventLabel = {
  competition_vote: { emoji: "🗳", text: "Voted" },
  competition_follow: { emoji: "❤️", text: "Followed" },
  competition_join: { emoji: "🎯", text: "Joined" },
  competition_share: { emoji: "🔗", text: "Shared" },
  competition_win_1st: { emoji: "🏆", text: "Won 1st" },
  competition_win_2nd: { emoji: "🥈", text: "Runner-up" },
  competition_win_3rd: { emoji: "🥉", text: "Third place" },
  competition_win: { emoji: "🏆", text: "Won" }
};
function CompetitionSlugLink({
  slug,
  className,
  children
}) {
  if (!isNavigableSlug(slug)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions/$slug", params: { slug }, className, children });
}
function UserCompetitionShowcase({ username }) {
  const fetchShowcase = useServerFn(getUserCompetitionShowcase);
  const { data, isLoading } = useQuery({
    queryKey: ["user-competition-showcase", username.toLowerCase()],
    queryFn: () => fetchShowcase({ data: { username } }),
    staleTime: 6e4
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-xs text-muted-foreground", children: "Loading competitions…" })
    ] });
  }
  if (!data?.profile) return null;
  const { totals, badges, showcase, currentLive, recentAwards, timeline, recentActivity } = data;
  const hasAnything = totals.joined > 0 || totals.votes_received > 0 || badges.length > 0 || currentLive.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, {}),
    !hasAnything && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mx-auto mb-2 h-6 w-6 opacity-40" }),
      "Not competing yet. Join a competition to start building a legacy."
    ] }),
    showcase.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: showcase.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      CompetitionSlugLink,
      {
        slug: s.competition?.slug,
        className: "group flex items-center gap-3 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-fuchsia-500/5 to-transparent p-3 transition-all hover:border-amber-400/40",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-lg shadow-lg", children: s.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-bold uppercase tracking-wide text-amber-200", children: s.label }),
            s.extra && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[10px] text-muted-foreground", children: s.extra })
          ] })
        ]
      },
      i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }), label: "Joined", value: fmt(totals.joined) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 text-amber-400" }), label: "Wins", value: fmt(totals.wins), tint: "text-amber-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-3 w-3 text-slate-300" }), label: "Runner-ups", value: fmt(totals.runner_ups) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3 text-orange-400" }), label: "3rd Places", value: fmt(totals.third_places) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3 w-3" }), label: "Votes recv", value: fmt(totals.votes_received) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3 text-rose-400" }), label: "Followers", value: fmt(totals.followers_earned) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3 text-emerald-400" }), label: "Best Rank", value: totals.best_rank ? `#${totals.best_rank}` : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-amber-300" }), label: "Featured", value: fmt(totals.featured_count) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3 text-rose-500" }), label: "Live now", value: fmt(totals.live_count) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }), label: "Following", value: fmt(totals.following_count) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3 w-3 text-yellow-400" }), label: "Coins earned", value: fmt(totals.coins_earned) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3 text-fuchsia-400" }), label: "XP earned", value: fmt(totals.xp_earned) })
    ] }),
    badges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3" }),
        " Competition Badges (",
        badges.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: badges.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-gradient-to-r ${b.tint} px-2.5 py-1 text-[11px] font-semibold text-black shadow-sm`,
          title: b.name,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.emoji }),
            " ",
            b.name
          ]
        },
        b.id
      )) })
    ] }),
    currentLive.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" })
        ] }),
        "Currently competing"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: currentLive.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        CompetitionSlugLink,
        {
          slug: c.competition?.slug,
          className: "flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 hover:border-emerald-400/40",
          children: [
            c.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.photo_url, alt: "", className: "h-9 w-9 rounded-full border border-white/20 object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-white/10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold", children: c.competition?.name ?? "Competition" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                fmt(c.vote_count),
                " votes"
              ] })
            ] })
          ]
        },
        c.id
      )) })
    ] }),
    recentAwards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3 text-amber-400" }),
        " Recent awards"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: recentAwards.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        CompetitionSlugLink,
        {
          slug: a.competition?.slug,
          className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 hover:border-white/20",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg", children: a.place === 1 ? "🏆" : a.place === 2 ? "🥈" : a.place === 3 ? "🥉" : "🏅" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold", children: a.competition?.name ?? "Competition" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                "#",
                a.place,
                " · ",
                new Date(a.awarded_at).toLocaleDateString()
              ] })
            ] })
          ]
        },
        a.id
      )) })
    ] }),
    recentActivity.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }),
        " Recent activity"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: recentActivity.map((e, i) => {
        const info = eventLabel[e.event_type] ?? { emoji: "•", text: e.event_type };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: info.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: info.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(e.at).toLocaleDateString(void 0, { month: "short", day: "numeric" }) })
        ] }, i);
      }) })
    ] }),
    timeline.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 text-amber-400" }),
        " Competition timeline"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pl-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-1 top-0 w-px bg-gradient-to-b from-amber-500/40 via-white/10 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: timeline.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-[14px] top-2 h-2 w-2 rounded-full bg-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            CompetitionSlugLink,
            {
              slug: t.competition?.slug,
              className: "block rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 hover:border-white/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px]", children: [
                  t.kind === "award" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-300", children: t.place === 1 ? "🏆 Champion" : t.place === 2 ? "🥈 Runner Up" : t.place === 3 ? "🥉 Third" : `🏅 #${t.place}` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sky-300", children: "🎯 Joined" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: t.competition?.name ?? "Competition" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-[10px] text-muted-foreground", children: [
                  new Date(t.at).toLocaleDateString(),
                  t.kind === "join" && t.vote_count > 0 ? ` · ${fmt(t.vote_count)} votes` : ""
                ] })
              ]
            }
          )
        ] }, i)) })
      ] })
    ] })
  ] });
}
function SectionHeader() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5 text-amber-400" }),
    " Competition Showcase"
  ] });
}
function MiniStat$1({ icon, label, value, tint }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-0.5 text-sm font-bold ${tint ?? ""}`, children: value })
  ] });
}
function ProfileMehfilSection({ username }) {
  const fetchSection = useServerFn(getMehfilProfileSection);
  const { data, isLoading } = useQuery({
    queryKey: ["mehfil", "profile-section", username],
    queryFn: () => fetchSection({ data: { username, limit: 6 } }),
    staleTime: 6e4
  });
  if (isLoading || !data?.profile) return null;
  const { stats, poems, featured, trending, hof, active_battles, battle_history, categories_written, favorite_category } = data;
  const hasAny = stats && (stats.poems_published ?? 0) > 0 || poems.length > 0 || (active_battles?.length ?? 0) > 0 || (hof?.length ?? 0) > 0;
  if (!hasAny) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-3.5 w-3.5 text-primary" }),
        " Poetry Hub · Poetry"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry", className: "text-[11px] font-semibold text-primary hover:underline", children: "Explore Poetry Hub →" })
    ] }),
    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-2xl border border-border bg-card px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: stats.writer_rank }),
        favorite_category && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            style: { background: `${favorite_category.color ?? "#7c3aed"}22`, color: favorite_category.color ?? "#7c3aed" },
            children: [
              "★ ",
              favorite_category.name
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-3.5 w-3.5" }), label: "Poems", value: stats.poems_published ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-rose-400" }), label: "Upvotes", value: stats.total_upvotes ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }), label: "Reads", value: stats.total_reads ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" }), label: "Comments", value: stats.total_comments ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5 text-warning" }), label: "Wins", value: stats.battle_wins ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 text-amber-400" }), label: "Featured", value: stats.featured_count ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3.5 w-3.5 text-fuchsia-400" }), label: "Hall of Fame", value: stats.hof_count ?? hof?.length ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3.5 w-3.5 text-cyan-400" }), label: "Active Battles", value: active_battles?.length ?? 0 })
      ] })
    ] }),
    (active_battles?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Active Battles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: active_battles.slice(0, 4).filter((b) => isNavigableSlug(b.competition_slug)).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/competitions/$slug",
          params: { slug: b.competition_slug },
          className: "rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-3 hover:border-cyan-400/60",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3 w-3" }),
              " ",
              b.status === "live" ? "Live" : "Upcoming"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-1 text-sm font-semibold", children: b.competition_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              b.rank ? `#${b.rank}` : "—",
              " · ",
              b.vote_count,
              " votes"
            ] })
          ]
        },
        b.competition_id
      )) })
    ] }),
    poems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Recent Poems" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: poems.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemChip, { p }, p.id)) })
    ] }),
    (trending?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3 text-orange-400" }),
        " Trending"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: trending.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemChip, { p }, p.id)) })
    ] }),
    (featured?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 text-amber-400" }),
        " Featured Poems"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: featured.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PoemChip, { p }, p.id)) })
    ] }),
    (battle_history?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Battle History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5", children: battle_history.filter((b) => isNavigableSlug(b.competition_slug)).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/competitions/$slug",
          params: { slug: b.competition_slug },
          className: "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 hover:border-primary/40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 text-xs font-semibold", children: b.competition_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 shrink-0 text-[10px] text-muted-foreground", children: [
              b.rank ? `#${b.rank}` : "—",
              " · ",
              b.vote_count,
              " votes"
            ] })
          ]
        },
        b.competition_id
      )) })
    ] }),
    (hof?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3 text-amber-400" }),
        " Achievements"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: hof.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200", children: [
        "#",
        h.rank,
        " · ",
        h.period ?? "hall of fame"
      ] }, h.id)) })
    ] }),
    (categories_written?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Categories Written" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: categories_written.filter((c) => isNavigableSlug(c.slug)).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/poetry/category/$slug",
          params: { slug: c.slug },
          className: "rounded-full px-2 py-0.5 text-[10px] font-bold",
          style: { background: `${c.color ?? "#7c3aed"}22`, color: c.color ?? "#7c3aed" },
          children: [
            c.name,
            " · ",
            c.poem_count
          ]
        },
        c.id
      )) })
    ] })
  ] });
}
function PoemChip({ p }) {
  if (!isNavigableSlug(p.slug)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-2xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
        p.category && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            style: { background: `${p.category.color ?? "#7c3aed"}22`, color: p.category.color ?? "#7c3aed" },
            children: p.category.name
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: [
          p.upvote_count ?? 0,
          " ♥ · ",
          p.read_count ?? 0,
          " 👁"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-1 text-sm font-semibold", children: p.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground", children: poemPreview(p.body, 140) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/poetry/$slug",
      params: { slug: p.slug },
      className: "group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
          p.category && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              style: { background: `${p.category.color ?? "#7c3aed"}22`, color: p.category.color ?? "#7c3aed" },
              children: p.category.name
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: [
            p.upvote_count ?? 0,
            " ♥ · ",
            p.read_count ?? 0,
            " 👁"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-1 text-sm font-semibold group-hover:text-primary", children: p.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground", children: poemPreview(p.body, 140) })
      ]
    }
  );
}
function MiniStat({ icon, label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: value.toLocaleString() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label })
  ] });
}
function ProfilePanel({ username, onBack }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatErrorBoundary, { label: "feed-profile-dm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePanelInner, { username, onBack }) });
}
function ProfilePanelInner({ username, onBack }) {
  const navigate = useNavigate();
  const { profiles } = useRemoteProfiles();
  const { state, startDM, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked } = useChat();
  const userFromProfiles = Object.values(profiles).find((u) => u.name.toLowerCase() === username.toLowerCase());
  const userFromChat = Object.values(state.users).find((u) => u.name.toLowerCase() === username.toLowerCase());
  const user = userFromProfiles ?? userFromChat;
  const dmTargetId = user ? resolveDmTargetId(user.id, profiles) : null;
  useRecordProfileView(user && !user.isBot && user.id !== "me" ? user.id : null);
  const ranked = Object.values(state.users).sort((a, b) => b.xp - a.xp);
  const rank = user ? ranked.findIndex((u) => u.id === user.id) + 1 : 0;
  const sharedRooms = user ? Object.values(state.rooms).filter((r) => r.members.includes(user.id)) : [];
  const recentMessages = user ? Object.values(state.messages).flat().filter((m) => m.authorId === user.id).sort((a, b) => b.ts - a.ts).slice(0, 5) : [];
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-card p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "User not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "No member named @",
        username,
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "mt-6 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", children: "Back to feed" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-card p-6", style: { boxShadow: "var(--shadow-panel)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user, size: 96 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: user.id, name: user.name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RankChip, { level: user.level }),
            user.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-primary", children: "Bot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-1.5 text-xs capitalize ${user.status === "online" ? "text-primary" : "text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2 w-2 rounded-full ${user.status === "online" ? "bg-primary" : "bg-muted-foreground/50"}` }),
              user.status
            ] })
          ] }),
          user.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: user.bio }),
          user.id !== "me" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  if (!dmTargetId) return;
                  startDM(dmTargetId);
                  navigate({ to: "/" });
                },
                disabled: !dmTargetId,
                className: "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
                  " Send message"
                ]
              }
            ),
            isFriend(user.id) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => removeFriend(user.id), className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { className: "h-4 w-4" }),
              " Friends"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => addFriend(user.id), className: "inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
              " Add friend"
            ] }),
            isBlocked(user.id) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => unblockUser(user.id), className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
              " Unblock"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => blockUser(user.id), className: "inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }),
              " Block"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Level", value: `Lv ${user.level}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "XP", value: `${user.xp}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Coins", value: `${user.coins ?? 0}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-3.5 w-3.5 text-yellow-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Streak", value: `${user.streak ?? 0}d`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5 text-orange-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Rank", value: rank ? `#${rank}` : "—", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5 text-warning" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3.5 w-3.5 text-primary" }),
        " Badges (",
        (user.badges || []).length,
        ")"
      ] }),
      (user.badges || []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No badges yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (user.badges || []).map((id) => {
        const b = BADGE_MAP[id];
        if (!b) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 rounded-full border bg-gradient-to-br px-2.5 py-1 text-[11px] font-semibold ${TIER_COLOR[b.tier]}`, title: b.description, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.emoji }),
          b.name
        ] }, id);
      }) })
    ] }),
    !user.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx(UserCompetitionShowcase, { username: user.name }),
    !user.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileMehfilSection, { username: user.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: [
        "Rooms (",
        sharedRooms.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        sharedRooms.map((r) => {
          const role = r.roles[user.id] || "member";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "#" }),
                r.name,
                role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 text-warning" }),
                role === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3 text-primary" }),
                role === "mod" && /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldHalf, { className: "h-3 w-3 text-primary/70" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: r.topic })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: role })
          ] }, r.id);
        }),
        sharedRooms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Not in any rooms." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: "Recent messages" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        recentMessages.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/90", children: m.text || (m.attachment ? `📎 ${m.attachment.name}` : "") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[10px] uppercase tracking-wider text-muted-foreground", children: [
            "in ",
            state.rooms[m.channelId]?.name || (m.channelId.startsWith("dm:") ? "DM" : m.channelId)
          ] })
        ] }, m.id)),
        recentMessages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No messages yet." })
      ] })
    ] })
  ] });
}
function Stat({ label, value, icon }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-white/5 px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-lg font-bold", children: value })
  ] });
}
export {
  ProfilePanel
};
