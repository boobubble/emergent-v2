import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { ae as Card } from "./router-CYWPFaDK.mjs";
import { a6 as ChevronRight } from "../_libs/lucide-react.mjs";
function Collapsible({
  title,
  description,
  defaultOpen = false,
  badge,
  children
}) {
  const [open, setOpen] = reactExports.useState(defaultOpen);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        className: "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/40",
        "aria-expanded": open,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChevronRight,
            {
              className: `h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: title }),
              badge
            ] }),
            description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: description })
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 border-t bg-muted/10 p-4", children })
  ] });
}
export {
  Collapsible as C
};
