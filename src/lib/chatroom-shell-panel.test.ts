import { describe, expect, it } from "vitest";
import {
  buildChatroomSearch,
  isGuestProtectedFeedTab,
  isGuestProtectedNavPath,
  isGuestProtectedShellPanel,
  parseChatroomRouteSearch,
} from "./chatroom-shell-panel";

describe("chatroom-shell-panel", () => {
  it("parses guest and yaarzo panel search", () => {
    expect(parseChatroomRouteSearch({ guest: "1", yaarzo: "find-friends", tab: "requests" })).toEqual({
      guest: "1",
      yaarzo: "find-friends",
      tab: "requests",
    });
    expect(parseChatroomRouteSearch({ yaarzo: "evil" }).yaarzo).toBeUndefined();
  });

  it("marks protected shell panels and allows public chatroom panels for guests", () => {
    expect(isGuestProtectedShellPanel("feed")).toBe(true);
    expect(isGuestProtectedShellPanel("home")).toBe(true);
    expect(isGuestProtectedShellPanel("find-friends")).toBe(false);
    expect(isGuestProtectedShellPanel("poetry")).toBe(false);
    expect(isGuestProtectedShellPanel("competitions")).toBe(false);
    expect(isGuestProtectedShellPanel("confessions")).toBe(false);
  });

  it("marks protected feed tabs and external nav paths for guests", () => {
    expect(isGuestProtectedFeedTab()).toBe(true);
    expect(isGuestProtectedFeedTab("trending")).toBe(true);
    expect(isGuestProtectedFeedTab("account")).toBe(true);
    expect(isGuestProtectedNavPath("/radio")).toBe(true);
    expect(isGuestProtectedNavPath("/find-friends")).toBe(false);
  });

  it("builds search for overlay navigation without dropping guest", () => {
    expect(buildChatroomSearch({ guest: "1" }, "feed", { tab: "account" })).toEqual({
      guest: "1",
      yaarzo: "feed",
      tab: "account",
    });
    expect(buildChatroomSearch({ guest: "1", yaarzo: "feed", tab: "account" }, null)).toEqual({
      guest: "1",
    });
  });
});
