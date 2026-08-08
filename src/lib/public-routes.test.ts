import { describe, it, expect } from "vitest";
import {
  isPublicPath,
  isReadOnlyPublicAppPath,
  READ_ONLY_PUBLIC_APP_PREFIXES,
} from "./public-routes";

describe("public routes — logged-out browse allowlist", () => {
  it("marks /chatroom and /feed as read-only public app paths", () => {
    expect(isReadOnlyPublicAppPath("/chatroom")).toBe(true);
    expect(isReadOnlyPublicAppPath("/chatrooms")).toBe(true);
    expect(isReadOnlyPublicAppPath("/chatroom/lobby")).toBe(true);
    expect(isReadOnlyPublicAppPath("/feed")).toBe(true);
    expect(isReadOnlyPublicAppPath("/feed/some-post")).toBe(true);
  });

  it("marks competitions, profiles, and confessions as public", () => {
    expect(isPublicPath("/competitions")).toBe(true);
    expect(isPublicPath("/competitions/summer")).toBe(true);
    expect(isPublicPath("/u/alice")).toBe(true);
    expect(isPublicPath("/confessions")).toBe(true);
  });

  it("does not treat private settings as public", () => {
    expect(isPublicPath("/settings")).toBe(false);
    expect(isReadOnlyPublicAppPath("/settings")).toBe(false);
    expect(isReadOnlyPublicAppPath("/admin")).toBe(false);
  });

  it("covers every required public browse surface from the audit", () => {
    const required = [
      "/feed",
      "/chatroom",
      "/chatrooms",
      "/competitions",
      "/u",
      "/confessions",
      "/poetry",
      "/community",
      "/communities",
    ];
    for (const path of required) {
      expect(READ_ONLY_PUBLIC_APP_PREFIXES).toContain(path);
      expect(isPublicPath(path)).toBe(true);
    }
  });

  it("allows switching between public routes without treating them as private", () => {
    const hops = ["/feed", "/chatroom", "/competitions", "/u/bob", "/confessions", "/feed"];
    for (const path of hops) {
      expect(isPublicPath(path)).toBe(true);
    }
  });
});