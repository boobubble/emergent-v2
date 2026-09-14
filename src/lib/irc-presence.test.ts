import { describe, expect, it } from "vitest";
import { formatIrcPresenceText, parseIrcPresenceLine } from "./irc-presence";

describe("parseIrcPresenceLine", () => {
  it("parses JOIN", () => {
    expect(
      parseIrcPresenceLine(":mohit!mohit@irc.yaarzo.com JOIN #yaarzo-global"),
    ).toEqual({
      event: "join",
      nick: "mohit",
      room: "yaarzo-global",
    });
  });

  it("parses PART with reason", () => {
    expect(
      parseIrcPresenceLine(":mohit!mohit@irc.yaarzo.com PART #yaarzo-global :Leaving"),
    ).toEqual({
      event: "part",
      nick: "mohit",
      room: "yaarzo-global",
      reason: "Leaving",
    });
  });

  it("parses QUIT", () => {
    expect(
      parseIrcPresenceLine(":mohit!mohit@irc.yaarzo.com QUIT :Client closed"),
    ).toEqual({
      event: "quit",
      nick: "mohit",
      reason: "Client closed",
    });
  });

  it("parses KICK", () => {
    expect(
      parseIrcPresenceLine(":mod!mod@irc.yaarzo.com KICK #yaarzo-global mohit :spam"),
    ).toEqual({
      event: "kick",
      nick: "mohit",
      room: "yaarzo-global",
      reason: "spam",
    });
  });

  it("ignores PRIVMSG", () => {
    expect(
      parseIrcPresenceLine(":mohit!mohit@irc.yaarzo.com PRIVMSG #yaarzo-global :hello"),
    ).toBeNull();
  });
});

describe("formatIrcPresenceText", () => {
  it("formats join and quit", () => {
    expect(formatIrcPresenceText("join", "mohit")).toBe("mohit has joined");
    expect(formatIrcPresenceText("quit", "mohit", "Client closed")).toBe(
      "mohit quit (Client closed)",
    );
  });
});
