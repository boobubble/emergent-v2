import { Node } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { sanitizeCtaHref } from "@/lib/page-cta";

export const CTA_BUTTON_NODE = "ctaButton";
export const CTA_BUTTON_CLASS = "cta-button";
export const CTA_BUTTON_LINK_CLASS = "cta-button-link";

export const DEFAULT_CTA_LABEL = "Learn more";
export const DEFAULT_CTA_HREF = "/chatrooms";

export type CtaButtonAttrs = {
  label: string;
  href: string;
};

export type CtaButtonStorage = {
  requestEdit: ((attrs: CtaButtonAttrs) => void) | null;
};

export function sanitizeCtaLabel(raw: string | null | undefined): string {
  const label = String(raw ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/→/g, "")
    .trim();
  return label || DEFAULT_CTA_LABEL;
}

export function normalizeCtaButtonAttrs(attrs: Partial<CtaButtonAttrs> | null | undefined): CtaButtonAttrs {
  return {
    label: sanitizeCtaLabel(attrs?.label),
    href: sanitizeCtaHref(attrs?.href ?? ""),
  };
}

function parseCtaButtonElement(el: HTMLElement): CtaButtonAttrs {
  const nested = el.querySelector("a");
  const href = el.getAttribute("data-href") || nested?.getAttribute("href") || "";
  const dataLabel = el.getAttribute("data-label");
  const nestedLabel =
    nested?.querySelector("span:not([aria-hidden])")?.textContent || nested?.textContent || "";
  return normalizeCtaButtonAttrs({
    href,
    label: dataLabel || nestedLabel,
  });
}

/** Canonical HTML used by code view and public render. */
export function buildCtaButtonHtml(attrs: Partial<CtaButtonAttrs>): string {
  const { label, href } = normalizeCtaButtonAttrs(attrs);
  const esc = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  return [
    `<div class="${CTA_BUTTON_CLASS}" data-href="${esc(href)}" data-label="${esc(label)}">`,
    `<a href="${esc(href)}" class="${CTA_BUTTON_LINK_CLASS}">`,
    `<span>${esc(label)}</span>`,
    `<span aria-hidden="true">→</span>`,
    `</a>`,
    `</div>`,
  ].join("");
}

export function insertCtaButton(editor: Editor, attrs: Partial<CtaButtonAttrs>): boolean {
  return editor
    .chain()
    .focus()
    .insertContent({ type: CTA_BUTTON_NODE, attrs: normalizeCtaButtonAttrs(attrs) })
    .run();
}

export function updateCtaButton(editor: Editor, attrs: Partial<CtaButtonAttrs>): boolean {
  return editor
    .chain()
    .focus()
    .updateAttributes(CTA_BUTTON_NODE, normalizeCtaButtonAttrs(attrs))
    .run();
}

export function bindCtaButtonEditHandler(
  editor: Editor,
  handler: (attrs: CtaButtonAttrs) => void,
): () => void {
  editor.storage.ctaButton.requestEdit = handler;
  return () => {
    if (editor.storage.ctaButton) editor.storage.ctaButton.requestEdit = null;
  };
}

function renderCtaDom(attrs: CtaButtonAttrs): {
  wrap: HTMLDivElement;
  link: HTMLAnchorElement;
  labelSpan: HTMLSpanElement;
} {
  const wrap = document.createElement("div");
  wrap.className = CTA_BUTTON_CLASS;
  wrap.setAttribute("data-href", attrs.href);
  wrap.setAttribute("data-label", attrs.label);
  wrap.setAttribute("contenteditable", "false");

  const link = document.createElement("a");
  link.className = CTA_BUTTON_LINK_CLASS;
  link.href = attrs.href;
  link.setAttribute("draggable", "false");

  const labelSpan = document.createElement("span");
  labelSpan.textContent = attrs.label;

  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";

  link.append(labelSpan, arrow);
  wrap.append(link);
  return { wrap, link, labelSpan };
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ctaButton: {
      insertCtaButton: (attrs: Partial<CtaButtonAttrs>) => ReturnType;
      updateCtaButton: (attrs: Partial<CtaButtonAttrs>) => ReturnType;
    };
  }
}

/** Shared TipTap node for blog + custom page editors. */
export const CtaButton = Node.create<Record<string, never>, CtaButtonStorage>({
  name: CTA_BUTTON_NODE,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,

  addStorage() {
    return { requestEdit: null } satisfies CtaButtonStorage;
  },

  addAttributes() {
    return {
      label: {
        default: DEFAULT_CTA_LABEL,
        parseHTML: (el) => parseCtaButtonElement(el as HTMLElement).label,
        renderHTML: () => ({}),
      },
      href: {
        default: DEFAULT_CTA_HREF,
        parseHTML: (el) => parseCtaButtonElement(el as HTMLElement).href,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div.${CTA_BUTTON_CLASS}`, priority: 60 }];
  },

  renderHTML({ node }) {
    const attrs = normalizeCtaButtonAttrs({
      label: node.attrs.label,
      href: node.attrs.href,
    });
    return [
      "div",
      {
        class: CTA_BUTTON_CLASS,
        "data-href": attrs.href,
        "data-label": attrs.label,
      },
      [
        "a",
        { href: attrs.href, class: CTA_BUTTON_LINK_CLASS },
        ["span", {}, attrs.label],
        ["span", { "aria-hidden": "true" }, "→"],
      ],
    ];
  },

  addCommands() {
    return {
      insertCtaButton:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: normalizeCtaButtonAttrs(attrs),
          }),
      updateCtaButton:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, normalizeCtaButtonAttrs(attrs)),
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let attrs = normalizeCtaButtonAttrs(node.attrs);
      const { wrap, link, labelSpan } = renderCtaDom(attrs);

      const onClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        const pos = typeof getPos === "function" ? getPos() : null;
        if (typeof pos === "number") {
          editor.chain().setNodeSelection(pos).run();
        }
        editor.storage.ctaButton.requestEdit?.({ ...attrs });
      };

      wrap.addEventListener("click", onClick, true);

      return {
        dom: wrap,
        ignoreMutation: () => true,
        update: (updated) => {
          if (updated.type.name !== CTA_BUTTON_NODE) return false;
          attrs = normalizeCtaButtonAttrs(updated.attrs);
          wrap.setAttribute("data-href", attrs.href);
          wrap.setAttribute("data-label", attrs.label);
          link.href = attrs.href;
          labelSpan.textContent = attrs.label;
          return true;
        },
        destroy: () => {
          wrap.removeEventListener("click", onClick, true);
        },
      };
    };
  },
});
