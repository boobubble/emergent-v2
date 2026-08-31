/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { applyHtmlSource } from "@/lib/tiptap-html-source";
import { ClassedLink, HtmlDiv } from "@/lib/pages-cms/tiptap-html-blocks";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { sanitizeHtml } from "@/lib/pages-io";
import {
  CTA_BUTTON_NODE,
  CtaButton,
  buildCtaButtonHtml,
  insertCtaButton,
  updateCtaButton,
  type CtaButtonAttrs,
} from "./cta-button";

const LEGACY_CTA = `<div class="custom-page-cta"><a href="/chatrooms" class="custom-page-cta-button"><span>Start Chatting Now</span><span aria-hidden="true">→</span></a><p class="custom-page-cta-note">Free to explore • Join when you are ready</p></div>`;

const POETRY_HTML = `<div class="cta-button" data-href="/poetry-hub" data-label="Explore Poetry Hub">
<a href="/poetry-hub" class="cta-button-link">
<span>Explore Poetry Hub</span>
<span aria-hidden="true">→</span>
</a>
</div>`;

function createBlogEditor() {
  return new Editor({
    extensions: [
      StarterKit.configure({ link: false, heading: { levels: [2, 3] } }),
      Link,
      CtaButton,
    ],
    content: "<p></p>",
  });
}

function createPageEditor() {
  return new Editor({
    extensions: [
      StarterKit.configure({ link: false }),
      ClassedLink.configure({ openOnClick: false }),
      CtaButton,
      HtmlDiv,
    ],
    content: "<p></p>",
  });
}

function findCta(editor: Editor): CtaButtonAttrs | null {
  let found: CtaButtonAttrs | null = null;
  editor.state.doc.descendants((node) => {
    if (node.type.name === CTA_BUTTON_NODE) {
      found = { label: String(node.attrs.label), href: String(node.attrs.href) };
      return false;
    }
  });
  return found;
}

function selectCta(editor: Editor): boolean {
  let pos: number | null = null;
  editor.state.doc.descendants((node, nodePos) => {
    if (node.type.name === CTA_BUTTON_NODE) {
      pos = nodePos;
      return false;
    }
  });
  if (pos == null) return false;
  return editor.chain().setNodeSelection(pos).run();
}

describe("ctaButton node (blog editor)", () => {
  it("inserts via the dialog command with Sign Up on Yaarzo / /signup and round-trips code view", () => {
    const editor = createBlogEditor();
    insertCtaButton(editor, { label: "Sign Up on Yaarzo", href: "/signup" });
    const inserted = findCta(editor);
    expect(inserted).toEqual({ label: "Sign Up on Yaarzo", href: "/signup" });
    const html = editor.getHTML();
    expect(html).toContain('class="cta-button"');
    expect(html).toContain('class="cta-button-link"');
    expect(html).toContain('data-href="/signup"');
    expect(html).toContain('data-label="Sign Up on Yaarzo"');
    expect(html).toContain("Sign Up on Yaarzo");

    const applied = applyHtmlSource(editor, html);
    expect(applied.ok).toBe(true);
    expect(findCta(editor)).toEqual({ label: "Sign Up on Yaarzo", href: "/signup" });
    expect(editor.getHTML()).toContain('data-href="/signup"');
    editor.destroy();
  });
});

describe("ctaButton node (page editor)", () => {
  it("inserts via the dialog command with Start Chatting Now / /chatrooms", () => {
    const editor = createPageEditor();
    insertCtaButton(editor, { label: "Start Chatting Now", href: "/chatrooms" });
    expect(findCta(editor)).toEqual({ label: "Start Chatting Now", href: "/chatrooms" });
    const html = editor.getHTML();
    expect(html).toContain("Start Chatting Now");
    expect(html).toContain("/chatrooms");
    expect(html).toContain("cta-button-link");

    const applied = applyHtmlSource(editor, html);
    expect(applied.ok).toBe(true);
    expect(findCta(editor)).toEqual({ label: "Start Chatting Now", href: "/chatrooms" });
    editor.destroy();
  });

  it("keeps legacy custom-page-cta blocks as HtmlDiv, not ctaButton", () => {
    const editor = createPageEditor();
    const applied = applyHtmlSource(editor, LEGACY_CTA);
    expect(applied.ok).toBe(true);
    expect(findCta(editor)).toBeNull();
    expect(editor.getHTML()).toContain("custom-page-cta");
    expect(editor.getHTML()).toContain("custom-page-cta-button");
    editor.destroy();
  });
});

