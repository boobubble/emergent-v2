import { describe, expect, it } from "vitest";
import { FALLBACK_CATEGORIES, type StickerPack } from "@/lib/sticker-catalog";
import { buildCustomEmojiById, rowsToActiveCustomEmojis } from "@/lib/custom-emoji-catalog";

describe("custom-emoji-catalog", () => {
  it("includes only active emoji kind rows in active packs", () => {
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

    const rows = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Wave",
        pack: "Party",
        pack_id: "pack-1",
        kind: "emoji",
        url: "https://cdn.example/wave.gif",
        sort_order: 2,
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
    expect(emojis[0]?.packName).toBe("Party");
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
      },
    ]);
    expect(map.get(id.toLowerCase())?.name).toBe("Wave");
  });
});
