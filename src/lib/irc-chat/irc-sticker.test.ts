import { describe, expect, it } from "vitest";
import { createStickerToken, isStickerOnlyMessageText, resolveStickerIdForMessage } from "./irc-sticker";

const ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("irc-sticker tokens", () => {
  it("creates and parses sticker wire token", () => {
    const token = createStickerToken(ID);
    expect(token).toBe(`:s:${ID}:`);
    expect(isStickerOnlyMessageText(token)).toBe(true);
    expect(resolveStickerIdForMessage(token)).toBe(ID);
  });

  it("resolves sticker id from gateway metadata", () => {
    expect(
      resolveStickerIdForMessage(`:s:${ID}:`, ID, "sticker"),
    ).toBe(ID);
  });

  it("rejects invalid ids", () => {
    expect(() => createStickerToken("bad")).toThrow();
  });
});
