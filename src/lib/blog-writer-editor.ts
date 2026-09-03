import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EDITOR_LINK_OPTIONS } from "@/lib/pages-cms/tiptap-html-blocks";
import { BlogImage } from "@/lib/blog-image";
import { CtaButton } from "@/lib/cta-button";

/** TipTap extensions for /blog/write. Kept here so tests can boot a new empty post without importing the route. */
export function blogWriteEditorExtensions() {
  return [
    StarterKit.configure({
      link: false,
      heading: { levels: [2, 3] },
    }),
    Link.configure(EDITOR_LINK_OPTIONS),
    BlogImage.configure({ inline: false, allowBase64: false }),
    CtaButton,
    Placeholder.configure({ placeholder: "Start writing your post here…" }),
  ];
}
