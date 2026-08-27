import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { supabase } from "@/integrations/supabase/client";
import { BlogEditorView } from "@/components/blog/BlogEditorView";
import { BlogImage } from "@/lib/blog-image";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import { normalizeTagList, serializeKeywords } from "@/lib/blog-taxonomy";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/write")({
  component: WritePostPage,
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

function WritePostPage() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        heading: { levels: [2, 3] },
      }),
      Link,
      BlogImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing your post here…" }),
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[22rem]",
      },
    },
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingAuth(false);
    });
    supabase.from("categories").select("id, name").then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

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

    const slug = await generateUniqueSlug(title);
    const { error } = await supabase.from("blog_posts").insert({
      title,
      slug,
      meta_description: metaDescription,
      content: sanitizeBlogHtml(editor.getHTML()),
      category_id: categoryId,
      author_id: user.id,
      tags: normalizeTagList(tags),
      keywords: serializeKeywords(keywords),
    });

    setSubmitting(false);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    setSubmitted(true);
  }

  if (checkingAuth) {
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
  if (submitted) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold tracking-tight">Submit ho gaya!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tumhara post review ke liye bhej diya gaya hai. Admin approve karega uske baad hi live hoga.
          </p>
          <a href="/blog" className="mt-6 inline-block text-sm font-medium text-primary underline underline-offset-4">
            Back to blog
          </a>
        </div>
      </div>
    );
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
    />
  );
}
