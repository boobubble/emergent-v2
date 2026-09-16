/**
 * Per-WebSocket IRC TLS session manager.
 * One Yaarzo chat session = one IRC client connection = one real nick.
 */

const tls = require("tls");
const { randomUUID } = require("node:crypto");
const {
  isWelcomeNumeric,
  toIrcChannel,
  fromIrcChannel,
} = require("./irc-room-discovery.cjs");
const { validateRoomId } = require("./irc-moderation.cjs");
const {
  resolveNickCollision,
  isValidIrcNick,
} = require("./irc-nick.cjs");
const { createNamesAccumulator } = require("./irc-names.cjs");

const REG_TIMEOUT_MS = 15_000;
const CONNECT_TIMEOUT_MS = 20_000;

const CHANNEL_PRIVMSG_RE = /^:([^!]+)!.* PRIVMSG (#\S+) :([\s\S]*)$/;
const USER_PRIVMSG_RE = /^:([^!]+)!.* PRIVMSG ([^#\s][^\s]*) :([\s\S]*)$/;

function createIrcUserSession(options) {
  const {
    host,
    port,
    servername,
    nick,
    userId,
    identityType,
    onRegistered,
    onLine,
    onNamesComplete,
    onClose,
    onError,
    logger = console,
  } = options;

  let socket = null;
  let buffer = "";
  let registered = false;
  let destroyed = false;
  let regTimer = null;
  let connectTimer = null;
  const joinedRooms = new Set();
  const namesAccumulator = createNamesAccumulator();

  function clearTimers() {
    if (regTimer) {
      clearTimeout(regTimer);
      regTimer = null;
    }
    if (connectTimer) {
      clearTimeout(connectTimer);
      connectTimer = null;
    }
  }

  function writeLine(line) {
    if (!socket || socket.destroyed) return false;
    try {
      socket.write(`${line}\r\n`);
      return true;
    } catch {
      return false;
    }
  }

  function handleLine(line) {
    if (!line) return;

    if (line.startsWith("PING ")) {
      writeLine(`PONG ${line.slice(5)}`);
      return;
    }

    if (!registered && isWelcomeNumeric(line)) {
      registered = true;
      clearTimers();
      onRegistered?.();
      return;
    }

    const namesRoom = namesAccumulator.ingest353(line);
    if (namesRoom) return;

    const namesEnd = namesAccumulator.ingest366(line);
    if (namesEnd) {
      onNamesComplete?.(namesEnd.room, namesEnd.nicks);
      return;
    }

    onLine?.(line);
  }

  function connect() {
    if (destroyed) return Promise.reject(new Error("session destroyed"));
    if (socket && !socket.destroyed) return Promise.resolve();

    return new Promise((resolve, reject) => {
      connectTimer = setTimeout(() => {
        destroy("connect timeout");
        reject(new Error("IRC connect timeout"));
      }, CONNECT_TIMEOUT_MS);

      regTimer = setTimeout(() => {
        destroy("registration timeout");
        reject(new Error("IRC registration timeout"));
      }, REG_TIMEOUT_MS);

      socket = tls.connect({
        host,
        port,
        servername,
        rejectUnauthorized: true,
      });

      socket.setEncoding("utf8");

      socket.on("secureConnect", () => {
        writeLine(`NICK ${nick}`);
        writeLine(`USER yaarzo_${String(userId).slice(0, 12)} 0 * :Yaarzo User`);
      });

      socket.on("data", (data) => {
        buffer += data;
        const lines = buffer.split("\r\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          handleLine(line);
          if (registered && connectTimer) {
            clearTimeout(connectTimer);
            connectTimer = null;
            resolve();
          }
        }
      });

      socket.on("error", (err) => {
        onError?.(err);
        if (!registered) {
          clearTimers();
          reject(err);
        }
      });

      socket.on("close", () => {
        socket = null;
        registered = false;
        joinedRooms.clear();
        clearTimers();
        onClose?.();
      });
    });
  }

  function joinRoom(room) {
    const validated = validateRoomId(room);
    if (!validated || !registered) return false;
    const channel = toIrcChannel(validated);
    if (!channel) return false;
    joinedRooms.add(validated);
    return writeLine(`JOIN ${channel}`);
  }

  function requestNames(room) {
    const validated = validateRoomId(room);
    if (!validated || !registered) return false;
    const channel = toIrcChannel(validated);
    if (!channel) return false;
    namesAccumulator.reset(validated);
    return writeLine(`NAMES ${channel}`);
  }

  function partRoom(room, reason) {
    const validated = validateRoomId(room);
    if (!validated || !registered) return false;
    const channel = toIrcChannel(validated);
    if (!channel) return false;
    joinedRooms.delete(validated);
    const r = reason ? ` :${String(reason).replace(/[\r\n]/g, " ").slice(0, 120)}` : "";
    return writeLine(`PART ${channel}${r}`);
  }

  function sendChannelMessage(room, text) {
    const validated = validateRoomId(room);
    if (!validated || !registered) return false;
    const channel = toIrcChannel(validated);
    if (!channel) return false;
    const safe = String(text).replace(/[\r\n]/g, " ").trim();
    if (!safe) return false;
    if (!joinedRooms.has(validated)) {
      joinRoom(validated);
    }
    return writeLine(`PRIVMSG ${channel} :${safe}`);
  }

  function sendPrivateMessage(recipientNick, text) {
    if (!isValidIrcNick(recipientNick) || !registered) return false;
    const safe = String(text).replace(/[\r\n]/g, " ").trim();
    if (!safe) return false;
    return writeLine(`PRIVMSG ${recipientNick} :${safe}`);
  }

  function quit(reason) {
    if (!socket || socket.destroyed) return;
    const r = reason
      ? ` :${String(reason).replace(/[\r\n]/g, " ").slice(0, 120)}`
      : " :Client closed";
    try {
      writeLine(`QUIT${r}`);
    } catch { /* ignore */ }
    destroy("quit");
  }

  function destroy(_reason) {
    if (destroyed) return;
    destroyed = true;
    clearTimers();
    if (socket && !socket.destroyed) {
      try {
        socket.destroy();
      } catch { /* ignore */ }
    }
    socket = null;
    registered = false;
    joinedRooms.clear();
  }

  return {
    nick,
    userId,
    identityType,
    get registered() {
      return registered;
    },
    get joinedRooms() {
      return new Set(joinedRooms);
    },
    connect,
    joinRoom,
    requestNames,
    partRoom,
    sendChannelMessage,
    sendPrivateMessage,
    quit,
    destroy,
  };
}

function createIrcSessionManager(options) {
  const {
    host,
    port,
    servername,
    logger = console,
    onSharedChannelPrivmsg,
    onSessionChannelPrivmsg,
    onSessionPrivateMessage,
    onSessionRoomNames,
    onSessionIrcLine,
  } = options;

  /** @type {Map<object, ReturnType<typeof createIrcUserSession>>} */
  const byWs = new Map();
  /** @type {Map<string, object>} nick lower -> ws */
  const nickToWs = new Map();
  /** @type {Map<string, { userId: string, nick: string, identityType: string }>} nick lower -> identity */
  const nickRegistry = new Map();
  /** @type {Map<string, { messageId: string, userId: string, nick: string, room: string, text: string, ws: object, ts: number }>} */
  const pendingOutbound = new Map();
  /** @type {Map<string, number>} dedup key -> ts */
  const recentFanout = new Map();
  const FANOUT_DEDUP_MS = 2000;

  function occupiedNicks() {
    return new Set(nickToWs.keys());
  }

  function resolveNick(desired) {
    return resolveNickCollision(desired, occupiedNicks());
  }

  function registerNick(ws, nick, identity) {
    const key = nick.toLowerCase();
    nickToWs.set(key, ws);
    nickRegistry.set(key, identity);
  }

  function unregisterWs(ws) {
    const session = byWs.get(ws);
    if (session) {
      const key = session.nick.toLowerCase();
      if (nickToWs.get(key) === ws) {
        nickToWs.delete(key);
        nickRegistry.delete(key);
      }
      session.quit("Client disconnected");
      byWs.delete(ws);
    }
  }

  function isYaarzoSessionNick(nick) {
    return nickRegistry.has(String(nick || "").toLowerCase());
  }

  function lookupUserIdByNick(nick) {
    const entry = nickRegistry.get(String(nick || "").toLowerCase());
    return entry?.userId ?? null;
  }

  function findWsByNick(nick) {
    return nickToWs.get(String(nick || "").toLowerCase()) ?? null;
  }

  function trackPending(messageId, data) {
    pendingOutbound.set(messageId, { ...data, ts: Date.now() });
    setTimeout(() => pendingOutbound.delete(messageId), 60_000);
  }

  function matchPending(nick, room, text) {
    const now = Date.now();
    for (const [messageId, row] of pendingOutbound) {
      if (now - row.ts > 60_000) {
        pendingOutbound.delete(messageId);
        continue;
      }
      if (
        row.nick.toLowerCase() === String(nick).toLowerCase() &&
        row.room === room &&
        row.text === text
      ) {
        pendingOutbound.delete(messageId);
        return { messageId, userId: row.userId };
      }
    }
    return null;
  }

  function shouldFanout(room, nick, text) {
    const key = `${room}:${nick}:${text}`;
    const now = Date.now();
    const last = recentFanout.get(key) ?? 0;
    if (now - last < FANOUT_DEDUP_MS) return false;
    recentFanout.set(key, now);
    return true;
  }

  function resolveMemberEntry(nick) {
    const userId = lookupUserIdByNick(nick) ?? `irc:${nick}`;
    const identity = nickRegistry.get(String(nick).toLowerCase());
    return {
      nick,
      userId,
      isGuest: identity?.identityType === "guest",
    };
  }

  function handleSessionLine(session, ws, line) {
    const channelMatch = CHANNEL_PRIVMSG_RE.exec(line);
    if (channelMatch) {
      const nick = channelMatch[1];
      const room = fromIrcChannel(channelMatch[2]) || channelMatch[2].slice(1);
      const text = channelMatch[3];
      const pending = matchPending(nick, room, text);
      const userId = pending?.userId ?? lookupUserIdByNick(nick) ?? `irc:${nick}`;
      const messageId = pending?.messageId ?? randomUUID();

      if (!shouldFanout(room, nick, text)) return;

      onSessionChannelPrivmsg?.({
        room,
        nick,
        userId,
        text,
        messageId,
        sourceSession: session,
      });
      return;
    }

    const pmMatch = USER_PRIVMSG_RE.exec(line);
    if (pmMatch) {
      const nick = pmMatch[1];
      const targetNick = pmMatch[2];
      const text = pmMatch[3];
      if (targetNick.startsWith("#")) return;

      onSessionPrivateMessage?.({
        nick,
        targetNick,
        text,
        recipientSession: session,
      });
      return;
    }

    onSessionIrcLine?.(line);
  }

  function handleSessionNames(ws, room, nicks) {
    const members = nicks.map((nick) => resolveMemberEntry(nick));
    onSessionRoomNames?.({ ws, room, members });
  }

  async function attachSession(ws, params) {
    unregisterWs(ws);

    const resolvedNick = resolveNick(params.desiredNick);
    if (!resolvedNick) {
      throw new Error("Could not allocate IRC nick");
    }

    const identity = {
      userId: params.userId,
      nick: resolvedNick,
      identityType: params.identityType,
    };

    const session = createIrcUserSession({
      host,
      port,
      servername,
      nick: resolvedNick,
      userId: params.userId,
      identityType: params.identityType,
      logger,
      onRegistered: () => {
        logger.log?.(`IRC session registered: ${resolvedNick} (${params.identityType})`);
      },
      onNamesComplete: (room, nicks) => handleSessionNames(ws, room, nicks),
      onLine: (line) => handleSessionLine(session, ws, line),
      onClose: () => {
        if (byWs.get(ws) === session) {
          unregisterWs(ws);
        }
      },
      onError: (err) => {
        logger.error?.(`IRC session error (${resolvedNick}):`, err?.message || err);
      },
    });

    await session.connect();
    byWs.set(ws, session);
    registerNick(ws, resolvedNick, identity);
    return { session, nick: resolvedNick, userId: params.userId };
  }

  function getSession(ws) {
    return byWs.get(ws) ?? null;
  }

  function handleSharedChannelPrivmsg(line) {
    const match = CHANNEL_PRIVMSG_RE.exec(line);
    if (!match) return;
    const nick = match[1];
    if (isYaarzoSessionNick(nick)) return;

    const room = fromIrcChannel(match[2]) || match[2].slice(1);
    const text = match[3];
    if (!shouldFanout(room, nick, text)) return;

    onSharedChannelPrivmsg?.({
      room,
      nick,
      userId: `irc:${nick}`,
      text,
      messageId: randomUUID(),
    });
  }

  return {
    attachSession,
    getSession,
    unregisterWs,
    resolveNick,
    isYaarzoSessionNick,
    lookupUserIdByNick,
    findWsByNick,
    trackPending,
    handleSharedChannelPrivmsg,
    sessionCount: () => byWs.size,
    resolveMemberEntry,
  };
}

module.exports = {
  createIrcUserSession,
  createIrcSessionManager,
  CHANNEL_PRIVMSG_RE,
  USER_PRIVMSG_RE,
};
