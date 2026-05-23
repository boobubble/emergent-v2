import { useEffect, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { PostCard } from "@/components/feed/PostCard";
import { postIdFromSlug } from "@/lib/post-slug";
import type { FeedPost } from "@/lib/feed-types";

export const Route = createFileRoute("/feed/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Post — Palrgo` },
      { name: "description", content: `View this post on Palrgo (${params.slug}).` },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const postId = postIdFromSlug(slug);

  useEffect(() => {
    if (!postId) { setNotFound(true); setLoading(false); return; }
    let alive = true;
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("id", postId).maybeSingle();
      if (!alive) return;
      if (!data) setNotFound(true);
      else setPost(data as FeedPost);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [postId]);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/feed" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Feed
          </Link>
          <h1 className="text-lg font-bold">Post</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading && <div className="h-48 animate-pulse rounded-3xl border border-border bg-card" />}
        {!loading && notFound && (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">This post doesn't exist or was deleted.</p>
            <Link to="/feed" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4" /> Back to feed
            </Link>
          </div>
        )}
        {!loading && post && (
          <PostCard post={post} profiles={profiles} meId={user.id} />
        )}
      </main>
    </div>
  );
}
