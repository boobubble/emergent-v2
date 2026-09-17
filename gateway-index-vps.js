require("dotenv").config();

const express = require("express");
const http = require("http");
const tls = require("tls");
const { randomUUID } = require("node:crypto");
const { WebSocketServer } = require("ws");
const { createRemoteJWKSet, jwtVerify } = require("jose");
const {
  buildRoomsPayload,
  createStartupJoinTracker,
  fromIrcChannel,
  isListEnd323,
  isWelcomeNumeric,
  parseJoinErrorChannel,
  parseListEntry322,
  parseSelfJoin,
  parseSelfPart,
  toIrcChannel,
} = require("./lib/irc-room-discovery.cjs");
const {
  buildModerationCommand,
  canPerformIrcModeration,
  parseModerationPayload,
  validateRoomId,
} = require("./lib/irc-moderation.cjs");
const {
  nickFromRegisteredUser,
  nickFromGuestNickname,
} = require("./lib/irc-nick.cjs");
const {
  verifyGuestGatewayToken,
  diagnoseGuestGatewayToken,
  fingerprintGatewaySecret,
  guestAuthFieldMeta,
  guestAuthExpiryValid,
} = require("./lib/irc-guest-auth.cjs");
const { validatePmSendPayload, isValidUuid } = require("./lib/irc-pm.cjs");
const {
  createIrcSessionManager,
  CONNECT_TIMEOUT_MS,
} = require("./lib/irc-user-session.cjs");

const PORT = Number(process.env.PORT || 3000);
const IRC_HOST = process.env.IRC_HOST || "yaarzo-ergo";
const IRC_PORT = Number(process.env.IRC_PORT || 6697);
const IRC_SERVERNAME = process.env.IRC_SERVERNAME || "irc.yaarzo.com";
const IRC_NICK = process.env.IRC_NICK || "YaarzoGateway";
const IRC_PRIMARY_ROOM = String(process.env.IRC_PRIMARY_ROOM || "yaarzo-global").trim();
const GATEWAY_GUEST_SECRET = process.env.GATEWAY_GUEST_SECRET || "";

/** Time to receive the first WS auth frame after connect. */
const WS_PRE_AUTH_TIMEOUT_MS = Number(process.env.WS_PRE_AUTH_TIMEOUT_MS || 30_000);
/** Time allowed for per-user IRC TLS + 001 after auth validates (covers REG_TIMEOUT_MS). */
const WS_IRC_ATTACH_TIMEOUT_MS = Number(
  process.env.WS_IRC_ATTACH_TIMEOUT_MS || CONNECT_TIMEOUT_MS + 5_000,
);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

const SUPABASE_JWKS = SUPABASE_URL
  ? createRemoteJWKSet(
      new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    )
  : null;

const supabaseEnv = {
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_PUBLISHABLE_KEY,
};

async function verifySupabaseToken(token) {
  if (!token || !SUPABASE_JWKS || !SUPABASE_URL) return null;

  try {
    const { payload } = await jwtVerify(token, SUPABASE_JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
      audience: "authenticated"
    });

    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err.code || err.message);
    return null;
  }
}

function configuredStartupChannels() {
  return String(process.env.IRC_ROOMS || "yaarzo-global")
    .split(",")
    .map((id) => toIrcChannel(id.trim()))
    .filter(Boolean);
}

const app = express();

/** Public room list from IRC LIST numeric 322 — not IRC_ROOMS config. */
const ircRoomList = new Map();
/** Channels the gateway bot has successfully joined (self-JOIN confirmed). */
const joinedIrcRooms = new Set();

let ircSocket = null;
let reconnectTimer = null;
let ircBuffer = "";
let ircRegistered = false;
let startupJoinPhase = false;
let listInProgress = false;
let listRefreshPending = false;
let startupJoinTracker = createStartupJoinTracker([]);

