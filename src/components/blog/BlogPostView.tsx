import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import type { PublicBlogPost } from "@/lib/blog.public";
import { formatBlogDate, readingTimeFromHtml } from "@/components/blog/blog-format";
import { BlogProse } from "@/components/blog/BlogProse";
import { BlogReadingProgress } from "@/components/blog/BlogReadingProgress";
import "@/components/blog/blog-ui.css";

export function BlogPostView({ post }: { post: PublicBlogPost }) {
  const readTime = readingTimeFromHtml(post.content);
  const date = formatBlogDate(post.published_at);

  return (
    <div className="yz-blog min-h-screen bg-background text-foreground">
      <BlogReadingProgress />
      <article className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-6 text-sm text-muted-foreground">
          <a href="/blog" className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            Blog
          </a>
          <span className="mx-1.5" aria-hidden="true">
            /
          </span>
          <span className="text-foreground/80">{post.title}</span>
        </nav>

        {post.categories?.name && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {post.categories.name}
          </p>
        )}
        <h1 className="mt-2 text-[1.85rem] font-semibold leading-[1.2] tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        {post.meta_description && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {post.meta_description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
          {date && <time dateTime={post.published_at ?? undefined}>{date}</time>}
          {date && readTime && <span aria-hidden="true">·</span>}
          {readTime && <span>{readTime}</span>}
          <CopyLinkButton />
        </div>

        <div className="mt-8">
          <BlogProse html={post.content} />
        </div>
      </article>
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check size={13} /> : <Link2 size={13} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
