import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createTypingRegistry,
  handleTypingStart,
  handleTypingStop,
} from "./irc-typing.cjs";

function mockWs(userId, nick) {
  return { userId, ircNick: nick, nick };
}

function mockSessionManager(joined) {
  return {
    getSession: () => ({ joinedRooms: new Set(joined) }),
  };
}

describe("irc-typing", () => {
  it("rejects typing when not in room", () => {
    const registry = createTypingRegistry();
    const ws = mockWs("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "Ranjha");
    const result = handleTypingStart(
      ws,
      { room: "yaarzo-global" },
      mockSessionManager([]),
      registry,
    );
    assert.equal(result.ok, false);
  });

  it("clears typing on stop and disconnect", () => {
    const registry = createTypingRegistry();
    const ws = mockWs("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "Ranjha");
    const sessionManager = mockSessionManager(["yaarzo-global"]);
    const start = handleTypingStart(
      ws,
      { room: "yaarzo-global" },
      sessionManager,
      registry,
    );
    assert.equal(start.ok, true);
    assert.equal(registry.snapshot("yaarzo-global").length, 1);
    handleTypingStop(ws, { room: "yaarzo-global" }, sessionManager, registry);
    assert.equal(registry.snapshot("yaarzo-global").length, 0);
    handleTypingStart(ws, { room: "yaarzo-global" }, sessionManager, registry);
    const rooms = registry.clearWs(ws);
    assert.deepEqual(rooms, ["yaarzo-global"]);
    assert.equal(registry.snapshot("yaarzo-global").length, 0);
  });

  it("rejects malformed room", () => {
    const registry = createTypingRegistry();
    const ws = mockWs("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "Ranjha");
    const result = handleTypingStart(
      ws,
      { room: "bad:room" },
      mockSessionManager(["yaarzo-global"]),
      registry,
    );
    assert.equal(result.ok, false);
  });
});
