import Image from "@tiptap/extension-image";
import type { ContentImageDraft } from "@/components/content-images/ContentImageDialog";
import { imageDraftAttrs } from "@/components/content-images/editor-images";

export const CMS_IMAGE_ALIGNS = ["left", "center", "right"] as const;
export type CmsImageAlign = (typeof CMS_IMAGE_ALIGNS)[number];

export function normalizeCmsImageAlign(value: unknown): CmsImageAlign {
  return value === "left" || value === "right" ? value : "center";
}

export function cmsImageClassName(align: CmsImageAlign): string {
  return `custom-page-img custom-page-img-${align}`;
}

export function parseCmsImageAlign(className: string | null | undefined, dataAlign: string | null | undefined): CmsImageAlign {
  if (dataAlign === "left" || dataAlign === "right" || dataAlign === "center") return dataAlign;
  const cls = className ?? "";
  if (/\bcustom-page-img-left\b/.test(cls)) return "left";
  if (/\bcustom-page-img-right\b/.test(cls)) return "right";
  return "center";
}

type CmsInsertEditor = {
  isFocused: boolean;
  state: {
    selection: { from: number };
    doc: { content: { size: number }; firstChild: { nodeSize: number } | null };
  };
};

function cmsDocEnd(size: number): number {
  return Math.max(0, size - 1);
}

/**
 * Remember the last in-editor caret. After the Image SEO dialog steals focus,
 * TipTap often jumps the selection to the document end — that must not
 * overwrite a previously saved interior caret. An unfocused end-of-doc
 * selection with no prior caret is treated as missing (first-block fallback).
 */
export function rememberCmsImageInsertPos(
  editor: CmsInsertEditor,
  previous: number | null,
): number | null {
  const from = editor.state.selection.from;
  const size = editor.state.doc.content.size;
  const atEnd = from >= cmsDocEnd(size);

  if (editor.isFocused) return from;

  if (atEnd) return previous;
  return previous ?? from;
}

/** Insert point for a saved caret. Missing/out-of-range → after the first block. */
export function resolveCmsImageInsertPos(editor: CmsInsertEditor, savedPos: number | null): number {
  const size = editor.state.doc.content.size;
  const first = editor.state.doc.firstChild;
  const afterFirst = first ? first.nodeSize : 0;
  if (savedPos == null || savedPos < 0 || savedPos > size) return afterFirst;
  return savedPos;
}

type CmsInsertChainEditor = CmsInsertEditor & {
  chain: () => any;
};

/** Custom Pages only. Always insertContentAt — never insertContent (doc-end append). */
export function insertCmsEditorImage(
  editor: CmsInsertChainEditor | null,
  draft: ContentImageDraft,
  savedPos: number | null,
): number | null {
  if (!editor) return null;
  const pos = resolveCmsImageInsertPos(editor, savedPos);
  editor
    .chain()
    .insertContentAt(pos, { type: "image", attrs: imageDraftAttrs(draft) })
    .focus()
    .run();
  return pos;
}

/** CMS TipTap image attrs for alt / decorative / optimization / alignment — stored in existing HTML. */
export const CmsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) =>
          parseCmsImageAlign(element.getAttribute("class"), element.getAttribute("data-align")),
        renderHTML: (attributes) => {
          const align = normalizeCmsImageAlign(attributes.align);
          return {
            "data-align": align,
            class: cmsImageClassName(align),
          };
        },
      },
      decorative: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-decorative") === "true",
        renderHTML: (attributes) => (attributes.decorative ? { "data-decorative": "true" } : {}),
      },
      optimized: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-optimized"),
        renderHTML: (attributes) =>
          attributes.optimized ? { "data-optimized": String(attributes.optimized) } : {},
      },
      bytes: {
        default: null,
        parseHTML: (element) => {
          const v = element.getAttribute("data-bytes");
          return v && /^\d+$/.test(v) ? Number(v) : null;
        },
        renderHTML: (attributes) =>
          attributes.bytes != null ? { "data-bytes": String(attributes.bytes) } : {},
      },
    };
  },
});
