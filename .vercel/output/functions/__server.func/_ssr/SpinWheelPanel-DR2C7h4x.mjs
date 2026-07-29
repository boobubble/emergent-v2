import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as spinDailyWheel } from "./rewards.functions-CJg2mUZV.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { A as ArrowLeft, a as Sparkles } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-H8IXbXWR.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "./app-version-8YDb-xNu.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const SEGMENTS = [
  { label: "+10 🪙", color: "#fbbf24" },
  { label: "+20 🪙", color: "#f59e0b" },
  { label: "+25 ⭐", color: "#a78bfa" },
  { label: "+50 🪙", color: "#fb7185" },
  { label: "+50 ⭐", color: "#22d3ee" },
  { label: "+100 🪙", color: "#f43f5e" }
];
function SpinWheelPanel({ onBack }) {
  const spin = useServerFn(spinDailyWheel);
  const [rotation, setRotation] = reactExports.useState(0);
  const [spinning, setSpinning] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const [done, setDone] = reactExports.useState(false);
  async function onSpin() {
    if (spinning || done) return;
    setSpinning(true);
    setResult(null);
    try {
      const res = await spin();
      if (res.alreadyClaimed) {
        toast.info("You've already spun today — come back tomorrow!");
        setDone(true);
        setSpinning(false);
        return;
      }
      const segIdx = res.prizeIndex % SEGMENTS.length;
      const segAngle2 = 360 / SEGMENTS.length;
      const target = 360 * 5 + (360 - (segIdx * segAngle2 + segAngle2 / 2));
      setRotation(target);
      setTimeout(() => {
        setSpinning(false);
        setDone(true);
        setResult(SEGMENTS[segIdx].label);
        toast.success(`Daily spin: ${SEGMENTS[segIdx].label}`);
      }, 3200);
    } catch (e) {
      setSpinning(false);
      toast.error(e instanceof Error ? e.message : "Spin failed");
    }
  }
  const segAngle = 360 / SEGMENTS.length;
  const gradient = SEGMENTS.map((s, i) => `${s.color} ${i * segAngle}deg ${(i + 1) * segAngle}deg`).join(", ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBack, className: "mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
      " Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-xl font-bold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-violet-500" }),
      " Daily Spin"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "One free spin every day. No purchases, no gambling — just bonus rewards." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid place-items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 -top-2 z-10 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            animate: { rotate: rotation },
            transition: { duration: 3, ease: [0.16, 1, 0.3, 1] },
            className: "relative grid h-64 w-64 place-items-center rounded-full shadow-xl ring-4 ring-border",
            style: { background: `conic-gradient(${gradient})` },
            children: [
              SEGMENTS.map((s, i) => {
                const angle = i * segAngle + segAngle / 2;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "absolute text-xs font-bold text-white drop-shadow",
                    style: {
                      transform: `rotate(${angle}deg) translateY(-90px) rotate(${-angle}deg)`
                    },
                    children: s.label
                  },
                  i
                );
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute h-12 w-12 rounded-full bg-background ring-2 ring-border" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onSpin,
          disabled: spinning || done,
          className: "mt-6 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
          children: spinning ? "Spinning…" : done ? "Come back tomorrow" : "Spin!"
        }
      ),
      result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-bold text-primary", children: [
        "You won ",
        result
      ] })
    ] })
  ] });
}
export {
  SpinWheelPanel
};
