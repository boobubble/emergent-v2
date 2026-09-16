import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseNames353Line, parseNames366Line } from "./irc-names";
import { parseIrcPresenceLine } from "./irc-presence";

const root = resolve(import.meta.dirname, "..", "..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("IRC-only public room membership guardrails", () => {
  it("MembersPanel bypasses Supabase guest presence for IRC rooms", () => {
    const panel = read("src/components/chat/MembersPanel.tsx");
    expect(panel).toContain("const isIrcPublicRoom = usesIrcLive(roomId)");
    expect(panel).toContain("roomId === GUEST_LOBBY_CHANNEL_ID && !isIrcPublicRoom");
    expect(panel).toContain("if (isIrcPublicRoom) {");
    expect(panel).toContain("const remoteIds = isIrcPublicRoom");
    expect(panel).toContain("isIrcPublicRoom || roomId !== GUEST_LOBBY_CHANNEL_ID");
  });

  it("guest-chat-context skips Supabase presence when gateway token exists", () => {
    const ctx = read("src/lib/guest-chat-context.tsx");
    expect(ctx).toContain("if (session.gatewayToken)");
    expect(ctx).toContain("untrackGuestLobbyPresence()");
  });

  it("PresenceFeed remains bypassed for IRC rooms", () => {
    const feed = read("src/components/chat/PresenceFeed.tsx");
    expect(feed).toContain("if (usesIrcLive(channelId)) return");
  });

  it("gateway issues NAMES on room join", () => {
    const gw = read("gateway-index-vps.js");
    expect(gw).toContain("requestRoomNames");
    expect(gw).toContain('type: "room.names"');
  });

  it("guest IRC nick uses raw nickname not Guest- prefix", () => {
    const nick = read("scripts/gateway/irc-nick.cjs");
    expect(nick).toContain("nickFromGuestNickname");
    const gw = read("gateway-index-vps.js");
    expect(gw).toContain("nickFromGuestNickname");
  });

  it("assigned IRC nick is stored on guest session", () => {
    expect(read("src/lib/visitor-session.ts")).toContain("updateGuestChatIrcNick");
    expect(read("src/lib/chat-store.tsx")).toContain("updateGuestChatIrcNick");
    expect(read("src/lib/chat-store.tsx")).toContain("applyGuestIrcIdentity");
  });

  it("UserMenu exposes profile and DM actions for registered users", () => {
    const menu = read("src/components/chat/UserMenu.tsx");
    expect(menu).toContain("View Profile");
    expect(menu).toContain("Send Direct Message");
    expect(menu).toContain("canViewRegisteredProfile");
  });

  it("NAMES lines parse Kiwi users for immediate membership", () => {
    const line =
      ":irc.yaarzo.com 353 me = #yaarzo-global :@max @JD @KiwiAdmin";
    const parsed = parseNames353Line(line);
    expect(parsed?.nicks).toEqual(["max", "JD", "KiwiAdmin"]);
    const end = parseNames366Line(
      ":irc.yaarzo.com 366 me #yaarzo-global :End of /NAMES",
    );
    expect(end?.room).toBe("yaarzo-global");
  });

  it("Kiwi JOIN appears as IRC presence only", () => {
    const parsed = parseIrcPresenceLine(
      ":KiwiAdmin!admin@irc.yaarzo.com JOIN #yaarzo-global",
    );
    expect(parsed).toEqual({
      event: "join",
      nick: "KiwiAdmin",
      room: "yaarzo-global",
    });
  });
});
