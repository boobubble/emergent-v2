/**
 * Singleton realtime + shared state for guest DM threads (gdm:{uuid}).
 * Handlers registered before subscribe; ref-counted; StrictMode safe.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { listGuestDmMessages, listGuestDmMessagesAuth } from "@/lib/guest-dm.functions";
import { parseGuestDmChannel } from "@/lib/guest-dm-utils";
import { rtLog } from "@/lib/realtime-debug";
import {
  GUEST_DM_ROW_EVENT,
  mergeGuestDmRows,
  payloadToGuestDmRow,
  rowToGuestDmMessage,
  type GuestDmRow,
} from "@/lib/guest-dm-feed";

export const GUEST_DM_MESSAGES_CHANNEL = "guest-dm-messages";

type BrowserClient = Awaited<ReturnType<typeof loadBrowserSupabase>>;
type MessagesChannel = ReturnType<BrowserClient["channel"]>;

/** Per-conversation shared rows */
const rowsByConversation = new Map<string, GuestDmRow[]>();
const rowListeners = new Set<(convId: string, rows: GuestDmRow[]) => void>();

let sb: BrowserClient | null = null;
let messagesChannel: MessagesChannel | null = null;
let messagesChannelOpening: Promise<MessagesChannel> | null = null;
let realtimeSubscriberCount = 0;

function emitGuestDmRows(conversationId: string, next: GuestDmRow[]) {
  rowsByConversation.set(conversationId, next);
  for (const fn of rowListeners) fn(conversationId, next);
}

function onGuestDmInsert(payload: { new: Record<string, unknown> }) {
  const row = payloadToGuestDmRow(payload.new);
  if (!row) return;
  if (row.expiresAt && new Date(row.expiresAt).getTime() <= Date.now()) return;
  const existing = rowsByConversation.get(row.conversationId) ?? [];
  emitGuestDmRows(row.conversationId, mergeGuestDmRows(existing, [row]));
}

function onGuestDmDelete(payload: { old: Record<string, unknown> }) {
  const n = payload.old;
  const id = String(n.id ?? "");
  const conversationId = String(n.conversation_id ?? "");
  if (!id || !conversationId) return;
  const existing = rowsByConversation.get(conversationId) ?? [];
  emitGuestDmRows(conversationId, existing.filter((r) => r.id !== id));
}

