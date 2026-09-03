/** @vitest-environment jsdom */
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { BlogEditorView } from "@/components/blog/BlogEditorView";
import { blogWriteEditorExtensions } from "@/lib/blog-writer-editor";
import { bindCtaButtonEditHandler, insertCtaButton } from "@/lib/cta-button";
import { applyHtmlSource } from "@/lib/tiptap-html-source";

const emptyEditorProps = {
  title: "",
  onTitleChange: () => {},
  metaDescription: "",
  onMetaDescriptionChange: () => {},
  categoryId: "",
  onCategoryChange: () => {},
  categories: [] as { id: string; name: string }[],
  tags: [] as string[],
  onTagsChange: () => {},
  keywords: [] as string[],
  onKeywordsChange: () => {},
  submitting: false,
  onSubmit: () => {},
  authorLabel: "writer@yaarzo.com",
  uploadingImage: false,
  onUploadImage: async () => null,
  mode: "create" as const,
  postStatus: null,
  highlightImageSeo: false,
  existingSlug: null,
};

function renderNewPostEditor(editor: Editor | null) {
  return renderToString(createElement(BlogEditorView, { ...emptyEditorProps, editor }));
}

describe("/blog/write new post", () => {
  it("renders a brand-new post (no existing content) without throwing", () => {
    expect(() => renderNewPostEditor(null)).not.toThrow();
    const html = renderNewPostEditor(null);
    expect(html).toContain("Article Title (H1)");
    expect(html).toContain("Loading editor");
    expect(html).not.toContain("Something went wrong");
  });

  it("creates the empty TipTap editor used by /blog/write and keeps CTA + code view working", () => {
    const editor = new Editor({
      extensions: blogWriteEditorExtensions(),
      content: "<p></p>",
    });
    expect(editor.getHTML()).toContain("<p>");
    expect(() => bindCtaButtonEditHandler(editor, () => {})).not.toThrow();
    expect(() => renderNewPostEditor(editor)).not.toThrow();

    insertCtaButton(editor, { label: "Sign Up on Yaarzo", href: "/signup" });
    expect(editor.getHTML()).toContain("cta-button");
    expect(editor.getHTML()).toContain("/signup");

    const applied = applyHtmlSource(editor, editor.getHTML());
    expect(applied.ok).toBe(true);
    editor.destroy();
  });
});
