import { describe, it, expect } from "vitest";
import {
  customPageSitemapEntries,
  formatSitemapLastmod,
  staticSitemapEntries,
} from "./sitemap";

describe("formatSitemapLastmod", () => {
  it("formats ISO strings", () => {
    expect(formatSitemapLastmod("2026-08-08T06:27:22.166Z")).toBe("2026-08-08");
    expect(formatSitemapLastmod("2026-08-04T08:29:37.012987+00:00")).toBe("2026-08-04");
  });

  it("formats Date objects from postgres.js", () => {
    expect(formatSitemapLastmod(new Date("2026-08-08T06:27:22.166Z"))).toBe("2026-08-08");
  });

  it("uses fallback for null/invalid", () => {
    expect(formatSitemapLastmod(null, "2020-01-01")).toBe("2020-01-01");
    expect(formatSitemapLastmod(undefined, "2020-01-01")).toBe("2020-01-01");
    expect(formatSitemapLastmod(new Date("invalid"), "2020-01-01")).toBe("2020-01-01");
  });
});

describe("customPageSitemapEntries date safety", () => {
  it("does not throw when updated_at is a Date", () => {
    const entries = customPageSitemapEntries(
      [
        {
          slug: "lahore-chat-room",
          updated_at: new Date("2026-08-04T08:29:37.012Z"),
          noindex: false,
        },
        {
          slug: "karachi-chat-room",
          updated_at: new Date("2026-08-08T06:27:24.235Z"),
          noindex: true,
        },
      ],
      new Set(),
      { canonical_domain: "https://yaarzo.com" } as never,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].loc).toBe("https://yaarzo.com/lahore-chat-room");
    expect(entries[0].lastmod).toBe("2026-08-04");
  });

  it("excludes noindex drafts even with Date timestamps", () => {
    const entries = customPageSitemapEntries(
      [
        { slug: "mumbai-chat-room", updated_at: new Date(), noindex: true },
        { slug: "hyderabad-india-chat-room", published_at: new Date(), noindex: true },
      ],
      new Set(),
      { canonical_domain: "https://yaarzo.com" } as never,
    );
    expect(entries).toEqual([]);
  });

  it("accepts string timestamps from Supabase REST", () => {
    const entries = customPageSitemapEntries(
      [{ slug: "lahore-chat-room", updated_at: "2026-08-04T08:29:37.012987+00:00", noindex: false }],
      new Set(),
      { canonical_domain: "https://example.com" } as never,
    );
    expect(entries[0].lastmod).toBe("2026-08-04");
  });
});

describe("staticSitemapEntries date safety", () => {
  it("handles Date-like values without throwing", () => {
    const entries = staticSitemapEntries(
      [
        {
          route_path: "/welcome",
          updated_at: new Date("2026-08-05T00:00:00Z") as unknown as string,
          is_dynamic: false,
          sitemap_exclude: false,
          noindex: false,
        } as never,
      ],
      { canonical_domain: "https://yaarzo.com" } as never,
    );
    expect(entries[0].lastmod).toBe("2026-08-05");
  });
});
