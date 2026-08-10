import { describe, it, expect } from "vitest";
import {
  planRelatedChatRoomsInternalLinkSync,
  internalLinkCoversTarget,
  isRelatedChatRoomsOwnedLink,
  RELATED_CHAT_ROOMS_LINK_SOURCE,
  type ExistingInternalLinkRef,
} from "./related-chat-rooms-sync";

const PAGE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PK_HUB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const KARACHI = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ISLAMABAD = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const FRIENDSHIP = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const SELF = PAGE_ID;

const targetsById = new Map([
  [PK_HUB, { id: PK_HUB, slug: "pakistan-chat-room", title: "Pakistan Chat Room" }],
  [KARACHI, { id: KARACHI, slug: "karachi-chat-room", title: "Karachi Chat Room" }],
  [ISLAMABAD, { id: ISLAMABAD, slug: "islamabad-chat-room", title: "Islamabad Chat Room" }],
  [FRIENDSHIP, { id: FRIENDSHIP, slug: "friendship-chat-room", title: "Friendship Chat Room" }],
  [SELF, { id: SELF, slug: "lahore-chat-room", title: "Lahore Chat Rooms" }],
]);

function owned(
  id: string,
  targetPageId: string,
  url: string,
  anchor = "x",
): ExistingInternalLinkRef {
  return {
    id,
    target_page_id: targetPageId,
    target_url: url,
    anchor_text: anchor,
    source: RELATED_CHAT_ROOMS_LINK_SOURCE,
    is_manual: true,
  };
}

function unrelated(
  id: string,
  targetPageId: string | null,
  url: string,
  anchor = "content",
): ExistingInternalLinkRef {
  return {
    id,
    target_page_id: targetPageId,
    target_url: url,
    anchor_text: anchor,
    source: null,
    is_manual: true,
  };
}

describe("Related Chat Rooms ownership marker", () => {
  it("identifies sync-owned rows via source=related_chat_rooms", () => {
    expect(isRelatedChatRoomsOwnedLink({ source: RELATED_CHAT_ROOMS_LINK_SOURCE })).toBe(true);
    expect(isRelatedChatRoomsOwnedLink({ source: null })).toBe(false);
    expect(isRelatedChatRoomsOwnedLink({ source: "content" })).toBe(false);
  });
});