describe("ctaButton edit + code-view paste", () => {
  it("updates label/href when the dialog save path runs", () => {
    const editor = createBlogEditor();
    insertCtaButton(editor, { label: "Explore Competitions", href: "/competitions" });
    expect(selectCta(editor)).toBe(true);
    updateCtaButton(editor, { label: "Join a Competition Today", href: "/competitions" });
    expect(findCta(editor)).toEqual({
      label: "Join a Competition Today",
      href: "/competitions",
    });
    expect(editor.getHTML()).toContain("Join a Competition Today");
    editor.destroy();
  });

  it("parses a hand-typed poetry-hub HTML block into an editable ctaButton node", () => {
    const editor = createPageEditor();
    const applied = applyHtmlSource(editor, POETRY_HTML);
    expect(applied.ok).toBe(true);
    expect(findCta(editor)).toEqual({ label: "Explore Poetry Hub", href: "/poetry-hub" });
    expect(editor.getHTML()).toContain('data-href="/poetry-hub"');
    expect(editor.getHTML()).toContain("Explore Poetry Hub");
    expect(selectCta(editor)).toBe(true);
    updateCtaButton(editor, { label: "Visit Poetry Hub", href: "/poetry-hub" });
    expect(findCta(editor)).toEqual({ label: "Visit Poetry Hub", href: "/poetry-hub" });
    editor.destroy();
  });
});

describe("ctaButton editor wiring", () => {
  it("registers the shared node and toolbar action in both editors", () => {
    const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
    const blogWrite = read("src/routes/blog.write.tsx");
    const blogView = read("src/components/blog/BlogEditorView.tsx");
    const pageEditor = read("src/components/admin/RichTextEditor.tsx");
    expect(blogWrite).toContain("CtaButton");
    expect(blogView).toContain("Insert CTA Button");
    expect(blogView).toContain("CtaButtonDialog");
    expect(pageEditor).toContain("CtaButton");
    expect(pageEditor).toContain("Insert CTA Button");
    expect(pageEditor).toContain("CtaButtonDialog");
  });
});

describe("ctaButton HTML helpers and sanitizers", () => {
  it("builds the canonical code-view shape", () => {
    const html = buildCtaButtonHtml({ label: "Explore Poetry Hub", href: "/poetry-hub" });
    expect(html).toContain('class="cta-button"');
    expect(html).toContain('data-href="/poetry-hub"');
    expect(html).toContain('data-label="Explore Poetry Hub"');
    expect(html).toContain('class="cta-button-link"');
    expect(html).toContain("aria-hidden");
  });

  it("preserves the generic CTA through blog and page sanitizers", () => {
    const raw = buildCtaButtonHtml({ label: "Sign Up on Yaarzo", href: "/signup" });
    const blog = sanitizeBlogHtml(raw);
    expect(blog).toContain("cta-button");
    expect(blog).toContain("cta-button-link");
    expect(blog).toContain('data-href="/signup"');
    expect(blog).toContain("Sign Up on Yaarzo");

    const page = sanitizeHtml(raw);
    expect(page).toContain("cta-button");
    expect(page).toContain("/signup");
  });

  it("strips javascript: from CTA hrefs", () => {
    const raw = buildCtaButtonHtml({ label: "Go", href: "javascript:alert(1)" });
    expect(raw).not.toContain("javascript:");
    expect(sanitizeBlogHtml(raw)).not.toContain("javascript:");
    expect(sanitizeHtml(raw)).not.toContain("javascript:");
  });
});
