import { describe, expect, it } from "vitest";
import {
  buildModerationCommand,
  parseModerationPayload,
  sanitizeReason,
  validateIrcNick,
  validateRoomId,
} from "./irc-moderation.cjs";

describe("irc-moderation validation", () => {
  it("accepts slug and uuid rooms", () => {
    expect(validateRoomId("yaarzo-global")).toBe("yaarzo-global");
    expect(validateRoomId("games")).toBe("games");
    expect(validateRoomId("dm:abc")).toBeNull();
    expect(validateRoomId("")).toBeNull();
  });

  it("validates IRC nicks", () => {
    expect(validateIrcNick("mohit")).toBe("mohit");
    expect(validateIrcNick("bad nick")).toBeNull();
    expect(validateIrcNick("")).toBeNull();
  });

  it("strips CR/LF from reasons", () => {
    expect(sanitizeReason("hello\r\nworld")).toBe("hello world");
    expect(sanitizeReason("x".repeat(200)).length).toBe(120);
  });
});

describe("Ergo IRC moderation commands", () => {
  it("builds KICK", () => {
    expect(buildModerationCommand("kick", "yaarzo-global", "bob", "spam")).toBe(
      "KICK #yaarzo-global bob :spam\r\n",
    );
  });

  it("uses Ergo mute extban m: not MODE +q", () => {
    const cmd = buildModerationCommand("mute", "yaarzo-global", "bob");
    expect(cmd).toBe("MODE #yaarzo-global +b m:bob!*@*\r\n");
    expect(cmd).not.toContain("+q");
  });

  it("builds channel ban and unban", () => {
    expect(buildModerationCommand("ban", "games", "bob")).toBe(
      "MODE #games +b bob!*@*\r\n",
    );
    expect(buildModerationCommand("unban", "games", "bob")).toBe(
      "MODE #games -b bob!*@*\r\n",
    );
  });

  it("builds unmute via -b m:", () => {
    expect(buildModerationCommand("unmute", "yaarzo-global", "bob")).toBe(
      "MODE #yaarzo-global -b m:bob!*@*\r\n",
    );
  });

  it("parses moderation WS payloads", () => {
    expect(
      parseModerationPayload({
        type: "moderation.kick",
        room: "yaarzo-global",
        targetNick: "ada",
        reason: "test",
      }),
    ).toEqual({
      action: "kick",
      room: "yaarzo-global",
      targetNick: "ada",
      reason: "test",
    });
  });
});
