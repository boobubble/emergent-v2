import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IrcChatTransport } from "./transport";
import { parseGatewayEvent, parseGatewayFrame } from "./protocol";
import {
  authOkFrame,
  guestAuth,
  latestSocket,
  MockWebSocket,
  parseAuthFrame,
  resetMockWs,
  teardownMockWs,
} from "./test-utils";

describe("irc-chat protocol parsing", () => {
  it("parses authenticated lifecycle frames", () => {
    const frame = parseGatewayFrame(
      authOkFrame("uuid-user-1", "Alice"),
    );
    expect(parseGatewayEvent(frame!)).toEqual({
      kind: "authenticated",
      userId: "uuid-user-1",
      ircNick: "Alice",
    });
  });
});

describe("IrcChatTransport auth", () => {
  beforeEach(resetMockWs);
  afterEach(teardownMockWs);

  it("registered WS auth uses freshly resolved token per socket", async () => {
    const transport = new IrcChatTransport();
    const resolveToken = vi.fn(async () => "fresh-token-1");
    const statuses: string[] = [];

    transport.connect(
      "wss://ws.yaarzo.com",
      { kind: "registered", resolveToken },
      { onStatus: (s) => statuses.push(s) },
    );

    latestSocket().open();
    await vi.waitFor(() => expect(resolveToken).toHaveBeenCalledTimes(1));

    const authFrame = latestSocket().sent.map(parseAuthFrame).find((f) => f.type === "auth");
    expect(authFrame?.token).toBe("fresh-token-1");
    expect(authFrame?.guest).toBeUndefined();
  });

  it("reconnect resolves token again with a new value", async () => {
    const transport = new IrcChatTransport();
    let tokenVersion = 0;
    const resolveToken = vi.fn(async () => {
      tokenVersion += 1;
      return `fresh-token-${tokenVersion}`;
    });

    transport.connect("wss://ws.yaarzo.com", { kind: "registered", resolveToken }, {});

    latestSocket().open();
    await vi.waitFor(() => expect(resolveToken).toHaveBeenCalledTimes(1));

    latestSocket().close();
    await vi.runOnlyPendingTimersAsync();
    latestSocket().open();
    await vi.waitFor(() => expect(resolveToken).toHaveBeenCalledTimes(2));

    const tokens = MockWebSocket.instances
      .flatMap((ws) => ws.sent.map(parseAuthFrame))
      .filter((f) => f.type === "auth")
      .map((f) => f.token);

    expect(tokens).toEqual(["fresh-token-1", "fresh-token-2"]);
  });

  it("guest auth sends guest bundle and skips registered resolver", async () => {
    const transport = new IrcChatTransport();
    const resolveToken = vi.fn(async () => "should-not-run");

    transport.connect(
      "wss://ws.yaarzo.com",
      { kind: "guest", guest: guestAuth },
      {},
    );

    latestSocket().open();
    await Promise.resolve();

    expect(resolveToken).not.toHaveBeenCalled();
    const authFrame = parseAuthFrame(latestSocket().sent[0]);
    expect(authFrame.type).toBe("auth");
    expect(authFrame.guest?.token).toBe("guest-hmac-token");
    expect(authFrame.token).toBeUndefined();
  });

  it("does not send auth when token resolution fails", async () => {
    const transport = new IrcChatTransport();
    const resolveToken = vi.fn(async () => null);

    transport.connect("wss://ws.yaarzo.com", { kind: "registered", resolveToken }, {});

    latestSocket().open();
    await vi.waitFor(() => expect(resolveToken).toHaveBeenCalledTimes(1));

    const authFrames = latestSocket().sent
      .map(parseAuthFrame)
      .filter((f) => f.type === "auth");
    expect(authFrames).toHaveLength(0);
  });

  it("stale async resolver cannot authenticate a replaced socket", async () => {
    const transport = new IrcChatTransport();
    let releaseFirst: ((value: string) => void) | null = null;
    const resolveToken = vi.fn(() => {
      if (!releaseFirst) {
        return new Promise<string>((resolve) => {
          releaseFirst = resolve;
        });
      }
      return Promise.resolve("token-new-socket");
    });

    transport.connect("wss://ws.yaarzo.com", { kind: "registered", resolveToken }, {});
    const firstSocket = latestSocket();
    firstSocket.open();

    transport.disconnect();
    transport.connect("wss://ws.yaarzo.com", { kind: "registered", resolveToken }, {});
    const secondSocket = latestSocket();
    secondSocket.open();
    await vi.waitFor(() => expect(resolveToken).toHaveBeenCalledTimes(2));

    releaseFirst?.("token-stale-socket");
    await Promise.resolve();

    expect(firstSocket.sent).toHaveLength(0);
    expect(
      secondSocket.sent.map(parseAuthFrame).find((f) => f.type === "auth")?.token,
    ).toBe("token-new-socket");
  });

  it("transitions to authenticated on gateway ack", () => {
    const transport = new IrcChatTransport();
    const statuses: string[] = [];

    transport.connect(
      "wss://ws.yaarzo.com",
      { kind: "guest", guest: guestAuth },
      { onStatus: (s) => statuses.push(s) },
    );
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    expect(transport.connected).toBe(true);
    expect(transport.nick).toBe("Ranjha");
    expect(transport.authenticatedUserId).toBe("visitor_test123");
    expect(statuses).toContain("authenticated");
  });
});
