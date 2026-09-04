import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canStartBlogDelete,
  isValidBlogDeleteId,
  nextPageAfterDelete,
  planBlogImageCleanup,
  removeBlogFromList,
} from "./blog-delete";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

const posts = [
  { id: "a", title: "Keep me", slug: "keep-me" },
  { id: "b", title: "Delete me", slug: "delete-me" },
  { id: "c", title: "yahoo", slug: "yahoo" },
];

describe("admin blog delete", () => {
  it("exposes a Delete action and confirmation copy", () => {
    const moderate = read("src/components/blog/BlogModerateView.tsx");
    expect(moderate).toContain('title="Delete"');
    expect(moderate).toContain('title="Image SEO"');
    expect(moderate).toContain("Delete Blog Post?");
    expect(moderate).toContain("Delete Permanently");
    expect(moderate).toContain("Cancel");
    expect(moderate).toContain("This action cannot be undone.");
    expect(moderate).toContain("Deleting…");
  });

  it("cancel does not call delete and confirm uses the post id", () => {
    const moderate = read("src/components/blog/BlogModerateView.tsx");
    const route = read("src/routes/admin.blog.moderate.tsx");
    expect(moderate).toContain("setDeleteTarget(null)");
    expect(moderate).toContain("onClick={() => setDeleteTarget(null)}");
    expect(moderate).toContain("deleteTarget.id");
    expect(route).toContain('.delete()');
    expect(route).toContain('.eq("id", id)');
    expect(route).not.toMatch(/\.delete\(\)[\s\S]*\.eq\("title"/);
    expect(route).not.toMatch(/\.delete\(\)[\s\S]*\.eq\("slug"/);
  });

  it("blocks duplicate delete while a request is in flight", () => {
    expect(canStartBlogDelete(false)).toBe(true);
    expect(canStartBlogDelete(true)).toBe(false);
    const moderate = read("src/components/blog/BlogModerateView.tsx");
    expect(moderate).toContain("if (!canStartBlogDelete(deleting)) return");
    expect(moderate).toContain("disabled={deleting}");
  });

  it("successful deletion removes only the matching post", () => {
    const next = removeBlogFromList(posts, "b");
    expect(next.map((p) => p.id)).toEqual(["a", "c"]);
    expect(next.find((p) => p.slug === "yahoo")?.slug).toBe("yahoo");
    expect(removeBlogFromList(posts, "missing")).toEqual(posts);
    expect(removeBlogFromList(posts, "")).toEqual(posts);
    expect(isValidBlogDeleteId("b")).toBe(true);
    expect(isValidBlogDeleteId("")).toBe(false);
  });

  it("failed deletion keeps the post visible", () => {
    const route = read("src/routes/admin.blog.moderate.tsx");
    expect(route).toContain("if (error || !data?.length)");
    expect(route).toContain("removeBlogFromList");
    expect(route.indexOf("if (error || !data?.length)")).toBeLessThan(route.indexOf("removeBlogFromList(prev, id)"));
  });

  it("does not alter another post or its slug", () => {
    const write = read("src/routes/blog.write.tsx");
    expect(write).not.toMatch(/\.update\(\{[^}]*\bslug:/);
    expect(write).not.toMatch(/\.update\(\{[^}]*\bstatus:/);
    expect(write).not.toContain(".delete(");
    const next = removeBlogFromList(posts, "b");
    expect(next.find((p) => p.id === "c")).toEqual({ id: "c", title: "yahoo", slug: "yahoo" });
  });

  it("never deletes shared or unverified storage objects", () => {
    const plan = planBlogImageCleanup('<img src="https://example.supabase.co/storage/v1/object/public/feed-media/uid/blog/x.webp">');
    expect(plan.deleteStorage).toBe(false);
    expect(plan.reason).toMatch(/exclusive ownership/i);
    const route = read("src/routes/admin.blog.moderate.tsx");
    expect(route).not.toContain("storage.from");
    expect(route).not.toContain(".remove(");
    const moderate = read("src/components/blog/BlogModerateView.tsx");
    expect(moderate).not.toContain("storage.from");
  });

  it("requires existing admin RLS and does not add service-role credentials", () => {
    const route = read("src/routes/admin.blog.moderate.tsx");
    expect(route).toContain('in("role", ["admin", "super_admin", "writer"])');
    expect(route).toContain("canModerate={isAdmin}");
    expect(route).toContain('from("blog_posts")');
    expect(route + read("src/components/blog/BlogModerateView.tsx") + read("src/lib/blog-delete.ts")).not.toMatch(
      /service_role|SERVICE_ROLE|supabaseAdmin|getSupabaseAdmin/,
    );
  });

  it("keeps pagination valid after the last item on a page is removed", () => {
    expect(nextPageAfterDelete(2, 50, 50)).toBe(1);
    expect(nextPageAfterDelete(3, 0, 50)).toBe(1);
    expect(nextPageAfterDelete(1, 40, 50)).toBe(1);
  });
});
