import type { RefObject } from "react";

/** Actions handled by CodyChat yaarzo-action-bridge.js inside the iframe. */
export type CodyChatAction = "private" | "friends" | "notifications" | "profile";

export const YAARZO_CODY_ACTION_MESSAGE = "YAARZO_CODY_ACTION" as const;
export const YAARZO_CODY_LOGOUT_MESSAGE = "YAARZO_CODY_LOGOUT" as const;
export const YAARZO_CODY_GUEST_LOGIN_MESSAGE = "YAARZO_CODY_GUEST_LOGIN" as const;

export function resolveCodyChatTargetOrigin(chatUrl: string | null): string | null {
  if (!chatUrl) return null;
  try {
    return new URL(chatUrl, typeof window !== "undefined" ? window.location.href : undefined)
      .origin;
  } catch {
    return null;
  }
}

export function postCodyChatBridgeMessage(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  chatUrl: string | null,
  payload: Record<string, unknown>,
): void {
  const targetOrigin = resolveCodyChatTargetOrigin(chatUrl);
  if (!targetOrigin) return;
  const iframeWindow = iframeRef.current?.contentWindow;
  if (!iframeWindow) return;
  iframeWindow.postMessage(payload, targetOrigin);
}
