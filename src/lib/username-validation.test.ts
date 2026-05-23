import { describe, it, expect } from "vitest";
import { validateUsername } from "./username-validation";

describe("validateUsername", () => {
  describe("valid usernames", () => {
    it.each([
      ["ab", "minimum 2 letters"],
      ["abcdefghij", "maximum 10 letters"],
      ["cool user", "letters with space"],
      ["cool_user", "letters with underscore"],
      ["user123", "letters mixed with numbers"],
      ["a1b2c3", "interleaved letters and digits"],
      ["John Doe", "mixed case with space"],
      ["  ab  ", "trimmed whitespace"],
    ])("accepts %j (%s)", (input) => {
      const r = validateUsername(input);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(input.trim());
    });
  });

  describe("rejects symbols and disallowed characters", () => {
    it.each([
      "john!",
      "hi@world",
      "name#1",
      "user.name",
      "us-er",
      "qu'ote",
      "tab\tname",
      "emoji😀",
      "<script>",
      "drop;table",
    ])("rejects %j", (input) => {
      const r = validateUsername(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/letters, numbers, spaces/);
    });
  });

  describe("rejects names with too few letters", () => {
    it.each(["a", "a1", "1234", "  ", "_____", "1_2_3"])("rejects %j", (input) => {
      const r = validateUsername(input);
      expect(r.ok).toBe(false);
    });
  });

  describe("rejects names with too many letters", () => {
    it.each(["abcdefghijk", "averyverylongname", "John Doe Smith"])(
      "rejects %j (>10 letters)",
      (input) => {
        const r = validateUsername(input);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.reason).toMatch(/2 to 10 letters/);
      },
    );
  });

  describe("length bounds", () => {
    it("rejects empty string", () => {
      expect(validateUsername("").ok).toBe(false);
    });
    it("rejects whitespace-only", () => {
      expect(validateUsername("    ").ok).toBe(false);
    });
    it("rejects strings longer than 32 chars", () => {
      const r = validateUsername("a".repeat(33));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/32 characters/);
    });
  });

  describe("reserved prefix", () => {
    it.each(["guest-abc", "GUEST-xyz", "Guest-123"])("rejects %j", (input) => {
      const r = validateUsername(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/Reserved/);
    });
  });

  describe("non-string inputs", () => {
    it.each([null, undefined, 123, {}, []])("rejects %p", (input) => {
      const r = validateUsername(input);
      expect(r.ok).toBe(false);
    });
  });
});
