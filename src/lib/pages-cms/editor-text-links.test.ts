/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { ClassedLink, HtmlDiv, HtmlNav, EDITOR_LINK_OPTIONS, applyEditorTextLink } from "./tiptap-html-blocks";
import { CtaButton } from "@/lib/cta-button";
import { normalizePageContentForSave, sanitizePageContentHtml, createPageContentPurifyConfig } from "@/lib/page-content-paste";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { sanitizeHtml } from "@/lib/pages-io";
import { rewriteCmsHtml } from "./content-quality";
import { buildCustomPageWriteRow } from "./page-write";
import { extractPublicCmsHrefSlugs } from "./public-links";
import DOMPurify from "isomorphic-dompurify";

const MANUAL = `<p>Check out our <a href="/bahrain-chat-room">Bahrain chat room</a> too.</p>`;
const TIPTAP_SHAPED =
  `<p>Check out our <a target="_blank" rel="noopener noreferrer nofollow" href="/bahrain-chat-room">Bahrain chat room</a> too.</p>`;
const ABSOLUTE = `<p>See <a href="https://yaarzo.com/uk-chat-room">UK chat room</a>.</p>`;

function pageEditor(content = "<p>Check out our Bahrain chat room too.</p>") {
  return new Editor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      ClassedLink.configure({
        ...EDITOR_LINK_OPTIONS,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      CtaButton,
      HtmlDiv,
      HtmlNav,
    ],
    content,
  });
}

function blogEditor(content = "<p>Check out our Bahrain chat room too.</p>") {
  return new Editor({
    extensions: [
      StarterKit.configure({ link: false, heading: { levels: [2, 3] } }),
      Link.configure(EDITOR_LINK_OPTIONS),
      CtaButton,
    ],
    content,
  });
}

function setLinkOnPhrase(editor: Editor, phrase: string, href: string) {
  const docText = editor.state.doc.textContent;
  const index = docText.indexOf(phrase);
  expect(index).toBeGreaterThanOrEqual(0);
  const from = index + 1;
  const to = from + phrase.length;
  const ok = applyEditorTextLink(editor, href, { from, to });
  expect(ok).toBe(true);
}

describe("manual text links survive editor serialize + save", () => {
  it("page editor setLink HTML still has href after normalizePageContentForSave and reload", () => {
    const editor = pageEditor();
    setLinkOnPhrase(editor, "Bahrain chat room", "/bahrain-chat-room");
    const fromEditor = editor.getHTML();
    expect(fromEditor).toContain('href="/bahrain-chat-room"');
    expect(fromEditor).toMatch(/<a\b[^>]*>Bahrain chat room<\/a>/);

    const saved = normalizePageContentForSave(fromEditor).html;
    expect(saved).toContain('href="/bahrain-chat-room"');
    expect(saved).toContain("Bahrain chat room");

    const reloaded = pageEditor("<p></p>");
    reloaded.commands.setContent(saved);
    expect(reloaded.getHTML()).toContain('href="/bahrain-chat-room"');
    expect(reloaded.getHTML()).toMatch(/<a\b[^>]*>Bahrain chat room<\/a>/);

    const row = buildCustomPageWriteRow(
      {
        slug: "test-page",
        title: "Test",
        content: saved,
        status: "published",
        featured: false,
        layout: "boxed",
        sidebar_left: "none",
        sidebar_right: "none",
        tags: [],
        noindex: false,
        nofollow: false,
      },
      { userId: "00000000-0000-0000-0000-000000000001" },
    );
    expect(String(row.row.content)).toContain('href="/bahrain-chat-room"');

    editor.destroy();
    reloaded.destroy();
  });

  it("blog editor setLink HTML still has href after sanitizeBlogHtml and reload", () => {
    const editor = blogEditor();
    setLinkOnPhrase(editor, "Bahrain chat room", "/uk-chat-room");
    const fromEditor = editor.getHTML();
    expect(fromEditor).toContain('href="/uk-chat-room"');

    const saved = sanitizeBlogHtml(fromEditor);
    expect(saved).toContain('href="/uk-chat-room"');

    const reloaded = blogEditor("<p></p>");
    reloaded.commands.setContent(saved);
    expect(reloaded.getHTML()).toContain('href="/uk-chat-room"');

    editor.destroy();
    reloaded.destroy();
  });

  it("DOMPurify page-save config keeps relative and https text links", () => {
    const cfg = createPageContentPurifyConfig();
    const out = String(DOMPurify.sanitize(TIPTAP_SHAPED, cfg));
    expect(out).toContain('href="/bahrain-chat-room"');
    expect(out).toContain("Bahrain chat room");
    expect(String(DOMPurify.sanitize(ABSOLUTE, cfg))).toContain("https://yaarzo.com/uk-chat-room");
    expect(String(DOMPurify.sanitize(`<p><a href="javascript:alert(1)">x</a></p>`, cfg))).not.toContain("javascript:");
  });

  it("save sanitizers keep relative and absolute https text links", () => {
    expect(sanitizePageContentHtml(MANUAL)).toContain('href="/bahrain-chat-room"');
    expect(sanitizePageContentHtml(TIPTAP_SHAPED)).toContain('href="/bahrain-chat-room"');
    expect(sanitizePageContentHtml(ABSOLUTE)).toContain("https://yaarzo.com/uk-chat-room");
    expect(normalizePageContentForSave(MANUAL).html).toContain('href="/bahrain-chat-room"');
    expect(sanitizeBlogHtml(MANUAL)).toContain('href="/bahrain-chat-room"');
    expect(sanitizeBlogHtml(TIPTAP_SHAPED)).toContain('href="/bahrain-chat-room"');
    expect(sanitizeBlogHtml(ABSOLUTE)).toContain("https://yaarzo.com/uk-chat-room");
    expect(sanitizeHtml(MANUAL)).toContain('href="/bahrain-chat-room"');
  });

  it("public rewriteCmsHtml does not unwrap a published manual text link", () => {
    const out = rewriteCmsHtml(TIPTAP_SHAPED, {
      publishedSlugs: ["bahrain-chat-room", "india-chat-room"],
    });
    expect(out).toContain('href="/bahrain-chat-room"');
    expect(out).toContain("Bahrain chat room");
  });

  it("keeps a manual link even when the published-slug catalog is incomplete", () => {
    expect(extractPublicCmsHrefSlugs(TIPTAP_SHAPED)).toContain("bahrain-chat-room");
    const html =
      `<p>See <a href="/india-chat-room">India</a> and ` +
      `<a target="_blank" rel="noopener noreferrer nofollow" href="/bahrain-chat-room">Bahrain chat room</a>.</p>`;
    const out = rewriteCmsHtml(html, { publishedSlugs: ["india-chat-room"] });
    expect(out).toContain('href="/bahrain-chat-room"');
  });

  it("rewrites a bare internal slug instead of stripping the href", () => {
    const raw = `<p>Check out our <a href="bahrain-chat-room">Bahrain chat room</a> too.</p>`;
    expect(sanitizePageContentHtml(raw)).toContain('href="/bahrain-chat-room"');
    expect(sanitizeBlogHtml(raw)).toContain('href="/bahrain-chat-room"');
    expect(normalizePageContentForSave(raw).html).toContain('href="/bahrain-chat-room"');
  });

  it("still strips javascript: hrefs", () => {
    const dirty = `<p><a href="javascript:alert(1)">x</a></p>`;
    expect(sanitizePageContentHtml(dirty)).not.toContain("javascript:");
    expect(sanitizeBlogHtml(dirty)).not.toContain("javascript:");
  });
});
