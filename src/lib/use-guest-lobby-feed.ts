/**
 * Merge ephemeral guest Lobby messages into the chat UI.
 * Also used by registered users so they see Guest-* messages in realtime.
 *
 * Optimistic rows live in a module-level list so MessageInput can append
 * immediately while MessageList (a sibling) renders them.
 * History fetch must MERGE by id. Replacing the array drops rows that arrived
 * via realtime / post-send / optimistic insert while the snapshot was in flight.
 *
 * Realtime uses ONE module-level `guest-lobby-messages` channel: MessageList and
 * MessageInput both call useGuestLobbyFeed in the Lobby, so per-hook channels
 * would call `.on()` after the shared channel is already subscribed.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { listGuestLobbyMessages } from "@/lib/guest-chat.functions";
import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import { rtLog } from "@/lib/realtime-debug";
import {
  GUEST_LOBBY_ROW_EVENT,
  mergeGuestLobbyRows,
  payloadToGuestLobbyRow,
  rowToGuestLobbyMessage,
  rowToGuestLobbyUser,
  type GuestLobbyRow,
} from "@/lib/guest-lobby-feed";
import {
  failGuestLobbyRow,
  markGuestLobbyRowSending,
  replaceGuestLobbyRow,
} from "@/lib/chat-optimistic";
import type { User } from "@/lib/chat-types";

export type { GuestLobbyRow } from "@/lib/guest-lobby-feed";
export {
  GUEST_LOBBY_ROW_EVENT,
  fallbackGuestAuthor,
  mergeGuestLobbyRows,
  publishGuestLobbyRow,
} from "@/lib/guest-lobby-feed";

export const GUEST_LOBBY_MESSAGES_CHANNEL = "guest-lobby-messages";

type BrowserClient = Awaited<ReturnType<typeof loadBrowserSupabase>>;
type MessagesChannel = ReturnType<BrowserClient["channel"]>;

let sharedRows: GuestLobbyRow[] = [];
const rowListeners = new Set<(rows: GuestLobbyRow[]) => void>();

let sb: BrowserClient | null = null;
let messagesChannel: MessagesChannel | null = null;
let messagesChannelOpening: Promise<MessagesChannel> | null = null;
let realtimeSubscriberCount = 0;

function emitGuestRows(next: GuestLobbyRow[]) {
  sharedRows = next;
  for (const fn of rowListeners) fn(sharedRows);
}

function onGuestLobbyInsert(payload: { new: Record<string, unknown> }) {
  const n = payload.new;
  if (n.channel_id !== GUEST_LOBBY_CHANNEL_ID) return;
  if (n.expires_at && new Date(String(n.expires_at)).getTime() <= Date.now()) return;
  const row = payloadToGuestLobbyRow(n);
  if (!row) return;
  emitGuestRows(mergeGuestLobbyRows(sharedRows, [row]));
}

function onGuestLobbyDelete(payload: { old: Record<string, unknown> }) {
  const n = payload.old;
  const id = String(n.id ?? "");
  if (!id) return;
  if (n.channel_id && String(n.channel_id) !== GUEST_LOBBY_CHANNEL_ID) return;
  emitGuestRows(sharedRows.filter((r) => r.id !== id));
}

async function openGuestMessagesChannel(): Promise<MessagesChannel> {
  if (messagesChannel) return messagesChannel;
  if (messagesChannelOpening) return messagesChannelOpening;

  messagesChannelOpening = (async () => {
    const client = await loadBrowserSupabase();
    sb = client;
    const ch = client
      .channel(GUEST_LOBBY_MESSAGES_CHANNEL)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guest_chat_messages" },
        onGuestLobbyInsert,
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "guest_chat_messages" },
        onGuestLobbyDelete,
      );

    await new Promise<void>((resolve) => {
      ch.subscribe((status) => {
        rtLog("ws", status, GUEST_LOBBY_MESSAGES_CHANNEL);
        if (
          status === "SUBSCRIBED"
          || status === "CHANNEL_ERROR"
          || status === "TIMED_OUT"
          || status === "CLOSED"
        ) {
          resolve();
        }
      });
    });

    messagesChannel = ch;
    messagesChannelOpening = null;
    return ch;
  })();

  return messagesChannelOpening;
}

async function closeGuestMessagesChannelIfIdle() {
  if (realtimeSubscriberCount > 0) return;
  if (messagesChannel && sb) {
    await sb.removeChannel(messagesChannel);
    messagesChannel = null;
  }
  messagesChannelOpening = null;
}

function retainGuestMessagesRealtime(): () => void {
  realtimeSubscriberCount += 1;
  void openGuestMessagesChannel().catch((err) => {
    if (import.meta.env.DEV) console.warn("[guest-lobby-feed] realtime subscribe failed", err);
  });
  return () => {
    realtimeSubscriberCount = Math.max(0, realtimeSubscriberCount - 1);
    void closeGuestMessagesChannelIfIdle();
  };
}

export function appendGuestOptimistic(row: GuestLobbyRow) {
  emitGuestRows(mergeGuestLobbyRows(sharedRows, [row]));
}

export function confirmGuestOptimistic(optId: string, real: GuestLobbyRow) {
  emitGuestRows(mergeGuestLobbyRows(replaceGuestLobbyRow(sharedRows, optId, real), []));
}

export function failGuestOptimistic(optId: string, error: string) {
  emitGuestRows(failGuestLobbyRow(sharedRows, optId, error));
}

export function markGuestOptimisticSending(optId: string) {
  emitGuestRows(markGuestLobbyRowSending(sharedRows, optId));
}

/** Remove one guest row locally (optimistic mod delete or clear). */
export function removeGuestLobbyRow(messageId: string) {
  const rawId = messageId.startsWith("guestmsg:") ? messageId.slice("guestmsg:".length) : messageId;
  emitGuestRows(sharedRows.filter((r) => r.id !== rawId));
}

/** Wipe all guest lobby rows (after /clear). */
export function clearGuestLobbyRows() {
  emitGuestRows([]);
}

export function useGuestLobbyFeed(enabled: boolean) {
  const listFn = useServerFn(listGuestLobbyMessages);
  const listFnRef = useRef(listFn);
  listFnRef.current = listFn;
  const [rows, setRows] = useState<GuestLobbyRow[]>(enabled ? sharedRows : []);

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      return;
    }
    const fn = (next: GuestLobbyRow[]) => setRows(next);
    rowListeners.add(fn);
    setRows(sharedRows);
    return () => { rowListeners.delete(fn); };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await listFnRef.current({ data: { limit: 80 } });
        if (!cancelled && Array.isArray(data)) {
          emitGuestRows(mergeGuestLobbyRows(sharedRows, data));
        }
      } catch {
        // Keep whatever realtime / post-send / optimistic already delivered.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onRow = (event: Event) => {
      const row = (event as CustomEvent<GuestLobbyRow>).detail;
      if (!row?.id) return;
      emitGuestRows(mergeGuestLobbyRows(sharedRows, [row]));
    };
    window.addEventListener(GUEST_LOBBY_ROW_EVENT, onRow);
    return () => window.removeEventListener(GUEST_LOBBY_ROW_EVENT, onRow);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    return retainGuestMessagesRealtime();
  }, [enabled]);

  const messages = useMemo(() => rows.map(rowToGuestLobbyMessage), [rows]);
  const users = useMemo(() => {
    const map: Record<string, User> = {};
    for (const r of rows) map[r.visitorId] = rowToGuestLobbyUser(r);
    return map;
  }, [rows]);

  return { messages, users };
}
