import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listPublishedBlogIndex } from "@/lib/blog.public";
import { BlogIndexView } from "@/components/blog/BlogIndexView";

export const Route = createFileRoute("/blog/")({
  loader: async () => listPublishedBlogIndex(),
  head: () => ({
    meta: [
      { title: "Blog — Yaarzo" },
      {
        name: "description",
        content: "Tips on making friends online, chatroom guides, and community stories from Yaarzo.",
      },
    ],
  }),
  component: BlogListPage,
});

function BlogListPage() {
  const { posts, categories } = Route.useLoaderData();
  return <BlogIndexView posts={posts} categories={categories} />;
}
