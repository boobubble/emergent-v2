import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

/**
 * Outbound webhook signing (Stripe-style).
 */
export function signWebhookDelivery(secret: string, body: string) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const id = randomUUID();
  const mac = createHmac("sha256", secret).update(`${ts}.${id}.${body}`).digest("hex");
  return { ts, id, signature: `t=${ts},v1=${mac}` };
}

export function newApiKey() {
  const raw = "bk_" + randomBytes(24).toString("hex");
  const prefix = raw.slice(0, 10);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

export function newWebhookSecret() {
  return "whsec_" + randomBytes(24).toString("hex");
}

// ===== AES-256-GCM at-rest encryption for webhook signing secrets =====
// Key is derived from the WEBHOOK_ENC_KEY env var so an admin DB compromise
// alone cannot reveal stored secrets.
function encKey(): Buffer {
  const raw = process.env.WEBHOOK_ENC_KEY;
  if (!raw) throw new Error("WEBHOOK_ENC_KEY env var is not configured");
  // Derive a stable 32-byte key from whatever-length input.
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: v1.<iv>.<tag>.<ciphertext> all base64url
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}

export function decryptSecret(packed: string): string {
  const parts = packed.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") throw new Error("Invalid ciphertext format");
  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  const enc = Buffer.from(parts[3], "base64url");
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
