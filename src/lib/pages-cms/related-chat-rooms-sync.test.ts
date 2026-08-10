import { describe, it, expect } from "vitest";
import {
  planRelatedChatRoomsInternalLinkSync,
  internalLinkCoversTarget,
} from "./related-chat-rooms-sync";

const PAGE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PK_HUB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const KARACHI = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ISLAMABAD = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const SELF = PAGE_ID;

describe("related chat rooms → page_internal_links sync plan", () => {
  const targetsById = new Map([
    [PK_HUB, { id: PK_HUB, slug: "pakistan-chat-room", title: "Pakistan Chat Room" }],
    [KARACHI, { id: KARACHI, slug: "karachi-chat-room", title: "Karachi Chat Room" }],
    [ISLAMABAD, { id: ISLAMABAD, slug: "islamabad-chat-room", title: "Islamabad Chat Room" }],
    [SELF, { id: SELF, slug: "lahore-chat-room", title: "Lahore Chat Rooms" }],
  ]);

  it("plans inserts for enabled manual targets missing from the graph", () => {
    const planned = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: PK_HUB, label: "Pakistan Chat Room", enabled: true, sort_order: 0 },
          { id: "2", target_page_id: KARACHI, label: "Chat with Karachi People", enabled: true, sort_order: 1 },
          { id: "3", target_page_id: ISLAMABAD, label: null, enabled: false, sort_order: 2 },
        ],
      },
      targetsById,
      existingLinks: [],
    });
    expect(planned).toHaveLength(2);
    expect(planned.map((p) => p.target_url)).toEqual([
      "/pakistan-chat-room",
      "/karachi-chat-room",
    ]);
    expect(planned[0]?.is_manual).toBe(true);
    expect(planned[1]?.anchor_text).toBe("Chat with Karachi People");
    expect(planned.every((p) => !p.target_url.startsWith("/p/"))).toBe(true);
  });

  it("does not duplicate when target_page_id or flat URL already exists", () => {
    expect(
      internalLinkCoversTarget(
        [{ target_page_id: KARACHI, target_url: "/karachi-chat-room", anchor_text: "Karachi" }],
        { target_page_id: KARACHI, target_url: "/karachi-chat-room" },
      ),
    ).toBe(true);
    expect(
      internalLinkCoversTarget(
        [{ target_page_id: null, target_url: "/pakistan-chat-room", anchor_text: "PK" }],
        { target_page_id: PK_HUB, target_url: "/pakistan-chat-room" },
      ),
    ).toBe(true);

    const planned = planRelatedChatRoomsInternalLinkSync({
      pageId: PAGE_ID,
      sourceSlug: "lahore-chat-room",
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: PK_HUB, label: "Pakistan Chat Room", enabled: true, sort_order: 0 },
          { id: "2", target_page_id: KARACHI, label: "Karachi Chat Room", enabled: true, sort_order: 1 },
        ],
      },
      targetsById,
      existingLinks: [
        { target_page_id: PK_HUB, target_url: "/pakistan-chat-room", anchor_text: "Pakistan hub" },
        // URL-only cover (legacy row without target_page_id)
        { target_page_id: null, target_url: "/karachi-chat-room", anchor_text: "Karachi rooms" },
      ],
    });
    expect(planned).toEqual([]);
  });

  it("skips self-links and falls back to page title for empty labels", () => {
    const planned = planRelatedChatRoomsInternalLinkSync({
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
    expect(planned).toHaveLength(1);
    expect(planned[0]?.target_url).toBe("/islamabad-chat-room");
    expect(planned[0]?.anchor_text).toBe("Islamabad Chat Room");
  });

  it("returns empty plan when there is no manual config", () => {
    expect(
      planRelatedChatRoomsInternalLinkSync({
        pageId: PAGE_ID,
        config: null,
        targetsById,
        existingLinks: [],
      }),
    ).toEqual([]);
    expect(
      planRelatedChatRoomsInternalLinkSync({
        pageId: PAGE_ID,
        config: { auto_fill: true, items: [] },
        targetsById,
        existingLinks: [],
      }),
    ).toEqual([]);
  });
});
