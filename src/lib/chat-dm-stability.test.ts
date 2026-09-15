import { describe, expect, it } from "vitest";
import {
  isActiveDmSelection,
  isPublicIrcRoomChannel,
  dmChannelFor,
} from "./dm-utils";
import { filterChatMessages } from "./message-list-model";
import { isUserLocallyIgnored } from "./ignore-store";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ME = "550e8400-e29b-41d4-a716-446655440000";
const PEER = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const DM_CH = dmChannelFor(ME, PEER)!;

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), "src", rel), "utf8");
}

describe("DM selection stability", () => {
  it("isActiveDmSelection preserves remote and guest DM channels", () => {
    expect(isActiveDmSelection(DM_CH, ME)).toBe(true);
    expect(isActiveDmSelection("dm:bot-gamebot", ME)).toBe(true);
    expect(isActiveDmSelection("gdm:compose:x", ME)).toBe(true);
    expect(isActiveDmSelection("yaarzo-global", ME)).toBe(false);
  });

  it("isPublicIrcRoomChannel distinguishes IRC rooms from DMs", () => {
    const rooms = { "yaarzo-global": {} };
    expect(isPublicIrcRoomChannel("yaarzo-global", rooms)).toBe(true);
    expect(isPublicIrcRoomChannel(DM_CH, rooms)).toBe(false);
  });

  it("chat-store syncAdminChannels preserves active DM selection", () => {
    const store = read("lib/chat-store.tsx");
    expect(store).toContain("isActiveDmSelection(activeChannel, authUserId)");
    expect(store).toContain("preserveDm");
  });

  it("fresh primary effect skips when DM is active", () => {
    const store = read("lib/chat-store.tsx");
    expect(store).toContain("if (isActiveDmSelection(state.activeChannel, authUserId)) return;");
  });

  it("setActive marks explicit selection for DMs too", () => {
    const store = read("lib/chat-store.tsx");
    expect(store).toMatch(/const setActive = useCallback[\s\S]*explicitRoomSelectionRef\.current = true/);
  });
});

describe("ignore user behavior", () => {
  it("ignore-store exports sync reader for chat-store", () => {
    const store = read("lib/ignore-store.tsx");
    expect(store).toContain("palrgo:ignore:v1");
    expect(store).toContain("isUserLocallyIgnored");
    expect(isUserLocallyIgnored("me")).toBe(false);
  });

  it("filters ignored public messages via isIgnored callback", () => {
    const msgs = [{ id: "1", channelId: "yaarzo-global", authorId: PEER, text: "hi", ts: 1 }];
    const users = { [PEER]: { id: PEER, name: "Peer", avatarColor: "#000", status: "online", xp: 0, level: 1 } };
    const filtered = filterChatMessages(msgs, users, (id) => id === PEER);
    expect(filtered).toHaveLength(0);
    const restored = filterChatMessages(msgs, users, () => false);
    expect(restored).toHaveLength(1);
  });

  it("chat-store skips ignored DM tab reveal and unread", () => {
    const store = read("lib/chat-store.tsx");
    expect(store).toContain("isUserLocallyIgnored(peerId)");
    const unread = read("lib/global-unread.ts");
    expect(unread).toContain("isUserLocallyIgnored(peerId)");
  });
});

describe("DM defensive rendering", () => {
  it("filterChatMessages tolerates missing author profile", () => {
    const msgs = [{ id: "1", channelId: DM_CH, authorId: PEER, text: "hello", ts: 1 }];
    expect(() => filterChatMessages(msgs, {}, () => false)).not.toThrow();
    expect(filterChatMessages(msgs, {}, () => false)).toHaveLength(1);
  });
});

describe("IRC moderation UI classification", () => {
  it("StaffActionsMenu gates channel kick/mute to public IRC rooms", () => {
    const menu = read("components/chat/StaffActionsMenu.tsx");
    expect(menu).toContain("isPublicIrcRoomChannel");
    expect(menu).toContain("isChannelModContext &&");
  });

  it("ProfilePopup gates channel kick/mute to public IRC rooms", () => {
    const popup = read("components/chat/ProfilePopup.tsx");
    expect(popup).toContain("isPublicIrcRoomChannel");
    expect(popup).toContain("isChannelModContext && isStaff");
  });
});
