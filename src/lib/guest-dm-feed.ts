/**
 * Pure guest DM feed helpers — row merge, message mapping.
 */

import { guestDmChannelId } from "./guest-dm-utils";
import { isGuestOptimisticId } from "./chat-optimistic";
import type { Message, User } from "./chat-types";

export interface GuestDmRow {
  id: string;
  conversationId: string;
  senderKind: "guest" | "registered";
  text: string;
  createdAt: string;
  expiresAt: string;
  visitorId?: string;
  recipientId?: string;
  sendStatus?: "sending" | "failed";
  sendError?: string;
}

export const GUEST_DM_ROW_EVENT = "yaarzo:guest-dm-row";

export function mergeGuestDmRows(
  existing: GuestDmRow[],
  incoming: GuestDmRow[],
  nowMs = Date.now(),
): GuestDmRow[] {
  const byId = new Map<string, GuestDmRow>();
  for (const row of existing) {
    if (new Date(row.expiresAt).getTime() > nowMs) byId.set(row.id, row);
  }
  for (const row of incoming) {
    if (new Date(row.expiresAt).getTime() > nowMs) byId.set(row.id, row);
  }
  const confirmed = [...byId.values()].filter((r) => !isGuestOptimisticId(r.id));
  for (const real of confirmed) {
    for (const [id, row] of [...byId]) {
      if (!isGuestOptimisticId(id)) continue;
      if (row.text === real.text && row.senderKind === real.senderKind) byId.delete(id);
    }
    const cur = byId.get(real.id);
    if (cur && (cur.sendStatus || cur.sendError)) {
      const next = { ...cur };
      delete next.sendStatus;
      delete next.sendError;
      byId.set(real.id, next);
    }
  }
  return [...byId.values()]
    .sort((a, b) => {
      const byTime = a.createdAt.localeCompare(b.createdAt);
      return byTime !== 0 ? byTime : a.id.localeCompare(b.id);
    })
    .slice(-120);
}

export function payloadToGuestDmRow(n: Record<string, unknown>): GuestDmRow | null {
  const id = String(n.id ?? "");
  const conversationId = String(n.conversation_id ?? "");
  const senderKind = String(n.sender_kind ?? "") as "guest" | "registered";
  const text = String(n.text ?? "");
  const createdAt = String(n.created_at ?? "");
  const expiresAt = String(n.expires_at ?? "");
  if (!id || !conversationId || !text || !createdAt || !expiresAt) return null;
  if (senderKind !== "guest" && senderKind !== "registered") return null;
  return { id, conversationId, senderKind, text, createdAt, expiresAt };
}

export function guestDmMessageId(messageRowId: string): string {
  return `gdmmsg:${messageRowId}`;
}

export function rowToGuestDmMessage(
  row: GuestDmRow,
  channelId: string,
  visitorId: string,
  recipientId: string,
  guestDisplayName: string,
): Message {
  const isGuestSender = row.senderKind === "guest";
  return {
    id: guestDmMessageId(row.id),
    channelId,
    authorId: isGuestSender ? visitorId : recipientId,
    text: row.text,
    ts: new Date(row.createdAt).getTime(),
    kind: "text",
    sendStatus: row.sendStatus,
    sendError: row.sendError,
  };
}

export function guestDmRecipientUser(recipientId: string, recipientName: string): User {
  return {
    id: recipientId,
    name: recipientName,
    avatarColor: "oklch(0.58 0.08 250)",
    status: "offline",
    xp: 0,
    level: 1,
  };
}

export function guestDmGuestUser(visitorId: string, displayName: string): User {
  return {
    id: visitorId,
    name: displayName,
    avatarColor: "oklch(0.62 0.02 250)",
    status: "online",
    isGuest: true,
    xp: 0,
    level: 1,
  };
}

export function guestDmChannelForConversation(conversationId: string): string {
  return guestDmChannelId(conversationId);
}
