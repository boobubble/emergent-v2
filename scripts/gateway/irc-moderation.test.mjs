import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildModerationCommand,
  parseModerationPayload,
  sanitizeReason,
  validateIrcNick,
  validateRoomId,
} from "./irc-moderation.cjs";

describe("irc-moderation validation", () => {
  it("accepts slug and uuid rooms", () => {
    assert.equal(validateRoomId("yaarzo-global"), "yaarzo-global");
    assert.equal(validateRoomId("games"), "games");
    assert.equal(validateRoomId("dm:abc"), null);
    assert.equal(validateRoomId(""), null);
  });

  it("validates IRC nicks", () => {
    assert.equal(validateIrcNick("mohit"), "mohit");
    assert.equal(validateIrcNick("bad nick"), null);
    assert.equal(validateIrcNick(""), null);
  });

  it("strips CR/LF from reasons", () => {
    assert.equal(sanitizeReason("hello\r\nworld"), "hello world");
    assert.equal(sanitizeReason("x".repeat(200)).length, 120);
  });
});

describe("Ergo IRC moderation commands", () => {
  it("builds KICK", () => {
    assert.equal(
      buildModerationCommand("kick", "yaarzo-global", "bob", "spam"),
      "KICK #yaarzo-global bob :spam\r\n",
    );
  });

  it("uses Ergo mute extban m: not MODE +q", () => {
    const cmd = buildModerationCommand("mute", "yaarzo-global", "bob");
    assert.equal(cmd, "MODE #yaarzo-global +b m:bob!*@*\r\n");
    assert.ok(!cmd.includes("+q"));
  });

  it("builds channel ban and unban", () => {
    assert.equal(buildModerationCommand("ban", "games", "bob"), "MODE #games +b bob!*@*\r\n");
    assert.equal(buildModerationCommand("unban", "games", "bob"), "MODE #games -b bob!*@*\r\n");
  });

  it("builds unmute via -b m:", () => {
    assert.equal(
      buildModerationCommand("unmute", "yaarzo-global", "bob"),
      "MODE #yaarzo-global -b m:bob!*@*\r\n",
    );
  });

  it("parses moderation WS payloads", () => {
    assert.deepEqual(
      parseModerationPayload({
        type: "moderation.kick",
        room: "yaarzo-global",
        targetNick: "ada",
        reason: "test",
      }),
      {
        action: "kick",
        room: "yaarzo-global",
        targetNick: "ada",
        reason: "test",
      },
    );
  });
});