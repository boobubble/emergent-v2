/**
 * Guest DM unread — separate from auth dmLatestTs / dmReads.
 * Keys are pseudo-peer ids: guest:{visitor_id}
 */

import { isGuestDmPeer, parseGuestDmPeer, guestDmChannelId } from "./guest-dm-utils";

export function isGuestDmChannelViewed(
  channelId: string,
  activeChannel: string,
  _openDmPeerIds: readonly string[],
  _convByPeer: Record<string, string>,
): boolean {
  return activeChannel === channelId;
}

type GuestUnreadMsg = { authorId: string; ts: number };

export function isGuestDmPeerUnread(
  peerId: string,
  activeChannel: string,
  openDmPeerIds: readonly string[],
  guestDmLatestTs: Record<string, number>,
  guestDmReads: Record<string, number>,
  convByPeer: Record<string, string>,
): boolean {
  return (
    guestDmPeerUnreadMessageCount(
      peerId,
      activeChannel,
      openDmPeerIds,
      guestDmLatestTs,
      guestDmReads,
      convByPeer,
      [],
    ) > 0
  );
}

/** Unread message count for one guest DM peer (0 when actively viewing that thread). */
export function guestDmPeerUnreadMessageCount(
  peerId: string,
  activeChannel: string,
  openDmPeerIds: readonly string[],
  guestDmLatestTs: Record<string, number>,
  guestDmReads: Record<string, number>,
  convByPeer: Record<string, string>,
  messages: readonly GuestUnreadMsg[],
  meAuthorId = "me",
): number {
  if (!isGuestDmPeer(peerId)) return 0;
  const conv = convByPeer[peerId];
  if (!conv) return 0;
  const ch = guestDmChannelId(conv);
  if (isGuestDmChannelViewed(ch, activeChannel, openDmPeerIds, convByPeer)) return 0;
  const readAt = guestDmReads[peerId] ?? 0;
  let counted = 0;
  for (const m of messages) {
    if (m.ts <= readAt) continue;
    if (m.authorId === meAuthorId) continue;
    counted++;
  }
  if (counted > 0) return counted;
  const latest = guestDmLatestTs[peerId] ?? 0;
  return latest > readAt ? 1 : 0;
}

export function computeGuestDmUnreadCount(
  dmOrder: readonly string[],
  activeChannel: string,
  openDmPeerIds: readonly string[],
  guestDmLatestTs: Record<string, number>,
  guestDmReads: Record<string, number>,
  convByPeer: Record<string, string>,
): number {
  let n = 0;
  for (const peerId of dmOrder) {
    if (
      isGuestDmPeerUnread(
        peerId,
        activeChannel,
        openDmPeerIds,
        guestDmLatestTs,
        guestDmReads,
        convByPeer,
      )
    ) {
      n++;
    }
  }
  return n;
}

export function visitorIdFromGuestDmPeer(peerId: string): string | null {
  return parseGuestDmPeer(peerId);
}

/** Read cursor for a guest DM peer — never client Date.now(); use message timestamps only. */
export function resolveGuestDmReadCursor(
  peerId: string,
  guestDmLatestTs: Record<string, number>,
  messagesInChannel: readonly { ts: number }[],
  feedLatestMs = 0,
): number {
  const fromLatest = guestDmLatestTs[peerId] ?? 0;
  const fromMsgs = messagesInChannel.length
    ? messagesInChannel[messagesInChannel.length - 1].ts
    : 0;
  return Math.max(fromLatest, fromMsgs, feedLatestMs);
}
