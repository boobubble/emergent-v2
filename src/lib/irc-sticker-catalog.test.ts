import { describe, expect, it } from "vitest";
import { rowsToActiveIrcStickers } from "./irc-sticker-catalog";

describe("irc-sticker-catalog", () => {
  it("filters emoji rows and keeps active pack stickers", () => {
    const stickers = rowsToActiveIrcStickers(
      [
        {
          id: "11111111-1111-4111-8111-111111111111",
          name: "Wave",
          pack: "Fun",
          pack_id: "pack-1",
          kind: "sticker",
          url: "https://cdn.example/s.gif",
          sort_order: 1,
          display_size: "small",
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Smile",
          pack: "Fun",
          pack_id: "pack-1",
          kind: "emoji",
          url: "https://cdn.example/e.gif",
          sort_order: 2,
          display_size: "small",
        },
      ],
      [
        {
          id: "pack-1",
          name: "Fun",
          category_id: "funny",
          sort_order: 1,
          is_active: true,
          created_by: null,
          created_at: "",
          updated_at: "",
        },
      ],
      [{ id: "funny", name: "Funny", emoji: "😂", sort_order: 1, is_active: true }],
    );
    expect(stickers).toHaveLength(1);
    expect(stickers[0]?.name).toBe("Wave");
    expect(stickers[0]?.displaySize).toBe("small");
  });
});
