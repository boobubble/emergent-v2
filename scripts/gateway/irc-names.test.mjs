import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createNamesAccumulator,
  parseNames353Line,
  parseNames366Line,
  stripIrcNameToken,
} from "./irc-names.cjs";

describe("irc-names", () => {
  it("parses 353 and 366 into a snapshot", () => {
    const acc = createNamesAccumulator();
    acc.ingest353(":irc.yaarzo.com 353 max = #yaarzo-global :@max @JD Guest123");
    const end = acc.ingest366(":irc.yaarzo.com 366 max #yaarzo-global :End of /NAMES");
    assert.deepEqual(end, {
      room: "yaarzo-global",
      nicks: ["max", "JD", "Guest123"],
    });
  });

  it("strips IRC status prefixes from NAMES tokens", () => {
    assert.equal(stripIrcNameToken("@max"), "max");
    assert.equal(stripIrcNameToken("+voice"), "voice");
  });

  it("parseNames353Line ignores gateway bot nick", () => {
    const parsed = parseNames353Line(
      ":irc.yaarzo.com 353 bot = #yaarzo-global :YaarzoGateway max",
    );
    assert.deepEqual(parsed?.nicks, ["max"]);
  });

  it("parseNames366Line accepts RFC-style End of /NAMES trailing text", () => {
    const parsed = parseNames366Line(
      ":irc.yaarzo.com 366 max #yaarzo-global :End of /NAMES",
    );
    assert.deepEqual(parsed, { room: "yaarzo-global" });
  });

  it("parseNames366Line accepts Ergo End of NAMES list trailing text", () => {
    const parsed = parseNames366Line(
      ":ergo.test 366 test10 #yaarzo-global :End of NAMES list",
    );
    assert.deepEqual(parsed, { room: "yaarzo-global" });
  });

  it("accumulator completes Ergo 366 after multi-user 353", () => {
    const acc = createNamesAccumulator();
    acc.ingest353(
      ":irc.yaarzo.com 353 test10 = #yaarzo-global :@Arman +maliha test10",
    );
    const end = acc.ingest366(
      ":ergo.test 366 test10 #yaarzo-global :End of NAMES list",
    );
    assert.deepEqual(end, {
      room: "yaarzo-global",
      nicks: ["Arman", "maliha", "test10"],
    });
  });
});
