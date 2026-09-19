import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseOutboundMessageContent } from "./irc-message-content.cjs";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("irc-message-content", () => {
  it("accepts sticker send with matching token", () => {
    const result = parseOutboundMessageContent({
      text: `:s:${ID}:`,
      contentType: "sticker",
      stickerId: ID,
    });
    assert.equal(result.ok, true);
    assert.equal(result.contentType, "sticker");
    assert.equal(result.stickerId, ID);
  });

  it("rejects mismatched sticker token", () => {
    const result = parseOutboundMessageContent({
      text: ":s:bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb:",
      contentType: "sticker",
      stickerId: ID,
    });
    assert.equal(result.ok, false);
  });

  it("allows normal text messages", () => {
    const result = parseOutboundMessageContent({ text: "hello world" });
    assert.equal(result.ok, true);
    assert.equal(result.contentType, "text");
  });
});
