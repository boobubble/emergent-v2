import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { ClassedLink, HtmlDiv, HtmlNav, EDITOR_LINK_OPTIONS, applyEditorTextLink, unsetEditorTextLink } from "@/lib/pages-cms/tiptap-html-blocks";
import { CtaButton } from "@/lib/cta-button";
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
  Table as TableIcon, Info, ListTree, Eye, Pencil, MousePointerClick, CodeXml,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/pages-io";
import { injectHeadingIds } from "@/lib/heading-ids";
import { processPastedPageContent } from "@/lib/page-content-paste";
import { Switch } from "@/components/ui/switch";
import { CtaButtonDialog, useCtaButtonDialog } from "@/components/admin/CtaButtonDialog";
import { type PageCtaDefaults } from "@/lib/page-cta";
import { ContentImageDialog, type ContentImageDraft } from "@/components/content-images/ContentImageDialog";
import {
  removeEditorImage,
  selectEditorImage,
  updateEditorImage,
} from "@/components/content-images/editor-images";
import { optimizeImageFromUrl } from "@/lib/content-image-optimize";
import { CmsImage, insertCmsEditorImage, rememberCmsImageInsertPos } from "@/lib/pages-cms/cms-image";
import { applyHtmlSource } from "@/lib/tiptap-html-source";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import "@/lib/pages-cms/cms-page-images.css";
import "@/lib/cta-button.css";

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
  { value, onChange, placeholder, uploadFolder = "pages", ctaDefaults: _ctaDefaults },
  ref,
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview" | "source">("edit");
  const [sourceHtml, setSourceHtml] = useState("");
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [detectPlainTextHeadings, setDetectPlainTextHeadings] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const detectPlainTextRef = useRef(false);
  const editorRef = useRef<Editor | null>(null);
  const insertPosRef = useRef<number | null>(null);

  useEffect(() => {
    detectPlainTextRef.current = detectPlainTextHeadings;
  }, [detectPlainTextHeadings]);

  const lastEmittedHtml = useRef(value || "");

  const editor = useEditor({
    extensions: [
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
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedHtml.current = html;
      onChange(html);
    },
  });

  const ctaDialog = useCtaButtonDialog(editor);

  // Keep editor in sync when external value changes (e.g., draft restore / save normalize).
  // Skip when the incoming HTML is what this editor just emitted — getHTML() is not a
  // stable string, and setContent() would re-parse and can drop marks.
  useEffect(() => {
    if (!editor || mode === "source") return;
    if (value === lastEmittedHtml.current) return;
    const current = editor.getHTML();
    if (value !== current && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      lastEmittedHtml.current = editor.getHTML();
    }
  }, [value, editor, mode]);

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
    const selection = { from: editor.state.selection.from, to: editor.state.selection.to };
    const url = window.prompt("URL (https://… or /internal-slug)", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      unsetEditorTextLink(editor, selection);
      return;
    }
    applyEditorTextLink(editor, url, selection);
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

  const leaveSourceMode = (next: "edit" | "preview"): boolean => {
    const result = applyHtmlSource(editor, sourceHtml);
    if (!result.ok) {
      setSourceError(result.error);
      return false;
    }
    setSourceError(null);
    setMode(next);
    return true;
  };

  const toggleSourceMode = () => {
    if (mode === "source") {
      leaveSourceMode("edit");
      return;
    }
    setSourceError(null);
    setSourceHtml(editor.getHTML());
    setMode("source");
  };

  if (!editor) {
    return (
      <div className="rounded-md border border-input bg-background p-4 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex max-h-[min(70vh,calc(100vh-11rem))] flex-col overflow-y-auto rounded-md border border-input bg-background">
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 border-b bg-background/95 p-1 shadow-[0_1px_3px_0_rgb(0_0_0_/_.08)] backdrop-blur">
        <TB active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1" disabled={mode === "source"}><Heading1 className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2" disabled={mode === "source"}><Heading2 className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3" disabled={mode === "source"}><Heading3 className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraph" disabled={mode === "source"}><span className="text-[10px] font-semibold">P</span></TB>
        <Sep />
        <TB active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" disabled={mode === "source"}><Bold className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" disabled={mode === "source"}><Italic className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" disabled={mode === "source"}><UnderlineIcon className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list" disabled={mode === "source"}><List className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list" disabled={mode === "source"}><ListOrdered className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist" disabled={mode === "source"}><CheckSquare className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote" disabled={mode === "source"}><Quote className="h-3.5 w-3.5" /></TB>
        <TB active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block" disabled={mode === "source"}><Code2 className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB active={editor.isActive("link")} onClick={insertLink} title="Link" disabled={mode === "source"}><LinkIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={beginImageInsert} title="Upload image" disabled={mode === "source"}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        </TB>
        <TB onClick={insertImageByUrl} title="Image by URL" disabled={mode === "source"}><ImageIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={ctaDialog.openInsert} title="Insert CTA Button" disabled={mode === "source"}><MousePointerClick className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertTable} title="Insert table" disabled={mode === "source"}><TableIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider" disabled={mode === "source"}><Minus className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => insertCallout("info")} title="Callout / Info box" disabled={mode === "source"}><Info className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertTOC} title="Insert Table of Contents" disabled={mode === "source"}><ListTree className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={mode === "source"}><Undo2 className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={mode === "source"}><Redo2 className="h-3.5 w-3.5" /></TB>
        <TB active={mode === "source"} onClick={toggleSourceMode} title="HTML / code view"><CodeXml className="h-3.5 w-3.5" /></TB>
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
            onClick={() => {
              if (mode === "source" && !leaveSourceMode("edit")) return;
              setMode("edit");
            }}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] ${mode === "edit" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === "source" && !leaveSourceMode("preview")) return;
              setMode("preview");
            }}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] ${mode === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
          </div>
        </div>
      </div>

      {sourceError && (
        <p className="border-b border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          {sourceError}
        </p>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickFile} />

      {mode !== "source" && editor.isActive("image") && (
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
        {mode === "source" ? (
          <Textarea
            value={sourceHtml}
            onChange={(e) => {
              setSourceHtml(e.target.value);
              setSourceError(null);
              onChange(e.target.value);
            }}
            rows={16}
            spellCheck={false}
            className="min-h-[320px] resize-y rounded-none border-0 font-mono text-xs shadow-none focus-visible:ring-0"
            aria-label="HTML source"
          />
        ) : mode === "edit" ? (
          <EditorContent editor={editor} />
        ) : (
          <div
            className="custom-page-content prose prose-sm dark:prose-invert min-h-[320px] max-w-none p-3 text-sm"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
      <CtaButtonDialog
        open={ctaDialog.open}
        onOpenChange={ctaDialog.setOpen}
        mode={ctaDialog.mode}
        initialLabel={ctaDialog.initialLabel}
        initialHref={ctaDialog.initialHref}
        onConfirm={ctaDialog.confirm}
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

function TB({ children, onClick, title, active, disabled }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean; disabled?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 ${active ? "bg-muted text-foreground" : ""}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
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
