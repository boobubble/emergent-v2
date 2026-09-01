import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

describe("mehfil_poem_comments RLS", () => {
  it("insert policy uses SECURITY DEFINER helper instead of self-referencing subquery", () => {
    const src = readFileSync(
      resolve(
        process.cwd(),
        "supabase/migrations/20260901130000_fix_mehfil_poem_comments_rls.sql",
      ),
      "utf8",
    );
    expect(src).toContain("mehfil_poem_comment_parent_valid");
    expect(src).toContain("SECURITY DEFINER");
    expect(src).not.toMatch(
      /CREATE POLICY[\s\S]*mehfil_poem_comments insert own[\s\S]*FROM public\.mehfil_poem_comments/,
    );
  });
});

describe("PoemComments emoji picker", () => {
  it("uses the shared EmojiPicker like feed comments", () => {
    const src = readFileSync(
      resolve(process.cwd(), "src/components/mehfil/PoemComments.tsx"),
      "utf8",
    );
    expect(src).toContain('from "@/components/chat/EmojiPicker"');
    expect(src).toContain("EmojiPicker onPick");
    expect(src).toContain("slice(0, POEM_COMMENT_MAX)");
  });
});
