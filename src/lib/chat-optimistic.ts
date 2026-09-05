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

/**
 * Persist sender-local status as-is.
 * A reload must not rewrite in-flight "sending" into "Couldn't send"; hydrate
 * confirms rows found in public.messages and fails only ids the SELECT reports
 * missing. A lookup error must not fail pending sends.
 */
export function persistSendStatus(
  messages: Record<string, Message[]>,
): Record<string, Message[]> {
  return messages;
}

/** Authenticated public.messages INSERT settlement (DM + lobby share this path). */
export const AUTH_SEND_TIMEOUT_MS = 15_000;
export const AUTH_SEND_TIMEOUT_ERROR = "Request timed out";
export const AUTH_SEND_NETWORK_ERROR = "Failed to send";
export const AUTH_SEND_INTERRUPTED_ERROR = "Send interrupted";

export type AuthenticatedInsertRow = { id: string; created_at?: string | null };

export type AuthenticatedInsertResult = {
  data?: AuthenticatedInsertRow[] | null;
  error?: { message?: string } | null;
};

export type SettleInsertOutcome =
  | { action: "confirm"; tsById: Record<string, number> }
  | { action: "fail"; error: string };

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  message = AUTH_SEND_TIMEOUT_ERROR,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function isDuplicateKeyError(message: string | undefined): boolean {
  if (!message) return false;
  return /duplicate key|unique constraint|already exists/i.test(message);
}

/** Timeout / dropped HTTP — not RLS, mute, or validation errors. */
export function isRetryableSendError(message: string | undefined): boolean {
  if (!message) return false;
  if (message === AUTH_SEND_TIMEOUT_ERROR) return true;
  if (message === AUTH_SEND_NETWORK_ERROR) return true;
  return /failed to fetch|networkerror|network request failed|load failed|internet connection|net::err/i.test(
    message,
  );
}

export type MessageLookupResult =
  | { ok: true; rows: AuthenticatedInsertRow[] }
  | { ok: false; error: string };

export function rowsToTsById(rows: AuthenticatedInsertRow[] | null | undefined): Record<string, number> {
  const tsById: Record<string, number> = {};
  for (const row of rows ?? []) {
    if (!row?.id || !row.created_at) continue;
    const ts = new Date(row.created_at).getTime();
    if (Number.isFinite(ts)) tsById[row.id] = ts;
  }
  return tsById;
}

export function missingLookupIds(
  ids: readonly string[],
  rows: AuthenticatedInsertRow[] | null | undefined,
): string[] {
  const found = new Set((rows ?? []).map((row) => row?.id).filter(Boolean) as string[]);
  return ids.filter((id) => !found.has(id));
}

export type RecoverSendDeps = {
  lookupRows: (ids: string[]) => Promise<MessageLookupResult>;
  retryInsert: () => PromiseLike<AuthenticatedInsertResult>;
};

async function safeLookupRows(
  lookupRows: RecoverSendDeps["lookupRows"],
  ids: string[],
): Promise<MessageLookupResult> {
  try {
    return await lookupRows(ids);
  } catch (err) {
    const error =
      err instanceof Error && err.message ? err.message : AUTH_SEND_NETWORK_ERROR;
    return { ok: false, error };
  }
}

/** HTTP/insert settlement. Realtime is not required for success. */
export function settleAuthenticatedInsert(
  error: { message?: string } | null | undefined,
  data: AuthenticatedInsertRow[] | null | undefined,
): SettleInsertOutcome {
  if (error) {
    if (isDuplicateKeyError(error.message)) {
      return { action: "confirm", tsById: {} };
    }
    return { action: "fail", error: error.message || AUTH_SEND_NETWORK_ERROR };
  }
  return { action: "confirm", tsById: rowsToTsById(data) };
}

export async function settleAuthenticatedSendPromise(
  insertPromise: PromiseLike<AuthenticatedInsertResult>,
  options?: { timeoutMs?: number },
): Promise<SettleInsertOutcome> {
  try {
    const result = await withTimeout(
      Promise.resolve(insertPromise),
      options?.timeoutMs ?? AUTH_SEND_TIMEOUT_MS,
    );
    return settleAuthenticatedInsert(result?.error, result?.data);
  } catch (err) {
    const message =
      err instanceof Error && err.message ? err.message : AUTH_SEND_NETWORK_ERROR;
    return { action: "fail", error: message };
  }
}

