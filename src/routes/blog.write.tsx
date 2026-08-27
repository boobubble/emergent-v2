import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { supabase } from "@/integrations/supabase/client";
import { BlogEditorView } from "@/components/blog/BlogEditorView";

export const Route = createFileRoute("/blog/write")({
  component: WritePostPage,
});

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

function WritePostPage() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link,
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
      content: editor.getHTML(),
      category_id: categoryId,
      author_id: user.id,
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
      editor={editor}
      submitting={submitting}
      onSubmit={handleSubmit}
      authorLabel={user.email || user.id}
    />
  );
}
