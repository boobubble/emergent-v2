import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import {
  parseRelatedChatRoomsConfig,
  defaultRelatedChatRoomsConfig,
  serializeRelatedChatRoomsConfig,
  newRelatedChatRoomItemId,
} from "./related-chat-rooms-config";
import {
  selectRelatedChatRooms,
  RELATED_CHAT_ROOMS_MAX,
  type RelatedRoomTargetPage,
} from "./related-chat-rooms";
import { RelatedChatRooms } from "@/components/RelatedChatRooms";
import { pageSaveSchema } from "./schemas";
import { buildCustomPageWriteRow } from "./page-write";

const PK = "country-pk";

function target(
  partial: Partial<RelatedRoomTargetPage> & Pick<RelatedRoomTargetPage, "id" | "slug" | "title">,
): RelatedRoomTargetPage {
  return {
    status: "published",
    noindex: false,
    page_type: "city",
    country_id: PK,
    h1: null,
    link_priority: 0,
    ...partial,
  };
}

const source = {
  id: "lahore-id",
  slug: "lahore-chat-room",
  page_type: "city",
  country_id: PK,
};

const catalog: RelatedRoomTargetPage[] = [
  target({ id: "pk-hub", slug: "pakistan-chat-room", title: "Pakistan Chat Room", page_type: "country", link_priority: 100 }),
  target({ id: "karachi", slug: "karachi-chat-room", title: "Karachi Chat Room", link_priority: 90 }),
  target({ id: "islamabad", slug: "islamabad-chat-room", title: "Islamabad Chat Room", link_priority: 85 }),
  target({ id: "girls", slug: "girls-chat-room", title: "Girls Chat Room", page_type: "category", country_id: null }),
];

function maps(targets: RelatedRoomTargetPage[]) {
  return {
    targetsById: new Map(targets.map((t) => [t.id, t])),
    targetsBySlug: new Map(targets.map((t) => [t.slug.toLowerCase(), t])),
  };
}

