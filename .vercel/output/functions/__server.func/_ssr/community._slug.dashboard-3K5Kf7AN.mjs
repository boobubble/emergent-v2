import { j as jsxRuntimeExports } from "../_libs/react.mjs";
const SplitErrorComponent = ({
  reset
}) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Dashboard unavailable" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reset, className: "mt-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground", children: "Retry" })
] }) });
export {
  SplitErrorComponent as errorComponent
};
