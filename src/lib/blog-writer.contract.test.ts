import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { excerptFromHtml } from "@/components/blog/blog-format";
import { parseBlogImageAlign } from "./blog-image";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("blog writer contracts", () => {
  it("keeps the article title as H1 and does not offer body H1 in TipTap", () => {
    const editor = read("src/components/blog/BlogEditorView.tsx");
    const write = read("src/routes/blog.write.tsx");
    const extensions = read("src/lib/blog-writer-editor.ts");
    expect(editor).toContain("Article Title (H1)");
    expect(editor).toContain("The article title is the H1. Use H2/H3 for sections.");
    expect(extensions).toContain("heading: { levels: [2, 3] }");
    expect(write).not.toMatch(/toggleHeading\(\{\s*level:\s*1\s*\}\)/);
    expect(editor).not.toMatch(/toggleHeading\(\{\s*level:\s*1\s*\}\)/);
    expect(editor).toContain("toggleHeading({ level: 2 })");
    expect(editor).toContain("toggleHeading({ level: 3 })");
    expect(editor).toContain("setParagraph()");
    expect(editor).toContain("Insert CTA Button");
    expect(write).toContain("blogWriteEditorExtensions");
    expect(extensions).toContain("CtaButton");
  });

  it("wires tags and SEO keywords into the insert payload", () => {
    const write = read("src/routes/blog.write.tsx");
    expect(write).toContain("tags:");
    expect(write).toContain("keywords:");
    expect(write).toContain("serializeKeywords");
    expect(write).toContain("normalizeTagList");
    const editor = read("src/components/blog/BlogEditorView.tsx");
    expect(editor).toContain("SEO Keywords");
    expect(editor).toContain("Tags");
  });

  it("reuses TipTap Image with persistent alt and alignment", () => {
    const write = read("src/routes/blog.write.tsx");
    const extensions = read("src/lib/blog-writer-editor.ts");
    const image = read("src/lib/blog-image.ts");
    const editor = read("src/components/blog/BlogEditorView.tsx");
    expect(write).toContain("blogWriteEditorExtensions");
    expect(extensions).toContain("BlogImage");
    expect(image).toContain("@tiptap/extension-image");
    expect(image).toContain("data-align");
    expect(editor).toContain("Add Image");
    expect(editor).toContain("Align Center");
    expect(editor).toContain("Describe the image for accessibility and search engines.");
    expect(parseBlogImageAlign("yz-blog-img yz-blog-img-center", null)).toBe("center");
  });

  it("loads the browser Supabase client on demand instead of the unloaded proxy", () => {
    const write = read("src/routes/blog.write.tsx");
    expect(write).toContain("loadBrowserSupabase");
    expect(write).toContain("useAuth");
    expect(write).toContain("immediatelyRender: false");
    expect(write).toContain('content: "<p></p>"');
    expect(write).not.toContain('from "@/integrations/supabase/client"');
    expect(write).toContain("blogWriteEditorExtensions");
  });

  it("shows list thumbnails and article og:image from the same content image", () => {
    const publicLib = read("src/lib/blog.public.ts");
    const index = read("src/components/blog/BlogIndexView.tsx");
    const route = read("src/routes/blog.$slug.tsx");
    expect(publicLib).toContain("firstBlogCoverImage");
    expect(publicLib).toContain("cover_image");
    expect(publicLib).toContain("category_id, content");
    expect(index).toContain("cover_image");
    expect(index).toContain("<img");
    expect(route).toContain("cover_image");
    expect(route).toContain('property: "og:image"');
  });

  it("does not dump SEO keywords on the public article or emit meta keywords", () => {
    const view = read("src/components/blog/BlogPostView.tsx");
    const route = read("src/routes/blog.$slug.tsx");
    const publicLib = read("src/lib/blog.public.ts");
    expect(view).not.toMatch(/post\.keywords/);
    expect(route).not.toMatch(/name:\s*["']keywords["']/);
    expect(publicLib).not.toMatch(/\bkeywords\b/);
    expect(view).toContain("post.tags");
  });

  it("shows Image SEO status and never treats missing images as a publish blocker", () => {
    const editor = read("src/components/blog/BlogEditorView.tsx");
    const write = read("src/routes/blog.write.tsx");
    const moderate = read("src/components/blog/BlogModerateView.tsx");
    expect(editor).toContain("ImageSeoPanel");
    expect(editor).toContain("Image improvements can be completed later");
    expect(moderate).toContain("ImageStatusBadge");
    expect(write).toContain(".update(");
    expect(write).toContain(".eq(\"id\", editId)");
    expect(write).not.toMatch(/\.update\(\{[^}]*\bstatus:/);
    expect(write).not.toMatch(/\.update\(\{[^}]*\bslug:/);
    expect(editor).toContain("/admin/blog/moderate");
    expect(editor).toContain("Slug (not changed on save)");
  });

  it("keeps Blog Management compact without dumping full article HTML in the list", () => {
    const moderate = read("src/components/blog/BlogModerateView.tsx");
    const route = read("src/routes/admin.blog.moderate.tsx");
    expect(moderate).toContain('title="Blogs"');
    expect(moderate).toContain("Manage, review, edit and publish blog posts.");
    expect(moderate).toContain("New Blog");
    expect(moderate).toContain("Reset Filters");
    expect(moderate).toContain("<table");
    expect(moderate).toContain("No blogs match filters.");
    expect(moderate).toContain("onUpdateStatus");
    expect(moderate).toContain("/blog/write?id=");
    expect(moderate).toContain("imageSeo=1");
    expect(moderate).toContain('href="/blog/write"');
    expect(moderate).not.toContain("max-h-64");
    expect(moderate).not.toMatch(/from\("blog_posts"\)\.delete/);
    expect(route).toContain('from("blog_posts")');
    expect(route).toContain("slug");
    expect(route).toContain("tags");
    expect(route).toContain("keywords");
    expect(route).toContain('update({ status })');
    expect(route).toContain(".delete()");
    expect(route).toContain('.eq("id", id)');
  });

  it("builds a display excerpt from HTML without keeping tags", () => {
    expect(excerptFromHtml("<p>Hello <strong>world</strong> from Yaarzo.</p>")).toBe(
      "Hello world from Yaarzo.",
    );
    expect(excerptFromHtml("<p>" + "word ".repeat(80) + "</p>").endsWith("…")).toBe(true);
    expect(excerptFromHtml("<p>" + "word ".repeat(80) + "</p>")).not.toContain("<p>");
  });
});
