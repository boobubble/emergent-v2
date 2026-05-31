// Pure Ludo Lite engine — no Supabase, no React. Used by both server fns
// (authoritative) and the client (purely for optimistic display / move
// legality hints).
//
// Classic-flavored Ludo Lite:
//   - 52-square main track shared by all players
//   - 4 tokens per player, each starts in the "base" (pos = 0)
//   - Must roll 6 to leave the base (token enters at its start square)
//   - 8 safe squares (classic positions) — captures don't apply there
//   - Landing on a single opponent token on a non-safe square sends it home
//   - Stacked own tokens on the same square are safe (a single opponent
//     cannot capture a stack)
//   - 6 squares of "home column" lead to the center; must roll exact to
//     reach the very last square
//   - Rolling a 6 OR capturing an opponent grants an extra turn
//   - All 4 tokens at the final square = win

// ---------- public constants ----------

export const LUDO_TRACK_LEN = 52;          // main shared loop length
export const HOME_COL_LEN = 6;             // squares 53..58, where 58 = home
export const TOKENS_PER_PLAYER = 4;
export const HOME_POS = LUDO_TRACK_LEN + HOME_COL_LEN; // 58 — center

// Lite supports 1v1 only for the rebuilt board. 4-player kept for back-compat
// (4 start squares used if someone still creates a ludo_4p match).
export const LUDO_SEATS_FOR_TYPE: Record<string, number> = {
  ludo_1v1: 2,
  ludo_4p: 4,
};

// Start squares (absolute index on the 52-loop) per seat. Two seats sit
// opposite each other; 4-player mode uses the classic 0/13/26/39.
export const SEAT_START_SQ: number[] = [0, 26, 13, 39];

// Classic safe squares (start squares + the 4 "star" stops between them).
export const SAFE_SQUARES: ReadonlySet<number> = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const SEAT_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]; // blue, red, green, amber
export const SEAT_NAMES = ["Blue", "Red", "Green", "Amber"];

// ---------- types ----------

// Token position encoding (per token, per seat):
//   0           → in base (must roll 6 to leave)
//   1..52       → step count on the main loop (1 = on this seat's start square)
//   53..58      → home column (58 = center / finished)
export interface LudoState {
  tokens: Record<string, number[]>;   // seat -> 4 token positions
  dice: number | null;                // pending roll waiting for move; null = must roll
  rollSeq: number;                    // increments each roll (for client animation)
  lastEvent: string;
}

// ---------- helpers ----------

export function initLudoState(seatCount: number): LudoState {
  const tokens: Record<string, number[]> = {};
  for (let s = 0; s < seatCount; s++) {
    tokens[String(s)] = Array.from({ length: TOKENS_PER_PLAYER }, () => 0);
  }
  return { tokens, dice: null, rollSeq: 0, lastEvent: "Roll the dice to start!" };
}

/** Convert a per-seat token position (1..52) to its absolute square on the
 * shared 52-loop. Returns -1 if the token isn't on the shared loop. */
export function trackSquareFor(seat: number, pos: number): number {
  if (pos < 1 || pos > LUDO_TRACK_LEN) return -1;
  const start = SEAT_START_SQ[seat] ?? 0;
  return (start + pos - 1) % LUDO_TRACK_LEN;
}

export function tokenCanMove(state: LudoState, seat: number, tokenIdx: number, die: number): boolean {
  const pos = state.tokens[String(seat)]?.[tokenIdx];
  if (pos == null) return false;
  if (pos >= HOME_POS) return false;        // already home
  if (pos === 0) return die === 6;          // need a 6 to leave base
  return pos + die <= HOME_POS;             // must reach exactly
}

export function anyTokenCanMove(state: LudoState, seat: number, die: number): boolean {
  const arr = state.tokens[String(seat)] || [];
  return arr.some((_, idx) => tokenCanMove(state, seat, idx, die));
}

// ---------- roll ----------

export interface RollResult { state: LudoState; extraTurn: boolean; mustPass: boolean; }

export function applyRoll(state: LudoState, seat: number, die: number): RollResult {
  const next: LudoState = {
    ...state,
    dice: die,
    rollSeq: state.rollSeq + 1,
    lastEvent: `${SEAT_NAMES[seat] ?? "Seat " + seat} rolled ${die}`,
  };
  const canMove = anyTokenCanMove(next, seat, die);
  if (!canMove) {
    next.dice = null;
    next.lastEvent = `${SEAT_NAMES[seat] ?? "Seat " + seat} rolled ${die} — no legal move`;
    // Rolling a 6 with nothing to move still passes the turn (lite rule).
    return { state: next, extraTurn: false, mustPass: true };
  }
  return { state: next, extraTurn: die === 6, mustPass: false };
}

// ---------- move ----------

export interface MoveResult {
  state: LudoState;
  extraTurn: boolean;
  winnerSeat: number | null;
  captured: { seat: number; tokenIdx: number } | null;
}

export function applyMove(state: LudoState, seat: number, tokenIdx: number): MoveResult | { error: string } {
  if (state.dice == null) return { error: "Roll first" };
  if (!tokenCanMove(state, seat, tokenIdx, state.dice)) return { error: "Token can't move that many" };

  const die = state.dice;
  const tokens: Record<string, number[]> = {};
  for (const k of Object.keys(state.tokens)) tokens[k] = [...state.tokens[k]];

  const curPos = tokens[String(seat)][tokenIdx];
  const newPos = curPos === 0 ? 1 : curPos + die;
  tokens[String(seat)][tokenIdx] = newPos;

  // Capture: only on the shared loop, not on safe squares, and not when the
  // mover joins a stack of opponents (single-opponent rule keeps it Lite).
  let captured: { seat: number; tokenIdx: number } | null = null;
  if (newPos >= 1 && newPos <= LUDO_TRACK_LEN) {
    const abs = trackSquareFor(seat, newPos);
    if (!SAFE_SQUARES.has(abs)) {
      // Find opponents standing on the same absolute square.
      const targets: { seat: number; idx: number }[] = [];
      for (const k of Object.keys(tokens)) {
        const s = Number(k);
        if (s === seat) continue;
        tokens[k].forEach((p, i) => {
          if (p >= 1 && p <= LUDO_TRACK_LEN && trackSquareFor(s, p) === abs) {
            targets.push({ seat: s, idx: i });
          }
        });
      }
      if (targets.length === 1) {
        const t = targets[0];
        tokens[String(t.seat)][t.idx] = 0;
        captured = { seat: t.seat, tokenIdx: t.idx };
      }
    }
  }

  const allHome = tokens[String(seat)].every((p) => p === HOME_POS);
  const winnerSeat = allHome ? seat : null;

  const extraTurn = (die === 6 || captured != null) && winnerSeat == null;
  const name = SEAT_NAMES[seat] ?? "Seat " + seat;
  const next: LudoState = {
    tokens,
    dice: null,
    rollSeq: state.rollSeq,
    lastEvent:
      winnerSeat != null
        ? `${name} wins!`
        : captured
          ? `${name} captured ${SEAT_NAMES[captured.seat] ?? "Seat " + captured.seat}!`
          : newPos === HOME_POS
            ? `${name} got a token home!`
            : `${name} moved token ${tokenIdx + 1}`,
  };
  return { state: next, extraTurn, winnerSeat, captured };
}

export function nextSeat(currentSeat: number, totalSeats: number): number {
  return (currentSeat + 1) % totalSeats;
}
