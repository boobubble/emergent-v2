/**
 * Per-WebSocket IRC TLS session manager.
 * One Yaarzo chat session = one IRC client connection = one real nick.
 */

const tls = require("tls");
const { randomUUID } = require("node:crypto");
const {
  isWelcomeNumeric,
  parseIrcNumeric,
  toIrcChannel,
  fromIrcChannel,
} = require("./irc-room-discovery.cjs");
const { validateRoomId } = require("./irc-moderation.cjs");
const {
  resolveNickCollision,
  isValidIrcNick,
  normalizeIrcNick,
  nickFallbackFromUserId,
} = require("./irc-nick.cjs");
const { createNamesAccumulator } = require("./irc-names.cjs");

const REG_TIMEOUT_MS = 15_000;
const CONNECT_TIMEOUT_MS = 20_000;
const USER_IDENT_MAX_LEN = 20;

/** IRC numerics that mean registration cannot complete (fail fast instead of 15s wait). */
const REGISTRATION_ERROR_NUMERICS = new Set([
  432, // ERR_ERRONEUSNICKNAME
  433, // ERR_NICKNAMEINUSE
  436, // ERR_NICKCOLLISION
  437, // ERR_UNAVAILRESOURCE
  461, // ERR_NEEDMOREPARAMS
  464, // ERR_PASSWDMISMATCH
  484, // ERR_DENIED
]);

