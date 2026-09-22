import { describe, expect, it } from "vitest";
import { cardsBeforeSidebarBlock } from "@/components/codychat/ChatroomFeedSidebarBlock";

describe("chatroom feed stream", () => {
  it("alternates 3 and 4 cards between sidebar blocks", () => {
    expect(cardsBeforeSidebarBlock(0)).toBe(3);
    expect(cardsBeforeSidebarBlock(1)).toBe(4);
    expect(cardsBeforeSidebarBlock(2)).toBe(3);
    expect(cardsBeforeSidebarBlock(3)).toBe(4);
  });
});
