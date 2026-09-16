import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isActiveDmSelection } from "./dm-utils";
import {
  applyIrcGatewayRoomSync,
  buildIrcReconciledRoomOrder,
  isGatewayIrcLiveChannel,
  isGatewayIrcPublicRoom,
  parseGatewayRoomsPayload,
  pruneStaleIrcSidebarRooms,
  resolvePrimaryActiveRoom,
  setGatewayIrcLiveRoomIds,
  stripGatewayIrcRoomsFromPersistedState,
  isValidIrcChannelSlug,
  ircRoomsClientUrl,
} from "./irc-rooms";
import type { Room } from "./chat-types";

const ME = "550e8400-e29b-41d4-a716-446655440000";
const PEER = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

describe("parseGatewayRoomsPayload", () => {
  it("parses IRC room list and primaryRoom when present in list", () => {
    const { channels, meta } = parseGatewayRoomsPayload({
      ok: true,
      source: "irc",
      primaryRoom: "yaarzo-global",
      rooms: [{ room: "yaarzo-global", users: 2, topic: "hi" }],
    });
    expect(channels).toEqual([
      { id: "yaarzo-global", name: "yaarzo-global", topic: "hi", memberCount: 2 },
    ]);
    expect(meta.primaryRoom).toBe("yaarzo-global");
    expect(meta.source).toBe("irc");
  });

  it("drops primaryRoom not in IRC list", () => {
    const { meta } = parseGatewayRoomsPayload({
      primaryRoom: "games",
      rooms: [{ room: "yaarzo-global" }],
    });
    expect(meta.primaryRoom).toBeNull();
  });
});

describe("IRC room reconciliation", () => {
  const yaarzo: Room = {
    id: "yaarzo-global",
    name: "yaarzo-global",
    topic: "",
    members: ["me"],
    roles: { me: "member" },
    isPublic: true,
  };
  const games: Room = {
    id: "games",
    name: "Games",
    topic: "",
    members: ["me"],
    roles: { me: "member" },
    isPublic: true,
  };
  const community: Room = {
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    name: "Community",
    topic: "",
    members: ["me"],
    roles: { me: "member" },
    isPublic: true,
    dbBacked: true,
  };

  it("replaces room order with IRC order and preserves community tail", () => {
    const ircIds = new Set(["yaarzo-global"]);
    const rooms = { "yaarzo-global": yaarzo, games, [community.id]: community };
    const order = buildIrcReconciledRoomOrder(
      ["yaarzo-global"],
      ["games", "yaarzo-global", community.id],
      rooms,
      ircIds,
    );
    expect(order).toEqual(["yaarzo-global", community.id]);
  });

  it("prunes stale seeded games when not in IRC list", () => {
    const ircIds = new Set(["yaarzo-global"]);
    const rooms = { "yaarzo-global": yaarzo, games };
    const { rooms: nextRooms, roomOrder } = pruneStaleIrcSidebarRooms(
      rooms,
      ["games", "yaarzo-global"],
      ircIds,
    );
    expect(nextRooms.games).toBeUndefined();
    expect(nextRooms["yaarzo-global"]).toBeTruthy();
    expect(roomOrder).toEqual(["yaarzo-global"]);
  });

  it("resolvePrimaryActiveRoom prefers gateway primaryRoom", () => {
    const rooms = { "yaarzo-global": yaarzo };
    expect(resolvePrimaryActiveRoom(["yaarzo-global"], rooms, "yaarzo-global")).toBe(
      "yaarzo-global",
    );
    expect(resolvePrimaryActiveRoom([], rooms, null)).toBe("yaarzo-global");
  });
});

