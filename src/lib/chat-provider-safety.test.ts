import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));

describe("chat provider safety", () => {
  it("does not throw on rooms missing members during badge/streak/profile merge", () => {
    const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(src).toMatch(/r\?\.members\?\.includes\("me"\)/);
    expect(src).toMatch(/!\(r\.members \?\? \[\]\)\.includes\(b\)/);
    expect(src).toMatch(/s\.users\?\.me/);
    expect(src).toMatch(/state\.dmOrder \?\? \[\]/);
  });

  it("ChatErrorBoundary offers retry after a render throw", () => {
    const src = readFileSync(resolve(testDir, "../components/ChatErrorBoundary.tsx"), "utf8");
    expect(src).toMatch(/Try again/);
    expect(src).toMatch(/handleRetry/);
    expect(src).toMatch(/setState\(\{ error: null \}\)/);
  });

  it("Avatar does not slice a null username", () => {
    const src = readFileSync(resolve(testDir, "../components/chat/Avatar.tsx"), "utf8");
    expect(src).toMatch(/user\.name \|\| "\?"/);
  });
});

function sliceBetween(src: string, startToken: string, endToken: string): string {
  const start = src.indexOf(startToken);
  const end = src.indexOf(endToken, start + startToken.length);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return src.slice(start, end);
}

describe("opening a DM must not trip the Chatrooms error boundary", () => {
  const dock = readFileSync(resolve(testDir, "../components/chat/FloatingDMDock.tsx"), "utf8");
  const chatApp = readFileSync(resolve(testDir, "../components/chat/ChatApp.tsx"), "utf8");
  const header = readFileSync(resolve(testDir, "../components/chat/ChatHeader.tsx"), "utf8");
  const chatroomRoute = readFileSync(resolve(testDir, "../routes/chatroom.tsx"), "utf8");

  it("MiniDMWindow runs useTyping / useState / useServerFn before any missing-peer return", () => {
    const mini = sliceBetween(dock, "function MiniDMWindow(", "function openMiniDM(");
    const earlyReturn = mini.search(/if\s*\(\s*!channelId\s*\|\|\s*!u\s*\)\s*return\s+null/);
    expect(earlyReturn).toBeGreaterThan(-1);
    expect(mini.indexOf("useTyping(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useTyping(")).toBeLessThan(earlyReturn);
    expect(mini.indexOf("useState(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useState(")).toBeLessThan(earlyReturn);
    expect(mini.indexOf("useServerFn(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useServerFn(")).toBeLessThan(earlyReturn);
    expect(mini.indexOf("useRemoteProfiles(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useRemoteProfiles(")).toBeLessThan(earlyReturn);
  });

  it("desktop mini-DM and the main message pane are isolated so a DM throw cannot blank /chatroom", () => {
    expect(chatApp).toMatch(/ChatErrorBoundary label="floating-dm"/);
    expect(chatApp).toMatch(/<FloatingDMDock \/>/);
    expect(chatApp).toMatch(/ChatErrorBoundary label="chat-messages"/);
    expect(chatApp).toMatch(/<ChatChannelBody /);
    expect(chatApp).toMatch(/ChatErrorBoundary label="chat-header"/);
    expect(chatroomRoute).toContain('section="Chatrooms"');
    expect(chatroomRoute).not.toContain("Something went wrong. The Chatrooms section hit a problem.");
  });

  it("full-page DM header stays mounted when the peer is not yet in chat-store.users", () => {
    const dmBranch = sliceBetween(header, "if (isDM(id)) {", "const room = state.rooms[id];");
    expect(dmBranch).not.toMatch(/if\s*\(\s*!u\s*\)\s*return\s+null/);
    expect(dmBranch).toContain("Direct message");
    expect(dmBranch).toContain("DMWallpaperSheet");
  });

  it("public rooms still render ChatChannelBody for non-DM channels", () => {
    expect(chatApp).toContain("activeIsDM={activeIsDM}");
    expect(chatApp).toContain("{!isDM(state.activeChannel) && (");
    expect(chatApp).toContain("<MembersPanel");
  });
});

