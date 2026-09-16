import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("per-user IRC session wiring", () => {
  it("gateway creates per-user IRC sessions on auth", () => {
    const gw = read("gateway-index-vps.js");
    expect(gw).toContain("createIrcSessionManager");
    expect(gw).toContain("attachUserIrcSession");
    expect(gw).not.toMatch(
      /broadcastToAuthenticatedClients\(\{[\s\S]*type:\s*"message"/,
    );
  });

  it("lobby transport supports guest auth and PM frames", () => {
    const transport = read("src/lib/lobby-irc-transport.ts");
    expect(transport).toContain("GuestGatewayAuth");
    expect(transport).toContain("pm.send");
    expect(transport).toContain("pm.message");
    expect(transport).toContain("isValidIrcUserId");
  });

  it("chat-store connects guests with gateway token", () => {
    const store = read("src/lib/chat-store.tsx");
    expect(store).toContain("gatewayToken");
    expect(store).toContain("handleLobbyIrcPmRef");
    expect(store).toContain("startIrcPm");
  });

  it("IRC presence updates room members without synthetic PresenceFeed for IRC rooms", () => {
    const presence = read("src/components/chat/PresenceFeed.tsx");
    expect(presence).toContain("usesIrcLive(channelId)) return");
    const store = read("src/lib/chat-store.tsx");
    expect(store).toContain('event.event === "join"');
    expect(store).toContain("memberIdForIrcEntry");
    expect(store).toContain("handleLobbyIrcNamesRef");
  });

  it("guest session returns signed gateway token", () => {
    const fn = read("src/lib/guest-chat.functions.ts");
    expect(fn).toContain("signGuestGatewayToken");
    expect(fn).toContain("gatewayToken");
  });
});
