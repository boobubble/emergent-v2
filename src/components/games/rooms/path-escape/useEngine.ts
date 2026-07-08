import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collides, correctCount, inBounds, isSolved, occupancy, type Level, type PiecePos } from "./logic";

export type Status = "idle" | "playing" | "paused" | "won";
export interface MoveLog { pieceId: string; from: PiecePos; to: PiecePos; t: number }

export function useEngine(level: Level | null) {
  const [positions, setPositions] = useState<Record<string, PiecePos>>({});
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [timeMs, setTimeMs] = useState(0);
  const [log, setLog] = useState<MoveLog[]>([]);
  const startRef = useRef<number | null>(null);
  const accumRef = useRef(0);

  useEffect(() => {
    if (!level) return;
    const init: Record<string, PiecePos> = {};
    for (const p of level.layout.pieces) init[p.id] = { r: p.startR, c: p.startC };
    setPositions(init);
    setMoves(0); setTimeMs(0); setLog([]);
    accumRef.current = 0; startRef.current = Date.now();
    setStatus("playing");
  }, [level]);

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => {
      if (startRef.current != null) setTimeMs(accumRef.current + (Date.now() - startRef.current));
    }, 100);
    return () => window.clearInterval(id);
  }, [status]);

  const tryPlace = useCallback((pieceId: string, target: PiecePos): boolean => {
    if (!level || status !== "playing") return false;
    const piece = level.layout.pieces.find(p => p.id === pieceId);
    if (!piece) return false;
    if (!inBounds(piece, target, level.grid_w, level.grid_h)) return false;
    if (collides(piece, target, occupancy(level.layout.pieces, positions, pieceId))) return false;
    const cur = positions[pieceId];
    if (cur && cur.r === target.r && cur.c === target.c) return true;
    setPositions(p => ({ ...p, [pieceId]: target }));
    setMoves(m => m + 1);
    setLog(l => [...l, { pieceId, from: cur, to: target, t: Date.now() - (startRef.current ?? Date.now()) + accumRef.current }]);
    return true;
  }, [level, positions, status]);

  const restart = useCallback(() => {
    if (!level) return;
    const init: Record<string, PiecePos> = {};
    for (const p of level.layout.pieces) init[p.id] = { r: p.startR, c: p.startC };
    setPositions(init); setMoves(0); setTimeMs(0); setLog([]);
    accumRef.current = 0; startRef.current = Date.now(); setStatus("playing");
  }, [level]);

  useEffect(() => {
    if (!level) return;
    if (status === "playing" && isSolved(level, positions)) {
      if (startRef.current != null) accumRef.current += Date.now() - startRef.current;
      startRef.current = null;
      setTimeMs(accumRef.current);
      setStatus("won");
    }
  }, [positions, status, level]);

  const state = useMemo(() => ({
    positions, moves, timeMs, status, log,
    correct: level ? correctCount(level, positions) : 0,
    total: level?.solution.pieces.length ?? 0,
  }), [positions, moves, timeMs, status, log, level]);

  return { state, tryPlace, restart };
}
