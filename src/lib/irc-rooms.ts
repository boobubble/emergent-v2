/**
 * IRC-native public room list — gateway `/rooms` contract and reconciliation helpers.
 */
import { LEGACY_LOBBY_ROOM_ID, YAARZO_GLOBAL_ROOM_ID } from "./auth-entry";
import type { Room } from "./chat-types";
import { isUuid } from "./dm-utils";

export interface GatewayRoomEntry {
  room?: string;
  channel?: string;
  users?: number;
  topic?: string;
}

export interface GatewayRoomsResponse {
  ok?: boolean;
  source?: string;
  primaryRoom?: string | null;
  rooms?: GatewayRoomEntry[];
}

export interface ParsedIrcChannel {
  id: string;
  name: string;
  topic: string;
  memberCount: number;
}

export interface IrcRoomsSyncMeta {
  primaryRoom: string | null;
  source?: string;
}

export function parseGatewayRoomsPayload(payload: unknown): {
  channels: ParsedIrcChannel[];
  meta: IrcRoomsSyncMeta;
} {
  const p = (payload && typeof payload === "object" ? payload : {}) as GatewayRoomsResponse;
  const entries = Array.isArray(p.rooms) ? p.rooms : [];
  const channels: ParsedIrcChannel[] = entries
    .filter((r) => typeof r?.room === "string" && r.room.trim())
    .map((r) => ({
      id: r.room!.trim(),
      name: r.room!.trim(),
      topic: typeof r.topic === "string" ? r.topic : "",
      memberCount: typeof r.users === "number" ? r.users : 0,
    }));
  const ircIds = new Set(channels.map((c) => c.id));
  let primaryRoom =
    typeof p.primaryRoom === "string" && p.primaryRoom.trim()
      ? p.primaryRoom.trim()
      : null;
  if (primaryRoom && !ircIds.has(primaryRoom)) primaryRoom = null;
  return {
    channels,
    meta: { primaryRoom, source: typeof p.source === "string" ? p.source : undefined },
  };
}

/** Community UUID rooms and user-created local rooms survive IRC reconciliation. */
export function isPreservedNonIrcSidebarRoom(
  id: string,
  room: Room | undefined,
  ircIds: Set<string>,
): boolean {
  if (!room || ircIds.has(id)) return false;
  if (room.dbBacked) return true;
  if (room.roles?.me === "owner" && !isUuid(id) && !id.startsWith("adm-")) return true;
  return false;
}

export function buildIrcReconciledRoomOrder(
  ircChannelIds: string[],
  previousOrder: string[],
  rooms: Record<string, Room>,
  ircIds: Set<string>,
): string[] {
  const tail = previousOrder.filter((id) =>
    isPreservedNonIrcSidebarRoom(id, rooms[id], ircIds),
  );
  const seen = new Set<string>();
  const order: string[] = [];
  for (const id of ircChannelIds) {
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  for (const id of tail) {
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  return order;
}

/** Drop cached/seeded public rooms that IRC no longer exposes (e.g. frontend-injected #games). */
export function pruneStaleIrcSidebarRooms(
  rooms: Record<string, Room>,
  roomOrder: string[],
  ircIds: Set<string>,
): { rooms: Record<string, Room>; roomOrder: string[] } {
  const nextRooms = { ...rooms };
  let nextOrder = [...roomOrder];
  for (const id of Object.keys(nextRooms)) {
    if (ircIds.has(id)) continue;
    if (isPreservedNonIrcSidebarRoom(id, nextRooms[id], ircIds)) continue;
    if (id.startsWith("dm:") || id.startsWith("gdm:")) continue;
    const r = nextRooms[id];
    if (!nextOrder.includes(id) && !r?.isPublic) continue;
    delete nextRooms[id];
    nextOrder = nextOrder.filter((x) => x !== id);
  }
  return { rooms: nextRooms, roomOrder: nextOrder };
}

export function resolvePrimaryActiveRoom(
  roomOrder: string[],
  rooms: Record<string, unknown>,
  primaryRoom?: string | null,
): string {
  if (primaryRoom && rooms[primaryRoom]) return primaryRoom;
  if (rooms[YAARZO_GLOBAL_ROOM_ID]) return YAARZO_GLOBAL_ROOM_ID;
  if (rooms[LEGACY_LOBBY_ROOM_ID]) return LEGACY_LOBBY_ROOM_ID;
  for (const id of roomOrder) {
    if (rooms[id]) return id;
  }
  return YAARZO_GLOBAL_ROOM_ID;
}
