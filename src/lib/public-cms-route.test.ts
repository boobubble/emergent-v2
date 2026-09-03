import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  isMissingRowError,
  publishedLookupResult,
  fetchPublishedPageBySlug,
} from "@/lib/fetch-published-page";
import { resolvePublicTopLevelSlug } from "@/lib/public-cms-route";
import { isPublicPath, isReadOnlyPublicAppPath } from "@/lib/public-routes";

function chain(result: { data: unknown; error: unknown }) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.select = self;
  api.eq = self;
  api.in = self;
  api.order = self;
  api.limit = self;
  api.neq = self;
  api.maybeSingle = async () => result;
  api.then = (
    resolveFn: (v: unknown) => unknown,
    rejectFn?: (e: unknown) => unknown,
  ) => Promise.resolve({ data: [], error: null }).then(resolveFn, rejectFn);
  return api;
}

function mockDb(byTable: Record<string, { data: unknown; error: unknown }>) {
  return {
    from(table: string) {
      return chain(byTable[table] ?? { data: null, error: null });
    },
    rpc: async () => ({ data: null, error: null }),
  } as never;
}

describe("publishedLookupResult", () => {
  it("returns the row when the query succeeds", () => {
    expect(publishedLookupResult({ slug: "lahore-chat-room" }, null)?.slug).toBe("lahore-chat-room");
  });

  it("maps DB lookup no row (maybeSingle) to 404/null", () => {
    expect(publishedLookupResult(null, null)).toBeNull();
  });

  it("maps PGRST116 (single no rows) to 404/null", () => {
    expect(isMissingRowError({ code: "PGRST116" })).toBe(true);
    expect(publishedLookupResult(null, { code: "PGRST116", message: "no rows" })).toBeNull();
  });

  it("rethrows unexpected DB exceptions so they stay 500", () => {
    expect(isMissingRowError({ code: "42501", message: "permission denied" })).toBe(false);
    expect(() =>
      publishedLookupResult(null, { code: "42501", message: "connection refused" }),
    ).toThrow("connection refused");
  });
});

describe("resolvePublicTopLevelSlug", () => {
  it("returns missing for an unknown root slug", async () => {
    const sb = mockDb({
      communities: { data: null, error: null },
      page_redirects: { data: null, error: null },
      custom_pages: { data: null, error: null },
    });
    await expect(resolvePublicTopLevelSlug(sb, "this-page-does-not-exist-xyz")).resolves.toEqual({
      type: "missing",
    });
  });

  it("returns community when an active community slug matches", async () => {
    const sb = mockDb({
      communities: { data: { slug: "gaming" }, error: null },
    });
    await expect(resolvePublicTopLevelSlug(sb, "gaming")).resolves.toEqual({
      type: "community",
      slug: "gaming",
    });
  });

  it("returns a page for a published CMS slug", async () => {
    const page = {
      id: "p1",
      slug: "lahore-chat-room",
      title: "Lahore Chat Room",
      content: "<p>Hello Lahore</p>",
      intro_content: null,
      excerpt: null,
      tags: [],
      layout: null,
      sidebar_left: null,
      sidebar_right: null,
      meta_title: "Lahore Chat Room | Yaarzo",
      meta_description: "Chat in Lahore",
      meta_keywords: null,
      og_title: null,
      og_description: null,
      og_image: null,
      canonical_url: "https://yaarzo.com/lahore-chat-room",
      h1: "Lahore Chat Room",
      noindex: false,
      nofollow: false,
      views: 1,
      published_at: "2026-08-01T00:00:00Z",
      redirectedFrom: null,
    };
    const sb = mockDb({
      communities: { data: null, error: null },
      page_redirects: { data: null, error: null },
      custom_pages: { data: page, error: null },
    });
    const resolved = await resolvePublicTopLevelSlug(sb, "lahore-chat-room");
    expect(resolved.type).toBe("page");
    if (resolved.type === "page") {
      expect(resolved.page.slug).toBe("lahore-chat-room");
      expect(resolved.page.meta_title).toBe("Lahore Chat Room | Yaarzo");
      expect(resolved.page.h1).toBe("Lahore Chat Room");
    }
  });

  it("throws on unexpected community lookup errors", async () => {
    const sb = mockDb({
      communities: { data: null, error: { code: "57P01", message: "db unavailable" } },
    });
    await expect(resolvePublicTopLevelSlug(sb, "lahore-chat-room")).rejects.toThrow("db unavailable");
  });

  it("throws on unexpected custom_pages errors (not converted to 404)", async () => {
    const sb = mockDb({
      communities: { data: null, error: null },
      page_redirects: { data: null, error: null },
      custom_pages: { data: null, error: { message: "schema cache missing" } },
    });
    await expect(fetchPublishedPageBySlug(sb, "lahore-chat-room")).rejects.toThrow(
      "schema cache missing",
    );
  });
});

describe("CMS / blog route contracts", () => {
  it("$slug loader uses server admin lookup and throw notFound() on miss", () => {
    const src = readFileSync(resolve(process.cwd(), "src/routes/$slug.tsx"), "utf8");
    expect(src).toContain("resolvePublicTopLevelSlug");
    expect(src).toContain('import("@/integrations/supabase/client.server")');
    expect(src).toContain("throw notFound()");
    expect(src).toContain("notFoundSeoHead");
    expect(src).not.toMatch(/getCommunityBySlug\(\{ data: \{ slug/);
    expect(src).not.toMatch(/from "@\/integrations\/supabase\/client"/);
  });

  it("blog index loader does not use the browser supabase proxy", () => {
    const src = readFileSync(resolve(process.cwd(), "src/routes/blog.index.tsx"), "utf8");
    expect(src).toContain("listPublishedBlogIndex");
    expect(src).not.toContain("@/integrations/supabase/client");
    expect(src).not.toContain("loadBrowserSupabase");
  });

  it("invalid blog slug throws notFound()", () => {
    const src = readFileSync(resolve(process.cwd(), "src/routes/blog.$slug.tsx"), "utf8");
    expect(src).toContain("getPublishedBlogBySlug");
    expect(src).toContain("if (!post) throw notFound()");
    expect(src).toContain("notFoundSeoHead");
    expect(src).not.toContain("@/integrations/supabase/client");
  });

  it("treats /blog and /blog/yahoo as public guest paths", () => {
    expect(isReadOnlyPublicAppPath("/blog")).toBe(true);
    expect(isReadOnlyPublicAppPath("/blog/yahoo")).toBe(true);
    expect(isPublicPath("/blog")).toBe(true);
    expect(isPublicPath("/blog/yahoo")).toBe(true);
  });

  it("blog and site-directory heads include a self-referencing canonical", () => {
    const blog = readFileSync(resolve(process.cwd(), "src/routes/blog.index.tsx"), "utf8");
    const achievements = readFileSync(resolve(process.cwd(), "src/routes/achievements.tsx"), "utf8");
    const directory = readFileSync(resolve(process.cwd(), "src/routes/site-directory.tsx"), "utf8");
    expect(blog).toContain("staticPublicHead");
    expect(blog).toContain('path: "/blog"');
    expect(achievements).toContain('path: "/achievements"');
    expect(directory).toContain('path: "/site-directory"');
  });

  it("$slug JSON-LD is built from page content FAQs", () => {
    const src = readFileSync(resolve(process.cwd(), "src/routes/$slug.tsx"), "utf8");
    expect(src).toContain("buildCmsPageJsonLd");
    expect(src).toContain("extractFaqItems");
  });
});
