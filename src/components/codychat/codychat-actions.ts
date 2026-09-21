/** Actions handled by CodyChat yaarzo-action-bridge.js inside the iframe. */
export type CodyChatAction = "private" | "friends" | "notifications" | "profile";

export const YAARZO_CODY_ACTION_MESSAGE = "YAARZO_CODY_ACTION" as const;

export function resolveCodyChatTargetOrigin(chatUrl: string | null): string | null {
  if (!chatUrl) return null;
  try {
    return new URL(chatUrl, typeof window !== "undefined" ? window.location.href : undefined)
      .origin;
  } catch {
    return null;
  }
}
