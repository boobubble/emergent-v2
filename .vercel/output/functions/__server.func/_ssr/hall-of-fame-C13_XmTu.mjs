import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { ak as Route$2O, b as useServerFn, al as listHallOfFame, am as getMehfilHallOfFame, O as isNavigableSlug, B as Button, a0 as Input } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, O as Trophy, a as Sparkles, bD as Feather, N as Search, l as Star, aB as Crown, F as Flame, ab as ArrowRight, m as Award, bE as Medal } from "../_libs/lucide-react.mjs";
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
const rankStyle = {
  1: {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }),
    color: "from-amber-300 via-yellow-400 to-amber-600",
    label: "Champion",
    ring: "ring-amber-400/50"
  },
  2: {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-4 w-4" }),
    color: "from-slate-200 via-slate-300 to-slate-500",
    label: "Runner Up",
    ring: "ring-slate-300/40"
  },
  3: {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
    color: "from-orange-400 via-amber-500 to-orange-700",
    label: "Third Place",
    ring: "ring-orange-400/40"
  }
};
function formatNumber(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
function relativeTime(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 864e5;
  if (diff < day) return "Today";
  if (diff < day * 2) return "Yesterday";
  if (diff < day * 7) return `${Math.floor(diff / day)} days ago`;
  if (diff < day * 30) return `${Math.floor(diff / (day * 7))} weeks ago`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))} months ago`;
  return `${Math.floor(diff / (day * 365))} years ago`;
}
function HallOfFamePage() {
  const search = Route$2O.useSearch();
  const navigate = Route$2O.useNavigate();
  const [q, setQ] = reactExports.useState("");
  const [chip, setChip] = reactExports.useState(() => {
    if (search.tab === "competitions") return "kind:competition";
    if (search.tab === "poetry") return "kind:poetry";
    return search.filter ?? "all";
  });
  const fetchComp = useServerFn(listHallOfFame);
  const fetchPoetry = useServerFn(getMehfilHallOfFame);
  const compQ = useQuery({
    queryKey: ["hall-of-fame", "competitions"],
    queryFn: () => fetchComp({
      data: {}
    })
  });
  const poetryQ = useQuery({
    queryKey: ["hall-of-fame", "poetry"],
    queryFn: () => fetchPoetry()
  });
  const unified = reactExports.useMemo(() => {
    const rows = [];
    (compQ.data ?? []).forEach((r) => {
      if (!isNavigableSlug(r.competition?.slug)) return;
      rows.push({
        id: `c:${r.id}`,
        kind: "competition",
        year: new Date(r.awarded_at).getFullYear(),
        rank: r.place,
        awardedAt: r.awarded_at,
        profile: r.profile,
        title: r.competition?.name ?? "Competition",
        linkTo: "/competitions/$slug",
        linkParams: {
          slug: r.competition.slug
        },
        category: r.competition?.category ?? null,
        votes: r.winning_votes,
        share: r.winning_share,
        prize: r.rewards?.coins ? `${formatNumber(r.rewards.coins)} coins` : r.rewards?.custom ?? null,
        banner: r.competition?.banner_url ?? null
      });
    });
    (poetryQ.data ?? []).forEach((r) => {
      rows.push({
        id: `p:${r.id}`,
        kind: "poetry",
        year: new Date(r.awarded_at).getFullYear(),
        rank: r.rank,
        awardedAt: r.awarded_at,
        profile: r.profile,
        title: r.poem?.title ?? "Poetry Battle",
        linkTo: r.poem?.slug && isNavigableSlug(r.poem.slug) ? "/poetry/$slug" : "/poetry",
        linkParams: r.poem?.slug && isNavigableSlug(r.poem.slug) ? {
          slug: r.poem.slug
        } : {},
        period: r.period
      });
    });
    return rows.sort((a, b) => +new Date(b.awardedAt) - +new Date(a.awardedAt));
  }, [compQ.data, poetryQ.data]);
  const years = reactExports.useMemo(() => Array.from(new Set(unified.map((r) => r.year))).sort((a, b) => b - a), [unified]);
  const categories = reactExports.useMemo(() => {
    const counts = /* @__PURE__ */ new Map();
    unified.forEach((r) => {
      const name = r.category?.name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name]) => name);
  }, [unified]);
  const filtered = reactExports.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return unified.filter((r) => {
      if (chip === "kind:competition" && r.kind !== "competition") return false;
      if (chip === "kind:poetry" && r.kind !== "poetry") return false;
      if (chip.startsWith("year:") && String(r.year) !== chip.slice(5)) return false;
      if (chip.startsWith("cat:") && r.category?.name !== chip.slice(4)) return false;
      if (needle) {
        const hay = `${r.title} ${r.profile?.username ?? ""} ${r.profile?.display_name ?? ""} ${r.category?.name ?? ""} ${r.year}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [unified, chip, q]);
  const grouped = reactExports.useMemo(() => {
    const buckets = /* @__PURE__ */ new Map();
    const bucketFor = (iso) => {
      const diff = Date.now() - new Date(iso).getTime();
      const day = 864e5;
      if (diff < day) return "Today";
      if (diff < day * 2) return "Yesterday";
      if (diff < day * 7) return "This Week";
      if (diff < day * 30) return "This Month";
      if (diff < day * 365) return "This Year";
      return String(new Date(iso).getFullYear());
    };
    filtered.forEach((r) => {
      const key = bucketFor(r.awardedAt);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(r);
    });
    return Array.from(buckets.entries());
  }, [filtered]);
  const totalChampions = unified.length;
  const compCount = unified.filter((r) => r.kind === "competition").length;
  const poetryCount = unified.filter((r) => r.kind === "poetry").length;
  const yearsActive = years.length;
  const featured = reactExports.useMemo(() => {
    const gold = unified.filter((r) => r.rank === 1);
    const comps = gold.filter((r) => r.kind === "competition");
    const poems = gold.filter((r) => r.kind === "poetry");
    const mix = [];
    const max = Math.max(comps.length, poems.length);
    for (let i = 0; i < max; i++) {
      if (comps[i]) mix.push(comps[i]);
      if (poems[i]) mix.push(poems[i]);
    }
    return mix.slice(0, 10);
  }, [unified]);
  const championOfMonth = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const thisMonth = unified.filter((r) => {
      const d = new Date(r.awardedAt);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    const pool = thisMonth.length > 0 ? thisMonth : unified;
    const gold = pool.filter((r) => r.rank === 1);
    return gold[0] ?? pool[0] ?? null;
  }, [unified]);
  const achievements = reactExports.useMemo(() => {
    const winsByUser = /* @__PURE__ */ new Map();
    unified.forEach((r) => {
      const k = r.profile?.username ?? "unknown";
      const cur = winsByUser.get(k) ?? {
        profile: r.profile,
        count: 0,
        poetry: 0,
        comp: 0,
        gold: 0,
        engagement: 0
      };
      cur.count += 1;
      if (r.kind === "poetry") cur.poetry += 1;
      else cur.comp += 1;
      if (r.rank === 1) cur.gold += 1;
      cur.engagement += r.votes ?? 0;
      winsByUser.set(k, cur);
    });
    const arr = Array.from(winsByUser.values()).filter((v) => v.profile);
    const pick = (key) => arr.slice().sort((a, b) => b[key] - a[key])[0];
    return {
      mostChampionships: pick("gold"),
      mostPoetry: pick("poetry"),
      mostAwards: pick("count"),
      highestEngagement: pick("engagement")
    };
  }, [unified]);
  const isLoading = compQ.isLoading || poetryQ.isLoading;
  const selectChip = (v) => {
    setChip(v);
    navigate({
      search: {
        filter: v === "all" ? void 0 : v
      },
      replace: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen overflow-hidden bg-[#08070d] pb-24 text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.18),_transparent_60%)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -left-32 top-40 h-[320px] w-[320px] rounded-full bg-fuchsia-500/10 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-32 top-96 h-[320px] w-[320px] rounded-full bg-amber-500/10 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-lg font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-400" }),
          " Hall of Fame"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The greatest creators in platform history." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative mx-auto max-w-6xl px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative mb-10 overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-fuchsia-500/10 p-6 shadow-[0_0_60px_-20px_rgba(251,191,36,0.35)] sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
              " Museum of Champions"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl", children: "Hall of Fame" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-lg text-sm text-muted-foreground", children: "The greatest creators in platform history. Competition champions and poetry laureates — enshrined together." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-24 w-24 shrink-0 sm:h-28 sm:w-28", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-[0_0_60px_-5px_rgba(251,191,36,0.7)]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-[3px] flex items-center justify-center rounded-full bg-[#08070d]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-10 w-10 text-amber-300 sm:h-12 sm:w-12" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroStat, { label: "Total Champions", value: totalChampions }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroStat, { label: "Total Awards", value: totalChampions }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroStat, { label: "Competitions", value: compCount, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroStat, { label: "Poetry", value: poetryCount, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroStat, { label: "Years Active", value: yearsActive || 1 })
        ] })
      ] }),
      championOfMonth && /* @__PURE__ */ jsxRuntimeExports.jsx(SpotlightCard, { row: championOfMonth }),
      featured.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex items-end justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-lg font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-amber-300" }),
            " Featured Champions"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Legends across competitions and poetry." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 pb-2", children: featured.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedCard, { row: r }, r.id)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search winners, poems, competitions, categories…", className: "border-white/10 bg-white/[0.03] pl-9 text-sm backdrop-blur-xl" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: chip === "all", onClick: () => selectChip("all"), children: "All" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: chip === "kind:competition", onClick: () => selectChip("kind:competition"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }), accent: "amber", children: "Competition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: chip === "kind:poetry", onClick: () => selectChip("kind:poetry"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-3 w-3" }), accent: "fuchsia", children: "Poetry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 h-4 w-px bg-white/10" }),
          years.slice(0, 5).map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: chip === `year:${y}`, onClick: () => selectChip(`year:${y}`), children: y }, y)),
          categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 h-4 w-px bg-white/10" }),
          categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: chip === `cat:${c}`, onClick: () => selectChip(`cat:${c}`), children: c }, c)),
          (chip !== "all" || q) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            selectChip("all");
            setQ("");
          }, className: "ml-1 rounded-full border border-dashed border-white/15 px-3 py-1 text-xs text-muted-foreground hover:text-foreground", children: "Clear" })
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-muted-foreground", children: "Loading champions…" }) : grouped.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mx-auto mb-2 h-8 w-8 opacity-40" }),
        "No champions match your filters yet."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-10", children: grouped.map(([bucket, rows]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80", children: bucket }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-gradient-to-r from-amber-400/30 via-white/5 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-amber-400/30 text-[10px] text-amber-200", children: [
            rows.length,
            " winner",
            rows.length === 1 ? "" : "s"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChampionCard, { row: r }, r.id)) })
      ] }, bucket)) }),
      !isLoading && unified.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-lg font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-amber-300" }),
            " Achievement Wall"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "All-time records across the platform." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementTile, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }), label: "Most Championships", accent: "from-amber-400 to-yellow-600", profile: achievements.mostChampionships?.profile, value: achievements.mostChampionships?.gold ?? 0, unit: "gold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementTile, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-4 w-4" }), label: "Most Poetry Wins", accent: "from-fuchsia-400 to-purple-600", profile: achievements.mostPoetry?.profile, value: achievements.mostPoetry?.poetry ?? 0, unit: "wins" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementTile, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }), label: "Most Awards", accent: "from-cyan-400 to-blue-600", profile: achievements.mostAwards?.profile, value: achievements.mostAwards?.count ?? 0, unit: "awards" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementTile, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4" }), label: "Highest Engagement", accent: "from-orange-400 to-rose-600", profile: achievements.highestEngagement?.profile, value: achievements.highestEngagement?.engagement ?? 0, unit: "votes" })
        ] })
      ] })
    ] })
  ] });
}
function HeroStat({
  label,
  value,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center backdrop-blur-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 text-lg font-black text-amber-100", children: [
      icon,
      value.toLocaleString()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: label })
  ] });
}
function Chip({
  active,
  onClick,
  children,
  icon,
  accent
}) {
  const accentActive = accent === "amber" ? "border-amber-400/60 bg-amber-500/15 text-amber-200" : accent === "fuchsia" ? "border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-200" : "border-white/25 bg-white/10 text-white";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all ${active ? accentActive : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"}`, children: [
    icon,
    children
  ] });
}
function legendBadges(row) {
  const b = [];
  if (row.rank === 1) b.push({
    label: "Gold Champion",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" }),
    cls: "border-amber-400/60 text-amber-200 bg-amber-500/10"
  });
  if ((row.votes ?? 0) >= 1e3) b.push({
    label: "Community Favorite",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
    cls: "border-fuchsia-400/60 text-fuchsia-200 bg-fuchsia-500/10"
  });
  if ((row.share ?? 0) >= 0.6) b.push({
    label: "Legend",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
    cls: "border-cyan-400/60 text-cyan-200 bg-cyan-500/10"
  });
  return b;
}
function ChampionCard({
  row
}) {
  const style = rankStyle[row.rank] ?? {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4" }),
    color: "from-white/20 to-white/10",
    label: `#${row.rank}`,
    ring: "ring-white/10"
  };
  const kindMeta = row.kind === "poetry" ? {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-3 w-3" }),
    label: "Poetry Champion",
    cls: "border-fuchsia-400/40 text-fuchsia-200 bg-fuchsia-500/10"
  } : {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
    label: "Competition Champion",
    cls: "border-amber-400/40 text-amber-200 bg-amber-500/10"
  };
  const badges = legendBadges(row);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-4 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-amber-400/30 hover:shadow-[0_20px_50px_-20px_rgba(251,191,36,0.3)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${style.color} opacity-20 blur-2xl transition-opacity group-hover:opacity-40` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      row.profile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$username", params: {
        username: row.profile.username ?? ""
      }, className: "relative shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -inset-0.5 rounded-full bg-gradient-to-br ${style.color} opacity-70 blur-sm` }),
        row.profile.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: row.profile.avatar_url, alt: row.profile.username ?? "", className: `relative h-14 w-14 rounded-full border-2 border-white/20 object-cover ring-2 ${style.ring}` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-base font-bold ring-2 ${style.ring}`, children: (row.profile.username ?? "?")[0]?.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${style.color} shadow-lg`, children: style.icon })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-full border-2 border-white/20 bg-white/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `gap-1 ${kindMeta.cls}`, children: [
            kindMeta.icon,
            " ",
            kindMeta.label
          ] }),
          row.category && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", style: {
            borderColor: row.category.color ?? void 0,
            color: row.category.color ?? void 0
          }, children: row.category.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: row.linkTo, params: row.linkParams, className: "mt-1.5 block truncate text-base font-bold text-foreground transition-colors hover:text-amber-200", children: row.kind === "poetry" ? `"${row.title}"` : row.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
          "Won by",
          " ",
          row.profile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$username", params: {
            username: row.profile.username ?? ""
          }, className: "font-semibold text-foreground hover:text-amber-200", children: [
            "@",
            row.profile.username
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Unknown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1.5 text-white/20", children: "•" }),
          relativeTime(row.awardedAt)
        ] }),
        badges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: badges.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[10px] font-medium ${b.cls}`, children: [
          b.icon,
          " ",
          b.label
        ] }, b.label)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground", children: [
        typeof row.votes === "number" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatNumber(row.votes) }),
          " ",
          "votes"
        ] }),
        typeof row.share === "number" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
            (row.share * 100).toFixed(0),
            "%"
          ] }),
          " ",
          "share"
        ] }),
        row.prize && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-200", children: row.prize }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: row.linkTo, params: row.linkParams, className: "inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200", children: [
        "View Legacy ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
      ] })
    ] })
  ] });
}
function FeaturedCard({
  row
}) {
  const style = rankStyle[row.rank] ?? rankStyle[1];
  const kind = row.kind === "poetry" ? {
    label: "Poetry",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-3 w-3" })
  } : {
    label: "Competition",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" })
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: row.linkTo, params: row.linkParams, className: "group relative flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-400/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${style.color} opacity-30 blur-2xl transition-opacity group-hover:opacity-60` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1 border-amber-400/40 text-[10px] text-amber-200", children: [
        kind.icon,
        " ",
        kind.label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${style.color} shadow-lg`, children: style.icon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-2", children: [
      row.profile?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: row.profile.avatar_url, alt: "", className: "h-10 w-10 rounded-full border border-white/20 object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-bold", children: (row.profile?.username ?? "?")[0]?.toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-sm font-bold", children: [
          "@",
          row.profile?.username ?? "unknown"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: style.label })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-3 truncate text-sm font-semibold text-foreground/90", children: row.kind === "poetry" ? `"${row.title}"` : row.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-1 text-[11px] text-muted-foreground", children: relativeTime(row.awardedAt) })
  ] });
}
function AchievementTile({
  icon,
  label,
  profile,
  value,
  unit,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-black`, children: icon }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3 flex items-center gap-3", children: [
      profile?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profile.avatar_url, alt: "", className: "h-10 w-10 rounded-full border border-white/20 object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-bold", children: (profile?.username ?? "?")[0]?.toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        profile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$username", params: {
          username: profile.username ?? ""
        }, className: "block truncate text-sm font-bold hover:text-amber-200", children: [
          "@",
          profile.username
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-muted-foreground", children: "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatNumber(value) }),
          " ",
          unit
        ] })
      ] })
    ] })
  ] });
}
function SpotlightCard({
  row
}) {
  const monthLabel = (/* @__PURE__ */ new Date()).toLocaleString(void 0, {
    month: "long",
    year: "numeric"
  });
  const kind = row.kind === "poetry" ? {
    label: "Poetry Champion",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Feather, { className: "h-3.5 w-3.5" })
  } : {
    label: "Competition Champion",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" })
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative mb-10 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-[#120c05] to-fuchsia-500/10 p-6 shadow-[0_30px_80px_-30px_rgba(251,191,36,0.5)] sm:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/25 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_0deg,rgba(251,191,36,0.08)_60deg,transparent_120deg,rgba(217,70,239,0.08)_240deg,transparent_360deg)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center gap-6 md:flex-row md:items-stretch md:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex shrink-0 flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" }),
          " Champion of ",
          monthLabel
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -inset-4 animate-[spin_18s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,rgba(251,191,36,0.6),transparent_35%,rgba(217,70,239,0.5)_60%,transparent_80%,rgba(251,191,36,0.6))] blur-md opacity-70" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -inset-2 animate-pulse rounded-full bg-amber-400/30 blur-2xl" }),
          row.profile ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: {
            username: row.profile.username ?? ""
          }, className: "relative block", children: row.profile.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: row.profile.avatar_url, alt: row.profile.username ?? "", className: "relative h-28 w-28 rounded-full border-[3px] border-amber-300/70 object-cover shadow-[0_0_40px_-5px_rgba(251,191,36,0.7)] sm:h-32 sm:w-32" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-amber-300/70 bg-gradient-to-br from-amber-400/30 to-fuchsia-500/20 text-3xl font-black text-amber-100 shadow-[0_0_40px_-5px_rgba(251,191,36,0.7)] sm:h-32 sm:w-32", children: (row.profile.username ?? "?")[0]?.toUpperCase() }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 w-28 rounded-full border-[3px] border-amber-300/70 bg-white/10 sm:h-32 sm:w-32" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-2 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-[0_10px_30px_-5px_rgba(251,191,36,0.7)] ring-4 ring-[#120c05] animate-[bounce_2.4s_ease-in-out_infinite]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-6 w-6 text-[#120c05]" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 flex-1 text-center md:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-1.5 md:justify-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1 border-amber-400/50 bg-amber-500/10 text-amber-200", children: [
            kind.icon,
            " ",
            kind.label
          ] }),
          row.category && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", style: {
            borderColor: row.category.color ?? void 0,
            color: row.category.color ?? void 0
          }, children: row.category.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mt-3 bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-2xl font-black leading-tight text-transparent sm:text-3xl", children: [
          "@",
          row.profile?.username ?? "champion"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-amber-100/80", children: [
          row.kind === "poetry" ? "Crowned for " : "Winner of ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: row.linkTo, params: row.linkParams, className: "font-semibold text-amber-200 underline-offset-2 hover:underline", children: row.kind === "poetry" ? `"${row.title}"` : row.title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2 text-center", children: [
          typeof row.votes === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx(SpotlightStat, { label: "Votes", value: formatNumber(row.votes) }),
          typeof row.share === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx(SpotlightStat, { label: "Win Share", value: `${(row.share * 100).toFixed(0)}%` }),
          row.prize && /* @__PURE__ */ jsxRuntimeExports.jsx(SpotlightStat, { label: "Prize", value: row.prize }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SpotlightStat, { label: "Awarded", value: relativeTime(row.awardedAt) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: row.linkTo, params: row.linkParams, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-gradient-to-r from-amber-400 to-yellow-600 font-semibold text-black shadow-[0_10px_30px_-10px_rgba(251,191,36,0.8)] hover:from-amber-300 hover:to-yellow-500", children: [
            "View Legacy ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })
          ] }) }),
          row.profile?.username && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$username", params: {
            username: row.profile.username
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "border-amber-400/40 text-amber-200 hover:bg-amber-500/10", children: "Visit Profile" }) })
        ] })
      ] })
    ] })
  ] });
}
function SpotlightStat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-400/20 bg-black/30 p-2 backdrop-blur-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-bold text-amber-100", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-amber-200/60", children: label })
  ] });
}
export {
  HallOfFamePage as component
};
