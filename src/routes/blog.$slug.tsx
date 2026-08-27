import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedBlogBySlug } from "@/lib/blog.public";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { notFoundSeoHead } from "@/lib/seo/not-found";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedBlogBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
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
  const { post } = Route.useLoaderData();
  return <BlogPostView post={post} />;
}
