import { describe, it, expect } from "vitest";
import {
  parseListPagesQuery,
  buildPaginatedResult,
  computePagination,
  applyCustomPagesListFilters,
  normalizeSearchTerm,
} from "./list-query";
import { listPagesQuerySchema, isPubliclyVisibleStatus, pageSaveSchema, CMS_PAGE_STATUSES } from "./schemas";
import { buildCustomPageWriteRow } from "./page-write";
import { resolveCmsSeoSource } from "./seo-source";
import {
  expandBulkPreviews,
  previewBulkRow,
  resolveBulkDuplicate,
  chunkArray,
} from "./bulk-generate";
import { deriveContentStatus, computeSeoScore } from "./template-engine";
import { resolveDuplicateSlug } from "./slug-conflicts";

describe("listPages pagination", () => {
  it("defaults to page 1 / pageSize 50", () => {
    const q = parseListPagesQuery({});
    expect(q.page).toBe(1);
    expect(q.pageSize).toBe(50);
    expect(q.sortBy).toBe("updated_at");
    expect(q.sortDir).toBe("desc");
  });

  it("only allows pageSize 25|50|100", () => {
    expect(() => listPagesQuerySchema.parse({ pageSize: 10 })).toThrow();
    expect(parseListPagesQuery({ pageSize: 100 }).pageSize).toBe(100);
  });

  it("builds paginated envelope", () => {
    const res = buildPaginatedResult([{ id: 1 }, { id: 2 }], 120, 2, 50);
    expect(res).toEqual({
      rows: [{ id: 1 }, { id: 2 }],
      total: 120,
      page: 2,
      pageSize: 50,
      totalPages: 3,
    });
  });

  it("computes range offsets", () => {
    expect(computePagination(200, 3, 50)).toMatchObject({ from: 100, to: 149, totalPages: 4 });
  });
});

describe("listPages filters", () => {
  it("maps search from q or search", () => {
    expect(normalizeSearchTerm(parseListPagesQuery({ q: "lahore" }))).toBe("lahore");
    expect(normalizeSearchTerm(parseListPagesQuery({ search: "karachi" }))).toBe("karachi");
  });

  it("applies equality and SEO missing filters", () => {
    const calls: string[] = [];
    const fake = {
      eq(col: string, val: unknown) { calls.push(`eq:${col}=${val}`); return fake; },
      is(col: string, val: null) { calls.push(`is:${col}`); return fake; },
      or(expr: string) { calls.push(`or:${expr}`); return fake; },
      gte(col: string, val: number) { calls.push(`gte:${col}=${val}`); return fake; },
      lte(col: string, val: number) { calls.push(`lte:${col}=${val}`); return fake; },
      ilike(col: string, val: string) { calls.push(`ilike:${col}=${val}`); return fake; },
    };
    applyCustomPagesListFilters(fake, parseListPagesQuery({
      page_type: "city",
      status: "draft",
      missing_h1: true,
      missing_internal_links: true,
      seo_score_min: 10,
      seo_score_max: 90,
      country_id: "11111111-1111-1111-1111-111111111111",
    }));
    expect(calls.some((c) => c.startsWith("eq:page_type=city"))).toBe(true);
    expect(calls.some((c) => c.startsWith("eq:status=draft"))).toBe(true);
    expect(calls.some((c) => c.includes("h1"))).toBe(true);
    expect(calls.some((c) => c === "eq:internal_link_count=0")).toBe(true);
    expect(calls.some((c) => c === "gte:seo_score=10")).toBe(true);
  });

  it("rejects arbitrary sort fields", () => {
    expect(() => listPagesQuerySchema.parse({ sortBy: "drop_table" })).toThrow();
  });
});

describe("status validation", () => {
  it("accepts draft|scheduled|published|archived", () => {
    for (const status of CMS_PAGE_STATUSES) {
      expect(pageSaveSchema.parse({
        slug: "test-page",
        title: "Test",
        status,
      }).status).toBe(status);
    }
  });

  it("rejects unknown status", () => {
    expect(() => pageSaveSchema.parse({ slug: "x", title: "X", status: "live" })).toThrow();
  });

  it("only published is publicly visible", () => {
    expect(isPubliclyVisibleStatus("published")).toBe(true);
    expect(isPubliclyVisibleStatus("draft")).toBe(false);
    expect(isPubliclyVisibleStatus("scheduled")).toBe(false);
    expect(isPubliclyVisibleStatus("archived")).toBe(false);
  });
});

