import { motion, AnimatePresence } from "framer-motion";
import {
  HOME_COL_LEN,
  HOME_POS,
  LUDO_TRACK_LEN,
  LudoState,
  SAFE_SQUARES,
  SEAT_COLORS,
  SEAT_START_SQ,
  TOKENS_PER_PLAYER,
  tokenCanMove,
  trackSquareFor,
} from "@/lib/games-engine";

interface Props {
  state: LudoState;
  mySeat: number | null;
  currentTurnSeat: number;
  seats: number;
  onMoveToken: (tokenIdx: number) => void;
  pending?: boolean;
}

// ---------- board geometry ----------
// 15x15 grid. Bases in the four 6x6 corners, cross-shaped track,
// home columns running into the center.

type XY = { c: number; r: number };

// 52 main-loop squares as (col, row), clockwise from absolute index 0.
const TRACK: XY[] = [
  // bottom-left arm (left edge of bottom-left base) → going right along middle-left row
  { c: 1, r: 6 }, { c: 2, r: 6 }, { c: 3, r: 6 }, { c: 4, r: 6 }, { c: 5, r: 6 }, // 0..4  (blue start at 0)
  // up the left side of top arm
  { c: 6, r: 5 }, { c: 6, r: 4 }, { c: 6, r: 3 }, { c: 6, r: 2 }, { c: 6, r: 1 }, { c: 6, r: 0 }, // 5..10
  // across the top
  { c: 7, r: 0 }, { c: 8, r: 0 }, // 11, 12
  // down the right side of top arm
  { c: 8, r: 1 }, { c: 8, r: 2 }, { c: 8, r: 3 }, { c: 8, r: 4 }, { c: 8, r: 5 }, // 13..17  (red/top start = 13)
  // across the top of right arm
  { c: 9, r: 6 }, { c: 10, r: 6 }, { c: 11, r: 6 }, { c: 12, r: 6 }, { c: 13, r: 6 }, { c: 14, r: 6 }, // 18..23
  // down the right edge
  { c: 14, r: 7 }, { c: 14, r: 8 }, // 24, 25
  // back left across bottom of right arm
  { c: 13, r: 8 }, { c: 12, r: 8 }, { c: 11, r: 8 }, { c: 10, r: 8 }, { c: 9, r: 8 }, // 26..30  (1v1 seat-1 start = 26)
  // down right side of bottom arm
  { c: 8, r: 9 }, { c: 8, r: 10 }, { c: 8, r: 11 }, { c: 8, r: 12 }, { c: 8, r: 13 }, { c: 8, r: 14 }, // 31..36
  // across the bottom
  { c: 7, r: 14 }, { c: 6, r: 14 }, // 37, 38
  // up the left side of bottom arm
  { c: 6, r: 13 }, { c: 6, r: 12 }, { c: 6, r: 11 }, { c: 6, r: 10 }, { c: 6, r: 9 }, // 39..43
  // across the bottom of left arm
  { c: 5, r: 8 }, { c: 4, r: 8 }, { c: 3, r: 8 }, { c: 2, r: 8 }, { c: 1, r: 8 }, { c: 0, r: 8 }, // 44..49
  // up the left edge to start
  { c: 0, r: 7 }, { c: 0, r: 6 }, // 50, 51
];

// 6-square home column per seat (positions 53..58 in token space).
const HOME_COL: Record<number, XY[]> = {
  0: [ // blue, enters along row 7 from left
    { c: 1, r: 7 }, { c: 2, r: 7 }, { c: 3, r: 7 }, { c: 4, r: 7 }, { c: 5, r: 7 }, { c: 6, r: 7 },
  ],
  1: [ // red (1v1 opposite), enters along row 7 from right
    { c: 13, r: 7 }, { c: 12, r: 7 }, { c: 11, r: 7 }, { c: 10, r: 7 }, { c: 9, r: 7 }, { c: 8, r: 7 },
  ],
  2: [ // green (top, for 4-player back-compat), enters along col 7 from top
    { c: 7, r: 1 }, { c: 7, r: 2 }, { c: 7, r: 3 }, { c: 7, r: 4 }, { c: 7, r: 5 }, { c: 7, r: 6 },
  ],
  3: [ // amber (bottom, 4p), enters along col 7 from bottom
    { c: 7, r: 13 }, { c: 7, r: 12 }, { c: 7, r: 11 }, { c: 7, r: 10 }, { c: 7, r: 9 }, { c: 7, r: 8 },
  ],
};

// Base 6x6 corners — bottom-left for seat 0 visually, top-right for seat 1.
// We park 4 tokens at the inner 2x2 of each base.
const BASE_BOX: Record<number, { c0: number; r0: number }> = {
  0: { c0: 0, r0: 0 },     // top-left  (blue)
  1: { c0: 9, r0: 9 },     // bottom-right (red)
  2: { c0: 9, r0: 0 },     // top-right (green, 4p)
  3: { c0: 0, r0: 9 },     // bottom-left (amber, 4p)
};

