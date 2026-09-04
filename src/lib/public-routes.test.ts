import { describe, it, expect } from "vitest";
import {
  isPublicPath,
  isReadOnlyPublicAppPath,
  isPrivateUtilityPath,
  READ_ONLY_PUBLIC_APP_PREFIXES,
  needsGuestChatShell,
  publicSsrHeading,
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

  it("treats the homepage as public so SSR can emit crawlable HTML", () => {
    expect(isPublicPath("/")).toBe(true);
  });

  it("does not treat private settings as public", () => {
    expect(isPublicPath("/settings")).toBe(false);
    expect(isReadOnlyPublicAppPath("/settings")).toBe(false);
    expect(isReadOnlyPublicAppPath("/admin")).toBe(false);
  });

  it("classifies settings and notifications as private utility routes", () => {
    expect(isPrivateUtilityPath("/settings")).toBe(true);
    expect(isPrivateUtilityPath("/settings/privacy")).toBe(true);
    expect(isPrivateUtilityPath("/notifications")).toBe(true);
    expect(isPrivateUtilityPath("/login")).toBe(false);
    expect(isPrivateUtilityPath("/welcome")).toBe(false);
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
      "/blog",
      "/find-friends",
      "/games",
      "/achievements",
      "/site-directory",
    ];
    for (const path of required) {
      expect(READ_ONLY_PUBLIC_APP_PREFIXES).toContain(path);
      expect(isPublicPath(path)).toBe(true);
    }
  });

  it("keeps chat-backed routes in the guest chat shell and SSR-headings", () => {
    expect(needsGuestChatShell("/chatroom")).toBe(true);
    expect(needsGuestChatShell("/feed")).toBe(true);
    expect(needsGuestChatShell("/blog")).toBe(false);
    expect(needsGuestChatShell("/poetry")).toBe(false);
    expect(needsGuestChatShell("/site-directory")).toBe(false);
    expect(publicSsrHeading("/chatroom")).toBe("Chatrooms");
    expect(publicSsrHeading("/feed")).toBe("Community Feed");
    expect(publicSsrHeading("/leaderboard")).toBe("Leaderboard");
    expect(publicSsrHeading("/achievements")).toBe("Achievements");
    expect(publicSsrHeading("/blog")).toBeNull();
  });

  it("allows switching between public routes without treating them as private", () => {
    const hops = ["/feed", "/chatroom", "/competitions", "/u/bob", "/confessions", "/feed"];
    for (const path of hops) {
      expect(isPublicPath(path)).toBe(true);
    }
  });
});