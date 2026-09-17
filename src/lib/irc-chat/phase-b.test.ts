import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..", "..");

function readSrc(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("Phase B /chatroom IRC-first wiring", () => {
  it("chatroom route uses IrcChatApp and IrcChatRuntimeProvider, not legacy ChatApp", () => {
    const route = readSrc("routes/chatroom.tsx");
    expect(route).toContain("IrcChatApp");
    expect(route).toContain("IrcChatRuntimeProvider");
    expect(route).not.toMatch(/from\s+["']@\/lib\/chat-store["']/);
    expect(route).not.toMatch(/from\s+["']@\/components\/chat\/ChatApp["']/);
  });

  it("root shell skips legacy ChatProvider on /chatroom for auth and guest paths", () => {
    const rootRoute = readSrc("routes/__root.tsx");
    expect(rootRoute).toContain("isIrcChatroomPath");
    expect(rootRoute).toMatch(/requireChatProvider\s*=\s*![\s\S]*isIrcChatroomPath/);
    expect(rootRoute).toMatch(/useLegacyGuestChatShell[\s\S]*!isIrcChatroomPath/);
  });

  it("runtime provider refreshes Supabase session for registered IRC auth", () => {
    const runtime = readSrc("lib/irc-chat/runtime.tsx");
    expect(runtime).toContain("refreshSession");
    expect(runtime).toContain('kind: "registered"');
    expect(runtime).toContain('kind: "guest"');
    expect(runtime).not.toMatch(/from\s+["']@\/lib\/chat-store["']/);
  });

  it("guest runtime auth uses gateway HMAC token from guest session", () => {
    const runtime = readSrc("lib/irc-chat/runtime.tsx");
    expect(runtime).toContain("gatewayToken");
    expect(runtime).toContain("visitorId");
    expect(runtime).toContain("useGuestChat");
  });

  it("new IRC UI does not depend on chat-store or Supabase message transport", () => {
    const app = readSrc("components/irc-chat/IrcChatApp.tsx");
    const gate = readSrc("components/irc-chat/IrcChatGuestGate.tsx");
    for (const src of [app, gate]) {
      expect(src).not.toMatch(/from\s+["']@\/lib\/chat-store["']/);
      expect(src).not.toMatch(/guest_chat_messages/);
      expect(src).not.toMatch(/useGuestLobbyFeed/);
      expect(src).not.toMatch(/__public__/);
      expect(src).not.toMatch(/\bWatchTogether\b/);
      expect(src).not.toMatch(/\bGameRoom\b/);
    }
  });

  it("connection label helper maps IRC core statuses for UI", () => {
    const helper = readSrc("lib/irc-chat/connection-label.ts");
    expect(helper).toContain('"Connecting"');
    expect(helper).toContain('"Connected"');
    expect(helper).toContain('"Reconnecting"');
    expect(helper).toContain('"Disconnected"');
  });
});
