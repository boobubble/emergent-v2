import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { cR as Route$V, a as useAuth, b as useServerFn, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { L as LUDO_SEATS_FOR_TYPE, i as initLudoState, c as SEAT_NAMES, S as SEAT_COLORS, d as SAFE_SQUARES, t as tokenCanMove, T as TOKENS_PER_PLAYER, e as LUDO_TRACK_LEN, H as HOME_POS, f as SEAT_START_SQ, g as trackSquareFor } from "./games-engine-CmrX_RAC.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { a as Sparkles, A as ArrowLeft, q as LogOut, c as Plus, cK as Dice5, U as Users, O as Trophy } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { o as objectType, s as stringType, n as numberType, e as enumType, b as booleanType } from "../_libs/zod.mjs";
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
import "tslib";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const TRACK = [
  // bottom-left arm (left edge of bottom-left base) → going right along middle-left row
  { c: 1, r: 6 },
  { c: 2, r: 6 },
  { c: 3, r: 6 },
  { c: 4, r: 6 },
  { c: 5, r: 6 },
  // 0..4  (blue start at 0)
  // up the left side of top arm
  { c: 6, r: 5 },
  { c: 6, r: 4 },
  { c: 6, r: 3 },
  { c: 6, r: 2 },
  { c: 6, r: 1 },
  { c: 6, r: 0 },
  // 5..10
  // across the top
  { c: 7, r: 0 },
  { c: 8, r: 0 },
  // 11, 12
  // down the right side of top arm
  { c: 8, r: 1 },
  { c: 8, r: 2 },
  { c: 8, r: 3 },
  { c: 8, r: 4 },
  { c: 8, r: 5 },
  // 13..17  (red/top start = 13)
  // across the top of right arm
  { c: 9, r: 6 },
  { c: 10, r: 6 },
  { c: 11, r: 6 },
  { c: 12, r: 6 },
  { c: 13, r: 6 },
  { c: 14, r: 6 },
  // 18..23
  // down the right edge
  { c: 14, r: 7 },
  { c: 14, r: 8 },
  // 24, 25
  // back left across bottom of right arm
  { c: 13, r: 8 },
  { c: 12, r: 8 },
  { c: 11, r: 8 },
  { c: 10, r: 8 },
  { c: 9, r: 8 },
  // 26..30  (1v1 seat-1 start = 26)
  // down right side of bottom arm
  { c: 8, r: 9 },
  { c: 8, r: 10 },
  { c: 8, r: 11 },
  { c: 8, r: 12 },
  { c: 8, r: 13 },
  { c: 8, r: 14 },
  // 31..36
  // across the bottom
  { c: 7, r: 14 },
  { c: 6, r: 14 },
  // 37, 38
  // up the left side of bottom arm
  { c: 6, r: 13 },
  { c: 6, r: 12 },
  { c: 6, r: 11 },
  { c: 6, r: 10 },
  { c: 6, r: 9 },
  // 39..43
  // across the bottom of left arm
  { c: 5, r: 8 },
  { c: 4, r: 8 },
  { c: 3, r: 8 },
  { c: 2, r: 8 },
  { c: 1, r: 8 },
  { c: 0, r: 8 },
  // 44..49
  // up the left edge to start
  { c: 0, r: 7 },
  { c: 0, r: 6 }
  // 50, 51
];
const HOME_COL = {
  0: [
    // blue, enters along row 7 from left
    { c: 1, r: 7 },
    { c: 2, r: 7 },
    { c: 3, r: 7 },
    { c: 4, r: 7 },
    { c: 5, r: 7 },
    { c: 6, r: 7 }
  ],
  1: [
    // red (1v1 opposite), enters along row 7 from right
    { c: 13, r: 7 },
    { c: 12, r: 7 },
    { c: 11, r: 7 },
    { c: 10, r: 7 },
    { c: 9, r: 7 },
    { c: 8, r: 7 }
  ],
  2: [
    // green (top, for 4-player back-compat), enters along col 7 from top
    { c: 7, r: 1 },
    { c: 7, r: 2 },
    { c: 7, r: 3 },
    { c: 7, r: 4 },
    { c: 7, r: 5 },
    { c: 7, r: 6 }
  ],
  3: [
    // amber (bottom, 4p), enters along col 7 from bottom
    { c: 7, r: 13 },
    { c: 7, r: 12 },
    { c: 7, r: 11 },
    { c: 7, r: 10 },
    { c: 7, r: 9 },
    { c: 7, r: 8 }
  ]
};
const BASE_BOX = {
  0: { c0: 0, r0: 0 },
  // top-left  (blue)
  1: { c0: 9, r0: 9 },
  // bottom-right (red)
  2: { c0: 9, r0: 0 },
  // top-right (green, 4p)
  3: { c0: 0, r0: 9 }
  // bottom-left (amber, 4p)
};
function parkingSlot(seat, idx) {
  const box = BASE_BOX[seat] ?? BASE_BOX[0];
  const dx = idx % 2 === 0 ? 1.5 : 3.5;
  const dy = idx < 2 ? 1.5 : 3.5;
  return { c: box.c0 + dx, r: box.r0 + dy };
}
function tokenScreenXY(seat, pos, cell, pad) {
  if (pos === 0) {
    const p = parkingSlot(seat, 0);
    return { c: pad + p.c * cell + cell / 2, r: pad + p.r * cell + cell / 2 };
  }
  if (pos >= 1 && pos <= LUDO_TRACK_LEN) {
    const abs = trackSquareFor(seat, pos);
    const sq = TRACK[abs];
    return { c: pad + sq.c * cell + cell / 2, r: pad + sq.r * cell + cell / 2 };
  }
  if (pos > LUDO_TRACK_LEN && pos <= HOME_POS) {
    const homeIdx = pos - LUDO_TRACK_LEN - 1;
    const col = HOME_COL[seat] ?? HOME_COL[0];
    const sq = col[Math.min(homeIdx, col.length - 1)];
    return { c: pad + sq.c * cell + cell / 2, r: pad + sq.r * cell + cell / 2 };
  }
  return { c: pad, r: pad };
}
function LudoBoard({ state, mySeat, currentTurnSeat, seats, onMoveToken, pending }) {
  const CELL = 28;
  const PAD = 6;
  const SIZE = 15 * CELL + PAD * 2;
  const die = state.dice;
  const myTurn = mySeat != null && mySeat === currentTurnSeat;
  const buckets = {};
  for (let s = 0; s < seats; s++) {
    const arr = state.tokens[String(s)] || [];
    arr.forEach((pos, idx) => {
      const keyPos = pos === 0 ? `base-${s}-${idx}` : `pos-${s}-${pos}`;
      buckets[keyPos] = buckets[keyPos] || [];
      buckets[keyPos].push({ seat: s, idx, pos, key: `t-${s}-${idx}` });
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        viewBox: `0 0 ${SIZE} ${SIZE}`,
        className: "mx-auto block max-w-full",
        style: { width: "100%", height: "auto", maxWidth: 520 },
        role: "img",
        "aria-label": "Ludo board",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: "centerGrad", cx: "50%", cy: "50%", r: "60%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#fef3c7" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#f59e0b" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: 0, y: 0, width: SIZE, height: SIZE, rx: 14, className: "fill-card stroke-border", strokeWidth: 1 }),
          [0, 1, 2, 3].filter((s) => s < Math.max(seats, 2)).map((s) => {
            const box = BASE_BOX[s];
            const color = SEAT_COLORS[s];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "rect",
                {
                  x: PAD + box.c0 * CELL,
                  y: PAD + box.r0 * CELL,
                  width: 6 * CELL,
                  height: 6 * CELL,
                  rx: 10,
                  fill: color,
                  opacity: 0.18,
                  stroke: color,
                  strokeWidth: 2
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "rect",
                {
                  x: PAD + (box.c0 + 1) * CELL,
                  y: PAD + (box.r0 + 1) * CELL,
                  width: 4 * CELL,
                  height: 4 * CELL,
                  rx: 8,
                  className: "fill-card",
                  stroke: color,
                  strokeWidth: 1.5
                }
              ),
              [0, 1, 2, 3].map((i) => {
                const p = parkingSlot(s, i);
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    cx: PAD + p.c * CELL,
                    cy: PAD + p.r * CELL,
                    r: CELL * 0.55,
                    fill: "white",
                    stroke: color,
                    strokeWidth: 1.5,
                    opacity: 0.95
                  },
                  i
                );
              })
            ] }, `base-${s}`);
          }),
          TRACK.map((sq, i) => {
            const isSafe = SAFE_SQUARES.has(i);
            const startSeat = SEAT_START_SQ.findIndex((s) => s === i);
            const startTint = startSeat >= 0 && startSeat < seats ? SEAT_COLORS[startSeat] : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "rect",
                {
                  x: PAD + sq.c * CELL + 1,
                  y: PAD + sq.r * CELL + 1,
                  width: CELL - 2,
                  height: CELL - 2,
                  rx: 4,
                  fill: startTint ?? (isSafe ? "#fde68a" : "#ffffff"),
                  opacity: startTint ? 0.55 : isSafe ? 0.85 : 1,
                  className: "stroke-border",
                  strokeWidth: 0.75
                }
              ),
              isSafe && !startTint && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "text",
                {
                  x: PAD + sq.c * CELL + CELL / 2,
                  y: PAD + sq.r * CELL + CELL / 2 + 4,
                  textAnchor: "middle",
                  fontSize: 12,
                  className: "fill-amber-700",
                  children: "★"
                }
              )
            ] }, `tr-${i}`);
          }),
          [0, 1, 2, 3].filter((s) => s < Math.max(seats, 2)).map((s) => {
            const col = HOME_COL[s];
            const color = SEAT_COLORS[s];
            return /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: col.map((sq, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: PAD + sq.c * CELL + 1,
                y: PAD + sq.r * CELL + 1,
                width: CELL - 2,
                height: CELL - 2,
                rx: 4,
                fill: color,
                opacity: 0.35,
                stroke: color,
                strokeWidth: 0.75
              },
              i
            )) }, `hc-${s}`);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "polygon",
            {
              points: `${PAD + 6 * CELL},${PAD + 6 * CELL} ${PAD + 9 * CELL},${PAD + 6 * CELL} ${PAD + 9 * CELL},${PAD + 9 * CELL} ${PAD + 6 * CELL},${PAD + 9 * CELL}`,
              fill: "url(#centerGrad)",
              stroke: "#f59e0b",
              strokeWidth: 1.5
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "text",
            {
              x: PAD + 7.5 * CELL,
              y: PAD + 7.5 * CELL + 5,
              textAnchor: "middle",
              fontSize: 18,
              className: "fill-amber-900",
              children: "🏁"
            }
          ),
          Object.entries(buckets).flatMap(
            ([bucketKey, arr]) => arr.map((t, i) => {
              let cx, cy;
              if (t.pos === 0) {
                const p = parkingSlot(t.seat, t.idx);
                cx = PAD + p.c * CELL;
                cy = PAD + p.r * CELL;
              } else {
                const xy = tokenScreenXY(t.seat, t.pos, CELL, PAD);
                const off = (i - (arr.length - 1) / 2) * 7;
                cx = xy.c + off;
                cy = xy.r;
              }
              const isMine = t.seat === mySeat;
              const movable = myTurn && isMine && die != null && tokenCanMove(state, t.seat, t.idx, die) && !pending;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.g,
                {
                  layoutId: t.key,
                  onClick: movable ? () => onMoveToken(t.idx) : void 0,
                  style: { cursor: movable ? "pointer" : "default" },
                  whileHover: movable ? { scale: 1.18 } : void 0,
                  animate: { cx, cy },
                  transition: { type: "spring", stiffness: 260, damping: 24 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.circle,
                      {
                        cx,
                        cy,
                        r: CELL * 0.38,
                        fill: SEAT_COLORS[t.seat],
                        stroke: "white",
                        strokeWidth: 2,
                        style: {
                          filter: movable ? `drop-shadow(0 0 8px ${SEAT_COLORS[t.seat]})` : "drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
                        }
                      }
                    ),
                    movable && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.circle,
                      {
                        cx,
                        cy,
                        r: CELL * 0.38,
                        fill: "none",
                        stroke: SEAT_COLORS[t.seat],
                        strokeWidth: 2,
                        initial: { scale: 1, opacity: 0.8 },
                        animate: { scale: 1.6, opacity: 0 },
                        transition: { duration: 1.1, repeat: Infinity, ease: "easeOut" }
                      }
                    )
                  ]
                },
                t.key
              );
            })
          )
        ]
      }
    ) }),
    mySeat != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid w-full grid-cols-4 gap-1.5 sm:gap-2", children: Array.from({ length: TOKENS_PER_PLAYER }, (_, idx) => {
      const pos = state.tokens[String(mySeat)]?.[idx] ?? 0;
      const canMove = myTurn && die != null && tokenCanMove(state, mySeat, idx, die) && !pending;
      const isHome = pos >= HOME_POS;
      const status = isHome ? "🏁" : pos === 0 ? "Base" : pos > LUDO_TRACK_LEN ? `H${pos - LUDO_TRACK_LEN}` : `${pos}`;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          disabled: !canMove,
          onClick: () => onMoveToken(idx),
          className: "rounded-lg border-2 bg-card px-1.5 py-1.5 text-xs font-semibold text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105",
          style: {
            borderColor: SEAT_COLORS[mySeat],
            boxShadow: canMove ? `0 0 12px ${SEAT_COLORS[mySeat]}` : void 0
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "inline-block h-2.5 w-2.5 rounded-full",
                style: { background: SEAT_COLORS[mySeat] }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: status })
          ] })
        },
        idx
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: die != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { scale: 0.6, opacity: 0, y: -6 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0 },
        transition: { type: "spring", stiffness: 320, damping: 18 },
        className: "rounded-xl border border-border bg-card px-3 py-1.5 text-center text-xs font-medium text-muted-foreground shadow-sm",
        children: [
          "🎲 ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: die }),
          " — tap a glowing token to move"
        ]
      },
      `die-${state.rollSeq}-${die}`
    ) })
  ] });
}
const createLudoMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  type: enumType(["ludo_1v1", "ludo_4p"]),
  visibility: enumType(["public", "private"]).default("private")
}).parse(input)).handler(createSsrRpc("cd4166158dfa889a61bbe2d625174c679b8fc908e5b4f3644d160e3909255691"));
const joinQuickMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  type: enumType(["ludo_1v1", "ludo_4p"])
}).parse(input)).handler(createSsrRpc("eed1a7beeda13b4a04f01404389fc5b6b3d5984b0f4481ffd2f0c0701f5f09de"));
const inviteToGame = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid(),
  receiverId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("49cc98ca68bbc66d95e39195311e383f06e5b326a7f4d663d7c0f14dea45a0bc"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  inviteId: stringType().uuid(),
  accept: booleanType()
}).parse(input)).handler(createSsrRpc("22cffefac94963a228668e2408c63722795aaf6ff9a0ae2d926921298874f9bb"));
const rollDice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("def86cf4221a567a0df4b29ba809cef73663b77fcf06f76656fc2857e33c4d0f"));
const moveToken = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid(),
  tokenIndex: numberType().int().min(0).max(3)
}).parse(input)).handler(createSsrRpc("71677cf95649820521dba41c3d1c40a14d6abfae7bd67abbe7faa598960a35b1"));
const leaveGame = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).inputValidator((input) => objectType({
  gameId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("c40f74d1a45590fdf525f74684e4f6e44cf523aa76a14f23fd4706087ee9d02d"));
const listMyGames = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).handler(createSsrRpc("4d00427dbed1e2194bf1b9907d21b2093afbfe89d10306de3cebf8e73ecd8aa6"));
const listLeaderboard = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("game.write")]).handler(createSsrRpc("3902176137028063880e5342df75791c99dfbc86370baf92b68e6f6430078c79"));
function InviteFriendsDialog({ open, onClose, gameId }) {
  const { user } = useAuth();
  const [friends, setFriends] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [inviting, setInviting] = reactExports.useState(null);
  const invite = useServerFn(inviteToGame);
  reactExports.useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      const { data: friendships } = await supabase.from("friendships").select("sender_id, receiver_id, status").eq("status", "accepted").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const friendIds = (friendships ?? []).map((f) => f.sender_id === user.id ? f.receiver_id : f.sender_id);
      if (friendIds.length === 0) {
        const { data: recent } = await supabase.from("profiles").select("id, username, avatar_url, avatar_color").neq("id", user.id).order("last_seen", { ascending: false }).limit(15);
        if (!cancelled) setFriends(recent ?? []);
        return;
      }
      const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_url, avatar_color").in("id", friendIds);
      if (!cancelled) setFriends(profiles ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user]);
  async function handleInvite(receiverId) {
    if (!gameId) return;
    setInviting(receiverId);
    try {
      await invite({ data: { gameId, receiverId } });
      toast.success("Invite sent");
    } catch (e) {
      toast.error(e.message || "Failed to invite");
    } finally {
      setInviting(null);
    }
  }
  const filtered = friends.filter((f) => f.username.toLowerCase().includes(search.toLowerCase()));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Invite to Ludo" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: search,
        onChange: (e) => setSearch(e.target.value),
        placeholder: "Search friends…",
        className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-72 space-y-1 overflow-y-auto", children: [
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: "No one to invite yet." }),
      filtered.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg p-2 hover:bg-white/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "grid h-9 w-9 place-items-center overflow-hidden rounded-full text-sm font-bold text-white",
            style: { background: f.avatar_color },
            children: f.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: f.avatar_url, alt: f.username, className: "h-full w-full object-cover" }) : f.username[0]?.toUpperCase()
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1 truncate text-sm font-medium", children: f.username }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleInvite(f.id),
            disabled: inviting === f.id,
            className: "rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50",
            children: inviting === f.id ? "…" : "Invite"
          }
        )
      ] }, f.id))
    ] })
  ] }) });
}
function GamesPage() {
  const {
    id: gameIdFromUrl
  } = Route$V.useSearch();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  if (!user || user.isGuest) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mx-auto mb-3 h-8 w-8 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Sign in to play" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Create a free account to play Ludo, earn XP and climb the leaderboard." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground", children: "Back" })
    ] }) });
  }
  if (gameIdFromUrl) return /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveGameView, { gameId: gameIdFromUrl, onLeave: () => navigate({
    to: "/games/ludo",
    search: {
      id: void 0
    }
  }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GamesLobby, { userId: user.id, onOpenGame: (id) => navigate({
    to: "/games/ludo",
    search: {
      id
    }
  }) });
}
function GamesLobby({
  userId,
  onOpenGame
}) {
  const create = useServerFn(createLudoMatch);
  const quick = useServerFn(joinQuickMatch);
  const myGames = useServerFn(listMyGames);
  const leaderboard = useServerFn(listLeaderboard);
  const [myGameRows, setMyGameRows] = reactExports.useState([]);
  const [board, setBoard] = reactExports.useState([]);
  const [invitingGameId, setInvitingGameId] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  async function reload() {
    const [g, lb] = await Promise.all([myGames(), leaderboard()]);
    setMyGameRows(g.rows);
    setBoard(lb.rows);
  }
  reactExports.useEffect(() => {
    reload();
  }, []);
  reactExports.useEffect(() => {
    const ch = supabase.channel(`my-games-${userId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "game_players",
      filter: `user_id=eq.${userId}`
    }, reload).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "games"
    }, reload).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId]);
  async function handleStartPrivate(type) {
    setBusy(true);
    try {
      const {
        gameId
      } = await create({
        data: {
          type,
          visibility: "private"
        }
      });
      setInvitingGameId(gameId);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function handleQuickMatch() {
    setBusy(true);
    try {
      const {
        gameId
      } = await quick({
        data: {
          type: "ludo_1v1"
        }
      });
      onOpenGame(gameId);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "rounded-full p-2 hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold leading-tight", children: "Games" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Realtime multiplayer · Earn XP & coins" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-6 px-4 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleQuickMatch, disabled: busy, className: "group flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-primary/5 p-4 text-left transition-all hover:scale-[1.02] hover:border-primary disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dice5, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: "Quick Match" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Auto-find a 1v1 opponent" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleStartPrivate("ludo_1v1"), disabled: busy, className: "group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: "Invite · 2 Players" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Private 1v1 with a friend" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleStartPrivate("ludo_4p"), disabled: busy, className: "group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: "Invite · 4 Players" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Private 4-player Ludo party" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground", children: "Your Matches" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reload, className: "text-xs text-muted-foreground hover:text-foreground", children: "Refresh" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          myGameRows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground", children: "No matches yet — start one above!" }),
          myGameRows.map((r) => {
            const g = r.games;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onOpenGame(g.id), className: "flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 text-left hover:border-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
                  "Ludo · ",
                  g.game_type.replace("ludo_", "")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: g.status === "waiting" ? "Waiting for opponent" : g.status === "active" ? "In progress" : g.status === "finished" ? g.winner_id === userId ? "🏆 You won" : "Finished" : "Cancelled" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase text-primary", children: "Open →" })
            ] }, g.id);
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground", children: "Top Players · 7d" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 rounded-xl border border-border bg-card p-2", children: [
          board.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-4 text-center text-sm text-muted-foreground", children: "No rewards earned yet this week." }),
          board.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center text-sm font-bold text-muted-foreground", children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white", style: {
              background: r.profile?.avatar_color || "#666"
            }, children: r.profile?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.profile.avatar_url, alt: "", className: "h-full w-full rounded-full object-cover" }) : r.profile?.username?.[0]?.toUpperCase() ?? "?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-sm font-medium", children: r.profile?.username || "Unknown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold text-primary", children: [
              "+",
              r.xp,
              " XP"
            ] })
          ] }, r.user_id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InviteFriendsDialog, { open: invitingGameId != null, gameId: invitingGameId, onClose: () => {
      setInvitingGameId(null);
      reload();
    } }),
    invitingGameId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-4 z-20 mx-auto w-fit rounded-full bg-card px-4 py-2 text-xs text-muted-foreground shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "font-bold text-primary", onClick: () => onOpenGame(invitingGameId), children: "Open waiting room →" }) })
  ] });
}
function ActiveGameView({
  gameId,
  onLeave
}) {
  const {
    user
  } = useAuth();
  const meId = user.id;
  const [game, setGame] = reactExports.useState(null);
  const [players, setPlayers] = reactExports.useState([]);
  const [profiles, setProfiles] = reactExports.useState({});
  const [inviteOpen, setInviteOpen] = reactExports.useState(false);
  const [pending, setPending] = reactExports.useState(false);
  const roll = useServerFn(rollDice);
  const move = useServerFn(moveToken);
  const leave = useServerFn(leaveGame);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{
        data: g
      }, {
        data: pl
      }] = await Promise.all([supabase.from("games").select("*").eq("id", gameId).maybeSingle(), supabase.from("game_players").select("*").eq("game_id", gameId).order("seat")]);
      if (cancelled) return;
      if (!g) {
        toast.error("Game not found");
        onLeave();
        return;
      }
      setGame(g);
      setPlayers(pl ?? []);
      const ids = (pl ?? []).map((p) => p.user_id);
      if (ids.length) {
        const {
          data: profs
        } = await supabase.from("profiles").select("id, username, avatar_color, avatar_url").in("id", ids);
        if (!cancelled) setProfiles(Object.fromEntries((profs ?? []).map((p) => [p.id, p])));
      }
    }
    load();
    const ch = supabase.channel(`game-${gameId}`).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "games",
      filter: `id=eq.${gameId}`
    }, (payload) => {
      setGame(payload.new);
    }).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "game_players",
      filter: `game_id=eq.${gameId}`
    }, () => load()).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [gameId]);
  const mySeat = reactExports.useMemo(() => players.find((p) => p.user_id === meId)?.seat ?? null, [players, meId]);
  const needed = game ? LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2 : 2;
  const state = game?.state && Object.keys(game.state).length ? game.state : initLudoState(needed);
  const myTurn = mySeat != null && game?.current_turn_seat === mySeat && game.status === "active";
  async function handleRoll() {
    setPending(true);
    try {
      await roll({
        data: {
          gameId
        }
      });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPending(false);
    }
  }
  async function handleMove(tokenIdx) {
    setPending(true);
    try {
      await move({
        data: {
          gameId,
          tokenIndex: tokenIdx
        }
      });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPending(false);
    }
  }
  async function handleLeave() {
    if (!confirm(game?.status === "active" ? "Forfeit this match?" : "Leave this match?")) return;
    try {
      await leave({
        data: {
          gameId
        }
      });
    } catch {
    }
    onLeave();
  }
  if (!game) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-muted-foreground", children: "Loading…" });
  const winner = game.winner_id ? profiles[game.winner_id] : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLeave, className: "rounded-full p-2 hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-bold leading-tight", children: [
          "Ludo ",
          game.game_type === "ludo_4p" ? "4P" : "1v1"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          game.status === "waiting" && `Waiting · ${players.length}/${needed} joined`,
          game.status === "active" && `Turn: ${SEAT_NAMES[game.current_turn_seat]}`,
          game.status === "finished" && `🏆 Winner: ${winner?.username || "—"}`,
          game.status === "cancelled" && "Cancelled"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLeave, className: "rounded-full bg-destructive/15 p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground", title: "Leave", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-4 px-4 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        Array.from({
          length: needed
        }, (_, seat) => {
          const p = players.find((pp) => pp.seat === seat);
          const prof = p ? profiles[p.user_id] : null;
          const isTurn = game.status === "active" && game.current_turn_seat === seat;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${isTurn ? "border-primary bg-primary/10 shadow" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full", style: {
              background: SEAT_COLORS[seat]
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: prof?.username || "—" }),
            p?.user_id === meId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground", children: "YOU" })
          ] }, seat);
        }),
        game.status === "waiting" && players.length < needed && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setInviteOpen(true), className: "flex items-center gap-1 rounded-full border border-dashed border-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
          " Invite"
        ] })
      ] }),
      game.status !== "waiting" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LudoBoard, { state, mySeat, currentTurnSeat: game.current_turn_seat, seats: needed, onMoveToken: handleMove, pending }) }),
      game.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs uppercase tracking-wider text-muted-foreground", children: state.lastEvent }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 place-items-center rounded-2xl border-2 border-border bg-background text-3xl font-bold shadow-inner", children: state.dice ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleRoll, disabled: !myTurn || state.dice != null || pending, className: "rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-lg disabled:cursor-not-allowed disabled:opacity-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Dice5, { className: "mr-2 inline h-5 w-5" }),
            myTurn ? state.dice != null ? "Pick a token" : "Roll dice" : "Waiting…"
          ] })
        ] }),
        !myTurn && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-muted-foreground", children: [
          "It's ",
          SEAT_NAMES[game.current_turn_seat],
          "'s turn."
        ] })
      ] }),
      game.status === "waiting" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-border bg-card p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-2 h-6 w-6 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Waiting for opponents to join…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Share this page or invite a friend. The match will auto-start when full." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          navigator.clipboard?.writeText(window.location.href);
          toast.success("Link copied");
        }, className: "mt-3 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary-foreground hover:opacity-90", children: "Copy invite link" })
      ] }),
      game.status === "finished" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "mx-auto h-8 w-8 text-amber-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-base font-bold", children: [
          winner?.username || "Someone",
          " wins!"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/games/ludo", search: {
          id: void 0
        }, className: "mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground", children: "Back to lobby" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InviteFriendsDialog, { open: inviteOpen, gameId, onClose: () => setInviteOpen(false) })
  ] });
}
export {
  GamesPage as component
};
