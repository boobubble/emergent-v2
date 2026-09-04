import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chatComposerAutoSize } from "@/components/chat/composer-layout";

const testDir = dirname(fileURLToPath(import.meta.url));

describe("chat provider safety", () => {
  it("does not throw on rooms missing members during badge/streak/profile merge", () => {
    const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(src).toMatch(/r\?\.members\?\.includes\("me"\)/);
    expect(src).toMatch(/!\(r\.members \?\? \[\]\)\.includes\(b\)/);
    expect(src).toMatch(/s\.users\?\.me/);
    expect(src).toMatch(/state\.dmOrder \?\? \[\]/);
  });

  it("ChatErrorBoundary offers retry after a render throw", () => {
    const src = readFileSync(resolve(testDir, "../components/ChatErrorBoundary.tsx"), "utf8");
    expect(src).toMatch(/Try again/);
    expect(src).toMatch(/handleRetry/);
    expect(src).toMatch(/setState\(\{ error: null \}\)/);
  });

  it("Avatar does not slice a null username", () => {
    const src = readFileSync(resolve(testDir, "../components/chat/Avatar.tsx"), "utf8");
    expect(src).toMatch(/user\.name \|\| "\?"/);
  });
});

describe("authenticated send is optimistic", () => {
  const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");

  it("adds the local message with sending status before the Supabase insert", () => {
    expect(src).toMatch(/sendStatus:\s*"sending"/);
    const sendingAt = src.indexOf('sendStatus: "sending"');
    const insertAt = src.indexOf('.from("messages").insert', sendingAt);
    expect(sendingAt).toBeGreaterThan(-1);
    expect(insertAt).toBeGreaterThan(sendingAt);
  });

  it("confirms or fails after the insert, and exposes retrySend", () => {
    expect(src).toMatch(/settleAuthenticatedSendPromise/);
    expect(src).toMatch(/confirmMessages/);
    expect(src).toMatch(/failMessages/);
    expect(src).toMatch(/retrySend/);
    expect(src).toMatch(/applyHydrateSendReconcile/);
  });
});

describe("optimistic helpers", () => {
  it("confirms sending messages and can apply server timestamps", async () => {
    const { confirmMessages, failMessages, persistSendStatus } = await import("./chat-optimistic");
    const sending = {
      lobby: [{ id: "a", channelId: "lobby", authorId: "me", text: "hi", ts: 1, sendStatus: "sending" as const }],
    };
    const confirmed = confirmMessages(sending, ["a"], { a: 99 });
    expect(confirmed.lobby[0].sendStatus).toBeUndefined();
    expect(confirmed.lobby[0].ts).toBe(99);

    const failed = failMessages(sending, ["a"], "network");
    expect(failed.lobby[0].sendStatus).toBe("failed");
    expect(failed.lobby[0].sendError).toBe("network");

    const persisted = persistSendStatus(sending);
    expect(persisted.lobby[0].sendStatus).toBe("sending");
  });

  it("reconciles guest optimistic rows by temp id or visitor+text", async () => {
    const { mergeGuestLobbyRow, replaceGuestLobbyRow, failGuestLobbyRow } = await import("./chat-optimistic");
    const opt = {
      id: "opt-1",
      channelId: "lobby",
      visitorId: "visitor_abc",
      displayName: "Guest-Ada",
      text: "hello",
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-01T01:00:00.000Z",
      sendStatus: "sending" as const,
    };
    const real = { ...opt, id: "real-1", sendStatus: undefined };
    const viaRealtime = mergeGuestLobbyRow([opt], real);
    expect(viaRealtime).toHaveLength(1);
    expect(viaRealtime[0].id).toBe("real-1");
    expect(viaRealtime[0].sendStatus).toBeUndefined();

    const viaConfirm = replaceGuestLobbyRow([opt], "opt-1", real);
    expect(viaConfirm).toHaveLength(1);
    expect(viaConfirm[0].id).toBe("real-1");

    const failed = failGuestLobbyRow([opt], "opt-1", "timeout");
    expect(failed[0].sendStatus).toBe("failed");
    expect(failed[0].sendError).toBe("timeout");
  });
});

function sliceBetween(src: string, startToken: string, endToken: string): string {
  const start = src.indexOf(startToken);
  const end = src.indexOf(endToken, start + startToken.length);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return src.slice(start, end);
}

