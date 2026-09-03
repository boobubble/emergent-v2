import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  absolutizeBlogCoverSrc,
  firstBlogCoverImage,
  getPublishedBlogBySlug,
  publicBlogTags,
} from "@/lib/blog.public";
import { BlogIndexView } from "@/components/blog/BlogIndexView";

describe("getPublishedBlogBySlug", () => {
  it("returns null for an empty slug without querying", async () => {
    await expect(getPublishedBlogBySlug("   ")).resolves.toBeNull();
  });

  it("maps missing tags on older posts to an empty list", () => {
    expect(publicBlogTags(null)).toEqual([]);
    expect(publicBlogTags(undefined)).toEqual([]);
    expect(publicBlogTags([])).toEqual([]);
    expect(publicBlogTags(["Friendship", "  "])).toEqual(["Friendship"]);
  });
});

describe("firstBlogCoverImage", () => {
  it("uses the first safe content image as the cover", () => {
    const html = `
      <p>Intro</p>
      <img src="https://cdn.example/friends.webp" alt="Friends chatting on Yaarzo">
      <img src="https://cdn.example/second.webp" alt="Second">
    `;
    expect(firstBlogCoverImage(html)).toEqual({
      src: "https://cdn.example/friends.webp",
      alt: "Friends chatting on Yaarzo",
    });
  });

  it("skips javascript URLs and HTML comments that are not real images", () => {
    expect(firstBlogCoverImage("<!-- IMAGE: a welcoming chatroom -->")).toBeNull();
    expect(firstBlogCoverImage("<p>No image</p>")).toBeNull();
    expect(firstBlogCoverImage('<img src="javascript:alert(1)" alt="x">')).toBeNull();
    expect(firstBlogCoverImage('<img src="/og/cover.webp" alt="Cover">')).toEqual({
      src: "/og/cover.webp",
      alt: "Cover",
    });
  });

  it("absolutizes relative cover URLs for og:image", () => {
    expect(absolutizeBlogCoverSrc("https://cdn.example/a.webp")).toBe("https://cdn.example/a.webp");
    expect(absolutizeBlogCoverSrc("/og/cover.webp")).toBe("https://yaarzo.com/og/cover.webp");
  });
});

describe("BlogIndexView thumbnails", () => {
  it("renders a thumbnail when cover_image is set and omits the slot when missing", () => {
    const html = renderToString(
      createElement(BlogIndexView, {
        categories: [{ id: "1", name: "News", slug: "news" }],
        posts: [
          {
            title: "With image",
            slug: "with-image",
            meta_description: "Has a photo",
            published_at: "2026-09-01T00:00:00.000Z",
            categories: { name: "News", slug: "news" },
            cover_image: { src: "https://cdn.example/a.webp", alt: "Friends chatting" },
          },
          {
            title: "No image",
            slug: "no-image",
            meta_description: "Text only",
            published_at: "2026-09-01T00:00:00.000Z",
            categories: { name: "News", slug: "news" },
            cover_image: null,
          },
        ],
      }),
    );
    expect(html).toContain("https://cdn.example/a.webp");
    expect(html).toContain("Friends chatting");
    expect(html).toContain("With image");
    expect(html).toContain("No image");
    expect(html.match(/<img\b/g)?.length).toBe(1);
  });
});
