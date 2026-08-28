import type { Editor } from "@tiptap/react";
import type { ContentImageDraft } from "@/components/content-images/ContentImageDialog";

export type EditorImageTarget = {
  pos: number;
  attrs: Record<string, unknown>;
};

export function listEditorImages(editor: Editor | null): EditorImageTarget[] {
  if (!editor) return [];
  const out: EditorImageTarget[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "image") {
      out.push({ pos, attrs: node.attrs as Record<string, unknown> });
    }
  });
  return out;
}

export function imageDraftAttrs(draft: ContentImageDraft): Record<string, unknown> {
  return {
    src: draft.src,
    alt: draft.decorative ? "" : draft.alt,
    title: draft.title || null,
    align: draft.align,
    decorative: draft.decorative,
    width: draft.width || null,
    height: draft.height || null,
    optimized: draft.optimized,
    bytes: draft.bytes,
  };
}

export function insertEditorImage(editor: Editor | null, draft: ContentImageDraft) {
  if (!editor) return;
  editor.chain().focus().insertContent({ type: "image", attrs: imageDraftAttrs(draft) }).run();
}

export function updateEditorImage(editor: Editor | null, index: number, draft: ContentImageDraft) {
  const target = listEditorImages(editor)[index];
  if (!editor || !target) return;
  editor.chain().setNodeSelection(target.pos).updateAttributes("image", imageDraftAttrs(draft)).run();
}

export function selectEditorImage(editor: Editor | null, index: number) {
  const target = listEditorImages(editor)[index];
  if (!editor || !target) return;
  editor.chain().setNodeSelection(target.pos).scrollIntoView().run();
}

export function removeEditorImage(editor: Editor | null, index: number) {
  const target = listEditorImages(editor)[index];
  if (!editor || !target) return;
  editor.chain().setNodeSelection(target.pos).deleteSelection().run();
}

export function updateEditorImageAttrs(editor: Editor | null, index: number, attrs: Record<string, unknown>) {
  const target = listEditorImages(editor)[index];
  if (!editor || !target) return;
  editor.chain().setNodeSelection(target.pos).updateAttributes("image", attrs).run();
}
