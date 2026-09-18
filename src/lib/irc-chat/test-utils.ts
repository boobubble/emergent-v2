import { vi } from "vitest";
import type { IrcChatGuestAuth } from "./auth";

type WsHandler = ((event?: unknown) => void) | null;

export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  url: string;
  readyState = MockWebSocket.CONNECTING;
  readonly sent: string[] = [];
  private listeners: Record<string, WsHandler> = {};

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, handler: WsHandler): void {
    this.listeners[type] = handler;
  }

  removeEventListener(type: string): void {
    if (this.listeners[type]) this.listeners[type] = null;
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.listeners.close?.({});
  }

  open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.listeners.open?.({});
  }

  emitMessage(raw: string): void {
    this.listeners.message?.({ data: raw });
  }
}

export const guestAuth: IrcChatGuestAuth = {
  visitorId: "visitor_test123",
  displayName: "Guest-Ranjha",
  nickname: "Ranjha",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  token: "guest-hmac-token",
};

export function parseAuthFrame(raw: string) {
  return JSON.parse(raw) as { type?: string; token?: string; guest?: IrcChatGuestAuth };
}

export function latestSocket(): MockWebSocket {
  const ws = MockWebSocket.instances.at(-1);
  if (!ws) throw new Error("no mock websocket");
  return ws;
}

export function resetMockWs(): void {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.useFakeTimers();
}

export function teardownMockWs(): void {
  vi.useRealTimers();
  vi.unstubAllGlobals();
}

export function authOkFrame(userId: string, ircNick: string): string {
  return JSON.stringify({
    type: "gateway",
    event: "authenticated",
    userId,
    ircNick,
  });
}

export function namesFrame(
  room: string,
  members: Array<{ nick: string; userId: string; isGuest?: boolean }>,
): string {
  return JSON.stringify({ type: "room.names", room, members });
}

export function roomJoinedFrame(room: string): string {
  return JSON.stringify({ type: "room.joined", room });
}

export function roomPartedFrame(room: string): string {
  return JSON.stringify({ type: "room.parted", room });
}

export function parseRoomSwitchFrame(raw: string) {
  return JSON.parse(raw) as { type?: string; room?: string };
}

export function publicMessageFrame(opts: {
  room: string;
  messageId: string;
  nick: string;
  userId: string;
  text: string;
}): string {
  return JSON.stringify({ type: "message", ...opts });
}

export function publicSentFrame(opts: {
  room: string;
  messageId: string;
  nick: string;
  userId: string;
  text: string;
}): string {
  return JSON.stringify({ type: "message.sent", ...opts });
}

export function pmMessageFrame(opts: {
  messageId: string;
  nick: string;
  text: string;
}): string {
  return JSON.stringify({ type: "pm.message", ...opts });
}

export function pmSentFrame(opts: {
  messageId: string;
  recipientNick: string;
  text: string;
}): string {
  return JSON.stringify({ type: "pm.sent", ...opts });
}

export function ircJoinLineFrame(room: string, nick: string): string {
  const channel = room.startsWith("#") ? room : `#${room}`;
  return JSON.stringify({
    type: "irc",
    line: `:${nick}!guest@yaarzo JOIN ${channel}`,
  });
}
