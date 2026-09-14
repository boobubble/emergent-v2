/**
 * Global unread aggregation: DMs + in-app notifications → favicon/badge state.
 */

import { useMemo } from "react";
import { useOptionalChat } from "@/lib/chat-store";
import { useNotificationsOptional } from "@/lib/use-notifications";
import { dmChannelFor, isRemoteDmChannel, isUuid } from "@/lib/dm-utils";

/** True when the user is actively viewing this remote DM thread. */
export function isDmChannelViewed(
  channelId: string,
  _authUserId: string,
  activeChannel: string,
  _openDmPeerIds: readonly string[],
): boolean {
  return activeChannel === channelId;
}

export function isPeerDmUnread(
  peerId: string,
  authUserId: string | null,
  activeChannel: string,
  openDmPeerIds: readonly string[],
  dmLatestTs: Record<string, number>,
  dmReads: Record<string, Record<string, number>>,
): boolean {
  return (
    peerDmUnreadMessageCount(
      peerId,
      authUserId,
      activeChannel,
      openDmPeerIds,
      dmLatestTs,
      dmReads,
      [],
    ) > 0
  );
}

type DmUnreadMsg = { authorId: string; ts: number };

/** Matches sidebar/notification badge caps (9+). */
export function formatDmUnreadBadge(count: number): number | string {
  if (count <= 0) return 0;
  return count > 9 ? "9+" : count;
}

export function countUnreadDmMessages(
  messages: readonly DmUnreadMsg[],
  readAt: number,
  authUserId: string | null,
): number {
  let n = 0;
  for (const m of messages) {
    if (m.ts <= readAt) continue;
    if (m.authorId === "me") continue;
    if (authUserId && m.authorId === authUserId) continue;
    n++;
  }
  return n;
}

/** Unread message count for one DM peer (0 when actively viewing that thread). */
export function peerDmUnreadMessageCount(
  peerId: string,
  authUserId: string | null,
  activeChannel: string,
  openDmPeerIds: readonly string[],
  dmLatestTs: Record<string, number>,
  dmReads: Record<string, Record<string, number>>,
  messages: readonly DmUnreadMsg[],
): number {
  if (!authUserId || !isUuid(peerId)) return 0;
  const ch = dmChannelFor(authUserId, peerId);
  if (!ch || !isRemoteDmChannel(ch, authUserId)) return 0;
  if (isDmChannelViewed(ch, authUserId, activeChannel, openDmPeerIds)) return 0;
  const readAt = dmReads[ch]?.[authUserId] ?? 0;
  const counted = countUnreadDmMessages(messages, readAt, authUserId);
  if (counted > 0) return counted;
  const latest = dmLatestTs[ch] ?? 0;
  return latest > readAt ? 1 : 0;
}

export function computeDmUnreadCount(
  authUserId: string | null,
  dmOrder: readonly string[],
  activeChannel: string,
  openDmPeerIds: readonly string[],
  dmLatestTs: Record<string, number>,
  dmReads: Record<string, Record<string, number>>,
): number {
  if (!authUserId) return 0;
  let n = 0;
  for (const peerId of dmOrder) {
    if (isPeerDmUnread(peerId, authUserId, activeChannel, openDmPeerIds, dmLatestTs, dmReads)) n++;
  }
  return n;
}

export function computeGlobalHasUnread(
  dmUnread: number,
  guestDmUnread: number,
  notificationUnread: number,
): boolean {
  return dmUnread > 0 || guestDmUnread > 0 || notificationUnread > 0;
}

export function useGlobalUnread() {
  const chat = useOptionalChat();
  const notifs = useNotificationsOptional();

  const dmUnread = chat?.dmUnreadCount ?? 0;
  const guestDmUnread = chat?.guestDmUnreadCount ?? 0;
  const notificationUnread = notifs?.unread ?? 0;
  const hasUnread = useMemo(
    () => computeGlobalHasUnread(dmUnread, guestDmUnread, notificationUnread),
    [dmUnread, guestDmUnread, notificationUnread],
  );

  return {
    hasUnread,
    dmUnread,
    guestDmUnread,
    notificationUnread,
  };
}
