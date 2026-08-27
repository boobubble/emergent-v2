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
import {
  MAX_BLOG_KEYWORD_LENGTH,
  MAX_BLOG_KEYWORDS,
  MAX_BLOG_TAG_LENGTH,
  MAX_BLOG_TAGS,
} from "@/lib/blog-taxonomy";
import { normalizeBlogImageAlign, type BlogImageAlign } from "@/lib/blog-image";
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
  useEditorTick(props.editor);

  return (
    <div className="yz-blog min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-2 px-3 sm:px-5">
          <a
            href="/blog"
            className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back
          </a>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Draft
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">Unsaved</span>
          <div className="ml-auto flex items-center gap-2">
            <Sheet>
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
                  <EditorSidebar {...props} />
                </div>
              </SheetContent>
            </Sheet>
            <Button type="button" onClick={props.onSubmit} disabled={props.submitting} size="sm">
              {props.submitting ? "Submitting…" : "Submit for Review"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="min-w-0 overflow-x-hidden px-4 py-8 sm:px-8 lg:px-10">
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
            <EditorToolbar editor={props.editor} onAddImage={() => setImageOpen(true)} />
            <SelectedImageControls editor={props.editor} />
            <div className="yz-blog-prose rounded-xl border border-border bg-card/40 px-4 py-5 sm:px-6 sm:py-6">
              {props.editor ? (
                <EditorContent editor={props.editor} />
              ) : (
                <p className="text-sm text-muted-foreground">Loading editor…</p>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden border-l border-border bg-card/30 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-5">
            <EditorSidebar {...props} />
          </div>
        </aside>
      </div>

      <BlogImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        uploading={props.uploadingImage}
        onUpload={props.onUploadImage}
        onInsert={(draft) => insertBlogImage(props.editor, draft)}
      />
    </div>
  );
}

function insertBlogImage(editor: Editor | null, draft: BlogImageDraft) {
  if (!editor) return;
  editor
    .chain()
    .focus()
    .insertContent({
      type: "image",
      attrs: {
        src: draft.src,
        alt: draft.decorative ? "" : draft.alt,
        title: draft.title || null,
        align: draft.align,
        decorative: draft.decorative,
      },
    })
    .run();
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
}: BlogEditorViewProps) {
  const slugPreview = previewSlugFromTitle(title) || "your-post-title";
  const serpTitle = title.trim() || "Untitled post";
  const serpDesc = metaDescription.trim() || "A short description will appear here.";

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-background p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publish</h2>
        <p className="mt-2 text-sm text-foreground">
          Status: <span className="font-medium">Pending review</span>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Submitting sends this post for admin approval. It goes live only after it is published.
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
            <p className="text-[11px] text-muted-foreground">Slug preview (generated on submit)</p>
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

function EditorToolbar({ editor, onAddImage }: { editor: Editor | null; onAddImage: () => void }) {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("Link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="sticky top-14 z-20 mb-3 -mx-1 overflow-x-auto rounded-xl border border-border bg-background/95 p-1 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-0.5 px-0.5">
        <TB
          label="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </TB>
        <TB
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="h-3.5 w-3.5" />
        </TB>
        <TB label="Add Image" onClick={onAddImage}>
          <ImagePlus className="h-3.5 w-3.5" />
        </TB>
        <span className="yz-blog-toolbar-sep" />
        <TB label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-3.5 w-3.5" />
        </TB>
        <TB label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-3.5 w-3.5" />
        </TB>
      </div>
    </div>
  );
}

function SelectedImageControls({ editor }: { editor: Editor | null }) {
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
      </div>
    </div>
  );
}

function TB({
  children,
  onClick,
  label,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
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
    >
      {children}
    </button>
  );
}
