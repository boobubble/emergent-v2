/**
 * Merge ephemeral guest Lobby messages into the chat UI.
 * Also used by registered users so they see Guest-* messages in realtime.
 */

import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listGuestLobbyMessages } from "@/lib/guest-chat.functions";
import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import type { Message, User } from "@/lib/chat-types";

export interface GuestLobbyRow {
  id: string;
  channelId: string;
  visitorId: string;
  displayName: string;
  text: string;
  createdAt: string;
  expiresAt: string;
}

function rowToMessage(row: GuestLobbyRow): Message {
  return {
    id: `guestmsg:${row.id}`,
    channelId: GUEST_LOBBY_CHANNEL_ID,
    authorId: row.visitorId,
    text: row.text,
    ts: new Date(row.createdAt).getTime(),
    kind: "text",
  };
}

function rowToUser(row: GuestLobbyRow): User {
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

export function useGuestLobbyFeed(enabled: boolean) {
  const listFn = useServerFn(listGuestLobbyMessages);
  const [rows, setRows] = useState<GuestLobbyRow[]>([]);

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await listFn({ data: { limit: 80 } });
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, listFn]);

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
          const row: GuestLobbyRow = {
            id: String(n.id),
            channelId: String(n.channel_id),
            visitorId: String(n.visitor_id),
            displayName: String(n.display_name),
            text: String(n.text ?? ""),
            createdAt: String(n.created_at),
            expiresAt: String(n.expires_at),
          };
          setRows((prev) => {
            if (prev.some((r) => r.id === row.id)) return prev;
            return [...prev, row].slice(-120);
          });
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [enabled]);

  const messages = useMemo(() => rows.map(rowToMessage), [rows]);
  const users = useMemo(() => {
    const map: Record<string, User> = {};
    for (const r of rows) map[r.visitorId] = rowToUser(r);
    return map;
  }, [rows]);

  const appendOptimistic = (row: GuestLobbyRow) => {
    setRows((prev) => {
      if (prev.some((r) => r.id === row.id)) return prev;
      return [...prev, row];
    });
  };

  return { messages, users, appendOptimistic };
}