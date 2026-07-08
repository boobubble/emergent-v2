import { useLayoutEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { Piece } from "./Piece";
import type { Level, PieceDef, PiecePos } from "./logic";

interface BoardProps {
  level: Level;
  positions: Record<string, PiecePos>;
  disabled?: boolean;
  hintPieceId?: string | null;
  onMove(pieceId: string, next: PiecePos): boolean;
}

/**
 * Auto-fitting dotted-grid board. Fills the available width AND height of its
 * parent and centers itself. Pieces are absolutely positioned in grid
 * coordinates and dragged with pointer events.
 */
export function Board({ level, positions, disabled, hintPieceId, onMove }: BoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(48);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      // reserve a bit of breathing room for the floating controls bar
      const pad = 12;
      const size = Math.floor(
        Math.min((w - pad * 2) / level.grid_w, (h - pad * 2) / level.grid_h),
      );
      setCell(Math.max(24, Math.min(size, 96)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [level.grid_w, level.grid_h]);

  const boardW = cell * level.grid_w;
  const boardH = cell * level.grid_h;

  return (
    <div ref={wrapRef} className="relative flex h-full w-full items-center justify-center">
      <div
        className="relative rounded-[28px] bg-gradient-to-br from-background/60 to-background/20 p-2 ring-1 ring-border/40 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.35)]"
        style={{ width: boardW + 16, height: boardH + 16 }}
      >
        <div className="relative" style={{ width: boardW, height: boardH }}>
          {/* dotted grid */}
          <svg width={boardW} height={boardH} className="absolute inset-0">
            {Array.from({ length: level.grid_h + 1 }).flatMap((_, r) =>
              Array.from({ length: level.grid_w + 1 }).map((_, c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={c * cell}
                  cy={r * cell}
                  r={1.3}
                  fill="hsl(var(--muted-foreground) / 0.32)"
                />
              )),
            )}
          </svg>

          {level.layout.pieces.map(p => {
            const pos = positions[p.id];
            if (!pos) return null;
            return (
              <DraggablePiece
                key={p.id}
                piece={p}
                pos={pos}
                cell={cell}
                boardW={boardW}
                boardH={boardH}
                disabled={disabled}
                highlight={hintPieceId === p.id ? "hint" : null}
                onMove={onMove}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DraggablePiece({
  piece, pos, cell, boardW, boardH, disabled, highlight, onMove,
}: {
  piece: PieceDef;
  pos: PiecePos;
  cell: number;
  boardW: number;
  boardH: number;
  disabled?: boolean;
  highlight: "drag" | "hint" | null;
  onMove(pieceId: string, next: PiecePos): boolean;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const x = pos.c * cell;
  const y = pos.r * cell;

  return (
    <motion.div
      drag={!disabled}
      dragControls={controls}
      dragListener={!disabled}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: -x, top: -y, right: boardW - x, bottom: boardH - y }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        const dc = Math.round(info.offset.x / cell);
        const dr = Math.round(info.offset.y / cell);
        if (dc === 0 && dr === 0) return;
        onMove(piece.id, { r: pos.r + dr, c: pos.c + dc });
      }}
      animate={{ x, y, scale: 1 }}
      transition={{ type: "spring", stiffness: 560, damping: 32, mass: 0.6 }}
      whileTap={{ scale: 1.04 }}
      className={
        "absolute left-0 top-0 touch-none " +
        (disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing")
      }
      style={{ zIndex: dragging ? 20 : highlight === "hint" ? 15 : 5 }}
    >
      <Piece piece={piece} cellSize={cell} highlight={dragging ? "drag" : highlight} />
    </motion.div>
  );
}
