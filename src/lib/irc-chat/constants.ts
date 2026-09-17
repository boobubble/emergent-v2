/** Canonical v1 IRC public room — sole product target for Phase A core. */
export const IRC_CHAT_PRODUCT_ROOM = "yaarzo-global" as const;

/** Default gateway WebSocket endpoint (browser). */
export const IRC_CHAT_DEFAULT_WS_URL = "wss://ws.yaarzo.com" as const;

/** Presence dedup window (matches legacy chat-store IRC handler). */
export const IRC_PRESENCE_DEDUP_MS = 1500;
