import { describe, expect, it } from "vitest";
import {
  addIrcMember,
  applyGuestIrcIdentity,
  mergeIrcNamesMembers,
  mergeIrcNamesSnapshotMembers,
  memberIdForIrcEntry,
  removeIrcMember,
  removeIrcMemberFromAllRooms,
  renameIrcMemberInRoom,
  resolveGuestIrcNick,
  stripPlaceholderMeFromMembers,
} from "./irc-members";

describe("irc-members", () => {
  it("NAMES snapshot replaces duplicate nicks with one member id", () => {
    const members = mergeIrcNamesMembers(
      [],
      [
        { nick: "max", userId: "uuid-max" },
        { nick: "JD", userId: "irc:JD" },
        { nick: "max", userId: "uuid-max" },
      ],
    );
    expect(members).toEqual(["uuid-max", "irc:JD"]);
  });

  it("JOIN adds exactly once", () => {
    const first = addIrcMember(["irc:max"], "irc:max");
    const second = addIrcMember(first, "irc:max");
    expect(second).toEqual(["irc:max"]);
  });

  it("PART removes member", () => {
    expect(removeIrcMember(["irc:a", "irc:b"], "irc:a")).toEqual(["irc:b"]);
  });

  it("QUIT removes from all IRC rooms", () => {
    const rooms = removeIrcMemberFromAllRooms(
      {
        "yaarzo-global": { members: ["irc:max", "irc:JD"], name: "Global" },
        games: { members: ["irc:max"], name: "Games" },
        local: { members: ["irc:max"], name: "Local" },
      },
      "irc:max",
      new Set(["yaarzo-global", "games"]),
    );
    expect(rooms["yaarzo-global"].members).toEqual(["irc:JD"]);
    expect(rooms.games.members).toEqual([]);
    expect(rooms.local.members).toEqual(["irc:max"]);
  });

  it("NICK rename updates member id without duplicate", () => {
    const next = renameIrcMemberInRoom(
      ["irc:old", "irc:other"],
      "irc:old",
      "irc:new",
    );
    expect(next).toEqual(["irc:other", "irc:new"]);
  });

  it("maps guest visitor id for Yaarzo IRC sessions", () => {
    expect(
      memberIdForIrcEntry({
        nick: "Ranjha",
        userId: "visitor_abc123",
        isGuest: true,
      }),
    ).toBe("visitor_abc123");
  });

  it("maps Kiwi/external users to irc:nick", () => {
    expect(
      memberIdForIrcEntry({
        nick: "JD",
        userId: "irc:JD",
      }),
    ).toBe("irc:JD");
  });

  it("reconnect NAMES merge does not duplicate existing ids", () => {
    const existing = ["uuid-max", "irc:JD"];
    const merged = mergeIrcNamesMembers(existing, [
      { nick: "max", userId: "uuid-max" },
      { nick: "JD", userId: "irc:JD" },
      { nick: "Ranjha", userId: "visitor_guest1", isGuest: true },
    ]);
    expect(merged).toEqual(["uuid-max", "irc:JD", "visitor_guest1"]);
  });

  it("prefers assigned IRC nick over guest nickname", () => {
    expect(
      resolveGuestIrcNick({ ircNick: "Ranjha_2", nickname: "Ranjha" }),
    ).toBe("Ranjha_2");
    expect(resolveGuestIrcNick({ nickname: "Ranjha" })).toBe("Ranjha");
  });

  it("replaces placeholder me with visitor id in IRC members", () => {
    expect(
      stripPlaceholderMeFromMembers(["me", "irc:JD"], "visitor_abc"),
    ).toEqual(["irc:JD", "visitor_abc"]);
  });

  it("NAMES snapshot keeps bots and drops me", () => {
    const members = mergeIrcNamesSnapshotMembers(
      ["me", "bot-echo", "irc:old"],
      [{ nick: "Ranjha", userId: "visitor_abc", isGuest: true }],
      ["bot-echo"],
      "visitor_abc",
    );
    expect(members).toEqual(["visitor_abc", "bot-echo"]);
  });

  it("applyGuestIrcIdentity sets live nick and visitor membership", () => {
    const next = applyGuestIrcIdentity(
      {
        me: {
          id: "me",
          name: "__public__",
          avatarColor: "x",
          status: "online",
          xp: 0,
          level: 1,
        },
        users: {
          me: {
            id: "me",
            name: "__public__",
            avatarColor: "x",
            status: "online",
            xp: 0,
            level: 1,
          },
        },
        rooms: {
          "yaarzo-global": { members: ["me", "irc:JD"] },
          local: { members: ["me"] },
        },
      },
      "visitor_abc",
      "Ranjha",
      (id) => id === "yaarzo-global",
    );
    expect(next.me.name).toBe("Ranjha");
    expect(next.users.visitor_abc?.name).toBe("Ranjha");
    expect(next.rooms["yaarzo-global"].members).toEqual(["irc:JD", "visitor_abc"]);
    expect(next.rooms.local.members).toEqual(["me"]);
  });
});
