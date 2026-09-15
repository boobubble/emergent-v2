import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildRoomsPayload,
  createStartupJoinTracker,
  fromIrcChannel,
  isListEnd323,
  isWelcomeNumeric,
  parseListEntry322,
  parseSelfJoin,
  parseJoinErrorChannel,
} from "./irc-room-discovery.cjs";

describe("irc-room-discovery", () => {
  it("detects welcome 001", () => {
    assert.equal(isWelcomeNumeric(":irc.yaarzo.com 001 YaarzoGateway :Welcome"), true);
    assert.equal(isWelcomeNumeric("PING :x"), false);
  });

  it("parses LIST 322 entries", () => {
    const entry = parseListEntry322(
      ":irc.yaarzo.com 322 YaarzoGateway #yaarzo-global 3 :hello",
    );
    assert.deepEqual(entry, {
      room: "yaarzo-global",
      channel: "#yaarzo-global",
      users: 3,
      topic: "hello",
    });
  });

  it("detects LIST end 323", () => {
    assert.equal(isListEnd323(":irc.yaarzo.com 323 YaarzoGateway :End of /LIST"), true);
  });

  it("parses self JOIN", () => {
    assert.equal(
      parseSelfJoin(":YaarzoGateway!x@y JOIN :#yaarzo-global", "YaarzoGateway"),
      "#yaarzo-global",
    );
  });

  it("parses join error channel", () => {
    assert.equal(
      parseJoinErrorChannel(":irc 473 YaarzoGateway #lobby :Cannot join"),
      "#lobby",
    );
  });

  it("buildRoomsPayload sets primaryRoom only when listed", () => {
    const list = new Map([
      ["yaarzo-global", { room: "yaarzo-global", channel: "#yaarzo-global", users: 1, topic: "" }],
    ]);
    assert.deepEqual(buildRoomsPayload(list, "yaarzo-global").primaryRoom, "yaarzo-global");
    assert.equal(buildRoomsPayload(list, "games").primaryRoom, null);
    assert.equal(buildRoomsPayload(new Map(), "yaarzo-global").rooms.length, 0);
  });

  it("startup tracker completes after all targets resolved", () => {
    const tracker = createStartupJoinTracker(["#yaarzo-global", "#lobby"]);
    assert.equal(tracker.isStartupComplete(), false);
    tracker.noteJoinAttemptResolved("#yaarzo-global");
    assert.equal(tracker.isStartupComplete(), false);
    tracker.noteJoinAttemptResolved("#lobby");
    assert.equal(tracker.isStartupComplete(), true);
  });

  it("fromIrcChannel normalizes channel ids", () => {
    assert.equal(fromIrcChannel("#yaarzo-global"), "yaarzo-global");
    assert.equal(fromIrcChannel("yaarzo-global"), "yaarzo-global");
  });
});
