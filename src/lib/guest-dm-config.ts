/**
 * Guest → registered-user PM settings (app_settings.guest_dm).
 * Separate from guest_chat — can be enabled independently.
 */

export const GUEST_DM_SETTING_KEY = "guest_dm" as const;

export interface GuestDmConfig {
  enabled: boolean;
  messageCooldownSec: number;
  maxMessageLength: number;
  messageTtlMinutes: number;
  sessionTtlHours: number;
}

export const GUEST_DM_DEFAULTS: GuestDmConfig = {
  enabled: false,
  messageCooldownSec: 3,
  maxMessageLength: 280,
  messageTtlMinutes: 120,
  sessionTtlHours: 12,
};

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function mergeGuestDmConfig(raw: unknown): GuestDmConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<GuestDmConfig>;
  return {
    enabled: Boolean(r.enabled),
    messageCooldownSec: clampInt(r.messageCooldownSec, 1, 120, GUEST_DM_DEFAULTS.messageCooldownSec),
    maxMessageLength: clampInt(r.maxMessageLength, 40, 2000, GUEST_DM_DEFAULTS.maxMessageLength),
    messageTtlMinutes: clampInt(r.messageTtlMinutes, 5, 7 * 24 * 60, GUEST_DM_DEFAULTS.messageTtlMinutes),
    sessionTtlHours: clampInt(r.sessionTtlHours, 1, 72, GUEST_DM_DEFAULTS.sessionTtlHours),
  };
}
