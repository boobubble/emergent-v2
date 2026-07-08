import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { Piece } from "./Piece";
import { absoluteCells, type Level, type PieceDef, type PiecePos } from "./logic";

interface BoardProps {
  level: Level;
  positions: Record<string, PiecePos>;
  disabled?: boolean;
  hintPieceId?: string | null;
  onMove(pieceId: string, next: PiecePos): boolean;
}

interface Camera {
  cell: number;
  originR: number; // grid row rendered at viewport y=0
  originC: number; // grid col rendered at viewport x=0
  cols: number;
  rows: number;
}

const MIN_PAD = 20;
const MAX_PAD = 40;
const MIN_CELL = 28;
const MAX_CELL = 160;

/**
 * Compute a virtual camera that fits the puzzle to the given viewport.
 * We take the bounding box of every piece (solution AND current + start
 * positions) so pieces can move anywhere they'll ever appear, plus a
 * 1-cell margin on each side for drag comfort.
 */
function computeCamera(
  level: Level,
  positions: Record<string, PiecePos>,
  vw: number,
  vh: number,
): Camera {
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  const consider = (id: string, pos: PiecePos) => {
    const piece = level.layout.pieces.find(p => p.id === id);
    if (!piece) return;
    for (const c of absoluteCells(piece, pos)) {
      if (c.r < minR) minR = c.r;
      if (c.c < minC) minC = c.c;
      if (c.r > maxR) maxR = c.r;
      if (c.c > maxC) maxC = c.c;
    }
  };
  for (const p of level.layout.pieces) {
    consider(p.id, positions[p.id] ?? { r: p.startR, c: p.startC });
    consider(p.id, { r: p.startR, c: p.startC });
  }
  for (const s of level.solution.pieces) consider(s.id, { r: s.r, c: s.c });

  if (!isFinite(minR)) { minR = 0; minC = 0; maxR = level.grid_h - 1; maxC = level.grid_w - 1; }

  // Clamp to grid, add 1 cell drag margin.
  const margin = 1;
  const r0 = Math.max(0, minR - margin);
  const c0 = Math.max(0, minC - margin);
  const r1 = Math.min(level.grid_h - 1, maxR + margin);
  const c1 = Math.min(level.grid_w - 1, maxC + margin);
  const cols = c1 - c0 + 1;
  const rows = r1 - r0 + 1;

  const pad = Math.min(MAX_PAD, Math.max(MIN_PAD, Math.min(vw, vh) * 0.03));
  const availW = Math.max(0, vw - pad * 2);
  const availH = Math.max(0, vh - pad * 2);
  const raw = Math.floor(Math.min(availW / cols, availH / rows));
  const cell = Math.max(MIN_CELL, Math.min(MAX_CELL, raw));

  return { cell, originR: r0, originC: c0, cols, rows };
}

/**
 * Auto-fitting camera-based board. Fills the parent viewport, computes a
 * bounding-box camera per level, and renders only the visible grid.
 */
export function Board({ level, positions, disabled, hintPieceId, onMove }: BoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setVp({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cam = useMemo(
    () => computeCamera(level, positions, vp.w, vp.h),
    [level, positions, vp.w, vp.h],
  );

  const boardW = cam.cell * cam.cols;
  const boardH = cam.cell * cam.rows;
  const offX = Math.max(0, (vp.w - boardW) / 2);
  const offY = Math.max(0, (vp.h - boardH) / 2);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      {vp.w > 0 && (
        <div
          className="absolute"
          style={{ left: offX, top: offY, width: boardW, height: boardH }}
        >
          {/* dotted grid — only the visible camera region */}
          <svg width={boardW} height={boardH} className="absolute inset-0 pointer-events-none">
            {Array.from({ length: cam.rows + 1 }).flatMap((_, r) =>
              Array.from({ length: cam.cols + 1 }).map((_, c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={c * cam.cell}
                  cy={r * cam.cell}
                  r={Math.max(1, cam.cell * 0.03)}
                  fill="hsl(var(--muted-foreground) / 0.35)"
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
                cam={cam}
                boardW={boardW}
                boardH={boardH}
                disabled={disabled}
                highlight={hintPieceId === p.id ? "hint" : null}
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
  piece, pos, cam, boardW, boardH, disabled, highlight, onMove,
}: {
  piece: PieceDef;
  pos: PiecePos;
  cam: Camera;
  boardW: number;
  boardH: number;
  disabled?: boolean;
  highlight: "drag" | "hint" | null;
  onMove(pieceId: string, next: PiecePos): boolean;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const x = (pos.c - cam.originC) * cam.cell;
  const y = (pos.r - cam.originR) * cam.cell;

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
        const dc = Math.round(info.offset.x / cam.cell);
        const dr = Math.round(info.offset.y / cam.cell);
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
      <Piece piece={piece} cellSize={cam.cell} highlight={dragging ? "drag" : highlight} />
    </motion.div>
  );
}