const SASL_FAIL_NUMERICS = new Set([
  902, // ERR_NICKLOCKED
  904, // ERR_SASLFAIL
  905, // ERR_SASLTOOLONG
  906, // ERR_SASLABORTED
  907, // ERR_SASLALREADY
]);
const CHANNEL_PRIVMSG_RE = /^:([^!]+)!.* PRIVMSG (#\S+) :([\s\S]*)$/;
const USER_PRIVMSG_RE = /^:([^!]+)!.* PRIVMSG ([^#\s][^\s]*) :([\s\S]*)$/;

/**
 * IRC USER username field — printable ASCII, no spaces/CRLF.
 * Strip punctuation (e.g. UUID hyphens) so Ergo accepts the ident.
 * @param {string} userId
 */
function sanitizeUserIdent(userId) {
  const cleaned = String(userId || "unknown")
    .replace(/[\r\n]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 12);
  const suffix = cleaned || "user";
  return `yaarzo_${suffix}`.slice(0, USER_IDENT_MAX_LEN);
}

/**
 * @param {string} line
 * @returns {{ code: string, message: string } | null}
 */
function parseRegistrationErrorLine(line) {
  const value = String(line || "").trim();
  if (!value) return null;

  if (value.startsWith("ERROR")) {
    const message =
      value.includes(":")
        ? value.slice(value.indexOf(":") + 1).trim()
        : value.replace(/^ERROR\s*/i, "").trim();
    return {
      code: "ERROR",
      message: message || "IRC connection rejected",
    };
  }

  const numeric = parseIrcNumeric(value);
  if (!numeric || !REGISTRATION_ERROR_NUMERICS.has(numeric)) return null;

  const message =
    value.includes(":")
      ? value.slice(value.lastIndexOf(":") + 1).trim()
      : value;

  return {
    code: String(numeric),
    message: message || `IRC registration error ${numeric}`,
  };
}

/**
 * SASL PLAIN payload (IRCv3): base64("\0account\0password").
 * Exported for tests; never log the return value in production paths.
 */
function encodeSaslPlain(account, password) {
  return Buffer.from(`\0${account}\0${password}`, "utf8").toString("base64");
}

function parseSaslFailLine(line) {
  const numeric = parseIrcNumeric(String(line || "").trim());
  if (!numeric || !SASL_FAIL_NUMERICS.has(numeric)) return null;
  return numeric;
}

function isCapLsLine(line) {
  return /\bCAP\s+\S+\s+LS\b/i.test(line);
}

function isCapAckSasl(line) {
  return /\bCAP\s+\S+\s+ACK\b/i.test(line) && /\bsasl\b/i.test(line);
}

function isCapNakSasl(line) {
  return /\bCAP\s+\S+\s+NAK\b/i.test(line) && /\bsasl\b/i.test(line);
}

function isAuthenticatePlus(line) {
  return /(?:^|\s)AUTHENTICATE \+$/i.test(String(line || "").trim());
}

function isSaslSuccessNumeric(line) {
  const numeric = parseIrcNumeric(String(line || "").trim());
  return numeric === 900 || numeric === 903;
}

function createIrcUserSession(options) {
  const {
    host,
    port,
    servername,
    nick: initialNick,
    userId,
    identityType,
    ergoAccount = null,
    ergoPassword = null,
    allowUnmappedReservedFallback = false,
    onRegistered,
    onLine,
    onNamesComplete,
    onClose,
    onError,
    logger = console,
    connectTls,
    regTimeoutMs = REG_TIMEOUT_MS,
    connectTimeoutMs = CONNECT_TIMEOUT_MS,
  } = options;

  const connectTlsFn = connectTls || tls.connect.bind(tls);
  const saslAccount = String(ergoAccount || "").trim();
  const saslPassword = typeof ergoPassword === "string" ? ergoPassword : "";
  const useSasl = Boolean(saslAccount && saslPassword);
  const fallbackNick = nickFallbackFromUserId(userId);

  let currentNick = initialNick;
  let socket = null;
  let buffer = "";
  let registered = false;
  let destroyed = false;
  let regTimer = null;
  let connectTimer = null;
  let connectSettled = false;
  let settleConnect = null;
  let saslState = useSasl ? "cap_ls" : "none";
  let saslOk = false;
  let nickFallbackUsed = false;
  const joinedRooms = new Set();
  const namesAccumulator = createNamesAccumulator();
  const userIdent = sanitizeUserIdent(userId);

  function failRegistration(message) {
    settleConnect?.(new Error(message));
  }

  function sendMappedRegistration() {
    writeLine(`NICK ${currentNick}`);
    writeLine(`USER ${userIdent} 0 * :Yaarzo User`);
    writeLine("CAP END");
    saslState = "register";
  }

  function handleSaslLine(line) {
    if (isCapNakSasl(line)) {
      failRegistration("IRC SASL failed (CAP NAK)");
      return true;
    }

    const saslFail = parseSaslFailLine(line);
    if (saslFail) {
      failRegistration(`IRC SASL failed (${saslFail})`);
      return true;
    }

    if (saslState === "cap_ls" && isCapLsLine(line)) {
      writeLine("CAP REQ :sasl");
      saslState = "cap_req";
      return true;
    }

    if (saslState === "cap_req") {
      if (isCapAckSasl(line)) {
        writeLine("AUTHENTICATE PLAIN");
        saslState = "wait_plus";
        return true;
      }
      if (/\bCAP\s+\S+\s+ACK\b/i.test(line)) {
        failRegistration("IRC SASL failed (CAP ACK without sasl)");
        return true;
      }
    }

    if (saslState === "wait_plus" && isAuthenticatePlus(line)) {
      writeLine(`AUTHENTICATE ${encodeSaslPlain(saslAccount, saslPassword)}`);
      saslState = "wait_result";
      return true;
    }

    if (
      (saslState === "wait_plus" || saslState === "wait_result") &&
      isSaslSuccessNumeric(line)
    ) {
      if (!saslOk) {
        saslOk = true;
        sendMappedRegistration();
      }
      return true;
    }

    if (!saslOk && isWelcomeNumeric(line)) {
      failRegistration("IRC SASL failed (premature welcome)");
      return true;
    }

    return false;
  }

  function handleUnmappedReserved433() {
    if (useSasl) return false;
    if (identityType !== "registered") return false;
    if (!allowUnmappedReservedFallback) return false;
    if (nickFallbackUsed) return false;
    if (!fallbackNick || fallbackNick.toLowerCase() === currentNick.toLowerCase()) {
      return false;
    }
    nickFallbackUsed = true;
    currentNick = fallbackNick;
    writeLine(`NICK ${currentNick}`);
    return true;
  }

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

    if (useSasl && !registered) {
      if (handleSaslLine(line)) return;
    }

    if (!registered) {
      const regErr = parseRegistrationErrorLine(line);
      if (regErr) {
        if (regErr.code === "433" && handleUnmappedReserved433()) {
          return;
        }
        logger.warn?.(
          `IRC registration rejected for ${currentNick} (${regErr.code}): ${regErr.message}`,
        );
        failRegistration(`IRC registration failed (${regErr.code}): ${regErr.message}`);
        return;
      }
    }

    if (!registered && isWelcomeNumeric(line)) {
      if (useSasl && !saslOk) {
        failRegistration("IRC SASL failed (premature welcome)");
        return;
      }
      registered = true;
      onRegistered?.();
      settleConnect?.(null);
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
      connectSettled = false;
      saslState = useSasl ? "cap_ls" : "none";
      saslOk = false;
      nickFallbackUsed = false;
      currentNick = initialNick;

      const finishConnect = (err) => {
        if (connectSettled) return;
        connectSettled = true;
        clearTimers();
        if (err) {
          destroy(err.message || "connect failed");
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        resolve();
      };

      settleConnect = finishConnect;

      connectTimer = setTimeout(() => {
        finishConnect(new Error("IRC connect timeout"));
      }, connectTimeoutMs);

      regTimer = setTimeout(() => {
        finishConnect(new Error("IRC registration timeout"));
      }, regTimeoutMs);

      socket = connectTlsFn({
        host,
        port,
        servername,
        rejectUnauthorized: true,
      });

      socket.setEncoding("utf8");

      socket.on("secureConnect", () => {
        if (useSasl) {
          writeLine("CAP LS 302");
          return;
        }
        writeLine(`NICK ${currentNick}`);
        writeLine(`USER ${userIdent} 0 * :Yaarzo User`);
      });

      socket.on("data", (data) => {
        buffer += data;
        const lines = buffer.split("\r\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          handleLine(line);
        }
      });

      socket.on("error", (err) => {
        onError?.(err);
        if (!registered) {
          finishConnect(err);
        }
      });

      socket.on("close", () => {
        const wasRegistered = registered;
        socket = null;
        registered = false;
        joinedRooms.clear();
        clearTimers();
        if (!wasRegistered && !connectSettled) {
          finishConnect(new Error("IRC connection closed before registration"));
        }
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
    get nick() {
      return currentNick;
    },
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
  /** @type {Map<string, { messageId: string, userId: string, nick: string, room: string, text: string, replyToMessageId?: string, ws: object, ts: number }>} */
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
        return {
          messageId,
          userId: row.userId,
          replyToMessageId: row.replyToMessageId,
        };
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
      const replyToMessageId = pending?.replyToMessageId;

      if (!shouldFanout(room, nick, text)) return;

      onSessionChannelPrivmsg?.({
        room,
        nick,
        userId,
        text,
        messageId,
        replyToMessageId,
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

    const saslAccount = String(params.sasl?.account || "").trim();
    const saslPassword = typeof params.sasl?.password === "string" ? params.sasl.password : "";
    const useSasl = Boolean(saslAccount && saslPassword && params.identityType === "registered");

    let resolvedNick;
    if (useSasl) {
      resolvedNick = normalizeIrcNick(saslAccount);
      if (!resolvedNick || resolvedNick.toLowerCase() !== saslAccount.toLowerCase()) {
        throw new Error("Could not allocate IRC nick");
      }
      if (occupiedNicks().has(resolvedNick.toLowerCase())) {
        throw new Error("Could not allocate IRC nick");
      }
    } else {
      resolvedNick = resolveNick(params.desiredNick);
    }
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
      ergoAccount: useSasl ? saslAccount : null,
      ergoPassword: useSasl ? saslPassword : null,
      allowUnmappedReservedFallback:
        params.identityType === "registered" && !useSasl,
      logger,
      onRegistered: () => {
        logger.log?.(`IRC session registered: ${session.nick} (${params.identityType})`);
      },
      onNamesComplete: (room, nicks) => handleSessionNames(ws, room, nicks),
      onLine: (line) => handleSessionLine(session, ws, line),
      onClose: () => {
        if (byWs.get(ws) === session) {
          unregisterWs(ws);
        }
      },
      onError: (err) => {
        logger.error?.(`IRC session error (${session.nick}):`, err?.message || err);
      },
    });

    await session.connect();
    identity.nick = session.nick;
    byWs.set(ws, session);
    registerNick(ws, session.nick, identity);
    return { session, nick: session.nick, userId: params.userId };
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
  sanitizeUserIdent,
  parseRegistrationErrorLine,
  encodeSaslPlain,
  REG_TIMEOUT_MS,
  CONNECT_TIMEOUT_MS,
  CHANNEL_PRIVMSG_RE,
  USER_PRIVMSG_RE,
};
