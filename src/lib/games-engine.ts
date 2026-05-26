// Pure Ludo engine — no Supabase, no React. Used by both server fns (authoritative)
// and the client (purely for optimistic display / move legality hints).

export const LUDO_TRACK_LEN = 30;          // squares 0..30 (30 = home)
export const TOKENS_PER_PLAYER = 2;
export const LUDO_SEATS_FOR_TYPE: Record<string, number> = {
  ludo_1v1: 2,
  ludo_4p: 4,
};
export const SEAT_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]; // blue, red, green, amber
export const SEAT_NAMES = ["Blue", "Red", "Green", "Amber"];

export interface LudoState {
  tokens: Record<string, number[]>;   // seat -> array of token positions (0..LUDO_TRACK_LEN)
  dice: number | null;                // pending roll waiting for move; null = must roll
  rollSeq: number;                    // increments each roll (for client animations)
  lastEvent: string;
}

export function initLudoState(seatCount: number): LudoState {
  const tokens: Record<string, number[]> = {};
  for (let s = 0; s < seatCount; s++) {
    tokens[String(s)] = Array.from({ length: TOKENS_PER_PLAYER }, () => 0);
  }
  return { tokens, dice: null, rollSeq: 0, lastEvent: "Game on — roll the dice!" };
}

export function tokenCanMove(state: LudoState, seat: number, tokenIdx: number, die: number): boolean {
  const pos = state.tokens[String(seat)]?.[tokenIdx];
  if (pos == null) return false;
  if (pos >= LUDO_TRACK_LEN) return false;       // already home
  return pos + die <= LUDO_TRACK_LEN;             // exact roll needed to finish
}

export function anyTokenCanMove(state: LudoState, seat: number, die: number): boolean {
  const arr = state.tokens[String(seat)] || [];
  return arr.some((_, idx) => tokenCanMove(state, seat, idx, die));
}

export interface RollResult { state: LudoState; extraTurn: boolean; mustPass: boolean; }

export function applyRoll(state: LudoState, seat: number, die: number): RollResult {
  const next: LudoState = {
    ...state,
    dice: die,
    rollSeq: state.rollSeq + 1,
    lastEvent: `Seat ${seat} rolled ${die}`,
  };
  const extraTurn = die === 6;
  const canMove = anyTokenCanMove(next, seat, die);
  if (!canMove) {
    next.dice = null;
    next.lastEvent = `Seat ${seat} rolled ${die} — no legal move`;
    return { state: next, extraTurn, mustPass: !extraTurn };
  }
  return { state: next, extraTurn, mustPass: false };
}

export interface MoveResult { state: LudoState; extraTurn: boolean; winnerSeat: number | null; captured: { seat: number; tokenIdx: number } | null; }

export function applyMove(state: LudoState, seat: number, tokenIdx: number): MoveResult | { error: string } {
  if (state.dice == null) return { error: "Roll first" };
  if (!tokenCanMove(state, seat, tokenIdx, state.dice)) return { error: "Token can't move that many" };

  const die = state.dice;
  const tokens: Record<string, number[]> = {};
  for (const k of Object.keys(state.tokens)) tokens[k] = [...state.tokens[k]];
  const newPos = tokens[String(seat)][tokenIdx] + die;
  tokens[String(seat)][tokenIdx] = newPos;

  // Capture: any opponent token sitting on newPos (and not at start or home) goes back to 0.
  let captured = null as { seat: number; tokenIdx: number } | null;
  if (newPos > 0 && newPos < LUDO_TRACK_LEN) {
    for (const k of Object.keys(tokens)) {
      const s = Number(k);
      if (s === seat) continue;
      tokens[k].forEach((p, i) => {
        if (p === newPos) {
          tokens[k][i] = 0;
          captured = { seat: s, tokenIdx: i };
        }
      });
    }
  }

  // Win = all of seat's tokens at LUDO_TRACK_LEN
  const allHome = tokens[String(seat)].every(p => p === LUDO_TRACK_LEN);
  const winnerSeat = allHome ? seat : null;

  const extraTurn = die === 6 && !winnerSeat;
  const next: LudoState = {
    tokens,
    dice: null,
    rollSeq: state.rollSeq,
    lastEvent: captured
      ? `Seat ${seat} captured seat ${captured.seat}!`
      : (winnerSeat != null ? `Seat ${seat} wins!` : `Seat ${seat} moved token ${tokenIdx + 1} → ${newPos}`),
  };
  return { state: next, extraTurn, winnerSeat, captured };
}

export function nextSeat(currentSeat: number, totalSeats: number): number {
  return (currentSeat + 1) % totalSeats;
}
