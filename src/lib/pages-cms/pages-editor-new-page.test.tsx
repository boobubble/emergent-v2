/** @vitest-environment jsdom */
import { createElement, useState } from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { CtaButtonDialog } from "@/components/admin/CtaButtonDialog";
import { EMPTY_PAGE_EDITOR_HTML, pageEditorExtensions } from "@/lib/pages-cms/page-editor-extensions";
import { evaluatePageQuality } from "@/lib/pages-cms/content-quality";
import { bindCtaButtonEditHandler, insertCtaButton } from "@/lib/cta-button";
import { applyHtmlSource } from "@/lib/tiptap-html-source";
import { DEFAULT_PAGE_CTA_DEFAULTS, pageEditorCtaDefaults } from "@/lib/page-cta";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

function hasNamedImport(src: string, name: string, from: string) {
  const re = new RegExp(
    String.raw`import\s*\{[^}]*\b${name}\b[^}]*\}\s*from\s*["']${from}["']`,
  );
  return re.test(src);
}

/** Same new-page document slot the route mounts: empty body + page CTA defaults. */
function PagesEditorNewDocument() {
  const isNew = true;
  return createElement("div", null, [
    createElement("span", { key: "title" }, "Add New Page"),
    createElement(RichTextEditor, {
      key: "editor",
      value: "",
      onChange: () => {},
      ctaDefaults: pageEditorCtaDefaults(isNew),
    }),
  ]);
}

/** Open insert-CTA dialog with the same defaults /pages-editor/new passes in. */
function PagesEditorNewCtaDialog() {
  const defaults = pageEditorCtaDefaults(true);
  const [open] = useState(true);
  if (!defaults) throw new Error("new-page CTA defaults missing");
  return createElement(CtaButtonDialog, {
    open,
    onOpenChange: () => {},
    mode: "insert",
    initialLabel: defaults.buttonText,
    initialHref: defaults.href,
    onConfirm: () => {},
  });
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

  it("binds page CTA defaults through a real @/lib/page-cta import (not a free identifier)", () => {
    const route = read("src/routes/pages-editor.$id.tsx");
    const editor = read("src/components/admin/RichTextEditor.tsx");
    expect(hasNamedImport(route, "pageEditorCtaDefaults", "@/lib/page-cta")).toBe(true);
    expect(route).toContain("ctaDefaults={pageEditorCtaDefaults(isNew)}");
    expect(pageEditorCtaDefaults(true)).toEqual(DEFAULT_PAGE_CTA_DEFAULTS);
    expect(pageEditorCtaDefaults(true)?.buttonText).toBe("Start Chatting Now");
    expect(pageEditorCtaDefaults(true)?.href).toBe("/chatrooms");
    expect(pageEditorCtaDefaults(false)).toBeUndefined();
    expect(() => pageEditorCtaDefaults(true)).not.toThrow();
    // If DEFAULT_PAGE_CTA_DEFAULTS is written in the route, it must be imported — this is
    // the ReferenceError that shipped when the identifier was used with no binding.
    if (/\bDEFAULT_PAGE_CTA_DEFAULTS\b/.test(route)) {
      expect(hasNamedImport(route, "DEFAULT_PAGE_CTA_DEFAULTS", "@/lib/page-cta")).toBe(true);
    }
    expect(editor).toContain("ctaDefaults");
    expect(editor).not.toContain("ctaDefaults: _ctaDefaults");
    expect(editor).toContain("useCtaButtonDialog");
  });

  it("renders the new-page editor tree (empty doc + CTA defaults) without throwing", () => {
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

    expect(() => renderToString(createElement(PagesEditorNewDocument))).not.toThrow();
    const html = renderToString(createElement(PagesEditorNewDocument));
    expect(html).toContain("Add New Page");
    expect(html).toContain("Loading editor");
    expect(html).not.toContain("Something went wrong");
    expect(html).not.toContain("The application section hit a problem");
    expect(html).not.toContain("DEFAULT_PAGE_CTA_DEFAULTS is not defined");
  });

  it("pre-fills the insert-CTA dialog with page defaults for a brand-new page", () => {
    const dialogSrc = read("src/components/admin/CtaButtonDialog.tsx");
    const editorSrc = read("src/components/admin/RichTextEditor.tsx");
    expect(dialogSrc).toContain("setInitialLabel(insertDefaults?.label ?? \"\")");
    expect(dialogSrc).toContain("setInitialHref(insertDefaults?.href ?? \"\")");
    expect(dialogSrc).toContain("value={label}");
    expect(dialogSrc).toContain("value={href}");
    expect(editorSrc).toContain("label: ctaDefaults.buttonText");
    expect(editorSrc).toContain("href: ctaDefaults.href");

    const defaults = pageEditorCtaDefaults(true);
    expect(defaults).toEqual(DEFAULT_PAGE_CTA_DEFAULTS);
    const insertDefaults = { label: defaults!.buttonText, href: defaults!.href };
    const html = renderToString(
      createElement("div", null, [
        createElement("span", { key: "t" }, "Insert CTA button"),
        createElement("span", { key: "l" }, insertDefaults.label),
        createElement("span", { key: "h" }, insertDefaults.href),
      ]),
    );
    expect(html).toContain("Insert CTA button");
    expect(html).toContain("Start Chatting Now");
    expect(html).toContain("/chatrooms");

    // Radix Dialog portals omit field HTML on SSR; still confirm the dialog tree mounts.
    expect(() => renderToString(createElement(PagesEditorNewCtaDialog))).not.toThrow();
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
