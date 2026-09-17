import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeIrcNick,
  isProtectedNick,
  resolveNickCollision,
  nickFromRegisteredUser,
  nickFallbackFromUserId,
  nickFromGuestDisplayName,
  nickFromGuestNickname,
} from "./irc-nick.cjs";

describe("irc-nick", () => {
  it("normalizes invalid characters and strips CR/LF", () => {
    assert.equal(normalizeIrcNick("max\r\n"), "max");
    assert.equal(normalizeIrcNick("hello world"), "hello_world");
    assert.equal(normalizeIrcNick("a".repeat(40)).length, 30);
  });

  it("rejects protected nicks", () => {
    assert.equal(normalizeIrcNick("YaarzoGateway"), null);
    assert.equal(isProtectedNick("yaarzogateway"), true);
    assert.equal(normalizeIrcNick("max"), "max");
  });

  it("resolves nick collisions with suffix", () => {
    const occupied = new Set(["max"]);
    assert.equal(resolveNickCollision("max", occupied), "max_2");
    occupied.add("max_2");
    assert.equal(resolveNickCollision("max", occupied), "max_3");
  });

  it("derives registered user nick from metadata", () => {
    assert.equal(
      nickFromRegisteredUser({ sub: "abc", user_metadata: { username: "JD" } }),
      "JD",
    );
  });

  it("builds deterministic UUID fallback nick", () => {
    assert.equal(
      nickFallbackFromUserId("a0eebc99-9c0d-4ef0-8123-456789abcdef"),
      "user_a0eebc99",
    );
  });

  it("derives guest nick from display name without prefix", () => {
    assert.equal(nickFromGuestDisplayName("Guest-Arman"), "Arman");
  });

  it("derives guest nick from raw nickname", () => {
    assert.equal(nickFromGuestNickname("Ranjha"), "Ranjha");
  });
});
