import { describe, expect, it } from "vitest";
import {
  addIrcMember,
  mergeIrcNamesMembers,
  memberIdForIrcEntry,
  removeIrcMember,
  removeIrcMemberFromAllRooms,
  renameIrcMemberInRoom,
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
});