describe("IRC gateway room sync lifecycle", () => {
  const yaarzo: Room = {
    id: "yaarzo-global",
    name: "yaarzo-global",
    topic: "",
    members: ["me"],
    roles: { me: "member" },
    isPublic: true,
  };

  const gatewayPayload = (roomIds: string[]) => ({
    ok: true,
    source: "irc",
    primaryRoom: "yaarzo-global",
    rooms: roomIds.map((id) => ({ room: id, users: 2, topic: "" })),
  });

  it("A: yaarzo-global only -> sidebar order has one IRC room", () => {
    const { channels } = parseGatewayRoomsPayload(gatewayPayload(["yaarzo-global"]));
    const { roomOrder, rooms } = applyIrcGatewayRoomSync({}, [], channels);
    expect(roomOrder).toEqual(["yaarzo-global"]);
    expect(rooms["yaarzo-global"]).toBeTruthy();
    expect(rooms.games).toBeUndefined();
  });

  it("B: next /rooms adds games -> order includes games (no special case)", () => {
    const step1 = parseGatewayRoomsPayload(gatewayPayload(["yaarzo-global"]));
    const after1 = applyIrcGatewayRoomSync({}, [], step1.channels);
    const step2 = parseGatewayRoomsPayload(gatewayPayload(["yaarzo-global", "games"]));
    const after2 = applyIrcGatewayRoomSync(after1.rooms, after1.roomOrder, step2.channels);
    expect(after2.roomOrder).toEqual(["yaarzo-global", "games"]);
    expect(after2.rooms.games?.isPublic).toBe(true);
  });

  it("C: removing games from /rooms prunes it from order and rooms", () => {
    const games: Room = {
      id: "games",
      name: "games",
      topic: "",
      members: ["me"],
      roles: { me: "member" },
      isPublic: true,
    };
    const step2 = parseGatewayRoomsPayload(gatewayPayload(["yaarzo-global", "games"]));
    const withGames = applyIrcGatewayRoomSync(
      { "yaarzo-global": yaarzo, games },
      ["yaarzo-global", "games"],
      step2.channels,
    );
    const step3 = parseGatewayRoomsPayload(gatewayPayload(["yaarzo-global"]));
    const after3 = applyIrcGatewayRoomSync(
      withGames.rooms,
      withGames.roomOrder,
      step3.channels,
    );
    expect(after3.roomOrder).toEqual(["yaarzo-global"]);
    expect(after3.rooms.games).toBeUndefined();
  });

  it("D: active DM selection is preserved across IRC room sync", () => {
    const dm = `dm:${ME}:${PEER}`;
    expect(isActiveDmSelection(dm, ME)).toBe(true);
    const step2 = parseGatewayRoomsPayload(gatewayPayload(["yaarzo-global", "games"]));
    const synced = applyIrcGatewayRoomSync({ "yaarzo-global": yaarzo }, ["yaarzo-global"], step2.channels);
    expect(synced.roomOrder).toContain("games");
    expect(isActiveDmSelection(dm, ME)).toBe(true);
  });

  it("E: arbitrary IRC room ids work generically", () => {
    const { channels } = parseGatewayRoomsPayload(
      gatewayPayload(["yaarzo-global", "music", "football", "india"]),
    );
    const { roomOrder, rooms } = applyIrcGatewayRoomSync({}, [], channels);
    expect(roomOrder).toEqual(["yaarzo-global", "music", "football", "india"]);
    for (const id of roomOrder) {
      expect(rooms[id]?.isPublic).toBe(true);
    }
  });
});

describe("chat-store IRC sync hook safety", () => {
  it("declares gateway sync effect after syncAdminChannels (no TDZ crash)", () => {
    const store = readFileSync(resolve(process.cwd(), "src/lib/chat-store.tsx"), "utf8");
    const syncDef = store.indexOf("const syncAdminChannels = useCallback");
    const ircEffect = store.indexOf("IRC `/rooms` is authoritative");
    expect(syncDef).toBeGreaterThan(0);
    expect(ircEffect).toBeGreaterThan(syncDef);
  });

  it("re-syncs gateway rooms when username changes (storage key hydration)", () => {
    const store = readFileSync(resolve(process.cwd(), "src/lib/chat-store.tsx"), "utf8");
    expect(store).toContain("ircRoomsClientUrl()");
    expect(store).toMatch(
      /\[storageReady,\s*syncAdminChannels,\s*username,\s*isGuest,\s*logIrcDebug\]/,
    );
  });
});

describe("IRC channel slug validation", () => {
  it("accepts gateway IRC room slugs dynamically", () => {
    for (const id of ["yaarzo-global", "games", "music", "football", "india"]) {
      expect(isValidIrcChannelSlug(id)).toBe(true);
    }
  });

  it("rejects malformed or unsafe channel ids", () => {
    for (const id of ["", "Games", "foo/bar", "a--b", "a-", "-foo", "x".repeat(65)]) {
      expect(isValidIrcChannelSlug(id)).toBe(false);
    }
  });
});

describe("ircRoomsClientUrl", () => {
  it("uses same-origin proxy in browser contexts", () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      value: { location: { href: "https://yaarzo.com/chatroom" } },
      configurable: true,
    });
    try {
      expect(ircRoomsClientUrl()).toBe("/api/public/irc-rooms");
    } finally {
      Object.defineProperty(globalThis, "window", {
        value: originalWindow,
        configurable: true,
      });
    }
  });
});

describe("gateway IRC live transport registry", () => {
  it("registers arbitrary /rooms ids for live IRC transport", () => {
    setGatewayIrcLiveRoomIds(["yaarzo-global", "games", "music"]);
    expect(isGatewayIrcLiveChannel("yaarzo-global")).toBe(true);
    expect(isGatewayIrcLiveChannel("games")).toBe(true);
    expect(isGatewayIrcLiveChannel("music")).toBe(true);
    expect(isGatewayIrcLiveChannel("my-local-room-abc1")).toBe(false);
  });
});