function parkingSlot(seat: number, idx: number): XY {
  const box = BASE_BOX[seat] ?? BASE_BOX[0];
  // 2x2 grid of slots inside the 6x6 base
  const dx = idx % 2 === 0 ? 1.5 : 3.5;
  const dy = idx < 2 ? 1.5 : 3.5;
  return { c: box.c0 + dx, r: box.r0 + dy };
}

function tokenScreenXY(seat: number, pos: number, cell: number, pad: number): XY {
  if (pos === 0) {
    const p = parkingSlot(seat, 0); // placeholder, callers override per-idx
    return { c: pad + p.c * cell + cell / 2, r: pad + p.r * cell + cell / 2 };
  }
  if (pos >= 1 && pos <= LUDO_TRACK_LEN) {
    const abs = trackSquareFor(seat, pos);
    const sq = TRACK[abs];
    return { c: pad + sq.c * cell + cell / 2, r: pad + sq.r * cell + cell / 2 };
  }
  if (pos > LUDO_TRACK_LEN && pos <= HOME_POS) {
    const homeIdx = pos - LUDO_TRACK_LEN - 1; // 0..5
    const col = HOME_COL[seat] ?? HOME_COL[0];
    const sq = col[Math.min(homeIdx, col.length - 1)];
    return { c: pad + sq.c * cell + cell / 2, r: pad + sq.r * cell + cell / 2 };
  }
  return { c: pad, r: pad };
}

// ---------- component ----------