describe("opening a DM must not trip the Chatrooms error boundary", () => {
  const dock = readFileSync(resolve(testDir, "../components/chat/FloatingDMDock.tsx"), "utf8");
  const chatApp = readFileSync(resolve(testDir, "../components/chat/ChatApp.tsx"), "utf8");
  const header = readFileSync(resolve(testDir, "../components/chat/ChatHeader.tsx"), "utf8");
  const chatroomRoute = readFileSync(resolve(testDir, "../routes/chatroom.tsx"), "utf8");

  it("MiniDMWindow fetches the DM thread even when the peer comes from remote profiles", () => {
    const mini = sliceBetween(dock, "function MiniDMWindow(", "function openMiniDM(");
    const earlyReturn = mini.search(/if\s*\(\s*!channelId\s*\|\|\s*!u\s*\)\s*return\s+null/);
    expect(earlyReturn).toBeGreaterThan(-1);
    expect(mini).toContain("resolveMiniDmPeer(");
    expect(mini).toContain("watchRemoteChannel(channelId)");
    expect(mini.indexOf("watchRemoteChannel(channelId)")).toBeLessThan(earlyReturn);
    expect(mini).toContain("useRemoteProfiles(");
    expect(mini.indexOf("useServerFn(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useServerFn(")).toBeLessThan(earlyReturn);
    expect(mini.indexOf("useState(")).toBeGreaterThan(-1);
    expect(mini.indexOf("useState(")).toBeLessThan(earlyReturn);
    expect(mini).toContain("<MessageInput");
    expect(mini).toContain("channelId={channelId}");
    expect(mini).not.toContain('setText(t => t + "😊")');
  });

  it("desktop mini-DM and the main message pane are isolated so a DM throw cannot blank /chatroom", () => {
    expect(chatApp).toMatch(/ChatErrorBoundary label="floating-dm"/);
    expect(chatApp).toMatch(/<FloatingDMDock \/>/);
    expect(chatApp).toMatch(/ChatErrorBoundary label="chat-messages"/);
    expect(chatApp).toMatch(/<ChatChannelBody /);
    expect(chatApp).toMatch(/ChatErrorBoundary label="chat-header"/);
    expect(chatroomRoute).toContain('section="Chatrooms"');
    expect(chatroomRoute).not.toContain("Something went wrong. The Chatrooms section hit a problem.");
  });

  it("full-page DM header stays mounted when the peer is not yet in chat-store.users", () => {
    const dmBranch = sliceBetween(header, "if (isDM(id)) {", "const room = state.rooms[id];");
    expect(dmBranch).not.toMatch(/if\s*\(\s*!u\s*\)\s*return\s+null/);
    expect(dmBranch).toContain("Direct message");
    expect(dmBranch).toContain("DMWallpaperSheet");
  });

  it("MessageList resolves authors from remote profiles and does not crash on incomplete rows", () => {
    const list = readFileSync(resolve(testDir, "../components/chat/MessageList.tsx"), "utf8");
    expect(list).toContain("useRemoteProfiles");
    expect(list).toContain("filterChatMessages");
    expect(list).toContain("resolveMessageAuthor");
    expect(list).toContain("useGuestLobbyFeed(channelId === GUEST_LOBBY_CHANNEL_ID)");
    expect(list).not.toContain("useGuestLobbyFeed(true)");
  });

  it("history fetch includes watched mini-DM channels, not only activeChannel", () => {
    const store = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(store).toContain("extraRemoteDmChannelsToFetch");
    expect(store).toContain("watchedRemoteChannels");
    expect(store).toContain("watchRemoteChannel");
  });

  it("public rooms still render ChatChannelBody for non-DM channels", () => {
    expect(chatApp).toContain("activeIsDM={activeIsDM}");
    expect(chatApp).toContain("{!isDM(state.activeChannel) && (");
    expect(chatApp).toContain("<MembersPanel");
  });

  it("DM composers reuse public-room emoji, stickers, and voice (not a dummy 😊 insert)", () => {
    const input = readFileSync(resolve(testDir, "../components/chat/MessageInput.tsx"), "utf8");
    const feed = readFileSync(resolve(testDir, "../components/feed/FeedDMDock.tsx"), "utf8");
    expect(input).toContain('aria-label="Animated stickers"');
    expect(input).toContain('aria-label="Voice note"');
    expect(input).toContain('aria-label="Emoji"');
    expect(input).toContain("AnimatedEmojiPicker");
    expect(input).toContain("VoiceRecorder");
    expect(input).toContain("maxDurationForChannel(channelId");
    expect(input).toContain("channelIdProp");
    expect(input).toMatch(/data-chat-composer=\{compact \? "dm" : "room"\}/);
    expect(input).not.toMatch(/if\s*\(\s*isDM\([^)]*\)\s*\)\s*return\s+null/);
    expect(chatApp).toContain("<MessageInput />");
    expect(feed).toContain("<MessageInput />");
    expect(dock).toContain("<MessageInput");
    expect(dock).toContain("channelId={channelId}");
  });
});

