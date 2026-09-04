import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { ClassedLink, HtmlDiv, HtmlNav, EDITOR_LINK_OPTIONS } from "@/lib/pages-cms/tiptap-html-blocks";
import { CtaButton } from "@/lib/cta-button";
import { CmsImage } from "@/lib/pages-cms/cms-image";

export const EMPTY_PAGE_EDITOR_HTML = "<p></p>";

/** TipTap extensions for /pages-editor/$id (including id=new). Kept here so tests can boot an empty page without importing the route. */
export function pageEditorExtensions(placeholder = "Write your page content…") {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      codeBlock: { HTMLAttributes: { class: "rounded-md bg-muted p-3 text-xs font-mono" } },
      link: false,
      underline: false,
    }),
    Underline,
    ClassedLink.configure({
      ...EDITOR_LINK_OPTIONS,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    }),
    CtaButton,
    HtmlDiv,
    HtmlNav,
    CmsImage.configure({ inline: false, allowBase64: false }),
    Placeholder.configure({ placeholder }),
    TaskList.configure({ HTMLAttributes: { class: "not-prose space-y-1" } }),
    TaskItem.configure({ nested: true, HTMLAttributes: { class: "flex gap-2 items-start" } }),
    Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-3" } }),
    TableRow,
    TableHeader.configure({ HTMLAttributes: { class: "border border-border bg-muted px-2 py-1 text-left font-semibold" } }),
    TableCell.configure({ HTMLAttributes: { class: "border border-border px-2 py-1 align-top" } }),
  ];
}
