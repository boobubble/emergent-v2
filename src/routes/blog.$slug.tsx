import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedBlogBySlug } from "@/lib/blog.public";
import { notFoundSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedBlogBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) return notFoundSeoHead();
    return {
      meta: [
        { title: `${loaderData.post.title} — Yaarzo Blog` },
        { name: "description", content: loaderData.post.meta_description ?? "" },
        { name: "robots", content: "index, follow" },
      ],
    };
  },
  notFoundComponent: BlogPostNotFound,
  component: BlogPostPage,
});

function BlogPostNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This blog post is not available.</p>
      </div>
    </div>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <span className="text-sm text-blue-600 font-medium">{post.categories?.name}</span>
      <h1 className="text-3xl font-bold mb-4 mt-2">{post.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
