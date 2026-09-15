/**
 * IRC room discovery lifecycle helpers for the Yaarzo chat gateway.
 * LIST must run only after registration (001) and startup JOIN confirmations.
 */

function fromIrcChannel(channel) {
  const value = String(channel || "").trim();
  if (!value) return null;
  if (value.startsWith(":")) return fromIrcChannel(value.slice(1));
  if (!value.startsWith("#")) return value;
  return value.slice(1) || null;
}

function toIrcChannel(room) {
  const value = String(room || "").trim();
  if (!value) return null;
  if (value.startsWith("#")) return value;
  return `#${value}`;
}

function parseIrcNumeric(line) {
  const s = String(line || "");
  const bare = s.match(/^(\d{3})\s/);
  if (bare) return Number(bare[1]);
  const prefixed = s.match(/\s(\d{3})\s/);
  return prefixed ? Number(prefixed[1]) : null;
}

function isWelcomeNumeric(line) {
  return parseIrcNumeric(line) === 1;
}

function parseListEntry322(line) {
  const m = String(line || "").match(/\s322\s+\S+\s+(#\S+)\s+(\d+)\s*(?::(.*))?$/);
  if (!m) return null;
  const channel = m[1];
  const room = fromIrcChannel(channel);
  if (!room) return null;
  return {
    room,
    channel,
    users: Number(m[2]) || 0,
    topic: typeof m[3] === "string" ? m[3] : "",
  };
}

function isListEnd323(line) {
  return parseIrcNumeric(line) === 323;
}

function parseSelfJoin(line, nick) {
  const safeNick = String(nick || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = String(line || "").match(
    new RegExp(`^:${safeNick}!\\S+\\s+JOIN\\s+:?(#\\S+)`, "i"),
  );
  if (!m) return null;
  return m[1];
}

function parseSelfPart(line, nick) {
  const safeNick = String(nick || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = String(line || "").match(
    new RegExp(`^:${safeNick}!\\S+\\s+PART\\s+(#\\S+)`, "i"),
  );
  if (!m) return null;
  return m[1];
}

function parseJoinErrorChannel(line) {
  const m = String(line || "").match(/\s(?:403|405|473|474|475)\s+\S+\s+(#\S+)/);
  return m ? m[1] : null;
}

function buildRoomsPayload(ircRoomList, primaryRoomCandidate) {
  const rooms = Array.from(ircRoomList.values());
  let primaryRoom =
    typeof primaryRoomCandidate === "string" && primaryRoomCandidate.trim()
      ? primaryRoomCandidate.trim()
      : null;
  if (primaryRoom && !rooms.some((r) => r.room === primaryRoom)) primaryRoom = null;
  return {
    ok: true,
    source: "irc",
    primaryRoom,
    rooms,
  };
}

function createStartupJoinTracker(channels) {
  const targets = new Set(channels.filter(Boolean));
  const resolved = new Set();
  return {
    targets,
    noteJoinAttemptResolved(channel) {
      if (targets.has(channel)) resolved.add(channel);
    },
    isStartupComplete() {
      if (targets.size === 0) return true;
      return resolved.size >= targets.size;
    },
    reset(nextChannels) {
      targets.clear();
      resolved.clear();
      for (const ch of nextChannels) if (ch) targets.add(ch);
    },
  };
}

module.exports = {
  fromIrcChannel,
  toIrcChannel,
  parseIrcNumeric,
  isWelcomeNumeric,
  parseListEntry322,
  isListEnd323,
  parseSelfJoin,
  parseSelfPart,
  parseJoinErrorChannel,
  buildRoomsPayload,
  createStartupJoinTracker,
};
