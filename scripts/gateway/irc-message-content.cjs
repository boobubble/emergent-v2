/**
 * Optional IRC message content metadata (stickers) — gateway WS only, not Ergo tags.
 */

const { isValidUuid } = require("./irc-pm.cjs");

const STICKER_TOKEN_RE =
  /^:s:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):$/i;

function parseStickerToken(text) {
  const match = STICKER_TOKEN_RE.exec(String(text || "").trim());
  if (!match) return null;
  const id = match[1].trim();
  return isValidUuid(id) ? id : null;
}

function parseOutboundMessageContent(payload) {
  const text = typeof payload?.text === "string" ? payload.text.trim() : "";
  const rawType = String(payload?.contentType || "").trim().toLowerCase();
  const stickerId =
    typeof payload?.stickerId === "string" && isValidUuid(payload.stickerId.trim())
      ? payload.stickerId.trim()
      : null;

  if (rawType === "sticker" || stickerId) {
    const fromToken = parseStickerToken(text);
    const resolvedId = stickerId || fromToken;
    if (!resolvedId) {
      return { ok: false, code: "INVALID_STICKER", message: "Invalid sticker message" };
    }
    const expectedToken = `:s:${resolvedId.toLowerCase()}:`;
    if (text !== expectedToken) {
      return { ok: false, code: "INVALID_STICKER", message: "Sticker text must match token" };
    }
    return {
      ok: true,
      text,
      contentType: "sticker",
      stickerId: resolvedId.toLowerCase(),
    };
  }

  if (rawType && rawType !== "text") {
    return { ok: false, code: "INVALID_CONTENT", message: "Unsupported content type" };
  }

  return { ok: true, text, contentType: "text", stickerId: undefined };
}

module.exports = {
  parseOutboundMessageContent,
  parseStickerToken,
};
