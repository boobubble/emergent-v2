import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEditor } from "@tiptap/react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { useAuth } from "@/lib/auth-store";
import { BlogEditorView } from "@/components/blog/BlogEditorView";
import { blogWriteEditorExtensions } from "@/lib/blog-writer-editor";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { normalizeTagList, parseKeywordPhrases, serializeKeywords } from "@/lib/blog-taxonomy";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/write")({
  component: WritePostPage,
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" && s.id ? s.id : undefined,
    imageSeo: s.imageSeo === "1" || s.imageSeo === true || s.imageSeo === "true",
  }),
});

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

async function generateUniqueSlug(title: string): Promise<string> {
  const supabase = await loadBrowserSupabase();
  const base = slugify(title);
  let candidate = base;
  let counter = 2;

  while (true) {
    const { data } = await supabase.from("blog_posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

async function uploadBlogImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) {
    toast.error("Only image files are supported");
    return null;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    toast.error("Image must be under 8 MB");
    return null;
  }
  const supabase = await loadBrowserSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) {
    toast.error("You must be signed in to upload");
    return null;
  }
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${uid}/blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("feed-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    toast.error(error.message);
    return null;
  }
  return supabase.storage.from("feed-media").getPublicUrl(path).data.publicUrl;
}

async function userCanEditExistingContent(userId: string): Promise<boolean> {
  const supabase = await loadBrowserSupabase();
  const { data } = await supabase
    .from("user_roles")
    .select("role, can_edit_existing_content")
    .eq("user_id", userId)
    .in("role", ["admin", "super_admin", "writer"]);
  return (data ?? []).some((r) =>
    r.role === "admin" || r.role === "super_admin" || (r.role === "writer" && !!r.can_edit_existing_content),
  );
}

function WritePostPage() {
  const search = Route.useSearch();
  const editId = search.id;
  const { user, ready: authReady } = useAuth();
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [postStatus, setPostStatus] = useState<string | null>(null);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [loadedHtml, setLoadedHtml] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: blogWriteEditorExtensions(),
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[22rem]",
      },
    },
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = await loadBrowserSupabase();
        const { data } = await supabase.from("categories").select("id, name");
        if (!cancelled) setCategories(data ?? []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editId || !user) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await userCanEditExistingContent(user.id))) {
          if (!cancelled) setLoadError("You don't have permission to edit existing posts.");
          return;
        }
        const supabase = await loadBrowserSupabase();
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, content, meta_description, category_id, tags, keywords, status")
          .eq("id", editId)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setLoadError("Post not found.");
          return;
        }
        setTitle(data.title ?? "");
        setCategoryId(data.category_id ?? "");
        setMetaDescription(data.meta_description ?? "");
        setTags(normalizeTagList(data.tags));
        setKeywords(parseKeywordPhrases(data.keywords));
        setPostStatus(data.status);
        setExistingSlug(data.slug ?? null);
        setLoadedHtml(data.content || "<p></p>");
      } catch {
        if (!cancelled) setLoadError("Post not found.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId, user]);

  useEffect(() => {
    if (!editor || loadedHtml == null) return;
    editor.commands.setContent(loadedHtml, { emitUpdate: false });
  }, [editor, loadedHtml]);

  async function handleUploadImage(file: File): Promise<string | null> {
    setUploadingImage(true);
    try {
      return await uploadBlogImage(file);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit() {
    if (!user || !editor) return;
    if (!title.trim() || !categoryId) {
      alert("Title aur category zaroori hai");
      return;
    }
    setSubmitting(true);

    try {
      const supabase = await loadBrowserSupabase();
      const content = sanitizeBlogHtml(editor.getHTML());
      if (editId) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title,
            meta_description: metaDescription,
            content,
            category_id: categoryId,
            tags: normalizeTagList(tags),
            keywords: serializeKeywords(keywords),
          })
          .eq("id", editId);
        if (error) {
          alert("Error: " + error.message);
          return;
        }
        toast.success(postStatus === "published" ? "Published post updated. Status unchanged." : "Post saved.");
        return;
      }

      const slug = await generateUniqueSlug(title);
      const { error } = await supabase.from("blog_posts").insert({
        title,
        slug,
        meta_description: metaDescription,
        content,
        category_id: categoryId,
        author_id: user.id,
        tags: normalizeTagList(tags),
        keywords: serializeKeywords(keywords),
      });

      if (error) {
        alert("Error: " + error.message);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Could not save"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!authReady) {
    return <p className="grid min-h-screen place-items-center bg-background p-8 text-muted-foreground">Loading…</p>;
  }
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold tracking-tight">Sign in to write</p>
          <p className="mt-2 text-sm text-muted-foreground">Post likhne ke liye pehle login karo.</p>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Log in
          </a>
        </div>
      </div>
    );
  }
  if (loadError) {
    return <p className="grid min-h-screen place-items-center bg-background p-8 text-foreground">{loadError}</p>;
  }
  if (submitted) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold tracking-tight">Submit ho gaya!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tumhara post review ke liye bhej diya gaya hai. Admin approve karega uske baad hi live hoga.
            Image improvements can be completed later.
          </p>
          <a href="/blog" className="mt-6 inline-block text-sm font-medium text-primary underline underline-offset-4">
            Back to blog
          </a>
        </div>
      </div>
    );
  }
  if (editId && loadedHtml == null && !loadError) {
    return <p className="grid min-h-screen place-items-center bg-background p-8 text-muted-foreground">Loading post…</p>;
  }

  return (
    <BlogEditorView
      title={title}
      onTitleChange={setTitle}
      metaDescription={metaDescription}
      onMetaDescriptionChange={setMetaDescription}
      categoryId={categoryId}
      onCategoryChange={setCategoryId}
      categories={categories}
      tags={tags}
      onTagsChange={setTags}
      keywords={keywords}
      onKeywordsChange={setKeywords}
      editor={editor}
      submitting={submitting}
      onSubmit={handleSubmit}
      authorLabel={user.email || user.id}
      uploadingImage={uploadingImage}
      onUploadImage={handleUploadImage}
      mode={editId ? "edit" : "create"}
      postStatus={postStatus}
      highlightImageSeo={search.imageSeo}
      existingSlug={existingSlug}
    />
  );
}
