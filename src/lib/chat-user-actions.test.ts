import { describe, expect, it } from "vitest";
import {
  canViewRegisteredProfile,
  isRegisteredProfileUserId,
  resolveDmTargetUserId,
} from "./chat-user-actions";

describe("chat-user-actions", () => {
  it("detects registered profile ids", () => {
    expect(
      isRegisteredProfileUserId("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
    ).toBe(true);
    expect(isRegisteredProfileUserId("visitor_abc")).toBe(false);
    expect(isRegisteredProfileUserId("irc:Kiwi")).toBe(false);
  });

  it("allows profile only for registered UUID peers", () => {
    expect(canViewRegisteredProfile("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(
      true,
    );
    expect(canViewRegisteredProfile("visitor_abc")).toBe(false);
    expect(canViewRegisteredProfile("irc:KiwiAdmin")).toBe(false);
  });

  it("resolves DM target for guest self alias", () => {
    expect(
      resolveDmTargetUserId("me", null, "visitor_guest1"),
    ).toBe("visitor_guest1");
    expect(
      resolveDmTargetUserId("irc:Kiwi", "uuid", "visitor_guest1"),
    ).toBe("irc:Kiwi");
  });
});
