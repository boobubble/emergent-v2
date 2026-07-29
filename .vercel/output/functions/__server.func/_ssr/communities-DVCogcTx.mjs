import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, a9 as listPublicCommunities, aa as searchCommunities, a8 as getDiscoveryStats, a0 as Input, B as Button } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { A as AnimatedCounter } from "./AnimatedCounter-CBMw_qN3.mjs";
import { C as CommunityBadges } from "./CommunityBadges-BE2_BUKN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a as Sparkles, N as Search, U as Users, F as Flame, o as Gamepad2, bm as Music, az as Film, bn as CodeXml, P as Palette, O as Trophy, bo as Laugh, bp as GraduationCap, bq as Briefcase, ak as Mic, i as Radio, f as Heart, br as MapPin, ap as Globe, bg as TrendingUp, _ as Clock, l as Star } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const CATEGORIES = [{
  slug: "gaming",
  label: "Gaming",
  icon: Gamepad2
}, {
  slug: "music",
  label: "Music",
  icon: Music
}, {
  slug: "entertainment",
  label: "Entertainment",
  icon: Film
}, {
  slug: "tech",
  label: "Technology",
  icon: CodeXml
}, {
  slug: "art",
  label: "Art",
  icon: Palette
}, {
  slug: "sports",
  label: "Sports",
  icon: Trophy
}, {
  slug: "memes",
  label: "Memes",
  icon: Laugh
}, {
  slug: "education",
  label: "Education",
  icon: GraduationCap
}, {
  slug: "business",
  label: "Business",
  icon: Briefcase
}, {
  slug: "podcasts",
  label: "Podcasts",
  icon: Mic
}, {
  slug: "radio",
  label: "Radio",
  icon: Radio
}, {
  slug: "lifestyle",
  label: "Lifestyle",
  icon: Heart
}, {
  slug: "regional",
  label: "Regional",
  icon: MapPin
}, {
  slug: "global",
  label: "Global",
  icon: Globe
}];
function DiscoveryPage() {
  const [query, setQuery] = reactExports.useState("");
  const [sort, setSort] = reactExports.useState("trending");
  const [category, setCategory] = reactExports.useState(null);
  const [featuredOnly, setFeaturedOnly] = reactExports.useState(false);
  const listFn = useServerFn(listPublicCommunities);
  const searchFn = useServerFn(searchCommunities);
  const statsFn = useServerFn(getDiscoveryStats);
  const trimmed = query.trim();
  const isSearching = trimmed.length >= 2;
  const {
    data: stats
  } = useQuery({
    queryKey: ["community-discovery-stats"],
    queryFn: () => statsFn(),
    staleTime: 6e4
  });
  const {
    data: featured
  } = useQuery({
    queryKey: ["community-discovery-featured"],
    queryFn: () => listFn({
      data: {
        featuredOnly: true,
        limit: 8,
        sort: "trending"
      }
    }),
    staleTime: 3e4
  });
  const {
    data: list,
    isFetching
  } = useQuery({
    queryKey: ["community-discovery-list", sort, category, featuredOnly, isSearching ? trimmed : ""],
    queryFn: () => isSearching ? searchFn({
      data: {
        q: trimmed,
        category: category ?? void 0,
        limit: 40
      }
    }) : listFn({
      data: {
        sort,
        category: category ?? void 0,
        featuredOnly,
        limit: 60
      }
    }),
    staleTime: 15e3
  });
  const featuredIds = reactExports.useMemo(() => new Set((featured ?? []).map((c) => c.id)), [featured]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-background via-background to-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(1200px_400px_at_50%_-10%,hsl(var(--primary)/0.35),transparent_60%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto max-w-6xl px-4 py-10 sm:py-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mb-3 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
            " Community Discovery"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold tracking-tight sm:text-5xl", children: [
            "Find your ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent", children: "community" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base", children: "Trending creator communities with live chat, feeds, competitions and radio." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-6 max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search communities, tags, creators…", className: "h-12 rounded-full pl-10 pr-4 text-base shadow-lg backdrop-blur", "aria-label": "Search communities" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Communities", value: stats?.total ?? 0, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Members", value: stats?.members ?? 0, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Online now", value: stats?.online ?? 0, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-orange-500" }), live: true })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: "Categories" }),
        category && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setCategory(null), children: "Clear" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: CATEGORIES.map((c) => {
        const Icon = c.icon;
        const active = category === c.slug;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCategory(active ? null : c.slug), className: `group flex snap-start shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-card hover:border-primary/50 hover:bg-accent"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
          c.label
        ] }, c.slug);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Sort:" }),
      ["trending", "newest", "members", "active"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSort(s), disabled: isSearching, className: `rounded-full border px-3 py-1 text-xs capitalize transition ${sort === s && !isSearching ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent disabled:opacity-40"}`, children: [
        s === "trending" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-1 inline h-3 w-3" }),
        s === "newest" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 inline h-3 w-3" }),
        s
      ] }, s)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: featuredOnly, onChange: (e) => setFeaturedOnly(e.target.checked), className: "h-3.5 w-3.5" }),
        "Featured only"
      ] }) })
    ] }) }),
    !isSearching && !featuredOnly && (featured?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-amber-400 text-amber-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide", children: "Featured" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: (featured ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-72 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityCard, { community: c, isFeatured: true }) }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: isSearching ? `Results for "${trimmed}"` : "All communities" }),
        isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Loading…" })
      ] }),
      (list?.length ?? 0) === 0 && !isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground", children: "No communities found. Try clearing filters or searching for something else." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: (list ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityCard, { community: c, isFeatured: featuredIds.has(c.id) }, c.id)) })
    ] })
  ] });
}
function StatCard({
  label,
  value,
  icon,
  live
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card/60 p-3 text-center shadow-sm backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground", children: [
      icon,
      label,
      live && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold sm:text-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value }) })
  ] });
}
function CommunityCard({
  community,
  isFeatured
}) {
  const accent = community.accent_color ?? "hsl(var(--primary))";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/community/$slug", params: {
    slug: community.slug
  }, className: "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl", style: {
    borderTopColor: accent,
    borderTopWidth: 2
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-24 w-full bg-gradient-to-br from-primary/20 to-primary/5", style: community.banner_url ? {
      backgroundImage: `url(${community.banner_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    } : void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityBadges, { c: community, showFeatured: true }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-2 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mt-10 grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-card bg-muted text-lg font-bold shadow", style: community.logo_url ? {
          backgroundImage: `url(${community.logo_url})`,
          backgroundSize: "cover"
        } : {
          background: accent,
          color: "white"
        }, children: !community.logo_url && community.name?.[0]?.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-base font-bold leading-tight", children: community.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-muted-foreground", children: [
            "/",
            community.slug
          ] })
        ] })
      ] }),
      community.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm text-muted-foreground", children: community.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
          (community.member_count ?? 0).toLocaleString()
        ] }),
        (community.online_count ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" }),
          community.online_count.toLocaleString(),
          " online"
        ] }),
        community.category && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: community.category })
      ] })
    ] })
  ] });
}
export {
  DiscoveryPage as component
};
