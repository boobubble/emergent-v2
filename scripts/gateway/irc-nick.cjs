/**
 * Centralized IRC nick normalization, validation, and collision resolution.
 * Shared by gateway per-user sessions and tests.
 */

const IRC_NICK_RE = /^[A-Za-z0-9_\-\[\]\\^{}|`]+$/;
const MAX_NICK_LEN = 30;

/** Nicks that must never be claimed by Yaarzo sessions. */
const PROTECTED_NICKS = new Set([
  "yaarzogateway",
  "yaarzo-gateway",
  "yaarzo_gateway",
  "yaarzo",
  "ergo",
  "admin",
  "administrator",
  "root",
  "services",
  "chanserv",
  "nickserv",
  "operserv",
  "hostserv",
  "memoserv",
  "botserv",
]);

function stripCrLf(value) {
  return String(value || "").replace(/[\r\n]/g, "");
}

/**
 * Normalize raw input into a valid Ergo IRC nick (or null).
 * @param {string} raw
 * @param {{ maxLen?: number }} [opts]
 */
function normalizeIrcNick(raw, opts = {}) {
  const maxLen = opts.maxLen ?? MAX_NICK_LEN;
  let n = stripCrLf(raw).trim();
  if (!n) return null;

  n = n
    .replace(/[^A-Za-z0-9_\-\[\]\\^{}|`]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_\-]+/, "")
    .slice(0, maxLen);

  if (!n || n.length < 1) return null;
  if (!IRC_NICK_RE.test(n)) return null;
  if (isProtectedNick(n)) return null;
  return n;
}

function isProtectedNick(nick) {
  const key = String(nick || "").trim().toLowerCase();
  if (!key) return true;
  if (PROTECTED_NICKS.has(key)) return true;
  if (key.startsWith("yaarzo") && key !== "yaarzo") return false;
  if (key === "yaarzo") return true;
  return false;
}

function isValidIrcNick(nick) {
  const n = String(nick || "").trim();
  if (!n || n.length > MAX_NICK_LEN) return false;
  if (!IRC_NICK_RE.test(n)) return false;
  if (isProtectedNick(n)) return false;
  return true;
}

/**
 * Derive a stable IRC nick for a registered Supabase user.
 * @param {{ sub?: string, user_metadata?: Record<string, unknown>, username?: string }} user
 */
function nickFromRegisteredUser(user) {
  const raw =
    user?.user_metadata?.username ||
    user?.user_metadata?.user_name ||
    user?.username ||
    `user_${String(user?.sub || "").slice(0, 8)}`;

  const normalized = normalizeIrcNick(raw);
  if (normalized) return normalized;
  return normalizeIrcNick(`user_${String(user?.sub || "").slice(0, 8)}`) || "user_unknown";
}

/**
 * Derive IRC nick from guest display name (e.g. Guest-Arman).
 * @deprecated Prefer nickFromGuestNickname for new guest IRC sessions.
 */
function nickFromGuestDisplayName(displayName) {
  const raw = String(displayName || "").trim();
  const stripped = raw.replace(/^guest[-_\s]*/i, "");
  return normalizeIrcNick(stripped || raw);
}

/**
 * Derive IRC nick from the guest's chosen nickname (e.g. Ranjha).
 */
function nickFromGuestNickname(nickname) {
  return normalizeIrcNick(nickname);
}

/**
 * Resolve nick collision without evicting an existing session.
 * @param {string} desired
 * @param {Set<string>|Map<string, unknown>} occupiedLowercase
 */
function resolveNickCollision(desired, occupiedLowercase) {
  const base = normalizeIrcNick(desired);
  if (!base) return null;

  const occupied = occupiedLowercase instanceof Map
    ? new Set([...occupiedLowercase.keys()].map((k) => String(k).toLowerCase()))
    : new Set([...occupiedLowercase].map((k) => String(k).toLowerCase()));

  const tryNick = (candidate) => {
    const n = normalizeIrcNick(candidate);
    if (!n) return null;
    if (!occupied.has(n.toLowerCase())) return n;
    return null;
  };

  const direct = tryNick(base);
  if (direct) return direct;

  for (let i = 2; i <= 99; i++) {
    const suffix = `_${i}`;
    const trimmedBase = base.slice(0, Math.max(1, MAX_NICK_LEN - suffix.length));
    const candidate = tryNick(`${trimmedBase}${suffix}`);
    if (candidate) return candidate;
  }

  return null;
}

module.exports = {
  MAX_NICK_LEN,
  PROTECTED_NICKS,
  normalizeIrcNick,
  isProtectedNick,
  isValidIrcNick,
  nickFromRegisteredUser,
  nickFromGuestDisplayName,
  nickFromGuestNickname,
  resolveNickCollision,
};
