import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

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
