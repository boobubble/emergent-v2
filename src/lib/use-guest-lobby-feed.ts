/**
 * Merge ephemeral guest Lobby messages into the chat UI.
 * Also used by registered users so they see Guest-* messages in realtime.
 *
 * Optimistic rows live in a module-level list so MessageInput can append
 * immediately while MessageList (a sibling) renders them.
 * History fetch must MERGE by id. Replacing the array drops rows that arrived
 * via realtime / post-send / optimistic insert while the snapshot was in flight.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listGuestLobbyMessages } from "@/lib/guest-chat.functions";
import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
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

let sharedRows: GuestLobbyRow[] = [];
const listeners = new Set<(rows: GuestLobbyRow[]) => void>();

function emitGuestRows(next: GuestLobbyRow[]) {
  sharedRows = next;
  for (const fn of listeners) fn(sharedRows);
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
    listeners.add(fn);
    setRows(sharedRows);
    return () => { listeners.delete(fn); };
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
    const channel = supabase
      .channel("guest-lobby-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guest_chat_messages" },
        (payload) => {
          const n = payload.new as Record<string, unknown>;
          if (n.channel_id !== GUEST_LOBBY_CHANNEL_ID) return;
          if (n.expires_at && new Date(String(n.expires_at)).getTime() <= Date.now()) return;
          const row = payloadToGuestLobbyRow(n);
          if (!row) return;
          emitGuestRows(mergeGuestLobbyRows(sharedRows, [row]));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled]);

  const messages = useMemo(() => rows.map(rowToGuestLobbyMessage), [rows]);
  const users = useMemo(() => {
    const map: Record<string, User> = {};
    for (const r of rows) map[r.visitorId] = rowToGuestLobbyUser(r);
    return map;
  }, [rows]);

  return { messages, users };
}
