import { describe, it, expect } from "vitest";
import { pageTypeLabel, pageTypeBadgeClass } from "@/components/admin/pages/PagesSubnav";
import {
  contentStatusLabel,
  indexStatusLabel,
  PAGE_TYPE_OPTIONS,
  CMS_EXPORT_FIELDS,
  DEFAULT_SAVED_VIEWS,
} from "@/components/admin/pages/pages-ui";
import { parseListPagesQuery, applyCustomPagesListFilters } from "@/lib/pages-cms/list-query";
import { pageSaveSchema, listPagesQuerySchema } from "@/lib/pages-cms/schemas";
import { buildCustomPageWriteRow } from "@/lib/pages-cms/page-write";
import { resolveCmsSeoSource, SEO_SOURCE_LABELS } from "@/lib/pages-cms/seo-source";
import {
  conflictLabelFromSources,
  expandBulkPreviews,
  resolveBulkDuplicate,
} from "@/lib/pages-cms/bulk-generate";
import { BULK_SAFE_SYNC_LIMIT } from "@/lib/pages-cms/dashboard.functions";

describe("Phase 3 page type badges", () => {
  it("displays NULL page_type as Static / Unclassified", () => {
    expect(pageTypeLabel(null)).toBe("Static / Unclassified");
    expect(pageTypeLabel(undefined)).toBe("Static / Unclassified");
    expect(pageTypeBadgeClass(null)).toContain("dashed");
  });

  it("labels known page types clearly", () => {
    expect(pageTypeLabel("static")).toBe("Static");
    expect(pageTypeLabel("city")).toBe("City");
    expect(pageTypeLabel("city_category")).toBe("City + Category");
    expect(pageTypeLabel("custom_seo")).toBe("Custom SEO");
    expect(PAGE_TYPE_OPTIONS.length).toBeGreaterThan(5);
  });
});

describe("Phase 3 All Pages filters", () => {
  it("parses server pagination + filter query for UI", () => {
    const q = parseListPagesQuery({
      page: 2,
      pageSize: 50,
      search: "lahore",
      page_type: "city",
      status: "draft",
      missing_h1: true,
      seo_score_max: 39,
      sortBy: "seo_score",
      sortDir: "asc",
    });
    expect(q.page).toBe(2);
    expect(q.pageSize).toBe(50);
    expect(q.search).toBe("lahore");
    expect(q.missing_h1).toBe(true);
    expect(q.seo_score_max).toBe(39);
  });

  it("applies filters without loading all rows client-side", () => {
    const calls: string[] = [];
    const fake = {
      eq(col: string, val: unknown) { calls.push(`eq:${col}=${val}`); return fake; },
      is() { return fake; },
      or(expr: string) { calls.push(`or:${expr}`); return fake; },
      gte(col: string, val: number) { calls.push(`gte:${col}=${val}`); return fake; },
      lte(col: string, val: number) { calls.push(`lte:${col}=${val}`); return fake; },
      ilike() { return fake; },
    };
    applyCustomPagesListFilters(fake, parseListPagesQuery({
      search: "chat",
      country_id: "11111111-1111-1111-1111-111111111111",
      missing_internal_links: true,
      seo_score_min: 0,
      seo_score_max: 39,
    }));
    expect(calls.some((c) => c.startsWith("or:title.ilike."))).toBe(true);
    expect(calls.some((c) => c.includes("country_id"))).toBe(true);
    expect(calls.some((c) => c.includes("internal_link_count"))).toBe(true);
    expect(calls.some((c) => c.includes("seo_score"))).toBe(true);
  });

  it("rejects unsafe page sizes that would load too many rows", () => {
    expect(() => listPagesQuerySchema.parse({ pageSize: 500 })).toThrow();
    expect(() => listPagesQuerySchema.parse({ pageSize: 10000 })).toThrow();
  });

  it("includes admin saved-view presets (admin-only concept)", () => {
    expect(DEFAULT_SAVED_VIEWS.map((v) => v.name)).toEqual(expect.arrayContaining([
      "Pakistan Pages",
      "India Pages",
      "City Pages",
      "Missing Content",
      "SEO Problems",
      "Noindex Pages",
    ]));
  });
});

describe("Phase 3 editor derived fields", () => {
  it("never trusts client content_status / seo_score on save", () => {
    const { row, content_status, seo_score } = buildCustomPageWriteRow(
      pageSaveSchema.parse({
        slug: "test-page",
        title: "Test",
        content: "<p>Hello world content long enough</p>",
        status: "draft",
        h1: "Hello",
        primary_keyword: "test",
        meta_title: "Test title",
        meta_description: "Test description long enough for score",
      }),
      { userId: "00000000-0000-0000-0000-000000000001" },
    );
    expect(content_status).toBeTruthy();
    expect(typeof seo_score).toBe("number");
    expect(row.content_status).toBe(content_status);
    expect(row.seo_score).toBe(seo_score);
    // derived fields come from server helpers, not client-supplied keys
    expect(pageSaveSchema.safeParse({
      slug: "x",
      title: "y",
      content: "",
      content_status: "complete",
      seo_score: 99,
      internal_link_count: 50,
    }).success).toBe(true); // extra keys stripped by zod object
    const parsed = pageSaveSchema.parse({
      slug: "x",
      title: "y",
      content: "",
      content_status: "complete",
      seo_score: 99,
      internal_link_count: 50,
    } as never);
    expect((parsed as Record<string, unknown>).content_status).toBeUndefined();
    expect((parsed as Record<string, unknown>).seo_score).toBeUndefined();
    expect((parsed as Record<string, unknown>).internal_link_count).toBeUndefined();
  });

  it("preserves legacy NULL page_type on update when omitted", () => {
    const { row } = buildCustomPageWriteRow(
      pageSaveSchema.parse({
        id: "e26569bc-f359-47a6-9646-2da179ee183a",
        slug: "lahore-chat-room",
        title: "Lahore Chat Room",
        content: "<p>x</p>",
        status: "published",
      }),
      { userId: "00000000-0000-0000-0000-000000000001", previousPublishedAt: "2026-08-04T08:29:37.012987+00:00" },
    );
    expect(row.page_type).toBeUndefined();
  });

  it("defaults new pages to static when page_type omitted", () => {
    const { row } = buildCustomPageWriteRow(
      pageSaveSchema.parse({
        slug: "new-page",
        title: "New",
        content: "",
        status: "draft",
      }),
      { userId: "00000000-0000-0000-0000-000000000001" },
    );
    expect(row.page_type).toBe("static");
  });
});

