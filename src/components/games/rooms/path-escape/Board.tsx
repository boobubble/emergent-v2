import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DELTA, canExit, type Dir, type Level, type PieceDef } from "./logic";

interface Props {
  level: Level;
  removed: Set<string>;
  disabled?: boolean;
  onTap(pieceId: string): boolean;
  hintPieceId?: string | null;
}

const MIN_CELL = 40;
const MAX_CELL = 120;

const arrowPath: Record<Dir, string> = {
  U: "M12 4 L20 14 L14 14 L14 22 L10 22 L10 14 L4 14 Z",
  D: "M12 22 L4 12 L10 12 L10 4 L14 4 L14 12 L20 12 Z",
  L: "M4 13 L14 5 L14 11 L22 11 L22 15 L14 15 L14 21 Z",
  R: "M22 13 L12 5 L12 11 L4 11 L4 15 L12 15 L12 21 Z",
};

export function Board({ level, removed, disabled, onTap, hintPieceId }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setVp({ w: Math.max(0, Math.floor(r.width)), h: Math.max(0, Math.floor(r.height)) });
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure); ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const cell = useMemo(() => {
    const pad = 24;
    const w = Math.max(0, vp.w - pad * 2);
    const h = Math.max(0, vp.h - pad * 2);
    const raw = Math.floor(Math.min(w / level.grid_w, h / level.grid_h));
    return Math.max(MIN_CELL, Math.min(MAX_CELL, raw || MIN_CELL));
  }, [vp.w, vp.h, level.grid_w, level.grid_h]);

  const boardW = cell * level.grid_w;
  const boardH = cell * level.grid_h;
  const offX = Math.max(0, (Math.max(vp.w, boardW) - boardW) / 2);
  const offY = Math.max(0, (Math.max(vp.h, boardH) - boardH) / 2);

  const walls = level.layout.walls ?? [];

  return (
    <div ref={wrapRef} className="absolute inset-0 h-full w-full overflow-hidden">
      <div className="absolute" style={{ left: offX, top: offY, width: boardW, height: boardH }}>
        <svg width={boardW} height={boardH} className="absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="pe-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.10} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={boardW} height={boardH} rx={cell * 0.15} fill="url(#pe-bg)" />
          {Array.from({ length: level.grid_h }).map((_, r) =>
            Array.from({ length: level.grid_w }).map((_, c) => (
              <rect key={`g-${r}-${c}`}
                x={c * cell + 4} y={r * cell + 4}
                width={cell - 8} height={cell - 8}
                rx={cell * 0.12}
                fill="var(--muted)"
                fillOpacity={0.4}
                stroke="var(--border)"
                strokeWidth={1}
              />
            ))
          )}
          {walls.map((w, i) => (
            <rect key={`w-${i}`}
              x={w.c * cell + 4} y={w.r * cell + 4}
              width={cell - 8} height={cell - 8}
              rx={cell * 0.12}
              fill="var(--foreground)"
              fillOpacity={0.85}
            />
          ))}
        </svg>

        <AnimatePresence>
          {level.layout.pieces.map(p => {
            if (removed.has(p.id)) return null;
            return (
              <Piece
                key={p.id}
                piece={p}
                cell={cell}
                boardW={boardW}
                boardH={boardH}
                disabled={disabled || !canExit(level, p.id, removed)}
                hinted={hintPieceId === p.id}
                onTap={() => onTap(p.id)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Piece({
  piece, cell, boardW, boardH, disabled, hinted, onTap,
}: {
  piece: PieceDef; cell: number;
  boardW: number; boardH: number;
  disabled?: boolean; hinted?: boolean;
  onTap(): void;
}) {
  const size = cell - 8;
  const x = piece.c * cell + 4;
  const y = piece.r * cell + 4;
  const d = DELTA[piece.dir];
  // Exit off-board (past the edge).
  const exitX = d.dc === 0 ? x : d.dc > 0 ? boardW + cell : -cell;
  const exitY = d.dr === 0 ? y : d.dr > 0 ? boardH + cell : -cell;

  return (
    <motion.button
      type="button"
      onClick={() => { if (!disabled) onTap(); }}
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 1, scale: 1 }}
      exit={{ x: exitX, y: exitY, opacity: 0, scale: 0.6 }}
      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.5 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      aria-label={`Arrow ${piece.dir}`}
      className={
        "absolute left-0 top-0 flex items-center justify-center rounded-[14%] shadow-lg " +
        (disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")
      }
      style={{
        width: size, height: size,
        background: disabled
          ? "linear-gradient(135deg, var(--muted) 0%, var(--card) 100%)"
          : "linear-gradient(135deg, var(--card) 0%, color-mix(in oklab, var(--primary) 20%, var(--muted)) 100%)",
        border: `1.5px solid var(--${hinted ? "primary" : "border"})`,
        boxShadow: hinted ? "0 0 0 3px color-mix(in oklab, var(--primary) 45%, transparent)" : undefined,
      }}
    >
      <svg viewBox="0 0 26 26" width={size * 0.6} height={size * 0.6}>
        <path d={arrowPath[piece.dir]} fill="var(--foreground)" />
      </svg>
    </motion.button>
  );
}
