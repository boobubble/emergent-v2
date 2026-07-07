/**
 * Arrow Flow — path puzzle logic.
 *
 * A level is a grid of pieces. Each piece has a shape and a rotation
 * (0..3 = 0°, 90°, 180°, 270° clockwise). Endpoints are labelled by side:
 *   0 = top, 1 = right, 2 = bottom, 3 = left.
 *
 * The puzzle is solved when there is exactly one connected component of
 * pieces (ignoring the empty "none" tiles) that:
 *   - contains all non-empty tiles,
 *   - includes both the source and sink,
 *   - every endpoint of every piece connects to a matching endpoint on
 *     its neighbour (no dangling arrows).
 */

export type Shape = "none" | "straight" | "curve" | "tee" | "cross" | "source" | "sink";
export type Rotation = 0 | 1 | 2 | 3;
export type Side = 0 | 1 | 2 | 3;

export interface Piece {
  shape: Shape;
  rot: Rotation;
  /** If true, this piece is fixed and cannot be rotated by the player. */
  locked?: boolean;
}

export interface Level {
  gridSize: number;
  /** row-major, length = gridSize * gridSize */
  pieces: Piece[];
}

/** Base endpoints for each shape at rotation 0. */
const BASE_ENDPOINTS: Record<Shape, Side[]> = {
  none: [],
  source: [2],           // opens downward at rot 0
  sink: [0],             // opens upward at rot 0
  straight: [0, 2],      // vertical at rot 0
  curve: [1, 2],         // bottom + right at rot 0
  tee: [1, 2, 3],        // T with the flat side up at rot 0
  cross: [0, 1, 2, 3],
};

export function endpoints(p: Piece): Side[] {
  const base = BASE_ENDPOINTS[p.shape];
  return base.map((s) => ((s + p.rot) % 4) as Side);
}

export function hasEndpoint(p: Piece, side: Side): boolean {
  return endpoints(p).includes(side);
}

export function rotateCW(r: Rotation): Rotation {
  return ((r + 1) % 4) as Rotation;
}
export function rotateCCW(r: Rotation): Rotation {
  return ((r + 3) % 4) as Rotation;
}

/** Opposite side: top<->bottom, left<->right. */
export function opposite(s: Side): Side {
  return ((s + 2) % 4) as Side;
}

/** Index math helpers. */
export function idx(row: number, col: number, size: number) {
  return row * size + col;
}
export function neighborIndex(i: number, side: Side, size: number): number | null {
  const r = Math.floor(i / size);
  const c = i % size;
  if (side === 0 && r > 0) return (r - 1) * size + c;
  if (side === 1 && c < size - 1) return r * size + (c + 1);
  if (side === 2 && r < size - 1) return (r + 1) * size + c;
  if (side === 3 && c > 0) return r * size + (c - 1);
  return null;
}

/**
 * Check whether the current arrangement is solved:
 * every non-empty piece's endpoints must connect to a matching
 * neighbour endpoint, and all non-empty tiles must be reachable from
 * the source.
 */
export function isSolved(level: Level): boolean {
  const { gridSize, pieces } = level;
  const sourceIdx = pieces.findIndex((p) => p.shape === "source");
  const sinkIdx = pieces.findIndex((p) => p.shape === "sink");
  if (sourceIdx < 0 || sinkIdx < 0) return false;

  // Endpoint match check
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    if (p.shape === "none") continue;
    for (const side of endpoints(p)) {
      const ni = neighborIndex(i, side, gridSize);
      if (ni === null) return false;
      const n = pieces[ni];
      if (n.shape === "none") return false;
      if (!hasEndpoint(n, opposite(side))) return false;
    }
  }

  // BFS from source, must reach every non-empty tile including sink.
  const seen = new Set<number>([sourceIdx]);
  const queue = [sourceIdx];
  while (queue.length) {
    const cur = queue.shift()!;
    const p = pieces[cur];
    for (const side of endpoints(p)) {
      const ni = neighborIndex(cur, side, gridSize);
      if (ni === null || seen.has(ni)) continue;
      seen.add(ni);
      queue.push(ni);
    }
  }
  const totalNonEmpty = pieces.filter((p) => p.shape !== "none").length;
  return seen.has(sinkIdx) && seen.size === totalNonEmpty;
}

/**
 * Which tiles are currently "powered" — reachable from source through
 * matched endpoints. Used for the animated glow.
 */
export function poweredTiles(level: Level): Set<number> {
  const { gridSize, pieces } = level;
  const sourceIdx = pieces.findIndex((p) => p.shape === "source");
  if (sourceIdx < 0) return new Set();
  const seen = new Set<number>([sourceIdx]);
  const queue = [sourceIdx];
  while (queue.length) {
    const cur = queue.shift()!;
    const p = pieces[cur];
    for (const side of endpoints(p)) {
      const ni = neighborIndex(cur, side, gridSize);
      if (ni === null) continue;
      const n = pieces[ni];
      if (n.shape === "none") continue;
      if (!hasEndpoint(n, opposite(side))) continue;
      if (seen.has(ni)) continue;
      seen.add(ni);
      queue.push(ni);
    }
  }
  return seen;
}

/**
 * Apply a move log (list of tile indices tapped clockwise) to a starting
 * layout. Used server-side for anti-cheat replay.
 */