describe("persisted IRC room stripping", () => {
  it("strips cached gateway IRC rooms so /rooms re-hydrates them", () => {
    const cached = {
      rooms: {
        "yaarzo-global": {
          id: "yaarzo-global",
          name: "yaarzo-global",
          topic: "",
          members: ["me"],
          roles: { me: "member" },
          isPublic: true,
        },
        games: {
          id: "games",
          name: "games",
          topic: "",
          members: ["me"],
          roles: { me: "member" },
          isPublic: true,
        },
      },
      roomOrder: ["yaarzo-global"],
      activeChannel: "games",
    };
    expect(isGatewayIrcPublicRoom("games", cached.rooms.games)).toBe(true);
    const stripped = stripGatewayIrcRoomsFromPersistedState(cached);
    expect(stripped.rooms.games).toBeUndefined();
    expect(stripped.rooms["yaarzo-global"]).toBeUndefined();
    expect(stripped.roomOrder).toEqual([]);
    expect(stripped.activeChannel).toBe("yaarzo-global");
  });
});

describe("hydration -> gateway sync lifecycle", () => {
  const yaarzo: Room = {
    id: "yaarzo-global",
    name: "yaarzo-global",
    topic: "",
    members: ["me"],
    roles: { me: "member" },
    isPublic: true,
  };

  const gatewayPayload = {
    ok: true,
    source: "irc",
    primaryRoom: "yaarzo-global",
    rooms: [
      { room: "yaarzo-global", users: 2, topic: "" },
      { room: "games", users: 1, topic: "" },
    ],
  };

  it("stale yaarzo-global cache -> strip -> gateway restores yaarzo-global + games", () => {
    const cached = {
      rooms: { "yaarzo-global": yaarzo },
      roomOrder: ["yaarzo-global"],
      activeChannel: "yaarzo-global",
    };
    const stripped = stripGatewayIrcRoomsFromPersistedState(cached);
    expect(stripped.rooms).toEqual({});
    expect(stripped.roomOrder).toEqual([]);
    expect(stripped.activeChannel).toBe("yaarzo-global");

    const { channels, meta } = parseGatewayRoomsPayload(gatewayPayload);
    const synced = applyIrcGatewayRoomSync(stripped.rooms, stripped.roomOrder, channels);
    setGatewayIrcLiveRoomIds(channels.map((c) => c.id));

    expect(synced.roomOrder).toEqual(["yaarzo-global", "games"]);
    expect(synced.rooms["yaarzo-global"]).toBeTruthy();
    expect(synced.rooms.games).toBeTruthy();
    expect(resolvePrimaryActiveRoom(synced.roomOrder, synced.rooms, meta.primaryRoom)).toBe(
      "yaarzo-global",
    );
    expect(isGatewayIrcLiveChannel("games")).toBe(true);
  });

  it("preserves in-memory IRC rooms across username/storage-key re-hydration", () => {
    const { channels } = parseGatewayRoomsPayload(gatewayPayload);
    const synced = applyIrcGatewayRoomSync({}, [], channels);
    const prev = {
      rooms: synced.rooms,
      roomOrder: synced.roomOrder,
      activeChannel: "yaarzo-global",
    };
    const strippedReload = stripGatewayIrcRoomsFromPersistedState({
      rooms: {},
      roomOrder: [],
      activeChannel: "yaarzo-global",
    });
    const prevIrcIds = Object.keys(prev.rooms).filter((id) =>
      isGatewayIrcPublicRoom(id, prev.rooms[id]),
    );
    const rooms = { ...strippedReload.rooms };
    let roomOrder = [...strippedReload.roomOrder];
    for (const id of prevIrcIds) {
      rooms[id] = prev.rooms[id];
      if (!roomOrder.includes(id)) roomOrder.push(id);
    }
    const ircIds = new Set(prevIrcIds);
    roomOrder = buildIrcReconciledRoomOrder(prevIrcIds, roomOrder, rooms, ircIds);
    const activeChannel = resolvePrimaryActiveRoom(
      roomOrder,
      rooms,
      "yaarzo-global",
    );
    expect(roomOrder).toEqual(["yaarzo-global", "games"]);
    expect(activeChannel).toBe("yaarzo-global");
    expect(rooms.games).toBeTruthy();
  });

  it("persist slice strips IRC rooms while in-memory sync keeps them", () => {
    const { channels } = parseGatewayRoomsPayload(gatewayPayload);
    const synced = applyIrcGatewayRoomSync({}, [], channels);
    const persisted = stripGatewayIrcRoomsFromPersistedState({
      rooms: synced.rooms,
      roomOrder: synced.roomOrder,
      activeChannel: "yaarzo-global",
    });
    expect(persisted.rooms).toEqual({});
    expect(persisted.roomOrder).toEqual([]);
    expect(synced.rooms.games).toBeTruthy();
  });
});
