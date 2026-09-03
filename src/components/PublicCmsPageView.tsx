/**
 * Presentational public CMS page view — safe for TanStack Start SSR.
 * Uses plain anchors (not router Link) so renderToString works without a router.
 */
import { sanitizeHtml } from "@/lib/pages-io";
import "@/styles/app-surfaces.css";
import "@/lib/pages-cms/cms-page-images.css";
import "@/lib/cta-button.css";
import { placeCmsImagesInContent } from "@/lib/pages-cms/cms-image-placement";
import { injectHeadingIds } from "@/lib/heading-ids";
import { resolvePublicCmsH1 } from "@/lib/pages-cms/public-page-ssr";
import { RelatedChatRooms } from "@/components/RelatedChatRooms";
import { ExploreFeaturesLinks } from "@/components/ExploreFeaturesLinks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import type { PublishedCustomPage } from "@/lib/fetch-published-page";
import type { RelatedChatRoomLink } from "@/lib/pages-cms/related-chat-rooms";
import type { ExploreFeatureLink } from "@/lib/explore-features-links";

export type PublicCmsPage = PublishedCustomPage & {
  publicHtml?: string;
  relatedChatRooms?: RelatedChatRoomLink[] | null;
  exploreFeatureLinks?: ExploreFeatureLink[] | null;
};

export type CityDirectoryEntry = {
  slug: string;
  title: string;
};

export function PublicCmsPageView({
  page,
  cityDirectory,
}: {
  page: PublicCmsPage;
  cityDirectory?: CityDirectoryEntry[];
}) {
  const rawHtml = page.publicHtml ?? page.content;
  const safeHtml = sanitizeHtml(injectHeadingIds(placeCmsImagesInContent(rawHtml)));

  const layout = (page.layout ?? "boxed") as "full" | "boxed";
  const leftSidebar = (page.sidebar_left ?? "none") as "none" | "ads" | "feed";
  const rightSidebar = (page.sidebar_right ?? "none") as "none" | "ads" | "feed";

  const hasLeft = leftSidebar !== "none";
  const hasRight = rightSidebar !== "none";

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
    : "mx-auto max-w-3xl";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className={layout === "full" ? "mx-auto flex h-12 w-full items-center gap-2 px-4" : "mx-auto flex h-12 max-w-6xl items-center gap-2 px-4"}>
          <a href="/">
            <Button variant="ghost" size="sm" type="button">
              <ArrowLeft className="mr-1 h-4 w-4" />Back
            </Button>
          </a>
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
              <a href="/" className="hover:underline">Home</a>
              <span className="mx-1">/</span>
              <span>{page.title}</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {resolvePublicCmsH1(page)}
            </h1>
            {page.excerpt && <p className="mt-3 text-sm text-muted-foreground">{page.excerpt}</p>}

            <div
              className="custom-page-content prose prose-sm dark:prose-invert mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            {cityDirectory && cityDirectory.length > 0 && (
              <nav
                className="city-directory mt-10 border-t border-border/60 pt-8"
                aria-label="Browse by City"
              >
                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Browse by City
                </h2>
                <ul className="mt-5 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {cityDirectory.map((city) => (
                    <li key={city.slug} className="m-0 p-0">
                      <a
                        href={`/${city.slug}`}
                        className={[
                          "flex items-center rounded-lg border border-primary/15 bg-primary/[0.06]",
                          "px-4 py-2.5 text-sm font-medium text-foreground/90 no-underline",
                          "shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none",
                          "transition-[border-color,background-color,color,box-shadow] duration-200 ease-out",
                          "hover:border-primary/35 hover:bg-primary/[0.11] hover:text-foreground",
                          "hover:shadow-[0_6px_16px_-8px_rgba(15,23,42,0.28)]",
                          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        ].join(" ")}
                      >
                        {city.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Outside custom_pages.content — reusable SSR links from page_internal_links */}
            <RelatedChatRooms links={page.relatedChatRooms} />
            <ExploreFeaturesLinks links={page.exploreFeatureLinks} />
          </article>

          {hasRight && <PageSidebar mode={rightSidebar} side="right" />}
        </div>
      </main>
    </div>
  );
}

function PageSidebar({ mode, side }: { mode: "ads" | "feed"; side: "left" | "right" }) {
  return (
    <aside className="hidden lg:block" aria-label={`${side} ${mode} sidebar`}>
      <div className="sticky top-16 space-y-3">
        {mode === "ads" ? (
          <div className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground">
            <div className="text-[10px] uppercase tracking-wide opacity-70">Advertisement</div>
            <div className="mt-2 grid h-48 place-items-center rounded bg-muted/40 text-muted-foreground/60">
              Ad slot
            </div>
          </div>
        ) : (
          <nav className="rounded-lg border bg-card p-2 text-sm">
            <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Explore</div>
          </nav>
        )}
      </div>
    </aside>
  );
}
