/**
 * HMAC-signed guest gateway tokens — no Supabase auth.users required.
 * Issued by startGuestChatSession server fn; verified by gateway on WS auth.
 */

const { createHmac, createHash, timingSafeEqual } = require("node:crypto");

function signGuestGatewayToken(visitorId, nickname, expiresAt, secret) {
  if (!secret || typeof secret !== "string") {
    throw new Error("GATEWAY_GUEST_SECRET is required to sign guest tokens");
  }
  const payload = `${visitorId}|${nickname}|${expiresAt}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function fingerprintGatewaySecret(secret) {
  if (!secret || typeof secret !== "string") return "";
  return createHash("sha256").update(secret).digest("hex").slice(0, 16);
}

function guestAuthFieldMeta(value) {
  const type = value === null ? "null" : typeof value;
  const length = typeof value === "string" ? value.length : 0;
  const present =
    value !== undefined &&
    value !== null &&
    !(typeof value === "string" && value.length === 0);
  return { present, type, length };
}

function guestAuthExpiryValid(expiresAt) {
  if (typeof expiresAt !== "string" || !expiresAt) return false;
  const ms = new Date(expiresAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
}

/**
 * Diagnostic verify — same acceptance rules as verifyGuestGatewayToken.
 * @returns {{ valid: boolean, reason: string }}
 */
function diagnoseGuestGatewayToken({ visitorId, nickname, expiresAt, token }, secret) {
  if (!secret || typeof secret !== "string") {
    return { valid: false, reason: "MISSING_SECRET" };
  }
  if (!visitorId || !nickname || !expiresAt || !token) {
    return { valid: false, reason: "MISSING_FIELDS" };
  }
  if (!String(visitorId).startsWith("visitor_")) {
    return { valid: false, reason: "BAD_VISITOR" };
  }
  if (new Date(expiresAt).getTime() <= Date.now()) {
    return { valid: false, reason: "EXPIRED" };
  }

  const expected = signGuestGatewayToken(visitorId, nickname, expiresAt, secret);
  try {
    const a = Buffer.from(String(token), "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) {
      return { valid: false, reason: "HMAC_MISMATCH" };
    }
    if (!timingSafeEqual(a, b)) {
      return { valid: false, reason: "HMAC_MISMATCH" };
    }
    return { valid: true, reason: "OK" };
  } catch {
    return { valid: false, reason: "HMAC_MISMATCH" };
  }
}

function verifyGuestGatewayToken(params, secret) {
  return diagnoseGuestGatewayToken(params, secret).valid;
}

module.exports = {
  signGuestGatewayToken,
  verifyGuestGatewayToken,
  diagnoseGuestGatewayToken,
  fingerprintGatewaySecret,
  guestAuthFieldMeta,
  guestAuthExpiryValid,
};
