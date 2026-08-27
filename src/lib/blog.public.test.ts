import { describe, it, expect } from "vitest";
import { getPublishedBlogBySlug } from "@/lib/blog.public";

describe("getPublishedBlogBySlug", () => {
  it("returns null for an empty slug without querying", async () => {
    await expect(getPublishedBlogBySlug("   ")).resolves.toBeNull();
  });
});
