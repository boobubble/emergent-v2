import { describe, it, expect } from "vitest";
import {
  assertUniquePageSlug,
  findPageSlugConflict,
  DUPLICATE_PAGE_SLUG_MESSAGE,
  PageSlugValidationError,
  pagePublicUrl,
} from "./page-slug";
import {
  customPageSitemapEntries,
  mergeSitemapEntries,
} from "./seo/sitemap";

describe("page slug duplicate safety", () => {
  it("rejects duplicate slug save", () => {
    expect(() => assertUniquePageSlug("indian-chat-room", { id: "other-id" }, "current-id")).toThrow(
      PageSlugValidationError,
    );
    expect(findPageSlugConflict("indian-chat-room", { id: "other-id" }, "current-id")).toEqual({
      field: "slug",
      code: "DUPLICATE_SLUG",
      message: DUPLICATE_PAGE_SLUG_MESSAGE,
    });
  });

  it("allows same page to keep its existing slug", () => {
    expect(() => assertUniquePageSlug("indian-chat-room", { id: "same-id" }, "same-id")).not.toThrow();
    expect(findPageSlugConflict("indian-chat-room", { id: "same-id" }, "same-id")).toBeNull();
  });

  it("allows save when no conflicting page exists", () => {
    expect(() => assertUniquePageSlug("new-slug", null, "page-id")).not.toThrow();
  });

  it("structured error message matches slug field copy", () => {
    try {
      assertUniquePageSlug("taken", { id: "a" }, "b");
    } catch (e) {
      expect(e).toBeInstanceOf(PageSlugValidationError);
      expect((e as PageSlugValidationError).field).toBe("slug");
      expect((e as PageSlugValidationError).code).toBe("DUPLICATE_SLUG");
      expect((e as Error).message).toBe(DUPLICATE_PAGE_SLUG_MESSAGE);
    }
  });
});

describe("custom page sitemap entries", () => {
  const origin = "https://domain.com";

  it("includes published indian-chat-room once", () => {
    const entries = customPageSitemapEntries(
      [{ slug: "indian-chat-room", updated_at: "2026-08-02T10:00:00Z" }],
      new Set(),
      { canonical_domain: origin } as any,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]?.loc).toBe("https://domain.com/indian-chat-room");
  });

  it("includes legacy stored slug indianchatroom unchanged", () => {
    const entries = customPageSitemapEntries(
      [{ slug: "indianchatroom", published_at: "2026-01-01T00:00:00Z" }],
      new Set(),
      { canonical_domain: origin } as any,
    );
    expect(entries[0]?.loc).toBe("https://domain.com/indianchatroom");
  });

  it("excludes redirect source slug from sitemap", () => {
    const entries = customPageSitemapEntries(
      [
        { slug: "indianchatroom", updated_at: "2026-08-02T10:00:00Z" },
        { slug: "indian-chat-room", updated_at: "2026-08-02T10:00:00Z" },
      ],
      new Set(["indianchatroom"]),
      { canonical_domain: origin } as any,
    );
    expect(entries.map((e) => e.loc)).toEqual(["https://domain.com/indian-chat-room"]);
  });

  it("excludes noindex published pages", () => {
    const entries = customPageSitemapEntries(
      [{ slug: "hidden-page", noindex: true }],
      new Set(),
      { canonical_domain: origin } as any,
    );
    expect(entries).toHaveLength(0);
  });

  it("draft pages are omitted by caller query (not passed to builder)", () => {
    const publishedOnly = [{ slug: "live-page", updated_at: "2026-08-02T10:00:00Z" }];
    const entries = customPageSitemapEntries(publishedOnly, new Set(), { canonical_domain: origin } as any);
    expect(entries.some((e) => e.loc.includes("draft"))).toBe(false);
    expect(entries).toHaveLength(1);
  });

  it("dedupes merged sitemap locations", () => {
    const merged = mergeSitemapEntries(
      [{ loc: "https://domain.com/welcome" }],
      [{ loc: "https://domain.com/welcome" }, { loc: "https://domain.com/indian-chat-room" }],
    );
    expect(merged).toHaveLength(2);
  });

  it("public route, canonical, and sitemap use the same stored slug", () => {
    const slug = "indian-chat-room";
    const publicUrl = pagePublicUrl(slug, origin);
    const sitemapLoc = customPageSitemapEntries(
      [{ slug, updated_at: "2026-08-02T10:00:00Z" }],
      new Set(),
      { canonical_domain: origin } as any,
    )[0]?.loc;
    expect(publicUrl).toBe("https://domain.com/indian-chat-room");
    expect(sitemapLoc).toBe(publicUrl);
  });
});
