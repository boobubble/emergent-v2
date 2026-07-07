import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Level, Rotation } from "./logic";
import { isSolved, poweredTiles, rotateCW, rotateCCW } from "./logic";

/**
 * Client-side engine for Arrow Flow. Owns the mutable level state,
 * timer, moves count, and solved flag. Keeps the move log so the server
 * can replay + verify on submission.
 */
export function useArrowFlowEngine(initial: Level | null) {
  const [level, setLevel] = useState<Level | null>(initial);
  const [moves, setMoves] = useState(0);
  const [moveLog, setMoveLog] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [focused, setFocused] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  // Reset when a new level is loaded.
  useEffect(() => {
    setLevel(initial);
    setMoves(0);
    setMoveLog([]);
    setElapsed(0);
    setSolved(false);
    setStartedAt(initial ? Date.now() : null);
    setHintsUsed(0);
    setFocused(0);
  }, [initial]);

  // Timer.
  useEffect(() => {
    if (!startedAt || solved) return;
    const step = () => {
      setElapsed(Date.now() - startedAt);
      tickRef.current = window.setTimeout(step, 250);
    };
    step();
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [startedAt, solved]);

  const powered = useMemo(() => (level ? poweredTiles(level) : new Set<number>()), [level]);

  const rotate = useCallback((tileIdx: number, direction: "cw" | "ccw" = "cw") => {
    setLevel((cur) => {
      if (!cur || solved) return cur;
      const piece = cur.pieces[tileIdx];
      if (!piece || piece.shape === "none" || piece.locked) return cur;
      const pieces = cur.pieces.slice();
      pieces[tileIdx] = { ...piece, rot: (direction === "cw" ? rotateCW(piece.rot) : rotateCCW(piece.rot)) };
      const next = { ...cur, pieces };
      if (isSolved(next)) setSolved(true);
      return next;
    });
    setMoves((n) => n + 1);
    setMoveLog((log) => [...log, tileIdx]);
  }, [solved]);

  const applyHint = useCallback((tileIdx: number, targetRot: Rotation) => {
    setLevel((cur) => {
      if (!cur) return cur;
      const piece = cur.pieces[tileIdx];
      if (!piece) return cur;
      const pieces = cur.pieces.slice();
      pieces[tileIdx] = { ...piece, rot: targetRot };
      const next = { ...cur, pieces };
      if (isSolved(next)) setSolved(true);
      return next;
    });
    setHintsUsed((n) => n + 1);
  }, []);

  const restart = useCallback(() => {
    setLevel(initial);
    setMoves(0);
    setMoveLog([]);
    setElapsed(0);
    setSolved(false);
    setHintsUsed(0);
    setStartedAt(initial ? Date.now() : null);
  }, [initial]);

  return {
    level,
    moves,
    moveLog,
    elapsed,
    solved,
    powered,
    focused,
    setFocused,
    hintsUsed,
    rotate,
    applyHint,
    restart,
  };
}
