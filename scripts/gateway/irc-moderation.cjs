/**
 * IRC moderation helpers for the Yaarzo chat gateway.
 * Ergo mute uses extban +b m: — NOT user prefix +q (founder mode).
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const IRC_NICK_RE = /^[A-Za-z0-9_\-\[\]\\^{}|`]+$/;
const ROOM_SLUG_RE = /^[a-z0-9][a-z0-9\-]{0,63}$/i;
const MAX_REASON = 120;

const MODERATION_ACTIONS = new Set([
  "kick",
  "ban",
  "unban",
  "mute",
  "unmute",
]);

function isValidUuid(value) {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

function validateRoomId(room) {
  const id = String(room || "").trim();
  if (!id || id.includes(":") || id.startsWith("dm:")) return null;
  if (isValidUuid(id) || ROOM_SLUG_RE.test(id)) return id;
  return null;
}

function validateIrcNick(nick) {
  const n = String(nick || "").trim();
  if (!n || n.length > 30 || !IRC_NICK_RE.test(n)) return null;
  return n;
}

function sanitizeReason(reason) {
  if (typeof reason !== "string") return "";
  return reason
    .replace(/[\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_REASON);
}

function toIrcChannel(room) {
  const value = String(room || "").trim();
  if (!value) return null;
  return value.startsWith("#") ? value : `#${value}`;
}

function buildKickCommand(channel, nick, reason) {
  const r = sanitizeReason(reason);
  return r ? `KICK ${channel} ${nick} :${r}\r\n` : `KICK ${channel} ${nick}\r\n`;
}

/** Ergo channel ban (prevents rejoin). */
function buildChannelBanCommand(channel, nick) {
  return `MODE ${channel} +b ${nick}!*@*\r\n`;
}

function buildChannelUnbanCommand(channel, nick) {
  return `MODE ${channel} -b ${nick}!*@*\r\n`;
}

/** Ergo mute extban — user may stay in channel but cannot speak. */
function buildMuteCommand(channel, nick) {
  return `MODE ${channel} +b m:${nick}!*@*\r\n`;
}

function buildUnmuteCommand(channel, nick) {
  return `MODE ${channel} -b m:${nick}!*@*\r\n`;
}

function buildModerationCommand(action, room, targetNick, reason) {
  const validatedRoom = validateRoomId(room);
  const validatedNick = validateIrcNick(targetNick);
  if (!validatedRoom || !validatedNick) return null;
  if (!MODERATION_ACTIONS.has(action)) return null;

  const channel = toIrcChannel(validatedRoom);
  if (!channel) return null;

  switch (action) {
    case "kick":
      return buildKickCommand(channel, validatedNick, reason);
    case "ban":
      return buildChannelBanCommand(channel, validatedNick);
    case "unban":
      return buildChannelUnbanCommand(channel, validatedNick);
    case "mute":
      return buildMuteCommand(channel, validatedNick);
    case "unmute":
      return buildUnmuteCommand(channel, validatedNick);
    default:
      return null;
  }
}

function parseModerationPayload(payload) {
  const action = String(payload?.action || payload?.type || "")
    .replace(/^moderation\./, "")
    .trim()
    .toLowerCase();
  if (!MODERATION_ACTIONS.has(action)) return null;

  const room = validateRoomId(payload?.room);
  const targetNick = validateIrcNick(payload?.targetNick);
  if (!room || !targetNick) return null;

  return {
    action,
    room,
    targetNick,
    reason: sanitizeReason(payload?.reason),
  };
}

const DEFAULT_STAFF_PERMISSIONS = {
  mod_can_kick: true,
  mod_can_mute: true,
  mod_can_ban: true,
};

