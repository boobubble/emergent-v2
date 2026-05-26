import { motion } from "framer-motion";
import { LUDO_TRACK_LEN, LudoState, SEAT_COLORS, TOKENS_PER_PLAYER, tokenCanMove } from "@/lib/games-engine";

interface Props {
  state: LudoState;
  mySeat: number | null;
  currentTurnSeat: number;
  seats: number;
  onMoveToken: (tokenIdx: number) => void;
  pending?: boolean;
}

// Lay squares out as a horizontal-ish snake to fit narrow screens.
const COLS = 8;
function squareXY(idx: number) {
  const row = Math.floor(idx / COLS);
  const inRow = idx % COLS;
  const col = row % 2 === 0 ? inRow : COLS - 1 - inRow;
  return { col, row };
}

export function LudoBoard({ state, mySeat, currentTurnSeat, seats, onMoveToken, pending }: Props) {
  const totalSquares = LUDO_TRACK_LEN + 1; // 0..LUDO_TRACK_LEN inclusive
  const rows = Math.ceil(totalSquares / COLS);
  const CELL = 38;
  const PAD = 8;
  const width = COLS * CELL + PAD * 2;
  const height = rows * CELL + PAD * 2;

  // Group tokens per square for fan-out
  const tokensAt: Record<number, { seat: number; idx: number; key: string }[]> = {};
  for (let s = 0; s < seats; s++) {
    const arr = state.tokens[String(s)] || [];
    arr.forEach((pos, idx) => {
      tokensAt[pos] = tokensAt[pos] || [];
      tokensAt[pos].push({ seat: s, idx, key: `${s}-${idx}` });
    });
  }

  const myTurn = mySeat != null && mySeat === currentTurnSeat;
  const die = state.dice;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto block max-w-full"
        style={{ width: "100%", height: "auto", maxWidth: 520 }}
        role="img"
        aria-label="Ludo board"
      >
        {/* Squares */}
        {Array.from({ length: totalSquares }, (_, i) => {
          const { col, row } = squareXY(i);
          const x = PAD + col * CELL;
          const y = PAD + row * CELL;
          const isStart = i === 0;
          const isHome = i === LUDO_TRACK_LEN;
          return (
            <g key={i}>
              <rect
                x={x + 2}
                y={y + 2}
                width={CELL - 4}
                height={CELL - 4}
                rx={6}
                className={
                  isHome
                    ? "fill-amber-500/30 stroke-amber-500"
                    : isStart
                      ? "fill-emerald-500/20 stroke-emerald-500/60"
                      : "fill-card stroke-border"
                }
                strokeWidth={1}
              />
              <text
                x={x + CELL / 2}
                y={y + CELL / 2 + 3}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {isHome ? "🏁" : isStart ? "S" : i}
              </text>
            </g>
          );
        })}

        {/* Tokens */}
        {Object.entries(tokensAt).flatMap(([posStr, arr]) => {
          const pos = Number(posStr);
          const { col, row } = squareXY(pos);
          const cx = PAD + col * CELL + CELL / 2;
          const cy = PAD + row * CELL + CELL / 2;
          return arr.map((t, i) => {
            const offset = (i - (arr.length - 1) / 2) * 9;
            const isMine = t.seat === mySeat;
            const movable =
              myTurn && isMine && die != null && tokenCanMove(state, t.seat, t.idx, die) && !pending;
            return (
              <motion.circle
                key={t.key}
                layoutId={t.key}
                cx={cx + offset}
                cy={cy}
                r={9}
                fill={SEAT_COLORS[t.seat]}
                stroke="white"
                strokeWidth={1.5}
                className={movable ? "cursor-pointer drop-shadow-lg" : "drop-shadow"}
                style={{ filter: movable ? "drop-shadow(0 0 6px currentColor)" : undefined, color: SEAT_COLORS[t.seat] }}
                onClick={movable ? () => onMoveToken(t.idx) : undefined}
                whileHover={movable ? { scale: 1.2 } : undefined}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              />
            );
          });
        })}
      </svg>

      {/* Token tap fallback for tiny screens — list each of MY tokens with a Move button */}
      {mySeat != null && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
          {Array.from({ length: TOKENS_PER_PLAYER }, (_, idx) => {
            const pos = state.tokens[String(mySeat)]?.[idx] ?? 0;
            const canMove = myTurn && die != null && tokenCanMove(state, mySeat, idx, die) && !pending;
            return (
              <button
                key={idx}
                disabled={!canMove}
                onClick={() => onMoveToken(idx)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-40"
                style={{ borderColor: SEAT_COLORS[mySeat] }}
              >
                Token {idx + 1} <span className="text-xs text-muted-foreground">@ {pos}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