describe("Phase 3 SEO source indicator", () => {
  it("labels SEO Manager override clearly", () => {
    const resolved = resolveCmsSeoSource({
      page: { meta_title: "Local", meta_description: "Local desc" },
      seoSettings: { enabled: true, title: "Override Title", description: "Override Desc" },
      template: null,
      global: { default_title: "Global", default_description: "Global desc" },
    });
    expect(resolved.kind).toBe("seo_manager_override");
    expect(resolved.label).toBe("SEO Manager Override");
    expect(SEO_SOURCE_LABELS[resolved.kind]).toBe("SEO Manager Override");
  });

  it("falls back to page SEO when no override", () => {
    const resolved = resolveCmsSeoSource({
      page: { meta_title: "Page Title", meta_description: "Page Desc" },
      seoSettings: { enabled: false },
      template: null,
      global: null,
    });
    expect(resolved.kind).toBe("page_seo");
    expect(resolved.label).toBe("Page SEO");
  });
});

describe("Phase 3 bulk preview + safety", () => {
  const baseConfig = {
    page_type: "city" as const,
    brand: "Yaarzo",
    status: "draft" as const,
    locations: [
      {
        countryId: "11111111-1111-1111-1111-111111111111",
        countryName: "Pakistan",
        countrySlug: "pakistan",
        stateId: "22222222-2222-2222-2222-222222222222",
        stateName: "Punjab",
        stateSlug: "punjab",
        cityId: "33333333-3333-3333-3333-333333333333",
        cityName: "Lahore",
        citySlug: "lahore",
      },
    ],
    category: { id: "44444444-4444-4444-4444-444444444444", name: "Chat Rooms", slug: "chat-rooms" },
    keywordGroup: {
      id: "55555555-5555-5555-5555-555555555555",
      name: "City Chat",
      slug: "city-chat",
      primary_pattern: "{city} chat room",
      slug_pattern: "{city}-chat-room",
      title_pattern: "{primary_keyword} | {brand}",
    },
    template: {
      id: "66666666-6666-6666-6666-666666666666",
      name: "City Template",
      slug: "city-template",
      intro_template: "Intro {city}",
      content_template: "<p>{primary_keyword}</p>",
    },
    duplicateHandling: "skip" as const,
  };

  it("preview expands without inserting", () => {
    const rows = expandBulkPreviews(baseConfig);
    expect(rows).toHaveLength(1);
    expect(rows[0].title.toLowerCase()).toContain("lahore");
    expect(rows[0].slug).toContain("lahore");
    expect(rows[0].primary_keyword.toLowerCase()).toContain("lahore");
  });

  it("defaults duplicate handling to skip (never overwrite by default)", () => {
    const resolved = resolveBulkDuplicate("skip", [{ source: "custom_page", existingId: "x" }], "lahore-chat-room");
    expect(resolved.action).toBe("skip");
  });

  it("maps conflict labels for preview UI", () => {
    expect(conflictLabelFromSources([], "ok")).toBe("Ready");
    expect(conflictLabelFromSources(["custom_page"], "skip")).toBe("Existing Page");
    expect(conflictLabelFromSources(["reserved"], "skip")).toBe("Reserved Route");
    expect(conflictLabelFromSources(["redirect"], "skip")).toBe("Redirect Conflict");
  });

  it("exposes a safe synchronous bulk limit and blocks mass generation casually", () => {
    expect(BULK_SAFE_SYNC_LIMIT).toBe(500);
    expect(BULK_SAFE_SYNC_LIMIT).toBeLessThan(10_000);
  });
});

describe("Phase 3 content / index labels", () => {
  it("formats content and index status for table badges", () => {
    expect(contentStatusLabel("empty")).toBe("Empty");
    expect(contentStatusLabel("partial")).toBe("Partial");
    expect(contentStatusLabel("complete")).toBe("Complete");
    expect(contentStatusLabel(null)).toBe("—");
    expect(indexStatusLabel(true)).toBe("Noindex");
    expect(indexStatusLabel(false)).toBe("Index");
  });

  it("documents CMS export fields including Phase 2 taxonomy fields", () => {
    expect(CMS_EXPORT_FIELDS).toEqual(expect.arrayContaining([
      "page_type", "primary_keyword", "country", "city", "category", "h1", "intro_content",
    ]));
    expect(CMS_EXPORT_FIELDS).not.toContain("main_content");
  });
});

describe("Phase 3 dependent location selector contract", () => {
  it("country → state → city filter ids are independent uuid filters", () => {
    const q = parseListPagesQuery({
      country_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      state_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      city_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      category_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    });
    expect(q.country_id).toBeTruthy();
    expect(q.state_id).toBeTruthy();
    expect(q.city_id).toBeTruthy();
    expect(q.category_id).toBeTruthy();
  });
});
