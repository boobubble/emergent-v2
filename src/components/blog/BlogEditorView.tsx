import { useEffect, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  SlidersHorizontal,
  Undo2,
  CodeXml,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { previewSlugFromTitle } from "@/components/blog/blog-format";
import { BlogChipField } from "@/components/blog/BlogChipField";
import { BlogImageDialog, type BlogImageDraft } from "@/components/blog/BlogImageDialog";
import { ImageSeoPanel } from "@/components/content-images/ImageSeoPanel";
import {
  insertEditorImage,
  removeEditorImage,
  selectEditorImage,
  updateEditorImage,
  updateEditorImageAttrs,
} from "@/components/content-images/editor-images";
import { optimizeImageFromUrl } from "@/lib/content-image-optimize";
import { summarizeContentImages } from "@/lib/content-image-seo";
import {
  MAX_BLOG_KEYWORD_LENGTH,
  MAX_BLOG_KEYWORDS,
  MAX_BLOG_TAG_LENGTH,
  MAX_BLOG_TAGS,
} from "@/lib/blog-taxonomy";
import { normalizeBlogImageAlign, type BlogImageAlign } from "@/lib/blog-image";
import { applyHtmlSource } from "@/lib/tiptap-html-source";
import { toast } from "sonner";
import "@/components/blog/blog-ui.css";

export type BlogEditorViewProps = {
  title: string;
  onTitleChange: (value: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: { id: string; name: string }[];
  tags: string[];
  onTagsChange: (value: string[]) => void;
  keywords: string[];
  onKeywordsChange: (value: string[]) => void;
  editor: Editor | null;
  submitting: boolean;
  onSubmit: () => void;
  authorLabel: string;
  uploadingImage: boolean;
  onUploadImage: (file: File) => Promise<string | null>;
  mode?: "create" | "edit";
  postStatus?: string | null;
  highlightImageSeo?: boolean;
  existingSlug?: string | null;
};

function useEditorTick(editor: Editor | null) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const bump = () => setTick((n) => n + 1);
    editor.on("transaction", bump);
    editor.on("selectionUpdate", bump);
    return () => {
      editor.off("transaction", bump);
      editor.off("selectionUpdate", bump);
    };
  }, [editor]);
}

