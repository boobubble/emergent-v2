import { Node, mergeAttributes } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import { isSafeHref, normalizeSafeHref } from "@/lib/safe-href";

/** Preserve classed <div> wrappers (CTA, callout) through getHTML / setContent. */
export const HtmlDiv = Node.create({
  name: "htmlDiv",
  group: "block",
  content: "block*",
  defining: true,
  parseHTML() {
    // Generic ctaButton node owns div.cta-button; do not swallow it as a raw wrapper.
    return [{ tag: "div:not(.cta-button)" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },
  addAttributes() {
    return {
      class: { default: null },
    };
  },
});

/** Preserve TOC <nav> inserted by the page editor. */
export const HtmlNav = Node.create({
  name: "htmlNav",
  group: "block",
  content: "block*",
  defining: true,
  parseHTML() {
    return [{ tag: "nav" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["nav", mergeAttributes(HTMLAttributes), 0];
  },
  addAttributes() {
    return {
      class: { default: null },
      "aria-label": { default: null },
    };
  },
});

/** Keep class on links so CTA buttons round-trip through code view. */
export const ClassedLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {}),
      },
    };
  },
});

/** Shared Link options for CMS + blog editors (relative /https hrefs must round-trip). */
export const EDITOR_LINK_OPTIONS = {
  openOnClick: false,
  autolink: true,
  protocols: ["http", "https", "mailto"] as string[],
  isAllowedUri: (url: string, ctx?: { defaultValidate?: (href: string) => boolean }) => {
    if (isSafeHref(url)) return true;
    if (!url || /^(javascript|data|vbscript):/i.test(url)) return false;
    return ctx?.defaultValidate ? !!ctx.defaultValidate(url) : false;
  },
};

/**
 * Apply a text link after window.prompt(), which often clears the TipTap selection.
 * Capture from/to before prompting; restore before setLink.
 */
export function applyEditorTextLink(
  editor: Editor,
  href: string,
  selection: { from: number; to: number },
): boolean {
  const safe = normalizeSafeHref(href);
  if (!safe) return false;
  return editor
    .chain()
    .focus()
    .setTextSelection(selection)
    .extendMarkRange("link")
    .setLink({ href: safe })
    .run();
}

export function unsetEditorTextLink(editor: Editor, selection: { from: number; to: number }): boolean {
  return editor.chain().focus().setTextSelection(selection).extendMarkRange("link").unsetLink().run();
}
