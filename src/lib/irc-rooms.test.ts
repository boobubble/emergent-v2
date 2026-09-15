import { describe, expect, it } from "vitest";
import {
  buildIrcReconciledRoomOrder,
  parseGatewayRoomsPayload,
  pruneStaleIrcSidebarRooms,
  resolvePrimaryActiveRoom,
} from "./irc-rooms";
import type { Room } from "./chat-types";

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
