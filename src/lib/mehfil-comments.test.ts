import { describe, it, expect } from "vitest";
import { POEM_COMMENT_MAX, validatePoemCommentText } from "@/lib/mehfil-types";

describe("validatePoemCommentText", () => {
  it("trims a valid comment", () => {
    expect(validatePoemCommentText("  nice lines  ")).toBe("nice lines");
  });

  it("rejects empty or whitespace-only text", () => {
    expect(() => validatePoemCommentText("")).toThrow(/empty/i);
    expect(() => validatePoemCommentText("   ")).toThrow(/empty/i);
    expect(() => validatePoemCommentText(null)).toThrow(/required/i);
  });

  it("rejects comments over the max length", () => {
    expect(() => validatePoemCommentText("x".repeat(POEM_COMMENT_MAX + 1))).toThrow(/2000/);
    expect(validatePoemCommentText("x".repeat(POEM_COMMENT_MAX))).toHaveLength(POEM_COMMENT_MAX);
  });
});
