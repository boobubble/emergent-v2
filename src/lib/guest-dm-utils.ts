/**
 * Guest DM channel / peer identity helpers.
 * Pseudo-peer `guest:{visitor_id}` is internal only — never show raw visitor_id in UI.
 */

import { isUuid } from "./dm-utils";

import { isUuid } from "./dm-utils";

export const GUEST_DM_PEER_PREFIX = "guest:" as const;
export const GUEST_DM_CHANNEL_PREFIX = "gdm:" as const;

export function isGuestDmPeer(peerId: string): boolean {
  return peerId.startsWith(GUEST_DM_PEER_PREFIX);
}

export function guestDmPeerId(visitorId: string): string {
  return `${GUEST_DM_PEER_PREFIX}${visitorId}`;
}

export function parseGuestDmPeer(peerId: string): string | null {
  if (!isGuestDmPeer(peerId)) return null;
  const visitorId = peerId.slice(GUEST_DM_PEER_PREFIX.length);
  return visitorId.startsWith("visitor_") ? visitorId : null;
}

export function isGuestDmChannel(channelId: string): boolean {
  return channelId.startsWith(GUEST_DM_CHANNEL_PREFIX);
}

export function guestDmChannelId(conversationId: string): string {
  return `${GUEST_DM_CHANNEL_PREFIX}${conversationId}`;
}

export function parseGuestDmChannel(channelId: string): string | null {
  if (!isGuestDmChannel(channelId)) return null;
  const id = channelId.slice(GUEST_DM_CHANNEL_PREFIX.length);
  return isUuid(id) ? id : null;
}

/** Friendly inbox label — never exposes visitor_id. */
export function formatGuestDmLabel(displayName: string): string {
  const clean = displayName.trim();
  if (!clean) return "Guest";
  if (clean.toLowerCase().startsWith("guest")) return clean;
  return `Guest · ${clean}`;
}

export function isGuestDmPeerOrChannel(id: string): boolean {
  return isGuestDmPeer(id) || isGuestDmChannel(id);
}

export const GUEST_DM_COMPOSE_PREFIX = "gdm:compose:" as const;

export function isGuestDmComposeChannel(channelId: string): boolean {
  return channelId.startsWith(GUEST_DM_COMPOSE_PREFIX);
}

export function parseGuestDmComposeRecipient(channelId: string): string | null {
  if (!isGuestDmComposeChannel(channelId)) return null;
  const id = channelId.slice(GUEST_DM_COMPOSE_PREFIX.length);
  return isUuid(id) ? id : null;
}

export function guestDmComposeChannel(recipientId: string): string {
  return `${GUEST_DM_COMPOSE_PREFIX}${recipientId}`;
}

/** Extend dm-order sanitization to retain guest pseudo-peers. */
export function sanitizeGuestDmOrder(dmOrder: string[] | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of dmOrder ?? []) {
    if (!isGuestDmPeer(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
