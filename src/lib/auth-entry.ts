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

/** One-shot: next /chatroom mount should open gateway primaryRoom (auth/guest/plain entry). */
export const CHAT_FRESH_ENTRY_KEY = "palrgo:chat-fresh-entry";

/** Explicit ?room= request for /chatroom (wins over primaryRoom). */
export const CHAT_REQUESTED_ROOM_KEY = "palrgo:chat-requested-room";

export function markChatFreshEntry(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(CHAT_FRESH_ENTRY_KEY, "1");
    sessionStorage.removeItem(CHAT_REQUESTED_ROOM_KEY);
  } catch {
    /* ignore */
  }
}

export function consumeChatFreshEntry(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const v = sessionStorage.getItem(CHAT_FRESH_ENTRY_KEY);
    if (!v) return false;
    sessionStorage.removeItem(CHAT_FRESH_ENTRY_KEY);
    return true;
  } catch {
    return false;
  }
}

export function setRequestedChatRoom(roomId: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(CHAT_REQUESTED_ROOM_KEY, roomId);
    sessionStorage.removeItem(CHAT_FRESH_ENTRY_KEY);
  } catch {
    /* ignore */
  }
}

export function consumeRequestedChatRoom(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const v = sessionStorage.getItem(CHAT_REQUESTED_ROOM_KEY);
    if (!v) return null;
    sessionStorage.removeItem(CHAT_REQUESTED_ROOM_KEY);
    return v;
  } catch {
    return null;
  }
}

export function isYaarzoGlobalRoom(channelId: string): boolean {
  return channelId === YAARZO_GLOBAL_ROOM_ID;
}

export function isGuestDefaultChatRoom(channelId: string): boolean {
  return channelId === YAARZO_GLOBAL_ROOM_ID || channelId === LEGACY_LOBBY_ROOM_ID;
}
