import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listPublishedBlogIndex } from "@/lib/blog.public";

export const Route = createFileRoute("/blog/")({
  loader: async () => listPublishedBlogIndex(),
  head: () => ({
    meta: [
      { title: "Blog — Yaarzo" },
      {
        name: "description",
        content:
          "Tips on making friends online, chatroom guides, and community stories from Yaarzo.",
      },
    ],
  }),
  component: BlogListPage,
});

function BlogListPage() {
  const { posts, categories } = Route.useLoaderData();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.categories?.slug === activeCategory);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yaarzo Blog</h1>
        <a
          href="/blog/write"
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
        >
          + Publish Your Blog
        </a>
      </div>

      <select
        value={activeCategory}
        onChange={(e) => setActiveCategory(e.target.value)}
        className="border rounded px-3 py-2 mb-8"
      >
        <option value="all">All Categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="space-y-6">
        {filtered.length === 0 && (
          <p className="text-gray-500">Is category mein abhi koi post nahi hai.</p>
        )}
        {filtered.map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="block border-b pb-4">
            <span className="text-xs text-blue-600 font-medium">{post.categories?.name}</span>
            <h2 className="text-xl font-semibold hover:underline">{post.title}</h2>
            <p className="text-gray-600">{post.meta_description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
