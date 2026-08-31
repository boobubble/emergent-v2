import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedBlogBySlug } from "@/lib/blog.public";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { notFoundSeoHead } from "@/lib/seo/not-found";
import { loadExploreFeatureLinks } from "@/lib/explore-features-links";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedBlogBySlug(params.slug);
    if (!post) throw notFound();
    let exploreFeatureLinks: Awaited<ReturnType<typeof loadExploreFeatureLinks>> = [];
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      exploreFeatureLinks = await loadExploreFeatureLinks(supabaseAdmin, `blog/${post.slug}`);
    } catch {
      exploreFeatureLinks = [];
    }
    return { post, exploreFeatureLinks };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return notFoundSeoHead();
    const url = `https://yaarzo.com/blog/${post.slug}`;
    return {
      meta: [
        { title: `${post.title} — Yaarzo Blog` },
        { name: "description", content: post.meta_description ?? "" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post, exploreFeatureLinks } = Route.useLoaderData();
  return <BlogPostView post={post} exploreFeatureLinks={exploreFeatureLinks} />;
}
