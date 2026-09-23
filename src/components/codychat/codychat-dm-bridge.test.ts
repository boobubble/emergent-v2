import { describe, expect, it } from "vitest";
import {
  YAARZO_OPEN_DM_MESSAGE,
  isCodyChatOpenDmMessageEvent,
  parseYaarzoOpenDmMessage,
} from "./codychat-dm-bridge";
import { getCodyChatMessageOrigin } from "./codychat-roster";
import {
  YAARZO_OPEN_DM_INBOX_EVENT,
  YAARZO_OPEN_MINI_DM_EVENT,
} from "@/lib/yaarzo-dm-events";

const PEER = "550e8400-e29b-41d4-a716-446655440000";

describe("codychat-dm-bridge", () => {
  it("accepts valid YAARZO_OPEN_DM UUID", () => {
    expect(
      parseYaarzoOpenDmMessage({ type: YAARZO_OPEN_DM_MESSAGE, peerId: PEER }),
    ).toBe(PEER);
  });

  it("rejects malformed UUID and wrong message types", () => {
    expect(parseYaarzoOpenDmMessage(null)).toBeNull();
    expect(parseYaarzoOpenDmMessage({ type: "EVIL", peerId: PEER })).toBeNull();
    expect(
      parseYaarzoOpenDmMessage({ type: YAARZO_OPEN_DM_MESSAGE, peerId: "not-a-uuid" }),
    ).toBeNull();
    expect(
      parseYaarzoOpenDmMessage({ type: YAARZO_OPEN_DM_MESSAGE, peerId: "" }),
    ).toBeNull();
  });

  it("rejects wrong origin or source for iframe postMessage", () => {
    const iframeWindow = {} as Window;
    const payload = { type: YAARZO_OPEN_DM_MESSAGE, peerId: PEER };
    const goodOrigin = getCodyChatMessageOrigin();

    expect(
      isCodyChatOpenDmMessageEvent(
        { origin: goodOrigin, source: iframeWindow, data: payload } as MessageEvent,
        iframeWindow,
      ),
    ).toBe(PEER);

    expect(
      isCodyChatOpenDmMessageEvent(
        { origin: "https://evil.example", source: iframeWindow, data: payload } as MessageEvent,
        iframeWindow,
      ),
    ).toBeNull();

    expect(
      isCodyChatOpenDmMessageEvent(
        { origin: goodOrigin, source: {} as Window, data: payload } as MessageEvent,
        iframeWindow,
      ),
    ).toBeNull();
  });

  it("preserves existing Yaarzo DM event names", () => {
    expect(YAARZO_OPEN_DM_INBOX_EVENT).toBe("palrgo:openYaarzoDmInbox");
    expect(YAARZO_OPEN_MINI_DM_EVENT).toBe("palrgo:openMiniDM");
  });
});
