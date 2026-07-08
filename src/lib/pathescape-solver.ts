// Pure BFS solver for Path Escape levels.
// Determines whether ANY sequence of piece moves reaches the target solution.
// Also returns the minimum number of moves found (par candidate).

export type Dir = "U" | "D" | "L" | "R";
export interface Cell { r: number; c: number; dir: Dir }
export interface PieceDef { id: string; cells: Cell[]; startR: number; startC: number }
export interface SolutionPiece { id: string; r: number; c: number }

export interface LevelPayload {
  grid_w: number;
  grid_h: number;
  layout: { pieces: PieceDef[] };
  solution: { pieces: SolutionPiece[] };
}

interface Pos { r: number; c: number }

const DIRS: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function absCells(p: PieceDef, pos: Pos): Cell[] {
  return p.cells.map(c => ({ r: pos.r + c.r, c: pos.c + c.c, dir: c.dir }));
}
function inBounds(p: PieceDef, pos: Pos, gw: number, gh: number) {
  return absCells(p, pos).every(c => c.r >= 0 && c.c >= 0 && c.r < gh && c.c < gw);
}
function collides(p: PieceDef, pos: Pos, occ: Set<string>): boolean {
  return absCells(p, pos).some(c => occ.has(`${c.r},${c.c}`));
}
function occupancy(pieces: PieceDef[], positions: Pos[], except: number): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < pieces.length; i++) {
    if (i === except) continue;
    for (const c of absCells(pieces[i], positions[i])) s.add(`${c.r},${c.c}`);
  }
  return s;
}
function serialize(positions: Pos[]): string {
  return positions.map(p => `${p.r},${p.c}`).join("|");
}

export interface SolveResult {
  solvable: boolean;
  minMoves: number;
  statesExplored: number;
  error?: string;
}

export function solveLevel(level: LevelPayload, opts: { maxStates?: number } = {}): SolveResult {
  const maxStates = opts.maxStates ?? 200_000;
  const pieces = level.layout.pieces;
  if (pieces.length === 0) return { solvable: false, minMoves: 0, statesExplored: 0, error: "No pieces" };

  const idIndex = new Map(pieces.map((p, i) => [p.id, i] as const));
  const targets: Array<Pos | null> = pieces.map(() => null);
  for (const s of level.solution.pieces) {
    const idx = idIndex.get(s.id);
    if (idx === undefined) return { solvable: false, minMoves: 0, statesExplored: 0, error: `Solution references unknown piece ${s.id}` };
    targets[idx] = { r: s.r, c: s.c };
  }
  if (targets.some(t => t === null)) {
    return { solvable: false, minMoves: 0, statesExplored: 0, error: "Every piece must have a solution target" };
  }

  const start: Pos[] = pieces.map(p => ({ r: p.startR, c: p.startC }));
  // Validate start
  for (let i = 0; i < pieces.length; i++) {
    if (!inBounds(pieces[i], start[i], level.grid_w, level.grid_h)) {
      return { solvable: false, minMoves: 0, statesExplored: 0, error: `Piece ${pieces[i].id} starts out of bounds` };
    }
  }
  const targetKey = serialize(targets as Pos[]);

  const visited = new Set<string>();
  const queue: Array<{ positions: Pos[]; depth: number }> = [{ positions: start, depth: 0 }];
  visited.add(serialize(start));
  let explored = 0;

  while (queue.length) {
    const { positions, depth } = queue.shift()!;
    explored++;
    if (serialize(positions) === targetKey) {
      return { solvable: true, minMoves: depth, statesExplored: explored };
    }
    if (explored > maxStates) {
      return { solvable: false, minMoves: 0, statesExplored: explored, error: "Search space exceeded" };
    }
    for (let i = 0; i < pieces.length; i++) {
      const occ = occupancy(pieces, positions, i);
      for (const [dr, dc] of DIRS) {
        // slide any distance (grid-based single-step moves also fine — use any distance to keep BFS shallow)
        let step = 1;
        while (true) {
          const next: Pos = { r: positions[i].r + dr * step, c: positions[i].c + dc * step };
          if (!inBounds(pieces[i], next, level.grid_w, level.grid_h)) break;
          if (collides(pieces[i], next, occ)) break;
          const nextPositions = positions.slice();
          nextPositions[i] = next;
          const key = serialize(nextPositions);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ positions: nextPositions, depth: depth + 1 });
          }
          step++;
          if (step > Math.max(level.grid_w, level.grid_h)) break;
        }
      }
    }
  }
  return { solvable: false, minMoves: 0, statesExplored: explored, error: "No solution found" };
}
