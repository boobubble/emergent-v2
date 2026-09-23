import { isUuid } from "@/lib/dm-utils";
import { getCodyChatMessageOrigin } from "./codychat-roster";

export const YAARZO_OPEN_DM_MESSAGE = "YAARZO_OPEN_DM" as const;

export function parseYaarzoOpenDmMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;
  if (rec.type !== YAARZO_OPEN_DM_MESSAGE) return null;
  const peerId = String(rec.peerId ?? "").trim().toLowerCase();
  if (!isUuid(peerId)) return null;
  return peerId;
}

export function isCodyChatOpenDmMessageEvent(
  event: MessageEvent,
  iframeWindow: Window | null | undefined,
): string | null {
  if (!iframeWindow || event.source !== iframeWindow) return null;
  if (event.origin !== getCodyChatMessageOrigin()) return null;
  return parseYaarzoOpenDmMessage(event.data);
}