describe("related_chat_rooms config", () => {
  it("defaults auto_fill ON with empty items", () => {
    expect(defaultRelatedChatRoomsConfig()).toEqual({ auto_fill: true, items: [] });
  });

  it("parses and dedupes items; caps at max 8", () => {
    const items = Array.from({ length: 10 }).map((_, i) => ({
      id: `i${i}`,
      target_page_id: `00000000-0000-4000-8000-00000000000${i % 9}`,
      label: `Label ${i}`,
      enabled: true,
      sort_order: i,
    }));
    // Force unique uuids for first 8
    for (let i = 0; i < 10; i++) {
      items[i]!.target_page_id = `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
    }
    items.push({ ...items[0]!, id: "dup", sort_order: 99 });
    const parsed = parseRelatedChatRoomsConfig({ auto_fill: false, items });
    expect(parsed?.auto_fill).toBe(false);
    expect(parsed?.items).toHaveLength(RELATED_CHAT_ROOMS_MAX);
    expect(new Set(parsed?.items.map((i) => i.target_page_id)).size).toBe(RELATED_CHAT_ROOMS_MAX);
  });

  it("returns null for invalid payloads (treat as automatic)", () => {
    expect(parseRelatedChatRoomsConfig("nope")).toBeNull();
    expect(parseRelatedChatRoomsConfig({ items: [{ target_page_id: "bad" }] })).toBeNull();
  });

  it("newRelatedChatRoomItemId returns a non-empty id", () => {
    expect(newRelatedChatRoomItemId().length).toBeGreaterThan(4);
  });
});

describe("manual Related Chat Rooms resolution", () => {
  it("uses custom labels and preserves admin order", () => {
    const selected = selectRelatedChatRooms({
      source,
      links: [
        { anchor_text: "Ignored hub", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 0 },
      ],
      ...maps(catalog),
      fillCandidates: catalog,
      config: {
        auto_fill: false,
        items: [
          { id: "1", target_page_id: "karachi", label: "Chat with Karachi People", enabled: true, sort_order: 0 },
          { id: "2", target_page_id: "islamabad", label: "Explore Islamabad Chat", enabled: true, sort_order: 1 },
          { id: "3", target_page_id: "pk-hub", label: null, enabled: true, sort_order: 2 },
        ],
      },
    });
    expect(selected.map((l) => l.slug)).toEqual([
      "karachi-chat-room",
      "islamabad-chat-room",
      "pakistan-chat-room",
    ]);
    expect(selected[0]?.label).toBe("Chat with Karachi People");
    expect(selected[1]?.label).toBe("Explore Islamabad Chat");
    expect(selected[2]?.label).toBe("Pakistan Chat Room");
    expect(selected.every((l) => l.href === `/${l.slug}`)).toBe(true);
  });

  it("auto-fill OFF shows only enabled manual buttons", () => {
    const selected = selectRelatedChatRooms({
      source,
      links: [
        { anchor_text: "Pakistan Chat Room", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 0 },
      ],
      ...maps(catalog),
      fillCandidates: catalog,
      config: {
        auto_fill: false,
        items: [
          { id: "1", target_page_id: "karachi", label: "Karachi Chat Room", enabled: true, sort_order: 0 },
          { id: "2", target_page_id: "girls", label: "Girls", enabled: false, sort_order: 1 },
        ],
      },
    });
    expect(selected).toHaveLength(1);
    expect(selected[0]?.slug).toBe("karachi-chat-room");
  });

  it("auto-fill ON fills remaining slots after manual buttons", () => {
    const selected = selectRelatedChatRooms({
      source,
      links: [
        { anchor_text: "Pakistan Chat Room", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 0 },
      ],
      ...maps(catalog),
      fillCandidates: catalog,
      config: {
        auto_fill: true,
        items: [
          { id: "1", target_page_id: "karachi", label: "Karachi Chat Room", enabled: true, sort_order: 0 },
        ],
      },
      max: 4,
    });
    expect(selected[0]?.slug).toBe("karachi-chat-room");
    expect(selected.length).toBeGreaterThan(1);
    expect(selected.some((l) => l.slug === "pakistan-chat-room")).toBe(true);
    expect(selected.filter((l) => l.slug === "karachi-chat-room")).toHaveLength(1);
  });

  it("pages without manual config still auto-generate links", () => {
    const selected = selectRelatedChatRooms({
      source: { ...source, related_chat_rooms: null },
      links: [
        { anchor_text: "Pakistan Chat Room", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 0 },
        { anchor_text: "Karachi Chat Room", target_url: "/karachi-chat-room", target_page_id: "karachi", sort_order: 1 },
      ],
      ...maps(catalog),
      fillCandidates: catalog,
      config: null,
    });
    expect(selected.length).toBeGreaterThanOrEqual(2);
    expect(selected.some((l) => l.slug === "pakistan-chat-room")).toBe(true);
  });

  it("SSR markup reflects admin-configured labels and flat URLs", () => {
    const links = selectRelatedChatRooms({
      source,
      links: [],
      ...maps(catalog),
      config: {
        auto_fill: false,
        items: [
          { id: "1", target_page_id: "karachi", label: "Explore Karachi Chat", enabled: true, sort_order: 0 },
          { id: "2", target_page_id: "pk-hub", label: "Pakistan Chat Room", enabled: true, sort_order: 1 },
        ],
      },
    });
    const html = renderToString(React.createElement(RelatedChatRooms, { links }));
    expect(html).toContain("Explore Related Chat Rooms");
    expect(html).toContain("Explore Karachi Chat");
    expect(html).toContain('href="/karachi-chat-room"');
    expect(html).toContain('href="/pakistan-chat-room"');
    expect(html).not.toContain("/p/");
  });
});

describe("page save related_chat_rooms", () => {
  it("accepts related_chat_rooms on pageSaveSchema and write row", () => {
    const config = serializeRelatedChatRoomsConfig({
      auto_fill: true,
      items: [
        {
          id: "a",
          target_page_id: "11111111-1111-4111-8111-111111111111",
          label: "Custom",
          enabled: true,
          sort_order: 0,
        },
      ],
    });
    const parsed = pageSaveSchema.parse({
      slug: "lahore-chat-room",
      title: "Lahore",
      content: "<p>x</p>",
      related_chat_rooms: config,
    });
    expect(parsed.related_chat_rooms?.items[0]?.label).toBe("Custom");
    const { row } = buildCustomPageWriteRow(parsed, { userId: "u1" });
    expect(row.related_chat_rooms).toEqual(config);
    expect(row.content).toBe("<p>x</p>");
  });
});
