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
 * Renders the dotted grid + all pieces. Pieces are absolutely positioned in
 * grid coordinates and dragged with pointer events. On drop we ask the
 * engine to accept; if rejected the piece snaps back to its previous cell.
 */
export function Board({ level, positions, disabled, hintPieceId, onMove }: BoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(48);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const size = Math.floor(Math.min(w / level.grid_w, 72));
      setCell(Math.max(28, size));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [level.grid_w]);

  const boardW = cell * level.grid_w;
  const boardH = cell * level.grid_h;

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[680px] px-2">
      <div
        className="relative mx-auto rounded-3xl border border-border/60 bg-gradient-to-br from-background/70 to-background/40 p-3 backdrop-blur-xl shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.35)]"
        style={{ width: boardW + 24, height: boardH + 24 }}
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
                  r={1.4}
                  fill="hsl(var(--muted-foreground) / 0.35)"
                />
              )),
            )}
          </svg>

          {level.layout.pieces.map(p => (
            <DraggablePiece
              key={p.id}
              piece={p}
              pos={positions[p.id]}
              cell={cell}
              boardW={boardW}
              boardH={boardH}
              disabled={disabled}
              highlight={hintPieceId === p.id ? "hint" : null}
              onMove={onMove}
            />
          ))}
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
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      whileTap={{ scale: 1.03 }}
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
