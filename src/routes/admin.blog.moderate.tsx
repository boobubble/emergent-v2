import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BlogModerateView, type ModeratePost } from "@/components/blog/BlogModerateView";
import { isValidBlogDeleteId, planBlogImageCleanup, removeBlogFromList } from "@/lib/blog-delete";

export const Route = createFileRoute("/admin/blog/moderate")({
  component: ModeratePage,
});

function ModeratePage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<ModeratePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setChecking(false);
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["admin", "super_admin"]);

    const admin = (roleData?.length ?? 0) > 0;
    setIsAdmin(admin);
    setChecking(false);

    if (admin) loadPendingPosts();
  }

  async function loadPendingPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, content, meta_description, published_at, status, category_id, author_id, tags, keywords, categories(name)")
      .order("published_at", { ascending: false });
    setPosts((data as ModeratePost[] | null) ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "published" | "rejected") {
    const { error } = await supabase.from("blog_posts").update({ status }).eq("id", id);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isValidBlogDeleteId(id)) {
      return { ok: false, error: "Missing blog post id." };
    }
    // Images may be reused across Blog, Custom Pages, and Feed. Never remove storage.
    void planBlogImageCleanup(posts.find((p) => p.id === id)?.content);
    const { data, error } = await supabase.from("blog_posts").delete().eq("id", id).select("id");
    if (error || !data?.length) {
      return {
        ok: false,
        error: error?.message ?? "Delete failed. Admin authorization required or the post was already gone.",
      };
    }
    setPosts((prev) => removeBlogFromList(prev, id));
    return { ok: true };
  }

  if (checking) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!isAdmin) {
    return <p className="p-8 text-foreground">Access denied. Admin/moderator hi ye page dekh sakte hain.</p>;
  }

  return (
    <BlogModerateView
      posts={posts}
      loading={loading}
      onUpdateStatus={updateStatus}
      onDelete={deletePost}
    />
  );
}
