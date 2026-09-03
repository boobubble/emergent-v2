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

  it("MiniDMWindow fetches the DM thread even when the peer comes from remote profiles", () => {
    const mini = sliceBetween(dock, "function MiniDMWindow(", "function openMiniDM(");
    const earlyReturn = mini.search(/if\s*\(\s*!channelId\s*\|\|\s*!u\s*\)\s*return\s+null/);
    expect(earlyReturn).toBeGreaterThan(-1);
    expect(mini).toContain("resolveMiniDmPeer(");
    expect(mini).toContain("watchRemoteChannel(channelId)");
    expect(mini.indexOf("watchRemoteChannel(channelId)")).toBeLessThan(earlyReturn);
    expect(mini).toContain("useRemoteProfiles(");
    expect(mini.indexOf("useServerFn(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useServerFn(")).toBeLessThan(earlyReturn);
    expect(mini.indexOf("useState(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useState(")).toBeLessThan(earlyReturn);
    expect(mini).toContain("<MessageInput");
    expect(mini).toContain("channelId={channelId}");
    expect(mini).not.toContain('setText(t => t + "😊")');
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

  it("MessageList resolves authors from remote profiles and does not crash on incomplete rows", () => {
    const list = readFileSync(resolve(testDir, "../components/chat/MessageList.tsx"), "utf8");
    expect(list).toContain("useRemoteProfiles");
    expect(list).toContain("filterChatMessages");
    expect(list).toContain("resolveMessageAuthor");
    expect(list).toContain("useGuestLobbyFeed(channelId === GUEST_LOBBY_CHANNEL_ID)");
    expect(list).not.toContain("useGuestLobbyFeed(true)");
  });

  it("history fetch includes watched mini-DM channels, not only activeChannel", () => {
    const store = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(store).toContain("extraRemoteDmChannelsToFetch");
    expect(store).toContain("watchedRemoteChannels");
    expect(store).toContain("watchRemoteChannel");
  });

  it("public rooms still render ChatChannelBody for non-DM channels", () => {
    expect(chatApp).toContain("activeIsDM={activeIsDM}");
    expect(chatApp).toContain("{!isDM(state.activeChannel) && (");
    expect(chatApp).toContain("<MembersPanel");
  });

  it("DM composers reuse public-room emoji, stickers, and voice (not a dummy 😊 insert)", () => {
    const input = readFileSync(resolve(testDir, "../components/chat/MessageInput.tsx"), "utf8");
    const feed = readFileSync(resolve(testDir, "../components/feed/FeedDMDock.tsx"), "utf8");
    expect(input).toContain('aria-label="Animated stickers"');
    expect(input).toContain('aria-label="Voice note"');
    expect(input).toContain('aria-label="Emoji"');
    expect(input).toContain("AnimatedEmojiPicker");
    expect(input).toContain("VoiceRecorder");
    expect(input).toContain("maxDurationForChannel(channelId");
    expect(input).toContain("channelIdProp");
    expect(input).toMatch(/data-chat-composer=\{compact \? "dm" : "room"\}/);
    expect(input).not.toMatch(/if\s*\(\s*isDM\([^)]*\)\s*\)\s*return\s+null/);
    expect(chatApp).toContain("<MessageInput />");
    expect(feed).toContain("<MessageInput />");
    expect(dock).toContain("<MessageInput");
    expect(dock).toContain("channelId={channelId}");
  });
});

describe("profile popup and composer pickers close after their action", () => {
  it("opening a DM from ProfilePopup also dismisses the profile dialog", () => {
    const popup = readFileSync(resolve(testDir, "../components/chat/ProfilePopup.tsx"), "utf8");
    const messageAction = sliceBetween(
      popup,
      "const isMobile = typeof window !== \"undefined\" && window.matchMedia(\"(max-width: 767px)\").matches;",
      "<MessageCircle className=\"h-4 w-4 shrink-0\" /> Message",
    );
    expect(messageAction).toContain("startDM(userId)");
    expect(messageAction).toContain("palrgo:openMiniDM");
    expect(messageAction).toContain('closeNow("action")');
    expect(messageAction.indexOf("palrgo:openMiniDM")).toBeLessThan(messageAction.indexOf('closeNow("action")'));
  });

  it("chatroom profile opens share one ProfilePopup host (member list, message names)", () => {
    const userMenu = readFileSync(resolve(testDir, "../components/chat/UserMenu.tsx"), "utf8");
    const host = readFileSync(resolve(testDir, "../components/chat/ChatProfilePopupHost.tsx"), "utf8");
    const app = readFileSync(resolve(testDir, "../components/chat/ChatApp.tsx"), "utf8");
    expect(userMenu).toContain("openProfile(userId)");
    expect(host).toContain("<ProfilePopup");
    expect(host).toContain("onClose={closeProfile}");
    expect(app).toContain("<ChatProfilePopupHost");
  });

  it("emoji and sticker pickers close on select in MessageInput (rooms and mini-DMs share this composer)", () => {
    const picker = readFileSync(resolve(testDir, "../components/chat/EmojiPicker.tsx"), "utf8");
    const stickers = readFileSync(resolve(testDir, "../components/chat/AnimatedEmojiPicker.tsx"), "utf8");
    const input = readFileSync(resolve(testDir, "../components/chat/MessageInput.tsx"), "utf8");
    const trio = readFileSync(resolve(testDir, "../components/chat/TrioRoomsDock.tsx"), "utf8");
    expect(picker).toContain("onClose?.()");
    expect(stickers).toContain("onClose?.()");
    expect(input).toContain("onClose={() => { markPickerJustClosed(); closeComposerPickers(); }}");
    expect(input).toContain("pickerToggleIsSuppressed()");
    expect(trio).toContain("onClose={() => setShowEmoji(false)}");
  });
});