describe("profile popup and composer pickers close after their action", () => {
  it("opening a DM from ProfilePopup also dismisses the profile dialog", () => {
    const popup = readFileSync(resolve(testDir, "../components/chat/ProfilePopup.tsx"), "utf8");
    const messageAction = sliceBetween(
      popup,
      "const isMobile = typeof window !== \"undefined\" && window.matchMedia(\"(max-width: 767px)\").matches;",
      "<MessageCircle className=\"h-4 w-4 shrink-0\" /> Message",
    );
    expect(messageAction).toContain("startDM(userId)");
    expect(messageAction).toContain("palrgo:openMiniDM");
    expect(messageAction).toContain('closeNow("action")');
    expect(messageAction.indexOf("palrgo:openMiniDM")).toBeLessThan(messageAction.indexOf('closeNow("action")'));
  });

  it("chatroom profile opens share one ProfilePopup host (member list, message names)", () => {
    const userMenu = readFileSync(resolve(testDir, "../components/chat/UserMenu.tsx"), "utf8");
    const host = readFileSync(resolve(testDir, "../components/chat/ChatProfilePopupHost.tsx"), "utf8");
    const app = readFileSync(resolve(testDir, "../components/chat/ChatApp.tsx"), "utf8");
    expect(userMenu).toContain("openProfile(userId)");
    expect(host).toContain("<ProfilePopup");
    expect(host).toContain("onClose={closeProfile}");
    expect(app).toContain("<ChatProfilePopupHost");
  });

  it("emoji and sticker pickers close on select in MessageInput (rooms and mini-DMs share this composer)", () => {
    const picker = readFileSync(resolve(testDir, "../components/chat/EmojiPicker.tsx"), "utf8");
    const stickers = readFileSync(resolve(testDir, "../components/chat/AnimatedEmojiPicker.tsx"), "utf8");
    const input = readFileSync(resolve(testDir, "../components/chat/MessageInput.tsx"), "utf8");
    const trio = readFileSync(resolve(testDir, "../components/chat/TrioRoomsDock.tsx"), "utf8");
    expect(picker).toContain("onClose?.()");
    expect(stickers).toContain("onClose?.()");
    expect(input).toContain("onClose={() => { markPickerJustClosed(); closeComposerPickers(); }}");
    expect(input).toContain("pickerToggleIsSuppressed()");
    expect(trio).toContain("onClose={() => setShowEmoji(false)}");
  });

  it("emoji and sticker cells distinguish tap from scroll instead of selecting on pointerdown", () => {
    const picker = readFileSync(resolve(testDir, "../components/chat/EmojiPicker.tsx"), "utf8");
    const stickers = readFileSync(resolve(testDir, "../components/chat/AnimatedEmojiPicker.tsx"), "utf8");
    expect(picker).toContain('from "./picker-pointer-tap"');
    expect(stickers).toContain('from "./picker-pointer-tap"');
    expect(picker).toContain("pickerItemPointerHandlers(() => pick(e))");
    expect(stickers).toContain("pickerItemPointerHandlers(() => pick(s))");
    expect(picker).not.toContain("ev.preventDefault();\n                pick(e);");
    expect(stickers).not.toContain("ev.preventDefault();\n                pick(s);");
  });
});

