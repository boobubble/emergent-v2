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
});
