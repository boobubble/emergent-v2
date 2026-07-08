import { memo } from "react";
import type { Cell, PieceDef } from "./logic";

const ARROW_ROT: Record<Cell["dir"], number> = { U: -90, R: 0, D: 90, L: 180 };

interface PieceProps {
  piece: PieceDef;
  cellSize: number;
  solved?: boolean;
  ghost?: boolean;
  /** Optional highlight while dragging or on hint. */
  highlight?: "drag" | "hint" | null;
}

/** Pure SVG renderer for a piece. Origin (0,0) is at the top-left cell of the piece. */
function PieceInner({ piece, cellSize, solved, ghost, highlight }: PieceProps) {
  const w = (Math.max(...piece.cells.map(c => c.c)) + 1) * cellSize;
  const h = (Math.max(...piece.cells.map(c => c.r)) + 1) * cellSize;
  const stroke = solved
    ? "hsl(var(--primary))"
    : ghost
    ? "hsl(var(--muted-foreground) / 0.4)"
    : "hsl(var(--foreground))";
  const strokeW = Math.max(2, cellSize * 0.12);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={
        "pointer-events-none select-none " +
        (highlight === "drag"
          ? "drop-shadow-[0_8px_24px_hsl(var(--primary)/0.35)]"
          : highlight === "hint"
          ? "animate-pulse drop-shadow-[0_0_16px_hsl(var(--primary)/0.6)]"
          : "")
      }
    >
      {piece.cells.map((cell, idx) => {
        const x = cell.c * cellSize;
        const y = cell.r * cellSize;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        const rot = ARROW_ROT[cell.dir];
        const arm = cellSize * 0.38;
        return (
          <g key={idx}>
            <rect
              x={x + strokeW / 2}
              y={y + strokeW / 2}
              width={cellSize - strokeW}
              height={cellSize - strokeW}
              rx={cellSize * 0.22}
              fill={ghost ? "transparent" : "hsl(var(--background))"}
              stroke={stroke}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              opacity={ghost ? 0.5 : 1}
            />
            <g transform={`rotate(${rot} ${cx} ${cy})`}>
              <line x1={cx - arm} y1={cy} x2={cx + arm} y2={cy} stroke={stroke} strokeWidth={strokeW * 0.7} strokeLinecap="round" />
              <polyline
                points={`${cx + arm - strokeW},${cy - strokeW} ${cx + arm},${cy} ${cx + arm - strokeW},${cy + strokeW}`}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeW * 0.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export const Piece = memo(PieceInner);
