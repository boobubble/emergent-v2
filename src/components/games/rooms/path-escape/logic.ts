// Arrow Escape — tap an arrow, it flies off the board in the direction of its
// tip when the whole path is clear. Blocked by walls, other arrows, and the
// board edges (which the arrow only crosses to exit).
export type Dir = "U" | "D" | "L" | "R";
export interface Cell { r: number; c: number }
export interface PieceDef { id: string; r: number; c: number; dir: Dir }
export interface Level {
  id: string;
  number: number;
  name: string;
  difficulty: "easy" | "normal" | "hard" | "expert" | "master" | "nightmare";
  grid_w: number;
  grid_h: number;
  layout: { pieces: PieceDef[]; walls?: Cell[] };
  // Kept for schema compat with old rows; unused by new mechanic.
  solution?: { pieces: Array<{ id: string; r: number; c: number }> };
  par_moves: number;
  par_time: number;
  coin_reward: number;
  xp_reward: number;
}

export const DELTA: Record<Dir, { dr: number; dc: number }> = {
  U: { dr: -1, dc: 0 },
  D: { dr: 1, dc: 0 },
  L: { dr: 0, dc: -1 },
  R: { dr: 0, dc: 1 },
};

const keyOf = (r: number, c: number) => `${r},${c}`;

export function isValidLevel(level: Level | null | undefined): level is Level {
  const pieces = level?.layout?.pieces ?? [];
  if (!pieces.length) return false;
  return pieces.every(p => typeof p.r === "number" && typeof p.c === "number" && !!p.dir);
}

/** true when tapping `pieceId` would clear a path to the edge (removing it). */
export function canExit(level: Level, pieceId: string, removed: Set<string>): boolean {
  const piece = level.layout.pieces.find(p => p.id === pieceId);
  if (!piece || removed.has(pieceId)) return false;
  const walls = new Set((level.layout.walls ?? []).map(w => keyOf(w.r, w.c)));
  const blockers = new Set(
    level.layout.pieces
      .filter(p => p.id !== pieceId && !removed.has(p.id))
      .map(p => keyOf(p.r, p.c)),
  );
  const { dr, dc } = DELTA[piece.dir];
  let r = piece.r + dr, c = piece.c + dc;
  while (r >= 0 && c >= 0 && r < level.grid_h && c < level.grid_w) {
    const k = keyOf(r, c);
    if (walls.has(k) || blockers.has(k)) return false;
    r += dr; c += dc;
  }
  return true;
}

export function isCleared(level: Level, removed: Set<string>): boolean {
  return level.layout.pieces.every(p => removed.has(p.id));
}

/** true if at least one un-removed piece can currently exit. */
export function hasAnyMove(level: Level, removed: Set<string>): boolean {
  return level.layout.pieces.some(p => !removed.has(p.id) && canExit(level, p.id, removed));
}

/** true if the level is solvable from the given state via some tap order. */
export function isSolvable(level: Level, removed: Set<string> = new Set()): boolean {
  if (isCleared(level, removed)) return true;
  const seen = new Set<string>();
  const dfs = (rem: Set<string>): boolean => {
    if (isCleared(level, rem)) return true;
    const key = [...rem].sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    for (const p of level.layout.pieces) {
      if (rem.has(p.id)) continue;
      if (!canExit(level, p.id, rem)) continue;
      const next = new Set(rem); next.add(p.id);
      if (dfs(next)) return true;
    }
    return false;
  };
  return dfs(new Set(removed));
}