function resetIrcDiscoveryState() {
  ircRoomList.clear();
  joinedIrcRooms.clear();
  ircRegistered = false;
  startupJoinPhase = false;
  listInProgress = false;
  listRefreshPending = false;
  startupJoinTracker = createStartupJoinTracker(configuredStartupChannels());
}

function requestIrcList(reason) {
  if (!ircSocket || ircSocket.destroyed || !ircRegistered) return;
  if (listInProgress) {
    listRefreshPending = true;
    return;
  }
  listInProgress = true;
  ircRoomList.clear();
  ircSocket.write("LIST\r\n");
  console.log(`IRC: LIST sent (${reason})`);
}

function maybeCompleteStartupAndList() {
  if (!startupJoinPhase) return;
  if (!startupJoinTracker.isStartupComplete()) return;
  startupJoinPhase = false;
  requestIrcList("startup-joins-complete");
}

function noteStartupJoinResolved(channel) {
  if (!startupJoinPhase) return;
  startupJoinTracker.noteJoinAttemptResolved(channel);
  maybeCompleteStartupAndList();
}

function handleIrcLine(line) {
  if (line.startsWith("PING ")) {
    const token = line.slice(5);
    ircSocket.write(`PONG ${token}\r\n`);
    console.log("IRC: PONG sent");
    return;
  }

  if (!ircRegistered && isWelcomeNumeric(line)) {
    ircRegistered = true;
    startupJoinPhase = true;
    const channels = configuredStartupChannels();
    startupJoinTracker.reset(channels);
    for (const channel of channels) {
      ircSocket.write(`JOIN ${channel}\r\n`);
      console.log(`IRC: JOIN ${channel} sent`);
    }
    if (channels.length === 0) {
      startupJoinPhase = false;
      requestIrcList("startup-no-rooms-configured");
    }
    return;
  }

  const joinErrorChannel = parseJoinErrorChannel(line);
  if (joinErrorChannel) {
    noteStartupJoinResolved(joinErrorChannel);
    if (!startupJoinPhase) {
      listRefreshPending = true;
    }
  }

  const selfJoin = parseSelfJoin(line, IRC_NICK);
  if (selfJoin) {
    const room = fromIrcChannel(selfJoin);
    if (room) joinedIrcRooms.add(room);
    noteStartupJoinResolved(selfJoin);
    if (!startupJoinPhase) {
      requestIrcList("dynamic-join");
    }
    return;
  }

  const selfPart = parseSelfPart(line, IRC_NICK);
  if (selfPart) {
    const room = fromIrcChannel(selfPart);
    if (room) joinedIrcRooms.delete(room);
    if (!startupJoinPhase) {
      requestIrcList("dynamic-part");
    }
    return;
  }

  const listEntry = parseListEntry322(line);
  if (listEntry) {
    ircRoomList.set(listEntry.room, listEntry);
    return;
  }

  if (isListEnd323(line)) {
    listInProgress = false;
    console.log(`IRC: LIST complete (${ircRoomList.size} rooms)`);
    if (listRefreshPending) {
      listRefreshPending = false;
      requestIrcList("pending-refresh");
    }
  }
}

function broadcastToAuthenticatedClients(wss, payload) {
  const data = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState !== 1 || !client.authenticated) continue;

    client.send(data);
  }
}

function broadcastIrcLine(wss, line) {
  const data = JSON.stringify({ type: "irc", line });
  for (const client of wss.clients) {
    if (client.readyState !== 1 || !client.authenticated) continue;
    client.send(data);
  }
}

function broadcastChannelMessage(wss, payload) {
  broadcastToAuthenticatedClients(wss, {
    type: "message",
    room: payload.room,
    messageId: payload.messageId,
    nick: payload.nick,
    userId: payload.userId,
    text: payload.text,
  });
}

let sessionManager = null;

