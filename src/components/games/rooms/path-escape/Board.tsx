import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Dir, Level, PieceDef, PiecePos } from "./logic";
import { absoluteCells } from "./logic";

interface Props {
  level: Level;
  positions: Record<string, PiecePos>;
  disabled?: boolean;
  onMove(pieceId: string, next: PiecePos): boolean;
  hintSolution?: Level["solution"];
}

interface Camera { cell: number; cols: number; rows: number; originR: number; originC: number }

const MIN_CELL = 40;
const MAX_CELL = 140;

function computeCamera(level: Level, positions: Record<string, PiecePos>, vw: number, vh: number): Camera {
  let minR = 0, minC = 0, maxR = level.grid_h - 1, maxC = level.grid_w - 1;
  // consider start + current + solution to keep piece drag area comfortable
  const consider = (r: number, c: number) => {
    if (r < minR) minR = r; if (c < minC) minC = c;
    if (r > maxR) maxR = r; if (c > maxC) maxC = c;
  };
  for (const p of level.layout.pieces) {
    const pos = positions[p.id] ?? { r: p.startR, c: p.startC };
    for (const cell of absoluteCells(p, pos)) consider(cell.r, cell.c);
    for (const cell of absoluteCells(p, { r: p.startR, c: p.startC })) consider(cell.r, cell.c);
  }
  for (const s of level.solution.pieces) consider(s.r, s.c);
  const r0 = Math.max(0, minR), c0 = Math.max(0, minC);
  const r1 = Math.min(level.grid_h - 1, maxR), c1 = Math.min(level.grid_w - 1, maxC);
  const cols = c1 - c0 + 1, rows = r1 - r0 + 1;
  const pad = 24;
  const availW = Math.max(0, vw - pad * 2);
  const availH = Math.max(0, vh - pad * 2);
  const raw = Math.floor(Math.min(availW / cols, availH / rows));
  const cell = Math.max(MIN_CELL, Math.min(MAX_CELL, raw || MIN_CELL));
  return { cell, cols, rows, originR: r0, originC: c0 };
}

const arrowPath: Record<Dir, string> = {
  U: "M12 4 L20 14 L14 14 L14 22 L10 22 L10 14 L4 14 Z",
  D: "M12 22 L4 12 L10 12 L10 4 L14 4 L14 12 L20 12 Z",
  L: "M4 13 L14 5 L14 11 L22 11 L22 15 L14 15 L14 21 Z",
  R: "M22 13 L12 5 L12 11 L4 11 L4 15 L12 15 L12 21 Z",
};

export function Board({ level, positions, disabled, onMove, hintSolution }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const measure = () => setVp({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cam = useMemo(() => computeCamera(level, positions, vp.w, vp.h), [level, positions, vp.w, vp.h]);
  const boardW = cam.cell * cam.cols;
  const boardH = cam.cell * cam.rows;
  const offX = Math.max(0, (vp.w - boardW) / 2);
  const offY = Math.max(0, (vp.h - boardH) / 2);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      {vp.w > 0 && (
        <div className="absolute" style={{ left: offX, top: offY, width: boardW, height: boardH }}>
          {/* grid + solution ghosts */}
          <svg width={boardW} height={boardH} className="absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id="pe-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.06)" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.02)" />
              </linearGradient>
            </defs>
            <rect x={0} y={0} width={boardW} height={boardH} rx={cam.cell * 0.15} fill="url(#pe-bg)" />
            {Array.from({ length: cam.rows }).map((_, r) =>
              Array.from({ length: cam.cols }).map((_, c) => (
                <rect key={`g-${r}-${c}`}
                  x={c * cam.cell + 4} y={r * cam.cell + 4}
                  width={cam.cell - 8} height={cam.cell - 8}
                  rx={cam.cell * 0.12}
                  fill="hsl(var(--muted) / 0.4)"
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                />
              ))
            )}
            {level.solution.pieces.map(s => {
              const highlighted = !!hintSolution?.pieces.some(h => h.id === s.id);
              return (
                <rect key={`s-${s.id}`}
                  x={(s.c - cam.originC) * cam.cell + 4}
                  y={(s.r - cam.originR) * cam.cell + 4}
                  width={cam.cell - 8} height={cam.cell - 8}
                  rx={cam.cell * 0.12}
                  fill={highlighted ? "hsl(var(--primary) / 0.15)" : "none"}
                  stroke={highlighted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"}
                  strokeDasharray={highlighted ? undefined : "4 4"}
                  strokeWidth={highlighted ? 2 : 1.5}
                />
              );
            })}
          </svg>

          {level.layout.pieces.map(p => {
            const pos = positions[p.id]; if (!pos) return null;
            const solved = level.solution.pieces.some(s => s.id === p.id && s.r === pos.r && s.c === pos.c);
            return (
              <DraggablePiece
                key={p.id} piece={p} pos={pos} cam={cam}
                boardW={boardW} boardH={boardH}
                disabled={disabled} solved={solved}
                onMove={onMove}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function DraggablePiece({
  piece, pos, cam, boardW, boardH, disabled, solved, onMove,
}: {
  piece: PieceDef; pos: PiecePos; cam: Camera;
  boardW: number; boardH: number; disabled?: boolean; solved?: boolean;
  onMove(id: string, next: PiecePos): boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const x = (pos.c - cam.originC) * cam.cell;
  const y = (pos.r - cam.originR) * cam.cell;
  const dir = piece.cells[0].dir;
  const size = cam.cell - 8;

  return (
    <motion.div
      drag={!disabled}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: -x, top: -y, right: boardW - x - cam.cell, bottom: boardH - y - cam.cell }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        const dc = Math.round(info.offset.x / cam.cell);
        const dr = Math.round(info.offset.y / cam.cell);
        if (dc === 0 && dr === 0) return;
        onMove(piece.id, { r: pos.r + dr, c: pos.c + dc });
      }}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 560, damping: 32, mass: 0.5 }}
      whileTap={{ scale: 1.06 }}
      className={"absolute left-1 top-1 touch-none " + (disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
      style={{ zIndex: dragging ? 30 : solved ? 10 : 20, width: size, height: size }}
    >
      <div
        className="flex h-full w-full items-center justify-center rounded-[14%] shadow-lg transition-colors"
        style={{
          background: solved
            ? "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)"
            : "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
          border: `1.5px solid hsl(var(--${solved ? "primary" : "border"}))`,
          boxShadow: dragging ? "0 12px 32px -8px hsl(var(--primary) / 0.4)" : undefined,
        }}
      >
        <svg viewBox="0 0 26 26" width={size * 0.55} height={size * 0.55}>
          <path d={arrowPath[dir]} fill={solved ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"} />
        </svg>
      </div>
    </motion.div>
  );
}
