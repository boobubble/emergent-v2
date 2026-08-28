import Image from "@tiptap/extension-image";

export const BLOG_IMAGE_ALIGNS = ["left", "center", "right"] as const;
export type BlogImageAlign = (typeof BLOG_IMAGE_ALIGNS)[number];

export function normalizeBlogImageAlign(value: unknown): BlogImageAlign {
  return value === "left" || value === "right" ? value : "center";
}

export function blogImageClassName(align: BlogImageAlign): string {
  return `yz-blog-img yz-blog-img-${align}`;
}

export function parseBlogImageAlign(className: string | null | undefined, dataAlign: string | null | undefined): BlogImageAlign {
  const fromData = normalizeBlogImageAlign(dataAlign);
  if (dataAlign === "left" || dataAlign === "right" || dataAlign === "center") return fromData;
  const cls = className ?? "";
  if (/\byz-blog-img-left\b/.test(cls)) return "left";
  if (/\byz-blog-img-right\b/.test(cls)) return "right";
  return "center";
}

/** Reuses @tiptap/extension-image. Alignment is stored as data-align + class so it survives save/render. */
export const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) =>
          parseBlogImageAlign(element.getAttribute("class"), element.getAttribute("data-align")),
        renderHTML: (attributes) => {
          const align = normalizeBlogImageAlign(attributes.align);
          return {
            "data-align": align,
            class: blogImageClassName(align),
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