export function BlogEditorView(props: BlogEditorViewProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const [sourceError, setSourceError] = useState<string | null>(null);
  useEditorTick(props.editor);

  function leaveSourceMode(): boolean {
    const result = applyHtmlSource(props.editor, sourceHtml);
    if (!result.ok) {
      setSourceError(result.error);
      return false;
    }
    setSourceError(null);
    setSourceMode(false);
    return true;
  }

  function toggleSourceMode() {
    if (sourceMode) {
      leaveSourceMode();
      return;
    }
    if (!props.editor) return;
    setSourceError(null);
    setSourceHtml(props.editor.getHTML());
    setSourceMode(true);
  }

  useEffect(() => {
    if (!props.highlightImageSeo) return;
    const t = window.setTimeout(() => {
      document.getElementById("image-seo-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => window.clearTimeout(t);
  }, [props.highlightImageSeo]);

  const html = props.editor?.getHTML() ?? "";
  const imageStatus = summarizeContentImages(html);
  const isEdit = props.mode === "edit";
  const published = props.postStatus === "published";
  const backHref = isEdit ? "/admin/blog/moderate" : "/blog";
  const backLabel = isEdit ? "Blogs" : "Back";

  async function optimizeAt(index: number) {
    const img = imageStatus.images[index];
    if (!img?.src) {
      setImageOpen(true);
      return;
    }
    setOptimizing(true);
    try {
      const result = await optimizeImageFromUrl(img.src);
      if (!result) {
        updateEditorImageAttrs(props.editor, index, { optimized: "unavailable" });
        toast.message("Optimization unavailable. You can still publish.");
        return;
      }
      const url = result.file !== undefined && result.status === "ok" ? await props.onUploadImage(result.file) : null;
      if (url) {
        updateEditorImageAttrs(props.editor, index, {
          src: url,
          width: result.width || null,
          height: result.height || null,
          optimized: "true",
          bytes: result.outputBytes,
        });
      } else {
        updateEditorImageAttrs(props.editor, index, { optimized: result.status === "ok" ? "true" : "unavailable" });
      }
    } finally {
      setOptimizing(false);
    }
  }

  function fixImage(index: number) {
    const img = imageStatus.images[index];
    selectEditorImage(props.editor, index);
    if (!img?.uploaded) {
      setReplaceIndex(index);
      return;
    }
    if (!img.altOk) {
      selectEditorImage(props.editor, index);
      return;
    }
    if (img.optimization !== "ok") void optimizeAt(index);
  }

  return (
    <div className={isEdit ? "yz-blog min-h-screen bg-muted/30 text-foreground" : "yz-blog min-h-screen bg-background text-foreground"}>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-2 px-3 sm:px-5">
          <a
            href={backHref}
            className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {backLabel}
          </a>
          {isEdit && (
            <span className="hidden min-w-0 truncate text-sm font-semibold sm:inline">
              {props.title.trim() || "Edit Blog"}
            </span>
          )}
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {published ? "Published" : isEdit ? props.postStatus || "Draft" : "Draft"}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {published ? "Editing live post" : isEdit ? "Editing submission" : "Unsaved"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {published && props.existingSlug && (
              <a href={`/blog/${props.existingSlug}`} target="_blank" rel="noreferrer">
                <Button type="button" variant="outline" size="sm">
                  View
                </Button>
              </a>
            )}
            <Sheet defaultOpen={props.highlightImageSeo}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Settings
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw,22rem)] overflow-y-auto bg-background text-foreground">
                <SheetHeader>
                  <SheetTitle>Post settings</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <EditorSidebar
                    {...props}
                    onAddImage={() => { setReplaceIndex(null); setImageOpen(true); }}
                    onFixImage={fixImage}
                    onRemoveImage={(index) => removeEditorImage(props.editor, index)}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <Button type="button" onClick={() => {
              if (sourceMode && !leaveSourceMode()) return;
              props.onSubmit();
            }} disabled={props.submitting} size="sm">
              {props.submitting ? "Saving…" : isEdit ? (published ? "Update" : "Save") : "Submit for Review"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="min-w-0 overflow-x-clip px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[820px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="blog-title">
              Article Title (H1)
            </label>
            <textarea
              id="blog-title"
              rows={2}
              placeholder="Article title"
              value={props.title}
              onChange={(e) => props.onTitleChange(e.target.value)}
              className="mb-2 mt-1 w-full resize-none border-0 bg-transparent p-0 text-3xl font-semibold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/55 focus-visible:ring-0 sm:text-4xl"
            />
            <p className="mb-5 text-[11px] leading-relaxed text-muted-foreground">
              The article title is the H1. Use H2/H3 for sections.
            </p>
            <EditorToolbar
              editor={props.editor}
              onAddImage={() => { setReplaceIndex(null); setImageOpen(true); }}
              sourceMode={sourceMode}
              onToggleSource={toggleSourceMode}
            />
            {sourceError && (
              <p className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                {sourceError}
              </p>
            )}
            {!sourceMode && (
              <SelectedImageControls
                editor={props.editor}
                onReplace={() => setReplaceIndex(selectedImageIndex(props.editor))}
                onRemove={() => removeEditorImage(props.editor, selectedImageIndex(props.editor))}
                onOptimize={() => void optimizeAt(selectedImageIndex(props.editor))}
                optimizing={optimizing}
              />
            )}
            <div className="yz-blog-prose rounded-xl border border-border bg-card/40 px-4 py-5 sm:px-6 sm:py-6">
              {sourceMode ? (
                <textarea
                  value={sourceHtml}
                  onChange={(e) => {
                    setSourceHtml(e.target.value);
                    setSourceError(null);
                  }}
                  rows={18}
                  spellCheck={false}
                  aria-label="HTML source"
                  className="min-h-[22rem] w-full resize-y border-0 bg-transparent p-0 font-mono text-xs leading-relaxed text-foreground outline-none focus-visible:ring-0"
                />
              ) : props.editor ? (
                <EditorContent editor={props.editor} />
              ) : (
                <p className="text-sm text-muted-foreground">Loading editor…</p>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden border-l border-border bg-card/30 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-5">
            <EditorSidebar
              {...props}
              onAddImage={() => { setReplaceIndex(null); setImageOpen(true); }}
              onFixImage={fixImage}
              onRemoveImage={(index) => removeEditorImage(props.editor, index)}
            />
          </div>
        </aside>
      </div>

      <BlogImageDialog
        open={imageOpen || replaceIndex != null}
        onOpenChange={(next) => {
          if (!next) setReplaceIndex(null);
          setImageOpen(next);
        }}
        mode={replaceIndex != null ? "replace" : "insert"}
        initial={
          replaceIndex != null
            ? {
                src: imageStatus.images[replaceIndex]?.src,
                alt: imageStatus.images[replaceIndex]?.alt,
                decorative: imageStatus.images[replaceIndex]?.decorative,
              }
            : null
        }
        uploading={props.uploadingImage || optimizing}
        onUpload={props.onUploadImage}
        onInsert={(draft) => {
          if (replaceIndex != null) updateEditorImage(props.editor, replaceIndex, draft);
          else insertBlogImage(props.editor, draft);
        }}
      />
    </div>
  );
}

function selectedImageIndex(editor: Editor | null): number {
  if (!editor) return 0;
  let index = 0;
  let found = 0;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "image") return;
    const { from } = editor.state.selection;
    if (from >= pos && from <= pos + node.nodeSize) found = index;
    index += 1;
  });
  return found;
}

function insertBlogImage(editor: Editor | null, draft: BlogImageDraft) {
  insertEditorImage(editor, draft);
}

function EditorSidebar({
  categoryId,
  onCategoryChange,
  categories,
  title,
  metaDescription,
  onMetaDescriptionChange,
  tags,
  onTagsChange,
  keywords,
  onKeywordsChange,
  authorLabel,
  editor,
  highlightImageSeo,
  onAddImage,
  onFixImage,
  onRemoveImage,
  postStatus,
  mode,
  existingSlug,
}: BlogEditorViewProps & {
  onAddImage: () => void;
  onFixImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
}) {
  const slugPreview = existingSlug || previewSlugFromTitle(title) || "your-post-title";
  const serpTitle = title.trim() || "Untitled post";
  const serpDesc = metaDescription.trim() || "A short description will appear here.";
  const imageStatus = summarizeContentImages(editor?.getHTML() ?? "");
  const published = postStatus === "published";
  const slugLocked = Boolean(existingSlug);

  return (
    <div className="space-y-5">
      <ImageSeoPanel
        status={imageStatus}
        highlight={highlightImageSeo}
        onAddImage={onAddImage}
        onFixImage={onFixImage}
        onRemoveImage={onRemoveImage}
      />

      <section className="rounded-xl border border-border bg-background p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publish</h2>
        <p className="mt-2 text-sm text-foreground">
          Status: <span className="font-medium capitalize">{published ? "Published" : mode === "edit" ? postStatus || "pending" : "Pending review"}</span>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {published
            ? "Saving updates this published post. Image status does not unpublish it or change the slug."
            : "Submitting sends this post for admin approval. Image improvements can be completed later."}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-background p-4">
        <Label htmlFor="blog-category" className="text-xs uppercase tracking-wide text-muted-foreground">
          Category
        </Label>
        <select
          id="blog-category"
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-border bg-background p-4">
        <BlogChipField
          id="blog-tags"
          label="Tags"
          hint="Content taxonomy, shown on the article. Not keyword stuffing."
          values={tags}
          onChange={onTagsChange}
          maxItems={MAX_BLOG_TAGS}
          maxLength={MAX_BLOG_TAG_LENGTH}
          placeholder="Chatrooms, Friendship…"
        />
      </section>

      <section className="rounded-xl border border-border bg-background p-4">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Author</Label>
        <p className="mt-2 truncate text-sm text-foreground">{authorLabel}</p>
      </section>

      <details className="rounded-xl border border-border bg-background p-4" open>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          SEO
        </summary>
        <div className="mt-3 space-y-3">
          <BlogChipField
            id="blog-keywords"
            label="SEO Keywords"
            hint="Editorial targeting only. Not shown on the public article and not injected into the body."
            values={keywords}
            onChange={onKeywordsChange}
            maxItems={MAX_BLOG_KEYWORDS}
            maxLength={MAX_BLOG_KEYWORD_LENGTH}
            placeholder="free online chatrooms"
          />
          <div>
            <Label htmlFor="blog-meta-description" className="text-xs uppercase tracking-wide text-muted-foreground">
              Meta Description
            </Label>
            <textarea
              id="blog-meta-description"
              rows={3}
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value.slice(0, 160))}
              className="mt-2 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="A short excerpt for search and listings…"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">{metaDescription.length}/160</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">
              {slugLocked ? "Slug (not changed on save)" : "Slug preview (generated on submit)"}
            </p>
            <p className="mt-0.5 break-all font-mono text-xs text-foreground">/blog/{slugPreview}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-[11px] font-medium text-muted-foreground">Search preview</p>
            <p className="mt-1 truncate text-sm text-[#1a0dab] dark:text-sky-300">{serpTitle} — Yaarzo Blog</p>
            <p className="truncate text-[11px] text-emerald-700 dark:text-emerald-400">yaarzo.com/blog/{slugPreview}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{serpDesc}</p>
          </div>
        </div>
      </details>
    </div>
  );
}

