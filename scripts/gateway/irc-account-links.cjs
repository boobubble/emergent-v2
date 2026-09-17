/**
 * VPS-only IRC account link map (UUID → Ergo SASL identity).
 * Parse once at process start. Never log passwords.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACCOUNT_RE = /^[A-Za-z0-9_\-\[\]\\^{}|`]{1,32}$/;
const MAX_PASSWORD_LEN = 256;

/**
 * @param {unknown} raw
 * @returns {{ ok: boolean, links: Map<string, { account: string, password: string }>, error?: string }}
 */
function parseIrcAccountLinksJson(raw) {
  const links = new Map();
  if (raw === undefined || raw === null) {
    return { ok: true, links };
  }
  if (typeof raw !== "string") {
    return { ok: false, links, error: "invalid_type" };
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, links };
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, links, error: "invalid_json" };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, links, error: "invalid_shape" };
  }

  for (const [key, value] of Object.entries(parsed)) {
    const userId = String(key || "").trim().toLowerCase();
    if (!UUID_RE.test(userId)) continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    const account = String(value.account || "").trim();
    const password = typeof value.password === "string" ? value.password : "";
    if (!ACCOUNT_RE.test(account)) continue;
    if (!password || password.length > MAX_PASSWORD_LEN) continue;
    if (/[\r\n]/.test(password)) continue;

    links.set(userId, { account, password });
  }

  return { ok: true, links };
}

/**
 * UUID/sub lookup only. Never matches on username/display_name/account string as key.
 * @param {Map<string, { account: string, password: string }>} links
 * @param {unknown} userId
 * @param {string} [identityType]
 */
function lookupIrcAccountLink(links, userId, identityType) {
  if (identityType && identityType !== "registered") return null;
  if (!links || typeof links.get !== "function") return null;
  const id = String(userId || "").trim().toLowerCase();
  if (!UUID_RE.test(id)) return null;
  return links.get(id) ?? null;
}

module.exports = {
  UUID_RE,
  parseIrcAccountLinksJson,
  lookupIrcAccountLink,
};
