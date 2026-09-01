import { describe, it, expect } from "vitest";
import { getPublishedPoemBySlug } from "@/lib/mehfil.public";

const MIZAJ = {
  id: "2eef22d5-d52a-4970-88ea-65a7e13cbf35",
  slug: "mizaj-9n84uc",
  title: "Mizaj",
  body: "sample body",
  category_id: "4b16e566-cd29-4f53-861b-473b78bfa0e2",
  author_id: "4cb27a54-5de8-482d-8750-58f19f73a275",
  cover_url: null,
  theme: null,
  language: "en",
  tags: [] as string[],
  status: "published" as const,
  view_count: 0,
  read_count: 0,
  upvote_count: 0,
  comment_count: 0,
  share_count: 0,
  bookmark_count: 0,
  is_featured: false,
  is_editors_pick: false,
  competition_id: null,
  seo_title: null,
  seo_description: null,
  published_at: "2026-09-01T11:29:42.241Z",
  created_at: "2026-09-01T11:29:42.401Z",
  updated_at: "2026-09-01T11:29:42.401Z",
};

function chain(result: { data: unknown; error: unknown }) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.select = self;
  api.eq = self;
  api.in = self;
  api.maybeSingle = async () => result;
  api.then = (
    resolveFn: (v: unknown) => unknown,
    rejectFn?: (e: unknown) => unknown,
  ) => Promise.resolve(result).then(resolveFn, rejectFn);
  return api;
}

function mockDb(byTable: Record<string, { data: unknown; error: unknown }>) {
  return {
    from(table: string) {
      return chain(byTable[table] ?? { data: null, error: null });
    },
  } as never;
}

function publishedPoemDb(poem = MIZAJ) {
  return mockDb({
    mehfil_poems: { data: poem, error: null },
    profiles: {
      data: [{
        id: poem.author_id,
        username: "kiran",
        display_name: null,
        avatar_url: null,
        country_code: "US",
      }],
      error: null,
    },
    mehfil_categories: {
      data: [{
        id: poem.category_id,
        slug: "original-poetry",
        name: "Original Poetry",
        color: "#ec4899",
        icon: "PenLine",
      }],
      error: null,
    },
    mehfil_writer_stats: {
      data: [{ user_id: poem.author_id, writer_rank: "fresh_writer" }],
      error: null,
    },
    reactions: { data: [], error: null },
  });
}

describe("getPublishedPoemBySlug", () => {
  it("returns a published poem for a matching slug", async () => {
    const poem = await getPublishedPoemBySlug("mizaj-9n84uc", publishedPoemDb());
    expect(poem).not.toBeNull();
    expect(poem?.slug).toBe("mizaj-9n84uc");
    expect(poem?.title).toBe("Mizaj");
    expect(poem?.status).toBe("published");
    expect(poem?.author?.username).toBe("kiran");
    expect(poem?.category?.slug).toBe("original-poetry");
  });

  it("resolves the existing production slug mizaj-9n84uc", async () => {
    const poem = await getPublishedPoemBySlug("  mizaj-9n84uc  ", publishedPoemDb());
    expect(poem?.id).toBe(MIZAJ.id);
    expect(poem?.slug).toBe("mizaj-9n84uc");
  });

  it("returns null for a missing published slug (404)", async () => {
    const sb = mockDb({
      mehfil_poems: { data: null, error: null },
    });
    await expect(getPublishedPoemBySlug("no-such-poem-xyz", sb)).resolves.toBeNull();
  });

  it("returns null for an empty slug without querying", async () => {
    await expect(getPublishedPoemBySlug("   ")).resolves.toBeNull();
  });

  it("maps PGRST116 to null (404) rather than throwing", async () => {
    const sb = mockDb({
      mehfil_poems: { data: null, error: { code: "PGRST116", message: "no rows" } },
    });
    await expect(getPublishedPoemBySlug("gone", sb)).resolves.toBeNull();
  });

  it("throws on unexpected query errors so they stay 500", async () => {
    const sb = mockDb({
      mehfil_poems: { data: null, error: { code: "42501", message: "connection refused" } },
    });
    await expect(getPublishedPoemBySlug("mizaj-9n84uc", sb)).rejects.toThrow("connection refused");
  });
});