async function openGuestDmMessagesChannel(): Promise<MessagesChannel> {
  if (messagesChannel) return messagesChannel;
  if (messagesChannelOpening) return messagesChannelOpening;

  messagesChannelOpening = (async () => {
    const client = await loadBrowserSupabase();
    sb = client;
    const ch = client
      .channel(GUEST_DM_MESSAGES_CHANNEL)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guest_dm_messages" },
        onGuestDmInsert,
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "guest_dm_messages" },
        onGuestDmDelete,
      );

    await new Promise<void>((resolve) => {
      ch.subscribe((status) => {
        rtLog("ws", status, GUEST_DM_MESSAGES_CHANNEL);
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

async function closeGuestDmMessagesChannelIfIdle() {
  if (realtimeSubscriberCount > 0) return;
  if (messagesChannel && sb) {
    await sb.removeChannel(messagesChannel);
    messagesChannel = null;
  }
  messagesChannelOpening = null;
}

function retainGuestDmRealtime(): () => void {
  realtimeSubscriberCount += 1;
  void openGuestDmMessagesChannel().catch((err) => {
    if (import.meta.env.DEV) console.warn("[guest-dm-feed] realtime subscribe failed", err);
  });
  return () => {
    realtimeSubscriberCount = Math.max(0, realtimeSubscriberCount - 1);
    void closeGuestDmMessagesChannelIfIdle();
  };
}

export function appendGuestDmOptimistic(conversationId: string, row: GuestDmRow) {
  const existing = rowsByConversation.get(conversationId) ?? [];
  emitGuestDmRows(conversationId, mergeGuestDmRows(existing, [row]));
}

export function confirmGuestDmOptimistic(conversationId: string, optId: string, real: GuestDmRow) {
  const existing = rowsByConversation.get(conversationId) ?? [];
  emitGuestDmRows(
    conversationId,
    mergeGuestDmRows(existing.filter((r) => r.id !== optId), [real]),
  );
}

export function failGuestDmOptimistic(conversationId: string, optId: string, error: string) {
  const existing = rowsByConversation.get(conversationId) ?? [];
  emitGuestDmRows(
    conversationId,
    existing.map((r) =>
      r.id === optId ? { ...r, sendStatus: "failed" as const, sendError: error } : r,
    ),
  );
}

export function getGuestDmSharedRows(conversationId: string): GuestDmRow[] {
  return rowsByConversation.get(conversationId) ?? [];
}

export function publishGuestDmRow(row: GuestDmRow) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GUEST_DM_ROW_EVENT, { detail: row }));
}

export interface GuestDmThreadMeta {
  conversationId: string;
  visitorId: string;
  recipientId: string;
  guestDisplayName: string;
  recipientName?: string;
}

export function useGuestDmFeed(
  channelId: string | null | undefined,
  meta: GuestDmThreadMeta | null,
  enabled: boolean,
) {
  const conversationId = channelId ? parseGuestDmChannel(channelId) : null;
  const listGuestFn = useServerFn(listGuestDmMessages);
  const listAuthFn = useServerFn(listGuestDmMessagesAuth);
  const listGuestFnRef = useRef(listGuestFn);
  const listAuthFnRef = useRef(listAuthFn);
  listGuestFnRef.current = listGuestFn;
  listAuthFnRef.current = listAuthFn;
  const [rows, setRows] = useState<GuestDmRow[]>(
    () => (conversationId ? getGuestDmSharedRows(conversationId) : []),
  );

  useEffect(() => {
    if (!enabled || !conversationId) {
      setRows([]);
      return;
    }
    const fn = (convId: string, next: GuestDmRow[]) => {
      if (convId === conversationId) setRows(next);
    };
    rowListeners.add(fn);
    setRows(getGuestDmSharedRows(conversationId));
    return () => { rowListeners.delete(fn); };
  }, [enabled, conversationId]);

  useEffect(() => {
    if (!enabled || !conversationId) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = meta?.visitorId
          ? await listGuestFnRef.current({
            data: { conversationId, visitorId: meta.visitorId, limit: 80 },
          })
          : await listAuthFnRef.current({
            data: { conversationId, limit: 80 },
          });
        if (!cancelled && Array.isArray(data)) {
          const mapped: GuestDmRow[] = data.map((r) => ({
            id: r.id,
            conversationId: r.conversationId,
            senderKind: r.senderKind as "guest" | "registered",
            text: r.text,
            createdAt: r.createdAt,
            expiresAt: r.expiresAt,
          }));
          const existing = getGuestDmSharedRows(conversationId);
          emitGuestDmRows(conversationId, mergeGuestDmRows(existing, mapped));
        }
      } catch {
        // Keep realtime / optimistic rows.
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, conversationId, meta?.visitorId]);

  useEffect(() => {
    if (!enabled || !conversationId) return;
    const onRow = (event: Event) => {
      const row = (event as CustomEvent<GuestDmRow>).detail;
      if (!row?.id || row.conversationId !== conversationId) return;
      const existing = getGuestDmSharedRows(conversationId);
      emitGuestDmRows(conversationId, mergeGuestDmRows(existing, [row]));
    };
    window.addEventListener(GUEST_DM_ROW_EVENT, onRow);
    return () => window.removeEventListener(GUEST_DM_ROW_EVENT, onRow);
  }, [enabled, conversationId]);

  useEffect(() => {
    if (!enabled) return;
    return retainGuestDmRealtime();
  }, [enabled]);

  const messages = useMemo(() => {
    if (!meta || !channelId) return [];
    return rows.map((r) =>
      rowToGuestDmMessage(
        r,
        channelId,
        meta.visitorId,
        meta.recipientId,
        meta.guestDisplayName,
      ),
    );
  }, [rows, channelId, meta]);

  return { rows, messages, conversationId };
}
