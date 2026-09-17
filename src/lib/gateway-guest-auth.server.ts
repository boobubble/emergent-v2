/**
 * Server-side HMAC tokens for guest IRC gateway auth.
 * Must match scripts/gateway/irc-guest-auth.cjs.
 */

import { createHash, createHmac } from "node:crypto";

export type GatewayGuestSecretSource =
  | "GATEWAY_GUEST_SECRET"
  | "SERVICE_ROLE_FALLBACK"
  | "EMPTY";

export type GuestAuthFieldMeta = {
  present: boolean;
  type: string;
  length: number;
};

export function signGuestGatewayToken(
  visitorId: string,
  nickname: string,
  expiresAt: string,
  secret: string,
): string {
  const payload = `${visitorId}|${nickname}|${expiresAt}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function resolveGatewayGuestSecret(): {
  secret: string;
  source: GatewayGuestSecretSource;
} {
  const fromGuest = process.env.GATEWAY_GUEST_SECRET;
  if (fromGuest) {
    return { secret: fromGuest, source: "GATEWAY_GUEST_SECRET" };
  }
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32);
  if (fallback) {
    return { secret: fallback, source: "SERVICE_ROLE_FALLBACK" };
  }
  return { secret: "", source: "EMPTY" };
}

export function gatewayGuestSecret(): string {
  return resolveGatewayGuestSecret().secret;
}

/** SHA-256 fingerprint of the signing secret (first 16 hex chars). Never log the secret itself. */
export function fingerprintGatewaySecret(secret: string): string {
  if (!secret) return "";
  return createHash("sha256").update(secret).digest("hex").slice(0, 16);
}

export function guestAuthFieldMeta(value: unknown): GuestAuthFieldMeta {
  const type = value === null ? "null" : typeof value;
  const length = typeof value === "string" ? value.length : 0;
  const present =
    value !== undefined &&
    value !== null &&
    !(typeof value === "string" && value.length === 0);
  return { present, type, length };
}

export function guestAuthExpiryValid(expiresAt: unknown): boolean {
  if (typeof expiresAt !== "string" || !expiresAt) return false;
  const ms = new Date(expiresAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
}
