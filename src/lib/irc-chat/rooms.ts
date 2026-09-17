import { parseGatewayRoomsPayload } from "../irc-rooms";
import type { IrcChatRoom } from "./types";
import { IRC_CHAT_PRODUCT_ROOM } from "./constants";

export function roomsFromGatewayPayload(payload: unknown): {
  rooms: Record<string, IrcChatRoom>;
  primaryRoom: string | null;
} {
  const { channels, meta } = parseGatewayRoomsPayload(payload);
  const rooms: Record<string, IrcChatRoom> = {};
  for (const ch of channels) {
    rooms[ch.id] = {
      id: ch.id,
      name: ch.name,
      topic: ch.topic,
      memberCount: ch.memberCount,
    };
  }
  if (!rooms[IRC_CHAT_PRODUCT_ROOM]) {
    rooms[IRC_CHAT_PRODUCT_ROOM] = {
      id: IRC_CHAT_PRODUCT_ROOM,
      name: IRC_CHAT_PRODUCT_ROOM,
    };
  }
  const primaryRoom =
    meta.primaryRoom && rooms[meta.primaryRoom]
      ? meta.primaryRoom
      : rooms[IRC_CHAT_PRODUCT_ROOM]
        ? IRC_CHAT_PRODUCT_ROOM
        : null;
  return { rooms, primaryRoom };
}

export async function fetchGatewayRooms(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ rooms: Record<string, IrcChatRoom>; primaryRoom: string | null }> {
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(`Gateway rooms fetch failed (${res.status})`);
  }
  const payload = await res.json();
  return roomsFromGatewayPayload(payload);
}

export function isIrcChatLiveRoom(roomId: string, knownRoomIds?: Iterable<string>): boolean {
  const value = roomId.trim();
  if (!value) return false;
  if (value === IRC_CHAT_PRODUCT_ROOM) return true;
  if (knownRoomIds) {
    for (const id of knownRoomIds) {
      if (id === value) return true;
    }
  }
  return false;
}
