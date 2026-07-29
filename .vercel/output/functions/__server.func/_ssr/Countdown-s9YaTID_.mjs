import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
function diff(target) {
  const t = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(t / 864e5);
  const h = Math.floor(t % 864e5 / 36e5);
  const m = Math.floor(t % 36e5 / 6e4);
  const s = Math.floor(t % 6e4 / 1e3);
  return { d, h, m, s, done: t === 0 };
}
function Countdown({ endAt, compact = false }) {
  const target = new Date(endAt);
  const [t, setT] = reactExports.useState(() => diff(target));
  reactExports.useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1e3);
    return () => clearInterval(id);
  }, [endAt]);
  if (t.done) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Ended" });
  const cells = [
    ["Days", t.d],
    ["Hours", t.h],
    ["Min", t.m],
    ["Sec", t.s]
  ];
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1 text-xs font-mono tabular-nums", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        t.d,
        "d"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        String(t.h).padStart(2, "0"),
        "h"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        String(t.m).padStart(2, "0"),
        "m"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        String(t.s).padStart(2, "0"),
        "s"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: cells.map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-[52px] flex-col items-center rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold tabular-nums", children: String(v).padStart(2, "0") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: l })
  ] }, l)) });
}
export {
  Countdown as C
};
