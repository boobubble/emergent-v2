import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
function AnimatedCounter({
  value,
  duration = 900,
  className
}) {
  const [display, setDisplay] = reactExports.useState(value);
  const fromRef = reactExports.useRef(value);
  const startRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    startRef.current = null;
    let raf = 0;
    const tick = (t) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: display.toLocaleString() });
}
export {
  AnimatedCounter as A
};
