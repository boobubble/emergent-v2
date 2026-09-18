import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IrcChatCore } from "./store";
import { IrcChatTransport } from "./transport";
import { IRC_CHAT_PRODUCT_ROOM } from "./constants";
import { classifyPmPeer } from "./dm";
import {
  applyPresenceEvent,
  applyRoomNamesSnapshot,
  presenceDedupKey,
  shouldSkipPresenceDedup,
} from "./membership";
import {
  authOkFrame,
  guestAuth,
  latestSocket,
  namesFrame,
  pmMessageFrame,
  pmSentFrame,
  publicMessageFrame,
  publicSentFrame,
  resetMockWs,
  teardownMockWs,
} from "./test-utils";

describe("irc-chat membership", () => {
  it("replaces members on NAMES snapshot with dedup", () => {
    const snapshot = applyRoomNamesSnapshot([], [
      { nick: "A", userId: "uuid-a" },
      { nick: "B", userId: "visitor_b", isGuest: true },
      { nick: "A-dup", userId: "uuid-a" },
    ]);
    expect(snapshot).toHaveLength(2);
    expect(snapshot.map((m) => m.userId)).toEqual(["uuid-a", "visitor_b"]);
  });

  it("applies JOIN/PART/QUIT/KICK/NICK presence", () => {
    let members = applyRoomNamesSnapshot([], [
      { nick: "Old", userId: "irc:Old" },
    ]);
    members = applyPresenceEvent(members, {
      room: IRC_CHAT_PRODUCT_ROOM,
      event: "join",
      nick: "New",
    }, IRC_CHAT_PRODUCT_ROOM);
    expect(members.some((m) => m.nick === "New")).toBe(true);

    members = applyPresenceEvent(members, {
      room: IRC_CHAT_PRODUCT_ROOM,
      event: "part",
      nick: "Old",
    }, IRC_CHAT_PRODUCT_ROOM);
    expect(members.some((m) => m.nick === "Old")).toBe(false);

    members = applyPresenceEvent(members, {
      room: IRC_CHAT_PRODUCT_ROOM,
      event: "nick",
      nick: "New",
      newNick: "Renamed",
    }, IRC_CHAT_PRODUCT_ROOM);
    expect(members.some((m) => m.nick === "Renamed")).toBe(true);
  });

  it("dedups rapid duplicate presence events", () => {
    const dedup = new Map<string, number>();
    const event = {
      room: IRC_CHAT_PRODUCT_ROOM,
      event: "join" as const,
      nick: "Alice",
    };
    const key = presenceDedupKey(event, IRC_CHAT_PRODUCT_ROOM);
    expect(shouldSkipPresenceDedup(dedup, key, 1000)).toBe(false);
    expect(shouldSkipPresenceDedup(dedup, key, 1200)).toBe(true);
    expect(shouldSkipPresenceDedup(dedup, key, 2600)).toBe(false);
  });
});

describe("irc-chat PM peer types", () => {
  it("classifies registered, guest, and IRC nick peers", () => {
    expect(classifyPmPeer({ userId: "550e8400-e29b-41d4-a716-446655440000" })).toBe(
      "registered",
    );
    expect(classifyPmPeer({ userId: "visitor_x", isGuest: true })).toBe("guest");
    expect(classifyPmPeer({ userId: "irc:SomeNick" })).toBe("irc_nick");
  });
});

