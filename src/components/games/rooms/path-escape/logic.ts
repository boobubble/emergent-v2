// Path Escape — pure grid/arrow math. No React, no DOM.
export type Dir = "U" | "D" | "L" | "R";
export interface Cell { r: number; c: number; dir: Dir }
export interface PieceDef { id: string; cells: Cell[]; startR: number; startC: number }
export interface SolutionPiece { id: string; r: number; c: number }
export interface Level {
  id: string;
  number: number;
  name: string;
  difficulty: "easy" | "normal" | "hard" | "expert" | "master" | "nightmare";
  grid_w: number;
  grid_h: number;
  layout: { pieces: PieceDef[] };
  solution: { pieces: SolutionPiece[] };
  par_moves: number;
  par_time: number;
  coin_reward: number;
  xp_reward: number;
}
export interface PiecePos { r: number; c: number }

export const absoluteCells = (p: PieceDef, pos: PiecePos): Cell[] =>
  p.cells.map(c => ({ r: pos.r + c.r, c: pos.c + c.c, dir: c.dir }));

export const inBounds = (p: PieceDef, pos: PiecePos, gw: number, gh: number) =>
  absoluteCells(p, pos).every(c => c.r >= 0 && c.c >= 0 && c.r < gh && c.c < gw);

export function collides(p: PieceDef, pos: PiecePos, occ: Set<string>): boolean {
  return absoluteCells(p, pos).some(c => occ.has(`${c.r},${c.c}`));
}
export const keyOf = (r: number, c: number) => `${r},${c}`;

export function occupancy(pieces: PieceDef[], positions: Record<string, PiecePos>, except?: string): Set<string> {
  const s = new Set<string>();
  for (const p of pieces) {
    if (p.id === except) continue;
    const pos = positions[p.id]; if (!pos) continue;
    for (const c of absoluteCells(p, pos)) s.add(keyOf(c.r, c.c));
  }
  return s;
}

export function isSolved(level: Level, positions: Record<string, PiecePos>): boolean {
  return level.solution.pieces.every(s => {
    const p = positions[s.id];
    return p && p.r === s.r && p.c === s.c;
  });
}

export function correctCount(level: Level, positions: Record<string, PiecePos>): number {
  return level.solution.pieces.reduce((n, s) => {
    const p = positions[s.id];
    return p && p.r === s.r && p.c === s.c ? n + 1 : n;
  }, 0);
}
