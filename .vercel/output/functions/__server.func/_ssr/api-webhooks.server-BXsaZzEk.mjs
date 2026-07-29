import { randomBytes, createHash, createCipheriv, createDecipheriv, randomUUID, createHmac } from "node:crypto";
function signWebhookDelivery(secret, body) {
  const ts = Math.floor(Date.now() / 1e3).toString();
  const id = randomUUID();
  const mac = createHmac("sha256", secret).update(`${ts}.${id}.${body}`).digest("hex");
  return { ts, id, signature: `t=${ts},v1=${mac}` };
}
function newApiKey() {
  const raw = "bk_" + randomBytes(24).toString("hex");
  const prefix = raw.slice(0, 10);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}
function newWebhookSecret() {
  return "whsec_" + randomBytes(24).toString("hex");
}
function encKey() {
  const raw = process.env.WEBHOOK_ENC_KEY;
  if (!raw) throw new Error("WEBHOOK_ENC_KEY env var is not configured");
  return createHash("sha256").update(raw).digest();
}
function encryptSecret(plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}
function decryptSecret(packed) {
  const parts = packed.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") throw new Error("Invalid ciphertext format");
  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  const enc = Buffer.from(parts[3], "base64url");
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
export {
  decryptSecret,
  encryptSecret,
  newApiKey,
  newWebhookSecret,
  signWebhookDelivery
};
