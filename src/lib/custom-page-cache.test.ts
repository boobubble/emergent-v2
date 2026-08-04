import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  customPageQueryKey,
  publishedPageMatchesSlug,
  fetchPublishedPageBySlug,
  CUSTOM_PAGE_QUERY_KEY,
} from "@/lib/fetch-published-page";

describe("customPageQueryKey", () => {
  it("includes normalized slug and differs per slug", () => {
    expect(customPageQueryKey("lahore-chat-room")).toEqual(["custom-page", "lahore-chat-room"]);
    expect(customPageQueryKey("page")).toEqual(["custom-page", "page"]);
    expect(customPageQueryKey("lahore-chat-room")).not.toEqual(customPageQueryKey("page"));
  });

  it("normalizes legacy casing in the key", () => {
    expect(customPageQueryKey("Lahore-Chat-Room")).toEqual(["custom-page", "lahore-chat-room"]);
  });
});

describe("publishedPageMatchesSlug", () => {
  it("matches exact and normalized slugs", () => {
    expect(publishedPageMatchesSlug({ slug: "lahore-chat-room" }, "lahore-chat-room")).toBe(true);
    expect(publishedPageMatchesSlug({ slug: "Lahore-Chat-Room" }, "lahore-chat-room")).toBe(true);
    expect(publishedPageMatchesSlug({ slug: "page" }, "lahore-chat-room")).toBe(false);
  });
});

describe("fetchPublishedPageBySlug", () => {
  const lahore = {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "lahore-chat-room",
    title: "Lahore Chat Rooms",
    content: "<h2>Lahore</h2>",
    excerpt: null,
    tags: [],
    layout: "boxed",
    sidebar_left: "none",
    sidebar_right: "none",
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    og_title: null,
    og_description: null,
    og_image: null,
    canonical_url: null,
    noindex: false,
    nofollow: false,
    views: 1,
    published_at: "2026-01-01T00:00:00Z",
  };
  const pageRow = {
    ...lahore,
    id: "22222222-2222-4222-8222-222222222222",
    slug: "page",
    title: "Page",
    content: "<h2>Page body</h2>",
  };

  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  function mockSb(opts: {
    pages: Record<string, typeof lahore>;
    redirects?: Record<string, string>;
  }) {
    return {
      from: (table: string) => ({
        select: () => ({
          eq: (col: string, val: string) => {
            const chain = {
              eq: (col2: string, val2: string) => ({
                maybeSingle: async () => {
                  if (table !== "custom_pages" || col !== "slug" || col2 !== "status") {
                    return { data: null, error: null };
                  }
                  const row = opts.pages[val];
                  if (!row || val2 !== "published") return { data: null, error: null };
                  return { data: row, error: null };
                },
              }),
              maybeSingle: async () => {
                if (table === "page_redirects" && col === "from_slug") {
                  const to = opts.redirects?.[val];
                  return { data: to ? { to_slug: to } : null, error: null };
                }
                return { data: null, error: null };
              },
            };
            return chain;
          },
        }),
      }),
      rpc: vi.fn(),
    };
  }

  it("returns Lahore page for /lahore-chat-room", async () => {
    const sb = mockSb({ pages: { "lahore-chat-room": lahore } });
    const row = await fetchPublishedPageBySlug(sb as never, "lahore-chat-room");
    expect(row?.id).toBe(lahore.id);
    expect(row?.title).toBe("Lahore Chat Rooms");
  });

  it("returns Page record for /page", async () => {
    const sb = mockSb({ pages: { page: pageRow, "lahore-chat-room": lahore } });
    const row = await fetchPublishedPageBySlug(sb as never, "page");
    expect(row?.id).toBe(pageRow.id);
    expect(row?.title).toBe("Page");
    expect(row?.id).not.toBe(lahore.id);
  });

  it("returns null for unknown slug without falling back", async () => {
    const sb = mockSb({ pages: { "lahore-chat-room": lahore } });
    const row = await fetchPublishedPageBySlug(sb as never, "missing-slug");
    expect(row).toBeNull();
  });

  it("resolves redirect only for requested from_slug", async () => {
    const sb = mockSb({
      pages: { "lahore-chat-room": lahore },
      redirects: { page: "lahore-chat-room" },
    });
    const fromPage = await fetchPublishedPageBySlug(sb as never, "page");
    expect(fromPage?.id).toBe(lahore.id);
    expect(fromPage?.redirectedFrom).toBe("page");

    const direct = await fetchPublishedPageBySlug(
      mockSb({ pages: { page: pageRow } }) as never,
      "page",
    );
    expect(direct?.id).toBe(pageRow.id);
    expect(direct?.redirectedFrom).toBeNull();
  });

  it("logs slug, id, and title in development without content", async () => {
    const sb = mockSb({ pages: { page: pageRow } });
    await fetchPublishedPageBySlug(sb as never, "page");
    expect(logSpy).toHaveBeenCalledWith(
      "[custom-page]",
      expect.objectContaining({
        requestedSlug: "page",
        pageId: pageRow.id,
        pageSlug: "page",
        title: "Page",
      }),
    );
    const payload = logSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("content");
  });
});

describe("navigation data replacement contract", () => {
  it("query keys differ by slug so cache cannot reuse another page", () => {
    const lahoreKey = customPageQueryKey("lahore-chat-room");
    const pageKey = customPageQueryKey("page");
    expect(lahoreKey[0]).toBe(CUSTOM_PAGE_QUERY_KEY);
    expect(pageKey[0]).toBe(CUSTOM_PAGE_QUERY_KEY);
    expect(lahoreKey[1]).not.toBe(pageKey[1]);
  });

  it("slug mismatch blocks rendering previous page object", () => {
    const previous = { slug: "lahore-chat-room", title: "Lahore Chat Rooms" };
    expect(publishedPageMatchesSlug(previous, "page")).toBe(false);
    expect(publishedPageMatchesSlug(previous, "lahore-chat-room")).toBe(true);
  });
});
