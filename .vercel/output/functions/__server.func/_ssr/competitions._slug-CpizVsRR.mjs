import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { cw as Route$10, b as useServerFn, cx as getCompetitionBySlug, cy as getMyVote, cz as getMyCompetitorVote, cA as joinCompetition, cB as leaveCompetition, cC as incrementCompetitionViews, cD as listRelatedCompetitions, a as useAuth, cp as voteForCompetitor, u as useAppSettings, cE as SITE, B as Button, O as isNavigableSlug, ck as castVote, m as cn, cs as FUN_CATEGORIES, ct as FUN_META, cu as BADGE_META, a7 as listRecentCompetitionVoters, b8 as adminDeleteCompetitor, b9 as adminSetCompetitorFlags, cq as adminResetCompetitorVotes, cl as followCompetition, cm as unfollowCompetition, cn as getMyCompetitionFollow, co as getCompetitionFollowerCount, cv as loadFunZoneSummary, cr as listCompetitionMemes } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as confetti } from "../_libs/canvas-confetti.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { u as useMyRoles } from "./use-my-role-Cv7Uou7c.mjs";
import { C as Countdown } from "./Countdown-s9YaTID_.mjs";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-gAgf0_IN.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AnimatedCounter } from "./AnimatedCounter-CBMw_qN3.mjs";
import { flagFromCode } from "./country-flag-Bsg6nfgK.mjs";
import { e as emptyCompetitor, C as CompetitorEditorDialog } from "./CompetitorEditorDialog-BG_3zT5L.mjs";
import { u as useBattleRankingRealtime } from "./mehfil-realtime-CjiOrhC8.mjs";
import { g as getPoetryBattle } from "./mehfil-battles.functions-CWdxXdpf.mjs";
import { W as WRITER_RANK_LABEL, a as WRITER_RANK_COLOR, p as poemPreview } from "./mehfil-types-okfUX99d.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { aB as Crown, c as Plus, a as Sparkles, Y as Coins, bA as PartyPopper, aq as Calendar, O as Trophy, bv as Pin, bj as BadgeCheck, bo as Laugh, ax as ExternalLink, U as Users, V as Vote, A as ArrowLeft, bh as Share2, b0 as Flag, Z as Zap, E as Eye, f as Heart, a2 as Gift, bD as Feather, h as MessageCircle, ab as ArrowRight, cy as Hourglass, cz as CalendarClock, F as Flame, b2 as Rocket, aC as Activity, b$ as Pencil, t as Minus, bg as TrendingUp, bJ as TrendingDown, bL as Twitter, bK as Instagram, aG as Youtube, cA as Facebook, cB as Linkedin, ap as Globe, l as Star, e as EyeOff, b_ as Undo2, av as Ban, R as RotateCcw, d as Trash2, bE as Medal, cC as BellRing, x as Bell, i as Radio, cs as Music2 } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/tanstack__query-core.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const medals = ["🥇", "🥈", "🥉"];
function TopThree({ participants, hideCounts }) {
  const top = [...participants].sort((a, b) => b.vote_count - a.vote_count).slice(0, 3);
  if (top.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No votes yet." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: top.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: medals[i] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p.profile?.avatar_url ?? void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: p.profile?.avatar_color ?? void 0 }, children: (p.profile?.username ?? "?").slice(0, 1).toUpperCase() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: p.profile?.username ?? "Anonymous" }) }),
    !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold tabular-nums", children: [
      p.vote_count,
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "votes" })
    ] })
  ] }, p.id)) });
}
function ParticipantGrid({
  competitionId,
  participants,
  myVote,
  canVote,
  hideCounts,
  invalidateKey
}) {
  const vote = useServerFn(castVote);
  const qc = useQueryClient();
  const listKey = invalidateKey ?? ["competition", competitionId];
  const m = useMutation({
    mutationFn: (pid) => vote({ data: { competitionId, participantId: pid } }),
    onSuccess: () => {
      toast.success("Vote counted");
      qc.invalidateQueries({ queryKey: listKey });
      qc.invalidateQueries({ queryKey: ["competition-vote", competitionId] });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to vote")
  });
  const approved = participants.filter((p) => p.status === "approved");
  if (approved.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No participants yet." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4", children: approved.map((p) => {
    const mine = myVote === p.id;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-center backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-14 w-14 ring-2 ring-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: p.profile?.avatar_url ?? void 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: p.profile?.avatar_color ?? void 0 }, children: (p.profile?.username ?? "?").slice(0, 1).toUpperCase() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold", children: p.profile?.username ?? "Anonymous" }),
      !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [
        p.vote_count,
        " votes"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          className: "h-8 w-full text-xs",
          variant: mine ? "secondary" : "default",
          disabled: !canVote || m.isPending,
          onClick: () => m.mutate(p.id),
          "aria-label": mine ? "You voted for this user" : `Vote for ${p.profile?.username ?? "user"}`,
          children: mine ? "Your Vote" : "Vote"
        }
      )
    ] }, p.id);
  }) });
}
function CompetitionFollowButton({
  competitionId,
  userId,
  compact
}) {
  const follow = useServerFn(followCompetition);
  const unfollow = useServerFn(unfollowCompetition);
  const getMine = useServerFn(getMyCompetitionFollow);
  const getCount = useServerFn(getCompetitionFollowerCount);
  const qc = useQueryClient();
  const { data: mine } = useQuery({
    queryKey: ["competition-follow-mine", competitionId, userId],
    queryFn: () => getMine({ data: { competitionId } }),
    enabled: !!userId && !!competitionId
  });
  const { data: count } = useQuery({
    queryKey: ["competition-follow-count", competitionId],
    queryFn: () => getCount({ data: { competitionId } }),
    enabled: !!competitionId
  });
  const following = !!mine?.following;
  const total = count?.count ?? 0;
  const m = useMutation({
    mutationFn: () => (following ? unfollow : follow)({ data: { competitionId } }),
    onSuccess: () => {
      toast.success(following ? "Unfollowed" : "You'll be notified when this changes");
      qc.invalidateQueries({ queryKey: ["competition-follow-mine", competitionId] });
      qc.invalidateQueries({ queryKey: ["competition-follow-count", competitionId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      size: compact ? "sm" : "sm",
      variant: following ? "default" : "secondary",
      disabled: !userId || m.isPending,
      onClick: () => {
        if (!userId) {
          toast.error("Sign in to follow");
          return;
        }
        m.mutate();
      },
      title: !userId ? "Sign in to follow" : following ? "Unfollow" : "Follow",
      children: [
        following ? /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "mr-1 h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "mr-1 h-4 w-4" }),
        following ? "Following" : "Follow",
        total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1.5 text-xs opacity-70", children: [
          "· ",
          total
        ] })
      ]
    }
  );
}
function BattleArena({
  competition: c,
  competitors,
  userId,
  hideCounts,
  votingOpen,
  onVote,
  myVote,
  onShare,
  onReport,
  isVoting
}) {
  const eligible = competitors.filter((x) => !x.is_hidden && !x.is_disqualified);
  const sorted = reactExports.useMemo(
    () => [...eligible].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)),
    [eligible]
  );
  const pairs = reactExports.useMemo(() => {
    if (sorted.length < 2) return sorted.length === 1 ? [[sorted[0], null]] : [];
    const list = [];
    list.push([sorted[0], sorted[1]]);
    for (let i = 2; i < sorted.length - 1; i += 2) {
      list.push([sorted[i], sorted[i + 1]]);
    }
    return list;
  }, [sorted]);
  const [pairIdx, setPairIdx] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (pairs.length <= 1) return;
    const id = setInterval(() => setPairIdx((i) => (i + 1) % pairs.length), 7e3);
    return () => clearInterval(id);
  }, [pairs.length]);
  const pair = pairs[pairIdx] ?? null;
  const left = pair?.[0] ?? null;
  const right = pair?.[1] ?? null;
  const lv = left?.vote_count ?? 0;
  const rv = right?.vote_count ?? 0;
  const total = Math.max(1, lv + rv);
  const lPct = Math.round(lv / total * 100);
  const rPct = 100 - lPct;
  const isLive = c.status === "live";
  const isUpcoming = c.status === "upcoming";
  const isCompleted = c.status === "completed";
  const rewards = c.rewards ?? {};
  const prizeParts = [
    rewards.coins ? `${rewards.coins.toLocaleString()} coins` : null,
    rewards.xp ? `${rewards.xp} XP` : null,
    rewards.premium_days ? `${rewards.premium_days}d premium` : null,
    rewards.badge || null
  ].filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-b-[2.5rem]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArenaBackdrop, { bannerUrl: c.banner_url }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-20 flex items-start justify-between gap-2 px-4 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "secondary", className: "rounded-full border border-white/10 bg-black/40 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompetitionFollowButton, { competitionId: c.id, userId }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "secondary", onClick: onShare, className: "rounded-full border border-white/10 bg-black/40 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "mr-1 h-4 w-4" }),
          " Share"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", onClick: onReport, className: "rounded-full border border-white/10 bg-black/40 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "mr-1 h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-20 px-4 pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        isLive && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-200 shadow-[0_0_20px_-4px_rgba(244,63,94,0.6)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-rose-500" })
          ] }),
          "Live Battle"
        ] }),
        isUpcoming && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border-sky-400/50 bg-sky-500/20 text-sky-200", children: "Upcoming" }),
        isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border-zinc-400/40 bg-zinc-500/20 text-zinc-200", children: "Concluded" }),
        c.category?.name && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-white/20 bg-white/5 backdrop-blur", children: c.category.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] sm:text-4xl", children: c.name }),
      !isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 text-xs text-white/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5 text-amber-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isLive ? "Ends in" : "Starts in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Countdown, { endAt: isLive ? c.end_at : c.start_at, compact: true })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-20 mt-4 px-4", children: [
      pair ? /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -12 },
          transition: { duration: 0.35 },
          className: "grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FighterCard, { side: "left", c: left, isLeading: lv >= rv && lv > 0, hideCounts }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VSBadge, { live: isLive }),
            right ? /* @__PURE__ */ jsxRuntimeExports.jsx(FighterCard, { side: "right", c: right, isLeading: rv > lv, hideCounts }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid h-full min-h-[180px] place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center text-xs text-white/50", children: [
              "Awaiting",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "challenger"
            ] })
          ]
        },
        `${left?.id}-${right?.id ?? "solo"}-${pairIdx}`
      ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mb-3 h-10 w-10 text-amber-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-white/80", children: "Nominees will step into the arena soon." })
      ] }),
      pair && right && !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center justify-between text-[11px] font-semibold tabular-nums", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sky-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: lv }),
            " · ",
            lPct,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/50", children: [
            "Total ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: lv + rv })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-rose-300", children: [
            rPct,
            "% · ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: rv })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-black/50 shadow-inner", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]",
              initial: false,
              animate: { width: `${lPct}%` },
              transition: { type: "spring", stiffness: 80, damping: 20 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-rose-500 via-pink-500 to-fuchsia-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]",
              initial: false,
              animate: { width: `${rPct}%` },
              transition: { type: "spring", stiffness: 80, damping: 20 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              "aria-hidden": true,
              className: "absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 to-rose-500 shadow-[0_0_20px_rgba(251,191,36,0.9)]",
              animate: { left: `${lPct}%`, scale: [1, 1.15, 1] },
              transition: { left: { type: "spring", stiffness: 80, damping: 20 }, scale: { duration: 1.2, repeat: Infinity } }
            }
          )
        ] })
      ] }),
      pair && right && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          VoteButton,
          {
            side: "left",
            label: left.name,
            mine: myVote === left.id,
            disabled: !votingOpen || !userId || isVoting,
            onClick: () => onVote(left.id)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          VoteButton,
          {
            side: "right",
            label: right.name,
            mine: myVote === right.id,
            disabled: !votingOpen || !userId || isVoting,
            onClick: () => onVote(right.id)
          }
        )
      ] }),
      pairs.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex items-center justify-center gap-1.5", children: pairs.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setPairIdx(i),
          "aria-label": `Show battle ${i + 1}`,
          className: cn(
            "h-1.5 rounded-full transition-all",
            i === pairIdx ? "w-6 bg-amber-300" : "w-1.5 bg-white/25 hover:bg-white/50"
          )
        },
        i
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-20 mt-5 grid grid-cols-2 gap-2 px-4 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }), label: "Watching", value: (c.total_participants ?? 0) + Math.max(1, Math.floor((c.views_count ?? 0) / 25)) }),
      !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3.5 w-3.5" }), label: "Votes", value: c.total_votes ?? 0, accent: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }), label: "Views", value: c.views_count ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5" }), label: "Reactions", value: eligible.reduce((s, x) => s + (x.vote_count ?? 0), 0) })
    ] }),
    prizeParts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-20 mx-4 mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-400/5 to-transparent px-3 py-2.5 text-sm backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4 text-amber-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-widest text-amber-300", children: "Prize Pool" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-100/90", children: prizeParts.join(" · ") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-20 mx-4 mt-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTicker, { competitors: sorted.slice(0, 5) }) })
  ] });
}
function ArenaBackdrop({ bannerUrl }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "absolute inset-0 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#0b0716_45%,_#050308_100%)]" }),
    bannerUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-25 mix-blend-luminosity",
        style: { background: `url(${bannerUrl}) center/cover` }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-16 -top-24 h-72 w-72 rounded-full bg-sky-500/40 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-16 -top-24 h-72 w-72 rounded-full bg-rose-500/40 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-x-0 bottom-0 h-32 opacity-40",
        style: {
          backgroundImage: "linear-gradient(transparent 95%, rgba(255,255,255,0.25) 96%), linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.25) 96%)",
          backgroundSize: "40px 40px",
          transform: "perspective(400px) rotateX(60deg)",
          transformOrigin: "bottom"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Particles, {})
  ] });
}
function Particles() {
  const dots = reactExports.useMemo(
    () => Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 60,
      delay: Math.random() * 4,
      dur: 4 + Math.random() * 5,
      size: 2 + Math.random() * 3
    })),
    []
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: dots.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.span,
    {
      className: "absolute rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.9)]",
      style: { left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size },
      animate: { y: [0, -20, 0], opacity: [0.2, 1, 0.2] },
      transition: { duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }
    },
    d.id
  )) });
}
function VSBadge({ live }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid place-items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute h-20 w-20 rounded-full bg-gradient-to-br from-amber-400/40 via-rose-500/40 to-fuchsia-500/40 blur-xl",
        animate: { scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] },
        transition: { duration: 2, repeat: Infinity }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid h-14 w-14 place-items-center rounded-full border-2 border-white/30 bg-black/60 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-br from-amber-200 via-white to-rose-200 bg-clip-text text-lg font-black text-transparent", children: "VS" }) }),
    live && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/80", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-2.5 w-2.5 text-rose-400" }),
      " Round 1"
    ] })
  ] });
}
function FighterCard({
  c,
  side,
  isLeading,
  hideCounts
}) {
  const isLeft = side === "left";
  const accent = isLeft ? "from-sky-500 via-blue-500 to-cyan-400" : "from-rose-500 via-pink-500 to-fuchsia-400";
  const ring = isLeft ? "ring-sky-400/80 shadow-[0_0_40px_-8px_rgba(56,189,248,0.7)]" : "ring-rose-400/80 shadow-[0_0_40px_-8px_rgba(244,63,94,0.7)]";
  const glowText = isLeft ? "text-sky-300" : "text-rose-300";
  const flag = flagFromCode(c.country);
  const username = c.linked_profile?.username;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative flex flex-col items-center gap-2", isLeft ? "text-left" : "text-right"), children: [
    isLeading && !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "absolute -top-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 text-[10px] font-black text-black shadow-[0_0_20px_rgba(251,191,36,0.7)]",
        animate: { y: [0, -2, 0] },
        transition: { duration: 1.4, repeat: Infinity },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" }),
          " LEADING"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-70 blur-xl", accent),
          animate: { scale: [1, 1.08, 1] },
          transition: { duration: 2.2, repeat: Infinity }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: cn("relative h-24 w-24 rounded-full ring-4 sm:h-28 sm:w-28", ring), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0, loading: "lazy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AvatarFallback,
          {
            className: "bg-gradient-to-br from-slate-700 to-slate-900 text-2xl font-black text-white",
            style: { background: c.linked_profile?.avatar_color ?? void 0 },
            children: c.name.slice(0, 1).toUpperCase()
          }
        )
      ] }),
      flag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 -right-1 grid h-7 min-w-7 place-items-center rounded-full border border-white/30 bg-black/80 px-1 text-base leading-none shadow-lg", children: flag })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-1", isLeft ? "" : "flex-row-reverse"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "max-w-[9rem] truncate text-sm font-black text-white sm:text-base", children: c.name }),
      username && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4 shrink-0 text-sky-400" })
    ] }),
    username && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/u/${username}`, className: cn("truncate text-[11px] hover:underline", glowText), children: [
      "@",
      username
    ] }),
    !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("inline-flex items-center gap-1 text-[11px] font-bold", glowText), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: c.vote_count ?? 0 }),
      " votes"
    ] })
  ] });
}
function VoteButton({
  side,
  label,
  mine,
  disabled,
  onClick
}) {
  const isLeft = side === "left";
  const bg = mine ? "bg-emerald-500 hover:bg-emerald-500/90 text-white" : isLeft ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white" : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      disabled,
      className: cn(
        "group relative overflow-hidden rounded-2xl px-3 py-3 text-sm font-black shadow-xl transition-transform active:scale-[0.97] disabled:opacity-50",
        bg
      ),
      "aria-label": mine ? `You voted for ${label}` : `Vote for ${label}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.35),_transparent_60%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex items-center justify-center gap-1.5", children: mine ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
          " Voted"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-4 w-4" }),
          " Vote ",
          label.split(" ")[0]
        ] }) })
      ]
    }
  );
}
function StatChip({ icon, label, value, accent }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
    "flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 backdrop-blur",
    accent ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/[0.04]"
  ), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/70", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-sm font-black tabular-nums", accent ? "text-amber-200" : "text-white"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value }) })
  ] });
}
function LiveTicker({ competitors }) {
  const items = reactExports.useMemo(() => {
    if (competitors.length === 0) return [];
    const templates = [
      (n) => ({ icon: "🔥", text: `${n} just picked up new votes` }),
      (n) => ({ icon: "❤️", text: `Fans are hyping ${n}` }),
      (n) => ({ icon: "🎁", text: `A supporter boosted ${n}` }),
      (n) => ({ icon: "👏", text: `Crowd cheering for ${n}` }),
      (n) => ({ icon: "⚡", text: `${n} climbing the leaderboard` })
    ];
    const out = [];
    for (let i = 0; i < 12; i++) {
      const c = competitors[i % competitors.length];
      const t = templates[i % templates.length];
      out.push(t(c.name));
    }
    return out;
  }, [competitors]);
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black/70 to-transparent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black/70 to-transparent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-3 w-3 animate-pulse" }),
      " Live Activity"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "flex gap-6 whitespace-nowrap px-4 text-xs text-white/80",
        animate: { x: ["0%", "-50%"] },
        transition: { duration: 30, repeat: Infinity, ease: "linear" },
        children: doubled.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: it.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: it.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/30", children: "•" })
        ] }, i))
      }
    ) })
  ] });
}
const RANK_STYLES$1 = {
  1: {
    ring: "ring-2 ring-amber-400/70",
    glow: "shadow-[0_0_40px_-8px_rgba(251,191,36,0.55)] border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent",
    badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black",
    label: "1st",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5" })
  },
  2: {
    ring: "ring-2 ring-zinc-300/60",
    glow: "shadow-[0_0_30px_-10px_rgba(212,212,216,0.5)] border-zinc-300/40 bg-gradient-to-br from-zinc-300/10 via-zinc-200/5 to-transparent",
    badgeBg: "bg-gradient-to-r from-zinc-300 to-zinc-100 text-black",
    label: "2nd",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-3.5 w-3.5" })
  },
  3: {
    ring: "ring-2 ring-orange-400/60",
    glow: "shadow-[0_0_30px_-10px_rgba(251,146,60,0.45)] border-orange-400/40 bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent",
    badgeBg: "bg-gradient-to-r from-orange-400 to-amber-600 text-black",
    label: "3rd",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-3.5 w-3.5" })
  }
};
function SocialIcons({ links }) {
  if (!links) return null;
  const items = [
    { key: "instagram", url: links.instagram, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "h-4 w-4" }), label: "Instagram" },
    { key: "twitter", url: links.twitter, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "h-4 w-4" }), label: "Twitter/X" },
    { key: "tiktok", url: links.tiktok, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Music2, { className: "h-4 w-4" }), label: "TikTok" },
    { key: "youtube", url: links.youtube, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "h-4 w-4" }), label: "YouTube" }
  ];
  const visible = items.filter((i) => i.url);
  if (visible.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: visible.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      href: i.url,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": i.label,
      className: "grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-muted-foreground transition hover:scale-110 hover:border-white/30 hover:text-foreground",
      children: i.icon
    },
    i.key
  )) });
}
function PremiumCompetitorGrid({
  competitionId,
  competitors,
  myVote,
  canVote,
  hideCounts,
  isAdmin,
  votingClosed,
  votingUpcoming,
  onEdit,
  invalidateKey
}) {
  const vote = useServerFn(voteForCompetitor);
  const del = useServerFn(adminDeleteCompetitor);
  const setFlags = useServerFn(adminSetCompetitorFlags);
  const resetVotes = useServerFn(adminResetCompetitorVotes);
  const qc = useQueryClient();
  const visible = isAdmin ? competitors : competitors.filter((c) => !c.is_hidden);
  const eligible = visible.filter((c) => !c.is_disqualified);
  const totalVotes = eligible.reduce((s, c) => s + (c.vote_count ?? 0), 0);
  const rankMap = /* @__PURE__ */ new Map();
  [...eligible].sort((a, b) => b.vote_count - a.vote_count).forEach((c, i) => rankMap.set(c.id, i + 1));
  const ordered = [...visible].sort((a, b) => {
    if (!!b.is_pinned !== !!a.is_pinned) return b.is_pinned ? 1 : -1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const voteM = useMutation({
    mutationFn: (competitorId) => vote({ data: { competitionId, competitorId } }),
    onMutate: async (competitorId) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: invalidateKey }),
        qc.cancelQueries({ queryKey: ["my-competitor-vote", competitionId] })
      ]);
      const prevData = qc.getQueryData(invalidateKey);
      const prevMyVote = qc.getQueriesData({ queryKey: ["my-competitor-vote", competitionId] });
      if (prevData?.competitors) {
        const nextCompetitors = prevData.competitors.map((c) => {
          if (c.id === competitorId) return { ...c, vote_count: (c.vote_count ?? 0) + 1 };
          if (myVote && c.id === myVote && competitorId !== myVote) {
            return { ...c, vote_count: Math.max(0, (c.vote_count ?? 0) - 1) };
          }
          return c;
        });
        qc.setQueryData(invalidateKey, { ...prevData, competitors: nextCompetitors });
      }
      qc.setQueriesData({ queryKey: ["my-competitor-vote", competitionId] }, { competitorId });
      return { prevData, prevMyVote };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prevData) qc.setQueryData(invalidateKey, ctx.prevData);
      if (ctx?.prevMyVote) ctx.prevMyVote.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(e?.message ?? "Failed to vote");
    },
    onSuccess: () => {
      toast.success("🗳 Vote counted");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: invalidateKey });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    }
  });
  const delM = useMutation({
    mutationFn: (id) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const flagsM = useMutation({
    mutationFn: (v) => setFlags({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const resetM = useMutation({
    mutationFn: (competitorId) => resetVotes({ data: { competitorId } }),
    onSuccess: () => {
      toast.success("Votes reset");
      qc.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  if (visible.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/10 text-amber-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "No nominees have been added yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Check back soon — nominees will appear here." })
    ] });
  }
  const shareNominee = async (c) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Vote for ${c.name}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: c.name, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
    }
  };
  const voteCta = votingClosed ? "🏁 Voting Closed" : votingUpcoming ? "Voting Soon" : "Vote Now";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: ordered.map((c) => {
    const mine = myVote === c.id;
    const disq = !!c.is_disqualified;
    const rank = rankMap.get(c.id);
    const isTop3 = !hideCounts && !disq && rank !== void 0 && rank <= 3 && c.vote_count > 0;
    const style = isTop3 && rank ? RANK_STYLES$1[rank] : null;
    const pct = totalVotes > 0 ? Math.round(c.vote_count / totalVotes * 100) : 0;
    const flag = flagFromCode(c.country);
    const linkedUsername = c.linked_profile?.username;
    const hasSocials = !!c.social_links && Object.values(c.social_links).some(Boolean);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "article",
      {
        className: cn(
          "group relative flex flex-col gap-3 rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5",
          style ? style.glow : disq ? "border-rose-500/25 bg-rose-500/5 opacity-70" : c.is_hidden ? "border-white/10 bg-white/[0.03] opacity-60" : "border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:border-white/20 hover:shadow-xl"
        ),
        "aria-label": `Nominee ${c.name}`,
        children: [
          style && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-lg", style.badgeBg), children: [
            style.icon,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: style.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-4 top-4 flex flex-col gap-1", children: [
            c.is_pinned && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "gap-1 border border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100 text-[10px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3 w-3" }),
              " Pinned"
            ] }),
            c.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "gap-1 border border-amber-400/40 bg-amber-500/15 text-amber-200 text-[10px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
              " Featured"
            ] }),
            c.is_hidden && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: "Hidden" }),
            disq && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-[10px]", children: "Disqualified" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: cn("h-20 w-20 shrink-0 rounded-full", style?.ring ?? "ring-2 ring-white/10"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0, loading: "lazy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: c.linked_profile?.avatar_color ?? void 0 }, children: c.name.slice(0, 1).toUpperCase() })
              ] }),
              flag && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "absolute -bottom-1 -right-1 grid h-7 min-w-7 place-items-center rounded-full border border-white/20 bg-background/90 px-1 text-base leading-none shadow",
                  title: c.country ?? void 0,
                  "aria-label": `Country ${c.country}`,
                  children: flag
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-base font-bold", children: c.name }),
                linkedUsername && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4 shrink-0 text-sky-400", "aria-label": "Verified" })
              ] }),
              linkedUsername && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `/u/${linkedUsername}`,
                  className: "block truncate text-xs text-sky-300 hover:underline",
                  children: [
                    "@",
                    linkedUsername
                  ]
                }
              ),
              c.country && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[11px] text-muted-foreground", children: c.country }),
              c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground", children: c.description })
            ] })
          ] }),
          (hasSocials || c.website) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SocialIcons, { links: c.social_links ?? null }),
            c.website && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: c.website,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": "Website",
                className: "grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-muted-foreground transition hover:scale-110 hover:border-white/30 hover:text-foreground",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4" })
              }
            )
          ] }),
          !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: c.vote_count }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground", children: "votes" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-muted-foreground", children: [
                pct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "h-full rounded-full transition-[width] duration-700 ease-out",
                  style && rank === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-500" : style && rank === 2 ? "bg-gradient-to-r from-zinc-200 to-zinc-400" : style && rank === 3 ? "bg-gradient-to-r from-orange-400 to-amber-600" : "bg-gradient-to-r from-primary to-fuchsia-500"
                ),
                style: { width: `${pct}%` }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: cn(
                  "mt-1.5 inline-flex h-4 items-center gap-1 text-[11px] font-semibold transition-opacity duration-300",
                  rank === 1 && c.vote_count > 0 ? "text-amber-300 opacity-100" : "opacity-0"
                ),
                "aria-live": "polite",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3 animate-pulse" }),
                  " Currently Leading"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-center gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: cn(
                  "flex-1 font-semibold",
                  mine && "bg-emerald-600 hover:bg-emerald-600/90"
                ),
                variant: mine ? "default" : "default",
                disabled: !canVote || voteM.isPending || disq,
                onClick: () => voteM.mutate(c.id),
                "aria-label": mine ? "You voted for this nominee" : `Vote for ${c.name}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "mr-1.5 h-4 w-4" }),
                  mine ? "Your Vote ✓" : voteCta
                ]
              }
            ),
            linkedUsername && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "icon", variant: "ghost", "aria-label": "View profile", title: "View profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/u/${linkedUsername}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => shareNominee(c),
                "aria-label": "Share nominee",
                title: "Share",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" })
              }
            )
          ] }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1 border-t border-white/10 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onEdit?.(c), "aria-label": "Edit", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => flagsM.mutate({ id: c.id, is_hidden: !c.is_hidden }),
                title: c.is_hidden ? "Unhide" : "Hide",
                "aria-label": c.is_hidden ? "Unhide" : "Hide",
                children: c.is_hidden ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => flagsM.mutate({ id: c.id, is_disqualified: !c.is_disqualified }),
                title: disq ? "Restore" : "Disqualify",
                "aria-label": disq ? "Restore" : "Disqualify",
                children: disq ? /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4 text-rose-400" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => confirm(`Reset votes for ${c.name}?`) && resetM.mutate(c.id),
                title: "Reset votes",
                "aria-label": "Reset votes",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => confirm(`Remove ${c.name}?`) && delM.mutate(c.id),
                title: "Delete",
                "aria-label": "Delete",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-rose-400" })
              }
            )
          ] })
        ]
      },
      c.id
    );
  }) });
}
const TIERS = [
  { rank: 1, ring: "ring-[3px] ring-amber-400/70", grad: "from-amber-400 via-yellow-500 to-amber-600", glow: "shadow-[0_0_40px_-10px_rgba(251,191,36,0.6)]", label: "Champion", icon: Crown, h: "h-28 sm:h-40", scale: "scale-105" },
  { rank: 2, ring: "ring-[3px] ring-zinc-300/60", grad: "from-zinc-200 via-zinc-300 to-zinc-400", glow: "shadow-[0_0_28px_-10px_rgba(212,212,216,0.45)]", label: "Runner-up", icon: Medal, h: "h-20 sm:h-28", scale: "" },
  { rank: 3, ring: "ring-[3px] ring-orange-400/60", grad: "from-orange-400 via-amber-500 to-orange-600", glow: "shadow-[0_0_28px_-10px_rgba(251,146,60,0.45)]", label: "Third", icon: Medal, h: "h-14 sm:h-22", scale: "" }
];
function PodiumLayout({ competitors, myVote, canVote, hideCounts, votingClosed, votingUpcoming, onVote, isVoting }) {
  const sorted = reactExports.useMemo(
    () => [...competitors.filter((c) => !c.is_hidden && !c.is_disqualified)].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)),
    [competitors]
  );
  const total = Math.max(1, sorted.reduce((s, c) => s + (c.vote_count ?? 0), 0));
  const order = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
  const rankByIdx = [2, 1, 3];
  const voteCta = votingClosed ? "🏁 Closed" : votingUpcoming ? "Soon" : "Vote";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 -z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/4 top-8 h-28 w-28 rounded-full bg-zinc-400/10 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-1/4 top-8 h-28 w-28 rounded-full bg-orange-500/15 blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-2.5 w-2.5" }),
      " Podium"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 items-end gap-1.5 sm:gap-4", children: order.map((c, i) => {
      const rank = rankByIdx[i];
      const tier = TIERS[rank - 1];
      const Icon = tier.icon;
      const flag = flagFromCode(c.country);
      const pct = Math.round((c.vote_count ?? 0) / total * 100);
      const mine = myVote === c.id;
      const uname = c.linked_profile?.username;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.15, type: "spring", stiffness: 120 },
          className: cn("flex flex-col items-center", tier.scale),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              rank === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "absolute left-1/2 -top-4 h-4 w-4 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: cn("h-12 w-12 sm:h-16 sm:w-16", tier.ring, tier.glow), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: c.linked_profile?.avatar_color ?? void 0 }, children: c.name.slice(0, 1).toUpperCase() })
              ] }),
              flag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full border border-white/20 bg-background/90 px-1 text-xs shadow", children: flag })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-1 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[6rem] truncate text-[11px] font-bold sm:text-xs", children: c.name }),
              uname && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-2.5 w-2.5 shrink-0 text-sky-400" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "mt-1.5 grid w-full place-items-center rounded-t-lg bg-gradient-to-b text-black shadow-md",
                  tier.grad,
                  tier.h
                ),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 sm:h-5 sm:w-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-black leading-none sm:text-xl", children: [
                    "#",
                    rank
                  ] }),
                  !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] font-bold uppercase tracking-wider opacity-80 sm:text-[10px]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: c.vote_count ?? 0 }),
                    " · ",
                    pct,
                    "%"
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: cn("mt-1.5 h-8 w-full text-[11px]", mine && "bg-emerald-600 hover:bg-emerald-600/90"),
                disabled: !canVote || isVoting,
                onClick: () => onVote(c.id),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "mr-1 h-3 w-3" }),
                  mine ? "Voted ✓" : voteCta
                ]
              }
            )
          ]
        },
        c.id
      );
    }) })
  ] });
}
const RANK_STYLE = (r) => {
  if (r === 1) return { grad: "from-amber-400 to-yellow-500", text: "text-black", ring: "ring-amber-400/70", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }) };
  if (r === 2) return { grad: "from-zinc-200 to-zinc-400", text: "text-black", ring: "ring-zinc-300/60", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-4 w-4" }) };
  if (r === 3) return { grad: "from-orange-400 to-amber-600", text: "text-black", ring: "ring-orange-400/60", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-4 w-4" }) };
  return { grad: "from-primary to-fuchsia-500", text: "text-white", ring: "ring-white/10", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }) };
};
function LiveLeaderboard({ competitors, myVote, canVote, hideCounts, votingClosed, votingUpcoming, onVote, isVoting }) {
  const sorted = reactExports.useMemo(
    () => [...competitors.filter((c) => !c.is_hidden && !c.is_disqualified)].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)),
    [competitors]
  );
  const total = Math.max(1, sorted.reduce((s, c) => s + (c.vote_count ?? 0), 0));
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const voteCta = votingClosed ? "🏁" : votingUpcoming ? "Soon" : "Vote";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-10 -mx-4 border-b border-white/10 bg-[#050308]/95 px-4 py-3 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
          " Top 3"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Live rankings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: top3.map((c, i) => {
        const rank = i + 1;
        const s = RANK_STYLE(rank);
        const pct = Math.round((c.vote_count ?? 0) / total * 100);
        const flag = flagFromCode(c.country);
        const mine = myVote === c.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            layout: true,
            className: cn(
              "relative flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur",
              rank === 1 && "border-amber-400/40 bg-amber-500/5"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("absolute -top-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r px-1.5 py-0.5 text-[10px] font-black shadow", s.grad, s.text), children: [
                s.icon,
                "#",
                rank
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: cn("h-12 w-12 ring-2", s.ring), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: c.linked_profile?.avatar_color ?? void 0 }, children: c.name.slice(0, 1).toUpperCase() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full truncate text-center text-[11px] font-bold", children: [
                c.name,
                " ",
                flag
              ] }),
              !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-semibold text-amber-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: c.vote_count ?? 0 }),
                " · ",
                pct,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  className: cn("h-6 w-full px-1 text-[10px]", mine && "bg-emerald-600 hover:bg-emerald-600/90"),
                  disabled: !canVote || isVoting,
                  onClick: () => onVote(c.id),
                  children: mine ? "✓" : voteCta
                }
              )
            ]
          },
          c.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      rest.map((c, i) => {
        const rank = i + 4;
        const pct = Math.round((c.vote_count ?? 0) / total * 100);
        const flag = flagFromCode(c.country);
        const mine = myVote === c.id;
        const uname = c.linked_profile?.username;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            layout: true,
            initial: { opacity: 0, x: -10 },
            animate: { opacity: 1, x: 0 },
            className: cn(
              "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur transition hover:border-white/20",
              mine && "border-emerald-500/40 bg-emerald-500/5"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black tabular-nums text-white/80", children: rank }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-11 w-11 shrink-0 ring-1 ring-white/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: c.linked_profile?.avatar_color ?? void 0 }, children: c.name.slice(0, 1).toUpperCase() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-bold", children: c.name }),
                  flag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: flag }),
                  uname && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 shrink-0 text-sky-400" })
                ] }),
                !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-0.5 flex items-center justify-between text-[10px]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold tabular-nums text-white/80", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: c.vote_count ?? 0 }),
                      " votes"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-muted-foreground", children: [
                      pct,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500 transition-[width] duration-700",
                      style: { width: `${pct}%` }
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  className: cn("shrink-0", mine && "bg-emerald-600 hover:bg-emerald-600/90"),
                  disabled: !canVote || isVoting,
                  onClick: () => onVote(c.id),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "mr-1 h-3 w-3" }),
                    mine ? "Voted" : voteCta
                  ]
                }
              )
            ]
          },
          c.id
        );
      }),
      rest.length === 0 && sorted.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mx-auto mb-1 h-4 w-4" }),
        " All contenders shown above."
      ] })
    ] })
  ] });
}
function resolveLayout(style, count) {
  if (style && style !== "auto") return style;
  if (count <= 2) return "vs_battle";
  if (count === 3) return "podium";
  if (count <= 8) return "tournament";
  return "leaderboard";
}
function DynamicCompetitionLayout({
  competitionId,
  competitors,
  layoutStyle,
  myVote,
  canVote,
  hideCounts,
  isAdmin,
  votingClosed,
  votingUpcoming,
  onEdit,
  invalidateKey,
  suppressVsBattle
}) {
  const eligible = competitors.filter((c) => !c.is_hidden && !c.is_disqualified);
  const resolved = resolveLayout(layoutStyle, eligible.length);
  const vote = useServerFn(voteForCompetitor);
  const qc = useQueryClient();
  const voteM = useMutation({
    mutationFn: (competitorId) => vote({ data: { competitionId, competitorId } }),
    onMutate: async (competitorId) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: invalidateKey }),
        qc.cancelQueries({ queryKey: ["my-competitor-vote", competitionId] })
      ]);
      const prev = qc.getQueryData(invalidateKey);
      if (prev?.competitors) {
        const next = prev.competitors.map((c) => {
          if (c.id === competitorId) return { ...c, vote_count: (c.vote_count ?? 0) + 1 };
          if (myVote && c.id === myVote && competitorId !== myVote) {
            return { ...c, vote_count: Math.max(0, (c.vote_count ?? 0) - 1) };
          }
          return c;
        });
        qc.setQueryData(invalidateKey, { ...prev, competitors: next });
      }
      qc.setQueriesData({ queryKey: ["my-competitor-vote", competitionId] }, { competitorId });
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(invalidateKey, ctx.prev);
      toast.error(e?.message ?? "Failed to vote");
    },
    onSuccess: () => toast.success("🗳 Vote counted"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: invalidateKey });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    }
  });
  if (resolved === "vs_battle") {
    if (suppressVsBattle) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-muted-foreground backdrop-blur", children: "⚔️ VS Battle is live above — cast your vote in the arena." });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      PremiumCompetitorGrid,
      {
        competitionId,
        competitors,
        myVote,
        canVote,
        hideCounts,
        isAdmin,
        votingClosed,
        votingUpcoming,
        onEdit,
        invalidateKey
      }
    );
  }
  if (resolved === "podium") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      PodiumLayout,
      {
        competitors,
        myVote,
        canVote,
        hideCounts,
        votingClosed,
        votingUpcoming,
        onVote: (id) => voteM.mutate(id),
        isVoting: voteM.isPending
      }
    );
  }
  if (resolved === "leaderboard") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      LiveLeaderboard,
      {
        competitors,
        myVote,
        canVote,
        hideCounts,
        votingClosed,
        votingUpcoming,
        onVote: (id) => voteM.mutate(id),
        isVoting: voteM.isPending
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PremiumCompetitorGrid,
    {
      competitionId,
      competitors,
      myVote,
      canVote,
      hideCounts,
      isAdmin,
      votingClosed,
      votingUpcoming,
      onEdit,
      invalidateKey
    }
  );
}
const statusStyle = {
  live: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  upcoming: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
  draft: "bg-amber-500/20 text-amber-400 border-amber-500/40"
};
function CompetitionCard({ c, onEdit }) {
  const color = c.category?.color ?? "#8b5cf6";
  const canNavigate = isNavigableSlug(c.slug);
  const card = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative h-32 w-full overflow-hidden",
        style: {
          background: c.banner_url ? `url(${c.banner_url}) center/cover` : `linear-gradient(135deg, ${color}, ${color}80)`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3 top-3 flex items-center gap-2", children: c.category && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-white/30 bg-white/10 text-white backdrop-blur", children: c.category.name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-3 flex items-center gap-2", children: [
            c.is_published === false && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border border-rose-500/40 bg-rose-500/20 text-rose-300 uppercase", children: "Unpublished" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `border ${statusStyle[c.status]} uppercase`, children: c.status })
          ] }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "aria-label": "Edit competition",
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(c);
              },
              className: "absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur hover:bg-black/70",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
                " Edit"
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "line-clamp-1 text-base font-bold", children: c.name }),
        c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-xs text-muted-foreground", children: c.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
          " ",
          c.total_participants
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3.5 w-3.5" }),
          " ",
          c.total_votes
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }),
          " ",
          c.status === "completed" ? "Ended" : "Live"
        ] })
      ] }),
      c.status !== "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-[10px] uppercase tracking-wider text-muted-foreground", children: c.status === "live" ? "Ends in" : "Starts in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Countdown, { endAt: c.status === "live" ? c.end_at : c.start_at, compact: true })
      ] }) : null
    ] })
  ] });
  const className = "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-2xl";
  if (!canNavigate) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: card });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions/$slug", params: { slug: c.slug }, className, children: card });
}
function fmt(d) {
  return d.toLocaleDateString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function humanRemain(ms) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1e3);
  const d = Math.floor(s / 86400);
  const h = Math.floor(s % 86400 / 3600);
  const m = Math.floor(s % 3600 / 60);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}
function TournamentProgress({ startAt, endAt, status }) {
  const [now, setNow] = reactExports.useState(() => Date.now());
  reactExports.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 3e4);
    return () => clearInterval(id);
  }, []);
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const total = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(total, now - start));
  const pct = Math.round(elapsed / total * 100);
  const remain = end - now;
  const upcoming = status === "upcoming" || now < start;
  const done = status === "completed" || remain <= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-violet-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Hourglass, { className: "h-3 w-3" }),
        " Tournament Progress"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70", children: upcoming ? "Starts soon" : done ? "Completed" : `${pct}% completed` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-black/50 shadow-inner", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 shadow-[0_0_16px_rgba(217,70,239,0.6)]",
          initial: false,
          animate: { width: `${upcoming ? 0 : done ? 100 : pct}%` },
          transition: { type: "spring", stiffness: 60, damping: 22 }
        }
      ),
      !upcoming && !done && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          "aria-hidden": true,
          className: "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.9)]",
          animate: { left: `${pct}%`, scale: [1, 1.15, 1] },
          transition: { left: { type: "spring", stiffness: 60, damping: 22 }, scale: { duration: 1.4, repeat: Infinity } }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 grid grid-cols-3 gap-2 text-[10px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-2.5 w-2.5" }),
          " Start"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 truncate font-semibold text-white/90", children: fmt(new Date(startAt)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-2.5 w-2.5" }),
          " ",
          done ? "Ended" : "Now"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 truncate font-semibold text-amber-100", children: done ? "Voting closed" : humanRemain(remain) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1 text-[9px] uppercase tracking-wider text-white/50", children: [
          "End ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-2.5 w-2.5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 truncate font-semibold text-white/90", children: fmt(new Date(endAt)) })
      ] })
    ] })
  ] });
}
function timeAgo$1(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1e3);
  if (s < 60) return `${s || 1}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function RecentSupporters({ competitionId }) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const { data = [], refetch } = useQuery({
    queryKey: ["competition-recent-voters", competitionId],
    queryFn: () => fetcher({ data: { competitionId, limit: 30 } }),
    refetchInterval: 15e3,
    staleTime: 1e4
  });
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const ch = supabase.channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: false } } }).on("broadcast", { event: "vote" }, () => {
      refetch();
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId, refetch]);
  const [, setTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2e4);
    return () => clearInterval(id);
  }, []);
  const voters = reactExports.useMemo(() => data.slice(0, 30), [data]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-pink-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3 fill-rose-400 text-rose-400" }),
        " Recent Supporters"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/50", children: [
        "Live · ",
        voters.length
      ] })
    ] }),
    voters.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-4 text-[11px] text-white/50", children: "Be the first to vote and cheer someone on." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: voters.map((v) => {
      const gradient = v.avatar_color ? `from-white/20 to-white/5` : "from-fuchsia-500 via-rose-500 to-amber-400";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          layout: true,
          initial: { opacity: 0, scale: 0.7, x: -12 },
          animate: { opacity: 1, scale: 1, x: 0 },
          exit: { opacity: 0, scale: 0.7 },
          transition: { type: "spring", stiffness: 260, damping: 22 },
          className: "mx-1 flex w-[64px] shrink-0 flex-col items-center text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full bg-gradient-to-br ${gradient} p-[2px] shadow-[0_0_12px_-3px_rgba(244,63,94,0.7)]`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-11 w-11 border-2 border-black", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: v.avatar_url ?? void 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: v.avatar_color ?? void 0 }, children: (v.username ?? "?").slice(0, 1).toUpperCase() })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex max-w-full items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[10px] font-semibold text-white/90", children: v.username ?? "Voter" }),
              v.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-2.5 w-2.5 shrink-0 text-sky-400" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-white/50", children: timeAgo$1(v.voted_at) })
          ]
        },
        `${v.voter_id}-${v.voted_at}`
      );
    }) }) })
  ] });
}
const MAX = 20;
function BattleActivityFeed({
  competitionId,
  topLeaderName,
  totalVotes
}) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const { data = [] } = useQuery({
    queryKey: ["competition-recent-voters", competitionId],
    queryFn: () => fetcher({ data: { competitionId, limit: 20 } }),
    refetchInterval: 15e3,
    staleTime: 1e4
  });
  const [extras, setExtras] = reactExports.useState([]);
  const lastLeaderRef = reactExports.useRef(null);
  const lastMilestoneRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    if (!topLeaderName) return;
    if (lastLeaderRef.current && lastLeaderRef.current !== topLeaderName) {
      setExtras((prev) => [
        {
          id: `leader-${Date.now()}`,
          kind: "leader",
          ts: Date.now(),
          text: `${topLeaderName} took the lead 👑`
        },
        ...prev
      ].slice(0, MAX));
    }
    lastLeaderRef.current = topLeaderName;
  }, [topLeaderName]);
  reactExports.useEffect(() => {
    if (!totalVotes) return;
    const bucket = Math.floor(totalVotes / 100);
    if (bucket > 0 && bucket > lastMilestoneRef.current) {
      lastMilestoneRef.current = bucket;
      setExtras((prev) => [
        {
          id: `ms-${bucket}`,
          kind: "milestone",
          ts: Date.now(),
          text: `🏆 ${bucket * 100} votes reached!`
        },
        ...prev
      ].slice(0, MAX));
    }
  }, [totalVotes]);
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const ch = supabase.channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: false } } }).on("broadcast", { event: "vote" }, (msg) => {
      const payload = msg.payload ?? {};
      setExtras((prev) => [
        {
          id: `bc-${Date.now()}-${Math.random()}`,
          kind: "vote",
          ts: Date.now(),
          text: `${payload.voter ?? "Someone"} voted`
        },
        ...prev
      ].slice(0, MAX));
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId]);
  const items = reactExports.useMemo(() => {
    const voteItems = data.map((v) => ({
      id: `v-${v.voter_id}-${v.voted_at}`,
      kind: "vote",
      ts: new Date(v.voted_at).getTime(),
      text: `${v.username ?? "A supporter"} voted`,
      actor: v.username,
      target: v.competitor_name
    }));
    return [...extras, ...voteItems].sort((a, b) => b.ts - a.ts).slice(0, MAX);
  }, [data, extras]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3 w-3" }),
        " Battle Activity"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-white/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-fuchsia-500" })
        ] }),
        "Live"
      ] })
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-6 text-[11px] text-white/50", children: "Activity will appear here as votes come in." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "max-h-72 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:thin]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.li,
      {
        layout: true,
        initial: { opacity: 0, x: -12 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 12 },
        transition: { type: "spring", stiffness: 260, damping: 24 },
        className: "flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-[11px]",
        children: [
          it.kind === "vote" && /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3 shrink-0 fill-rose-400 text-rose-400" }),
          it.kind === "leader" && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 shrink-0 text-amber-400" }),
          it.kind === "milestone" && /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3 shrink-0 text-amber-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-white/85", children: it.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto shrink-0 text-[9px] text-white/40", children: [
            Math.max(1, Math.floor((Date.now() - it.ts) / 1e3)),
            "s"
          ] })
        ]
      },
      it.id
    )) }) })
  ] });
}
function AudienceCounter({ competitionId }) {
  const { user } = useAuth();
  const [count, setCount] = reactExports.useState(1);
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const key = user?.id ?? `guest-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel(`comp-presence:${competitionId}`, {
      config: { presence: { key } }
    });
    const recount = () => {
      const state = channel.presenceState();
      const n = Object.keys(state).length;
      setCount(n > 0 ? n : 1);
    };
    channel.on("presence", { event: "sync" }, recount).on("presence", { event: "join" }, recount).on("presence", { event: "leave" }, recount).subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ at: Date.now() });
      }
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [competitionId, user?.id]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 4 },
      animate: { opacity: 1, y: 0 },
      className: "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-2.5 w-2.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: count }),
        " watching"
      ]
    }
  );
}
const EMOJIS = ["❤️", "🔥", "👏", "🎉", "⭐", "💜"];
function FloatingReactions({ competitionId }) {
  const [reactions, setReactions] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const ch = supabase.channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: true } } }).on("broadcast", { event: "vote" }, () => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const x = 20 + Math.random() * 60;
      setReactions((prev) => [...prev.slice(-8), { id, emoji, x }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2200);
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none fixed inset-0 z-40 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: reactions.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.span,
    {
      initial: { opacity: 0, y: 40, scale: 0.6 },
      animate: { opacity: [0, 1, 1, 0], y: -160, scale: [0.6, 1.2, 1] },
      exit: { opacity: 0 },
      transition: { duration: 2.1, ease: "easeOut" },
      style: { left: `${r.x}%`, bottom: "18%" },
      className: "absolute text-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]",
      children: r.emoji
    },
    r.id
  )) }) });
}
function HeadToHeadBattle({
  competitors,
  canVote,
  onVote,
  isVoting,
  myVote
}) {
  const sorted = reactExports.useMemo(
    () => [...competitors].filter((c) => !c.is_hidden && !c.is_disqualified).sort((a2, b2) => (b2.vote_count ?? 0) - (a2.vote_count ?? 0)),
    [competitors]
  );
  const [a, b] = sorted;
  if (!a || !b) return null;
  const total = Math.max(1, (a.vote_count ?? 0) + (b.vote_count ?? 0));
  const pctA = Math.round((a.vote_count ?? 0) / total * 100);
  const pctB = 100 - pctA;
  const diff = Math.abs((a.vote_count ?? 0) - (b.vote_count ?? 0));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/[0.06] to-rose-500/10 p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-fuchsia-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3" }),
        " Head-to-Head"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/60", children: [
        "Lead: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-amber-300", children: [
          "+",
          diff
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VsSide, { c: a, pct: pctA, isLeader: true, align: "left", canVote, onVote, isVoting, mine: myVote === a.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-gradient-to-br from-amber-400 to-rose-500 px-2 py-0.5 text-[10px] font-black text-black shadow-lg sm:px-2.5 sm:text-xs", children: "VS" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VsSide, { c: b, pct: pctB, align: "right", canVote, onVote, isVoting, mine: myVote === b.id })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500", style: { width: `${pctA}%` } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all duration-500", style: { width: `${pctB}%` } })
    ] }) })
  ] });
}
function VsSide({
  c,
  pct,
  isLeader,
  align,
  canVote,
  onVote,
  isVoting,
  mine
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col items-center gap-1.5 text-center ${align === "right" ? "" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full p-[2px] ${isLeader ? "bg-gradient-to-br from-amber-300 via-amber-400 to-rose-500 shadow-[0_0_16px_-2px_rgba(251,191,36,0.7)]" : "bg-gradient-to-br from-fuchsia-500 to-violet-500"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-14 w-14 border-2 border-black sm:h-16 sm:w-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: c.linked_profile?.avatar_color ?? void 0 }, children: (c.name ?? "?").slice(0, 1).toUpperCase() })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      isLeader && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 text-amber-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[90px] truncate text-xs font-bold sm:max-w-[130px] sm:text-sm", children: c.name })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white/90", children: c.vote_count ?? 0 }),
      " · ",
      pct,
      "%"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        size: "sm",
        disabled: !canVote || isVoting || mine,
        onClick: () => onVote(c.id),
        className: `h-7 rounded-full px-3 text-[10px] font-bold ${mine ? "bg-emerald-500/20 text-emerald-200" : "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white hover:from-fuchsia-400 hover:to-rose-400"}`,
        children: mine ? "✓ Voted" : "Vote"
      }
    )
  ] });
}
function BattleIntensityMeter({ competitionId }) {
  const bucketRef = reactExports.useRef([]);
  const [rate, setRate] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const ch = supabase.channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: true } } }).on("broadcast", { event: "vote" }, () => {
      bucketRef.current.push(Date.now());
    }).subscribe();
    const iv = setInterval(() => {
      const cutoff = Date.now() - 6e4;
      bucketRef.current = bucketRef.current.filter((t) => t >= cutoff);
      setRate(bucketRef.current.length);
    }, 1e3);
    return () => {
      clearInterval(iv);
      supabase.removeChannel(ch);
    };
  }, [competitionId]);
  const { label, color, pct } = reactExports.useMemo(() => {
    if (rate >= 30) return { label: "Extreme", color: "from-rose-500 via-orange-500 to-amber-400", pct: 100 };
    if (rate >= 12) return { label: "High", color: "from-fuchsia-500 to-rose-500", pct: 75 };
    if (rate >= 4) return { label: "Medium", color: "from-violet-500 to-fuchsia-500", pct: 50 };
    if (rate >= 1) return { label: "Low", color: "from-sky-500 to-violet-500", pct: 25 };
    return { label: "Calm", color: "from-white/20 to-white/10", pct: 8 };
  }, [rate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3 text-orange-400" }),
        " Battle Intensity"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-white/80", children: [
        label,
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/50", children: [
          rate,
          "/min"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 overflow-hidden rounded-full bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: `h-full bg-gradient-to-r ${color}`,
        animate: { width: `${pct}%` },
        transition: { type: "spring", stiffness: 80, damping: 18 }
      }
    ) })
  ] });
}
function LiveLeaderBanner({
  topLeaderName
}) {
  const [visible, setVisible] = reactExports.useState(null);
  const prevRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!topLeaderName) return;
    if (prevRef.current === null) {
      prevRef.current = topLeaderName;
      return;
    }
    if (prevRef.current !== topLeaderName) {
      prevRef.current = topLeaderName;
      setVisible(topLeaderName);
      const t = setTimeout(() => setVisible(null), 4500);
      return () => clearTimeout(t);
    }
  }, [topLeaderName]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: -30, scale: 0.9 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.95 },
      transition: { type: "spring", stiffness: 220, damping: 20 },
      className: "pointer-events-none fixed inset-x-0 top-16 z-40 mx-auto w-max max-w-[92%] rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-4 py-2 text-center text-xs font-black text-black shadow-[0_10px_40px_-10px_rgba(251,191,36,0.8)] sm:text-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "mr-1.5 inline h-4 w-4" }),
        visible,
        " takes the lead!"
      ]
    }
  ) });
}
const MILESTONES = [
  { at: 100, icon: PartyPopper, label: "100 Votes", color: "from-sky-500 to-violet-500" },
  { at: 500, icon: Flame, label: "500 Votes", color: "from-violet-500 to-fuchsia-500" },
  { at: 1e3, icon: Rocket, label: "1,000 Votes", color: "from-fuchsia-500 to-rose-500" },
  { at: 5e3, icon: Trophy, label: "5,000 Votes", color: "from-amber-400 to-rose-500" }
];
function VoteMilestones({ totalVotes }) {
  const nextIdx = MILESTONES.findIndex((m) => totalVotes < m.at);
  const reached = nextIdx === -1 ? MILESTONES : MILESTONES.slice(0, nextIdx);
  const next = nextIdx === -1 ? null : MILESTONES[nextIdx];
  if (totalVotes < 10 && reached.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
        " Milestones"
      ] }),
      next && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/60", children: [
        "Next: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white/90", children: next.at - totalVotes }),
        " to ",
        next.label
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: MILESTONES.map((m) => {
      const done = totalVotes >= m.at;
      const Icon = m.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex min-w-[110px] shrink-0 items-center gap-2 rounded-xl border p-2 transition ${done ? `border-transparent bg-gradient-to-br ${m.color} text-white shadow-lg` : "border-white/10 bg-white/[0.02] text-white/40"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4 w-4 ${done ? "" : ""}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold leading-tight", children: m.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] opacity-80", children: done ? "Unlocked" : `${m.at - totalVotes} to go` })
            ] })
          ]
        },
        m.at
      );
    }) })
  ] });
}
function useCompetitorMomentum(competitionId) {
  const [map, setMap] = reactExports.useState({});
  const bucketRef = reactExports.useRef([]);
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const ch = supabase.channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: true } } }).on("broadcast", { event: "vote" }, (msg) => {
      const name = msg?.payload?.target;
      if (name) bucketRef.current.push({ name, t: Date.now() });
    }).subscribe();
    const iv = setInterval(() => {
      const cutoff = Date.now() - 12e4;
      bucketRef.current = bucketRef.current.filter((x) => x.t >= cutoff);
      const counts = {};
      for (const x of bucketRef.current) counts[x.name] = (counts[x.name] ?? 0) + 1;
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      const next = {};
      for (const [name, n] of Object.entries(counts)) {
        const share = n / total;
        if (share >= 0.4 && n >= 3) next[name] = "rising";
        else if (n === 0) next[name] = "falling";
        else next[name] = "stable";
      }
      setMap(next);
    }, 2e3);
    return () => {
      clearInterval(iv);
      supabase.removeChannel(ch);
    };
  }, [competitionId]);
  return map;
}
function MomentumBadge({ state }) {
  if (!state || state === "stable") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-white/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-2.5 w-2.5" }),
      " Stable"
    ] });
  }
  if (state === "rising") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-2.5 w-2.5" }),
      " Rising"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-2.5 w-2.5" }),
    " Slowing"
  ] });
}
function TopSupporters({ competitionId }) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const { data = [], refetch } = useQuery({
    queryKey: ["competition-top-supporters", competitionId],
    queryFn: () => fetcher({ data: { competitionId, limit: 200 } }),
    refetchInterval: 3e4,
    staleTime: 2e4
  });
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const ch = supabase.channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: false } } }).on("broadcast", { event: "vote" }, () => refetch()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId, refetch]);
  const top = reactExports.useMemo(() => {
    const byVoter = /* @__PURE__ */ new Map();
    for (const v of data) {
      const key = v.voter_id;
      if (!key) continue;
      const cur = byVoter.get(key);
      if (cur) cur.count += 1;
      else byVoter.set(key, { v, count: 1 });
    }
    return Array.from(byVoter.values()).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [data]);
  const [, setTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3e4);
    return () => clearInterval(id);
  }, []);
  if (top.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/[0.04] to-transparent p-3 backdrop-blur-xl sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
        " Most Active Supporters"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/50", children: [
        "Top ",
        top.length
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid gap-1.5", children: top.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "li",
      {
        className: "flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${idx === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black" : idx === 1 ? "bg-gradient-to-br from-zinc-200 to-zinc-400 text-black" : idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-black" : "bg-white/10 text-white/70"}`,
              children: idx + 1
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-7 w-7 border border-white/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: entry.v.avatar_url ?? void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: entry.v.avatar_color ?? void 0 }, children: (entry.v.username ?? "?").slice(0, 1).toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[11px] font-semibold text-white/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: entry.v.username ?? "Supporter" }),
            entry.v.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-2.5 w-2.5 shrink-0 text-sky-400" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-white/90", children: [
            entry.count,
            " ",
            entry.count === 1 ? "vote" : "votes"
          ] })
        ]
      },
      entry.v.voter_id
    )) })
  ] });
}
const RANK_STYLES = {
  0: {
    ring: "from-amber-300 via-yellow-400 to-amber-500",
    badge: "bg-gradient-to-br from-amber-300 to-amber-500 text-black",
    glow: "shadow-[0_0_30px_-6px_rgba(251,191,36,0.65)]",
    label: "Gold",
    icon: "🥇"
  },
  1: {
    ring: "from-slate-200 via-zinc-300 to-slate-400",
    badge: "bg-gradient-to-br from-zinc-200 to-slate-400 text-black",
    glow: "shadow-[0_0_24px_-8px_rgba(226,232,240,0.55)]",
    label: "Silver",
    icon: "🥈"
  },
  2: {
    ring: "from-orange-400 via-amber-600 to-orange-700",
    badge: "bg-gradient-to-br from-orange-400 to-orange-600 text-black",
    glow: "shadow-[0_0_22px_-8px_rgba(251,146,60,0.55)]",
    label: "Bronze",
    icon: "🥉"
  }
};
function socialIcon(key) {
  const k = key.toLowerCase();
  if (k.includes("twitter") || k === "x") return Twitter;
  if (k.includes("insta")) return Instagram;
  if (k.includes("youtube") || k === "yt") return Youtube;
  if (k.includes("facebook") || k === "fb") return Facebook;
  if (k.includes("linkedin")) return Linkedin;
  return Globe;
}
function countryFlag(code) {
  if (!code) return null;
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return code;
  const A = 127462;
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65) + String.fromCodePoint(A + cc.charCodeAt(1) - 65);
}
function PremiumNomineeCards({
  competitionId,
  competitionSlug,
  competitors,
  myVote,
  canVote,
  hideCounts,
  invalidateKey,
  memeCounts
}) {
  const vote = useServerFn(voteForCompetitor);
  const qc = useQueryClient();
  const momentum = useCompetitorMomentum(competitionId);
  const visible = competitors.filter((c) => !c.is_hidden);
  const sorted = [...visible].filter((c) => !c.is_disqualified).sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  const totalVotes = sorted.reduce((s, c) => s + (c.vote_count ?? 0), 0);
  const rankMap = new Map(sorted.map((c, i) => [c.id, i]));
  const leaderId = sorted[0]?.id;
  const voteM = useMutation({
    mutationFn: (id) => vote({ data: { competitionId, competitorId: id } }),
    onSuccess: () => {
      toast.success("🔥 Vote counted");
      qc.invalidateQueries({ queryKey: invalidateKey });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to vote")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: visible.map((c) => {
    const mine = myVote === c.id;
    const disq = !!c.is_disqualified;
    const rank = rankMap.get(c.id);
    const rankStyle = rank !== void 0 && rank < 3 ? RANK_STYLES[rank] : null;
    const isLeader = leaderId === c.id && (c.vote_count ?? 0) > 0 && !disq;
    const pct = totalVotes > 0 ? Math.round((c.vote_count ?? 0) / totalVotes * 100) : 0;
    const socials = c.social_links ?? {};
    const socialEntries = Object.entries(socials).filter(([, v]) => !!v).slice(0, 4);
    const flag = countryFlag(c.country);
    const profileUrl = c.linked_profile?.username ? `/u/${c.linked_profile.username}` : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        layout: true,
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 220, damping: 24 },
        className: `relative flex flex-col overflow-hidden rounded-2xl border backdrop-blur-xl ${disq ? "border-rose-500/30 bg-rose-500/5 opacity-70" : isLeader ? `border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent ${rankStyle?.glow ?? ""}` : "border-white/10 bg-white/[0.03]"}`,
        children: [
          c.cover_image_url && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-20 w-full bg-cover bg-center opacity-70",
              style: { backgroundImage: `url(${c.cover_image_url})` }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent to-black/60 ${c.cover_image_url ? "" : "hidden"}` }),
          rankStyle && !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-black ${rankStyle.badge}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: rank + 1 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-3 top-3 z-10 flex flex-wrap gap-1", children: [
            isLeader && !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-1.5 py-0.5 text-[9px] font-black text-black shadow", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-2.5 w-2.5" }),
              " Leading"
            ] }),
            c.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-fuchsia-500/30 px-1.5 py-0.5 text-[9px] font-bold text-fuchsia-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-2.5 w-2.5" }),
              " Featured"
            ] }),
            c.is_pinned && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-sky-500/30 px-1.5 py-0.5 text-[9px] font-bold text-sky-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-2.5 w-2.5" }),
              " Pinned"
            ] }),
            disq && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-rose-500/30 px-1.5 py-0.5 text-[9px] font-bold text-rose-100", children: "Disqualified" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex flex-col gap-2.5 p-3 ${c.cover_image_url ? "-mt-8" : "pt-10"} sm:p-4`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `shrink-0 rounded-full bg-gradient-to-br p-[2px] ${rankStyle?.ring ?? (isLeader ? "from-amber-300 to-rose-500" : "from-fuchsia-500 to-violet-500")}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-16 w-16 border-2 border-black", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: c.photo_url ?? c.linked_profile?.avatar_url ?? void 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: { background: c.linked_profile?.avatar_color ?? void 0 }, children: (c.name ?? "?").slice(0, 1).toUpperCase() })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-black text-white", children: c.name }),
                  c.linked_profile && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3.5 w-3.5 shrink-0 text-sky-400" }),
                  flag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: flag })
                ] }),
                c.linked_profile?.username && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-[11px] text-white/60", children: [
                  "@",
                  c.linked_profile.username
                ] }),
                c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-[11px] text-white/60", children: c.description })
              ] })
            ] }),
            !hideCounts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-[11px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white/90", children: [
                  (c.vote_count ?? 0).toLocaleString(),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50 font-normal", children: "votes" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MomentumBadge, { state: momentum[c.name] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white/80", children: [
                    pct,
                    "%"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-1.5 w-full overflow-hidden rounded-full bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: `h-full ${rank === 0 ? "bg-gradient-to-r from-amber-300 via-amber-400 to-rose-500" : rank === 1 ? "bg-gradient-to-r from-slate-300 to-zinc-400" : rank === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600" : "bg-gradient-to-r from-fuchsia-500 to-violet-500"}`,
                  initial: { width: 0 },
                  animate: { width: `${pct}%` },
                  transition: { type: "spring", stiffness: 80, damping: 18 }
                }
              ) })
            ] }),
            isNavigableSlug(competitionSlug) && memeCounts && (memeCounts[c.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/competitions/$slug/memes",
                params: { slug: competitionSlug },
                search: { nominee: c.id },
                className: "inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Laugh, { className: "h-3 w-3" }),
                  " 😂 Memes (",
                  memeCounts[c.id],
                  ")"
                ]
              }
            ),
            (socialEntries.length > 0 || profileUrl || c.website) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
              socialEntries.map(([k, url]) => {
                const Icon = socialIcon(k);
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: url,
                    target: "_blank",
                    rel: "noreferrer nofollow",
                    className: "grid h-6 w-6 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10",
                    "aria-label": k,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" })
                  },
                  k
                );
              }),
              c.website && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: c.website,
                  target: "_blank",
                  rel: "noreferrer nofollow",
                  className: "grid h-6 w-6 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10",
                  "aria-label": "Website",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
                }
              ),
              profileUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: profileUrl,
                  className: "inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/80 hover:bg-white/10",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-2.5 w-2.5" }),
                    " View"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                disabled: !canVote || voteM.isPending || disq,
                onClick: () => voteM.mutate(c.id),
                className: `h-9 rounded-xl text-xs font-black transition ${mine ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25" : rank === 0 ? "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white hover:brightness-110" : "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white hover:from-fuchsia-400 hover:to-rose-400"}`,
                children: mine ? "✓ Your Vote" : disq ? "Disqualified" : rank === 0 ? "👑 Vote for Leader" : "🗳 Vote"
              }
            )
          ] })
        ]
      },
      c.id
    );
  }) });
}
function StickyMobileVoteBar({
  canVote,
  hasVoted,
  onClick,
  label = "Vote Now"
}) {
  const [show, setShow] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!canVote || hasVoted) {
      setShow(false);
      return;
    }
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [canVote, hasVoted]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: show && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { y: 80, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 80, opacity: 0 },
      transition: { type: "spring", stiffness: 240, damping: 24 },
      className: "fixed inset-x-0 bottom-3 z-40 mx-auto flex w-max max-w-[92%] items-center gap-2 rounded-full border border-white/10 bg-black/70 px-2 py-2 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(244,63,94,0.6)] md:hidden",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick,
          className: "h-9 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 px-4 text-xs font-black text-white shadow-lg hover:brightness-110",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "mr-1.5 h-3.5 w-3.5" }),
            label
          ]
        }
      )
    }
  ) });
}
const CONFIG = {
  upcoming: {
    icon: Calendar,
    title: "The stage is being set",
    subtitle: "Voting opens soon. Follow this competition to be notified.",
    gradient: "from-sky-500/20 via-violet-500/10 to-transparent"
  },
  closed: {
    icon: Trophy,
    title: "Voting has closed",
    subtitle: "Thanks to everyone who cast a vote. Results are final.",
    gradient: "from-amber-500/20 via-rose-500/10 to-transparent"
  },
  "no-nominees": {
    icon: Users,
    title: "No nominees yet",
    subtitle: "Contestants haven't been added. Check back shortly.",
    gradient: "from-fuchsia-500/20 via-violet-500/10 to-transparent"
  },
  "no-votes": {
    icon: Vote,
    title: "Be the first to vote",
    subtitle: "The battle hasn't started scoring yet — cast the opening vote.",
    gradient: "from-rose-500/20 via-fuchsia-500/10 to-transparent"
  }
};
function PremiumEmptyState({ kind, action }) {
  const cfg = CONFIG[kind];
  const Icon = cfg.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${cfg.gradient} px-6 py-10 text-center backdrop-blur-xl sm:py-14`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.15),transparent_60%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 sm:h-16 sm:w-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-6 w-6 text-white/80 sm:h-7 sm:w-7" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-black text-white sm:text-lg", children: cfg.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-1 max-w-md text-xs text-white/60 sm:text-sm", children: cfg.subtitle }),
          action && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-center", children: action })
        ] })
      ]
    }
  );
}
function PoetryBattleEntries({ slug }) {
  const fetchBattle = useServerFn(getPoetryBattle);
  const { data } = useQuery({
    queryKey: ["poetry-battle", slug],
    queryFn: () => fetchBattle({ data: { slug } }),
    staleTime: 2e4,
    refetchInterval: 3e4
  });
  const qc = useQueryClient();
  useBattleRankingRealtime(data?.battle?.id ?? null, () => {
    void qc.invalidateQueries({ queryKey: ["poetry-battle", slug] });
  });
  const poems = data?.poems ?? [];
  const entries = data?.entries ?? [];
  if (poems.length === 0) return null;
  const byPoem = new Map(entries.map((e) => [e.mehfil_poem_id, e]));
  const rows = poems.map((p) => ({ p, e: byPoem.get(p.id) })).sort((a, b) => (b.e?.vote_count ?? 0) - (a.e?.vote_count ?? 0));
  const topScore = Math.max(1, rows[0]?.e?.vote_count ?? 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 scroll-mt-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 flex items-center gap-1.5 text-base font-bold text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-4 w-4 text-primary" }),
      " Poetry Entries",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60", children: poems.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: rows.map(({ p, e }, idx) => {
      const rank = idx + 1;
      const votes = e?.vote_count ?? 0;
      const pct = Math.round(votes / topScore * 100);
      const rankColor = rank === 1 ? "text-amber-300" : rank === 2 ? "text-slate-200" : rank === 3 ? "text-orange-400" : "text-white/70";
      const author = p.author;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/50", children: [
        rank === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" }),
          " Leading"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-lg font-black tabular-nums ${rankColor}`, children: [
            "#",
            rank
          ] }),
          author?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: author.avatar_url, alt: "", className: "h-7 w-7 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-full bg-white/10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 truncate text-xs font-semibold text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                "@",
                author?.username ?? "anon"
              ] }),
              author?.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3 w-3 shrink-0 text-sky-400" }),
              author?.country_code && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-[11px]", children: flagFromCode(author.country_code) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-white/50", children: [
              p.writer_rank && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded px-1 py-0.5", style: { background: `${WRITER_RANK_COLOR[p.writer_rank]}22`, color: WRITER_RANK_COLOR[p.writer_rank] }, children: WRITER_RANK_LABEL[p.writer_rank] }),
              p.category && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "· ",
                p.category.name
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/$slug", params: { slug: p.slug }, className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-1 text-sm font-semibold text-white group-hover:text-primary", children: p.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 line-clamp-3 whitespace-pre-line text-xs text-white/70", children: poemPreview(p.body, 180) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all", style: { width: `${pct}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center justify-between text-[10px] text-white/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Score ",
              votes.toLocaleString()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              pct,
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[11px] text-white/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3 text-rose-400" }),
              " ",
              p.upvote_count ?? 0
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
              " ",
              p.read_count ?? 0
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3" }),
              " ",
              p.comment_count ?? 0
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3 w-3" }),
              " ",
              p.share_count ?? 0
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/poetry/$slug",
              params: { slug: p.slug },
              className: "rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-2.5 py-1 text-[10px] font-bold text-white hover:from-fuchsia-400 hover:to-rose-400",
              children: "Open Poetry"
            }
          )
        ] })
      ] }, p.id);
    }) })
  ] });
}
function CompetitionMemesCarousel({
  competitionId,
  competitionSlug,
  nomineeId,
  limit = 10
}) {
  const [memes, setMemes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const data = await listCompetitionMemes({ competitionId, nomineeId, limit });
      if (alive) {
        setMemes(data);
        setLoading(false);
      }
    }
    load();
    const ch = supabase.channel(`comp-memes-${competitionId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts", filter: `competition_id=eq.${competitionId}` },
      () => load()
    ).subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [competitionId, nomineeId, limit]);
  if (loading && memes.length === 0) return null;
  if (!isNavigableSlug(competitionSlug)) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "inline-flex items-center gap-2 text-sm font-black text-white sm:text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Laugh, { className: "h-4 w-4 text-amber-300" }),
        " Trending Battle Memes"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/competitions/$slug/memes",
          params: { slug: competitionSlug },
          search: { nominee: nomineeId ?? "" },
          className: "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
          children: [
            "View all ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
          ]
        }
      )
    ] }),
    memes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-white/60", children: "No memes yet. Post one from the Feed and tag this competition!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1", children: memes.map((m) => {
      const img = (m.media_urls ?? []).find((u) => /\.(jpe?g|png|gif|webp|avif)$/i.test(u)) ?? m.media_urls?.[0];
      const feedSlug = m.slug || m.id;
      const cardClassName = "group relative w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:w-48";
      const cardBody = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        img ? /\.(mp4|webm)$/i.test(img) ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: img, className: "h-40 w-full object-cover sm:h-48", muted: true, playsInline: true }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: "", className: "h-40 w-full object-cover transition group-hover:scale-105 sm:h-48", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-40 w-full place-items-center bg-gradient-to-br from-fuchsia-500/20 to-amber-500/20 p-3 text-center text-xs text-white/80 sm:h-48", children: (m.text || "Meme").slice(0, 120) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] font-semibold text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" }),
            m.reaction_count ?? 0
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3" }),
            m.comment_count ?? 0
          ] })
        ] })
      ] });
      if (!isNavigableSlug(feedSlug)) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClassName, children: cardBody }, m.id);
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/feed/$slug",
          params: { slug: feedSlug },
          className: cardClassName,
          children: cardBody
        },
        m.id
      );
    }) })
  ] });
}
function timeAgo(iso) {
  if (!iso) return "";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 6e4);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function FunZone({
  competitionId,
  competitionSlug
}) {
  const { modules } = useAppSettings();
  const [summary, setSummary] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!modules.funZone) return;
    let alive = true;
    const load = () => loadFunZoneSummary(competitionId).then((s) => {
      if (alive) setSummary(s);
    });
    load();
    const ch = supabase.channel(`fun-zone-${competitionId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts", filter: `competition_id=eq.${competitionId}` },
      () => load()
    ).subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [competitionId, modules.funZone]);
  const enabledCats = reactExports.useMemo(() => FUN_CATEGORIES.filter((c) => {
    if (c === "meme") return modules.funZoneMemes !== false;
    if (c === "fan_art") return modules.funZoneFanArts !== false;
    if (c === "poster") return modules.funZonePosters !== false;
    if (c === "fan_edit") return modules.funZoneFanEdits !== false;
    return true;
  }), [modules]);
  if (!modules.funZone) return null;
  if (enabledCats.length === 0) return null;
  if (!isNavigableSlug(competitionSlug)) return null;
  const perCat = summary?.perCategory;
  const highlights = (summary?.highlights ?? []).filter((h) => enabledCats.includes(h.category));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-transparent p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 grid grid-cols-4 gap-2", children: enabledCats.map((cat) => {
      const meta = FUN_META[cat];
      const entry = perCat?.[cat];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/competitions/$slug/fun/$type",
          params: { slug: competitionSlug, type: meta.slug },
          search: { nominee: "" },
          className: "rounded-xl border border-white/10 bg-black/30 px-2 py-1.5 text-center transition hover:border-white/25",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base leading-none", children: meta.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-sm font-black tabular-nums text-white", children: entry?.count ?? 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-white/60", children: meta.plural })
          ]
        },
        `stat-${cat}`
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "inline-flex items-center gap-2 text-sm font-black text-white sm:text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-4 w-4 text-amber-300" }),
        " Fun Zone"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Community-powered" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: enabledCats.map((cat) => {
      const meta = FUN_META[cat];
      const entry = perCat?.[cat];
      const count = entry?.count ?? 0;
      const thumb = entry?.thumb;
      const isVideo = thumb && /\.(mp4|webm)$/i.test(thumb);
      const badge = entry?.badge ? BADGE_META[entry.badge] : null;
      const empty = count === 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/competitions/$slug/fun/$type",
          params: { slug: competitionSlug, type: meta.slug },
          search: { nominee: "" },
          className: `group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${meta.accent} p-3 transition hover:border-white/25 hover:shadow-lg`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/40", children: [
              thumb ? isVideo ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: thumb, className: "h-full w-full object-cover", muted: true, playsInline: true }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: thumb, alt: meta.plural, className: "h-full w-full object-cover transition group-hover:scale-105", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: meta.emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium leading-snug text-white/70", children: "Be the first fan to support this battle." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-2.5 w-2.5" }),
                  " ",
                  meta.cta
                ] })
              ] }),
              badge && !empty && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `absolute left-2 top-2 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${badge.className}`, children: [
                badge.emoji,
                " ",
                badge.label
              ] }),
              !empty && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-bold uppercase tracking-wider text-white/80", children: [
                count,
                " ",
                count === 1 ? "post" : "posts"
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold text-white", children: [
                meta.emoji,
                " ",
                meta.plural
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 text-white/60 transition group-hover:translate-x-0.5 group-hover:text-white" })
            ] })
          ]
        },
        cat
      );
    }) }),
    highlights.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-fuchsia-300" }),
          " Community Highlights"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-white/50", children: "Top from every category" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: highlights.map((h) => {
        const meta = FUN_META[h.category];
        const media = h.media_urls.find((u) => /\.(jpe?g|png|gif|webp|avif|mp4|webm)$/i.test(u)) ?? h.media_urls[0] ?? null;
        const isVid = media && /\.(mp4|webm)$/i.test(media);
        const permalink = `/feed/${h.slug ?? h.id}`;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: permalink,
            className: "group relative flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 transition hover:border-white/25",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/5] w-full bg-black/50", children: [
                media ? isVid ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: media, className: "h-full w-full object-cover", muted: true, playsInline: true }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: media, alt: "", className: "h-full w-full object-cover transition group-hover:scale-105", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center text-3xl", children: meta.emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm", children: [
                  meta.emoji,
                  " ",
                  meta.label
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-1.5", children: [
                h.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1 text-[11px] font-medium text-white/90", children: h.text }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center justify-between text-[10px] text-white/60", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 tabular-nums", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-2.5 w-2.5" }),
                      h.reaction_count
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-2.5 w-2.5" }),
                      h.comment_count
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: timeAgo(h.created_at) })
                ] })
              ] })
            ]
          },
          h.id
        );
      }) })
    ] })
  ] });
}
function CompetitionDetail() {
  const {
    slug
  } = Route$10.useParams();
  const initial = Route$10.useLoaderData();
  const get = useServerFn(getCompetitionBySlug);
  const getVote = useServerFn(getMyVote);
  const getCompVote = useServerFn(getMyCompetitorVote);
  const join = useServerFn(joinCompetition);
  const leave = useServerFn(leaveCompetition);
  const bumpViews = useServerFn(incrementCompetitionViews);
  const related = useServerFn(listRelatedCompetitions);
  const qc = useQueryClient();
  const {
    user
  } = useAuth();
  const {
    isAdmin
  } = useMyRoles();
  const userId = user?.id ?? null;
  const [editing, setEditing] = reactExports.useState(null);
  const {
    data
  } = useQuery({
    queryKey: ["competition-slug", slug],
    queryFn: () => get({
      data: {
        slug
      }
    }),
    initialData: initial
  });
  const competitionId = data?.competition?.id;
  const {
    data: myVote
  } = useQuery({
    queryKey: ["competition-vote", competitionId, userId],
    queryFn: () => getVote({
      data: {
        competitionId
      }
    }),
    enabled: !!userId && !!competitionId
  });
  const {
    data: myCompetitorVote
  } = useQuery({
    queryKey: ["my-competitor-vote", competitionId, userId],
    queryFn: () => getCompVote({
      data: {
        competitionId
      }
    }),
    enabled: !!userId && !!competitionId
  });
  const {
    data: relatedList = []
  } = useQuery({
    queryKey: ["competition-related", competitionId, data?.competition?.category_id],
    queryFn: () => related({
      data: {
        competitionId,
        categoryId: data?.competition?.category_id ?? null,
        limit: 6
      }
    }),
    enabled: !!competitionId
  });
  reactExports.useEffect(() => {
    if (!competitionId) return;
    const key = `comp-viewed:${competitionId}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      bumpViews({
        data: {
          competitionId
        }
      }).catch(() => {
      });
    }
  }, [competitionId, bumpViews]);
  reactExports.useEffect(() => {
    if (!competitionId) return;
    let t = null;
    const bump = () => {
      if (t) return;
      t = setTimeout(() => {
        t = null;
        qc.invalidateQueries({
          queryKey: ["competition-slug", slug]
        });
      }, 350);
    };
    const ch = supabase.channel(`competition:${competitionId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "competition_votes",
      filter: `competition_id=eq.${competitionId}`
    }, bump).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "competition_participants",
      filter: `competition_id=eq.${competitionId}`
    }, bump).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "competition_competitors",
      filter: `competition_id=eq.${competitionId}`
    }, bump).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "competition_competitor_votes",
      filter: `competition_id=eq.${competitionId}`
    }, bump).subscribe();
    return () => {
      if (t) clearTimeout(t);
      supabase.removeChannel(ch);
    };
  }, [competitionId, slug, qc]);
  const joinM = useMutation({
    mutationFn: () => join({
      data: {
        competitionId
      }
    }),
    onSuccess: () => {
      toast.success("Joined!");
      qc.invalidateQueries({
        queryKey: ["competition-slug", slug]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to join")
  });
  const leaveM = useMutation({
    mutationFn: () => leave({
      data: {
        competitionId
      }
    }),
    onSuccess: () => {
      toast.success("Left");
      qc.invalidateQueries({
        queryKey: ["competition-slug", slug]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed")
  });
  const voteCompetitor = useServerFn(voteForCompetitor);
  const arenaVoteM = useMutation({
    mutationFn: (competitorId) => voteCompetitor({
      data: {
        competitionId,
        competitorId
      }
    }),
    onMutate: async (competitorId) => {
      await qc.cancelQueries({
        queryKey: ["competition-slug", slug]
      });
      const prev = qc.getQueryData(["competition-slug", slug]);
      if (prev?.competitors) {
        const prevMy = myCompetitorVote?.competitorId ?? null;
        const next = prev.competitors.map((cc) => {
          if (cc.id === competitorId) return {
            ...cc,
            vote_count: (cc.vote_count ?? 0) + 1
          };
          if (prevMy && cc.id === prevMy && competitorId !== prevMy) {
            return {
              ...cc,
              vote_count: Math.max(0, (cc.vote_count ?? 0) - 1)
            };
          }
          return cc;
        });
        qc.setQueryData(["competition-slug", slug], {
          ...prev,
          competitors: next
        });
      }
      qc.setQueriesData({
        queryKey: ["my-competitor-vote", competitionId]
      }, {
        competitorId
      });
      return {
        prev
      };
    },
    onSuccess: (_res, competitorId) => {
      toast.success("🔥 Vote counted");
      if (competitionId) {
        const target = competitors.find((cc) => cc.id === competitorId)?.name ?? null;
        supabase.channel(`comp-broadcast:${competitionId}`).send({
          type: "broadcast",
          event: "vote",
          payload: {
            voter: user?.username ?? "Someone",
            target
          }
        }).catch(() => {
        });
      }
      const fire = (particleRatio, opts) => {
        confetti({
          origin: {
            y: 0.6
          },
          particleCount: Math.floor(180 * particleRatio),
          ...opts
        });
      };
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ["#a855f7", "#f43f5e", "#fbbf24"]
      });
      fire(0.2, {
        spread: 60,
        colors: ["#a855f7", "#f43f5e", "#fbbf24"]
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.9,
        colors: ["#a855f7", "#f43f5e", "#fbbf24"]
      });
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["competition-slug", slug], ctx.prev);
      toast.error(e?.message ?? "Failed to vote");
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ["competition-slug", slug]
      });
      qc.invalidateQueries({
        queryKey: ["my-competitor-vote", competitionId]
      });
    }
  });
  if (!data?.competition) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center", children: "Competition not found." });
  }
  const c = data.competition;
  const participants = data.participants;
  const competitors = data.competitors ?? [];
  const {
    modules: appModules
  } = useAppSettings();
  const [nomineeMemeCounts, setNomineeMemeCounts] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!appModules.competitionMemes || !appModules.nomineeMemeTagging) {
      setNomineeMemeCounts({});
      return;
    }
    let alive = true;
    async function load() {
      const {
        countMemesByNominee
      } = await import("./router-CYWPFaDK.mjs").then((n) => n.dG);
      const counts = await countMemesByNominee(c.id);
      if (alive) setNomineeMemeCounts(counts);
    }
    load();
    const ch = supabase.channel(`comp-meme-counts-${c.id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "posts",
      filter: `competition_id=eq.${c.id}`
    }, () => load()).subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [c.id, appModules.competitionMemes, appModules.nomineeMemeTagging]);
  const allAwards = data.awards ?? [];
  const awards = allAwards.filter((a) => !a.award_type && (a.place ?? 0) > 0);
  const funAwards = allAwards.filter((a) => !!a.award_type);
  const category = c.category;
  const iJoined = !!userId && participants.some((p) => p.user_id === userId);
  const approvedParticipants = participants.filter((p) => p.status === "approved");
  const rewards = c.rewards ?? {};
  [rewards.coins ? `${rewards.coins} coins` : null, rewards.xp ? `${rewards.xp} XP` : null, rewards.premium_days ? `${rewards.premium_days}d premium` : null, rewards.badge || null, rewards.custom || null].filter(Boolean);
  const enableVoting = c.enable_voting !== false;
  const enableJoin = c.enable_join !== false;
  c.enable_sharing !== false;
  const hideResults = c.hide_results_until_end === true && c.status !== "completed" ? true : !c.show_live_counts;
  const votingOpen = enableVoting && c.status === "live" && !(c.auto_close_voting !== false && new Date(c.end_at).getTime() < Date.now());
  const url = `${SITE}/competitions/${c.slug}`;
  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: c.name,
          text: c.description ?? "",
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
    }
  };
  const handleReport = async () => {
    if (!userId) {
      toast.error("Sign in to report");
      return;
    }
    const reason = window.prompt("Why are you reporting this competition?");
    if (!reason) return;
    const {
      error
    } = await supabase.from("reports").insert({
      reporter_id: userId,
      target_type: "post",
      target_id: c.id,
      reason: `[competition] ${reason}`
    });
    if (error) toast.error(error.message);
    else toast.success("Reported. Thanks for keeping the community safe.");
  };
  const layoutStyle = c.layout_style ?? "auto";
  const eligibleCount = competitors.filter((cc) => !cc.is_hidden && !cc.is_disqualified).length;
  const resolvedLayout = resolveLayout(layoutStyle, eligibleCount);
  const showBattleArenaHero = resolvedLayout === "vs_battle";
  const sortedCompetitors = [...competitors].filter((cc) => !cc.is_hidden && !cc.is_disqualified).sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  const topLeaderName = sortedCompetitors[0]?.name ?? null;
  const totalCompetitorVotes = sortedCompetitors.reduce((s, cc) => s + (cc.vote_count ?? 0), 0);
  const showPremiumSections = c.status !== "draft";
  const nomineesSection = /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "nominees-section", className: "mt-5 scroll-mt-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-1.5 text-base font-bold text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-amber-400" }),
        " Nominees",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60", children: competitors.length > 0 ? competitors.length : approvedParticipants.length })
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8 text-xs", onClick: () => setEditing(emptyCompetitor(c.id, competitors.length)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
        " Add nominee"
      ] })
    ] }),
    competitors.length > 0 ? resolvedLayout === "leaderboard" && !isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumNomineeCards, { competitionId: c.id, competitionSlug: c.slug, competitors, myVote: myCompetitorVote?.competitorId ?? null, canVote: !!userId && votingOpen, hideCounts: hideResults, invalidateKey: ["competition-slug", slug], memeCounts: nomineeMemeCounts }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DynamicCompetitionLayout, { competitionId: c.id, competitors, layoutStyle, myVote: myCompetitorVote?.competitorId ?? null, canVote: !!userId && votingOpen, hideCounts: hideResults, isAdmin, votingClosed: c.status === "completed" || !votingOpen && c.status !== "upcoming", votingUpcoming: c.status === "upcoming", onEdit: (comp) => setEditing({
      ...comp
    }), invalidateKey: ["competition-slug", slug], suppressVsBattle: showBattleArenaHero }) : approvedParticipants.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantGrid, { competitionId: c.id, participants: approvedParticipants, myVote: myVote?.participantId ?? null, canVote: !!userId && votingOpen, hideCounts: hideResults, invalidateKey: ["competition-slug", slug] }) : c.status === "upcoming" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumEmptyState, { kind: "upcoming" }) : c.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumEmptyState, { kind: "closed" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumEmptyState, { kind: "no-nominees" }),
    competitors.length > 0 && totalCompetitorVotes === 0 && votingOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PremiumEmptyState, { kind: "no-votes" }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen pb-24 text-white", style: {
    background: "radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.18), transparent 60%),radial-gradient(900px 500px at 100% 0%, rgba(245,158,11,0.10), transparent 55%),linear-gradient(180deg, #0F172A 0%, #0B1220 100%)"
  }, children: [
    showPremiumSections && /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingReactions, { competitionId: c.id }),
    showPremiumSections && votingOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(LiveLeaderBanner, { topLeaderName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StickyMobileVoteBar, { canVote: !!userId && votingOpen, hasVoted: !!myCompetitorVote?.competitorId || !!myVote?.participantId, onClick: () => {
      document.getElementById("nominees-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } }),
    showBattleArenaHero && /* @__PURE__ */ jsxRuntimeExports.jsx(BattleArena, { competition: c, competitors, userId, hideCounts: hideResults, votingOpen, onVote: (id) => arenaVoteM.mutate(id), myVote: myCompetitorVote?.competitorId ?? null, onShare: handleShare, onReport: handleReport, isVoting: arenaVoteM.isPending }),
    !showBattleArenaHero && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-violet-500/[0.10] via-white/[0.02] to-transparent px-4 pb-5 pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
        c.status === "live" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-rose-400/60 bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-rose-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" }),
          " Live"
        ] }),
        c.status === "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border-sky-400/50 bg-sky-500/20 text-sky-200 text-[10px]", children: "Upcoming" }),
        c.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border-zinc-400/40 bg-zinc-500/20 text-zinc-200 text-[10px]", children: "Concluded" }),
        category?.name && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-white/20 bg-white/5 text-[10px]", children: category.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200 text-[9px] uppercase tracking-wider", children: resolvedLayout === "podium" ? "Podium" : resolvedLayout === "tournament" ? "Tournament" : "Leaderboard" }),
        showPremiumSections && /* @__PURE__ */ jsxRuntimeExports.jsx(AudienceCounter, { competitionId: c.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1.5 text-xl font-black tracking-tight text-white sm:text-3xl", children: c.name }),
      c.status !== "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-2 text-[11px] text-white/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.status === "live" ? "Ends in" : "Starts in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Countdown, { endAt: c.status === "live" ? c.end_at : c.start_at, compact: true })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-4", children: [
      c.type === "poetry_battle" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PoetryBattleEntries, { slug: c.slug }) : nomineesSection,
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingMemesSlot, { competitionId: c.id, competitionSlug: c.slug }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FunZone, { competitionId: c.id, competitionSlug: c.slug }),
      c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/70", children: c.description }),
      c.rules && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
          " Match Rules"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-white/80", children: c.rules })
      ] }),
      userId && enableJoin && (c.status === "upcoming" || c.status === "live") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: iJoined ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => leaveM.mutate(), disabled: leaveM.isPending, children: "Leave Arena" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => joinM.mutate(), disabled: joinM.isPending, className: "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-sm font-bold text-white hover:from-fuchsia-400 hover:to-rose-400", children: "⚔️ Enter the Arena" }) }),
      showPremiumSections && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TournamentProgress, { startAt: c.start_at, endAt: c.end_at, status: c.status }),
        votingOpen && sortedCompetitors.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BattleIntensityMeter, { competitionId: c.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(VoteMilestones, { totalVotes: totalCompetitorVotes })
        ] }),
        !showBattleArenaHero && sortedCompetitors.length >= 2 && !hideResults && /* @__PURE__ */ jsxRuntimeExports.jsx(HeadToHeadBattle, { competitors: sortedCompetitors, canVote: !!userId && votingOpen, onVote: (id) => arenaVoteM.mutate(id), isVoting: arenaVoteM.isPending, myVote: myCompetitorVote?.competitorId ?? null }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecentSupporters, { competitionId: c.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BattleActivityFeed, { competitionId: c.id, topLeaderName, totalVotes: totalCompetitorVotes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopSupporters, { competitionId: c.id })
      ] }),
      c.status === "completed" && awards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-rose-500/5 p-6 backdrop-blur-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-xl font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5 text-amber-400" }),
          " Winner",
          awards.length > 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: awards.map((a) => {
          const p = participants.find((x) => x.id === a.participant_id);
          const totalVotes = c.total_votes || 1;
          const pct = p ? Math.round(p.vote_count / totalVotes * 100) : 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-black/20 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-14 w-14 ring-2 ring-amber-400/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: a.profile?.avatar_url ?? void 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { style: {
                background: a.profile?.avatar_color ?? void 0
              }, children: (a.profile?.username ?? "?").slice(0, 1).toUpperCase() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "border border-amber-500/50 bg-amber-500/20 text-amber-200", children: [
                  "#",
                  a.place
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: a.profile?.username ?? "Winner" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: p ? `${p.vote_count} votes · ${pct}%` : "—" }),
              a.badge_label && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-amber-300", children: [
                "🏆 ",
                a.badge_label
              ] })
            ] }),
            a.rewards?.coins ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1 text-sm text-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4" }),
              " ",
              a.rewards.coins
            ] }) : null
          ] }, a.id);
        }) })
      ] }),
      c.status === "completed" && (awards.length > 0 || funAwards.length > 0) && isNavigableSlug(c.slug) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/competitions/$slug/recap", params: {
        slug: c.slug
      }, className: "inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-fuchsia-500/10 to-rose-500/20 px-5 py-2 text-sm font-bold text-amber-200 hover:from-amber-500/30 hover:to-rose-500/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-4 w-4" }),
        " View Battle Recap"
      ] }) }),
      c.status === "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-sky-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
          " Voting opens in"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Countdown, { endAt: c.start_at, compact: true })
      ] }),
      c.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm font-semibold backdrop-blur", children: "🏁 Voting Closed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CompetitorEditorDialog, { value: editing, onChange: setEditing, invalidateKey: ["competition-slug", slug] }),
      competitors.length > 0 && approvedParticipants.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-5 grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-2 flex items-center gap-1.5 text-sm font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5 text-amber-400" }),
            " Live Ranking"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TopThree, { participants, hideCounts: hideResults })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-bold", children: "Vote for a contestant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantGrid, { competitionId: c.id, participants, myVote: myVote?.participantId ?? null, canVote: !!userId && votingOpen, hideCounts: hideResults, invalidateKey: ["competition-slug", slug] })
        ] })
      ] }),
      relatedList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 flex items-center gap-2 text-lg font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-amber-400" }),
          " Related competitions"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: relatedList.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(CompetitionCard, { c: r }, r.id)) })
      ] })
    ] })
  ] });
}
function TrendingMemesSlot({
  competitionId,
  competitionSlug
}) {
  const {
    modules
  } = useAppSettings();
  if (!modules.competitionMemes || !modules.trendingMemeSection) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CompetitionMemesCarousel, { competitionId, competitionSlug });
}
export {
  CompetitionDetail as component
};