function initSessionManager(wss) {
  sessionManager = createIrcSessionManager({
  host: IRC_HOST,
  port: IRC_PORT,
  servername: IRC_SERVERNAME,
  onSessionChannelPrivmsg: (payload) => {
    broadcastChannelMessage(wss, payload);
  },
  onSharedChannelPrivmsg: (payload) => {
    broadcastChannelMessage(wss, payload);
  },
  onSessionPrivateMessage: ({ nick, targetNick, text, recipientSession }) => {
    const recipientWs = sessionManager.findWsByNick(targetNick);
    const messageId = randomUUID();
    const frame = {
      type: "pm.message",
      messageId,
      nick,
      text,
    };

    if (recipientWs && recipientWs.readyState === 1) {
      recipientWs.send(JSON.stringify(frame));
      return;
    }

    // Deliver to sender if they are the target (loopback edge case).
    if (recipientSession?.nick?.toLowerCase() === targetNick.toLowerCase()) {
      return;
    }
  },
  onSessionRoomNames: ({ ws, room, members }) => {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({
      type: "room.names",
      room,
      members,
    }));
  },
  onSessionIrcLine: (line) => {
    broadcastIrcLine(wss, line);
  },
  });
  return sessionManager;
}

function requestRoomNames(ws, room) {
  const userSession = sessionManager.getSession(ws);
  if (!userSession) return false;
  return userSession.requestNames(room);
}

function joinIrcRoom(room) {
  const validated = validateRoomId(room);
  if (!validated || !ircSocket || ircSocket.destroyed) return false;
  const channel = toIrcChannel(validated);
  if (!channel) return false;
  ircSocket.write(`JOIN ${channel}\r\n`);
  console.log(`IRC: JOIN ${channel} sent (shared bot)`);
  return true;
}

function sendModerationError(ws, code, message) {
  ws.send(JSON.stringify({
    type: "moderation.error",
    code,
    message,
  }));
}

async function handleModerationRequest(ws, payload) {
  const parsed = parseModerationPayload(payload);
  if (!parsed) {
    sendModerationError(ws, "INVALID_REQUEST", "Invalid moderation payload");
    return;
  }

  const auth = await canPerformIrcModeration(ws, parsed.room, parsed.action, supabaseEnv);
  if (!auth.allowed) {
    sendModerationError(ws, auth.code || "FORBIDDEN", "Not authorized for this moderation action");
    return;
  }

  if (!ircSocket || ircSocket.destroyed || !ircRegistered) {
    sendModerationError(ws, "IRC_UNAVAILABLE", "Chat service is temporarily unavailable");
    return;
  }

  const command = buildModerationCommand(
    parsed.action,
    parsed.room,
    parsed.targetNick,
    parsed.reason,
  );
  if (!command) {
    sendModerationError(ws, "INVALID_REQUEST", "Could not build IRC moderation command");
    return;
  }

  if (!joinedIrcRooms.has(parsed.room)) {
    joinIrcRoom(parsed.room);
  }

  ircSocket.write(command);
  console.log(`IRC moderation ${parsed.action} by ${ws.user?.sub || ws.visitorId} in ${parsed.room} -> ${parsed.targetNick}`);

  ws.send(JSON.stringify({
    type: "moderation.ok",
    action: parsed.action,
    room: parsed.room,
    targetNick: parsed.targetNick,
    source: auth.source,
  }));
}

async function attachUserIrcSession(ws) {
  const desiredNick = ws.desiredNick;
  const userId = ws.userId;
  const identityType = ws.identityType;

  try {
    const result = await sessionManager.attachSession(ws, {
      desiredNick,
      userId,
      identityType,
    });
    ws.ircNick = result.nick;
    ws.nick = result.nick;

    const primary = IRC_PRIMARY_ROOM;
    if (primary) {
      result.session.joinRoom(primary);
      requestRoomNames(ws, primary);
    }

    return result;
  } catch (err) {
    console.error("Failed to attach IRC session:", err?.message || err);
    ws.send(JSON.stringify({
      type: "error",
      code: "IRC_SESSION_FAILED",
      message: "Could not establish IRC session",
    }));
    return null;
  }
}