/**
 * After a retryable INSERT failure, confirm from public.messages when the
 * client UUID is already present. If the row is missing, retry the same UUID
 * once. A failed SELECT must not be treated as "missing".
 */
export async function settleAuthenticatedSendWithRecover(
  insertPromise: PromiseLike<AuthenticatedInsertResult>,
  ids: readonly string[],
  deps: RecoverSendDeps,
  options?: { timeoutMs?: number },
): Promise<SettleInsertOutcome> {
  const first = await settleAuthenticatedSendPromise(insertPromise, options);
  if (first.action === "confirm") return first;
  if (!isRetryableSendError(first.error) || ids.length === 0) return first;

  const lookup = await safeLookupRows(deps.lookupRows, [...ids]);
  if (lookup.ok) {
    const missing = missingLookupIds(ids, lookup.rows);
    if (!missing.length) {
      return { action: "confirm", tsById: rowsToTsById(lookup.rows) };
    }
  }

  try {
    return await settleAuthenticatedSendPromise(Promise.resolve(deps.retryInsert()), options);
  } catch (err) {
    const message =
      err instanceof Error && err.message ? err.message : AUTH_SEND_NETWORK_ERROR;
    return { action: "fail", error: message };
  }
}

export function applyAuthenticatedInsertOutcome(
  messages: Record<string, Message[]>,
  ids: Iterable<string>,
  outcome: SettleInsertOutcome,
): Record<string, Message[]> {
  if (outcome.action === "confirm") {
    return confirmMessages(messages, ids, outcome.tsById);
  }
  return failMessages(messages, ids, outcome.error);
}

export function isPendingSendMessage(m: Pick<Message, "sendStatus" | "sendError">): boolean {
  if (m.sendStatus === "sending") return true;
  return m.sendStatus === "failed" && m.sendError === AUTH_SEND_INTERRUPTED_ERROR;
}

export function collectPendingSendIds(messages: Record<string, Message[]>): string[] {
  const ids: string[] = [];
  for (const msgs of Object.values(messages)) {
    for (const m of msgs) {
      if (isPendingSendMessage(m)) ids.push(m.id);
    }
  }
  return ids;
}

/** Reload: confirm ids found in public.messages; fail still-pending ids that are not. */
export function applyHydrateSendReconcile(
  messages: Record<string, Message[]>,
  pendingIds: string[],
  foundRows: AuthenticatedInsertRow[] | null | undefined,
): Record<string, Message[]> {
  const found = new Map<string, number>();
  for (const row of foundRows ?? []) {
    if (!row?.id) continue;
    const ts = row.created_at ? new Date(row.created_at).getTime() : NaN;
    found.set(row.id, ts);
  }
  const confirmIds = pendingIds.filter((id) => found.has(id));
  const missingIds = pendingIds.filter((id) => !found.has(id));
  let next = messages;
  if (confirmIds.length) {
    const tsById: Record<string, number> = {};
    for (const id of confirmIds) {
      const ts = found.get(id);
      if (typeof ts === "number" && Number.isFinite(ts)) tsById[id] = ts;
    }
    next = confirmMessages(next, confirmIds, tsById);
  }
  if (!missingIds.length) return next;
  const stillPending = missingIds.filter((id) => {
    for (const msgs of Object.values(next)) {
      const m = msgs.find((row) => row.id === id);
      if (m && isPendingSendMessage(m)) return true;
    }
    return false;
  });
  if (!stillPending.length) return next;
  return failMessages(next, stillPending, AUTH_SEND_INTERRUPTED_ERROR);
}

/** Reload lookup: confirm found rows; never treat a SELECT error as missing. */
export function applyHydrateLookupResult(
  messages: Record<string, Message[]>,
  pendingIds: string[],
  lookup: MessageLookupResult,
): Record<string, Message[]> {
  if (!lookup.ok) return messages;
  return applyHydrateSendReconcile(messages, pendingIds, lookup.rows);
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
