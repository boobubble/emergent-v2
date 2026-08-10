/**
 * Ephemeral Lobby guest chat (session-scoped visitors).
 * Never creates auth.users / profiles / anonymous Supabase sessions.
 * Settings live in app_settings.guest_chat (default OFF).
 */

export const GUEST_CHAT_SETTING_KEY = "guest_chat" as const;
export const GUEST_LOBBY_CHANNEL_ID = "lobby" as const;

export interface GuestChatConfig {
  /** Master switch — default OFF keeps read-only public browse. */
  enabled: boolean;
  /** Display prefix, e.g. "Guest-" → Guest-Arman */
  namePrefix: string;
  nicknameMinLength: number;
  nicknameMaxLength: number;
  /** Minimum seconds between sends for the same visitor session. */
  messageCooldownSec: number;
  maxMessageLength: number;
  /** How long guest messages remain visible before expiry cleanup. */
  messageTtlMinutes: number;
  /** How long a guest nickname session remains valid. */
  sessionTtlHours: number;
}

export const GUEST_CHAT_DEFAULTS: GuestChatConfig = {
  enabled: false,
  namePrefix: "Guest-",
  nicknameMinLength: 2,
  nicknameMaxLength: 16,
  messageCooldownSec: 3,
  maxMessageLength: 280,
  messageTtlMinutes: 120,
  sessionTtlHours: 12,
};

export function mergeGuestChatConfig(raw: unknown): GuestChatConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<GuestChatConfig>;
  const prefix = typeof r.namePrefix === "string" && r.namePrefix.trim()
    ? r.namePrefix.trim().slice(0, 24)
    : GUEST_CHAT_DEFAULTS.namePrefix;
  return {
    enabled: Boolean(r.enabled),
    namePrefix: prefix.endsWith("-") ? prefix : `${prefix}-`,
    nicknameMinLength: clampInt(r.nicknameMinLength, 1, 32, GUEST_CHAT_DEFAULTS.nicknameMinLength),
    nicknameMaxLength: clampInt(r.nicknameMaxLength, 2, 32, GUEST_CHAT_DEFAULTS.nicknameMaxLength),
    messageCooldownSec: clampInt(r.messageCooldownSec, 1, 120, GUEST_CHAT_DEFAULTS.messageCooldownSec),
    maxMessageLength: clampInt(r.maxMessageLength, 40, 2000, GUEST_CHAT_DEFAULTS.maxMessageLength),
    messageTtlMinutes: clampInt(r.messageTtlMinutes, 5, 7 * 24 * 60, GUEST_CHAT_DEFAULTS.messageTtlMinutes),
    sessionTtlHours: clampInt(r.sessionTtlHours, 1, 72, GUEST_CHAT_DEFAULTS.sessionTtlHours),
  };
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function formatGuestDisplayName(prefix: string, nickname: string): string {
  const p = prefix.endsWith("-") ? prefix : `${prefix}-`;
  return `${p}${nickname}`;
}