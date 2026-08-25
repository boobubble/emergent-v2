import { describe, it, expect } from "vitest";
import { landingPathForMode } from "./landing-path";

describe("landingPathForMode", () => {
  it("sends the default welcome mode to the SEO homepage", () => {
    expect(landingPathForMode("welcome")).toBe("/");
    expect(landingPathForMode(undefined)).toBe("/");
    expect(landingPathForMode(null)).toBe("/");
  });

  it("keeps hero mode on /heropage", () => {
    expect(landingPathForMode("hero")).toBe("/heropage");
  });
});
