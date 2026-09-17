import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IrcChatCore } from "./store";
import { computeIrcIdentityKey } from "./irc-runtime-identity";
import { reconcileIrcCore } from "./irc-runtime-lifecycle";
import { IrcChatTransport } from "./transport";
import {
  guestAuth,
  latestSocket,
  MockWebSocket,
  resetMockWs,
  teardownMockWs,
} from "./test-utils";

describe("computeIrcIdentityKey", () => {
  it("uses registered user id and ignores guest session", () => {
    expect(
      computeIrcIdentityKey(
        { id: "550e8400-e29b-41d4-a716-446655440000", isGuest: false },
        { visitorId: "visitor_x", displayName: "G", nickname: "n", gatewayToken: "t" },
      ),
    ).toBe("reg:550e8400-e29b-41d4-a716-446655440000");
  });

  it("uses guest visitor + gateway token without guest.enabled", () => {
    expect(
      computeIrcIdentityKey(null, {
        visitorId: "visitor_abc",
        displayName: "Guest-A",
        nickname: "A",
        gatewayToken: "hmac-token",
      }),
    ).toBe("gst:visitor_abc:hmac-token");
  });

  it("returns null when guest config would hide session but token missing", () => {
    expect(
      computeIrcIdentityKey(null, {
        visitorId: "visitor_abc",
        displayName: "Guest-A",
        nickname: "A",
      }),
    ).toBeNull();
  });
});

describe("reconcileIrcCore lifecycle", () => {
  let destroyed: IrcChatCore[];

  beforeEach(() => {
    destroyed = [];
    resetMockWs();
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    teardownMockWs();
    vi.unstubAllGlobals();
  });

  function makeGuestCore(): IrcChatCore {
    const core = new IrcChatCore({
      auth: { kind: "guest", guest: guestAuth },
      transport: new IrcChatTransport(),
    });
    core.connect();
    return core;
  }

  it("A: stable guest identity keeps one core across repeated reconcile", () => {
    const key = "gst:visitor_test:hmac";
    let core: IrcChatCore | null = null;
    let prev: string | null = null;

    for (let i = 0; i < 5; i += 1) {
      const result = reconcileIrcCore({
        nextIdentityKey: key,
        prevIdentityKey: prev,
        existingCore: core,
        createCore: makeGuestCore,
        destroyCore: (c) => {
          destroyed.push(c);
          c.disconnect();
        },
      });
      core = result.core;
      prev = result.identityKey;
      expect(result.created).toBe(i === 0);
    }

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(destroyed).toHaveLength(0);
  });

  it("B: guest config hydration flicker (null key then stable key) creates one socket", () => {
    const key = "gst:visitor_test:hmac";
    let core: IrcChatCore | null = null;
    let prev: string | null = null;

    const steps = [null, null, key, key, key] as const;
    for (const nextKey of steps) {
      const result = reconcileIrcCore({
        nextIdentityKey: nextKey,
        prevIdentityKey: prev,
        existingCore: core,
        createCore: makeGuestCore,
        destroyCore: (c) => {
          destroyed.push(c);
          c.disconnect();
        },
      });
      core = result.core;
      prev = result.identityKey;
    }

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("C: registered identity hydration null then user creates one core", () => {
    const key = "reg:user-1";
    let core: IrcChatCore | null = null;
    let prev: string | null = null;

    for (const nextKey of [null, key, key] as const) {
      const result = reconcileIrcCore({
        nextIdentityKey: nextKey,
        prevIdentityKey: prev,
        existingCore: core,
        createCore: () => {
          const instance = new IrcChatCore({
            auth: {
              kind: "registered",
              resolveToken: async () => "jwt-1",
            },
            transport: new IrcChatTransport(),
          });
          instance.connect();
          return instance;
        },
        destroyCore: (c) => {
          destroyed.push(c);
          c.disconnect();
        },
      });
      core = result.core;
      prev = result.identityKey;
    }

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("F: identity change replaces core once", () => {
    let core: IrcChatCore | null = null;
    let prev: string | null = null;

    const first = reconcileIrcCore({
      nextIdentityKey: "gst:visitor_a:token_a",
      prevIdentityKey: prev,
      existingCore: core,
      createCore: makeGuestCore,
      destroyCore: (c) => {
        destroyed.push(c);
        c.disconnect();
      },
    });
    core = first.core;
    prev = first.identityKey;

    const second = reconcileIrcCore({
      nextIdentityKey: "gst:visitor_b:token_b",
      prevIdentityKey: prev,
      existingCore: core,
      createCore: makeGuestCore,
      destroyCore: (c) => {
        destroyed.push(c);
        c.disconnect();
      },
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(true);
    expect(second.destroyed).toBe(true);
    expect(destroyed).toHaveLength(1);
    expect(MockWebSocket.instances).toHaveLength(2);
  });
});

describe("IrcChatTransport lifecycle (registered pending auth)", () => {
  beforeEach(resetMockWs);
  afterEach(teardownMockWs);

  it("D: disconnect while resolveToken is pending cannot authenticate stale socket", async () => {
    const transport = new IrcChatTransport();
    let release: ((value: string) => void) | null = null;
    const resolveToken = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          release = resolve;
        }),
    );

    transport.connect("wss://ws.yaarzo.com", { kind: "registered", resolveToken }, {});
    const socket = latestSocket();
    socket.open();

    transport.disconnect();
    release?.("stale-jwt");
    await Promise.resolve();

    const authFrames = socket.sent.filter((raw) => {
      try {
        return JSON.parse(raw).type === "auth";
      } catch {
        return false;
      }
    });
    expect(authFrames).toHaveLength(0);
  });

  it("E: manual disconnect does not schedule reconnect", async () => {
    vi.useFakeTimers();
    const transport = new IrcChatTransport();
    transport.connect(
      "wss://ws.yaarzo.com",
      { kind: "guest", guest: guestAuth },
      {},
    );
    latestSocket().open();
    transport.disconnect();
    latestSocket().close();

    await vi.runOnlyPendingTimersAsync();
    expect(MockWebSocket.instances).toHaveLength(1);
    vi.useRealTimers();
  });
});
