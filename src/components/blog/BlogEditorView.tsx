import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { previewSlugFromTitle } from "@/components/blog/blog-format";
import "@/components/blog/blog-ui.css";

export type BlogEditorViewProps = {
  title: string;
  onTitleChange: (value: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: { id: string; name: string }[];
  editor: Editor | null;
  submitting: boolean;
  onSubmit: () => void;
  authorLabel: string;
};

export function BlogEditorView(props: BlogEditorViewProps) {
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
        <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[820px]">
            <label className="sr-only" htmlFor="blog-title">
              Title
            </label>
            <textarea
              id="blog-title"
              rows={2}
              placeholder="Title"
              value={props.title}
              onChange={(e) => props.onTitleChange(e.target.value)}
              className="mb-3 w-full resize-none border-0 bg-transparent p-0 text-3xl font-semibold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/55 focus-visible:ring-0 sm:text-4xl"
            />
            <label className="sr-only" htmlFor="blog-excerpt">
              Excerpt / meta description
            </label>
            <textarea
              id="blog-excerpt"
              rows={2}
              placeholder="A short excerpt for search and listings…"
              value={props.metaDescription}
              onChange={(e) => props.onMetaDescriptionChange(e.target.value)}
              className="mb-1 w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
            <p className="mb-6 text-[11px] text-muted-foreground">
              {props.metaDescription.length}/160
            </p>

            <EditorToolbar editor={props.editor} />
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
    </div>
  );
}

function EditorSidebar({
  categoryId,
  onCategoryChange,
  categories,
  title,
  metaDescription,
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
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Author</Label>
        <p className="mt-2 truncate text-sm text-foreground">{authorLabel}</p>
      </section>

      <details className="rounded-xl border border-border bg-background p-4" open>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          SEO
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-[11px] text-muted-foreground">SEO title</p>
            <p className="mt-0.5 text-sm text-foreground">{serpTitle}</p>
            <p className="text-[11px] text-muted-foreground">Uses the post title. Not a separate field.</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Meta description</p>
            <p className="mt-0.5 text-sm text-foreground line-clamp-3">{serpDesc}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Slug (generated on submit)</p>
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

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("Link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="sticky top-14 z-20 mb-3 -mx-1 overflow-x-auto rounded-xl border border-border bg-background/95 p-1 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-0.5 px-0.5">
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