function connectIRC() {
  if (ircSocket && !ircSocket.destroyed) return;

  console.log(`Connecting to IRC ${IRC_HOST}:${IRC_PORT}...`);
  resetIrcDiscoveryState();

  ircSocket = tls.connect({
    host: IRC_HOST,
    port: IRC_PORT,
    servername: IRC_SERVERNAME,
    rejectUnauthorized: true
  });

  ircSocket.setEncoding("utf8");

  ircSocket.on("secureConnect", () => {
    console.log("IRC TLS connected (shared gateway bot)");
    ircSocket.write(`NICK ${IRC_NICK}\r\n`);
    ircSocket.write(`USER yaarzogateway 0 * :Yaarzo Chat Gateway\r\n`);
  });

  ircSocket.on("data", (data) => {
    ircBuffer += data;

    const lines = ircBuffer.split("\r\n");
    ircBuffer = lines.pop() || "";

    for (const line of lines) {
      if (!line) continue;

      console.log("IRC:", line);
      handleIrcLine(line);

      const privmsgMatch = line.match(/^:([^!]+)!.* PRIVMSG (#\S+) :([\s\S]*)$/);
      if (privmsgMatch) {
        sessionManager.handleSharedChannelPrivmsg(line);
        continue;
      }

      broadcastIrcLine(wss, line);
    }
  });

  ircSocket.on("error", (err) => {
    console.error("IRC socket error:", err.message);
  });

  ircSocket.on("close", () => {
    console.log("IRC connection closed");
    ircSocket = null;
    resetIrcDiscoveryState();

    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectIRC();
      }, 5000);
    }
  });
}

function resolveGuestWsNickname(guest) {
  const rawNick = guest.nickname;
  if (rawNick !== undefined && rawNick !== null && String(rawNick).trim()) {
    return { nickname: String(rawNick).trim(), nicknameSource: "nickname" };
  }
  return {
    nickname: String(guest.displayName || "").trim(),
    nicknameSource: "displayName_fallback",
  };
}

function logGuestIrcWsAuthDiagnostic(guest, nickname, nicknameSource, verifyResult, verifyReason) {
  console.log(
    JSON.stringify({
      event: "guest_irc_ws_auth",
      branch: "guest",
      verifyResult,
      verifyReason,
      nicknameSource,
      secretFingerprint: fingerprintGatewaySecret(GATEWAY_GUEST_SECRET),
      visitorId: guestAuthFieldMeta(guest.visitorId),
      nickname: guestAuthFieldMeta(nickname),
      expiresAt: {
        ...guestAuthFieldMeta(guest.expiresAt),
        expiryValid: guestAuthExpiryValid(guest.expiresAt),
      },
      token: guestAuthFieldMeta(guest.token),
    }),
  );
}