describe("IrcChatCore integration", () => {
  beforeEach(resetMockWs);
  afterEach(teardownMockWs);

  function createCore(auth: Parameters<IrcChatTransport["connect"]>[1]) {
    const transport = new IrcChatTransport();
    transport.setKnownRoomIds([IRC_CHAT_PRODUCT_ROOM]);
    const core = new IrcChatCore({
      wsUrl: "wss://ws.yaarzo.com",
      roomsUrl: "https://ws.yaarzo.com/rooms",
      auth,
      transport,
      fetchImpl: vi.fn(async () => ({
        ok: true,
        json: async () => ({
          ok: true,
          primaryRoom: IRC_CHAT_PRODUCT_ROOM,
          rooms: [{ room: IRC_CHAT_PRODUCT_ROOM, users: 3 }],
        }),
      })) as unknown as typeof fetch,
    });
    return { core, transport };
  }

  it("discovers rooms and joins product room after authentication", async () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    await core.discoverRooms();

    expect(core.getState().rooms[IRC_CHAT_PRODUCT_ROOM]).toBeDefined();
    expect(
      latestSocket().sent.some((raw) => {
        const frame = JSON.parse(raw) as { type?: string; room?: string };
        return frame.type === "room.join" && frame.room === IRC_CHAT_PRODUCT_ROOM;
      }),
    ).toBe(true);
  });

  it("stores NAMES members for joined room", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));
    latestSocket().emitMessage(
      namesFrame(IRC_CHAT_PRODUCT_ROOM, [
        { nick: "Alice", userId: "550e8400-e29b-41d4-a716-446655440000" },
        { nick: "Guest-B", userId: "visitor_b", isGuest: true },
      ]),
    );

    const members = core.getState().members[IRC_CHAT_PRODUCT_ROOM];
    expect(members).toHaveLength(2);
  });

  it("dedups own public messages by messageId across sent ack and IRC echo", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    const sentId = core.sendPublicMessage("hello");
    expect(sentId).toBeTruthy();

    latestSocket().emitMessage(
      publicSentFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: sentId!,
        nick: "Ranjha",
        userId: "visitor_test123",
        text: "hello",
      }),
    );
    latestSocket().emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: sentId!,
        nick: "Ranjha",
        userId: "visitor_test123",
        text: "hello",
      }),
    );

    const msgs = core.getState().messages[IRC_CHAT_PRODUCT_ROOM] ?? [];
    expect(msgs.filter((m) => m.id === sentId)).toHaveLength(1);
    expect(msgs[0]?.pending).toBe(false);
  });

  it("receives peer public messages", () => {
    const messageId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));
    latestSocket().emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId,
        nick: "Alice",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        text: "hi there",
      }),
    );

    const msgs = core.getState().messages[IRC_CHAT_PRODUCT_ROOM] ?? [];
    expect(msgs.some((m) => m.id === messageId && m.text === "hi there")).toBe(true);
  });

  it("handles IRC PM for registered, guest, and nick-keyed peers", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    const registeredPm = "11111111-1111-4111-8111-111111111111";
    const guestPm = "22222222-2222-4222-8222-222222222222";
    const nickPm = "33333333-3333-4333-8333-333333333333";

    latestSocket().emitMessage(
      pmMessageFrame({ messageId: registeredPm, nick: "RegUser", text: "reg dm" }),
    );
    latestSocket().emitMessage(
      pmMessageFrame({ messageId: guestPm, nick: "Guest-X", text: "guest dm" }),
    );
    latestSocket().emitMessage(
      pmMessageFrame({ messageId: nickPm, nick: "IrcOnly", text: "irc dm" }),
    );

    const pms = core.getState().privateMessages;
    expect(pms["ircpm:RegUser"]?.some((m) => m.id === registeredPm)).toBe(true);
    expect(pms["ircpm:Guest-X"]?.some((m) => m.id === guestPm)).toBe(true);
    expect(pms["ircpm:IrcOnly"]?.some((m) => m.id === nickPm)).toBe(true);
  });

  it("confirms outgoing PM on pm.sent", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    const messageId = "44444444-4444-4444-8444-444444444444";
    core.sendPrivateMessage("Peer", "test pm");
    const sent = latestSocket().sent
      .map((raw) => JSON.parse(raw) as { type?: string; messageId?: string })
      .find((f) => f.type === "pm.send");
    expect(sent?.messageId).toBeTruthy();

    latestSocket().emitMessage(
      pmSentFrame({
        messageId: sent!.messageId!,
        recipientNick: "Peer",
        text: "test pm",
      }),
    );

    const channel = `ircpm:Peer`;
    const msg = core.getState().privateMessages[channel]?.find(
      (m) => m.id === sent!.messageId,
    );
    expect(msg?.pending).toBe(false);
  });

  it("reconnect uses fresh registered token via core transport", async () => {
    let tokenVersion = 0;
    const resolveToken = vi.fn(async () => {
      tokenVersion += 1;
      return `jwt-${tokenVersion}`;
    });
    const { core } = createCore({ kind: "registered", resolveToken });
    core.connect();

    latestSocket().open();
    await vi.waitFor(() => expect(resolveToken).toHaveBeenCalledTimes(1));

    latestSocket().close();
    await vi.runOnlyPendingTimersAsync();
    latestSocket().open();
    await vi.waitFor(() => expect(resolveToken).toHaveBeenCalledTimes(2));
  });
});

