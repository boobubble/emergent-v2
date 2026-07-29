import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useServerFn, aJ as AdminPageHeader, B as Button, ae as Card, ag as CardHeader, ah as CardTitle, af as CardContent } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { S as Skeleton } from "./skeleton-CsqSgU8F.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { aI as Download, O as Trophy, bg as TrendingUp, U as Users, V as Vote, f as Heart, E as Eye, l as Star } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
const Input = objectType({
  window: enumType(["day", "week", "month", "all"]).default("month"),
  creatorId: stringType().uuid().optional()
});
const getCompetitionAnalytics = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((raw) => Input.parse(raw)).handler(createSsrRpc("c76477e20f6378f36f675d09ca2c44cb76f622caebac8e16eb7e80c0c813f7fe"));
function CompetitionAnalyticsPanel() {
  const fetchA = useServerFn(getCompetitionAnalytics);
  const [win, setWin] = reactExports.useState("month");
  const q = useQuery({
    queryKey: ["competition-analytics", win],
    queryFn: () => fetchA({ data: { window: win } }),
    staleTime: 3e4
  });
  const d = q.data;
  const exportCsv = () => {
    if (!d) return;
    const rows = [["Section", "Metric", "Value"]];
    Object.entries(d.counts).forEach(([k, v]) => rows.push(["counts", k, String(v)]));
    Object.entries(d.totals).forEach(([k, v]) => rows.push(["totals", k, String(v)]));
    d.topCompetitions.forEach((c) => rows.push(["top_competitions", c.name, `${c.votes} votes`]));
    d.topNominees.forEach((n) => rows.push(["top_nominees", `${n.username} (${n.competition})`, String(n.vote_count)]));
    d.topCategories.forEach((c) => rows.push(["top_categories", c.name, String(c.votes)]));
    d.trends.forEach((t) => rows.push(["trends", t.day, String(t.count)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competition-analytics-${win}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AdminPageHeader,
      {
        title: "Competition Analytics",
        description: "Aggregate performance across every competition, nominee, and category.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          ["day", "week", "month", "all"].map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: win === w ? "default" : "outline", onClick: () => setWin(w), children: w === "all" ? "All time" : w === "day" ? "24h" : w === "week" ? "7d" : "30d" }, w)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: exportCsv, disabled: !d, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            " CSV"
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Trophy, label: "Total", value: d?.counts.total, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: TrendingUp, label: "Live", value: d?.counts.active, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Trophy, label: "Upcoming", value: d?.counts.upcoming, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Trophy, label: "Completed", value: d?.counts.completed, loading: q.isLoading })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Nominees", value: d?.totals.nominees, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Vote, label: "Total votes", value: d?.totals.votes, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Unique voters", value: d?.totals.uniqueVoters, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Heart, label: "Followers", value: d?.totals.followers, loading: q.isLoading })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Eye, label: "Total views", value: d?.totals.views, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Vote, label: `Votes (${win})`, value: d?.totals.votesInWindow, loading: q.isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Star, label: "Featured", value: d?.counts.featured, loading: q.isLoading })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Vote trend (30d)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { data: (d?.trends ?? []).map((t) => ({ label: t.day.slice(5), value: t.count })) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Top competitions (all-time votes)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BarList, { items: (d?.topCompetitions ?? []).map((c) => ({ label: c.name, value: c.votes, href: `/competitions/${c.slug ?? c.id}` })) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm", children: [
          "Fastest growing (",
          win,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BarList, { items: (d?.fastestGrowing ?? []).map((c) => ({ label: c.name, value: c.votesInWindow, href: `/competitions/${c.slug ?? c.id}` })) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Most viewed" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BarList, { items: (d?.mostViewed ?? []).map((c) => ({ label: c.name, value: c.views, href: `/competitions/${c.slug ?? c.id}` })) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Top nominees" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BarList, { items: (d?.topNominees ?? []).map((n) => ({ label: `${n.username} — ${n.competition}`, value: n.vote_count })) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Top categories" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BarList, { items: (d?.topCategories ?? []).map((c) => ({ label: c.name, value: c.votes })) }) })
      ] })
    ] })
  ] });
}
function Stat({ icon: Icon, label, value, loading }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-12" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl font-semibold tabular-nums", children: value ?? 0 })
  ] }) });
}
function Sparkline({ data }) {
  if (!data.length) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No data." });
  const w = 320, h = 96, pad = 6;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => `${pad + i * step},${h - pad - d.value / max * (h - pad * 2)}`).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: `0 0 ${w} ${h}`, className: "h-28 w-full", preserveAspectRatio: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { fill: "none", stroke: "hsl(var(--primary))", strokeWidth: "2", points }) });
}
function BarList({ items }) {
  if (!items.length) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No data." });
  const max = Math.max(1, ...items.map((i) => i.value));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: items.map((i, idx) => {
    const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: i.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-muted-foreground", children: i.value })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 h-1.5 w-full rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-primary", style: { width: `${i.value / max * 100}%` } }) })
    ] });
    return i.href ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: i.href, className: "block hover:opacity-80", children: inner }, idx) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: inner }, idx);
  }) });
}
export {
  CompetitionAnalyticsPanel as C
};
