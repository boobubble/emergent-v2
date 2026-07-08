// Path Flow — pure grid/piece math. No React, no DOM. Testable + tiny.
export type Dir = "U" | "D" | "L" | "R";

export interface Cell { r: number; c: number; dir: Dir }

export interface PieceDef {
  /** Stable identifier from the level layout. */
  id: string;
  /** Cell offsets relative to the piece's origin (top-left). */
  cells: Cell[];
  /** Initial scattered position on the board (origin cell). */
  startR: number;
  startC: number;
}

export interface SolutionPiece { id: string; r: number; c: number }

export interface Level {
  id: string;
  number: number;
  difficulty: "easy" | "normal" | "hard" | "expert" | "master";
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

/** Absolute cells a piece occupies when its origin sits at (r,c). */
export function absoluteCells(piece: PieceDef, pos: PiecePos): Cell[] {
  return piece.cells.map(c => ({ r: pos.r + c.r, c: pos.c + c.c, dir: c.dir }));
}

/** True if placing `piece` at `pos` fits inside the grid. */
export function inBounds(piece: PieceDef, pos: PiecePos, gw: number, gh: number): boolean {
  return absoluteCells(piece, pos).every(c => c.r >= 0 && c.c >= 0 && c.r < gh && c.c < gw);
}

/** True if `piece` at `pos` collides with any occupied cell in `occ`. */
export function collides(piece: PieceDef, pos: PiecePos, occ: Set<string>): boolean {
  return absoluteCells(piece, pos).some(c => occ.has(`${c.r},${c.c}`));
}

export function keyOf(r: number, c: number) { return `${r},${c}` }

/** Build an occupancy set for every piece EXCEPT `exceptId`. */
export function occupancy(
  pieces: PieceDef[],
  positions: Record<string, PiecePos>,
  exceptId?: string,
): Set<string> {
  const s = new Set<string>();
  for (const p of pieces) {
    if (p.id === exceptId) continue;
    for (const c of absoluteCells(p, positions[p.id])) s.add(keyOf(c.r, c.c));
  }
  return s;
}

/** Compare current positions to the level's solution. */
export function isSolved(level: Level, positions: Record<string, PiecePos>): boolean {
  for (const s of level.solution.pieces) {
    const p = positions[s.id];
    if (!p || p.r !== s.r || p.c !== s.c) return false;
  }
  return true;
}

/** How many pieces are already at their solution slot. */
export function correctCount(level: Level, positions: Record<string, PiecePos>): number {
  let n = 0;
  for (const s of level.solution.pieces) {
    const p = positions[s.id];
    if (p && p.r === s.r && p.c === s.c) n++;
  }
  return n;
}

/** Stars: 3 = perfect, 2 = met par time OR par moves with few hints, 1 = completed. */
export function computeStars(opts: {
  timeMs: number; moves: number; hintsUsed: number; parMoves: number; parTime: number;
}): { stars: 1 | 2 | 3; perfect: boolean } {
  const perfect =
    opts.hintsUsed === 0 &&
    opts.moves <= opts.parMoves &&
    opts.timeMs <= opts.parTime * 1000;
  if (perfect) return { stars: 3, perfect: true };
  const nearPar = opts.moves <= opts.parMoves || opts.timeMs <= opts.parTime * 1000;
  if (nearPar && opts.hintsUsed <= 2) return { stars: 2, perfect: false };
  return { stars: 1, perfect: false };
}

/** Pieces sorted by solution row/col — used to pick the next hint target. */
export function nextHintPiece(
  level: Level,
  positions: Record<string, PiecePos>,
): PieceDef | null {
  for (const s of level.solution.pieces) {
    const cur = positions[s.id];
    if (!cur || cur.r !== s.r || cur.c !== s.c) {
      return level.layout.pieces.find(p => p.id === s.id) ?? null;
    }
  }
  return null;
}
