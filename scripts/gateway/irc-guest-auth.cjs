/**
 * HMAC-signed guest gateway tokens — no Supabase auth.users required.
 * Issued by startGuestChatSession server fn; verified by gateway on WS auth.
 */

const { createHmac, timingSafeEqual } = require("node:crypto");

function signGuestGatewayToken(visitorId, nickname, expiresAt, secret) {
  if (!secret || typeof secret !== "string") {
    throw new Error("GATEWAY_GUEST_SECRET is required to sign guest tokens");
  }
  const payload = `${visitorId}|${nickname}|${expiresAt}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function verifyGuestGatewayToken({ visitorId, nickname, expiresAt, token }, secret) {
  if (!secret || typeof secret !== "string") return false;
  if (!visitorId || !nickname || !expiresAt || !token) return false;
  if (!String(visitorId).startsWith("visitor_")) return false;
  if (new Date(expiresAt).getTime() <= Date.now()) return false;

  const expected = signGuestGatewayToken(visitorId, nickname, expiresAt, secret);
  try {
    const a = Buffer.from(String(token), "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

module.exports = {
  signGuestGatewayToken,
  verifyGuestGatewayToken,
};
