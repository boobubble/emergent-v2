import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseBlogImageAlign } from "./blog-image";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("blog writer contracts", () => {
  it("keeps the article title as H1 and does not offer body H1 in TipTap", () => {
    const editor = read("src/components/blog/BlogEditorView.tsx");
    const write = read("src/routes/blog.write.tsx");
    expect(editor).toContain("Article Title (H1)");
    expect(editor).toContain("The article title is the H1. Use H2/H3 for sections.");
    expect(write).toContain("heading: { levels: [2, 3] }");
    expect(write).not.toMatch(/toggleHeading\(\{\s*level:\s*1\s*\}\)/);
    expect(editor).not.toMatch(/toggleHeading\(\{\s*level:\s*1\s*\}\)/);
    expect(editor).toContain("toggleHeading({ level: 2 })");
    expect(editor).toContain("toggleHeading({ level: 3 })");
    expect(editor).toContain("setParagraph()");
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
    const image = read("src/lib/blog-image.ts");
    const editor = read("src/components/blog/BlogEditorView.tsx");
    expect(write).toContain("BlogImage");
    expect(image).toContain("@tiptap/extension-image");
    expect(image).toContain("data-align");
    expect(editor).toContain("Add Image");
    expect(editor).toContain("Align Center");
    expect(editor).toContain("Describe the image for accessibility and search engines.");
    expect(parseBlogImageAlign("yz-blog-img yz-blog-img-center", null)).toBe("center");
  });

  it("does not dump SEO keywords on the public article or emit meta keywords", () => {
    const view = read("src/components/blog/BlogPostView.tsx");
    const route = read("src/routes/blog.$slug.tsx");
    const publicLib = read("src/lib/blog.public.ts");
    expect(view).not.toMatch(/post\.keywords/);
    expect(route).not.toMatch(/name:\s*["']keywords["']/);
    expect(publicLib).not.toMatch(/keywords/);
    expect(view).toContain("post.tags");
  });
});
