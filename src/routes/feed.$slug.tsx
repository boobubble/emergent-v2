import { useEffect, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { PostCard } from "@/components/feed/PostCard";
import type { FeedPost } from "@/lib/feed-types";

const SITE_URL = "https://holo-chat-quest.lovable.app";

async function fetchPostForHead(slug: string) {
  const { data: post } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (!post) return null;
  let authorName = "Someone";
  if (!post.is_anonymous && post.author_id) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", post.author_id)
      .maybeSingle();
    if (prof?.username) authorName = prof.username;
  } else {
    authorName = "Anonymous";
  }
  return { post: post as FeedPost, authorName };
}

export const Route = createFileRoute("/feed/$slug")({
  loader: async ({ params }) => {
    const data = await fetchPostForHead(params.slug);
    return { headData: data };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE_URL}/feed/${params.slug}`;
    if (!loaderData?.headData) {
      return {
        meta: [
          { title: "Post — Palrgo" },
          { name: "description", content: "View this post on Palrgo." },
          { property: "og:title", content: "Post — Palrgo" },
          { property: "og:description", content: "View this post on Palrgo." },
          { property: "og:url", content: url },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const { post, authorName } = loaderData.headData;
    const rawText = (post.text || "").replace(/\s+/g, " ").trim();
    const title = rawText
      ? `${authorName}: ${rawText.slice(0, 60)}${rawText.length > 60 ? "…" : ""}`
      : `${authorName} shared a post on Palrgo`;
    const description = rawText
      ? rawText.slice(0, 160)
      : `See ${authorName}'s latest post on Palrgo.`;
    const image = post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
      if (!alive) return;
      if (!data) setNotFound(true);
      else setPost(data as FeedPost);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [slug]);

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