async function handleWsAuth(ws, payload) {
  if (payload.guest && typeof payload.guest === "object") {
    const guest = payload.guest;
    if (!GATEWAY_GUEST_SECRET) {
      const { nickname, nicknameSource } = resolveGuestWsNickname(guest);
      logGuestIrcWsAuthDiagnostic(
        guest,
        nickname,
        nicknameSource,
        false,
        "MISSING_SECRET",
      );
      return { ok: false, code: "GUEST_AUTH_DISABLED", message: "Guest IRC auth is not configured" };
    }

    const { nickname, nicknameSource } = resolveGuestWsNickname(guest);
    const verifyParams = {
      visitorId: guest.visitorId,
      nickname,
      expiresAt: guest.expiresAt,
      token: guest.token,
    };
    const diagnosis = diagnoseGuestGatewayToken(verifyParams, GATEWAY_GUEST_SECRET);
    const valid = verifyGuestGatewayToken(verifyParams, GATEWAY_GUEST_SECRET);

    logGuestIrcWsAuthDiagnostic(
      guest,
      nickname,
      nicknameSource,
      valid,
      diagnosis.reason,
    );

    if (!valid) {
      return { ok: false, code: "AUTH_INVALID", message: "Invalid guest session" };
    }

    const ircNick = nickFromGuestNickname(nickname);
    if (!ircNick) {
      return { ok: false, code: "INVALID_NICK", message: "Invalid guest nickname for IRC" };
    }

    ws.visitorId = String(guest.visitorId);
    ws.userId = ws.visitorId;
    ws.identityType = "guest";
    ws.desiredNick = ircNick;
    ws.displayName = String(guest.displayName || nickname);
    ws.guestNickname = nickname;
    return { ok: true, userId: ws.userId, identityType: "guest" };
  }

  if (typeof payload.token !== "string") {
    return { ok: false, code: "AUTH_REQUIRED", message: "Authentication required" };
  }

  const user = await verifySupabaseToken(payload.token);
  if (!user) {
    return { ok: false, code: "AUTH_INVALID", message: "Invalid authentication token" };
  }

  ws.user = user;
  ws.userId = user.sub;
  ws.accessToken = payload.token;
  ws.identityType = "registered";
  ws.desiredNick = nickFromRegisteredUser(user);
  return { ok: true, userId: user.sub, identityType: "registered" };
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
initSessionManager(wss);

app.get("/rooms", (req, res) => {
  res.json(buildRoomsPayload(ircRoomList, IRC_PRIMARY_ROOM));
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "yaarzo-chat-gateway",
    irc: {
      host: IRC_HOST,
      port: IRC_PORT,
      connected: !!ircSocket && !ircSocket.destroyed,
      registered: ircRegistered,
      joinedRooms: [...joinedIrcRooms],
      discoveredRooms: ircRoomList.size,
      listInProgress,
      userSessions: sessionManager?.sessionCount?.() ?? 0,
    },
    timestamp: new Date().toISOString()
  });
});

