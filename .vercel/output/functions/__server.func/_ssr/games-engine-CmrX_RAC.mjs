const LUDO_TRACK_LEN = 52;
const HOME_COL_LEN = 6;
const TOKENS_PER_PLAYER = 4;
const HOME_POS = LUDO_TRACK_LEN + HOME_COL_LEN;
const LUDO_SEATS_FOR_TYPE = {
  ludo_1v1: 2,
  ludo_4p: 4
};
const SEAT_START_SQ = [0, 26, 13, 39];
const SAFE_SQUARES = /* @__PURE__ */ new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const SEAT_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];
const SEAT_NAMES = ["Blue", "Red", "Green", "Amber"];
function initLudoState(seatCount) {
  const tokens = {};
  for (let s = 0; s < seatCount; s++) {
    tokens[String(s)] = Array.from({ length: TOKENS_PER_PLAYER }, () => 0);
  }
  return { tokens, dice: null, rollSeq: 0, lastEvent: "Roll the dice to start!" };
}
function trackSquareFor(seat, pos) {
  if (pos < 1 || pos > LUDO_TRACK_LEN) return -1;
  const start = SEAT_START_SQ[seat] ?? 0;
  return (start + pos - 1) % LUDO_TRACK_LEN;
}
function tokenCanMove(state, seat, tokenIdx, die) {
  const pos = state.tokens[String(seat)]?.[tokenIdx];
  if (pos == null) return false;
  if (pos >= HOME_POS) return false;
  if (pos === 0) return die === 6;
  return pos + die <= HOME_POS;
}
function anyTokenCanMove(state, seat, die) {
  const arr = state.tokens[String(seat)] || [];
  return arr.some((_, idx) => tokenCanMove(state, seat, idx, die));
}
function applyRoll(state, seat, die) {
  const next = {
    ...state,
    dice: die,
    rollSeq: state.rollSeq + 1,
    lastEvent: `${SEAT_NAMES[seat] ?? "Seat " + seat} rolled ${die}`
  };
  const canMove = anyTokenCanMove(next, seat, die);
  if (!canMove) {
    next.dice = null;
    next.lastEvent = `${SEAT_NAMES[seat] ?? "Seat " + seat} rolled ${die} — no legal move`;
    return { state: next, extraTurn: false, mustPass: true };
  }
  return { state: next, extraTurn: die === 6, mustPass: false };
}
function applyMove(state, seat, tokenIdx) {
  if (state.dice == null) return { error: "Roll first" };
  if (!tokenCanMove(state, seat, tokenIdx, state.dice)) return { error: "Token can't move that many" };
  const die = state.dice;
  const tokens = {};
  for (const k of Object.keys(state.tokens)) tokens[k] = [...state.tokens[k]];
  const curPos = tokens[String(seat)][tokenIdx];
  const newPos = curPos === 0 ? 1 : curPos + die;
  tokens[String(seat)][tokenIdx] = newPos;
  let captured = null;
  if (newPos >= 1 && newPos <= LUDO_TRACK_LEN) {
    const abs = trackSquareFor(seat, newPos);
    if (!SAFE_SQUARES.has(abs)) {
      const targets = [];
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
  const next = {
    tokens,
    dice: null,
    rollSeq: state.rollSeq,
    lastEvent: winnerSeat != null ? `${name} wins!` : captured ? `${name} captured ${SEAT_NAMES[captured.seat] ?? "Seat " + captured.seat}!` : newPos === HOME_POS ? `${name} got a token home!` : `${name} moved token ${tokenIdx + 1}`
  };
  return { state: next, extraTurn, winnerSeat, captured };
}
function nextSeat(currentSeat, totalSeats) {
  return (currentSeat + 1) % totalSeats;
}
export {
  HOME_POS as H,
  LUDO_SEATS_FOR_TYPE as L,
  SEAT_COLORS as S,
  TOKENS_PER_PLAYER as T,
  applyRoll as a,
  applyMove as b,
  SEAT_NAMES as c,
  SAFE_SQUARES as d,
  LUDO_TRACK_LEN as e,
  SEAT_START_SQ as f,
  trackSquareFor as g,
  initLudoState as i,
  nextSeat as n,
  tokenCanMove as t
};
