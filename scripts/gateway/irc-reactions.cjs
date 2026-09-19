/**
 * IRC message reactions (Phase 1F-B) — Supabase-backed, gateway-authoritative.
 */

const { isValidUuid } = require("./irc-pm.cjs");
const { validateRoomId } = require("./irc-moderation.cjs");

const IRC_REACTION_TYPES = new Set(["heart", "laugh", "fire", "like"]);
const MAX_LIST_MESSAGE_IDS = 100;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRegisteredUserId(userId) {
  return typeof userId === "string" && UUID_RE.test(userId.trim());
}

function parseReactionType(value) {
  const type = String(value || "").trim().toLowerCase();
  return IRC_REACTION_TYPES.has(type) ? type : null;
}

function emptyReactionBuckets() {
  return {
    heart: { count: 0, reactedByMe: false },
    laugh: { count: 0, reactedByMe: false },
    fire: { count: 0, reactedByMe: false },
    like: { count: 0, reactedByMe: false },
  };
}

function aggregateReactionRows(rows, viewerUserId) {
  /** @type {Map<string, ReturnType<typeof emptyReactionBuckets>>} */
  const byMessage = new Map();
  for (const row of rows || []) {
    const messageId = String(row.message_id || "").trim();
    const reactionType = parseReactionType(row.reaction_type);
    if (!isValidUuid(messageId) || !reactionType) continue;
    let bucket = byMessage.get(messageId);
    if (!bucket) {
      bucket = emptyReactionBuckets();
      byMessage.set(messageId, bucket);
    }
    bucket[reactionType].count += 1;
    if (
      viewerUserId &&
      String(row.user_id || "").trim() === String(viewerUserId).trim()
    ) {
      bucket[reactionType].reactedByMe = true;
    }
  }
  return byMessage;
}

function normalizeMessageIds(raw, max = MAX_LIST_MESSAGE_IDS) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const value of raw) {
    const id = String(value || "").trim();
    if (!isValidUuid(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= max) break;
  }
  return out;
}

