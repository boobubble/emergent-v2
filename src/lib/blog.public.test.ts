import { describe, it, expect } from "vitest";
import { getPublishedBlogBySlug, publicBlogTags } from "@/lib/blog.public";

describe("getPublishedBlogBySlug", () => {
  it("returns null for an empty slug without querying", async () => {
    await expect(getPublishedBlogBySlug("   ")).resolves.toBeNull();
  });

  it("maps missing tags on older posts to an empty list", () => {
    expect(publicBlogTags(null)).toEqual([]);
    expect(publicBlogTags(undefined)).toEqual([]);
    expect(publicBlogTags([])).toEqual([]);
    expect(publicBlogTags(["Friendship", "  "])).toEqual(["Friendship"]);
  });
});
