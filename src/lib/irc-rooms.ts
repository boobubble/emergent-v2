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

/** Gateway IRC LIST endpoint — source of truth for public chatroom sidebar. */
export const IRC_ROOMS_GATEWAY_URL = "https://ws.yaarzo.com/rooms";

/** Poll interval for live IRC room discovery while chatroom is open. */
export const IRC_ROOMS_POLL_MS = 30_000;

/**
 * IRC-managed public slug rooms (yaarzo-global, games, music, …).
 * Not persisted — always re-hydrated from gateway `/rooms`.
 */
export function isGatewayIrcPublicRoom(id: string, room: Room | undefined): boolean {
  if (!room?.isPublic) return false;
  if (room.dbBacked) return false;
  if (isUuid(id)) return false;
  if (id.startsWith("adm-")) return false;
  if (room.roles?.me === "owner") return false;
  if (id.startsWith("dm:") || id.startsWith("gdm:")) return false;
  return true;
}

/** Remove stale cached IRC public rooms so gateway `/rooms` remains authoritative. */
export function stripGatewayIrcRoomsFromPersistedState<
  T extends { rooms: Record<string, Room>; roomOrder: string[]; activeChannel?: string },
>(state: T): T {
  const rooms = { ...state.rooms };
  const removeIds = new Set<string>();
  for (const id of Object.keys(rooms)) {
    if (isGatewayIrcPublicRoom(id, rooms[id])) {
      delete rooms[id];
      removeIds.add(id);
    }
  }
  const roomOrder = state.roomOrder.filter((id) => !removeIds.has(id));
  let activeChannel = state.activeChannel;
  if (activeChannel && removeIds.has(activeChannel)) {
    activeChannel = YAARZO_GLOBAL_ROOM_ID;
  }
  return { ...state, rooms, roomOrder, activeChannel };
}

/**
 * Pure reconciliation used by chat-store sync and regression tests.
 * Any IRC channel in `channels` is added; channels absent from IRC are pruned.
 */
export function applyIrcGatewayRoomSync(
  rooms: Record<string, Room>,
  roomOrder: string[],
  channels: ParsedIrcChannel[],
): { rooms: Record<string, Room>; roomOrder: string[] } {
  const validIds = new Set(channels.map((c) => c.id));
  const ircOrder = channels.map((c) => c.id);
  let nextRooms = { ...rooms };

  for (const ch of channels) {
    const existing = nextRooms[ch.id];
    if (existing) {
      nextRooms[ch.id] = {
        ...existing,
        name: ch.name,
        topic: ch.topic || existing.topic || "",
        isPublic: true,
      };
    } else {
      nextRooms[ch.id] = {
        id: ch.id,
        name: ch.name,
        topic: ch.topic || "",
        members: ["me"],
        roles: { me: "member" },
        isPublic: true,
      };
    }
  }

  const pruned = pruneStaleIrcSidebarRooms(nextRooms, roomOrder, validIds);
  const nextOrder = buildIrcReconciledRoomOrder(
    ircOrder,
    pruned.roomOrder,
    pruned.rooms,
    validIds,
  );
  return { rooms: pruned.rooms, roomOrder: nextOrder };
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
