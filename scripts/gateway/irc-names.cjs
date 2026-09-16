/**
 * IRC NAMES (353 / 366) parsing for member snapshots.
 */

const { fromIrcChannel } = require("./irc-room-discovery.cjs");

const IGNORE_NICKS = new Set(["yaarzogateway", "yaarzo-gateway"]);

/** RFC 353 — `:server 353 nick [=|@] #channel :nick1 nick2` */
const NUMERIC_353_RE = / \d+ \S+ [=@] (#\S+) :(.+)$/i;
/** RFC 366 — `:server 366 nick #channel :End of /NAMES` */
const NUMERIC_366_RE = / \d+ \S+ (#\S+) :End of \/NAMES/i;

function stripIrcNameToken(token) {
  let t = String(token || "").trim();
  if (!t) return "";
  if (t.startsWith("@") || t.startsWith("+") || t.startsWith("%") || t.startsWith("&") || t.startsWith("~")) {
    t = t.slice(1);
  }
  return t.trim();
}

function parseNames353Line(line) {
  const match = NUMERIC_353_RE.exec(line);
  if (!match) return null;
  const channel = match[1];
  const room = fromIrcChannel(channel) || channel.slice(1);
  const raw = match[2] || "";
  const nicks = raw
    .split(/\s+/)
    .map(stripIrcNameToken)
    .filter((n) => n && !IGNORE_NICKS.has(n.toLowerCase()));
  return { room, nicks };
}

function parseNames366Line(line) {
  const match = NUMERIC_366_RE.exec(line);
  if (!match) return null;
  const channel = match[1];
  const room = fromIrcChannel(channel) || channel.slice(1);
  return { room };
}

function createNamesAccumulator() {
  /** @type {Map<string, Set<string>>} */
  const pending = new Map();

  return {
    ingest353(line) {
      const parsed = parseNames353Line(line);
      if (!parsed) return null;
      const set = pending.get(parsed.room) || new Set();
      for (const nick of parsed.nicks) set.add(nick);
      pending.set(parsed.room, set);
      return parsed.room;
    },
    ingest366(line) {
      const parsed = parseNames366Line(line);
      if (!parsed) return null;
      const nicks = [...(pending.get(parsed.room) || new Set())];
      pending.delete(parsed.room);
      return { room: parsed.room, nicks };
    },
    reset(room) {
      if (room) pending.delete(room);
      else pending.clear();
    },
  };
}

module.exports = {
  IGNORE_NICKS,
  stripIrcNameToken,
  parseNames353Line,
  parseNames366Line,
  createNamesAccumulator,
};