describe("IrcChatCore incoming PM acceptance", () => {
  beforeEach(resetMockWs);
  afterEach(teardownMockWs);

  function createCore(auth: Parameters<IrcChatTransport["connect"]>[1]) {
    const transport = new IrcChatTransport();
    transport.setKnownRoomIds([IRC_CHAT_PRODUCT_ROOM]);
    const core = new IrcChatCore({
      wsUrl: "wss://ws.yaarzo.com",
      auth,
      transport,
    });
    return { core, transport };
  }

  function authGuest(core: IrcChatCore) {
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));
  }

  it("accepts incoming PM by default", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    authGuest(core);
    const messageId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    latestSocket().emitMessage(
      pmMessageFrame({ messageId, nick: "Peer", text: "hello" }),
    );
    expect(core.getState().privateMessages["ircpm:Peer"]?.some((m) => m.id === messageId)).toBe(
      true,
    );
  });

  it("drops incoming PM when disabled without clearing history", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    authGuest(core);
    const first = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    latestSocket().emitMessage(pmMessageFrame({ messageId: first, nick: "Peer", text: "keep" }));
    expect(core.getState().privateMessages["ircpm:Peer"]?.length).toBe(1);

    core.setIncomingPmEnabled(false);
    const blocked = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    latestSocket().emitMessage(
      pmMessageFrame({ messageId: blocked, nick: "Peer", text: "blocked" }),
    );
    expect(core.getState().privateMessages["ircpm:Peer"]?.length).toBe(1);
    expect(
      core.getState().privateMessages["ircpm:Peer"]?.some((m) => m.id === blocked),
    ).toBe(false);
  });

  it("accepts incoming PM again after re-enable", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    authGuest(core);
    core.setIncomingPmEnabled(false);
    const messageId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    latestSocket().emitMessage(
      pmMessageFrame({ messageId, nick: "Peer", text: "retry" }),
    );
    expect(core.getState().privateMessages["ircpm:Peer"]).toBeUndefined();

    core.setIncomingPmEnabled(true);
    latestSocket().emitMessage(
      pmMessageFrame({ messageId, nick: "Peer", text: "retry" }),
    );
    expect(core.getState().privateMessages["ircpm:Peer"]?.some((m) => m.id === messageId)).toBe(
      true,
    );
  });

  it("does not block public messages when incoming PM is disabled", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    authGuest(core);
    core.setIncomingPmEnabled(false);
    const messageId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
    latestSocket().emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId,
        nick: "Alice",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        text: "public hi",
      }),
    );
    const msgs = core.getState().messages[IRC_CHAT_PRODUCT_ROOM] ?? [];
    expect(msgs.some((m) => m.id === messageId)).toBe(true);
  });

  it("still confirms outgoing PM on pm_sent when incoming PM is disabled", () => {
    const { core } = createCore({ kind: "guest", guest: guestAuth });
    authGuest(core);
    core.setIncomingPmEnabled(false);
    core.sendPrivateMessage("Peer", "outgoing");
    const sent = latestSocket().sent
      .map((raw) => JSON.parse(raw) as { type?: string; messageId?: string })
      .find((f) => f.type === "pm.send");
    expect(sent?.messageId).toBeTruthy();
    latestSocket().emitMessage(
      pmSentFrame({
        messageId: sent!.messageId!,
        recipientNick: "Peer",
        text: "outgoing",
      }),
    );
    const msg = core.getState().privateMessages["ircpm:Peer"]?.find(
      (m) => m.id === sent!.messageId,
    );
    expect(msg?.pending).toBe(false);
  });

  it("does not reconnect when toggling incoming PM acceptance", () => {
    const transport = new IrcChatTransport();
    transport.setKnownRoomIds([IRC_CHAT_PRODUCT_ROOM]);
    const connectSpy = vi.spyOn(transport, "connect");
    const core = new IrcChatCore({
      wsUrl: "wss://ws.yaarzo.com",
      auth: { kind: "guest", guest: guestAuth },
      transport,
    });
    core.connect();
    expect(connectSpy).toHaveBeenCalledTimes(1);
    core.setIncomingPmEnabled(false);
    core.setIncomingPmEnabled(true);
    expect(connectSpy).toHaveBeenCalledTimes(1);
  });
});

describe("irc-chat guardrails", () => {
  it("new core sources avoid legacy fake ids and Supabase transport", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const { resolve, join } = await import("node:path");
    const dir = resolve(import.meta.dirname);
    const files = readdirSync(dir).filter(
      (name) =>
        (name.endsWith(".ts") || name.endsWith(".tsx")) &&
        !name.endsWith(".test.ts") &&
        !name.endsWith(".test.tsx"),
    );

    for (const file of files) {
      const src = readFileSync(join(dir, file), "utf8");
      const isAuthBoundary = file === "runtime.tsx";
      expect(src).not.toContain("__public__");
      expect(src).not.toContain("SEED_ROOMS");
      if (isAuthBoundary) {
        expect(src).toContain("refreshSession");
        expect(src).not.toMatch(/guest_chat_messages/);
      } else {
        expect(src).not.toMatch(/\bfrom\s+["']@?\/?.*supabase/i);
      }
      expect(src).not.toMatch(/\bcreateClient\b/);
      expect(src).not.toMatch(/\bgames\b/i);
      expect(src).not.toMatch(/authorId:\s*["']me["']/);
      expect(src).not.toMatch(/members:\s*\[["']me["']\]/);
    }
  });

  it("keeps legacy ChatApp off the IRC-first core", async () => {
    const { readFileSync, existsSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const root = resolve(import.meta.dirname, "..", "..");
    const chatAppPath = resolve(root, "components/chat/ChatApp.tsx");
    if (existsSync(chatAppPath)) {
      expect(readFileSync(chatAppPath, "utf8")).not.toContain("irc-chat");
    }
    const route = readFileSync(resolve(root, "routes/chatroom.tsx"), "utf8");
    expect(route).toContain("IrcChatRuntimeProvider");
    expect(route).toContain("IrcChatApp");
    expect(route).not.toMatch(/from\s+["']@\/components\/chat\/ChatApp["']/);
  });
});
