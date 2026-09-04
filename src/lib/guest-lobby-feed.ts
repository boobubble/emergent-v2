/**
 * Pure guest-lobby feed helpers.
 * History must merge by id so realtime / post-send rows are not wiped.
 */

import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import { isGuestOptimisticId } from "@/lib/chat-optimistic";
import type { Message, User } from "@/lib/chat-types";

export interface GuestLobbyRow {
  id: string;
  channelId: string;
  visitorId: string;
  displayName: string;
  text: string;
  createdAt: string;
  expiresAt: string;
  sendStatus?: "sending" | "failed";
  sendError?: string;
}

/** MessageInput publishes the inserted row so the list does not wait on realtime. */
export const GUEST_LOBBY_ROW_EVENT = "yaarzo:guest-lobby-row";

export function mergeGuestLobbyRows(
  existing: GuestLobbyRow[],
  incoming: GuestLobbyRow[],
  nowMs = Date.now(),
): GuestLobbyRow[] {
  const byId = new Map<string, GuestLobbyRow>();
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
      if (row.visitorId === real.visitorId && row.text === real.text) byId.delete(id);
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

export function rowToGuestLobbyMessage(row: GuestLobbyRow): Message {
  return {
    id: `guestmsg:${row.id}`,
    channelId: GUEST_LOBBY_CHANNEL_ID,
    authorId: row.visitorId,
    text: row.text,
    ts: new Date(row.createdAt).getTime(),
    kind: "text",
    sendStatus: row.sendStatus,
    sendError: row.sendError,
  };
}

export function rowToGuestLobbyUser(row: GuestLobbyRow): User {
  return {
    id: row.visitorId,
    name: row.displayName,
    avatarColor: "oklch(0.62 0.02 250)",
    status: "online",
    isGuest: true,
    xp: 0,
    level: 1,
    badges: [],
    showGuestBadge: true,
  };
}

export function fallbackGuestAuthor(authorId: string): User {
  const isVisitor = authorId.startsWith("visitor_");
  return {
    id: authorId,
    name: isVisitor ? "Guest" : "Unknown",
    avatarColor: "oklch(0.62 0.02 250)",
    status: "online",
    isGuest: isVisitor,
    xp: 0,
    level: 1,
    badges: [],
    showGuestBadge: isVisitor,
  };
}

export function publishGuestLobbyRow(row: GuestLobbyRow) {
  if (typeof window === "undefined" || !row?.id) return;
  window.dispatchEvent(new CustomEvent(GUEST_LOBBY_ROW_EVENT, { detail: row }));
}

export function payloadToGuestLobbyRow(n: Record<string, unknown>): GuestLobbyRow | null {
  const id = String(n.id ?? "");
  if (!id) return null;
  return {
    id,
    channelId: String(n.channel_id ?? n.channelId ?? ""),
    visitorId: String(n.visitor_id ?? n.visitorId ?? ""),
    displayName: String(n.display_name ?? n.displayName ?? "Guest"),
    text: String(n.text ?? ""),
    createdAt: String(n.created_at ?? n.createdAt ?? ""),
    expiresAt: String(n.expires_at ?? n.expiresAt ?? ""),
  };
}
