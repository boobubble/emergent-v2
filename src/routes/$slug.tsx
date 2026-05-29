import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublishedPage } from "@/lib/pages.functions";
import { isReservedSlug } from "@/lib/reserved-routes";
import { sanitizeHtml } from "@/lib/pages-io";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye } from "lucide-react";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    // Reserved slugs should never reach a published page; bail early.
    if (isReservedSlug(params.slug)) throw notFound();
    const page = await getPublishedPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.page;
    if (!p) return {};
    const url = `https://holo-chat-quest.lovable.app/${params.slug}`;
    const title = p.meta_title || p.title;
    const desc = p.meta_description || p.excerpt || `${p.title} on our community.`;
    const robots = [p.noindex ? "noindex" : "index", p.nofollow ? "nofollow" : "follow"].join(", ");
    const ogImage = p.og_image || undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { name: "robots", content: robots },
      { property: "og:title", content: p.og_title || title },
      { property: "og:description", content: p.og_description || desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
    ];
    if (p.meta_keywords) meta.push({ name: "keywords", content: p.meta_keywords });
    if (ogImage) {
      meta.push({ property: "og:image", content: ogImage });
      meta.push({ name: "twitter:image", content: ogImage });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: p.canonical_url || url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: desc,
          image: ogImage,
          datePublished: p.published_at,
          url,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://holo-chat-quest.lovable.app/" },
              { "@type": "ListItem", position: 2, name: p.title, item: url },
            ],
          },
        }),
      }],
    };
  },
  component: PublicPage,
});

function PublicPage() {
  const { page } = Route.useLoaderData();
  const safeHtml = sanitizeHtml(page.content);

  const layout = (page.layout ?? "boxed") as "full" | "boxed";
  const leftSidebar = (page.sidebar_left ?? "none") as "none" | "ads" | "feed";
  const rightSidebar = (page.sidebar_right ?? "none") as "none" | "ads" | "feed";

  const hasLeft = leftSidebar !== "none";
  const hasRight = rightSidebar !== "none";

  // Grid columns adapt to which sidebars are enabled.
  const gridCols = hasLeft && hasRight
    ? "lg:grid-cols-[220px_minmax(0,1fr)_220px]"
    : hasLeft
      ? "lg:grid-cols-[220px_minmax(0,1fr)]"
      : hasRight
        ? "lg:grid-cols-[minmax(0,1fr)_220px]"
        : "";

  const containerCls = layout === "full"
    ? "mx-auto w-full px-4 py-8"
    : "mx-auto w-full max-w-6xl px-4 py-8";

  const articleWrapCls = hasLeft || hasRight
    ? `grid gap-6 ${gridCols}`
    : layout === "full" ? "mx-auto max-w-3xl" : "mx-auto max-w-3xl";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className={layout === "full" ? "mx-auto flex h-12 w-full items-center gap-2 px-4" : "mx-auto flex h-12 max-w-6xl items-center gap-2 px-4"}>
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />Back</Button></Link>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />{page.views} views
          </span>
        </div>
      </header>

      <main className={containerCls}>
        <div className={articleWrapCls}>
          {hasLeft && <PageSidebar mode={leftSidebar} side="left" />}

          <article>
            <nav className="mb-3 text-[11px] text-muted-foreground">
              <Link to="/" className="hover:underline">Home</Link>
              <span className="mx-1">/</span>
              <span>{page.title}</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              {(page.tags ?? []).map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
            </div>
            {page.excerpt && <p className="mt-3 text-sm text-muted-foreground">{page.excerpt}</p>}

            <div
              className="prose prose-sm dark:prose-invert mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </article>

          {hasRight && <PageSidebar mode={rightSidebar} side="right" />}
        </div>
      </main>
    </div>
  );
}

function PageSidebar({ mode, side }: { mode: "ads" | "feed"; side: "left" | "right" }) {
  return (
    <aside
      className="hidden lg:block"
      aria-label={`${side} ${mode} sidebar`}
    >
      <div className="sticky top-16 space-y-3">
        {mode === "ads" ? (
          <div className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground">
            <div className="text-[10px] uppercase tracking-wide opacity-70">Advertisement</div>
            <div className="mt-2 grid h-48 place-items-center rounded bg-muted/40 text-muted-foreground/60">
              Ad slot
            </div>
          </div>
        ) : (
          <FeedMenuSidebar />
        )}
      </div>
    </aside>
  );
}

function FeedMenuSidebar() {
  const items: { to: string; label: string }[] = [
    { to: "/feed", label: "Feed" },
    { to: "/rooms" as string, label: "Rooms" },
    { to: "/games", label: "Games" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/achievements", label: "Achievements" },
    { to: "/find-friends", label: "Find friends" },
  ];
  return (
    <nav className="rounded-lg border bg-card p-2 text-sm">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Explore</div>
      <ul className="mt-1 space-y-0.5">
        {items.map((i) => (
          <li key={i.to}>
            <a
              href={i.to}
              className="block rounded px-2 py-1.5 text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
