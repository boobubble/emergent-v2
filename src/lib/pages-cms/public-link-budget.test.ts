import { describe, expect, it } from "vitest";
import {
  allocateBlogExploreCount,
  allocatePublicLinkWidgets,
  BLOG_PUBLIC_LINK_BUDGET,
  CMS_PUBLIC_LINK_BUDGET,
  countInBodyInternalLinks,
} from "./public-link-budget";

describe("allocatePublicLinkWidgets", () => {
  it("keeps related 4 + explore 3 when in-body is already in the new 4–5 range", () => {
    expect(allocatePublicLinkWidgets(5)).toEqual({ related: 4, explore: 3 });
    expect(5 + 4 + 3).toBeLessThanOrEqual(CMS_PUBLIC_LINK_BUDGET);
  });

  it("shrinks widgets on older pages that still have 8 in-body links", () => {
    const { related, explore } = allocatePublicLinkWidgets(8);
    expect(related + explore).toBe(4);
    expect(8 + related + explore).toBeLessThanOrEqual(CMS_PUBLIC_LINK_BUDGET);
    expect(related).toBe(4);
    expect(explore).toBe(0);
  });

  it("caps blog explore so in-body + widget stay within the blog budget", () => {
    expect(allocateBlogExploreCount(3)).toBe(2);
    expect(3 + allocateBlogExploreCount(3)).toBeLessThanOrEqual(BLOG_PUBLIC_LINK_BUDGET);
    expect(allocateBlogExploreCount(5)).toBe(1);
    expect(allocateBlogExploreCount(6)).toBe(0);
  });

  it("counts only internal hrefs in stored HTML", () => {
    expect(
      countInBodyInternalLinks(
        `<p><a href="/pakistan-chat-room">Pakistan</a> and <a href="https://yaarzo.com/chatroom">rooms</a>.</p><p><a href="https://example.com">external</a></p>`,
      ),
    ).toBe(2);
  });
});