export function applyMoves(start: Level, moves: number[]): Level {
  const pieces = start.pieces.map((p) => ({ ...p }));
  for (const m of moves) {
    if (m < 0 || m >= pieces.length) continue;
    const p = pieces[m];
    if (p.locked || p.shape === "none") continue;
    p.rot = rotateCW(p.rot);
  }
  return { gridSize: start.gridSize, pieces };
}

/**
 * Puzzle generator used by the admin builder. It lays out a random
 * connected path from source to sink and then scrambles rotations.
 * Guarantees at least one solution exists (the un-scrambled state).
 */
export function generatePuzzle(gridSize: number, difficulty: string): { layout: Level; solution: Rotation[] } {
  const total = gridSize * gridSize;
  const pieces: Piece[] = Array.from({ length: total }, () => ({ shape: "none", rot: 0 }));

  // Random walk from a source cell to a sink cell.
  const startR = Math.floor(Math.random() * gridSize);
  const startC = 0;
  const endR = Math.floor(Math.random() * gridSize);
  const endC = gridSize - 1;

  const path: number[] = [idx(startR, startC, gridSize)];
  let r = startR;
  let c = startC;
  const visited = new Set<number>(path);
  const targetLen = Math.min(total, Math.max(gridSize * 2, Math.floor(total * 0.7)));

  while (path.length < targetLen && !(r === endR && c === endC)) {
    const options: [number, number][] = [];
    if (r > 0 && !visited.has(idx(r - 1, c, gridSize))) options.push([r - 1, c]);
    if (r < gridSize - 1 && !visited.has(idx(r + 1, c, gridSize))) options.push([r + 1, c]);
    if (c > 0 && !visited.has(idx(r, c - 1, gridSize))) options.push([r, c - 1]);
    if (c < gridSize - 1 && !visited.has(idx(r, c + 1, gridSize))) options.push([r, c + 1]);
    if (options.length === 0) break;
    // Bias toward the sink for higher difficulty.
    options.sort((a, b) => Math.abs(a[0] - endR) + Math.abs(a[1] - endC) - (Math.abs(b[0] - endR) + Math.abs(b[1] - endC)));
    const pick = difficulty === "easy" ? options[0] : options[Math.floor(Math.random() * options.length)];
    r = pick[0];
    c = pick[1];
    const i = idx(r, c, gridSize);
    path.push(i);
    visited.add(i);
  }

  // Force final tile at sink if we haven't landed there.
  if (r !== endR || c !== endC) {
    while (r !== endR) {
      r += r < endR ? 1 : -1;
      const i = idx(r, c, gridSize);
      if (!visited.has(i)) { path.push(i); visited.add(i); }
    }
    while (c !== endC) {
      c += c < endC ? 1 : -1;
      const i = idx(r, c, gridSize);
      if (!visited.has(i)) { path.push(i); visited.add(i); }
    }
  }

  // Convert path steps into piece shapes with correct rotations.
  for (let step = 0; step < path.length; step++) {
    const here = path[step];
    const prev = step > 0 ? path[step - 1] : null;
    const next = step < path.length - 1 ? path[step + 1] : null;
    const sides: Side[] = [];
    if (prev !== null) sides.push(sideBetween(here, prev, gridSize));
    if (next !== null) sides.push(sideBetween(here, next, gridSize));
    let shape: Shape;
    let rot: Rotation = 0;
    if (step === 0) {
      shape = "source";
      // rotate so opening points at `next`
      rot = ((sides[0] - BASE_ENDPOINTS.source[0] + 4) % 4) as Rotation;
    } else if (step === path.length - 1) {
      shape = "sink";
      rot = ((sides[0] - BASE_ENDPOINTS.sink[0] + 4) % 4) as Rotation;
    } else {
      const [a, b] = sides;
      if (a === opposite(b)) {
        shape = "straight";
        rot = (a % 2 === 0 ? 0 : 1) as Rotation;
      } else {
        shape = "curve";
        // Curve base endpoints are [1(right), 2(bottom)]. Find rotation.
        rot = findRotation("curve", [a, b]);
      }
    }
    pieces[here] = { shape, rot };
  }

  const solution = pieces.map((p) => p.rot as Rotation);
  // Scramble rotations for the layout the player starts from.
  const scrambleMoves = { easy: 2, normal: 3, hard: 4, expert: 5, master: 6 }[difficulty] ?? 3;
  for (const i of path) {
    if (pieces[i].shape === "none") continue;
    const spin = Math.floor(Math.random() * scrambleMoves) + 1;
    pieces[i] = { ...pieces[i], rot: ((pieces[i].rot + spin) % 4) as Rotation };
  }
  return { layout: { gridSize, pieces }, solution };
}

function sideBetween(from: number, to: number, size: number): Side {
  const fr = Math.floor(from / size), fc = from % size;
  const tr = Math.floor(to / size), tc = to % size;
  if (tr === fr - 1) return 0;
  if (tc === fc + 1) return 1;
  if (tr === fr + 1) return 2;
  return 3;
}

function findRotation(shape: Shape, wanted: Side[]): Rotation {
  const base = BASE_ENDPOINTS[shape];
  for (let r = 0; r < 4; r++) {
    const rotated = base.map((s) => ((s + r) % 4) as Side).sort();
    const target = [...wanted].sort();
    if (rotated.length === target.length && rotated.every((v, i) => v === target[i])) {
      return r as Rotation;
    }
  }
  return 0;
}
