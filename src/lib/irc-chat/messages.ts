import type { IrcChatMessage } from "./types";
import { isValidMessageId } from "./protocol";

export function appendPublicMessage(
  messages: Record<string, IrcChatMessage[]>,
  roomId: string,
  message: IrcChatMessage,
): Record<string, IrcChatMessage[]> {
  const existing = messages[roomId] || [];
  if (existing.some((m) => m.id === message.id)) return messages;
  return {
    ...messages,
    [roomId]: [...existing, message].sort((a, b) => a.ts - b.ts),
  };
}

export function confirmPublicMessage(
  messages: Record<string, IrcChatMessage[]>,
  roomId: string,
  messageId: string,
  patch?: Partial<IrcChatMessage>,
): Record<string, IrcChatMessage[]> {
  const list = messages[roomId];
  if (!list?.length) return messages;
  let changed = false;
  const next = list.map((m) => {
    if (m.id !== messageId) return m;
    changed = true;
    return { ...m, ...patch, pending: false, failed: false };
  });
  if (!changed) return messages;
  return { ...messages, [roomId]: next };
}

export function markPublicMessageFailed(
  messages: Record<string, IrcChatMessage[]>,
  roomId: string,
  messageId: string,
): Record<string, IrcChatMessage[]> {
  const list = messages[roomId];
  if (!list?.length) return messages;
  return {
    ...messages,
    [roomId]: list.map((m) =>
      m.id === messageId ? { ...m, pending: false, failed: true } : m,
    ),
  };
}

export function receivePublicMessage(
  messages: Record<string, IrcChatMessage[]>,
  roomId: string,
  incoming: Omit<IrcChatMessage, "roomId">,
): Record<string, IrcChatMessage[]> {
  if (!isValidMessageId(incoming.id)) return messages;
  return appendPublicMessage(messages, roomId, { ...incoming, roomId });
}

/** Dedup own-message echo: skip when messageId already exists (optimistic or sent ack). */
export function shouldAcceptIncomingPublicMessage(
  messages: Record<string, IrcChatMessage[]>,
  roomId: string,
  messageId: string,
): boolean {
  const existing = messages[roomId] || [];
  return !existing.some((m) => m.id === messageId);
}

export function newMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
