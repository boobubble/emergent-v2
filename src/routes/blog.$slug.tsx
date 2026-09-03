import { createFileRoute, notFound } from "@tanstack/react-router";
import { absolutizeBlogCoverSrc, getPublishedBlogBySlug } from "@/lib/blog.public";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { notFoundSeoHead } from "@/lib/seo/not-found";
import { loadExploreFeatureLinks } from "@/lib/explore-features-links";
import { allocateBlogExploreCount, countInBodyInternalLinks } from "@/lib/pages-cms/public-link-budget";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedBlogBySlug(params.slug);
    if (!post) throw notFound();
    let exploreFeatureLinks: Awaited<ReturnType<typeof loadExploreFeatureLinks>> = [];
    const exploreCount = allocateBlogExploreCount(countInBodyInternalLinks(post.content || ""));
    if (exploreCount > 0) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        exploreFeatureLinks = await loadExploreFeatureLinks(supabaseAdmin, `blog/${post.slug}`, {
          count: exploreCount,
        });
      } catch {
        exploreFeatureLinks = [];
      }
    }
    return { post, exploreFeatureLinks };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return notFoundSeoHead();
    const url = `https://yaarzo.com/blog/${post.slug}`;
    const ogImage = post.cover_image?.src
      ? absolutizeBlogCoverSrc(post.cover_image.src)
      : undefined;
    return {
      meta: [
        { title: `${post.title} — Yaarzo Blog` },
        { name: "description", content: post.meta_description ?? "" },
        ...(ogImage
          ? [
              { property: "og:image", content: ogImage },
              { name: "twitter:image", content: ogImage },
            ]
          : []),
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