async function supabaseRpc({ supabaseUrl, apiKey, accessToken, fn, body }) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function supabaseSelect({ supabaseUrl, apiKey, accessToken, table, query }) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function isGatewayAdmin(ws, env) {
  const userId = ws?.user?.sub;
  const token = ws?.accessToken;
  if (!userId || !token || !env.supabaseUrl || !env.publishableKey) return false;
  const ok = await supabaseRpc({
    supabaseUrl: env.supabaseUrl,
    apiKey: env.publishableKey,
    accessToken: token,
    fn: "is_admin",
    body: { _user_id: userId },
  });
  return ok === true;
}

async function hasGatewayRole(ws, role, env) {
  const userId = ws?.user?.sub;
  const token = ws?.accessToken;
  if (!userId || !token || !env.supabaseUrl || !env.publishableKey) return false;
  const ok = await supabaseRpc({
    supabaseUrl: env.supabaseUrl,
    apiKey: env.publishableKey,
    accessToken: token,
    fn: "has_role",
    body: { _user_id: userId, _role: role },
  });
  return ok === true;
}

async function loadStaffPermissions(ws, env) {
  const token = ws?.accessToken;
  if (!token || !env.supabaseUrl || !env.publishableKey) {
    return DEFAULT_STAFF_PERMISSIONS;
  }
  const rows = await supabaseSelect({
    supabaseUrl: env.supabaseUrl,
    apiKey: env.publishableKey,
    accessToken: token,
    table: "app_settings",
    query: "select=value&key=eq.staff_permissions",
  });
  const value = Array.isArray(rows) && rows[0]?.value && typeof rows[0].value === "object"
    ? rows[0].value
    : {};
  return { ...DEFAULT_STAFF_PERMISSIONS, ...value };
}

async function loadRoomModeratorPerms(ws, room, env) {
  const userId = ws?.user?.sub;
  const token = ws?.accessToken;
  if (!userId || !token || !env.supabaseUrl || !env.publishableKey) return null;
  const rows = await supabaseSelect({
    supabaseUrl: env.supabaseUrl,
    apiKey: env.publishableKey,
    accessToken: token,
    table: "room_moderators",
    query: `select=can_kick,can_mute,can_delete&channel_id=eq.${encodeURIComponent(room)}&user_id=eq.${encodeURIComponent(userId)}`,
  });
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows[0];
}

/**
 * Server-side authorization for IRC moderation relay.
 * Never trusts client-supplied role flags.
 */
async function canPerformIrcModeration(ws, room, action, env) {
  const validatedRoom = validateRoomId(room);
  if (!validatedRoom || !MODERATION_ACTIONS.has(action)) {
    return { allowed: false, code: "INVALID_REQUEST" };
  }

  if (await isGatewayAdmin(ws, env)) {
    return { allowed: true, source: "admin" };
  }

  const roomMod = await loadRoomModeratorPerms(ws, validatedRoom, env);
  const staffPerms = await loadStaffPermissions(ws, env);
  const isModerator = await hasGatewayRole(ws, "moderator", env);

  if (action === "kick") {
    if (roomMod?.can_kick) return { allowed: true, source: "room_mod" };
    if (isModerator && staffPerms.mod_can_kick) {
      return { allowed: true, source: "global_mod" };
    }
  }

  if (action === "mute" || action === "unmute") {
    if (roomMod?.can_mute) return { allowed: true, source: "room_mod" };
    if (isModerator && staffPerms.mod_can_mute) {
      return { allowed: true, source: "global_mod" };
    }
  }

  if (action === "ban" || action === "unban") {
    if (roomMod?.can_kick) return { allowed: true, source: "room_mod" };
    if (isModerator && staffPerms.mod_can_ban) {
      return { allowed: true, source: "global_mod" };
    }
  }

  return { allowed: false, code: "FORBIDDEN" };
}

module.exports = {
  MODERATION_ACTIONS,
  buildModerationCommand,
  canPerformIrcModeration,
  isGatewayAdmin,
  parseModerationPayload,
  sanitizeReason,
  toIrcChannel,
  validateIrcNick,
  validateRoomId,
};
