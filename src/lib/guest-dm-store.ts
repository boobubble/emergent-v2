/**
 * Guest DM state sync for registered recipients + guest thread registration.
 */

import { useCallback, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { listGuestDmConversationsForRecipient } from "@/lib/guest-dm.functions";
import {
  formatGuestDmLabel,
  guestDmChannelId,
  guestDmPeerId,
  isGuestDmChannel,
  parseGuestDmChannel,
} from "@/lib/guest-dm-utils";
import { playDmPing } from "@/lib/sounds";
import type { User } from "@/lib/chat-types";
import type { GuestDmThreadMeta } from "@/lib/use-guest-dm-feed";

export type GuestDmConversationRow = {
  id: string;
  visitorId: string;
  peerId: string;
  guestDisplayName: string;
  channelId: string;
  lastMessageAt: string | null;
  recipientLastReadAt: string | null;
};

export function guestDmPeerUser(peerId: string, displayName: string): User {
  return {
    id: peerId,
    name: formatGuestDmLabel(displayName),
    avatarColor: "oklch(0.62 0.02 250)",
    status: "online",
    isGuest: true,
    xp: 0,
    level: 1,
  };
}

export function buildGuestDmThreadMeta(
  conversationId: string,
  visitorId: string,
  recipientId: string,
  guestDisplayName: string,
  recipientName?: string,
): GuestDmThreadMeta {
  return {
    conversationId,
    visitorId,
    recipientId,
    guestDisplayName,
    recipientName,
  };
}

export function useGuestDmRecipientSync(opts: {
  authUserId: string | null;
  isGuest: boolean;
  onHydrate: (rows: GuestDmConversationRow[]) => void;
  onInboundGuestMessage: (row: {
    messageId: string;
    conversationId: string;
    visitorId: string;
    guestDisplayName: string;
    createdAt: string;
    text: string;
  }) => void;
}) {
  const listFn = useServerFn(listGuestDmConversationsForRecipient);
  const listFnRef = useCallback(() => listFn, [listFn]);

  useEffect(() => {
    if (!opts.authUserId || opts.isGuest) return;
    let cancelled = false;
    void (async () => {
      try {
        const rows = await listFnRef()();
        if (cancelled || !Array.isArray(rows)) return;
        opts.onHydrate(
          rows.map((r) => ({
            id: r.id,
            visitorId: r.visitorId,
            peerId: r.peerId,
            guestDisplayName: r.guestDisplayName,
            channelId: r.channelId,
            lastMessageAt: r.lastMessageAt,
            recipientLastReadAt: r.recipientLastReadAt,
          })),
        );
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [opts.authUserId, opts.isGuest, listFnRef, opts.onHydrate]);

  useEffect(() => {
    if (!opts.authUserId || opts.isGuest) return;
    let cancelled = false;
    let channel: ReturnType<Awaited<ReturnType<typeof loadBrowserSupabase>>["channel"]> | null = null;

    void (async () => {
      const sb = await loadBrowserSupabase();
      if (cancelled) return;
      channel = sb
        .channel(`guest-dm-recipient-${opts.authUserId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "guest_dm_messages" },
          async (payload) => {
            const n = payload.new as Record<string, unknown>;
            const senderKind = String(n.sender_kind ?? "");
            if (senderKind !== "guest") return;
            const messageId = String(n.id ?? "");
            const conversationId = String(n.conversation_id ?? "");
            const createdAt = String(n.created_at ?? "");
            const text = String(n.text ?? "");
            if (!messageId || !conversationId) return;

            const { data: conv } = await sb
              .from("guest_dm_conversations")
              .select("visitor_id, guest_display_name, recipient_id")
              .eq("id", conversationId)
              .eq("recipient_id", opts.authUserId!)
              .maybeSingle();
            if (!conv) return;

            playDmPing();
            opts.onInboundGuestMessage({
              messageId,
              conversationId,
              visitorId: conv.visitor_id as string,
              guestDisplayName: conv.guest_display_name as string,
              createdAt,
              text,
            });
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void loadBrowserSupabase().then((sb) => sb.removeChannel(channel!));
    };
  }, [opts.authUserId, opts.isGuest, opts.onInboundGuestMessage]);
}

export function resolveGuestDmChannel(
  peerId: string,
  convByPeer: Record<string, string>,
): string | null {
  const conv = convByPeer[peerId];
  return conv ? guestDmChannelId(conv) : null;
}

export function threadMetaFromChannel(
  channelId: string,
  threads: Record<string, GuestDmThreadMeta>,
): GuestDmThreadMeta | null {
  if (!isGuestDmChannel(channelId)) return null;
  return threads[channelId] ?? null;
}

export function ensureThreadMetaFromConv(
  conv: GuestDmConversationRow,
  recipientId: string,
): { channelId: string; meta: GuestDmThreadMeta; peerId: string } {
  const channelId = guestDmChannelId(conv.id);
  return {
    channelId,
    peerId: conv.peerId,
    meta: buildGuestDmThreadMeta(conv.id, conv.visitorId, recipientId, conv.guestDisplayName),
  };
}

export function peerIdForGuestVisitor(visitorId: string): string {
  return guestDmPeerId(visitorId);
}

export function conversationIdFromChannel(channelId: string): string | null {
  return parseGuestDmChannel(channelId);
}
