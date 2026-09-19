import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ircChatMobileMembersButtonLabel,
  ircChatMobileNavOpenAfterRoomSelect,
  ircChatShowCenterColumnHeader,
  ircChatShowFloatingSidebarToggle,
  ircChatShowSidebarBackdrop,
  ircChatUsesMobileShellHeader,
} from "./irc-chat-mobile-shell";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("irc-chat mobile shell", () => {
  it("branches desktop vs mobile header composition", () => {
    expect(ircChatUsesMobileShellHeader(false)).toBe(true);
    expect(ircChatUsesMobileShellHeader(true)).toBe(false);
    expect(ircChatShowCenterColumnHeader(true)).toBe(false);
    expect(ircChatShowCenterColumnHeader(false)).toBe(false);
  });

  it("does not use legacy floating sidebar on IRC mobile", () => {
    expect(ircChatShowFloatingSidebarToggle(false, false)).toBe(false);
    expect(ircChatShowFloatingSidebarToggle(false, true)).toBe(true);
    expect(ircChatShowFloatingSidebarToggle(true, true)).toBe(false);
  });

  it("closes mobile sheets after room selection", () => {
    expect(ircChatMobileNavOpenAfterRoomSelect()).toEqual({
      mobileNavOpen: false,
      membersOpen: false,
    });
  });

  it("labels the members sheet action for rooms vs DMs", () => {
    expect(
      ircChatMobileMembersButtonLabel({ kind: "room", roomId: "india" }),
    ).toBe("Members");
    expect(
      ircChatMobileMembersButtonLabel({ kind: "dm", peerNick: "alice" }),
    ).toBe("Conversation info");
  });

  it("keeps sidebar backdrop off when the inline sidebar is not mounted", () => {
    expect(ircChatShowSidebarBackdrop(false, false, true)).toBe(false);
    expect(ircChatShowSidebarBackdrop(false, true, true)).toBe(true);
  });

  it("keeps DjPlayerHost outside sheet state so radio does not remount", () => {
    const src = readFileSync(
      join(root, "components/irc-chat/IrcChatApp.tsx"),
      "utf8",
    );
    const hostIdx = src.indexOf("<DjPlayerHost");
    const sheetIdx = src.indexOf("<Sheet open=");
    expect(hostIdx).toBeGreaterThanOrEqual(0);
    expect(sheetIdx).toBeGreaterThan(hostIdx);
    expect(src).not.toMatch(/membersOpen\s*\?\s*<DjPlayerHost/);
  });
});
