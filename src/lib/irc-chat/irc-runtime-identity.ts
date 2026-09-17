export type IrcGuestSessionSlice = {
  visitorId: string;
  displayName: string;
  nickname: string;
  expiresAt?: string;
  gatewayToken?: string;
};

/**
 * Stable IRC identity for core lifecycle. Ignores guest UI config hydration
 * (guest.enabled) — only registered user id or signed guest visitor+token.
 */
export function computeIrcIdentityKey(
  user: { id: string; isGuest?: boolean } | null,
  guestSession: IrcGuestSessionSlice | null | undefined,
): string | null {
  if (user && !user.isGuest) {
    const id = user.id.trim();
    return id ? `reg:${id}` : null;
  }

  if (user) return null;

  const visitorId = guestSession?.visitorId?.trim();
  const token = guestSession?.gatewayToken?.trim();
  if (visitorId && token) {
    return `gst:${visitorId}:${token}`;
  }

  return null;
}
