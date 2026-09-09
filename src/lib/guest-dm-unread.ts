/**
 * Guest DM unread — separate from auth dmLatestTs / dmReads.
 * Keys are pseudo-peer ids: guest:{visitor_id}
 */

import { isGuestDmPeer, parseGuestDmPeer, guestDmChannelId } from "./guest-dm-utils";

export function isGuestDmChannelViewed(
  channelId: string,
  activeChannel: string,
  openDmPeerIds: readonly string[],
  convByPeer: Record<string, string>,
): boolean {
  if (activeChannel === channelId) return true;
  for (const peerId of openDmPeerIds) {
    if (!isGuestDmPeer(peerId)) continue;
    const conv = convByPeer[peerId];
    if (conv && guestDmChannelId(conv) === channelId) return true;
  }
  return false;
}

export function isGuestDmPeerUnread(
  peerId: string,
  activeChannel: string,
  openDmPeerIds: readonly string[],
  guestDmLatestTs: Record<string, number>,
  guestDmReads: Record<string, number>,
  convByPeer: Record<string, string>,
): boolean {
  if (!isGuestDmPeer(peerId)) return false;
  const conv = convByPeer[peerId];
  if (!conv) return false;
  const ch = guestDmChannelId(conv);
  if (isGuestDmChannelViewed(ch, activeChannel, openDmPeerIds, convByPeer)) return false;
  const latest = guestDmLatestTs[peerId] ?? 0;
  if (!latest) return false;
  const read = guestDmReads[peerId] ?? 0;
  return latest > read;
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
