/**
 * Shared homepage / heropage / login entry destinations.
 * Chat identity still uses existing login, signup, and ephemeral guest session.
 */

/** Where login, signup, and guest-login from marketing CTAs should land. */
export const AUTH_ENTRY_DESTINATION = "/chatroom" as const;

/** Canonical default public chatroom for guests, new users, and returning users. */
export const YAARZO_GLOBAL_ROOM_ID = "yaarzo-global" as const;

/** Pre-rename guest/IRC lobby id. Guest send still accepts this alias. */
export const LEGACY_LOBBY_ROOM_ID = "lobby" as const;

export function isYaarzoGlobalRoom(channelId: string): boolean {
  return channelId === YAARZO_GLOBAL_ROOM_ID;
}

export function isGuestDefaultChatRoom(channelId: string): boolean {
  return channelId === YAARZO_GLOBAL_ROOM_ID || channelId === LEGACY_LOBBY_ROOM_ID;
}
