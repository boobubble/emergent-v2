import { describe, it, expect } from "vitest";
import { resolveDuplicateSlug } from "./slug-conflicts";

describe("resolveDuplicateSlug", () => {
  it("appends numeric suffix", () => {
    expect(resolveDuplicateSlug("lahore-chat-room", 1)).toBe("lahore-chat-room-2");
  });
});
