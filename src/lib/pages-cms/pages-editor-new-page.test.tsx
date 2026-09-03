/** @vitest-environment jsdom */
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { EMPTY_PAGE_EDITOR_HTML, pageEditorExtensions } from "@/lib/pages-cms/page-editor-extensions";
import { evaluatePageQuality } from "@/lib/pages-cms/content-quality";
import { bindCtaButtonEditHandler, insertCtaButton } from "@/lib/cta-button";
import { applyHtmlSource } from "@/lib/tiptap-html-source";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("/pages-editor/new empty page", () => {
  it("keeps the new-page route on useAuth and does not touch the unloaded Supabase proxy", () => {
    const route = read("src/routes/pages-editor.$id.tsx");
    const editor = read("src/components/admin/RichTextEditor.tsx");
    expect(route).toContain('createFileRoute("/pages-editor/$id")');
    expect(route).toContain('const isNew = id === "new"');
    expect(route).toContain("useAuth");
    expect(route).toContain("PageEditorGate");
    expect(route).toContain("Admin access required");
    expect(route).toContain("Checking access");
    expect(route).not.toContain('from "@/integrations/supabase/client"');
    expect(route).not.toContain("loadBrowserSupabase");
    expect(route).not.toContain("supabase.auth.getUser");
    expect(editor).toContain("immediatelyRender: false");
    expect(editor).toContain("pageEditorExtensions");
    expect(editor).toContain("EMPTY_PAGE_EDITOR_HTML");
    expect(editor).toContain("loadBrowserSupabase");
    expect(editor).toContain("Loading editor");
    expect(editor).not.toContain('from "@/integrations/supabase/client"');
  });

  it("renders a brand-new page (no existing content) without throwing", () => {
    expect(() =>
      evaluatePageQuality({
        slug: "",
        title: "",
        h1: "",
        meta_title: "",
        meta_description: "",
        canonical_url: "",
        content: "",
        intro_content: "",
        tags: [],
        noindex: false,
      }),
    ).not.toThrow();

    expect(() =>
      renderToString(createElement(RichTextEditor, { value: "", onChange: () => {} })),
    ).not.toThrow();
    const html = renderToString(createElement(RichTextEditor, { value: "", onChange: () => {} }));
    expect(html).toContain("Loading editor");
    expect(html).not.toContain("Something went wrong");
    expect(html).not.toContain("The application section hit a problem");
  });

  it("creates the empty TipTap editor used by /pages-editor/new and keeps CTA + code view working", () => {
    const editor = new Editor({
      extensions: pageEditorExtensions(),
      content: EMPTY_PAGE_EDITOR_HTML,
    });
    expect(editor.getHTML()).toContain("<p>");
    expect(() => bindCtaButtonEditHandler(editor, () => {})).not.toThrow();

    insertCtaButton(editor, { label: "Start Chatting Now", href: "/chatroom" });
    expect(editor.getHTML()).toContain("cta-button");
    expect(editor.getHTML()).toContain("/chatroom");

    const applied = applyHtmlSource(editor, editor.getHTML());
    expect(applied.ok).toBe(true);
    editor.destroy();
  });
});
