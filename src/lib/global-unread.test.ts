import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeDmUnreadCount,
  computeGlobalHasUnread,
  countUnreadDmMessages,
  formatDmUnreadBadge,
  isDmChannelViewed,
  isPeerDmUnread,
  peerDmUnreadMessageCount,
} from "./global-unread";

const testDir = dirname(fileURLToPath(import.meta.url));
const ME = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ASSISTANT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const DM_CH = `dm:${[ME, ASSISTANT].sort().join(":")}`;

describe("global unread aggregation", () => {
  const dmLatestTs = { [DM_CH]: 1000 };
  const dmReadsRead = { [DM_CH]: { [ME]: 1000 } };
  const dmReadsUnread = { [DM_CH]: { [ME]: 0 } };

  it("new incoming PM makes global unread true when not viewing", () => {
    expect(
      isPeerDmUnread(ASSISTANT, ME, "lobby", [], dmLatestTs, dmReadsUnread),
    ).toBe(true);
    expect(computeGlobalHasUnread(1, 0, 0)).toBe(true);
  });

  it("opening PM (active channel) clears peer unread", () => {
    expect(
      isPeerDmUnread(ASSISTANT, ME, DM_CH, [], dmLatestTs, dmReadsUnread),
    ).toBe(false);
    expect(
      computeDmUnreadCount(ME, [ASSISTANT], DM_CH, [], dmLatestTs, dmReadsUnread),
    ).toBe(0);
  });

  it("open DM tab does not clear unread until that tab is active", () => {
    expect(isDmChannelViewed(DM_CH, ME, "lobby", [ASSISTANT])).toBe(false);
    expect(
      isPeerDmUnread(ASSISTANT, ME, "lobby", [ASSISTANT], dmLatestTs, dmReadsUnread),
    ).toBe(true);
    expect(isDmChannelViewed(DM_CH, ME, DM_CH, [ASSISTANT])).toBe(true);
  });

  it("read marker clears unread when not viewing", () => {
    expect(
      isPeerDmUnread(ASSISTANT, ME, "lobby", [], dmLatestTs, dmReadsRead),
    ).toBe(false);
  });

  it("new notification keeps global red when PM is read", () => {
    expect(computeGlobalHasUnread(0, 0, 2)).toBe(true);
  });

  it("read PM + unread notification stays red", () => {
    expect(computeGlobalHasUnread(0, 0, 1)).toBe(true);
  });

  it("unread PM + no notifications stays red", () => {
    expect(computeGlobalHasUnread(1, 0, 0)).toBe(true);
  });

  it("no unread PM and no notifications returns normal", () => {
    expect(computeGlobalHasUnread(0, 0, 0)).toBe(false);
  });

  it("duplicate latest timestamp does not change unread count", () => {
    const first = computeDmUnreadCount(
      ME,
      [ASSISTANT],
      "lobby",
      [],
      dmLatestTs,
      dmReadsUnread,
    );
    const second = computeDmUnreadCount(
      ME,
      [ASSISTANT],
      "lobby",
      [],
      dmLatestTs,
      dmReadsUnread,
    );
    expect(first).toBe(1);
    expect(second).toBe(1);
  });

  it("peerDmUnreadMessageCount counts messages after read cursor", () => {
    const msgs = [
      { authorId: ASSISTANT, ts: 500 },
      { authorId: ASSISTANT, ts: 800 },
      { authorId: "me", ts: 900 },
      { authorId: ASSISTANT, ts: 1000 },
    ];
    expect(countUnreadDmMessages(msgs, 0, ME)).toBe(3);
    expect(
      peerDmUnreadMessageCount(
        ASSISTANT,
        ME,
        "lobby",
        [],
        dmLatestTs,
        { [DM_CH]: { [ME]: 800 } },
        msgs,
      ),
    ).toBe(1);
    expect(formatDmUnreadBadge(3)).toBe(3);
    expect(formatDmUnreadBadge(12)).toBe("9+");
  });
});

describe("global unread wiring", () => {
  it("FaviconSwitcher uses aggregated hasUnread, not DM count alone", () => {
    const src = readFileSync(resolve(testDir, "../components/FaviconSwitcher.tsx"), "utf8");
    expect(src).toContain("useGlobalUnread");
    expect(src).toContain("hasUnread");
    expect(src).not.toMatch(/dmUnreadCount\s*>\s*0/);
  });

  it("chat-store tracks open mini-DM peers for unread suppression", () => {
    const store = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(store).toContain("setOpenDmPeers");
    expect(store).toContain("openDmPeerIds");
    expect(store).toContain("computeDmUnreadCount");
    expect(store).toContain("isPeerDmUnread");
    expect(store).toContain("guestDmLatestTs");
    expect(store).toContain("computeGuestDmUnreadCount");
  });

  it("desktop DM tabs use openDmTab and closeDmTab", () => {
    const store = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(store).toContain("openDmTab");
    expect(store).toContain("closeDmTab");
    const tabs = readFileSync(resolve(testDir, "../components/chat/ChatConversationTabs.tsx"), "utf8");
    expect(tabs).toContain("closeDmTab");
  });
});
