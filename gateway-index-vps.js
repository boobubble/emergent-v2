require("dotenv").config();

const express = require("express");
const http = require("http");
const tls = require("tls");
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

const PORT = Number(process.env.PORT || 3000);
const IRC_HOST = process.env.IRC_HOST || "yaarzo-ergo";
const IRC_PORT = Number(process.env.IRC_PORT || 6697);
const IRC_SERVERNAME = process.env.IRC_SERVERNAME || "irc.yaarzo.com";
const IRC_NICK = process.env.IRC_NICK || "YaarzoGateway";
const IRC_PRIMARY_ROOM = String(process.env.IRC_PRIMARY_ROOM || "yaarzo-global").trim();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value) {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

const SUPABASE_JWKS = SUPABASE_URL
  ? createRemoteJWKSet(
      new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    )
  : null;

const supabaseEnv = {
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_PUBLISHABLE_KEY,
};

function getUserNick(user) {
  const raw =
    user?.user_metadata?.username ||
    user?.user_metadata?.user_name ||
    user?.username ||
    `user_${String(user?.sub || "").slice(0, 8)}`;

  return String(raw)
    .trim()
    .replace(/[^A-Za-z0-9_\-]/g, "_")
    .slice(0, 30) || `user_${String(user?.sub || "").slice(0, 8)}`;
}

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
    },
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcastToAuthenticatedClients(payload) {
  const data = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState !== 1 || !client.authenticated) continue;

    client.send(data);
  }
}

function joinIrcRoom(room) {
  const validated = validateRoomId(room);
  if (!validated || !ircSocket || ircSocket.destroyed) return false;
  const channel = toIrcChannel(validated);
  if (!channel) return false;
  ircSocket.write(`JOIN ${channel}\r\n`);
  console.log(`IRC: JOIN ${channel} sent`);
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
  console.log(`IRC moderation ${parsed.action} by ${ws.user?.sub} in ${parsed.room} -> ${parsed.targetNick}`);

  ws.send(JSON.stringify({
    type: "moderation.ok",
    action: parsed.action,
    room: parsed.room,
    targetNick: parsed.targetNick,
    source: auth.source,
  }));
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
    console.log("IRC TLS connected");
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

      for (const client of wss.clients) {
        if (client.readyState !== 1 || !client.authenticated) continue;

        if (privmsgMatch) {
          const room = fromIrcChannel(privmsgMatch[2]) || privmsgMatch[2].slice(1);

          client.send(JSON.stringify({
            type: "message",
            room,
            nick: privmsgMatch[1],
            text: privmsgMatch[3]
          }));
        } else {
          client.send(JSON.stringify({
            type: "irc",
            line
          }));
        }
      }
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

wss.on("connection", async (ws) => {
  let authenticated = false;

  const authTimeout = setTimeout(() => {
    if (!authenticated) {
      ws.close(1008, "Authentication required");
    }
  }, 5000);

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
      if (payload.type !== "auth" || typeof payload.token !== "string") {
        ws.send(JSON.stringify({
          type: "error",
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        }));
        ws.close(1008, "Authentication required");
        return;
      }

      const user = await verifySupabaseToken(payload.token);

      if (!user) {
        ws.send(JSON.stringify({
          type: "error",
          code: "AUTH_INVALID",
          message: "Invalid authentication token"
        }));
        ws.close(1008, "Invalid authentication token");
        return;
      }

      authenticated = true;
      ws.user = user;
      ws.nick = getUserNick(user);
      ws.accessToken = payload.token;
      ws.authenticated = true;
      clearTimeout(authTimeout);

      ws.send(JSON.stringify({
        type: "gateway",
        event: "authenticated",
        userId: user.sub
      }));

      console.log(`WebSocket authenticated: ${user.sub}`);
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
      if (!joinIrcRoom(room)) {
        ws.send(JSON.stringify({
          type: "error",
          code: "IRC_UNAVAILABLE",
          message: "Chat service is temporarily unavailable"
        }));
        return;
      }
      ws.send(JSON.stringify({ type: "room.joined", room }));
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

    if (!ircSocket || ircSocket.destroyed) {
      ws.send(JSON.stringify({
        type: "error",
        code: "IRC_UNAVAILABLE",
        message: "Chat service is temporarily unavailable"
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

    const channel = toIrcChannel(room);
    if (!channel) {
      ws.send(JSON.stringify({
        type: "error",
        code: "INVALID_ROOM",
        message: "Invalid IRC room"
      }));
      return;
    }

    if (!joinedIrcRooms.has(room)) {
      joinIrcRoom(room);
    }

    ircSocket.write(`PRIVMSG ${channel} :${safeText}\r\n`);

    broadcastToAuthenticatedClients({
      type: "message",
      room,
      messageId: payload.messageId.trim(),
      nick: ws.nick,
      userId: ws.user.sub,
      text: safeText
    });

    ws.send(JSON.stringify({
      type: "message.sent",
      room,
      messageId: payload.messageId.trim(),
      nick: ws.nick,
      userId: ws.user.sub,
      text: safeText
    }));

    console.log(`IRC: PRIVMSG ${channel} :${safeText}`);
  });

  ws.on("close", () => {
    clearTimeout(authTimeout);
    console.log("WebSocket client disconnected");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Yaarzo Gateway listening on port ${PORT}`);
  connectIRC();
});
