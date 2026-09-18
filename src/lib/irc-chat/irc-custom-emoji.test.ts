import { describe, expect, it } from "vitest";
import {
  createCustomEmojiToken,
  isValidCustomEmojiId,
  parseMessageSegments,
  resolveCustomEmojiUrl,
} from "./irc-custom-emoji";

const SAMPLE_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("irc-custom-emoji", () => {
  it("creates stable token from valid uuid", () => {
    expect(createCustomEmojiToken(SAMPLE_ID)).toBe(`:e:${SAMPLE_ID}:`);
  });

  it("rejects invalid ids for token creation", () => {
    expect(() => createCustomEmojiToken("not-a-uuid")).toThrow();
    expect(() => createCustomEmojiToken(":e:bad:")).toThrow();
  });

  it("validates uuid ids strictly", () => {
    expect(isValidCustomEmojiId(SAMPLE_ID)).toBe(true);
    expect(isValidCustomEmojiId(SAMPLE_ID.toUpperCase())).toBe(true);
    expect(isValidCustomEmojiId("00000000-0000-0000-0000-000000000000")).toBe(false);
    expect(isValidCustomEmojiId("javascript:alert(1)")).toBe(false);
  });

  it("leaves normal text unchanged", () => {
    expect(parseMessageSegments("Hello world 😄")).toEqual([
      { type: "text", value: "Hello world 😄" },
    ]);
  });

  it("parses mixed text, unicode, and custom emoji token", () => {
    const token = createCustomEmojiToken(SAMPLE_ID);
    const text = `Hello ${token} welcome 😄`;
    expect(parseMessageSegments(text)).toEqual([
      { type: "text", value: "Hello " },
      { type: "emoji", id: SAMPLE_ID, raw: token },
      { type: "text", value: " welcome 😄" },
    ]);
  });

  it("parses multiple custom emoji tokens", () => {
    const id2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const t1 = createCustomEmojiToken(SAMPLE_ID);
    const t2 = createCustomEmojiToken(id2);
    expect(parseMessageSegments(`${t1}${t2}`)).toEqual([
      { type: "emoji", id: SAMPLE_ID, raw: t1 },
      { type: "emoji", id: id2, raw: t2 },
    ]);
  });

  it("keeps malformed token-like text literal", () => {
    expect(parseMessageSegments(":e:not-a-uuid:")).toEqual([
      { type: "text", value: ":e:not-a-uuid:" },
    ]);
  });

  it("resolves url only from trusted catalog map", () => {
    const map = new Map([[SAMPLE_ID, { url: "https://cdn.example/emoji.gif" }]]);
    expect(resolveCustomEmojiUrl(SAMPLE_ID, map)).toBe("https://cdn.example/emoji.gif");
    expect(resolveCustomEmojiUrl("6ba7b810-9dad-11d1-80b4-00c04fd430c8", map)).toBe(null);
    expect(resolveCustomEmojiUrl("javascript:alert(1)", map)).toBe(null);
  });

  it("does not treat html in text as markup (segments stay text)", () => {
    const segments = parseMessageSegments('<img src=x onerror=alert(1)>');
    expect(segments).toEqual([{ type: "text", value: '<img src=x onerror=alert(1)>' }]);
  });
});