wss.on("connection", async (ws) => {
  let authenticated = false;
  let authTimeout = null;
  let ircAttachTimeout = null;

  function clearAuthTimeouts() {
    if (authTimeout) {
      clearTimeout(authTimeout);
      authTimeout = null;
    }
    if (ircAttachTimeout) {
      clearTimeout(ircAttachTimeout);
      ircAttachTimeout = null;
    }
  }

  authTimeout = setTimeout(() => {
    if (!authenticated) {
      ws.close(1008, "Authentication required");
    }
  }, WS_PRE_AUTH_TIMEOUT_MS);

  console.log("WebSocket client connected; awaiting authentication");

  ws.send(JSON.stringify({
    type: "gateway",
    event: "connected",
    authRequired: true
  }));

  ws.on("message", async (message) => {
    const raw = message.toString();

    let payload;

    try {
      payload = JSON.parse(raw);
    } catch {
      ws.send(JSON.stringify({
        type: "error",
        code: "INVALID_JSON",
        message: "Invalid JSON payload"
      }));
      return;
    }

    if (!authenticated) {
      if (payload.type !== "auth") {
        ws.send(JSON.stringify({
          type: "error",
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        }));
        ws.close(1008, "Authentication required");
        return;
      }

      const authResult = await handleWsAuth(ws, payload);
      if (!authResult.ok) {
        ws.send(JSON.stringify({
          type: "error",
          code: authResult.code,
          message: authResult.message,
        }));
        ws.close(1008, authResult.message);
        return;
      }

      clearTimeout(authTimeout);
      authTimeout = null;

      ircAttachTimeout = setTimeout(() => {
        if (!authenticated) {
          ws.close(1011, "IRC session timeout");
        }
      }, WS_IRC_ATTACH_TIMEOUT_MS);

      const session = await attachUserIrcSession(ws);

      clearTimeout(ircAttachTimeout);
      ircAttachTimeout = null;

      if (!session) {
        ws.close(1011, "IRC session failed");
        return;
      }

      authenticated = true;
      ws.authenticated = true;
      clearAuthTimeouts();

      ws.send(JSON.stringify({
        type: "gateway",
        event: "authenticated",
        userId: ws.userId,
        ircNick: ws.ircNick,
        identityType: ws.identityType,
      }));

      console.log(`WebSocket authenticated: ${ws.userId} as IRC ${ws.ircNick}`);
      return;
    }

    console.log(`WS message type: ${payload.type}`);

    if (typeof payload.type === "string" && payload.type.startsWith("moderation.")) {
      await handleModerationRequest(ws, payload);
      return;
    }

    if (payload.type === "moderation") {
      await handleModerationRequest(ws, payload);
      return;
    }

    if (payload.type === "room.join") {
      const room = validateRoomId(payload.room);
      if (!room) {
        ws.send(JSON.stringify({
          type: "error",
          code: "INVALID_ROOM",
          message: "Invalid IRC room"
        }));
        return;
      }

      const userSession = sessionManager.getSession(ws);
      if (!userSession || !userSession.joinRoom(room)) {
        ws.send(JSON.stringify({
          type: "error",
          code: "IRC_UNAVAILABLE",
          message: "Chat service is temporarily unavailable"
        }));
        return;
      }

      joinIrcRoom(room);
      requestRoomNames(ws, room);
      ws.send(JSON.stringify({ type: "room.joined", room }));
      return;
    }

    if (payload.type === "pm.send") {
      const userSession = sessionManager.getSession(ws);
      const parsed = validatePmSendPayload(payload, ws.ircNick || ws.nick);
      if (!parsed || !userSession) {
        ws.send(JSON.stringify({
          type: "error",
          code: "INVALID_PM",
          message: "Invalid private message request",
        }));
        return;
      }

      if (!userSession.sendPrivateMessage(parsed.recipientNick, parsed.text)) {
        ws.send(JSON.stringify({
          type: "error",
          code: "IRC_UNAVAILABLE",
          message: "Could not send private message",
        }));
        return;
      }

      ws.send(JSON.stringify({
        type: "pm.sent",
        messageId: parsed.messageId,
        recipientNick: parsed.recipientNick,
        text: parsed.text,
      }));
      return;
    }

    if (payload.type !== "message.send") return;

    if (!isValidUuid(payload.messageId)) {
      ws.send(JSON.stringify({
        type: "error",
        code: "INVALID_MESSAGE_ID",
        message: "messageId must be a valid UUID"
      }));
      return;
    }

    const text = typeof payload.text === "string"
      ? payload.text.trim()
      : "";

    if (!text || text.length > 500) {
      ws.send(JSON.stringify({
        type: "error",
        code: "INVALID_MESSAGE",
        message: "Message must be between 1 and 500 characters"
      }));
      return;
    }

    const safeText = text.replace(/[\r\n]/g, " ");
    const room = validateRoomId(payload.room);

    if (!room) {
      ws.send(JSON.stringify({
        type: "error",
        code: "INVALID_ROOM",
        message: "Invalid IRC room"
      }));
      return;
    }

    const userSession = sessionManager.getSession(ws);
    if (!userSession) {
      ws.send(JSON.stringify({
        type: "error",
        code: "IRC_UNAVAILABLE",
        message: "Chat service is temporarily unavailable"
      }));
      return;
    }

    sessionManager.trackPending(payload.messageId.trim(), {
      userId: ws.userId,
      nick: ws.ircNick || ws.nick,
      room,
      text: safeText,
      ws,
    });

    if (!userSession.sendChannelMessage(room, safeText)) {
      ws.send(JSON.stringify({
        type: "error",
        code: "IRC_UNAVAILABLE",
        message: "Chat service is temporarily unavailable"
      }));
      return;
    }

    ws.send(JSON.stringify({
      type: "message.sent",
      room,
      messageId: payload.messageId.trim(),
      nick: ws.ircNick || ws.nick,
      userId: ws.userId,
      text: safeText
    }));

    console.log(`IRC user PRIVMSG ${room} (${ws.ircNick}): ${safeText}`);
  });

  ws.on("close", () => {
    clearAuthTimeouts();
    sessionManager.unregisterWs(ws);
    console.log("WebSocket client disconnected");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Yaarzo Gateway listening on port ${PORT}`);
  connectIRC();
});
