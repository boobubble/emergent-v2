import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aG as AdminToggle, ae as Card, af as CardContent, ac as Label, a0 as Input } from "./router-CYWPFaDK.mjs";
function SettingsCard({ title, description, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: description })
    ] }),
    children
  ] }) });
}
function NumberField({ label, value, onChange, min = 0, max, step = 1, hint }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        type: "number",
        value: Number.isFinite(value) ? value : 0,
        min,
        max,
        step,
        onChange: (e) => onChange(Number(e.target.value))
      }
    ),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: hint })
  ] });
}
function ToggleRow({ label, desc, value, onChange, disabled }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
      desc && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs text-muted-foreground", children: desc })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: value, onCheckedChange: onChange, disabled, ariaLabel: label })
  ] });
}
export {
  NumberField as N,
  SettingsCard as S,
  ToggleRow as T
};
