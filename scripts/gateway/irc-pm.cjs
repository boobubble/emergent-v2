/**
 * IRC private-message validation for gateway WebSocket frames.
 */

const { normalizeIrcNick } = require("./irc-nick.cjs");

function validateIrcNick(nick) {
  return normalizeIrcNick(nick);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_PM_LEN = 500;

function isValidUuid(value) {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

function sanitizePmText(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.replace(/[\r\n]/g, " ").replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed.length > MAX_PM_LEN) return null;
  return trimmed;
}

function validatePmSendPayload(payload, senderNick) {
  if (!payload || payload.type !== "pm.send") return null;

  const recipientNick = validateIrcNick(payload.recipientNick);
  if (!recipientNick) return null;

  const messageId =
    typeof payload.messageId === "string" ? payload.messageId.trim() : "";
  if (!isValidUuid(messageId)) return null;

  const text = sanitizePmText(payload.text);
  if (!text) return null;

  const sender = validateIrcNick(senderNick);
  if (!sender) return null;
  if (recipientNick.toLowerCase() === sender.toLowerCase()) return null;

  return { recipientNick, messageId, text };
}

module.exports = {
  MAX_PM_LEN,
  isValidUuid,
  sanitizePmText,
  validatePmSendPayload,
};
