import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { postsSafe } from "@/lib/posts-safe";
import { useAuth } from "@/lib/auth-store";
import { PostCard } from "@/components/feed/PostCard";
import { postSlug } from "@/lib/post-slug";
import type { FeedPost } from "@/lib/feed-types";
import type { User } from "@/lib/chat-types";

const SITE_URL = "https://holo-chat-quest.lovable.app";

async function fetchPostForHead(slug: string) {
  const { data: post } = await postsSafe().select("*").eq("slug", slug).maybeSingle();
  if (!post) return null;
  let authorName = "Someone";
  let authorUsername: string | null = null;
  if (!post.is_anonymous && post.author_id) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("username,display_name")
      .eq("id", post.author_id)
      .maybeSingle();
    if (prof) {
      authorUsername = (prof.username as string) ?? null;
      authorName = (prof.display_name as string) || (prof.username as string) || "Someone";
    }
  } else {
    authorName = "Anonymous";
  }
  return { post: post as FeedPost, authorName, authorUsername };
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
          { title: "Post" },
          { name: "description", content: "View this post." },
          { name: "robots", content: "noindex" },
          { property: "og:title", content: "Post" },
          { property: "og:description", content: "View this post." },
          { property: "og:url", content: url },
          { property: "og:type", content: "article" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const { post, authorName } = loaderData.headData;
    const rawText = (post.text || "").replace(/\s+/g, " ").trim();
    const title = rawText
      ? `${authorName}: ${rawText.slice(0, 60)}${rawText.length > 60 ? "…" : ""}`
      : `${authorName} shared a post`;
    const description = rawText
      ? rawText.slice(0, 160)
      : `See ${authorName}'s latest post.`;
    const image = post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : undefined;
    const isPublic = post.privacy === "public";
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { name: "robots", content: isPublic ? "index, follow" : "noindex, nofollow" },
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
      scripts: isPublic
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SocialMediaPosting",
                headline: title,
                description,
                url,
                datePublished: post.created_at,
                image: image ? [image] : undefined,
                author: { "@type": "Person", name: authorName },
                interactionStatistic: [
                  {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/LikeAction",
                    userInteractionCount: post.reaction_count ?? 0,
                  },
                  {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/CommentAction",
                    userInteractionCount: post.comment_count ?? 0,
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const meId = user?.id ?? "";
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, User>>({});

  // Lazy related content — only loaded after the main post is on screen.
  const [related, setRelated] = useState<{
    moreFromAuthor: FeedPost[];
    trending: FeedPost[];
  }>({ moreFromAuthor: [], trending: [] });
  const [relatedLoaded, setRelatedLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const { data } = await postsSafe().select("*").eq("slug", slug).maybeSingle();
      if (!alive) return;
      if (!data) {
        setNotFound(true);
        setPost(null);
      } else {
        setPost(data as FeedPost);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [slug]);

  // Load author + commenter profiles for the visible post.
  useEffect(() => {
    if (!post) return;
    (async () => {
      const ids = new Set<string>();
      if (post.author_id) ids.add(post.author_id);
      if (!ids.size) return;
      const { data } = await supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url,avatar_color")
        .in("id", Array.from(ids));
      const map: Record<string, User> = {};
      for (const p of data ?? []) {
        map[p.id as string] = {
          id: p.id as string,
          name: ((p.display_name as string) || (p.username as string) || "user"),
          avatarUrl: (p.avatar_url as string) ?? undefined,
          avatarColor: (p.avatar_color as string) ?? undefined,
          status: "offline",
          xp: 0,
          level: 1,
          streak: 0,
          longestStreak: 0,
          coins: 0,
          badges: [],
          isBot: false,
          isGuest: false,
        } as unknown as User;
      }
      setProfiles(map);
    })();
  }, [post]);

  // Lazy load related content once the main post is rendered.
  useEffect(() => {
    if (!post || relatedLoaded) return;
    const id = setTimeout(async () => {
      try {
        const [author, trending] = await Promise.all([
          post.author_id && !post.is_anonymous
            ? postsSafe().select("*")
                .eq("author_id", post.author_id)
                .eq("privacy", "public")
                .neq("id", post.id)
                .order("created_at", { ascending: false })
                .limit(4)
            : Promise.resolve({ data: [] as FeedPost[] }),
          postsSafe().select("*")
            .eq("privacy", "public")
            .neq("id", post.id)
            .order("trending_score", { ascending: false })
            .limit(6),
        ]);
        setRelated({
          moreFromAuthor: (author.data ?? []) as FeedPost[],
          trending: (trending.data ?? []) as FeedPost[],
        });
      } finally {
        setRelatedLoaded(true);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [post, relatedLoaded]);

  // #comments deep-link → scroll to comments section on the card.
  useEffect(() => {
    if (!post || typeof window === "undefined") return;
    if (window.location.hash === "#comments") {
      // The PostCard has a comments toggle; we scroll to the article and
      // leave opening the panel to the user tap for now. A simple #comments
      // anchor placed below the card lets the browser scroll natively.
      const el = document.getElementById("comments");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [post]);

  const authorName = useMemo(() => {
    if (!post) return "";
    if (post.is_anonymous) return "Anonymous";
    return profiles[post.author_id]?.name ?? "Someone";
  }, [post, profiles]);

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
          <>
            <PostCard post={post} profiles={profiles} meId={meId} />
            <div id="comments" aria-hidden className="h-0" />

            {relatedLoaded && related.moreFromAuthor.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  More from {authorName}
                </h2>
                <ul className="space-y-2">
                  {related.moreFromAuthor.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/feed/$slug"
                        params={{ slug: postSlug(p) }}
                        className="block rounded-2xl border border-border bg-card p-4 text-sm hover:border-primary/40 hover:bg-accent/30"
                      >
                        <p className="line-clamp-2">{p.text || "(media post)"}</p>
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {p.reaction_count} reactions · {p.comment_count} comments
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {relatedLoaded && related.trending.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Trending posts
                </h2>
                <ul className="space-y-2">
                  {related.trending.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/feed/$slug"
                        params={{ slug: postSlug(p) }}
                        className="block rounded-2xl border border-border bg-card p-4 text-sm hover:border-primary/40 hover:bg-accent/30"
                      >
                        <p className="line-clamp-2">{p.text || "(media post)"}</p>
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {p.reaction_count} reactions · {p.comment_count} comments
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
