/**
 * Server-side HMAC tokens for guest IRC gateway auth.
 * Must match scripts/gateway/irc-guest-auth.cjs.
 */

import { createHmac } from "node:crypto";

export function signGuestGatewayToken(
  visitorId: string,
  nickname: string,
  expiresAt: string,
  secret: string,
): string {
  const payload = `${visitorId}|${nickname}|${expiresAt}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function gatewayGuestSecret(): string {
  return (
    process.env.GATEWAY_GUEST_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32) ||
    ""
  );
}
