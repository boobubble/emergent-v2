import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { O as isNavigableSlug } from "./router-CYWPFaDK.mjs";
import { p as poemPreview } from "./mehfil-types-okfUX99d.mjs";
import { W as WriterRankBadge } from "./WriterRankBadge-Ct9hdIy_.mjs";
import { a as Sparkles, f as Heart, E as Eye, a3 as Swords, h as MessageCircle } from "../_libs/lucide-react.mjs";
const totalReactions = (p) => (p.upvote_count ?? 0) + (p.reaction_count ?? 0);
function PoemCard({ poem, variant = "default" }) {
  const author = poem.author;
  const displayName = author?.display_name || author?.username || "Anonymous";
  const themeStyle = poem.theme ? { background: poem.theme } : { background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.4) 100%)" };
  const slug = poem.slug;
  const canNavigate = isNavigableSlug(slug);
  const wrap = (className, children) => canNavigate ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry/$slug", params: { slug }, className, children }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children });
  if (variant === "compact") {
    return wrap(
      "group block rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:shadow-md",
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between gap-2", children: [
          poem.category ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              style: { backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" },
              children: poem.category.name
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
          poem.is_editors_pick && /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-amber-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "line-clamp-2 text-sm font-semibold group-hover:text-primary", children: poem.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground", children: poemPreview(poem.body, 100) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            "by ",
            displayName
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" }),
              " ",
              totalReactions(poem)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
              " ",
              poem.read_count
            ] })
          ] })
        ] })
      ] })
    );
  }
  return wrap(
    "group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl",
    /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-5", style: themeStyle, children: [
        poem.competition_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3 w-3" }),
          " Battle"
        ] }),
        poem.category && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            style: { backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" },
            children: poem.category.name
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: `mt-3 font-serif font-bold leading-tight group-hover:text-primary ${variant === "hero" ? "text-2xl" : "text-lg"}`, children: poem.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-2 whitespace-pre-line text-sm text-foreground/80 ${variant === "hero" ? "line-clamp-6" : "line-clamp-4"}`, children: poemPreview(poem.body, variant === "hero" ? 400 : 220) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border/60 bg-card/80 px-5 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          author?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: author.avatar_url, alt: "", className: "h-8 w-8 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary", children: displayName.slice(0, 1).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold", children: displayName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(WriterRankBadge, { rank: poem.writer_rank })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5" }),
            " ",
            totalReactions(poem)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
            " ",
            poem.read_count
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
            " ",
            poem.comment_count
          ] })
        ] })
      ] })
    ] })
  );
}
export {
  PoemCard as P
};
