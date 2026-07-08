import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { canExit, isCleared, type Level } from "./logic";

export type Status = "playing" | "won";
export interface MoveLog { pieceId: string; t: number }

export function useEngine(level: Level | null) {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [timeMs, setTimeMs] = useState(0);
  const [log, setLog] = useState<MoveLog[]>([]);
  const startRef = useRef<number | null>(null);
  const accumRef = useRef(0);

  useEffect(() => {
    if (!level) return;
    setRemoved(new Set());
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

  const tapPiece = useCallback((pieceId: string): boolean => {
    if (!level || status !== "playing") return false;
    if (!canExit(level, pieceId, removed)) return false;
    const next = new Set(removed); next.add(pieceId);
    setRemoved(next);
    setMoves(m => m + 1);
    setLog(l => [...l, { pieceId, t: Date.now() - (startRef.current ?? Date.now()) + accumRef.current }]);
    return true;
  }, [level, removed, status]);

  const restart = useCallback(() => {
    if (!level) return;
    setRemoved(new Set()); setMoves(0); setTimeMs(0); setLog([]);
    accumRef.current = 0; startRef.current = Date.now(); setStatus("playing");
  }, [level]);

  useEffect(() => {
    if (!level) return;
    if (status === "playing" && isCleared(level, removed)) {
      if (startRef.current != null) accumRef.current += Date.now() - startRef.current;
      startRef.current = null;
      setTimeMs(accumRef.current);
      setStatus("won");
    }
  }, [removed, status, level]);

  const state = useMemo(() => ({
    removed, moves, timeMs, status, log,
    correct: removed.size,
    total: level?.layout.pieces.length ?? 0,
  }), [removed, moves, timeMs, status, log, level]);

  return { state, tapPiece, restart };
}
