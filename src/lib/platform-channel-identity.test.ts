import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { YAARZO_GLOBAL_ROOM_ID } from "@/lib/auth-entry";
import { GAMES_CHANNEL_ID } from "@/lib/chat-bot-channels";
import {
  FALLBACK_PLATFORM_CHANNELS,
  isCommunityChannelId,
  isDmChannelId,
  isGdmChannelId,
  isPlatformChannelSlug,
  isTrioChannelId,
  mergePlatformRegistryIntoRooms,
  platformChannelSlugList,
  platformChannelSlugsForRuntime,
  platformChannelToRoom,
  resolveActiveChannelAfterRegistrySync,
  sortPlatformChannels,
} from "@/lib/platform-channel-identity";
import type { PlatformChannelRecord } from "@/lib/platform-channels.types";
import type { Room } from "@/lib/chat-types";

const testDir = dirname(fileURLToPath(import.meta.url));
const COMMUNITY = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const DM_CH = "dm:550e8400-e29b-41d4-a716-446655440000:6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function channel(
  overrides: Partial<PlatformChannelRecord> & Pick<PlatformChannelRecord, "slug" | "name" | "channel_number">,
): PlatformChannelRecord {
  return {
    id: `id-${overrides.slug}`,
    description: "",
    enabled: true,
    archived_at: null,
    guest_allowed: false,
    sort_order: overrides.channel_number * 10,
    channel_kind: "admin",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("platform-channel-identity", () => {
  it("sorts registry rows by sort_order then channel_number", () => {
    const sorted = sortPlatformChannels([
      channel({ slug: "music", name: "Music", channel_number: 3, sort_order: 50 }),
      channel({ slug: "games", name: "Games", channel_number: 2, sort_order: 10 }),
      channel({ slug: "yaarzo-global", name: "Global", channel_number: 1, sort_order: 0 }),
    ]);
    expect(sorted.map((c) => c.slug)).toEqual(["yaarzo-global", "games", "music"]);
  });

  it("maps registry rows to navigation rooms using slug as id", () => {
    const room = platformChannelToRoom(
      channel({ slug: "music", name: "Music", channel_number: 3 }),
    );
    expect(room.id).toBe("music");
    expect(room.name).toBe("Music");
    expect(room.platformRegistry).toBe(true);
    expect(room.platformChannelNumber).toBe(3);
  });

  it("keeps Global canonical slug yaarzo-global", () => {
    expect(platformChannelSlugList(FALLBACK_PLATFORM_CHANNELS)[0]).toBe("yaarzo-global");
    expect(isPlatformChannelSlug("yaarzo-global")).toBe(true);
  });

  it("keeps Games canonical slug games", () => {
    expect(platformChannelSlugList(FALLBACK_PLATFORM_CHANNELS)).toContain("games");
    expect(platformChannelToRoom(
      channel({ slug: "games", name: "Games", channel_number: 2, channel_kind: "system" }),
    ).kind).toBe("game");
  });

  it("supports arbitrary admin slug music without hardcoding", () => {
    const slugs = platformChannelSlugList([
      ...FALLBACK_PLATFORM_CHANNELS,
      channel({ slug: "music", name: "Music", channel_number: 3 }),
    ]);
    expect(slugs).toContain("music");
    expect(isPlatformChannelSlug("music", new Set(slugs))).toBe(true);
  });

  it("uses slug as messages.channel_id (room id equals slug)", () => {
    const { rooms } = mergePlatformRegistryIntoRooms({}, [], [
      channel({ slug: "music", name: "Music", channel_number: 3 }),
    ]);
    expect(rooms.music?.id).toBe("music");
  });

  it("does not treat DM identifiers as platform channels", () => {
    expect(isDmChannelId(DM_CH)).toBe(true);
    expect(isPlatformChannelSlug(DM_CH)).toBe(false);
  });

  it("does not treat trio/gdm identifiers as platform channels", () => {
    expect(isTrioChannelId("trio:room-uuid")).toBe(true);
    expect(isGdmChannelId("gdm:compose:uuid")).toBe(true);
    expect(isPlatformChannelSlug("trio:room-uuid")).toBe(false);
    expect(isPlatformChannelSlug("gdm:compose:uuid")).toBe(false);
  });

  it("does not treat UUID community channels as platform channels", () => {
    expect(isCommunityChannelId(COMMUNITY)).toBe(true);
    expect(isPlatformChannelSlug(COMMUNITY)).toBe(false);
  });

  it("falls back to Global + Games when registry fetch fails", () => {
    expect(FALLBACK_PLATFORM_CHANNELS.map((c) => c.slug)).toEqual([
      "yaarzo-global",
      "games",
    ]);
    const { roomOrder, rooms } = mergePlatformRegistryIntoRooms({}, [], FALLBACK_PLATFORM_CHANNELS);
    expect(roomOrder).toEqual(["yaarzo-global", "games"]);
    expect(rooms["yaarzo-global"]?.name).toBe("Global");
  });

  it("merges registry navigation without removing community rooms", () => {
    const communityRoom: Room = {
      id: COMMUNITY,
      name: "Community Room",
      topic: "topic",
      members: ["me"],
      roles: { me: "member" },
      isPublic: true,
      dbBacked: true,
    };
    const { roomOrder, rooms } = mergePlatformRegistryIntoRooms(
      { [COMMUNITY]: communityRoom },
      [COMMUNITY],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: false },
    );
    expect(roomOrder[0]).toBe("yaarzo-global");
    expect(roomOrder).toContain(COMMUNITY);
    expect(rooms[COMMUNITY]?.dbBacked).toBe(true);
  });
});

describe("platform registry bootstrap vs authoritative merge", () => {
  const musicRoom: Room = {
    id: "music",
    name: "Music",
    topic: "Music",
    members: ["me"],
    roles: { me: "member" },
    isPublic: true,
    platformRegistry: true,
    platformChannelNumber: 3,
  };

  const liveWithMusic = [
    ...FALLBACK_PLATFORM_CHANNELS,
    channel({ slug: "music", name: "Music", channel_number: 3, sort_order: 50 }),
  ];

  it("bootstrap preserves persisted Music while fallback only has Global/Games", () => {
    const { rooms, roomOrder } = mergePlatformRegistryIntoRooms(
      { music: musicRoom },
      ["music"],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: false },
    );
    expect(rooms.music?.platformRegistry).toBe(true);
    expect(roomOrder).toEqual(["yaarzo-global", "games", "music"]);
    expect(
      resolveActiveChannelAfterRegistrySync(
        "music",
        { music: musicRoom },
        rooms,
        false,
        platformChannelSlugsForRuntime(FALLBACK_PLATFORM_CHANNELS, rooms, false),
      ),
    ).toBe("music");
  });

  it("live authoritative success keeps Music active", () => {
    const before = { music: musicRoom };
    const { rooms } = mergePlatformRegistryIntoRooms(
      before,
      ["music"],
      liveWithMusic,
      { authoritative: true },
    );
    expect(rooms.music).toBeDefined();
    expect(
      resolveActiveChannelAfterRegistrySync(
        "music",
        before,
        rooms,
        true,
        platformChannelSlugList(liveWithMusic),
      ),
    ).toBe("music");
  });

  it("authoritative live registry without Music removes stale platform room", () => {
    const { rooms, roomOrder } = mergePlatformRegistryIntoRooms(
      { music: musicRoom },
      ["music"],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: true },
    );
    expect(rooms.music).toBeUndefined();
    expect(roomOrder).toEqual(["yaarzo-global", "games"]);
  });

  it("authoritative removal falls back active Music to yaarzo-global", () => {
    const before = { music: musicRoom };
    const { rooms } = mergePlatformRegistryIntoRooms(
      before,
      ["music"],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: true },
    );
    expect(
      resolveActiveChannelAfterRegistrySync(
        "music",
        before,
        rooms,
        true,
        platformChannelSlugList(FALLBACK_PLATFORM_CHANNELS),
      ),
    ).toBe("yaarzo-global");
  });

  it("non-authoritative fetch failure does not delete persisted Music", () => {
    const { rooms } = mergePlatformRegistryIntoRooms(
      { music: musicRoom },
      ["music"],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: false },
    );
    expect(rooms.music).toBeDefined();
    expect(
      resolveActiveChannelAfterRegistrySync(
        "music",
        { music: musicRoom },
        rooms,
        false,
        platformChannelSlugsForRuntime(FALLBACK_PLATFORM_CHANNELS, rooms, false),
      ),
    ).toBe("music");
  });

  it("bootstrap adds Global/Games when missing", () => {
    const { rooms, roomOrder } = mergePlatformRegistryIntoRooms(
      {},
      [],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: false },
    );
    expect(rooms["yaarzo-global"]?.name).toBe("Global");
    expect(rooms.games?.name).toBe("Games");
    expect(roomOrder).toEqual(["yaarzo-global", "games"]);
  });

  it("bootstrap runtime slugs include preserved platform rooms for history fetch", () => {
    const { rooms } = mergePlatformRegistryIntoRooms(
      { music: musicRoom },
      ["music"],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: false },
    );
    expect(platformChannelSlugsForRuntime(FALLBACK_PLATFORM_CHANNELS, rooms, false)).toEqual([
      "yaarzo-global",
      "games",
      "music",
    ]);
  });

  it("does not treat DM active channel as stale platform room", () => {
    expect(
      resolveActiveChannelAfterRegistrySync(
        DM_CH,
        {},
        {},
        true,
        platformChannelSlugList(FALLBACK_PLATFORM_CHANNELS),
      ),
    ).toBe(DM_CH);
  });

  it("does not treat community UUID active channel as stale platform room", () => {
    const communityRoom: Room = {
      id: COMMUNITY,
      name: "Community",
      topic: "t",
      members: ["me"],
      roles: { me: "member" },
      isPublic: true,
      dbBacked: true,
    };
    const { rooms } = mergePlatformRegistryIntoRooms(
      { [COMMUNITY]: communityRoom },
      [COMMUNITY],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: true },
    );
    expect(
      resolveActiveChannelAfterRegistrySync(
        COMMUNITY,
        { [COMMUNITY]: communityRoom },
        rooms,
        true,
        platformChannelSlugList(FALLBACK_PLATFORM_CHANNELS),
      ),
    ).toBe(COMMUNITY);
  });

  it("does not treat trio/gdm channels as stale platform rooms", () => {
    const trio = "trio:550e8400-e29b-41d4-a716-446655440000";
    const gdm = "gdm:550e8400-e29b-41d4-a716-446655440000";
    expect(
      resolveActiveChannelAfterRegistrySync(
        trio,
        {},
        {},
        true,
        platformChannelSlugList(FALLBACK_PLATFORM_CHANNELS),
      ),
    ).toBe(trio);
    expect(
      resolveActiveChannelAfterRegistrySync(
        gdm,
        {},
        {},
        true,
        platformChannelSlugList(FALLBACK_PLATFORM_CHANNELS),
      ),
    ).toBe(gdm);
  });

  it("authoritative merge does not remove community or trio/gdm pseudo-rooms", () => {
    const communityRoom: Room = {
      id: COMMUNITY,
      name: "Community",
      topic: "t",
      members: ["me"],
      roles: { me: "member" },
      isPublic: true,
      dbBacked: true,
    };
    const { rooms } = mergePlatformRegistryIntoRooms(
      { [COMMUNITY]: communityRoom, music: musicRoom },
      [COMMUNITY, "music"],
      FALLBACK_PLATFORM_CHANNELS,
      { authoritative: true },
    );
    expect(rooms[COMMUNITY]).toBeDefined();
    expect(rooms.music).toBeUndefined();
  });
});

describe("chat-store registry wiring (source assertions)", () => {
  const chatStoreSrc = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");

  it("loads platform registry for authenticated users", () => {
    expect(chatStoreSrc).toContain("listPlatformChannels");
    expect(chatStoreSrc).toContain("syncPlatformRegistryChannels");
    expect(chatStoreSrc).toContain("mergePlatformRegistryIntoRooms");
    expect(chatStoreSrc).toContain("authoritative: false");
    expect(chatStoreSrc).toContain("authoritative: true");
  });

  it("fetches message history for registry slugs instead of only hardcoded global/games", () => {
    expect(chatStoreSrc).toMatch(/for \(const slug of platformChannelSlugs\)/);
  });

  it("passes registry slugs into filtered realtime bindings", () => {
    expect(chatStoreSrc).toContain("platformChannelSlugs");
    expect(chatStoreSrc).toMatch(/buildFilteredMessageInsertBindings\([\s\S]*platformChannelSlugs/);
  });

  it("does not change DM channel helpers", () => {
    expect(chatStoreSrc).toContain("isRemoteDmChannel");
    expect(chatStoreSrc).toContain("dmChannelFor");
  });
});
