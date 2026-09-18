import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IrcChatCore } from "./store";
import { IrcChatTransport } from "./transport";
import { IRC_CHAT_PRODUCT_ROOM } from "./constants";
import {
  authOkFrame,
  guestAuth,
  ircJoinLineFrame,
  latestSocket,
  namesFrame,
  pmMessageFrame,
  publicMessageFrame,
  resetMockWs,
  roomJoinedFrame,
  teardownMockWs,
} from "./test-utils";

describe("IrcChatCore IRC sounds", () => {
  const player = {
    playPublicChatTick: vi.fn(),
    playMentionPing: vi.fn(),
    playDmPing: vi.fn(),
    playUserJoinTick: vi.fn(),
  };

  beforeEach(() => {
    resetMockWs();
    vi.clearAllMocks();
  });
  afterEach(teardownMockWs);

  function bootCore() {
    const transport = new IrcChatTransport();
    transport.setKnownRoomIds([IRC_CHAT_PRODUCT_ROOM]);
    const core = new IrcChatCore({
      wsUrl: "wss://ws.yaarzo.com",
      auth: { kind: "guest", guest: guestAuth },
      transport,
      soundPlayer: player,
    });
    core.setSoundActiveRoom(IRC_CHAT_PRODUCT_ROOM);
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));
    latestSocket().emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));
    latestSocket().emitMessage(
      namesFrame(IRC_CHAT_PRODUCT_ROOM, [{ nick: "Ranjha", userId: "visitor_test123" }]),
    );
    return core;
  }

  it("plays public chat tick for incoming message from other user", () => {
    bootCore();
    latestSocket().emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: "11111111-1111-4111-8111-111111111111",
        nick: "Peer",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        text: "hello room",
      }),
    );
    expect(player.playPublicChatTick).toHaveBeenCalledTimes(1);
    expect(player.playMentionPing).not.toHaveBeenCalled();
  });

  it("does not play public sound for own message echo", () => {
    bootCore();
    latestSocket().emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: "22222222-2222-4222-8222-222222222222",
        nick: "Ranjha",
        userId: "visitor_test123",
        text: "mine",
      }),
    );
    expect(player.playPublicChatTick).not.toHaveBeenCalled();
  });

  it("plays mention sound only for @mention (not public tick)", () => {
    bootCore();
    latestSocket().emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: "33333333-3333-4333-8333-333333333333",
        nick: "Peer",
        userId: "550e8400-e29b-41d4-a716-446655440002",
        text: "hey @Ranjha",
      }),
    );
    expect(player.playMentionPing).toHaveBeenCalledTimes(1);
    expect(player.playPublicChatTick).not.toHaveBeenCalled();
  });

  it("plays DM ping for accepted incoming PM only", () => {
    const core = bootCore();
    latestSocket().emitMessage(
      pmMessageFrame({
        messageId: "44444444-4444-4444-8444-444444444444",
        nick: "Peer",
        text: "dm hi",
      }),
    );
    expect(player.playDmPing).toHaveBeenCalledTimes(1);

    core.setIncomingPmEnabled(false);
    latestSocket().emitMessage(
      pmMessageFrame({
        messageId: "55555555-5555-4555-8555-555555555555",
        nick: "Peer",
        text: "blocked",
      }),
    );
    expect(player.playDmPing).toHaveBeenCalledTimes(1);
  });

  it("plays join sound after NAMES, not during bootstrap", () => {
    const transport = new IrcChatTransport();
    transport.setKnownRoomIds([IRC_CHAT_PRODUCT_ROOM]);
    const core = new IrcChatCore({
      wsUrl: "wss://ws.yaarzo.com",
      auth: { kind: "guest", guest: guestAuth },
      transport,
      soundPlayer: player,
    });
    core.setSoundActiveRoom(IRC_CHAT_PRODUCT_ROOM);
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));
    latestSocket().emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));

    latestSocket().emitMessage(ircJoinLineFrame(IRC_CHAT_PRODUCT_ROOM, "LateJoiner"));
    expect(player.playUserJoinTick).not.toHaveBeenCalled();

    latestSocket().emitMessage(
      namesFrame(IRC_CHAT_PRODUCT_ROOM, [
        { nick: "Ranjha", userId: "visitor_test123" },
        { nick: "LateJoiner", userId: "550e8400-e29b-41d4-a716-446655440003" },
      ]),
    );

    latestSocket().emitMessage(ircJoinLineFrame(IRC_CHAT_PRODUCT_ROOM, "Another"));
    expect(player.playUserJoinTick).toHaveBeenCalledTimes(1);
  });
});
