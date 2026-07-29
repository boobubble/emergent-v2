import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useMehfilLabel } from "./use-mehfil-label-BWBPC7g6.mjs";
import { A as ArrowLeft, H as House, a3 as Swords, O as Trophy, a4 as PenLine } from "../_libs/lucide-react.mjs";
function MehfilShell({ children, showBack = false }) {
  const label = useMehfilLabel();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-background via-background to-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        showBack ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry", className: "rounded-md p-1.5 hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "rounded-md p-1.5 hover:bg-muted", "aria-label": "Home", children: /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "📜" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-xl font-bold tracking-tight", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-[11px] font-medium uppercase tracking-widest text-muted-foreground sm:inline", children: "Poetry Community" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden items-center gap-1 text-sm md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/poetry", activeOptions: { exact: true }, activeProps: { className: "bg-primary/10 text-primary" }, className: "rounded-md px-3 py-1.5 hover:bg-muted", children: "Discover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/challenges", activeProps: { className: "bg-primary/10 text-primary" }, className: "inline-flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3.5 w-3.5" }),
          " Battles"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/poetry/leaderboard", activeProps: { className: "bg-primary/10 text-primary" }, className: "inline-flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }),
          " Leaderboard"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/hall-of-fame", search: { tab: "poetry" }, activeProps: { className: "bg-primary/10 text-primary" }, className: "rounded-md px-3 py-1.5 hover:bg-muted", children: "Hall of Fame" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/poetry/compose",
          className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }),
            " Write"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-6xl px-4 py-6", children })
  ] });
}
export {
  MehfilShell as M
};
