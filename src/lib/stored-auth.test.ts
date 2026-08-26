import { describe, expect, it } from "vitest";
import { hasStoredAuthToken, isGuestHomePath } from "./stored-auth";

describe("stored auth detection", () => {
  it("treats missing window storage as logged out", () => {
    expect(hasStoredAuthToken()).toBe(false);
  });

  it("guest home requires `/` without an sb auth token", () => {
    expect(isGuestHomePath()).toBe(false);
  });
});