export function LudoBoard({ state, mySeat, currentTurnSeat, seats, onMoveToken, pending }: Props) {
  const CELL = 28;
  const PAD = 6;
  const SIZE = 15 * CELL + PAD * 2;

  const die = state.dice;
  const myTurn = mySeat != null && mySeat === currentTurnSeat;

  // Group tokens by visual position so stacks fan out
  type TokenView = { seat: number; idx: number; pos: number; key: string };
  const buckets: Record<string, TokenView[]> = {};
  for (let s = 0; s < seats; s++) {
    const arr = state.tokens[String(s)] || [];
    arr.forEach((pos, idx) => {
      // For base tokens, use a unique slot per (seat, idx) so each parks cleanly
      const keyPos = pos === 0 ? `base-${s}-${idx}` : `pos-${s}-${pos}`;
      buckets[keyPos] = buckets[keyPos] || [];
      buckets[keyPos].push({ seat: s, idx, pos, key: `t-${s}-${idx}` });
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto block max-w-full"
          style={{ width: "100%", height: "auto", maxWidth: 520 }}
          role="img"
          aria-label="Ludo board"
        >
          <defs>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>

          {/* Board background */}
          <rect x={0} y={0} width={SIZE} height={SIZE} rx={14} className="fill-card stroke-border" strokeWidth={1} />

          {/* Bases */}
          {[0, 1, 2, 3].filter((s) => s < Math.max(seats, 2)).map((s) => {
            const box = BASE_BOX[s];
            const color = SEAT_COLORS[s];
            return (
              <g key={`base-${s}`}>
                <rect
                  x={PAD + box.c0 * CELL}
                  y={PAD + box.r0 * CELL}
                  width={6 * CELL}
                  height={6 * CELL}
                  rx={10}
                  fill={color}
                  opacity={0.18}
                  stroke={color}
                  strokeWidth={2}
                />
                <rect
                  x={PAD + (box.c0 + 1) * CELL}
                  y={PAD + (box.r0 + 1) * CELL}
                  width={4 * CELL}
                  height={4 * CELL}
                  rx={8}
                  className="fill-card"
                  stroke={color}
                  strokeWidth={1.5}
                />
                {/* Parking circles */}
                {[0, 1, 2, 3].map((i) => {
                  const p = parkingSlot(s, i);
                  return (
                    <circle
                      key={i}
                      cx={PAD + p.c * CELL}
                      cy={PAD + p.r * CELL}
                      r={CELL * 0.55}
                      fill="white"
                      stroke={color}
                      strokeWidth={1.5}
                      opacity={0.95}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Track squares */}
          {TRACK.map((sq, i) => {
            const isSafe = SAFE_SQUARES.has(i);
            // Color the start square per seat
            const startSeat = SEAT_START_SQ.findIndex((s) => s === i);
            const startTint = startSeat >= 0 && startSeat < seats ? SEAT_COLORS[startSeat] : null;
            return (
              <g key={`tr-${i}`}>
                <rect
                  x={PAD + sq.c * CELL + 1}
                  y={PAD + sq.r * CELL + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={4}
                  fill={startTint ?? (isSafe ? "#fde68a" : "#ffffff")}
                  opacity={startTint ? 0.55 : isSafe ? 0.85 : 1}
                  className="stroke-border"
                  strokeWidth={0.75}
                />
                {isSafe && !startTint && (
                  <text
                    x={PAD + sq.c * CELL + CELL / 2}
                    y={PAD + sq.r * CELL + CELL / 2 + 4}
                    textAnchor="middle"
                    fontSize={12}
                    className="fill-amber-700"
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}

          {/* Home columns */}
          {[0, 1, 2, 3].filter((s) => s < Math.max(seats, 2)).map((s) => {
            const col = HOME_COL[s];
            const color = SEAT_COLORS[s];
            return (
              <g key={`hc-${s}`}>
                {col.map((sq, i) => (
                  <rect
                    key={i}
                    x={PAD + sq.c * CELL + 1}
                    y={PAD + sq.r * CELL + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    rx={4}
                    fill={color}
                    opacity={0.35}
                    stroke={color}
                    strokeWidth={0.75}
                  />
                ))}
              </g>
            );
          })}

          {/* Center hub */}
          <polygon
            points={`${PAD + 6 * CELL},${PAD + 6 * CELL} ${PAD + 9 * CELL},${PAD + 6 * CELL} ${PAD + 9 * CELL},${PAD + 9 * CELL} ${PAD + 6 * CELL},${PAD + 9 * CELL}`}
            fill="url(#centerGrad)"
            stroke="#f59e0b"
            strokeWidth={1.5}
          />
          <text
            x={PAD + 7.5 * CELL}
            y={PAD + 7.5 * CELL + 5}
            textAnchor="middle"
            fontSize={18}
            className="fill-amber-900"
          >
            🏁
          </text>

          {/* Tokens */}
          {Object.entries(buckets).flatMap(([bucketKey, arr]) =>
            arr.map((t, i) => {
              // For base parking: each idx gets its own slot
              let cx: number, cy: number;
              if (t.pos === 0) {
                const p = parkingSlot(t.seat, t.idx);
                cx = PAD + p.c * CELL;
                cy = PAD + p.r * CELL;
              } else {
                const xy = tokenScreenXY(t.seat, t.pos, CELL, PAD);
                // fan out stacked tokens
                const off = (i - (arr.length - 1) / 2) * 7;
                cx = xy.c + off;
                cy = xy.r;
              }
              const isMine = t.seat === mySeat;
              const movable =
                myTurn && isMine && die != null && tokenCanMove(state, t.seat, t.idx, die) && !pending;
              return (
                <motion.g
                  key={t.key}
                  layoutId={t.key}
                  onClick={movable ? () => onMoveToken(t.idx) : undefined}
                  style={{ cursor: movable ? "pointer" : "default" }}
                  whileHover={movable ? { scale: 1.18 } : undefined}
                  animate={{ cx, cy }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={CELL * 0.38}
                    fill={SEAT_COLORS[t.seat]}
                    stroke="white"
                    strokeWidth={2}
                    style={{
                      filter: movable
                        ? `drop-shadow(0 0 8px ${SEAT_COLORS[t.seat]})`
                        : "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                    }}
                  />
                  {movable && (
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={CELL * 0.38}
                      fill="none"
                      stroke={SEAT_COLORS[t.seat]}
                      strokeWidth={2}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </motion.g>
              );
            }),
          )}
        </svg>
      </div>

      {/* Token quick-action list — works on all screen sizes */}
      {mySeat != null && (
        <div className="grid w-full grid-cols-4 gap-1.5 sm:gap-2">
          {Array.from({ length: TOKENS_PER_PLAYER }, (_, idx) => {
            const pos = state.tokens[String(mySeat)]?.[idx] ?? 0;
            const canMove = myTurn && die != null && tokenCanMove(state, mySeat, idx, die) && !pending;
            const isHome = pos >= HOME_POS;
            const status =
              isHome ? "🏁" : pos === 0 ? "Base" : pos > LUDO_TRACK_LEN ? `H${pos - LUDO_TRACK_LEN}` : `${pos}`;
            return (
              <button
                key={idx}
                disabled={!canMove}
                onClick={() => onMoveToken(idx)}
                className="rounded-lg border-2 bg-card px-1.5 py-1.5 text-xs font-semibold text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105"
                style={{
                  borderColor: SEAT_COLORS[mySeat],
                  boxShadow: canMove ? `0 0 12px ${SEAT_COLORS[mySeat]}` : undefined,
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: SEAT_COLORS[mySeat] }}
                  />
                  <span className="tabular-nums">{status}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating roll / event banner */}
      <AnimatePresence mode="wait">
        {die != null && (
          <motion.div
            key={`die-${state.rollSeq}-${die}`}
            initial={{ scale: 0.6, opacity: 0, y: -6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-center text-xs font-medium text-muted-foreground shadow-sm"
          >
            🎲 <span className="font-bold text-foreground">{die}</span> — tap a glowing token to move
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