describe("picker pointer tap vs scroll", () => {
  async function load() {
    return import("../components/chat/picker-pointer-tap");
  }

  function fakePointer(
    target: EventTarget,
    overrides: Partial<{
      clientX: number;
      clientY: number;
      pointerId: number;
      pointerType: string;
      button: number;
    }> = {},
  ) {
    return {
      currentTarget: target,
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      preventDefault() {},
      ...overrides,
    } as unknown as import("react").PointerEvent;
  }

  it("treats a still pointerup as a tap and a moved pointerup as a scroll", async () => {
    const {
      rememberPickerPointerOrigin,
      isPickerPointerTap,
      PICKER_TAP_MOVE_THRESHOLD_PX,
    } = await load();
    const cell = {} as EventTarget;

    rememberPickerPointerOrigin(fakePointer(cell, { clientX: 40, clientY: 80 }));
    expect(isPickerPointerTap(fakePointer(cell, { clientX: 44, clientY: 82 }))).toBe(true);

    rememberPickerPointerOrigin(fakePointer(cell, { clientX: 40, clientY: 80 }));
    expect(
      isPickerPointerTap(
        fakePointer(cell, { clientX: 40, clientY: 80 + PICKER_TAP_MOVE_THRESHOLD_PX + 1 }),
      ),
    ).toBe(false);
  });

  it("does not select after pointercancel (browser scroll takeover)", async () => {
    const { rememberPickerPointerOrigin, forgetPickerPointerOrigin, isPickerPointerTap } = await load();
    const cell = {} as EventTarget;
    rememberPickerPointerOrigin(fakePointer(cell, { clientX: 10, clientY: 10 }));
    forgetPickerPointerOrigin(fakePointer(cell));
    expect(isPickerPointerTap(fakePointer(cell, { clientX: 10, clientY: 10 }))).toBe(false);
  });

  it("pickerItemPointerHandlers preventDefault only on a committing tap", async () => {
    const { pickerItemPointerHandlers, PICKER_TAP_MOVE_THRESHOLD_PX } = await load();
    const cell = {} as EventTarget;
    const taps: string[] = [];
    const handlers = pickerItemPointerHandlers(() => taps.push("pick"));

    handlers.onPointerDown(fakePointer(cell, { clientX: 0, clientY: 0 }));
    const scrollUp = fakePointer(cell, { clientX: 0, clientY: PICKER_TAP_MOVE_THRESHOLD_PX + 5 });
    let scrollPrevented = false;
    scrollUp.preventDefault = () => {
      scrollPrevented = true;
    };
    handlers.onPointerUp(scrollUp);
    expect(taps).toEqual([]);
    expect(scrollPrevented).toBe(false);

    handlers.onPointerDown(fakePointer(cell, { clientX: 0, clientY: 0 }));
    const tapUp = fakePointer(cell, { clientX: 2, clientY: 2 });
    let tapPrevented = false;
    tapUp.preventDefault = () => {
      tapPrevented = true;
    };
    handlers.onPointerUp(tapUp);
    expect(taps).toEqual(["pick"]);
    expect(tapPrevented).toBe(true);
  });
});

describe("mobile chat composer compact layout", () => {
  const input = readFileSync(resolve(testDir, "../components/chat/MessageInput.tsx"), "utf8");
  const css = readFileSync(resolve(testDir, "../components/chat/message-input.css"), "utf8");

  it("loads mobile composer CSS and compact hooks without changing send logic", () => {
    expect(input).toContain('import "./message-input.css"');
    expect(input).toContain("chatComposerAutoSize");
    expect(input).toContain("chat-composer-input");
    expect(input).toContain("chat-composer-send");
    expect(input).toContain("placeholder:whitespace-nowrap");
    expect(input).toContain("async function submitGuestLobby");
    expect(input).toContain("sendStatus");
    expect(css).toContain("max-width: 767px");
    expect(css).toContain("min-height: 56px");
    expect(css).toContain("height: 48px");
    expect(css).toContain("white-space: nowrap");
    expect(css).toContain("text-overflow: ellipsis");
    expect(css).toContain("field-sizing: fixed");
    expect(css).toContain("env(safe-area-inset-bottom");
    expect(css).toMatch(/\.chat-composer-input:placeholder-shown/);
    expect(css).toContain('data-composer-slot="attach"');
    expect(css).toContain('data-composer-slot="image"');
    expect(css).toContain('data-composer-slot="sticker"');
    expect(input).toContain('data-composer-slot="attach"');
    expect(input).toContain('data-composer-slot="image"');
    expect(input).toContain('data-composer-slot="sticker"');
  });

  it("empty placeholder text does not determine composer height", () => {
    expect(chatComposerAutoSize("", 220, 375)).toEqual({ heightPx: null, overflowY: "hidden" });
    expect(chatComposerAutoSize("hi", 40, 375)).toEqual({ heightPx: 40, overflowY: "hidden" });
    expect(chatComposerAutoSize("a\nb\nc\nd\ne", 180, 375)).toEqual({ heightPx: 96, overflowY: "auto" });
    expect(chatComposerAutoSize("a\nb\nc\nd\ne", 180, 1024)).toEqual({ heightPx: 140, overflowY: "auto" });
  });
});
