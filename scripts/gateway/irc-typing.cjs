/**
 * Ephemeral IRC room typing indicators (gateway-only, not IRC).
 */

const { validateRoomId } = require("./irc-moderation.cjs");

const TYPING_TTL_MS = 4000;
const MIN_START_INTERVAL_MS = 800;

function createTypingRegistry() {
  /** @type {Map<string, Map<string, { nick: string, expiresAt: number }>>} */
  const byRoom = new Map();
  /** @type {Map<object, { rooms: Set<string>, lastStartAt: number }>} */
  const byWs = new Map();

  function roomMap(room) {
    let map = byRoom.get(room);
    if (!map) {
      map = new Map();
      byRoom.set(room, map);
    }
    return map;
  }

  function pruneRoom(room) {
    const map = byRoom.get(room);
    if (!map) return;
    const now = Date.now();
    for (const [userId, row] of map) {
      if (row.expiresAt <= now) map.delete(userId);
    }
    if (map.size === 0) byRoom.delete(room);
  }

  function snapshot(room) {
    pruneRoom(room);
    const map = byRoom.get(room);
    if (!map) return [];
    return [...map.entries()].map(([userId, row]) => ({
      userId,
      nick: row.nick,
    }));
  }

  function trackWsRoom(ws, room) {
    let meta = byWs.get(ws);
    if (!meta) {
      meta = { rooms: new Set(), lastStartAt: 0 };
      byWs.set(ws, meta);
    }
    meta.rooms.add(room);
  }

  function clearWs(ws) {
    const meta = byWs.get(ws);
    if (!meta) return [];
    const touched = [];
    for (const room of meta.rooms) {
      const map = byRoom.get(room);
      const userId = String(ws.userId || "").trim();
      if (map && userId) {
        map.delete(userId);
        if (map.size === 0) byRoom.delete(room);
        touched.push(room);
      }
    }
    byWs.delete(ws);
    return touched;
  }

  function clearWsRoom(ws, room) {
    const userId = String(ws.userId || "").trim();
    if (!userId) return false;
    const map = byRoom.get(room);
    if (!map) return false;
    const removed = map.delete(userId);
    if (map.size === 0) byRoom.delete(room);
    const meta = byWs.get(ws);
    if (meta) meta.rooms.delete(room);
    return removed;
  }

  function setTyping(ws, room, nick) {
    const userId = String(ws.userId || "").trim();
    if (!userId || !nick) return { ok: false, changed: false };
    const meta = byWs.get(ws) || { rooms: new Set(), lastStartAt: 0 };
    const now = Date.now();
    const throttled = now - meta.lastStartAt < MIN_START_INTERVAL_MS;
    trackWsRoom(ws, room);
    const map = roomMap(room);
    const prev = map.get(userId);
    map.set(userId, { nick, expiresAt: now + TYPING_TTL_MS });
    if (!throttled) meta.lastStartAt = now;
    byWs.set(ws, meta);
    return { ok: true, changed: !prev || !throttled };
  }

  return {
    snapshot,
    setTyping,
    clearWs,
    clearWsRoom,
    pruneRoom,
  };
}

function assertTypingRoomMembership(sessionManager, ws, room) {
  const session = sessionManager.getSession(ws);
  if (!session?.joinedRooms?.has(room)) {
    return {
      ok: false,
      code: "NOT_IN_ROOM",
      message: "Join the room before typing",
    };
  }
  return { ok: true };
}

function parseTypingPayload(payload) {
  const room = validateRoomId(payload?.room);
  if (!room) {
    return { ok: false, code: "INVALID_ROOM", message: "Invalid IRC room" };
  }
  return { ok: true, room };
}

function handleTypingStart(ws, payload, sessionManager, registry) {
  const parsed = parseTypingPayload(payload);
  if (!parsed.ok) return parsed;
  const membership = assertTypingRoomMembership(sessionManager, ws, parsed.room);
  if (!membership.ok) return membership;
  const nick = String(ws.ircNick || ws.nick || "").trim();
  if (!nick) {
    return { ok: false, code: "INVALID_TYPING", message: "Missing IRC nick" };
  }
  registry.setTyping(ws, parsed.room, nick);
  return { ok: true, room: parsed.room };
}

function handleTypingStop(ws, payload, sessionManager, registry) {
  const parsed = parseTypingPayload(payload);
  if (!parsed.ok) return parsed;
  registry.clearWsRoom(ws, parsed.room);
  return { ok: true, room: parsed.room };
}

function broadcastTypingUpdated(wss, sessionManager, room, registry) {
  const users = registry.snapshot(room);
  const frame = JSON.stringify({
    type: "typing.updated",
    room,
    users,
  });
  for (const client of wss.clients) {
    if (client.readyState !== 1 || !client.authenticated) continue;
    const session = sessionManager.getSession(client);
    if (!session?.joinedRooms?.has(room)) continue;
    client.send(frame);
  }
}

module.exports = {
  createTypingRegistry,
  handleTypingStart,
  handleTypingStop,
  broadcastTypingUpdated,
  TYPING_TTL_MS,
};
