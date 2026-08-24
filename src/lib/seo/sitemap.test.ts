import { describe, it, expect } from "vitest";
import {
  assemblePublicSitemapEntries,
  buildRobotsTxt,
  customPageSitemapEntries,
  formatSitemapLastmod,
  isSitemapEligibleRoutePath,
  requiredHubSitemapEntries,
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

describe("sitemap quality guards", () => {
  const global = { canonical_domain: "https://yaarzo.com" } as never;

  it("keeps required hubs, homepage trailing slash, and excludes redirect aliases", () => {
    const xmlEntries = assemblePublicSitemapEntries({
      seoPages: [
        {
          route_path: "/chatrooms",
          is_dynamic: false,
          sitemap_exclude: false,
          noindex: false,
        } as never,
        {
          route_path: "/find-friends",
          is_dynamic: false,
          sitemap_exclude: false,
          noindex: false,
        } as never,
        {
          route_path: "/games",
          is_dynamic: false,
          sitemap_exclude: false,
          noindex: false,
        } as never,
        {
          route_path: "/leaderboard",
          is_dynamic: false,
          sitemap_exclude: false,
          noindex: false,
        } as never,
        {
          route_path: "/welcome",
          is_dynamic: false,
          sitemap_exclude: false,
          noindex: false,
        } as never,
      ],
      customPages: [
        { slug: "live-page", status: "published", noindex: false },
        { slug: "draft-page", status: "draft", noindex: false },
        { slug: "hidden-page", status: "published", noindex: true },
      ],
      redirectFromSlugs: new Set(),
      global,
    });
    const locs = xmlEntries.map((e) => e.loc);
    expect(locs).toContain("https://yaarzo.com/");
    expect(locs).not.toContain("https://yaarzo.com");
    expect(locs).toContain("https://yaarzo.com/chatroom");
    expect(locs).toContain("https://yaarzo.com/communities");
    expect(locs).toContain("https://yaarzo.com/competitions");
    expect(locs).toContain("https://yaarzo.com/poetry");
    expect(locs.some((loc) => loc.endsWith("/chatrooms"))).toBe(false);
    expect(locs.some((loc) => loc.endsWith("/find-friends"))).toBe(false);
    expect(locs.some((loc) => loc.endsWith("/games"))).toBe(false);
    expect(locs.some((loc) => loc.endsWith("/leaderboard"))).toBe(false);
    expect(locs).toContain("https://yaarzo.com/live-page");
    expect(locs.some((loc) => loc.endsWith("/draft-page"))).toBe(false);
    expect(locs.some((loc) => loc.endsWith("/hidden-page"))).toBe(false);
  });

  it("never treats /chatrooms as sitemap-eligible even if seo_settings re-adds it", () => {
    expect(isSitemapEligibleRoutePath("/chatrooms")).toBe(false);
    const entries = staticSitemapEntries(
      [
        {
          route_path: "/chatrooms",
          is_dynamic: false,
          sitemap_exclude: false,
          noindex: false,
        } as never,
      ],
      global,
    );
    expect(entries).toEqual([]);
  });

  it("always emits required hub locs including homepage slash", () => {
    const locs = requiredHubSitemapEntries(global).map((e) => e.loc);
    expect(locs[0]).toBe("https://yaarzo.com/");
    expect(locs).toEqual([
      "https://yaarzo.com/",
      "https://yaarzo.com/chatroom",
      "https://yaarzo.com/communities",
      "https://yaarzo.com/competitions",
      "https://yaarzo.com/poetry",
    ]);
  });

  it("adds a safe /api/ crawl exclusion without blocking public pages or /admin", () => {
    const txt = buildRobotsTxt("https://yaarzo.com", { robots: "index, follow" } as never);
    expect(txt).toContain("Allow: /");
    expect(txt).toContain("Disallow: /api/");
    expect(txt).not.toContain("Disallow: /admin");
    expect(txt).toContain("Sitemap: https://yaarzo.com/sitemap.xml");
  });
});