function EditorToolbar({
  editor,
  onAddImage,
  sourceMode,
  onToggleSource,
}: {
  editor: Editor | null;
  onAddImage: () => void;
  sourceMode: boolean;
  onToggleSource: () => void;
}) {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("Link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="sticky top-14 z-20 mb-3 -mx-1 overflow-x-auto rounded-xl border border-border bg-background/95 p-1 shadow-[0_1px_3px_0_rgb(0_0_0_/_.08)] backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-0.5 px-0.5">
        <TB
          label="Paragraph"
          active={editor.isActive("paragraph")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB
          label="Bold"
          active={editor.isActive("bold")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Italic"
          active={editor.isActive("italic")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB
          label="Bullet list"
          active={editor.isActive("bulletList")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Numbered list"
          active={editor.isActive("orderedList")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Quote"
          active={editor.isActive("blockquote")}
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB label="Link" active={editor.isActive("link")} disabled={sourceMode} onClick={setLink}>
          <LinkIcon className="h-3.5 w-3.5" />
        </TB>
        <TB label="Add Image" disabled={sourceMode} onClick={onAddImage}>
          <ImagePlus className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB label="Undo" disabled={sourceMode} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-3.5 w-3.5" />
        </TB>
        <TB label="Redo" disabled={sourceMode} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-3.5 w-3.5" />
        </TB>
        <TB label="HTML / code view" active={sourceMode} onClick={onToggleSource}>
          <CodeXml className="h-3.5 w-3.5" />
        </TB>
      </div>
    </div>
  );
}

function SelectedImageControls({
  editor,
  onReplace,
  onRemove,
  onOptimize,
  optimizing,
}: {
  editor: Editor | null;
  onReplace: () => void;
  onRemove: () => void;
  onOptimize: () => void;
  optimizing: boolean;
}) {
  if (!editor || !editor.isActive("image")) return null;
  const attrs = editor.getAttributes("image") as {
    alt?: string;
    align?: string;
  };
  const align = normalizeBlogImageAlign(attrs.align);
  const alt = String(attrs.alt ?? "");

  function setAlign(next: BlogImageAlign) {
    editor?.chain().focus().updateAttributes("image", { align: next }).run();
  }

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3 sm:flex-row sm:items-end">
      <div className="flex flex-wrap gap-1">
        <TB label="Align Left" active={align === "left"} onClick={() => setAlign("left")}>
          <AlignLeft className="h-3.5 w-3.5" />
          <span className="ml-1 hidden text-[11px] sm:inline">Align Left</span>
        </TB>
        <TB label="Align Center" active={align === "center"} onClick={() => setAlign("center")}>
          <AlignCenter className="h-3.5 w-3.5" />
          <span className="ml-1 text-[11px]">Align Center</span>
        </TB>
        <TB label="Align Right" active={align === "right"} onClick={() => setAlign("right")}>
          <AlignRight className="h-3.5 w-3.5" />
          <span className="ml-1 hidden text-[11px] sm:inline">Align Right</span>
        </TB>
      </div>
      <div className="min-w-0 flex-1">
        <Label htmlFor="blog-selected-alt" className="text-[11px] text-muted-foreground">
          Alt text
        </Label>
        <Input
          id="blog-selected-alt"
          className="mt-1 h-8"
          value={alt}
          onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value, decorative: false }).run()}
          placeholder="Describe the image for accessibility and search engines."
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Describe the image for accessibility and search engines.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReplace}>
            Replace Image
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOptimize} disabled={optimizing}>
            {optimizing ? "Optimizing…" : "Optimize"}
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 text-[11px]" onClick={onRemove}>
            Remove Image
          </Button>
        </div>
      </div>
    </div>
  );
}

function TB({
  children,
  onClick,
  label,
  active,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="yz-blog-toolbar-btn"
      data-active={active ? "true" : "false"}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
