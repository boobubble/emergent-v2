import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyOptimisticReactionToggle,
  emptyMessageReactions,
  mergeMessageReactions,
  parseIrcReactionType,
} from "./reactions";
import {
  buildReactionListFrame,
  buildReactionToggleFrame,
  parseGatewayEvent,
} from "./protocol";
import { IrcChatCore } from "./store";
import { IRC_CHAT_PRODUCT_ROOM } from "./constants";
import {
  authOkFrame,
  guestAuth,
  latestSocket,
  publicMessageFrame,
  resetMockWs,
  roomJoinedFrame,
  teardownMockWs,
} from "./test-utils";

const MSG_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MSG_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const USER = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

function registeredCore() {
  return new IrcChatCore({
    auth: {
      kind: "registered",
      resolveToken: async () => "jwt-token",
    },
    wsUrl: "wss://gateway.test/ws",
  });
}

function connectGuestCore() {
  const core = new IrcChatCore({
    auth: { kind: "guest", guest: guestAuth },
    wsUrl: "wss://gateway.test/ws",
  });
  core.connect();
  const ws = latestSocket();
  ws.open();
  ws.emitMessage(authOkFrame(USER, "Ranjha"));
  ws.emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));
  return { core, ws };
}

describe("irc message reactions", () => {
  beforeEach(() => {
    resetMockWs();
  });

  afterEach(() => {
    teardownMockWs();
  });

  it("parses whitelisted reaction types only", () => {
    expect(parseIrcReactionType("heart")).toBe("heart");
    expect(parseIrcReactionType("LOVE")).toBeNull();
    expect(parseIrcReactionType("💀")).toBeNull();
  });

  it("builds gateway toggle/list frames", () => {
    expect(buildReactionToggleFrame("lobby", MSG_A, "fire")).toEqual({
      type: "reaction.toggle",
      room: "lobby",
      messageId: MSG_A,
      reactionType: "fire",
    });
    expect(buildReactionListFrame("lobby", [MSG_A, MSG_B]).messageIds).toEqual([
      MSG_A,
      MSG_B,
    ]);
  });

  it("parses reaction.updated and reaction.list events", () => {
    const updated = parseGatewayEvent({
      type: "reaction.updated",
      room: "lobby",
      messageId: MSG_A,
      reactions: {
        heart: { count: 2, reactedByMe: true },
        laugh: { count: 0, reactedByMe: false },
        fire: { count: 1, reactedByMe: false },
        like: { count: 0, reactedByMe: false },
      },
    });
    expect(updated?.kind).toBe("reaction_updated");

    const list = parseGatewayEvent({
      type: "reaction.list",
      room: "lobby",
      items: [{ messageId: MSG_A, reactions: { heart: { count: 1, reactedByMe: false } } }],
    });
    expect(list?.kind).toBe("reaction_list");
    if (list?.kind === "reaction_list") {
      expect(list.items[0]?.messageId).toBe(MSG_A);
    }
  });

  it("optimistic toggle adds and removes heart", () => {
    const first = applyOptimisticReactionToggle(emptyMessageReactions(), "heart");
    expect(first.heart).toEqual({ count: 1, reactedByMe: true });
    const second = applyOptimisticReactionToggle(first, "heart");
    expect(second.heart).toEqual({ count: 0, reactedByMe: false });
  });

  it("allows multiple reaction types for same user", () => {
    let state = applyOptimisticReactionToggle(emptyMessageReactions(), "heart");
    state = applyOptimisticReactionToggle(state, "laugh");
    expect(state.heart.reactedByMe).toBe(true);
    expect(state.laugh.reactedByMe).toBe(true);
  });

  it("mergeMessageReactions aggregates authoritative counts", () => {
    const merged = mergeMessageReactions(emptyMessageReactions(), {
      heart: { count: 5, reactedByMe: true },
      laugh: { count: 2, reactedByMe: false },
      fire: { count: 0, reactedByMe: false },
      like: { count: 1, reactedByMe: false },
    });
    expect(merged.heart.count).toBe(5);
    expect(merged.laugh.count).toBe(2);
  });

  it("guest toggle requires sign-in path (AUTH_REQUIRED)", () => {
    const { core } = connectGuestCore();
    const result = core.toggleReaction(IRC_CHAT_PRODUCT_ROOM, MSG_A, "heart");
    expect(result).toEqual({ ok: false, code: "AUTH_REQUIRED" });
  });

  it("registered toggle sends reaction.toggle over websocket", () => {
    const core = registeredCore();
    core.connect();
    const ws = latestSocket();
    ws.open();
    ws.emitMessage(authOkFrame(USER, "Ranjha"));
    ws.emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));

    const result = core.toggleReaction(IRC_CHAT_PRODUCT_ROOM, MSG_A, "heart");
    expect(result.ok).toBe(true);
    const toggle = ws.sent.find((line) => line.includes("reaction.toggle"));
    expect(toggle).toBeTruthy();
  });

  it("applies reaction.updated and batch list hydration", async () => {
    const core = registeredCore();
    core.connect();
    const ws = latestSocket();
    ws.open();
    ws.emitMessage(authOkFrame(USER, "Ranjha"));
    ws.emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));
    ws.emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: MSG_A,
        nick: "Sara",
        userId: USER,
        text: "hi",
      }),
    );

    ws.emitMessage(
      JSON.stringify({
        type: "reaction.updated",
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: MSG_A,
        reactions: {
          heart: { count: 3, reactedByMe: true },
          laugh: { count: 0, reactedByMe: false },
          fire: { count: 0, reactedByMe: false },
          like: { count: 0, reactedByMe: false },
        },
      }),
    );

    const state = core.getState();
    expect(state.reactions[IRC_CHAT_PRODUCT_ROOM]?.[MSG_A]?.heart).toEqual({
      count: 3,
      reactedByMe: true,
    });

    ws.emitMessage(
      JSON.stringify({
        type: "reaction.list",
        room: IRC_CHAT_PRODUCT_ROOM,
        items: [
          {
            messageId: MSG_B,
            reactions: {
              heart: { count: 1, reactedByMe: false },
              laugh: { count: 0, reactedByMe: false },
              fire: { count: 0, reactedByMe: false },
              like: { count: 0, reactedByMe: false },
            },
          },
        ],
      }),
    );

    expect(core.getState().reactions[IRC_CHAT_PRODUCT_ROOM]?.[MSG_B]?.heart.count).toBe(1);

    await vi.advanceTimersByTimeAsync(100);
    const listFrame = ws.sent.find((line) => line.includes("reaction.list"));
    expect(listFrame).toBeTruthy();
  });

  it("public message send still works with reactions enabled", () => {
    const core = registeredCore();
    core.connect();
    const ws = latestSocket();
    ws.open();
    ws.emitMessage(authOkFrame(USER, "Ranjha"));
    ws.emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));

    const id = core.sendPublicMessage("hello", IRC_CHAT_PRODUCT_ROOM);
    expect(id).toBeTruthy();
    expect(ws.sent.some((line) => line.includes("message.send"))).toBe(true);
  });
});
