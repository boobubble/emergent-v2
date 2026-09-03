import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listPublishedBlogIndex } from "@/lib/blog.public";
import { BlogIndexView } from "@/components/blog/BlogIndexView";
import { staticPublicHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  loader: async () => listPublishedBlogIndex(),
  head: () =>
    staticPublicHead({
      title: "Blog — Yaarzo",
      description: "Tips on making friends online, chatroom guides, and community stories from Yaarzo.",
      path: "/blog",
    }),
  component: BlogListPage,
});

function BlogListPage() {
  const { posts, categories } = Route.useLoaderData();
  return <BlogIndexView posts={posts} categories={categories} />;
}
