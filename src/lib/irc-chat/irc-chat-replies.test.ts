import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildPublicSendFrame,
  parseGatewayEvent,
  parseOptionalReplyToMessageId,
} from "./protocol";
import {
  buildReplyPreviewText,
  indexMessagesById,
  resolveReplyParent,
} from "./reply";
import type { IrcChatMessage } from "./types";
import { IrcChatCore } from "./store";
import { IRC_CHAT_PRODUCT_ROOM } from "./constants";
import {
  authOkFrame,
  guestAuth,
  latestSocket,
  publicMessageFrame,
  publicSentFrame,
  resetMockWs,
  teardownMockWs,
} from "./test-utils";

const PARENT_ID = "11111111-1111-4111-8111-111111111111";
const REPLY_ID = "22222222-2222-4222-8222-222222222222";
const BAD_REPLY = "not-a-uuid";

function createCore() {
  return new IrcChatCore({
    auth: { kind: "guest", guest: guestAuth },
    wsUrl: "wss://gateway.test/ws",
  });
}

describe("irc reply protocol", () => {
  it("buildPublicSendFrame omits invalid reply ids", () => {
    const plain = buildPublicSendFrame("lobby", REPLY_ID, "hello");
    expect(plain).toEqual({
      type: "message.send",
      room: "lobby",
      messageId: REPLY_ID,
      text: "hello",
    });

    const withReply = buildPublicSendFrame("lobby", REPLY_ID, "hello", PARENT_ID);
    expect(withReply.replyToMessageId).toBe(PARENT_ID);

    const bad = buildPublicSendFrame("lobby", REPLY_ID, "hello", BAD_REPLY);
    expect(bad.replyToMessageId).toBeUndefined();
  });

  it("parseGatewayEvent maps optional reply metadata on message frames", () => {
    const incoming = parseGatewayEvent({
      type: "message",
      room: "lobby",
      messageId: REPLY_ID,
      nick: "Alice",
      userId: "550e8400-e29b-41d4-a716-446655440000",
      text: "yes",
      replyToMessageId: PARENT_ID,
    });
    expect(incoming?.kind).toBe("public_message");
    if (incoming?.kind === "public_message") {
      expect(incoming.replyToMessageId).toBe(PARENT_ID);
    }

    const malformed = parseGatewayEvent({
      type: "message",
      room: "lobby",
      messageId: REPLY_ID,
      nick: "Alice",
      userId: "550e8400-e29b-41d4-a716-446655440000",
      text: "yes",
      replyToMessageId: BAD_REPLY,
    });
    if (malformed?.kind === "public_message") {
      expect(malformed.replyToMessageId).toBeUndefined();
    }
  });

  it("parseOptionalReplyToMessageId validates UUIDs only", () => {
    expect(parseOptionalReplyToMessageId(PARENT_ID)).toBe(PARENT_ID);
    expect(parseOptionalReplyToMessageId(BAD_REPLY)).toBeUndefined();
    expect(parseOptionalReplyToMessageId({})).toBeUndefined();
  });
});

describe("irc reply resolution", () => {
  const parent: IrcChatMessage = {
    id: PARENT_ID,
    roomId: "lobby",
    authorId: "u1",
    nick: "Sara",
    text: "Anyone from Delhi?",
    ts: 1,
  };

  it("resolves parent from in-memory index", () => {
    const map = indexMessagesById([parent]);
    expect(resolveReplyParent(PARENT_ID, map)).toEqual({
      nick: "Sara",
      text: "Anyone from Delhi?",
    });
    expect(resolveReplyParent(REPLY_ID, map)).toBeNull();
  });

  it("buildReplyPreviewText clamps long text", () => {
    const long = "a".repeat(200);
    expect(buildReplyPreviewText(long, 20).length).toBeLessThanOrEqual(20);
  });
});

describe("irc-chat core replies", () => {
  beforeEach(() => resetMockWs());
  afterEach(() => teardownMockWs());

  it("sends normal messages without reply metadata", () => {
    const core = createCore();
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    const id = core.sendPublicMessage("plain");
    expect(id).toBeTruthy();
    const raw = latestSocket().sent.find((s) => s.includes("message.send"));
    expect(raw).toBeTruthy();
    const frame = JSON.parse(raw!);
    expect(frame.replyToMessageId).toBeUndefined();
  });

  it("outgoing reply carries replyToMessageId and renders optimistically", () => {
    const core = createCore();
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    const sentId = core.sendPublicMessage("reply body", IRC_CHAT_PRODUCT_ROOM, {
      replyToMessageId: PARENT_ID,
    });
    expect(sentId).toBeTruthy();

    const raw = latestSocket().sent.find((s) => s.includes("message.send"));
    const frame = JSON.parse(raw!);
    expect(frame.replyToMessageId).toBe(PARENT_ID);

    const msgs = core.getState().messages[IRC_CHAT_PRODUCT_ROOM] ?? [];
    expect(msgs.some((m) => m.id === sentId && m.replyToMessageId === PARENT_ID)).toBe(
      true,
    );
  });

  it("incoming reply maps replyToMessageId", () => {
    const core = createCore();
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    latestSocket().emitMessage(
      publicMessageFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: PARENT_ID,
        nick: "Sara",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        text: "parent",
      }),
    );

    latestSocket().emitMessage(
      JSON.stringify({
        type: "message",
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: REPLY_ID,
        nick: "Ranjha",
        userId: "visitor_test123",
        text: "child",
        replyToMessageId: PARENT_ID,
      }),
    );

    const msgs = core.getState().messages[IRC_CHAT_PRODUCT_ROOM] ?? [];
    const reply = msgs.find((m) => m.id === REPLY_ID);
    expect(reply?.replyToMessageId).toBe(PARENT_ID);
  });

  it("confirmPublicMessage preserves reply metadata", () => {
    const core = createCore();
    core.connect();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));

    const sentId = core.sendPublicMessage("hi", IRC_CHAT_PRODUCT_ROOM, {
      replyToMessageId: PARENT_ID,
    });

    latestSocket().emitMessage(
      publicSentFrame({
        room: IRC_CHAT_PRODUCT_ROOM,
        messageId: sentId!,
        nick: "Ranjha",
        userId: "visitor_test123",
        text: "hi",
        replyToMessageId: PARENT_ID,
      }),
    );

    const msg = core.getState().messages[IRC_CHAT_PRODUCT_ROOM]?.find((m) => m.id === sentId);
    expect(msg?.replyToMessageId).toBe(PARENT_ID);
    expect(msg?.pending).toBe(false);
  });
});
