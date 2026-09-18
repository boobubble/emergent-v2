import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  choosePublicMessageSound,
  isSelfIrcNick,
  messageMentionsNick,
  shouldPlayIncomingPmSound,
  shouldPlayJoinSound,
} from "./sound-logic";
import { IRC_CHAT_PRODUCT_ROOM } from "./constants";

describe("irc sound-logic", () => {
  it("detects self nick case-insensitively", () => {
    expect(isSelfIrcNick("Alice", "alice")).toBe(true);
    expect(isSelfIrcNick("Bob", "alice")).toBe(false);
  });

  it("detects @mention and bare nick mention", () => {
    expect(messageMentionsNick("hey @Alice ping", "Alice")).toBe(true);
    expect(messageMentionsNick("Alice said hi", "Alice")).toBe(true);
    expect(messageMentionsNick("hello world", "Alice")).toBe(false);
  });

  it("chooses public sound for other user in active room", () => {
    expect(
      choosePublicMessageSound({
        roomId: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        authorNick: "Bob",
        text: "hi",
        selfNick: "Alice",
        mentionEnabled: true,
        publicEnabled: true,
      }),
    ).toBe("public");
  });

  it("does not choose sound for own public message", () => {
    expect(
      choosePublicMessageSound({
        roomId: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        authorNick: "Alice",
        text: "hi",
        selfNick: "Alice",
        mentionEnabled: true,
        publicEnabled: true,
      }),
    ).toBe(null);
  });

  it("mention takes priority over generic public sound", () => {
    expect(
      choosePublicMessageSound({
        roomId: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        authorNick: "Bob",
        text: "@Alice look",
        selfNick: "Alice",
        mentionEnabled: true,
        publicEnabled: true,
      }),
    ).toBe("mention");
  });

  it("does not play public sound for inactive room", () => {
    expect(
      choosePublicMessageSound({
        roomId: "other-room",
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        authorNick: "Bob",
        text: "hi",
        selfNick: "Alice",
        mentionEnabled: true,
        publicEnabled: true,
      }),
    ).toBe(null);
  });

  it("does not play public or mention sound when activeSoundRoom is null (DM view)", () => {
    expect(
      choosePublicMessageSound({
        roomId: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: null,
        authorNick: "Bob",
        text: "hi",
        selfNick: "Alice",
        mentionEnabled: true,
        publicEnabled: true,
      }),
    ).toBe(null);
    expect(
      choosePublicMessageSound({
        roomId: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: null,
        authorNick: "Bob",
        text: "@Alice look",
        selfNick: "Alice",
        mentionEnabled: true,
        publicEnabled: true,
      }),
    ).toBe(null);
  });

  it("matches active room case-insensitively for public message sound", () => {
    const active = IRC_CHAT_PRODUCT_ROOM;
    const roomVariant =
      active === active.toLowerCase()
        ? active.toUpperCase()
        : active.toLowerCase();
    expect(
      choosePublicMessageSound({
        roomId: roomVariant,
        activeSoundRoom: active,
        authorNick: "Bob",
        text: "hi",
        selfNick: "Alice",
        mentionEnabled: true,
        publicEnabled: true,
      }),
    ).toBe("public");
  });

  it("allows join sound for other user when not suppressed", () => {
    expect(
      shouldPlayJoinSound({
        event: "join",
        room: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        joinNick: "Bob",
        selfNick: "Alice",
        suppressJoinSoundsForRoom: false,
        joinEnabled: true,
      }),
    ).toBe(true);
  });

  it("does not play join sound when activeSoundRoom is null (DM view)", () => {
    expect(
      shouldPlayJoinSound({
        event: "join",
        room: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: null,
        joinNick: "Bob",
        selfNick: "Alice",
        suppressJoinSoundsForRoom: false,
        joinEnabled: true,
      }),
    ).toBe(false);
  });

  it("matches active room case-insensitively for join sound", () => {
    const active = IRC_CHAT_PRODUCT_ROOM;
    const roomVariant =
      active === active.toLowerCase()
        ? active.toUpperCase()
        : active.toLowerCase();
    expect(
      shouldPlayJoinSound({
        event: "join",
        room: roomVariant,
        activeSoundRoom: active,
        joinNick: "Bob",
        selfNick: "Alice",
        suppressJoinSoundsForRoom: false,
        joinEnabled: true,
      }),
    ).toBe(true);
  });

  it("blocks join sound for non-active room", () => {
    expect(
      shouldPlayJoinSound({
        event: "join",
        room: "other-room",
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        joinNick: "Bob",
        selfNick: "Alice",
        suppressJoinSoundsForRoom: false,
        joinEnabled: true,
      }),
    ).toBe(false);
  });

  it("blocks own join and NAMES-suppressed join", () => {
    expect(
      shouldPlayJoinSound({
        event: "join",
        room: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        joinNick: "Alice",
        selfNick: "Alice",
        suppressJoinSoundsForRoom: false,
        joinEnabled: true,
      }),
    ).toBe(false);
    expect(
      shouldPlayJoinSound({
        event: "join",
        room: IRC_CHAT_PRODUCT_ROOM,
        activeSoundRoom: IRC_CHAT_PRODUCT_ROOM,
        joinNick: "Bob",
        selfNick: "Alice",
        suppressJoinSoundsForRoom: true,
        joinEnabled: true,
      }),
    ).toBe(false);
  });

  it("PM sound only when accepted and enabled flag true", () => {
    expect(shouldPlayIncomingPmSound({ incomingAccepted: false, pmEnabled: true })).toBe(
      false,
    );
    expect(shouldPlayIncomingPmSound({ incomingAccepted: true, pmEnabled: true })).toBe(
      true,
    );
  });
});
