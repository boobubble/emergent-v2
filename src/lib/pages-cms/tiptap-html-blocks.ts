import { Node, mergeAttributes } from "@tiptap/core";
import Link from "@tiptap/extension-link";

/** Preserve classed <div> wrappers (CTA, callout) through getHTML / setContent. */
export const HtmlDiv = Node.create({
  name: "htmlDiv",
  group: "block",
  content: "block*",
  defining: true,
  parseHTML() {
    return [{ tag: "div" }];
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
