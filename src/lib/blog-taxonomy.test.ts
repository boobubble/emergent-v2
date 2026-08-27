import { describe, expect, it } from "vitest";
import {
  MAX_BLOG_TAGS,
  addChip,
  emptyTaxonomyStillValid,
  normalizeTagList,
  parseKeywordPhrases,
  serializeKeywords,
} from "./blog-taxonomy";

describe("blog tags", () => {
  it("trims, blocks case-insensitive duplicates, and caps count", () => {
    let tags: string[] = [];
    tags = addChip(tags, "  Chatrooms  ", { maxItems: MAX_BLOG_TAGS, maxLength: 32 }).next;
    expect(addChip(tags, "chatrooms", { maxItems: MAX_BLOG_TAGS, maxLength: 32 })).toEqual({
      next: ["Chatrooms"],
      added: false,
      reason: "duplicate",
    });
    tags = addChip(tags, "Friendship", { maxItems: 2, maxLength: 32 }).next;
    expect(addChip(tags, "Online Community", { maxItems: 2, maxLength: 32 }).reason).toBe("max");
    expect(normalizeTagList(["  A  ", "a", "B", ""])).toEqual(["A", "B"]);
  });

  it("saves and loads keyword phrases without stuffing body copy", () => {
    const stored = serializeKeywords(["free online chatrooms", "Make friends online", "free online chatrooms"]);
    expect(stored).toBe("free online chatrooms, Make friends online");
    expect(parseKeywordPhrases(stored)).toEqual(["free online chatrooms", "Make friends online"]);
    expect(parseKeywordPhrases(null)).toEqual([]);
    expect(parseKeywordPhrases('["online communities"]')).toEqual(["online communities"]);
  });

  it("treats existing posts without tags/keywords as valid empty taxonomy", () => {
    expect(emptyTaxonomyStillValid([], null)).toBe(true);
    expect(emptyTaxonomyStillValid(undefined, "")).toBe(true);
  });
});
