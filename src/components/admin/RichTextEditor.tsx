import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Minus, Code2, Undo2, Redo2, Upload, Loader2, CheckSquare,
  Table as TableIcon, Info, ListTree, Eye, Pencil, MousePointerClick,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/pages-io";
import { injectHeadingIds } from "@/lib/heading-ids";
import { processPastedPageContent } from "@/lib/page-content-paste";
import { Switch } from "@/components/ui/switch";
import { InsertCtaDialog } from "@/components/admin/InsertCtaDialog";
import { DEFAULT_PAGE_CTA_DEFAULTS, type PageCtaDefaults } from "@/lib/page-cta";
import { ContentImageDialog, type ContentImageDraft } from "@/components/content-images/ContentImageDialog";
import {
  removeEditorImage,
  selectEditorImage,
  updateEditorImage,
} from "@/components/content-images/editor-images";
import { optimizeImageFromUrl } from "@/lib/content-image-optimize";
import { CmsImage, insertCmsEditorImage, rememberCmsImageInsertPos } from "@/lib/pages-cms/cms-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "@/lib/pages-cms/cms-page-images.css";

export type RichTextEditorHandle = {
  openInsert: () => void;
  fixImage: (index: number) => void;
  removeImage: (index: number) => void;
};

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  uploadFolder?: string;
  /** Pre-fill Insert CTA dialog for new pages (does not auto-insert). */
  ctaDefaults?: PageCtaDefaults;
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(function RichTextEditor(
  { value, onChange, placeholder, uploadFolder = "pages", ctaDefaults },
  ref,
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [detectPlainTextHeadings, setDetectPlainTextHeadings] = useState(false);
  const [ctaDialogOpen, setCtaDialogOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const detectPlainTextRef = useRef(false);
  const editorRef = useRef<Editor | null>(null);
  const insertPosRef = useRef<number | null>(null);

  useEffect(() => {
    detectPlainTextRef.current = detectPlainTextHeadings;
  }, [detectPlainTextHeadings]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-md bg-muted p-3 text-xs font-mono" } },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
      CmsImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Write your page content…" }),
      TaskList.configure({ HTMLAttributes: { class: "not-prose space-y-1" } }),
      TaskItem.configure({ nested: true, HTMLAttributes: { class: "flex gap-2 items-start" } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "border-collapse w-full my-3" } }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: "border border-border bg-muted px-2 py-1 text-left font-semibold" } }),
      TableCell.configure({ HTMLAttributes: { class: "border border-border px-2 py-1 align-top" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert min-h-[320px] max-w-none p-3 text-sm outline-none focus:outline-none",
      },
      handlePaste(_view, event) {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const html = clipboard.getData("text/html")?.trim();
        const plain = clipboard.getData("text/plain")?.trim();

        if (html) {
          const { html: processed, warnings } = processPastedPageContent({
            html,
            detectPlainTextHeadings: detectPlainTextRef.current,
            pageTitleOwnsH1: true,
          });
          event.preventDefault();
          editorRef.current?.chain().focus().insertContent(processed).run();
          for (const w of warnings) toast.info(w, { duration: 5000 });
          return true;
        }

        if (plain && detectPlainTextRef.current) {
          const { html: processed, warnings } = processPastedPageContent({
            plainText: plain,
            detectPlainTextHeadings: true,
            pageTitleOwnsH1: true,
          });
          event.preventDefault();
          editorRef.current?.chain().focus().insertContent(processed).run();
          for (const w of warnings) toast.info(w, { duration: 5000 });
          return true;
        }

        return false;
      },
    },
    onCreate: ({ editor: ed }) => {
      editorRef.current = ed;
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    onFocus: ({ editor: ed }) => {
      insertPosRef.current = rememberCmsImageInsertPos(ed, insertPosRef.current);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      insertPosRef.current = rememberCmsImageInsertPos(ed, insertPosRef.current);
    },
    onBlur: ({ editor: ed }) => {
      insertPosRef.current = rememberCmsImageInsertPos(ed, insertPosRef.current);
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep editor in sync when external value changes (e.g., draft restore).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files are supported"); return null; }
    if (file.size > MAX_UPLOAD_BYTES) { toast.error("Image must be under 8 MB"); return null; }
    setUploading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { toast.error("You must be signed in to upload"); return null; }
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${uid}/${uploadFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }, [uploadFolder]);

  const beginImageInsert = () => {
    if (editor) {
      insertPosRef.current = rememberCmsImageInsertPos(editor, insertPosRef.current);
    }
    setReplaceIndex(null);
    setImageOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openInsert() {
      beginImageInsert();
    },
    fixImage(index: number) {
      selectEditorImage(editor, index);
      setReplaceIndex(index);
    },
    removeImage(index: number) {
      removeEditorImage(editor, index);
    },
  }), [editor]);

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const url = await uploadFile(file);
    if (url) {
      insertCmsEditorImage(editor, {
        src: url,
        alt: file.name.replace(/\.[^.]+$/, ""),
        title: "",
        align: "center",
        decorative: false,
        width: null,
        height: null,
        optimized: file.type.includes("webp") || file.type.includes("avif") ? "true" : null,
        bytes: file.size,
      }, insertPosRef.current);
    }
  };

  const insertLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL (https://… or /internal-slug)", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImageByUrl = () => {
    beginImageInsert();
  };

  const insertCallout = (variant: "info" | "warning" | "success" | "danger" = "info") => {
    if (!editor) return;
    const html = `<div class="callout callout-${variant}"><p>💡 Type your callout here…</p></div><p></p>`;
    editor.chain().focus().insertContent(html).run();
  };

  const insertTable = () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  const insertTOC = () => {
    if (!editor) return;
    const headings: { level: number; text: string; id: string }[] = [];
    const used = new Set<string>();
    editor.state.doc.descendants((node) => {
      if (node.type.name === "heading" && (node.attrs.level === 2 || node.attrs.level === 3)) {
        const text = node.textContent.trim();
        if (!text) return;
        let id = text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "section";
        let base = id, n = 2;
        while (used.has(id)) id = `${base}-${n++}`;
        used.add(id);
        headings.push({ level: node.attrs.level, text, id });
      }
    });
    if (!headings.length) { toast.info("Add some H2 or H3 headings first"); return; }
    const items = headings.map((h) =>
      `<li class="toc-l${h.level}"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`
    ).join("");
    const toc = `<nav class="toc" aria-label="Table of contents"><div class="toc-title">Table of contents</div><ul>${items}</ul></nav><p></p>`;
    editor.chain().focus("start").insertContentAt(0, toc).run();
    toast.success("Table of contents inserted");
  };

  const previewHtml = useMemo(
    () => (editor ? sanitizeHtml(injectHeadingIds(editor.getHTML())) : ""),
    [editor, mode],
  );

  if (!editor) {
    return (
      <div className="rounded-md border border-input bg-background p-4 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        <TB active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraph"><span className="text-[10px] font-semibold">P</span></TB>
        <Sep />
        <TB active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist"><CheckSquare className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block"><Code2 className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB active={editor.isActive("link")} onClick={insertLink} title="Link"><LinkIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={beginImageInsert} title="Upload image">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        </TB>
        <TB onClick={insertImageByUrl} title="Image by URL"><ImageIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertTable} title="Insert table"><TableIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => insertCallout("info")} title="Callout / Info box"><Info className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => setCtaDialogOpen(true)} title="Insert CTA"><MousePointerClick className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertTOC} title="Insert Table of Contents"><ListTree className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 className="h-3.5 w-3.5" /></TB>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground" title="When enabled, plain-text paste may detect Markdown-style or standalone headings">
            <Switch
              checked={detectPlainTextHeadings}
              onCheckedChange={setDetectPlainTextHeadings}
              className="scale-75"
            />
            Detect headings from plain text
          </label>
          <div className="flex items-center rounded-md border p-0.5">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] ${mode === "edit" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] ${mode === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickFile} />

      {editor.isActive("image") && (
        <div className="flex flex-col gap-2 border-b border-border bg-muted/30 px-3 py-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Label htmlFor="cms-selected-alt" className="text-[11px] text-muted-foreground">Alt text</Label>
            <Input
              id="cms-selected-alt"
              className="mt-1 h-8"
              value={String(editor.getAttributes("image").alt ?? "")}
              onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value, decorative: false }).run()}
              placeholder="Describe the image for accessibility and search engines."
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => {
              let index = 0;
              let found = 0;
              editor.state.doc.descendants((node, pos) => {
                if (node.type.name !== "image") return;
                const { from } = editor.state.selection;
                if (from >= pos && from <= pos + node.nodeSize) found = index;
                index += 1;
              });
              setReplaceIndex(found);
            }}>
              Replace Image
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[11px]"
              disabled={optimizing}
              onClick={async () => {
                const src = String(editor.getAttributes("image").src ?? "");
                if (!src) return;
                setOptimizing(true);
                try {
                  const result = await optimizeImageFromUrl(src);
                  if (!result) {
                    editor.chain().updateAttributes("image", { optimized: "unavailable" }).run();
                    toast.message("Optimization unavailable. Publishing is not blocked.");
                    return;
                  }
                  const url = await uploadFile(result.file);
                  if (url) {
                    editor.chain().updateAttributes("image", {
                      src: url,
                      width: result.width || null,
                      height: result.height || null,
                      optimized: "true",
                      bytes: result.outputBytes,
                    }).run();
                  }
                } finally {
                  setOptimizing(false);
                }
              }}
            >
              {optimizing ? "Optimizing…" : "Optimize"}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => editor.chain().deleteSelection().run()}>
              Remove Image
            </Button>
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
          if (!file) return;
          e.preventDefault();
          const url = await uploadFile(file);
          if (url) {
            insertCmsEditorImage(editor, {
              src: url,
              alt: file.name.replace(/\.[^.]+$/, ""),
              title: "",
              align: "center",
              decorative: false,
              width: null,
              height: null,
              optimized: file.type.includes("webp") || file.type.includes("avif") ? "true" : null,
              bytes: file.size,
            }, rememberCmsImageInsertPos(editor, insertPosRef.current));
          }
        }}
        onPaste={async (e) => {
          const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
          if (!item) return;
          const file = item.getAsFile();
          if (!file) return;
          e.preventDefault();
          const url = await uploadFile(file);
          if (url) {
            insertCmsEditorImage(editor, {
              src: url,
              alt: "",
              title: "",
              align: "center",
              decorative: false,
              width: null,
              height: null,
              optimized: file.type.includes("webp") || file.type.includes("avif") ? "true" : null,
              bytes: file.size,
            }, rememberCmsImageInsertPos(editor, insertPosRef.current));
          }
        }}
      >
        {mode === "edit" ? (
          <EditorContent editor={editor} />
        ) : (
          <div
            className="custom-page-content prose prose-sm dark:prose-invert min-h-[320px] max-w-none p-3 text-sm"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
      <InsertCtaDialog
        open={ctaDialogOpen}
        onOpenChange={setCtaDialogOpen}
        defaults={ctaDefaults ?? DEFAULT_PAGE_CTA_DEFAULTS}
        onInsert={(html) => {
          editor?.chain().focus().insertContent(html).run();
          toast.success("CTA inserted");
        }}
      />
      <ContentImageDialog
        open={imageOpen || replaceIndex != null}
        onOpenChange={(next) => {
          if (!next) setReplaceIndex(null);
          setImageOpen(next);
        }}
        mode={replaceIndex != null ? "replace" : "insert"}
        showAlign
        uploading={uploading}
        onUpload={uploadFile}
        onInsert={(draft: ContentImageDraft) => {
          if (replaceIndex != null) updateEditorImage(editor, replaceIndex, draft);
          else insertCmsEditorImage(editor, draft, insertPosRef.current);
        }}
      />
    </div>
  );
});

function TB({ children, onClick, title, active }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 ${active ? "bg-muted text-foreground" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );
}
function Sep() { return <div className="mx-1 h-5 w-px bg-border" />; }

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}


// Expose Editor type for consumers if needed later.
export type { Editor };
