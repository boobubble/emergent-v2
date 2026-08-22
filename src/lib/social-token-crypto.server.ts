import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM for social OAuth/API tokens at rest.
 * Prefers SOCIAL_TOKEN_ENC_KEY; falls back to WEBHOOK_ENC_KEY.
 */
function encKey(): Buffer {
  const raw =
    process.env.SOCIAL_TOKEN_ENC_KEY?.trim() ||
    process.env.WEBHOOK_ENC_KEY?.trim() ||
    "";
  if (!raw) {
    throw new Error(
      "SOCIAL_TOKEN_ENC_KEY (or WEBHOOK_ENC_KEY) is not configured. Social tokens cannot be stored.",
    );
  }
  return createHash("sha256").update(raw).digest();
}

export function socialTokenEncryptionConfigured(): boolean {
  return Boolean(
    process.env.SOCIAL_TOKEN_ENC_KEY?.trim() || process.env.WEBHOOK_ENC_KEY?.trim(),
  );
}

export function encryptSocialSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}

export function decryptSocialSecret(packed: string): string {
  const parts = packed.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") throw new Error("Invalid social token ciphertext");
  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  const enc = Buffer.from(parts[3], "base64url");
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function newOauthState(): string {
  return randomBytes(24).toString("hex");
}

export function newPkceVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function pkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