describe("Related Chat Rooms reconcile lifecycle", () => {
  it("add: plans inserts for new enabled targets", () => {
    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: PK_HUB, label: "Pakistan Chat Room", enabled: true, sort_order: 0 },
          { id: "2", target_page_id: KARACHI, label: "Chat with Karachi People", enabled: true, sort_order: 1 },
        ],
      },
      targetsById,
      existingLinks: [],
    });
    expect(plan.toInsert).toHaveLength(2);
    expect(plan.toRemoveIds).toEqual([]);
    expect(plan.toInsert.every((r) => r.source === RELATED_CHAT_ROOMS_LINK_SOURCE)).toBe(true);
    expect(plan.toInsert[1]?.anchor_text).toBe("Chat with Karachi People");
  });

  it("remove: removes only sync-owned stale target", () => {
    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: PK_HUB, label: "Pakistan Chat Room", enabled: true, sort_order: 0 },
        ],
      },
      targetsById,
      existingLinks: [
        owned("o1", PK_HUB, "/pakistan-chat-room", "Pakistan Chat Room"),
        owned("o2", KARACHI, "/karachi-chat-room", "Karachi Chat Room"),
      ],
    });
    expect(plan.keepOwnedIds).toEqual(["o1"]);
    expect(plan.toRemoveIds).toEqual(["o2"]);
    expect(plan.toInsert).toEqual([]);
  });

  it("disable: treats disabled target as stale sync-owned", () => {
    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: false,
        items: [
          { id: "1", target_page_id: KARACHI, label: "Karachi", enabled: false, sort_order: 0 },
          { id: "2", target_page_id: PK_HUB, label: "Pakistan", enabled: true, sort_order: 1 },
        ],
      },
      targetsById,
      existingLinks: [
        owned("o-k", KARACHI, "/karachi-chat-room"),
        owned("o-p", PK_HUB, "/pakistan-chat-room"),
      ],
    });
    expect(plan.keepOwnedIds).toEqual(["o-p"]);
    expect(plan.toRemoveIds).toEqual(["o-k"]);
  });

  it("replace A with B: remove A owned, insert B", () => {
    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: ISLAMABAD, label: "Islamabad Chat Room", enabled: true, sort_order: 0 },
        ],
      },
      targetsById,
      existingLinks: [owned("o-a", KARACHI, "/karachi-chat-room", "Karachi Chat Room")],
    });
    expect(plan.toRemoveIds).toEqual(["o-a"]);
    expect(plan.toInsert.map((r) => r.target_url)).toEqual(["/islamabad-chat-room"]);
  });

  it("no duplicate when any graph row already covers the target", () => {
    expect(
      internalLinkCoversTarget(
        [{ target_page_id: KARACHI, target_url: "/karachi-chat-room" }],
        { target_page_id: KARACHI, target_url: "/karachi-chat-room" },
      ),
    ).toBe(true);

    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: KARACHI, label: "Karachi Chat Room", enabled: true, sort_order: 0 },
        ],
      },
      targetsById,
      existingLinks: [
        unrelated("u1", KARACHI, "/karachi-chat-room", "Karachi from body"),
      ],
    });
    expect(plan.toInsert).toEqual([]);
    expect(plan.toRemoveIds).toEqual([]);
  });

  it("preserve unrelated link to same target when removing sync-owned", () => {
    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: PK_HUB, label: "Pakistan Chat Room", enabled: true, sort_order: 0 },
        ],
      },
      targetsById,
      existingLinks: [
        owned("o-k", KARACHI, "/karachi-chat-room", "Related Karachi"),
        unrelated("u-k", KARACHI, "/karachi-chat-room", "Body Karachi"),
        owned("o-p", PK_HUB, "/pakistan-chat-room"),
      ],
    });
    // Stale sync-owned Karachi removed; unrelated body Karachi untouched (not in toRemoveIds)
    expect(plan.toRemoveIds).toEqual(["o-k"]);
    expect(plan.keepOwnedIds).toEqual(["o-p"]);
    expect(plan.toRemoveIds.includes("u-k")).toBe(false);
  });

  it("empty config / auto-fill only: cleanup all sync-owned relationships", () => {
    const emptyPlan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: { auto_fill: false, items: [] },
      targetsById,
      existingLinks: [
        owned("o1", PK_HUB, "/pakistan-chat-room"),
        owned("o2", KARACHI, "/karachi-chat-room"),
        unrelated("u1", FRIENDSHIP, "/friendship-chat-room"),
      ],
    });
    expect(emptyPlan.toInsert).toEqual([]);
    expect(emptyPlan.toRemoveIds.sort()).toEqual(["o1", "o2"]);
    expect(emptyPlan.keepOwnedIds).toEqual([]);

    const nullPlan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      config: null,
      targetsById,
      existingLinks: [owned("o1", PK_HUB, "/pakistan-chat-room"), unrelated("u1", null, "/x")],
    });
    expect(nullPlan.toRemoveIds).toEqual(["o1"]);
  });

  it("skips self-links and uses title fallback for empty labels", () => {
    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: false,
        items: [
          { id: "1", target_page_id: SELF, label: "Self", enabled: true, sort_order: 0 },
          { id: "2", target_page_id: ISLAMABAD, label: null, enabled: true, sort_order: 1 },
        ],
      },
      targetsById,
      existingLinks: [],
    });
    expect(plan.toInsert).toHaveLength(1);
    expect(plan.toInsert[0]?.target_url).toBe("/islamabad-chat-room");
    expect(plan.toInsert[0]?.anchor_text).toBe("Islamabad Chat Room");
  });
});

describe("count/cache refresh contract", () => {
  it("reconcile plan exposes insert+remove so callers can refresh counts after both", () => {
    const plan = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: ISLAMABAD, label: "Islamabad", enabled: true, sort_order: 0 },
        ],
      },
      targetsById,
      existingLinks: [owned("stale", KARACHI, "/karachi-chat-room")],
    });
    // syncRelatedChatRoomsToInternalLinks deletes toRemoveIds, inserts toInsert,
    // then always calls recalculateInternalLinkCount(..., { refreshJsonCache: true }).
    expect(plan.toRemoveIds.length).toBe(1);
    expect(plan.toInsert.length).toBe(1);
  });
});