describe("derived fields on save", () => {
  it("calculates content_status and seo_score server-side", () => {
    const { row, content_status, seo_score } = buildCustomPageWriteRow(
      {
        slug: "lahore-chat-room",
        title: "Lahore Chat Room",
        content: "<p>" + "word ".repeat(80) + "</p>",
        status: "draft",
        featured: false,
        layout: "boxed",
        sidebar_left: "none",
        sidebar_right: "none",
        noindex: false,
        nofollow: false,
        tags: [],
        meta_title: "Lahore Chat Room Online Free Today Join",
        meta_description: "Join free Lahore chat rooms on Yaarzo. Meet people, make friends, and chat online with locals every day.",
        h1: "Lahore Chat Room",
        primary_keyword: "Lahore chat room",
        page_type: "city",
      },
      { userId: "00000000-0000-0000-0000-000000000001" },
    );
    expect(content_status).toBe("complete");
    expect(seo_score).toBeGreaterThan(50);
    expect(row.content_status).toBe(content_status);
    expect(row.seo_score).toBe(seo_score);
    expect(row.page_type).toBe("city");
  });

  it("defaults new pages to page_type static", () => {
    const { row } = buildCustomPageWriteRow(
      {
        slug: "about",
        title: "About",
        content: "",
        status: "draft",
        featured: false,
        layout: "boxed",
        sidebar_left: "none",
        sidebar_right: "none",
        noindex: false,
        nofollow: false,
        tags: [],
      },
      { userId: "00000000-0000-0000-0000-000000000001" },
    );
    expect(row.page_type).toBe("static");
    expect(row.content_status).toBe("empty");
  });

  it("does not force page_type on update when omitted (legacy NULL safe)", () => {
    const { row } = buildCustomPageWriteRow(
      {
        id: "e26569bc-f359-47a6-9646-2da179ee183a",
        slug: "lahore-chat-room",
        title: "Lahore Chat Room",
        content: "x",
        status: "published",
        featured: false,
        layout: "boxed",
        sidebar_left: "none",
        sidebar_right: "none",
        noindex: false,
        nofollow: false,
        tags: [],
      },
      { userId: "00000000-0000-0000-0000-000000000001", previousPublishedAt: "2026-08-04T08:29:36.866+00:00" },
    );
    expect(row.page_type).toBeUndefined();
    expect(row.published_at).toBe("2026-08-04T08:29:36.866+00:00");
  });
});

describe("deriveContentStatus / computeSeoScore", () => {
  it("matches approved helpers", () => {
    expect(deriveContentStatus("")).toBe("empty");
    expect(deriveContentStatus("<p>hi</p>")).toBe("partial");
    expect(deriveContentStatus(`<p>${"word ".repeat(40)}</p>`)).toBe("complete");
    expect(computeSeoScore({ content: "" })).toBeLessThan(
      computeSeoScore({
        meta_title: "Lahore Chat Room Online Free Today Join",
        meta_description: "Join free Lahore chat rooms on Yaarzo. Meet people, make friends, and chat online with locals every day.",
        h1: "Lahore",
        primary_keyword: "lahore chat",
        content: "<p>" + "x ".repeat(200) + "</p>",
        noindex: false,
      }),
    );
  });
});

describe("SEO source resolution", () => {
  it("prefers SEO Manager override, then page, template, global", () => {
    expect(resolveCmsSeoSource({
      page: {},
      seoSettings: { enabled: true, title: "Override" },
    }).label).toBe("SEO Manager Override");

    expect(resolveCmsSeoSource({
      page: { meta_title: "Page title" },
      seoSettings: { enabled: false, title: "Ignored" },
    }).label).toBe("Page SEO");

    expect(resolveCmsSeoSource({
      page: {},
      template: { meta_title_template: "{city} | {brand}" },
    }).label).toBe("Template");

    expect(resolveCmsSeoSource({ page: {}, global: { site_name: "Yaarzo" } }).label).toBe("Global");
  });
});

