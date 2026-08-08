import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPublishedPage } from "@/lib/pages.functions";
import { getCommunityBySlug } from "@/lib/community.functions";
import { isReservedSlug } from "@/lib/reserved-routes";
import { isNavigableSlug } from "@/lib/route-slug";
import {
  customPageQueryKey,
  publishedPageMatchesSlug,
} from "@/lib/fetch-published-page";
import { PublicCmsPageView, type PublicCmsPage } from "@/components/PublicCmsPageView";
import {
  loadDynamicRouteSeo,
  headFromRouteSeo,
  buildCmsPageSeoVars,
  buildCmsFallbackJsonLd,
  loadSeoSiteContext,
} from "@/lib/seo";

function redirectReservedSlug(slug: string) {
  const key = slug.toLowerCase();
  if (key === "rooms" || key === "messages") {
    throw redirect({ to: "/chatroom", replace: true });
  }
  if (["auth", "login", "register", "signup", "logout"].includes(key)) {
    throw redirect({ to: "/login", replace: true });
  }
  throw redirect({ to: "/welcome", replace: true });
}

function PublicPageNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is not available.</p>
        <Link to="/welcome" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go to welcome
        </Link>
      </div>
    </div>
  );
}

function PublicPageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">Page unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page could not be loaded.</p>
        <button onClick={reset} className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Try again
        </button>
      </div>
    </div>
  );
}

function PublicPageLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <p className="text-sm text-muted-foreground">Loading page…</p>
    </div>
  );
}

export const Route = createFileRoute("/$slug")({
  staleTime: 0,
  loader: async ({ params }) => {
    const slug = params.slug;
    if (!isNavigableSlug(slug)) throw notFound();
    if (isReservedSlug(slug)) redirectReservedSlug(slug);
    const community = await getCommunityBySlug({ data: { slug } });
    if (community) {
      throw redirect({ to: "/community/$slug", params: { slug }, replace: true });
    }
    const page = await getPublishedPage({ data: { slug } });
    if (!page) throw notFound();
    if (page.redirectedFrom) {
      throw redirect({
        to: "/$slug",
        params: { slug: page.slug },
        replace: true,
        statusCode: 301,
      });
    }
    const { origin, siteName } = await loadSeoSiteContext();
    const url = `${origin}/${page.slug}`;
    const title = page.meta_title || page.title;
    const desc = page.meta_description || page.excerpt || `${page.title} on our community.`;
    const ogImage = page.og_image || undefined;
    const keywords = page.meta_keywords || (page.tags?.length ? page.tags.join(", ") : "");
    const robots = [page.noindex ? "noindex" : "index", page.nofollow ? "nofollow" : "follow"].join(", ");
    const seoData = await loadDynamicRouteSeo({
      templatePath: "/$slug",
      instancePath: `/${page.slug}`,
      vars: buildCmsPageSeoVars({
        page: page as unknown as Record<string, unknown>,
        slug: page.slug,
        siteName,
        origin,
      }),
      entityOverride: {
        title: page.meta_title || undefined,
        description: page.meta_description || undefined,
        keywords: keywords || undefined,
        canonical: page.canonical_url || undefined,
        ogTitle: page.og_title || undefined,
        ogDescription: page.og_description || undefined,
        ogImage: page.og_image || undefined,
        noindex: !!page.noindex,
        nofollow: !!page.nofollow,
        robots,
      },
      fallback: {
        title,
        description: desc,
        keywords: keywords || undefined,
        ogTitle: page.og_title || title,
        ogDescription: page.og_description || desc,
        ogImage,
        twitterImage: ogImage,
        canonical: page.canonical_url || url,
        robots,
        noindex: !!page.noindex,
        nofollow: !!page.nofollow,
      },
      fallbackJsonLd: buildCmsFallbackJsonLd({
        title: page.title,
        description: desc,
        url: page.canonical_url || url,
        publishedAt: page.published_at,
        image: ogImage,
      }),
    });
    return { page, slug, seoData };
  },

  head: ({ loaderData }) => headFromRouteSeo(loaderData?.seoData),
  notFoundComponent: PublicPageNotFound,
  errorComponent: PublicPageError,
  // Do NOT set pendingComponent: Suspense fallback streamed empty markup to crawlers.
  component: PublicPage,
});

function PublicPage() {
  const { slug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const fetchPage = useServerFn(getPublishedPage);

  const loaderPage = loaderData.page as PublicCmsPage;
  const slugMatchesLoader = publishedPageMatchesSlug(loaderPage, slug);

  const pageQuery = useQuery({
    queryKey: customPageQueryKey(slug),
    queryFn: () => fetchPage({ data: { slug } }),
    initialData: slugMatchesLoader ? loaderPage : undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const page =
    (pageQuery.data && publishedPageMatchesSlug(pageQuery.data, slug)
      ? (pageQuery.data as PublicCmsPage)
      : null) ?? (slugMatchesLoader ? loaderPage : null);

  if (!page) {
    return <PublicPageLoading />;
  }

  return <PublicCmsPageView key={`${page.id}:${page.slug}`} page={page} />;
}
