import { describe, expect, it } from "vitest";
import { confirmPublicMessage, receivePublicMessage, shouldAcceptIncomingPublicMessage } from "./messages";
import { isNearScrollBottom } from "./message-scroll";
import type { IrcChatMessage } from "./types";

const ROOM = "yaarzo-global";
const MSG_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function baseMsg(overrides: Partial<IrcChatMessage> = {}): IrcChatMessage {
  return {
    id: MSG_ID,
    roomId: ROOM,
    authorId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    nick: "Ranjha",
    text: "hello",
    ts: 1,
    ...overrides,
  };
}

describe("IRC chat integration — message identity", () => {
  it("reconciles optimistic send with message.sent without duplicate rows", () => {
    let messages: Record<string, IrcChatMessage[]> = {};
    messages = receivePublicMessage(messages, ROOM, {
      ...baseMsg(),
      pending: true,
    });
    expect(messages[ROOM]?.length).toBe(1);
    expect(
      shouldAcceptIncomingPublicMessage(messages, ROOM, MSG_ID),
    ).toBe(false);
    messages = confirmPublicMessage(messages, ROOM, MSG_ID, {
      pending: false,
    });
    expect(messages[ROOM]?.[0]?.id).toBe(MSG_ID);
    expect(messages[ROOM]?.length).toBe(1);
  });

  it("keeps stable id across sticker and attachment content types", () => {
    let messages: Record<string, IrcChatMessage[]> = {};
    messages = receivePublicMessage(messages, ROOM, {
      ...baseMsg({ text: ":s:cccccccc-cccc-4ccc-8ccc-cccccccccccc:", contentType: "sticker", stickerId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" }),
      pending: true,
    });
    messages = confirmPublicMessage(messages, ROOM, MSG_ID, { pending: false });
    expect(messages[ROOM]?.[0]?.contentType).toBe("sticker");

    const attachId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    messages = receivePublicMessage(messages, ROOM, {
      ...baseMsg({
        id: attachId,
        text: "caption",
        contentType: "image",
        attachment: {
          id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          mimeType: "image/png",
          fileName: "x.png",
          size: 10,
        },
      }),
      pending: true,
    });
    messages = confirmPublicMessage(messages, ROOM, attachId, { pending: false });
    expect(messages[ROOM]?.length).toBe(2);
    expect(messages[ROOM]?.[1]?.id).toBe(attachId);
  });
});

describe("IRC chat integration — scroll follow", () => {
  it("detects near-bottom vs reading history", () => {
    expect(isNearScrollBottom(800, 1000, 200)).toBe(true);
    expect(isNearScrollBottom(0, 1000, 200)).toBe(false);
  });
});
