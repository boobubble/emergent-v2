import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  YAARZO_OPEN_DM_INBOX_EVENT,
  YAARZO_OPEN_MINI_DM_EVENT,
} from "./yaarzo-dm-events";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), "src", rel), "utf8");
}

describe("yaarzo-dm-events", () => {
  it("exports stable custom event names", () => {
    expect(YAARZO_OPEN_DM_INBOX_EVENT).toBe("palrgo:openYaarzoDmInbox");
    expect(YAARZO_OPEN_MINI_DM_EVENT).toBe("palrgo:openMiniDM");
  });

  it("ChatroomYaarzoDmHost reuses FeedDMDock and listens for open events", () => {
    const host = read("components/codychat/ChatroomYaarzoDmHost.tsx");
    expect(host).toContain("FeedDMDock");
    expect(host).toContain("YAARZO_OPEN_DM_INBOX_EVENT");
    expect(host).toContain("YAARZO_OPEN_MINI_DM_EVENT");
    expect(host).toContain("startDM");
  });

  it("FeedDMDock wraps MessageList/UserMenu under ProfilePopupProvider for /chatroom DM", () => {
    const dock = read("components/feed/FeedDMDock.tsx");
    const host = read("components/codychat/ChatroomYaarzoDmHost.tsx");
    const chatApp = read("components/chat/ChatApp.tsx");

    expect(dock).toMatch(/<ProfilePopupProvider>[\s\S]*<YouTubePlayerProvider>[\s\S]*<FeedDMDockInner/);
    expect(dock).toContain("<YouTubePlayerProvider>");
    expect(dock).toContain("<ChatProfilePopupHost />");
    expect(dock).toContain("<MessageList channelId={state.activeChannel} />");
    expect(dock).toContain("<MessageInput />");
    expect(host).toContain("<FeedDMDock");
    expect(host).not.toContain("ProfilePopupProvider");
    expect(host).not.toContain("YouTubePlayerProvider");
    expect(chatApp).toMatch(/<ProfilePopupProvider>[\s\S]*<YouTubePlayerProvider>/);
    expect(chatApp).not.toContain("FeedDMDock");
  });

  it("chatroom sidebar Direct Messages opens Yaarzo inbox", () => {
    const nav = read("components/codychat/CodyChatSidebarNav.tsx");
    expect(nav).toContain("openYaarzoDmInbox");
    expect(nav).toContain('label: "Direct Messages"');
    expect(nav).not.toMatch(/Direct Messages[\s\S]{0,80}shellPanel:\s*"feed"/);
  });

  it("/chatroom enables root ChatProvider for Supabase DMs", () => {
    const root = read("routes/__root.tsx");
    expect(root).toContain("const requireChatProvider = !isCommunityNonChatPath(path);");
    expect(root).not.toContain("!isIrcChatroomPath(path)");
  });
});
