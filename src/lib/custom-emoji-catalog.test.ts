import { describe, expect, it } from "vitest";
import { FALLBACK_CATEGORIES, type StickerPack } from "@/lib/sticker-catalog";
import {
  buildCustomEmojiById,
  ircMessageCustomEmojiClassName,
  normalizeEmojiDisplaySize,
  partitionCustomEmojisByDisplaySize,
  rowsToActiveCustomEmojis,
} from "@/lib/custom-emoji-catalog";
import { createCustomEmojiToken } from "@/lib/irc-chat/irc-custom-emoji";

describe("custom-emoji-catalog", () => {
  const packs: StickerPack[] = [
    {
      id: "pack-1",
      name: "Party",
      category_id: "custom",
      sort_order: 1,
      is_active: true,
      created_by: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "pack-hidden",
      name: "Hidden",
      category_id: "custom",
      sort_order: 2,
      is_active: false,
      created_by: null,
      created_at: "",
      updated_at: "",
    },
  ];

  it("includes only active emoji kind rows in active packs", () => {
    const rows = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Wave",
        pack: "Party",
        pack_id: "pack-1",
        kind: "emoji",
        url: "https://cdn.example/wave.gif",
        sort_order: 2,
        display_size: "small",
      },
      {
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        name: "Sticker",
        pack: "Party",
        pack_id: "pack-1",
        kind: "sticker",
        url: "https://cdn.example/sticker.gif",
        sort_order: 1,
      },
      {
        id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        name: "Hidden pack",
        pack: "Hidden",
        pack_id: "pack-hidden",
        kind: "emoji",
        url: "https://cdn.example/hidden.gif",
        sort_order: 3,
      },
    ];

    const emojis = rowsToActiveCustomEmojis(rows, packs, FALLBACK_CATEGORIES);
    expect(emojis).toHaveLength(1);
    expect(emojis[0]?.id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("normalizes missing or unknown display_size to small", () => {
    expect(normalizeEmojiDisplaySize(undefined)).toBe("small");
    expect(normalizeEmojiDisplaySize("tiny")).toBe("small");
  });

  it("preserves explicit small and large display_size", () => {
    const rows = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "S",
        pack: "Party",
        pack_id: "pack-1",
        kind: "emoji",
        url: "https://cdn.example/s.gif",
        sort_order: 1,
        display_size: "small",
      },
      {
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        name: "L",
        pack: "Party",
        pack_id: "pack-1",
        kind: "emoji",
        url: "https://cdn.example/l.gif",
        sort_order: 2,
        display_size: "large",
      },
    ];
    const emojis = rowsToActiveCustomEmojis(rows, packs, FALLBACK_CATEGORIES);
    expect(emojis.find((e) => e.id.endsWith("440000"))?.displaySize).toBe("small");
    expect(emojis.find((e) => e.id.endsWith("430c8"))?.displaySize).toBe("large");
  });

  it("partitions picker groups by displaySize only", () => {
    const emojis = rowsToActiveCustomEmojis(
      [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "S",
          pack: "Party",
          pack_id: "pack-1",
          kind: "emoji",
          url: "https://cdn.example/s.gif",
          sort_order: 1,
          display_size: "small",
        },
        {
          id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          name: "L",
          pack: "Party",
          pack_id: "pack-1",
          kind: "emoji",
          url: "https://cdn.example/l.gif",
          sort_order: 2,
          display_size: "large",
        },
      ],
      packs,
      FALLBACK_CATEGORIES,
    );
    const { smallEmojis, largeEmojis } = partitionCustomEmojisByDisplaySize(emojis);
    expect(smallEmojis).toHaveLength(1);
    expect(largeEmojis).toHaveLength(1);
    expect(smallEmojis[0]?.displaySize).toBe("small");
    expect(largeEmojis[0]?.displaySize).toBe("large");
  });

  it("maps IRC message classes by display size", () => {
    expect(ircMessageCustomEmojiClassName("small")).toContain("h-[28px]");
    expect(ircMessageCustomEmojiClassName("small")).toContain("md:h-[32px]");
    expect(ircMessageCustomEmojiClassName("large")).toContain("h-[64px]");
    expect(ircMessageCustomEmojiClassName("large")).toContain("md:h-[72px]");
  });

  it("keeps IRC token format unchanged", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(createCustomEmojiToken(id)).toBe(`:e:${id}:`);
  });

  it("builds case-insensitive id lookup", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const map = buildCustomEmojiById([
      {
        id,
        name: "Wave",
        url: "https://cdn.example/wave.gif",
        packId: null,
        packName: "Custom",
        categoryId: null,
        sortOrder: 0,
        displaySize: "small",
      },
    ]);
    expect(map.get(id.toLowerCase())?.name).toBe("Wave");
  });
});