async function supabaseFetch({
  supabaseUrl,
  apiKey,
  accessToken,
  method,
  path,
  body,
  prefer,
}) {
  if (!supabaseUrl || !apiKey || !accessToken) return { ok: false, status: 0 };
  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${accessToken}`,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, status: res.status, res };
}

async function fetchReactionRows(env, accessToken, room, messageIds) {
  if (!messageIds.length) return [];
  const inList = messageIds.map((id) => encodeURIComponent(id)).join(",");
  const query =
    `select=message_id,user_id,reaction_type` +
    `&room_key=eq.${encodeURIComponent(room)}` +
    `&message_id=in.(${inList})`;
  const res = await fetch(`${env.supabaseUrl}/rest/v1/irc_message_reactions?${query}`, {
    headers: {
      apikey: env.publishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return null;
  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return null;
  }
}

function reactionItemsFromMap(byMessage, messageIds) {
  const items = [];
  for (const messageId of messageIds) {
    const reactions = byMessage.get(messageId) ?? emptyReactionBuckets();
    items.push({ messageId, reactions });
  }
  return items;
}

function assertRegisteredWs(ws) {
  if (ws?.identityType !== "registered") {
    return {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "Sign in to react to messages",
    };
  }
  const userId = ws?.user?.sub;
  if (!isRegisteredUserId(userId)) {
    return {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "Sign in to react to messages",
    };
  }
  if (!ws?.accessToken) {
    return {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "Sign in to react to messages",
    };
  }
  return { ok: true, userId: userId.trim(), accessToken: ws.accessToken };
}

function assertJoinedRoom(sessionManager, ws, room) {
  const session = sessionManager.getSession(ws);
  if (!session?.joinedRooms?.has(room)) {
    return {
      ok: false,
      code: "NOT_IN_ROOM",
      message: "Join the room before reacting",
    };
  }
  return { ok: true };
}

async function toggleIrcMessageReaction(ws, payload, env, sessionManager) {
  const auth = assertRegisteredWs(ws);
  if (!auth.ok) return auth;

  const room = validateRoomId(payload?.room);
  const messageId = isValidUuid(payload?.messageId) ? payload.messageId.trim() : null;
  const reactionType = parseReactionType(payload?.reactionType);

  if (!room || !messageId || !reactionType) {
    return {
      ok: false,
      code: "INVALID_REQUEST",
      message: "Invalid reaction request",
    };
  }

  const joined = assertJoinedRoom(sessionManager, ws, room);
  if (!joined.ok) return joined;

  const filter =
    `message_id=eq.${encodeURIComponent(messageId)}` +
    `&user_id=eq.${encodeURIComponent(auth.userId)}` +
    `&reaction_type=eq.${encodeURIComponent(reactionType)}`;

  const deleted = await supabaseFetch({
    supabaseUrl: env.supabaseUrl,
    apiKey: env.publishableKey,
    accessToken: auth.accessToken,
    method: "DELETE",
    path: `irc_message_reactions?${filter}`,
    prefer: "return=representation",
  });

  if (!deleted.ok && deleted.status !== 404) {
    return {
      ok: false,
      code: "REACTION_FAILED",
      message: "Could not update reaction",
    };
  }

  let removed = false;
  if (deleted.ok && deleted.res) {
    try {
      const body = await deleted.res.json();
      removed = Array.isArray(body) && body.length > 0;
    } catch {
      removed = deleted.status === 200 || deleted.status === 204;
    }
  }

  if (!removed) {
    const inserted = await supabaseFetch({
      supabaseUrl: env.supabaseUrl,
      apiKey: env.publishableKey,
      accessToken: auth.accessToken,
      method: "POST",
      path: "irc_message_reactions",
      body: {
        message_id: messageId,
        room_key: room,
        user_id: auth.userId,
        reaction_type: reactionType,
      },
      prefer: "return=minimal",
    });
    if (!inserted.ok) {
      return {
        ok: false,
        code: "REACTION_FAILED",
        message: "Could not add reaction",
      };
    }
  }

  const rows = await fetchReactionRows(env, auth.accessToken, room, [messageId]);
  if (rows === null) {
    return {
      ok: false,
      code: "REACTION_FAILED",
      message: "Could not load reaction state",
    };
  }

  const byMessage = aggregateReactionRows(rows, auth.userId);
  const reactions = byMessage.get(messageId) ?? emptyReactionBuckets();

  return {
    ok: true,
    room,
    messageId,
    reactions,
  };
}

async function listIrcMessageReactions(ws, payload, env, sessionManager) {
  const room = validateRoomId(payload?.room);
  const messageIds = normalizeMessageIds(payload?.messageIds);
  if (!room || !messageIds.length) {
    return {
      ok: false,
      code: "INVALID_REQUEST",
      message: "Invalid reaction list request",
    };
  }

  const joined = assertJoinedRoom(sessionManager, ws, room);
  if (!joined.ok) return joined;

  const viewerId =
    ws?.identityType === "registered" && isRegisteredUserId(ws?.user?.sub)
      ? String(ws.user.sub).trim()
      : null;
  const token = ws?.accessToken;
  if (!token || !env.supabaseUrl || !env.publishableKey) {
    return {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "Authentication required",
    };
  }

  const rows = await fetchReactionRows(env, token, room, messageIds);
  if (rows === null) {
    return {
      ok: false,
      code: "REACTION_FAILED",
      message: "Could not load reactions",
    };
  }

  const byMessage = aggregateReactionRows(rows, viewerId);
  return {
    ok: true,
    room,
    items: reactionItemsFromMap(byMessage, messageIds),
  };
}

function broadcastReactionUpdated(wss, sessionManager, room, messageId, reactions) {
  const frame = JSON.stringify({
    type: "reaction.updated",
    room,
    messageId,
    reactions,
  });
  for (const client of wss.clients) {
    if (client.readyState !== 1 || !client.authenticated) continue;
    const session = sessionManager.getSession(client);
    if (!session?.joinedRooms?.has(room)) continue;
    client.send(frame);
  }
}

module.exports = {
  IRC_REACTION_TYPES,
  MAX_LIST_MESSAGE_IDS,
  aggregateReactionRows,
  broadcastReactionUpdated,
  emptyReactionBuckets,
  listIrcMessageReactions,
  normalizeMessageIds,
  parseReactionType,
  toggleIrcMessageReaction,
};
