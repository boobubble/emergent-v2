import { YAARZO_GLOBAL_ROOM_ID } from "@/lib/auth-entry";
import { GAMES_CHANNEL_ID } from "@/lib/chat-bot-channels";
import type { Room } from "@/lib/chat-types";
import { isUuid } from "@/lib/dm-utils";
import type { PlatformChannelRecord } from "@/lib/platform-channels.types";

const FALLBACK_TS = "1970-01-01T00:00:00.000Z";

/** Safe offline fallback when registry fetch fails — Global + Games only. */
export const FALLBACK_PLATFORM_CHANNELS: PlatformChannelRecord[] = [
  {
    id: "fallback-yaarzo-global",
    channel_number: 1,
    slug: YAARZO_GLOBAL_ROOM_ID,
    name: "Global",
    description: "Yaarzo public lobby",
    enabled: true,
    archived_at: null,
    guest_allowed: true,
    sort_order: 0,
    channel_kind: "system",
    created_at: FALLBACK_TS,
    updated_at: FALLBACK_TS,
  },
  {
    id: "fallback-games",
    channel_number: 2,
    slug: GAMES_CHANNEL_ID,
    name: "Games",
    description: "Game commands and bots",
    enabled: true,
    archived_at: null,
    guest_allowed: false,
    sort_order: 10,
    channel_kind: "system",
    created_at: FALLBACK_TS,
    updated_at: FALLBACK_TS,
  },
];

export function sortPlatformChannels(
  channels: PlatformChannelRecord[],
): PlatformChannelRecord[] {
  return [...channels].sort(
    (a, b) => a.sort_order - b.sort_order || a.channel_number - b.channel_number,
  );
}

export function platformChannelSlugList(
  channels: PlatformChannelRecord[],
): string[] {
  return sortPlatformChannels(channels).map((c) => c.slug);
}

export function isDmChannelId(channelId: string): boolean {
  return channelId.startsWith("dm:");
}

export function isTrioChannelId(channelId: string): boolean {
  return channelId.startsWith("trio:");
}

export function isGdmChannelId(channelId: string): boolean {
  return channelId.startsWith("gdm:");
}

export function isCommunityChannelId(channelId: string): boolean {
  return isUuid(channelId);
}

/** True when channel_id is a platform registry slug (not DM/trio/gdm/community UUID). */
export function isPlatformChannelSlug(
  channelId: string,
  registrySlugs?: ReadonlySet<string>,
): boolean {
  if (
    !channelId ||
    isDmChannelId(channelId) ||
    isTrioChannelId(channelId) ||
    isGdmChannelId(channelId) ||
    isCommunityChannelId(channelId)
  ) {
    return false;
  }
  if (registrySlugs?.has(channelId)) return true;
  return channelId === YAARZO_GLOBAL_ROOM_ID || channelId === GAMES_CHANNEL_ID;
}

export function platformChannelToRoom(channel: PlatformChannelRecord): Room {
  const isGames = channel.slug === GAMES_CHANNEL_ID;
  return {
    id: channel.slug,
    name: channel.name,
    topic: channel.description || channel.name,
    members: ["me"],
    roles: { me: "member" },
    isPublic: true,
    kind: isGames ? "game" : "chat",
    platformRegistry: true,
    platformChannelNumber: channel.channel_number,
  };
}

export type MergePlatformRegistryOpts = {
  /** When false, bootstrap only — do not remove persisted platform rooms or redirect active. */
  authoritative?: boolean;
};

/** Runtime slug list for history/realtime — bootstrap unions persisted platform rooms. */
export function platformChannelSlugsForRuntime(
  channels: PlatformChannelRecord[],
  rooms: Record<string, Room>,
  authoritative: boolean,
): string[] {
  const slugs = platformChannelSlugList(channels);
  if (authoritative) return slugs;
  const seen = new Set(slugs);
  const preserved = Object.keys(rooms)
    .filter((id) => rooms[id]?.platformRegistry && !seen.has(id))
    .sort(
      (a, b) =>
        (rooms[a]?.platformChannelNumber ?? 999) - (rooms[b]?.platformChannelNumber ?? 999),
    );
  return [...slugs, ...preserved];
}

/**
 * After authoritative sync, fall back to Global only when a persisted platform room
 * was removed. Never redirect DM/gdm/trio/community selections.
 */
export function resolveActiveChannelAfterRegistrySync(
  activeChannel: string,
  roomsBefore: Record<string, Room>,
  roomsAfter: Record<string, Room>,
  authoritative: boolean,
  availableSlugs: readonly string[],
): string {
  if (!authoritative || roomsAfter[activeChannel]) return activeChannel;
  if (
    isDmChannelId(activeChannel) ||
    isGdmChannelId(activeChannel) ||
    isTrioChannelId(activeChannel) ||
    isCommunityChannelId(activeChannel)
  ) {
    return activeChannel;
  }
  if (roomsBefore[activeChannel]?.platformRegistry !== true) return activeChannel;
  return availableSlugs.includes(YAARZO_GLOBAL_ROOM_ID)
    ? YAARZO_GLOBAL_ROOM_ID
    : availableSlugs[0] ?? YAARZO_GLOBAL_ROOM_ID;
}

/** Merge registry rows into chat-store rooms/roomOrder without touching community/local rooms. */
export function mergePlatformRegistryIntoRooms(
  rooms: Record<string, Room>,
  roomOrder: string[],
  channels: PlatformChannelRecord[],
  opts?: MergePlatformRegistryOpts,
): { rooms: Record<string, Room>; roomOrder: string[] } {
  const authoritative = opts?.authoritative ?? true;
  const sorted = sortPlatformChannels(channels);
  const slugSet = new Set(sorted.map((c) => c.slug));
  const nextRooms: Record<string, Room> = { ...rooms };

  for (const channel of sorted) {
    const existing = nextRooms[channel.slug];
    nextRooms[channel.slug] = {
      ...platformChannelToRoom(channel),
      members: existing?.members ?? ["me"],
      roles: existing?.roles ?? { me: "member" },
    };
  }

  if (authoritative) {
    for (const id of Object.keys(nextRooms)) {
      if (nextRooms[id]?.platformRegistry && !slugSet.has(id)) {
        delete nextRooms[id];
      }
    }
  }

  const platformOrder = sorted.map((c) => c.slug);
  if (!authoritative) {
    const preservedPlatform = Object.entries(nextRooms)
      .filter(([id, room]) => room.platformRegistry && !platformOrder.includes(id))
      .sort(
        (a, b) =>
          (a[1].platformChannelNumber ?? 999) - (b[1].platformChannelNumber ?? 999),
      )
      .map(([id]) => id);
    platformOrder.push(...preservedPlatform);
  }

  const extras: string[] = [];
  for (const id of roomOrder) {
    const room = nextRooms[id];
    if (!room || room.platformRegistry) continue;
    if (!extras.includes(id)) extras.push(id);
  }
  for (const id of Object.keys(nextRooms)) {
    const room = nextRooms[id];
    if (!room || room.platformRegistry || extras.includes(id)) continue;
    extras.push(id);
  }

  return { rooms: nextRooms, roomOrder: [...platformOrder, ...extras] };
}