describe("bulk generator", () => {
  const baseConfig = {
    page_type: "city" as const,
    brand: "Yaarzo",
    locations: [{
      countryId: "11111111-1111-1111-1111-111111111111",
      countryName: "Pakistan",
      countrySlug: "pakistan",
      stateId: "22222222-2222-2222-2222-222222222222",
      stateName: "Punjab",
      stateSlug: "punjab",
      cityId: "33333333-3333-3333-3333-333333333333",
      cityName: "Lahore",
      citySlug: "lahore",
    }],
    category: { id: "44444444-4444-4444-4444-444444444444", name: "Chat Rooms", slug: "chat-rooms" },
    keywordGroup: {
      id: "55555555-5555-5555-5555-555555555555",
      name: "City Chat Room",
      slug: "city-chat-room",
      primary_pattern: "{city} chat room",
      title_pattern: "{primary_keyword} | {brand}",
      slug_pattern: "{city}-chat-room",
      h1_pattern: "{primary_keyword}",
      meta_title_pattern: "{primary_keyword} | {brand}",
      meta_description_pattern: "Join free {city} chat rooms on {brand}.",
    },
    template: {
      id: "66666666-6666-6666-6666-666666666666",
      name: "Default",
      slug: "default-city-chat-room",
      intro_template: "<p>Welcome to {primary_keyword}.</p>",
      content_template: "<p>Chat in {city}, {country}.</p>",
    },
  };

  it("previews title/slug/keyword into custom_pages-shaped rows", () => {
    const row = previewBulkRow(baseConfig, baseConfig.locations[0]);
    expect(row.slug).toBe("lahore-chat-room");
    expect(row.primary_keyword).toBe("Lahore chat room");
    expect(row.title).toContain("Lahore chat room");
    expect(row.country_id).toBe(baseConfig.locations[0].countryId);
    expect(row.page_type).toBe("city");
    expect(row.content).toContain("Lahore");
  });

  it("expands one row per location", () => {
    expect(expandBulkPreviews(baseConfig)).toHaveLength(1);
  });

  it("defaults duplicate handling to skip", () => {
    const r = resolveBulkDuplicate("skip", [{ source: "custom_page", existingId: "abc" }], "lahore-chat-room");
    expect(r.action).toBe("skip");
  });

  it("suffix mode uses resolveDuplicateSlug", () => {
    expect(resolveDuplicateSlug("lahore-chat-room", 1)).toBe("lahore-chat-room-2");
    const r = resolveBulkDuplicate("suffix", [{ source: "custom_page" }], "lahore-chat-room", 1);
    expect(r.action).toBe("suffix");
    expect(r.slug).toBe("lahore-chat-room-2");
  });

  it("chunks batches for safe non-blocking architecture", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("legacy page compatibility", () => {
  it("keeps Lahore baseline id/slug constants documented for non-rewrite", () => {
    const LAHORE = {
      id: "e26569bc-f359-47a6-9646-2da179ee183a",
      slug: "lahore-chat-room",
      updated_at: "2026-08-04T08:29:37.012987+00:00",
      content_len: 6328,
    };
    expect(LAHORE.slug).toBe("lahore-chat-room");
    // Update path without page_type must not invent taxonomy
    const { row } = buildCustomPageWriteRow(
      {
        id: LAHORE.id,
        slug: LAHORE.slug,
        title: "Lahore Chat Room",
        content: "x".repeat(LAHORE.content_len),
        status: "published",
        featured: false,
        layout: "boxed",
        sidebar_left: "none",
        sidebar_right: "none",
        noindex: false,
        nofollow: false,
        tags: [],
      },
      { userId: "admin", previousPublishedAt: "2026-08-04T08:29:36.866+00:00" },
    );
    expect(row.page_type).toBeUndefined();
    expect(row.slug).toBe("lahore-chat-room");
  });
});
