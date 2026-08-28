import Image from "@tiptap/extension-image";

/** CMS TipTap image attrs for alt / decorative / optimization — stored in existing HTML. */
export const CmsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
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
