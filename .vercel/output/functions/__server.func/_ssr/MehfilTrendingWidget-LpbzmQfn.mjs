import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useServerFn, aE as getMehfilDiscovery, O as isNavigableSlug } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { p as poemPreview } from "./mehfil-types-okfUX99d.mjs";
import { a as Sparkles, a6 as ChevronRight, a3 as Swords } from "../_libs/lucide-react.mjs";
function MehfilTrendingWidget() {
  const fetchDiscovery = useServerFn(getMehfilDiscovery);
  const { data } = useQuery({
    queryKey: ["mehfil", "trending", "widget"],
    queryFn: () => fetchDiscovery(),
    staleTime: 6e4
  });
  const poems = (data?.sections.find((s) => s.key === "trending")?.poems ?? []).slice(0, 5);
  if (poems.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border/60 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-sm font-bold", children: "🔥 Trending on Poetry Hub" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry", className: "text-xs font-semibold text-primary inline-flex items-center gap-0.5", children: [
        "Explore ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 overflow-x-auto p-3 scrollbar-thin", children: [
      poems.filter((p) => isNavigableSlug(p.slug)).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/poetry/$slug",
          params: { slug: p.slug },
          className: "group shrink-0 w-64 rounded-xl border border-border/60 bg-card p-3 hover:border-primary/50 hover:shadow-md transition",
          style: p.theme ? { background: p.theme } : void 0,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wider text-primary", children: p.category?.name ?? "Poetry" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 line-clamp-2 font-serif text-sm font-bold group-hover:text-primary", children: p.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-3 whitespace-pre-line text-xs text-muted-foreground", children: poemPreview(p.body, 120) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "❤ ",
                p.upvote_count
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "👁 ",
                p.read_count
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                "by ",
                p.author?.display_name || p.author?.username || "Anonymous"
              ] })
            ] })
          ]
        },
        p.id
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/challenges", className: "shrink-0 w-56 rounded-xl border border-dashed border-primary/50 bg-primary/5 p-3 flex flex-col justify-center items-center text-center hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-5 w-5 text-primary mb-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Poetry Battles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Join weekly challenges" })
      ] })
    ] })
  ] });
}
export {
  MehfilTrendingWidget as M
};
