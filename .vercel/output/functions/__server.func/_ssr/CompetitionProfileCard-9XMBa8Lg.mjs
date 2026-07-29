import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { O as isNavigableSlug } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { C as Countdown } from "./Countdown-s9YaTID_.mjs";
import { a as Sparkles, F as Flame, aB as Crown, b$ as Pencil, O as Trophy, U as Users, V as Vote, f as Heart, E as Eye } from "../_libs/lucide-react.mjs";
const statusStyle = {
  live: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  upcoming: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
  draft: "bg-amber-500/20 text-amber-300 border-amber-500/40"
};
function formatNumber(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
function prizeSummary(rewards) {
  if (!rewards || typeof rewards !== "object") return null;
  const parts = [];
  if (rewards.coins) parts.push(`${formatNumber(Number(rewards.coins))} coins`);
  if (rewards.xp) parts.push(`${formatNumber(Number(rewards.xp))} XP`);
  if (rewards.premium_days) parts.push(`${rewards.premium_days}d premium`);
  if (rewards.custom && typeof rewards.custom === "string") parts.push(rewards.custom);
  return parts.length ? parts.join(" · ") : null;
}
function CompetitionProfileCard({ c, onEdit, trending }) {
  const color = c.category?.color ?? "#8b5cf6";
  const prize = prizeSummary(c.rewards);
  const leading = c.top_competitors[0];
  const top3 = c.top_competitors.slice(0, 3);
  const className = "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.5)]";
  const canNavigate = isNavigableSlug(c.slug);
  const body = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative h-36 w-full overflow-hidden",
        style: {
          background: c.banner_url ? `url(${c.banner_url}) center/cover` : `linear-gradient(135deg, ${color}, ${color}80)`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              style: { background: `radial-gradient(circle at 50% 0%, ${color}55, transparent 60%)` }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3 top-3 flex flex-wrap items-center gap-1.5", children: c.category && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-white/30 bg-black/40 text-[10px] uppercase tracking-wide text-white backdrop-blur", children: c.category.name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-3 flex flex-wrap items-center gap-1.5", children: [
            c.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "gap-1 border border-amber-400/50 bg-amber-500/25 text-[10px] font-semibold uppercase text-amber-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-2.5 w-2.5" }),
              " Featured"
            ] }),
            trending && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "gap-1 border border-rose-400/50 bg-rose-500/25 text-[10px] font-semibold uppercase text-rose-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5" }),
              " Trending"
            ] }),
            c.status === "live" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "gap-1 border border-emerald-400/50 bg-emerald-500/25 text-[10px] font-semibold uppercase text-emerald-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" })
              ] }),
              "Live"
            ] }),
            c.status !== "live" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `border text-[10px] uppercase ${statusStyle[c.status]}`, children: c.status }),
            c.is_published === false && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "border border-rose-500/40 bg-rose-500/20 text-[10px] uppercase text-rose-300", children: "Unpublished" })
          ] }),
          leading && c.status !== "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 p-2 backdrop-blur-md", children: [
            leading.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: leading.photo_url, alt: leading.name, className: "h-8 w-8 rounded-full border border-white/30 object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white", children: leading.name?.[0] ?? "?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300/90", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3" }),
                " Leading"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold text-white", children: leading.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-white", children: formatNumber(leading.votes) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase text-white/60", children: "votes" })
            ] })
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
              className: "absolute right-3 bottom-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur hover:bg-black/90",
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
      top3.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2", children: top3.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative h-7 w-7 overflow-hidden rounded-full border-2 border-background",
            style: { zIndex: 10 - i },
            children: [
              t.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: t.photo_url, alt: t.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center bg-white/10 text-[10px] font-bold", children: t.name?.[0] ?? "?" }),
              i === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-0.5 -top-0.5 rounded-full bg-amber-400 p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-2 w-2 text-black" }) })
            ]
          },
          t.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
          "Top ",
          top3.length
        ] })
      ] }),
      prize && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-[11px] font-medium text-amber-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
        " ",
        prize
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-1 text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatNumber(c.total_participants) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatNumber(c.total_votes) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatNumber(c.follower_count) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: formatNumber(c.views_count ?? 0) })
        ] })
      ] }),
      c.status !== "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 text-[10px] uppercase tracking-wider text-muted-foreground", children: c.status === "live" ? "Ends in" : "Starts in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Countdown, { endAt: c.status === "live" ? c.end_at : c.start_at, compact: true })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 p-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground", children: [
        "Ended ",
        new Date(c.end_at).toLocaleDateString()
      ] })
    ] })
  ] });
  if (!canNavigate) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: body });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/competitions/$slug", params: { slug: c.slug }, className, children: body });
}
export {
  CompetitionProfileCard as C
};
