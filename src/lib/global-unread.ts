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
  authUserId: string,
  activeChannel: string,
  openDmPeerIds: readonly string[],
): boolean {
  if (activeChannel === channelId) return true;
  for (const peerId of openDmPeerIds) {
    const ch = dmChannelFor(authUserId, peerId);
    if (ch === channelId) return true;
  }
  return false;
}

export function isPeerDmUnread(
  peerId: string,
  authUserId: string | null,
  activeChannel: string,
  openDmPeerIds: readonly string[],
  dmLatestTs: Record<string, number>,
  dmReads: Record<string, Record<string, number>>,
): boolean {
  if (!authUserId || !isUuid(peerId)) return false;
  const ch = dmChannelFor(authUserId, peerId);
  if (!ch || !isRemoteDmChannel(ch, authUserId)) return false;
  if (isDmChannelViewed(ch, authUserId, activeChannel, openDmPeerIds)) return false;
  const latest = dmLatestTs[ch] ?? 0;
  if (!latest) return false;
  const myRead = dmReads[ch]?.[authUserId] ?? 0;
  return latest > myRead;
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

export function computeGlobalHasUnread(dmUnread: number, notificationUnread: number): boolean {
  return dmUnread > 0 || notificationUnread > 0;
}

export function useGlobalUnread() {
  const chat = useOptionalChat();
  const notifs = useNotificationsOptional();

  const dmUnread = chat?.dmUnreadCount ?? 0;
  const notificationUnread = notifs?.unread ?? 0;
  const hasUnread = useMemo(
    () => computeGlobalHasUnread(dmUnread, notificationUnread),
    [dmUnread, notificationUnread],
  );

  return {
    hasUnread,
    dmUnread,
    notificationUnread,
  };
}
