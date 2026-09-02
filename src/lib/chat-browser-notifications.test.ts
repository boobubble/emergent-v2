import { afterEach, describe, expect, it } from "vitest";
import {
  claimChatNotifEvent,
  formatChatNotifBody,
  formatChatNotifTitle,
  isBotChatAuthor,
  resetChatNotifDedupeForTests,
  roomDisplayName,
  shouldNotifyChatMessage,
  shouldNotifyPresence,
} from "./chat-browser-notifications";

afterEach(() => {
  resetChatNotifDedupeForTests();
});

describe("chat browser notification copy", () => {
  it("formats message title and preview with the correct room", () => {
    expect(formatChatNotifTitle("message", "Lobby")).toBe("New message in #Lobby");
    expect(formatChatNotifTitle("message", "Games")).toBe("New message in #Games");
    expect(formatChatNotifBody({
      eventId: "m1",
      kind: "message",
      channelId: "lobby",
      roomName: "Lobby",
      actorName: "Arman",
      preview: "hello there",
    })).toBe("Arman: hello there");
  });

  it("formats join/leave as Username joined/left #Room", () => {
    expect(formatChatNotifBody({
      eventId: "j1",
      kind: "join",
      channelId: "lobby",
      roomName: "Lobby",
      actorName: "Arman",
    })).toBe("Arman joined #Lobby");
    expect(formatChatNotifBody({
      eventId: "l1",
      kind: "leave",
      channelId: "games",
      roomName: "Games",
      actorName: "Kiran",
    })).toBe("Kiran left #Games");
  });

  it("strips a leading hash from room names", () => {
    expect(roomDisplayName("lobby", "#Lobby")).toBe("Lobby");
  });
});

describe("self / bot / room filters", () => {
  it("never notifies for own messages", () => {
    expect(shouldNotifyChatMessage({
      authorId: "me",
      channelId: "lobby",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(false);
  });

  it("never notifies for bots or system lines", () => {
    expect(isBotChatAuthor("bot-echo")).toBe(true);
    expect(shouldNotifyChatMessage({
      authorId: "bot-echo",
      channelId: "lobby",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(false);
    expect(shouldNotifyChatMessage({
      authorId: "bot-gamebot",
      channelId: "games",
      kind: "text",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(false);
    expect(shouldNotifyChatMessage({
      authorId: "41af93bf-d960-44db-820d-1a50d681f6d2",
      channelId: "lobby",
      kind: "system",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(false);
  });

  it("notifies for another user's room message", () => {
    expect(shouldNotifyChatMessage({
      authorId: "41af93bf-d960-44db-820d-1a50d681f6d2",
      channelId: "lobby",
      kind: "text",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(true);
  });

  it("does not notify guests or DM traffic", () => {
    expect(shouldNotifyChatMessage({
      authorId: "41af93bf-d960-44db-820d-1a50d681f6d2",
      channelId: "lobby",
      authUserId: null,
    })).toBe(false);
    expect(shouldNotifyChatMessage({
      authorId: "41af93bf-d960-44db-820d-1a50d681f6d2",
      channelId: "dm:a:b",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(false);
  });

  it("allows presence notify for named real users only when signed in", () => {
    expect(shouldNotifyPresence({
      userName: "Arman",
      channelId: "lobby",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(true);
    expect(shouldNotifyPresence({
      userName: "Arman",
      channelId: "lobby",
      authUserId: null,
    })).toBe(false);
    expect(shouldNotifyPresence({
      userName: "   ",
      channelId: "lobby",
      authUserId: "550e8400-e29b-41d4-a716-446655440000",
    })).toBe(false);
  });
});

describe("duplicate protection", () => {
  it("claims an event only once", () => {
    expect(claimChatNotifEvent("msg:abc")).toBe(true);
    expect(claimChatNotifEvent("msg:abc")).toBe(false);
  });
});

describe("source wiring", () => {
  it("chat-store INSERT path uses the browser notif helper and skips own/bot", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const store = readFileSync(resolve(process.cwd(), "src/lib/chat-store.tsx"), "utf8");
    const presence = readFileSync(resolve(process.cwd(), "src/components/chat/PresenceFeed.tsx"), "utf8");
    const header = readFileSync(resolve(process.cwd(), "src/components/chat/ChatHeader.tsx"), "utf8");
    expect(store).toContain("showChatBrowserNotification");
    expect(store).toContain("shouldNotifyChatMessage");
    expect(store).not.toMatch(/new Notification\(/);
    expect(presence).toContain("return null");
    expect(presence).not.toContain("presence-msg");
    expect(presence).not.toContain("toast(");
    expect(header).toContain("requestChatNotificationPermission");
  });
});
