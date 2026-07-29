import { j as jsxRuntimeExports } from "./_libs/react.mjs";
function PublicPageError({
  reset
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background px-4 text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Page unavailable" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "This page could not be loaded." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reset, className: "mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", children: "Try again" })
  ] }) });
}
export {
  PublicPageError as errorComponent
};
