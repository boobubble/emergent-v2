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

  it("accepts image attachment token send", () => {
    const result = parseOutboundMessageContent({
      text: `:a:${ID}:`,
      contentType: "image",
      attachmentId: ID,
    });
    assert.equal(result.ok, true);
    assert.equal(result.contentType, "image");
    assert.equal(result.attachmentId, ID);
  });

  it("accepts image attachment with caption", () => {
    const result = parseOutboundMessageContent({
      text: "Look at this",
      contentType: "image",
      attachmentId: ID,
    });
    assert.equal(result.ok, true);
    assert.equal(result.text, "Look at this");
  });

  it("rejects attachment without id", () => {
    const result = parseOutboundMessageContent({
      text: `:a:${ID}:`,
      contentType: "image",
    });
    assert.equal(result.ok, false);
  });
});
