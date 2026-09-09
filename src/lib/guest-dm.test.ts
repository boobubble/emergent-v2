import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  formatGuestDmLabel,
  guestDmChannelId,
  guestDmComposeChannel,
  guestDmPeerId,
  isGuestDmChannel,
  isGuestDmComposeChannel,
  isGuestDmPeer,
  parseGuestDmChannel,
  parseGuestDmComposeRecipient,
} from "./guest-dm-utils";
import {
  computeGuestDmUnreadCount,
  isGuestDmPeerUnread,
  resolveGuestDmReadCursor,
} from "./guest-dm-unread";
import { guestDmMessageId } from "./guest-dm-feed";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260909120000_guest_dm.sql"),
  "utf8",
);
const serverSrc = readFileSync(resolve(process.cwd(), "src/lib/guest-dm.functions.ts"), "utf8");
const feedSrc = readFileSync(resolve(process.cwd(), "src/lib/use-guest-dm-feed.ts"), "utf8");
const storeSrc = readFileSync(resolve(process.cwd(), "src/lib/chat-store.tsx"), "utf8");
const globalUnreadSrc = readFileSync(resolve(process.cwd(), "src/lib/global-unread.ts"), "utf8");

describe("guest dm identity", () => {
  it("uses gdm channel namespace and guest pseudo-peer", () => {
    const conv = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    expect(guestDmChannelId(conv)).toBe(`gdm:${conv}`);
    expect(isGuestDmChannel(`gdm:${conv}`)).toBe(true);
    expect(parseGuestDmChannel(`gdm:${conv}`)).toBe(conv);
    expect(guestDmPeerId("visitor_abc123")).toBe("guest:visitor_abc123");
    expect(isGuestDmPeer("guest:visitor_abc123")).toBe(true);
    expect(formatGuestDmLabel("Guest-Arman")).toBe("Guest-Arman");
    expect(formatGuestDmLabel("Arman")).toBe("Guest · Arman");
  });

  it("supports compose channel for first guest message", () => {
    const recipient = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const ch = guestDmComposeChannel(recipient);
    expect(isGuestDmComposeChannel(ch)).toBe(true);
    expect(parseGuestDmComposeRecipient(ch)).toBe(recipient);
  });
});

describe("guest dm message ids and read cursor", () => {
  it("uses stable row UUID for message id", () => {
    const rowId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    expect(guestDmMessageId(rowId)).toBe(`gdmmsg:${rowId}`);
    expect(guestDmMessageId(rowId)).not.toMatch(/gdmmsg:.*:\d+$/);
  });

  it("resolves read cursor from latest message timestamps, not Date.now", () => {
    const peer = "guest:visitor_test";
    const cursor = resolveGuestDmReadCursor(
      peer,
      { [peer]: 500 },
      [{ ts: 900 }],
      700,
    );
    expect(cursor).toBe(900);
    expect(cursor).toBeLessThan(Date.now());
  });
});

describe("guest dm unread isolation", () => {
  const peer = "guest:visitor_test";
  const conv = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const ch = guestDmChannelId(conv);
  const convByPeer = { [peer]: conv };

  it("tracks unread separately from auth dmLatestTs", () => {
    expect(
      isGuestDmPeerUnread(peer, "lobby", [], { [peer]: 1000 }, { [peer]: 0 }, convByPeer),
    ).toBe(true);
    expect(
      isGuestDmPeerUnread(peer, ch, [], { [peer]: 1000 }, { [peer]: 0 }, convByPeer),
    ).toBe(false);
    expect(computeGuestDmUnreadCount([peer], "lobby", [], { [peer]: 1000 }, { [peer]: 0 }, convByPeer)).toBe(1);
  });
});

describe("guest dm migration and server guards", () => {
  it("creates guest_dm tables with RLS and no client writes", () => {
    expect(migration).toMatch(/guest_dm_conversations/);
    expect(migration).toMatch(/guest_dm_messages/);
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(migration).toMatch(/Recipient reads guest dm conversations/);
    expect(migration).toMatch(/Read non-expired guest dm messages/);
    expect(migration).toMatch(/guest_dm/);
    expect(migration).toMatch(/120/);
    expect(migration).toMatch(/12/);
  });

  it("validates guest session and blocks links", () => {
    expect(serverSrc).toMatch(/assertActiveGuestSession/);
    expect(serverSrc).toMatch(/guest_chat_sessions/);
    expect(serverSrc).toMatch(/Links are not allowed for guests/);
    expect(serverSrc).toMatch(/guest_dm\.message/);
    expect(serverSrc).toMatch(/Duplicate message blocked/);
    expect(serverSrc).toMatch(/word_filters/);
  });

  it("inserts guest_dm notification without actor_id", () => {
    expect(serverSrc).toMatch(/kind: "guest_dm"/);
    expect(serverSrc).toMatch(/actor_id: null/);
  });

  it("marks guest DM read using latest message timestamp on server", () => {
    expect(serverSrc).toMatch(/guest_dm_messages/);
    expect(serverSrc).toMatch(/created_at/);
    expect(serverSrc).toMatch(/recipient_last_read_at: readAt/);
    expect(serverSrc).not.toMatch(/recipient_last_read_at: now/);
  });
});

describe("guest dm wiring", () => {
  it("singleton realtime on guest_dm_messages", () => {
    expect(feedSrc).toMatch(/guest-dm-messages/);
    expect(feedSrc).toMatch(/event: "INSERT", schema: "public", table: "guest_dm_messages"/);
    expect(feedSrc).toMatch(/realtimeSubscriberCount/);
  });

  it("chat-store keeps guest unread separate", () => {
    expect(storeSrc).toMatch(/guestDmLatestTs/);
    expect(storeSrc).toMatch(/guestDmReads/);
    expect(storeSrc).toMatch(/guestDmUnreadCount/);
    expect(storeSrc).not.toMatch(/guestDmLatestTs\[.*dmLatestTs/);
  });

  it("dedupes inbound guest DM by stable message id", () => {
    expect(storeSrc).toMatch(/guestDmMessageId\(row\.messageId\)/);
    expect(storeSrc).toMatch(/existing\.some\(\(m\) => m\.id === msgId\)/);
    expect(storeSrc).not.toMatch(/gdmmsg:\$\{row\.conversationId\}:\$\{ts\}/);
  });

  it("marks guest DM read via message cursor, not Date.now", () => {
    expect(storeSrc).toMatch(/resolveGuestDmReadCursor/);
    expect(storeSrc).toMatch(/getGuestDmSharedRows/);
    expect(storeSrc).not.toMatch(/markGuestDmRead[\s\S]{0,400}Date\.now\(\)/);
  });

  it("global unread ORs guest DM unread", () => {
    expect(globalUnreadSrc).toMatch(/guestDmUnread/);
    expect(globalUnreadSrc).toMatch(/guestDmUnreadCount/);
  });
});
