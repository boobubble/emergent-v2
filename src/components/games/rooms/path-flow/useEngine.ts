import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  absoluteCells,
  collides,
  computeStars,
  correctCount,
  inBounds,
  isSolved,
  nextHintPiece,
  occupancy,
  type Level,
  type PiecePos,
} from "./logic";

export type EngineStatus = "idle" | "playing" | "paused" | "won";

export interface EngineState {
  status: EngineStatus;
  positions: Record<string, PiecePos>;
  moves: number;
  hintsUsed: number;
  timeMs: number;
  stars: 1 | 2 | 3 | 0;
  perfect: boolean;
  correct: number;
  total: number;
}

/** Pure game engine — knows nothing about network. */
export function useEngine(level: Level | null) {
  const [positions, setPositions] = useState<Record<string, PiecePos>>({});
  const [moves, setMoves] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [timeMs, setTimeMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const accumRef = useRef(0);

  // Reset when level changes.
  useEffect(() => {
    if (!level) return;
    const init: Record<string, PiecePos> = {};
    for (const p of level.layout.pieces) init[p.id] = { r: p.startR, c: p.startC };
    setPositions(init);
    setMoves(0);
    setHintsUsed(0);
    setStatus("playing");
    setTimeMs(0);
    accumRef.current = 0;
    startRef.current = Date.now();
  }, [level]);

  // Timer.
  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => {
      if (startRef.current == null) return;
      setTimeMs(accumRef.current + (Date.now() - startRef.current));
    }, 100);
    return () => window.clearInterval(id);
  }, [status]);

  const pause = useCallback(() => {
    setStatus(s => {
      if (s !== "playing") return s;
      if (startRef.current != null) accumRef.current += Date.now() - startRef.current;
      startRef.current = null;
      return "paused";
    });
  }, []);

  const resume = useCallback(() => {
    setStatus(s => {
      if (s !== "paused") return s;
      startRef.current = Date.now();
      return "playing";
    });
  }, []);

  const restart = useCallback(() => {
    if (!level) return;
    const init: Record<string, PiecePos> = {};
    for (const p of level.layout.pieces) init[p.id] = { r: p.startR, c: p.startC };
    setPositions(init);
    setMoves(0);
    setHintsUsed(0);
    setStatus("playing");
    setTimeMs(0);
    accumRef.current = 0;
    startRef.current = Date.now();
  }, [level]);

  /** Attempt to place a piece at absolute origin (r,c). Returns whether accepted. */
  const tryPlace = useCallback((pieceId: string, target: PiecePos): boolean => {
    if (!level || status !== "playing") return false;
    const piece = level.layout.pieces.find(p => p.id === pieceId);
    if (!piece) return false;
    if (!inBounds(piece, target, level.grid_w, level.grid_h)) return false;
    const occ = occupancy(level.layout.pieces, positions, pieceId);
    if (collides(piece, target, occ)) return false;

    const cur = positions[pieceId];
    if (cur && cur.r === target.r && cur.c === target.c) return true; // no-op
    setPositions(p => ({ ...p, [pieceId]: target }));
    setMoves(m => m + 1);
    return true;
  }, [level, positions, status]);

  const applyHint = useCallback((): boolean => {
    if (!level || status !== "playing") return false;
    const piece = nextHintPiece(level, positions);
    if (!piece) return false;
    const sol = level.solution.pieces.find(s => s.id === piece.id);
    if (!sol) return false;
    // Ensure destination is clear by ejecting any conflicting pieces back to start.
    const target = { r: sol.r, c: sol.c };
    const others = level.layout.pieces.filter(p => p.id !== piece.id);
    const conflict = others.filter(p =>
      absoluteCells(p, positions[p.id]).some(cell =>
        absoluteCells(piece, target).some(dst => dst.r === cell.r && dst.c === cell.c),
      ),
    );
    setPositions(cur => {
      const next = { ...cur };
      for (const c of conflict) next[c.id] = { r: c.startR, c: c.startC };
      next[piece.id] = target;
      return next;
    });
    setHintsUsed(h => h + 1);
    setMoves(m => m + 1);
    return true;
  }, [level, positions, status]);

  // Detect win.
  const solved = level ? isSolved(level, positions) : false;
  useEffect(() => {
    if (solved && status === "playing") {
      if (startRef.current != null) accumRef.current += Date.now() - startRef.current;
      startRef.current = null;
      setTimeMs(accumRef.current);
      setStatus("won");
    }
  }, [solved, status]);

  const state = useMemo<EngineState>(() => {
    const total = level?.layout.pieces.length ?? 0;
    const done = level ? correctCount(level, positions) : 0;
    const s = level && status === "won"
      ? computeStars({ timeMs, moves, hintsUsed, parMoves: level.par_moves, parTime: level.par_time })
      : { stars: 0 as 0, perfect: false };
    return {
      status,
      positions,
      moves,
      hintsUsed,
      timeMs,
      stars: s.stars,
      perfect: s.perfect,
      correct: done,
      total,
    };
  }, [status, positions, moves, hintsUsed, timeMs, level]);

  return { state, tryPlace, applyHint, pause, resume, restart };
}
