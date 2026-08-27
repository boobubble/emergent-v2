import { useState } from "react";
import { ArrowRight, PenLine } from "lucide-react";
import type { PublicBlogCategory, PublicBlogListItem } from "@/lib/blog.public";
import { formatBlogDate } from "@/components/blog/blog-format";
import "@/components/blog/blog-ui.css";

export function BlogIndexView({
  posts,
  categories,
}: {
  posts: PublicBlogListItem[];
  categories: PublicBlogCategory[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.categories?.slug === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <div className="yz-blog min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Yaarzo Blog
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
                Stories, tips &amp; community guides
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Making friends online, chatroom guides, and community stories from Yaarzo.
              </p>
            </div>
            <a
              href="/blog/write"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <PenLine size={16} />
              Publish your blog
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryChip
            label="All"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.slug}
              label={c.name}
              active={activeCategory === c.slug}
              onClick={() => setActiveCategory(c.slug)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <p className="text-muted-foreground">No posts here yet — be the first to write one.</p>
          </div>
        )}

        {featured && (
          <a
            href={`/blog/${featured.slug}`}
            className="group mb-8 block rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
              {featured.categories?.name && (
                <span className="font-semibold uppercase tracking-wide text-primary">
                  {featured.categories.name}
                </span>
              )}
              {featured.published_at && <span>{formatBlogDate(featured.published_at)}</span>}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
              {featured.title}
            </h2>
            {featured.meta_description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base line-clamp-2">
                {featured.meta_description}
              </p>
            )}
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read more <ArrowRight size={14} />
            </span>
          </a>
        )}

        <div className={`grid gap-4 sm:gap-5 ${rest.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {rest.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
                {post.categories?.name && (
                  <span className="font-semibold uppercase tracking-wide text-primary">
                    {post.categories.name}
                  </span>
                )}
                {post.published_at && <span>{formatBlogDate(post.published_at)}</span>}
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              {post.meta_description && (
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                  {post.meta_description}
                </p>
              )}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
