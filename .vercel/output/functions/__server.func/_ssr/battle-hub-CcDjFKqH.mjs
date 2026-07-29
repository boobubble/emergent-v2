import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useAuth, b as useServerFn, a3 as listCompetitionsEnriched, a4 as listCategories, a5 as listMyFollowedCompetitions, B as Button, a0 as Input, a6 as shareCompetition, O as isNavigableSlug, a7 as listRecentCompetitionVoters } from "./router-CYWPFaDK.mjs";
import { A as AnimatedCounter } from "./AnimatedCounter-CBMw_qN3.mjs";
import { C as Countdown } from "./Countdown-s9YaTID_.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useMehfilLabel } from "./use-mehfil-label-BWBPC7g6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, Z as Zap, i as Radio, E as Eye, f as Heart, O as Trophy, bd as RefreshCw, a as Sparkles, N as Search, bf as Rows3, aT as LayoutGrid, _ as Clock, F as Flame, l as Star, bg as TrendingUp, aB as Crown, U as Users, Y as Coins, h as MessageCircle, bh as Share2, bi as Bookmark, bj as BadgeCheck } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
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
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
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
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "./mehfil-admin.functions-BntRjkJU.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function prizeValue(rewards) {
  if (!rewards || typeof rewards !== "object") return 0;
  return Number(rewards.coins ?? 0) + Number(rewards.xp ?? 0) * 0.5 + Number(rewards.premium_days ?? 0) * 100;
}
function trendingScore(c) {
  const ageDays = Math.max(1, (Date.now() - new Date(c.start_at).getTime()) / 864e5);
  const recencyBoost = c.status === "live" ? 3 : c.status === "upcoming" ? 1.5 : 0.3;
  return (c.total_votes + c.follower_count * 2) / ageDays * recencyBoost;
}
function BattleHubPage() {
  const {
    user
  } = useAuth();
  const mehfilLabel = useMehfilLabel();
  const qc = useQueryClient();
  const list = useServerFn(listCompetitionsEnriched);
  const cats = useServerFn(listCategories);
  const followedFn = useServerFn(listMyFollowedCompetitions);
  const {
    data: comps = [],
    dataUpdatedAt
  } = useQuery({
    queryKey: ["competitions-enriched", "battle-hub"],
    queryFn: () => list({}),
    refetchInterval: 3e4
  });
  const {
    data: categories = []
  } = useQuery({
    queryKey: ["competition-categories"],
    queryFn: () => cats({})
  });
  const {
    data: followed = []
  } = useQuery({
    queryKey: ["competitions-followed"],
    queryFn: () => followedFn({}),
    enabled: !!user
  });
  reactExports.useEffect(() => {
    let t = null;
    const ch = supabase.channel("battle-hub-votes").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "competition_votes"
    }, () => {
      if (t) return;
      t = setTimeout(() => {
        qc.invalidateQueries({
          queryKey: ["competitions-enriched", "battle-hub"]
        });
        t = null;
      }, 1500);
    }).subscribe();
    return () => {
      if (t) clearTimeout(t);
      supabase.removeChannel(ch);
    };
  }, [qc]);
  const [filter, setFilter] = reactExports.useState("all");
  const [battleCat, setBattleCat] = reactExports.useState("all");
  const [category, setCategory] = reactExports.useState("all");
  const [q, setQ] = reactExports.useState("");
  const [density, setDensity] = reactExports.useState("compact");
  const [lastUpdated, setLastUpdated] = reactExports.useState("just now");
  reactExports.useEffect(() => {
    const tick = () => {
      const s = Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 1e3));
      if (s < 5) setLastUpdated("just now");
      else if (s < 60) setLastUpdated(`${s}s ago`);
      else setLastUpdated(`${Math.floor(s / 60)}m ago`);
    };
    tick();
    const i = setInterval(tick, 5e3);
    return () => clearInterval(i);
  }, [dataUpdatedAt]);
  const arr = comps;
  const followedIds = new Set(followed.map((c) => c.id));
  const filtered = reactExports.useMemo(() => {
    let list2 = arr.slice();
    if (battleCat === "mehfil") list2 = list2.filter((c) => c.type === "poetry_battle");
    else if (battleCat === "competitions") list2 = list2.filter((c) => c.type !== "poetry_battle");
    if (category !== "all") list2 = list2.filter((c) => c.category?.slug === category);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list2 = list2.filter((c) => c.name.toLowerCase().includes(s) || c.category?.name.toLowerCase().includes(s));
    }
    const now = Date.now();
    switch (filter) {
      case "live":
        return list2.filter((c) => c.status === "live");
      case "upcoming":
        return list2.filter((c) => c.status === "upcoming");
      case "ending":
        return list2.filter((c) => c.status === "live" && new Date(c.end_at).getTime() - now < 6 * 36e5).sort((a, b) => new Date(a.end_at).getTime() - new Date(b.end_at).getTime());
      case "featured":
        return list2.filter((c) => c.is_featured && c.status !== "completed");
      case "trending":
        return list2.filter((c) => c.status !== "completed").sort((a, b) => trendingScore(b) - trendingScore(a));
      case "prize":
        return list2.filter((c) => prizeValue(c.rewards) > 0 && c.status !== "completed").sort((a, b) => prizeValue(b.rewards) - prizeValue(a.rewards));
      case "following":
        return list2.filter((c) => followedIds.has(c.id));
      case "finished":
        return list2.filter((c) => c.status === "completed");
      case "all":
      default:
        return list2.sort((a, b) => {
          const rank = (s) => s === "live" ? 0 : s === "upcoming" ? 1 : 2;
          return rank(a.status) - rank(b.status);
        });
    }
  }, [arr, filter, category, q, followedIds, battleCat]);
  const liveCount = arr.filter((c) => c.status === "live").length;
  const totalWatching = arr.reduce((s, c) => s + (c.views_count ?? 0), 0);
  const totalVotes = arr.reduce((s, c) => s + (c.total_votes ?? 0), 0);
  const totalPrize = arr.reduce((s, c) => s + prizeValue(c.rewards), 0);
  const filters = [{
    key: "all",
    label: "All",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" })
  }, {
    key: "live",
    label: "Live",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" })
  }, {
    key: "upcoming",
    label: "Upcoming",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" })
  }, {
    key: "ending",
    label: "Ending Soon",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3" })
  }, {
    key: "featured",
    label: "Featured",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" })
  }, {
    key: "trending",
    label: "Trending",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" })
  }, {
    key: "prize",
    label: "Highest Prize",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" })
  }, {
    key: "following",
    label: "Following",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" })
  }, {
    key: "finished",
    label: "Finished",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" })
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen pb-16 text-white", style: {
    background: "radial-gradient(1200px 600px at 15% -10%, rgba(124,58,237,0.14), transparent 60%),radial-gradient(900px 500px at 100% 0%, rgba(245,158,11,0.08), transparent 60%),radial-gradient(700px 400px at 50% 100%, rgba(236,72,153,0.06), transparent 60%),linear-gradient(180deg, #0F172A 0%, #0B1220 60%, #0A0F1C 100%)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-[1600px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-base font-black tracking-tight sm:text-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-amber-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-violet-300 via-fuchsia-200 to-amber-300 bg-clip-text text-transparent", children: "BATTLE HUB" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold text-rose-300", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-pulse rounded-full bg-rose-400" }),
                " REALTIME"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[11px] text-slate-400", children: "Watch every live competition across the platform in one place" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatPill, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-3 w-3" }), label: "Live Now", value: liveCount, tint: "rose" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatPill, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }), label: "Watching", value: totalWatching, tint: "sky" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatPill, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" }), label: "Votes Today", value: totalVotes, tint: "fuchsia" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatPill, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }), label: "Total Prize", value: totalPrize, tint: "amber" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] font-semibold text-slate-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Updated ",
            lastUpdated
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-white/5 bg-slate-950/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex max-w-[1600px] items-center gap-1 px-4 py-1.5", children: [{
        k: "all",
        label: "All Battles",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" })
      }, {
        k: "competitions",
        label: "Competitions",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" })
      }, {
        k: "mehfil",
        label: mehfilLabel,
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: "📜" })
      }].map((t) => {
        const active = battleCat === t.k;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setBattleCat(t.k), className: `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-all ${active ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-fuchsia-500/15 text-white shadow-[0_0_16px_rgba(245,158,11,0.25)]" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"}`, children: [
          t.icon,
          t.label
        ] }, t.k);
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-white/5 bg-slate-950/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1600px] flex-wrap items-center gap-1.5 px-4 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-wrap gap-1", children: filters.map((f) => {
            const active = filter === f.key;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFilter(f.key), className: `inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${active ? "border-violet-400/50 bg-gradient-to-r from-violet-500/25 to-fuchsia-500/15 text-white shadow-[0_0_16px_rgba(139,92,246,0.30)]" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"}`, children: [
              f.icon,
              f.label
            ] }, f.key);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "h-7 rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-semibold text-slate-200 outline-none hover:border-white/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All categories" }),
              categories.filter((c) => c.enabled).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.slug, children: c.name }, c.id))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search…", className: "h-7 w-40 rounded-full border-white/10 bg-white/[0.04] pl-7 text-[11px] placeholder:text-slate-500" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1600px] items-center justify-between px-4 pb-1.5 pt-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-semibold text-slate-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex overflow-hidden rounded-full border border-white/10 bg-white/[0.03]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDensity("compact"), className: `inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold ${density === "compact" ? "bg-violet-500/25 text-white" : "text-slate-400 hover:text-slate-200"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Rows3, { className: "h-3 w-3" }),
                " Compact"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDensity("expanded"), className: `inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold ${density === "expanded" ? "bg-violet-500/25 text-white" : "text-slate-400 hover:text-slate-200"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-3 w-3" }),
                " Expanded"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-semibold text-slate-500", children: [
            filtered.length,
            " competition",
            filtered.length === 1 ? "" : "s"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-[1600px] px-3 py-3", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center text-sm text-slate-400", children: "No competitions match your filters right now." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: density === "compact" ? "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(ArenaCard, { c }, c.id)) }) })
  ] });
}
function StatPill({
  icon,
  label,
  value,
  tint
}) {
  const tints = {
    rose: "border-rose-400/25 bg-rose-500/10 text-rose-200",
    sky: "border-sky-400/25 bg-sky-500/10 text-sky-200",
    fuchsia: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200",
    amber: "border-amber-400/25 bg-amber-500/10 text-amber-200"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `inline-flex flex-col items-center rounded-xl border px-2.5 py-1 leading-tight ${tints[tint]}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1 text-[12px] font-black", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value, className: "tabular-nums" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8.5px] font-bold uppercase tracking-wider opacity-70", children: label })
  ] });
}
function battleStatus(c) {
  const now = Date.now();
  const endsIn = new Date(c.end_at).getTime() - now;
  if (c.status === "live" && endsIn > 0 && endsIn < 36e5) {
    return {
      label: "⏳ FINAL HOUR",
      className: "border-rose-400/40 bg-gradient-to-r from-rose-500/20 to-orange-500/15 text-rose-200"
    };
  }
  const top = c.top_competitors ?? [];
  const total = top.reduce((s, x) => s + (x.votes ?? 0), 0);
  if (c.status === "live" && total > 0 && top.length >= 2) {
    const leadPct = top[0].votes / total * 100;
    const gap = leadPct - top[1].votes / total * 100;
    if (leadPct >= 70) return {
      label: "👑 DOMINATING",
      className: "border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 text-emerald-200"
    };
    if (gap < 5) return {
      label: "🔥 NECK TO NECK",
      className: "border-orange-400/40 bg-gradient-to-r from-orange-500/20 to-amber-500/15 text-orange-200"
    };
  }
  if (c.status === "live" && (c.total_votes ?? 0) > 100) {
    return {
      label: "⚡ RISING FAST",
      className: "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/15 text-fuchsia-200"
    };
  }
  return null;
}
function ArenaCard({
  c
}) {
  const status = battleStatus(c);
  const top = (c.top_competitors ?? []).slice(0, 3);
  const total = Math.max(1, top.reduce((s, x) => s + (x.votes ?? 0), 0));
  const prize = prizeValue(c.rewards);
  const rankIcons = ["👑", "🥈", "🥉"];
  const shareFn = useServerFn(shareCompetition);
  const onShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/competitions/${c.slug}`;
    try {
      if (navigator.share) await navigator.share({
        title: c.name,
        url
      });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
      shareFn({
        data: {
          competitionId: c.id,
          channel: "web"
        }
      }).catch(() => {
      });
    } catch {
    }
  };
  const barTint = (i) => i === 0 ? "from-amber-400 via-orange-400 to-rose-400" : i === 1 ? "from-fuchsia-400 to-violet-500" : "from-slate-400 to-slate-500";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-950/90 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:shadow-[0_12px_30px_-12px_rgba(139,92,246,0.25)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-1.5 px-2 pt-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-1", children: [
        c.status === "live" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded bg-rose-500 px-1 py-[1px] text-[8px] font-black tracking-wider text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-pulse rounded-full bg-white" }),
          " LIVE"
        ] }),
        c.status === "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-sky-500 px-1 py-[1px] text-[8px] font-black tracking-wider text-white", children: "UPCOMING" }),
        c.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-slate-700 px-1 py-[1px] text-[8px] font-black tracking-wider text-white", children: "ENDED" }),
        c.category && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate rounded border border-white/10 bg-white/[0.04] px-1 py-[1px] text-[8px] font-bold text-slate-300", style: {
          color: c.category.color ?? void 0
        }, children: c.category.name }),
        c.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-0.5 rounded bg-amber-400/95 px-1 py-[1px] text-[8px] font-black text-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-2 w-2" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-1 text-[8px] font-bold text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-2 w-2" }),
        " ",
        formatK(c.views_count ?? 0)
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 px-2 pt-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-[32%] shrink-0 flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/5", children: [
          c.banner_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.banner_url, alt: c.name, className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full bg-gradient-to-br from-violet-900/60 via-fuchsia-900/40 to-amber-900/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" }),
          status && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-1 bottom-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `block truncate rounded border px-1 py-[1px] text-center text-[7.5px] font-black tracking-wider ${status.className}`, children: status.label }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 line-clamp-1 text-[12px] font-black tracking-tight text-white", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1 text-[9px] font-semibold text-slate-400", children: c.category?.name ?? "General" }),
        prize > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-black text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-2.5 w-2.5" }),
          " ",
          prize.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[9px] font-bold text-slate-400", children: c.status !== "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Countdown, { endAt: c.status === "upcoming" ? c.start_at : c.end_at, compact: true }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Finished" }) }),
        c.status !== "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx(CardLiveSupporters, { competitionId: c.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 flex-1 flex-col justify-center gap-1", children: top.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed border-white/10 bg-white/[0.02] py-3 text-center text-[9px] text-slate-500", children: "No nominees yet" }) : top.map((n, i) => {
        const pct = Math.round(n.votes / total * 100);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-[1px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-1.5 text-[9.5px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 shrink-0 text-center text-[10px] leading-none", children: rankIcons[i] }),
              n.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: n.photo_url, alt: "", className: `h-3.5 w-3.5 shrink-0 rounded-full object-cover ring-1 ${i === 0 ? "ring-amber-300/60" : "ring-white/15"}` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `truncate font-bold ${i === 0 ? "text-white" : "text-slate-200"}`, children: n.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 text-[9.5px] font-black tabular-nums text-slate-100", children: [
              pct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 overflow-hidden rounded-full bg-white/[0.05]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full bg-gradient-to-r ${barTint(i)} transition-[width] duration-700 ease-out`, style: {
            width: `${pct}%`
          } }) })
        ] }, n.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-2 py-1 text-[9px] text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-2.5 w-2.5 text-rose-300" }), value: c.total_votes }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-2.5 w-2.5 text-emerald-300" }), value: 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-2.5 w-2.5 text-amber-300" }), value: c.follower_count }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-2.5 w-2.5 text-sky-300" }), value: c.views_count ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-2.5 w-2.5 text-violet-300" }), value: c.total_participants })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 border-t border-white/[0.06] p-1.5", children: [
      isNavigableSlug(c.slug) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/competitions/$slug", params: {
          slug: c.slug
        }, className: "inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 py-1 text-[10px] font-black text-white shadow-md shadow-violet-500/20 transition-transform hover:scale-[1.01]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-2.5 w-2.5" }),
          " ",
          c.status === "live" ? "Vote" : c.status === "upcoming" ? "Preview" : "Result"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions/$slug", params: {
          slug: c.slug
        }, className: "inline-flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/[0.06]", children: "Open" })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onShare, className: "rounded-md border border-white/10 bg-white/[0.03] p-1 text-slate-300 hover:bg-white/[0.06]", title: "Share", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-2.5 w-2.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "rounded-md border border-white/10 bg-white/[0.03] p-1 text-slate-300 hover:bg-white/[0.06]", title: "Bookmark", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "h-2.5 w-2.5" }) })
    ] })
  ] });
}
function MiniStat({
  icon,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums text-slate-200", children: formatK(value ?? 0) })
  ] });
}
function formatK(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
function timeAgoShort(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1e3);
  if (s < 60) return `${s || 1}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function CardLiveSupporters({
  competitionId
}) {
  const fetcher = useServerFn(listRecentCompetitionVoters);
  const {
    data = [],
    refetch
  } = useQuery({
    queryKey: ["arena-card-voters", competitionId],
    queryFn: () => fetcher({
      data: {
        competitionId,
        limit: 30
      }
    }),
    staleTime: 3e4,
    refetchInterval: 6e4
  });
  reactExports.useEffect(() => {
    const ch = supabase.channel(`arena-card:${competitionId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "competition_votes",
      filter: `competition_id=eq.${competitionId}`
    }, () => refetch()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId, refetch]);
  const [, setTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3e4);
    return () => clearInterval(id);
  }, []);
  const voters = data;
  const recent10m = reactExports.useMemo(() => {
    const cutoff = Date.now() - 10 * 6e4;
    return voters.filter((v) => new Date(v.voted_at).getTime() >= cutoff).length;
  }, [voters]);
  const engagement = recent10m > 50 ? {
    label: "⚡ Voting Frenzy",
    cls: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200"
  } : recent10m > 10 ? {
    label: "🔥 Crowd is Active",
    cls: "border-orange-400/40 bg-orange-500/15 text-orange-200"
  } : null;
  if (voters.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 rounded-md border border-dashed border-white/10 bg-white/[0.02] px-1.5 py-1 text-center text-[8px] font-semibold text-slate-400", children: "✨ Be first" });
  }
  const stack = voters.slice(0, 5);
  const extra = Math.max(0, voters.length - stack.length);
  const strip = voters.slice(0, 2);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: stack.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, initial: {
        opacity: 0,
        scale: 0.5,
        x: -8
      }, animate: {
        opacity: 1,
        scale: 1,
        x: 0
      }, exit: {
        opacity: 0,
        scale: 0.5
      }, transition: {
        type: "spring",
        stiffness: 320,
        damping: 24
      }, className: "relative h-4 w-4 shrink-0 overflow-hidden rounded-full border border-slate-900 ring-1 ring-white/10", style: {
        background: v.avatar_color ?? "#334155"
      }, title: v.username ?? "Supporter", children: [
        v.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: v.avatar_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-full w-full items-center justify-center text-[7px] font-black text-white", children: (v.username ?? "?").slice(0, 1).toUpperCase() }),
        v.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 text-sky-400" })
      ] }, `${v.voter_id}-${v.voted_at}`)) }) }),
      extra > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-0.5 text-[8px] font-bold text-slate-400", children: [
        "+",
        extra
      ] })
    ] }),
    engagement && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block rounded-full border px-1 py-[1px] text-[7.5px] font-black tracking-wide ${engagement.cls}`, children: engagement.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-[1px]", children: strip.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-1 text-[8.5px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 items-center gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-bold text-slate-200", children: v.username ?? "Supporter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-slate-500", children: "voted" }),
        v.is_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-2 w-2 shrink-0 text-sky-400" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-[8px] font-semibold text-slate-500", children: timeAgoShort(v.voted_at) })
    ] }, `${v.voter_id}-${v.voted_at}-r`)) }) })
  ] });
}
export {
  BattleHubPage as component
};
