/**
 * Sender-local optimistic chat helpers.
 *
 * Authenticated messages already use a client-generated UUID as `id` (the
 * correlation key sent with the insert). These helpers add sending/failed
 * status and guest-lobby temp-id reconciliation. Other users are unaffected:
 * they still receive the row via the normal Realtime INSERT path.
 */

import type { Message } from "./chat-types";

export type SendStatus = "sending" | "failed";

export const GUEST_OPT_ID_PREFIX = "opt-";

export function isGuestOptimisticId(id: string): boolean {
  return id.startsWith(GUEST_OPT_ID_PREFIX);
}

export interface GuestLobbyOptimisticRow {
  id: string;
  channelId: string;
  visitorId: string;
  displayName: string;
  text: string;
  createdAt: string;
  expiresAt: string;
  sendStatus?: SendStatus;
  sendError?: string;
}

function patchById(
  messages: Record<string, Message[]>,
  ids: Iterable<string>,
  patch: (m: Message) => Message,
): Record<string, Message[]> {
  const idSet = new Set(ids);
  if (idSet.size === 0) return messages;
  let changed = false;
  const next: Record<string, Message[]> = {};
  for (const [ch, msgs] of Object.entries(messages)) {
    let chChanged = false;
    const mapped = msgs.map((m) => {
      if (!idSet.has(m.id)) return m;
      const patched = patch(m);
      if (patched === m) return m;
      chChanged = true;
      return patched;
    });
    if (chChanged) {
      changed = true;
      next[ch] = mapped;
    } else {
      next[ch] = msgs;
    }
  }
  return changed ? next : messages;
}

/** Clear pending/error after the insert (or Realtime) confirms the row. */
export function confirmMessages(
  messages: Record<string, Message[]>,
  ids: Iterable<string>,
  serverTsById?: Record<string, number>,
): Record<string, Message[]> {
  return patchById(messages, ids, (m) => {
    const serverTs = serverTsById?.[m.id];
    if (!m.sendStatus && serverTs === undefined) return m;
    const next: Message = { ...m, ts: serverTs ?? m.ts };
    delete next.sendStatus;
    delete next.sendError;
    return next;
  });
}

export function failMessages(
  messages: Record<string, Message[]>,
  ids: Iterable<string>,
  error: string,
): Record<string, Message[]> {
  return patchById(messages, ids, (m) => {
    if (m.sendStatus === "failed" && m.sendError === error) return m;
    return { ...m, sendStatus: "failed", sendError: error };
  });
}

export function markMessagesSending(
  messages: Record<string, Message[]>,
  ids: Iterable<string>,
): Record<string, Message[]> {
  return patchById(messages, ids, (m) => {
    if (m.sendStatus === "sending" && !m.sendError) return m;
    const next: Message = { ...m, sendStatus: "sending" };
    delete next.sendError;
    return next;
  });
}

/** Serialize for localStorage: never persist a stuck spinner. */
export function persistSendStatus(
  messages: Record<string, Message[]>,
): Record<string, Message[]> {
  let changed = false;
  const next: Record<string, Message[]> = {};
  for (const [ch, msgs] of Object.entries(messages)) {
    const mapped = msgs.map((m) => {
      if (m.sendStatus !== "sending") return m;
      changed = true;
      return { ...m, sendStatus: "failed" as const, sendError: m.sendError || "Send interrupted" };
    });
    next[ch] = mapped;
  }
  return changed ? next : messages;
}

export function mergeGuestLobbyRow<T extends GuestLobbyOptimisticRow>(
  prev: T[],
  incoming: T,
): T[] {
  if (prev.some((r) => r.id === incoming.id)) {
    return prev.map((r) => (r.id === incoming.id ? { ...incoming, sendStatus: undefined, sendError: undefined } : r));
  }
  if (!isGuestOptimisticId(incoming.id)) {
    const optIdx = prev.findIndex(
      (r) =>
        isGuestOptimisticId(r.id) &&
        r.visitorId === incoming.visitorId &&
        r.text === incoming.text,
    );
    if (optIdx >= 0) {
      const next = [...prev];
      const { sendStatus: _s, sendError: _e, ...rest } = incoming;
      next[optIdx] = rest as T;
      return next;
    }
  }
  return [...prev, incoming];
}

export function replaceGuestLobbyRow<T extends GuestLobbyOptimisticRow>(
  prev: T[],
  optId: string,
  real: T,
): T[] {
  const withoutOpt = prev.filter((r) => r.id !== optId);
  if (withoutOpt.some((r) => r.id === real.id)) {
    return withoutOpt.map((r) =>
      r.id === real.id ? ({ ...real, sendStatus: undefined, sendError: undefined } as T) : r,
    );
  }
  const { sendStatus: _s, sendError: _e, ...rest } = real;
  return [...withoutOpt, rest as T];
}

export function failGuestLobbyRow<T extends GuestLobbyOptimisticRow>(
  prev: T[],
  optId: string,
  error: string,
): T[] {
  let changed = false;
  const next = prev.map((r) => {
    if (r.id !== optId) return r;
    if (r.sendStatus === "failed" && r.sendError === error) return r;
    changed = true;
    return { ...r, sendStatus: "failed" as const, sendError: error };
  });
  return changed ? next : prev;
}

export function markGuestLobbyRowSending<T extends GuestLobbyOptimisticRow>(
  prev: T[],
  optId: string,
): T[] {
  let changed = false;
  const next = prev.map((r) => {
    if (r.id !== optId) return r;
    if (r.sendStatus === "sending" && !r.sendError) return r;
    changed = true;
    const patched: T = { ...r, sendStatus: "sending" };
    delete patched.sendError;
    return patched;
  });
  return changed ? next : prev;
}

export function isDuplicateKeyError(message: string | undefined): boolean {
  if (!message) return false;
  return /duplicate key|unique constraint|already exists/i.test(message);
}
