import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublishedPage } from "@/lib/pages.functions";
import { sanitizeHtml } from "@/lib/pages-io";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye } from "lucide-react";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const page = await getPublishedPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.page;
    if (!p) return {};
    const url = `https://holo-chat-quest.lovable.app/p/${params.slug}`;
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
        }),
      }],
    };
  },
  component: PublicPage,
});

function PublicPage() {
  const { page } = Route.useLoaderData();
  const safeHtml = sanitizeHtml(page.content);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-3xl items-center gap-2 px-4">
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />Back</Button></Link>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />{page.views} views
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {page.category && <Badge variant="outline">{page.category}</Badge>}
          {(page.tags ?? []).map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
        </div>
        {page.excerpt && <p className="mt-3 text-sm text-muted-foreground">{page.excerpt}</p>}

        <article
          className="prose prose-sm dark:prose-invert mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </main>
    </div>
  );
}
