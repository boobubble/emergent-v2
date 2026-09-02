import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  CHAT_NOTIFICATION_ICON_PATH,
  chatNotificationIconUrl,
  claimChatNotifEvent,
  formatChatNotifBody,
  formatChatNotifTitle,
  isBotChatAuthor,
  resetChatNotifDedupeForTests,
  roomDisplayName,
  shouldNotifyChatMessage,
  shouldNotifyPresence,
  showChatBrowserNotification,
} from "./chat-browser-notifications";

type CapturedNotification = { title: string; options: NotificationOptions };

class FakeNotification {
  static permission: NotificationPermission = "granted";
  static instances: CapturedNotification[] = [];
  title: string;
  options: NotificationOptions;
  onclick: (() => void) | null = null;
  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options ?? {};
    FakeNotification.instances.push({ title, options: this.options });
  }
  close() {}
}

function installNotificationMock(origin = "https://yaarzo.com") {
  FakeNotification.instances = [];
  FakeNotification.permission = "granted";
  const storage = new Map<string, string>();
  const win = {
    location: { origin, pathname: "/chatroom" },
    Notification: FakeNotification,
    dispatchEvent: () => true,
    focus: () => {},
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => { storage.set(k, v); },
      removeItem: (k: string) => { storage.delete(k); },
    },
  };
  vi.stubGlobal("window", win);
  vi.stubGlobal("Notification", FakeNotification);
}

afterEach(() => {
  resetChatNotifDedupeForTests();
  vi.unstubAllGlobals();
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

  it("browser notif helper always sets the dedicated public icon, never the tab favicon", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const src = readFileSync(resolve(process.cwd(), "src/lib/chat-browser-notifications.ts"), "utf8");
    expect(src).toContain("CHAT_NOTIFICATION_ICON_PATH");
    expect(src).toContain('"/notification-icon.png"');
    expect(src).not.toContain('"/pwa-192.png"');
    expect(src).toMatch(/icon,/);
    expect(src).toMatch(/badge:/);
    expect(src).not.toMatch(/favicon-blue\.png/);
    expect(src).not.toMatch(/favicon-red\.png/);
    expect(existsSync(resolve(process.cwd(), "public/notification-icon.png"))).toBe(true);
  });
});

describe("notification icon URL", () => {
  it("uses the unhashed public path /notification-icon.png", () => {
    expect(CHAT_NOTIFICATION_ICON_PATH).toBe("/notification-icon.png");
  });

  it("resolves to origin + /notification-icon.png, not a relative path", () => {
    expect(chatNotificationIconUrl("https://yaarzo.com")).toBe("https://yaarzo.com/notification-icon.png");
    expect(chatNotificationIconUrl("https://yaarzo.com/chatroom")).toBe("https://yaarzo.com/notification-icon.png");
    expect(chatNotificationIconUrl("https://yaarzo.com/")).toBe("https://yaarzo.com/notification-icon.png");
  });

  it("never points at the tab favicon or PWA icon", () => {
    const url = chatNotificationIconUrl("https://yaarzo.com");
    expect(url).not.toContain("favicon-blue.png");
    expect(url).not.toContain("favicon-red.png");
    expect(url).not.toContain("pwa-192.png");
  });
});

describe("showChatBrowserNotification icon + copy", () => {
  function lastNotif() {
    expect(FakeNotification.instances.length).toBeGreaterThan(0);
    return FakeNotification.instances[FakeNotification.instances.length - 1]!;
  }

  function expectDedicatedIcon(options: NotificationOptions) {
    expect(options.icon).toBeTruthy();
    expect(String(options.icon)).toMatch(/\/notification-icon\.png$/);
    expect(String(options.icon)).toBe("https://yaarzo.com/notification-icon.png");
    expect(String(options.badge)).toBe("https://yaarzo.com/notification-icon.png");
    expect(String(options.icon)).not.toContain("favicon-blue.png");
    expect(String(options.icon)).not.toContain("favicon-red.png");
    expect(String(options.icon)).not.toContain("pwa-192.png");
  }

  it("sets title, body, and dedicated icon for a new chat message", () => {
    installNotificationMock();
    expect(showChatBrowserNotification({
      eventId: "msg:icon-1",
      kind: "message",
      channelId: "lobby",
      roomName: "Lobby",
      actorName: "Arman",
      preview: "hello there",
    })).toBe(true);
    const n = lastNotif();
    expect(n.title).toBe("New message in #Lobby");
    expect(n.options.body).toBe("Arman: hello there");
    expectDedicatedIcon(n.options);
  });

  it("sets title, body, and dedicated icon when a user joins", () => {
    installNotificationMock();
    expect(showChatBrowserNotification({
      eventId: "join:icon-1",
      kind: "join",
      channelId: "lobby",
      roomName: "Lobby",
      actorName: "Arman",
    })).toBe(true);
    const n = lastNotif();
    expect(n.title).toBe("Arman joined #Lobby");
    expect(n.options.body).toBeUndefined();
    expectDedicatedIcon(n.options);
  });

  it("sets title, body, and dedicated icon when a user leaves", () => {
    installNotificationMock();
    expect(showChatBrowserNotification({
      eventId: "leave:icon-1",
      kind: "leave",
      channelId: "games",
      roomName: "Games",
      actorName: "Kiran",
    })).toBe(true);
    const n = lastNotif();
    expect(n.title).toBe("Kiran left #Games");
    expect(n.options.body).toBeUndefined();
    expectDedicatedIcon(n.options);
  });
});
