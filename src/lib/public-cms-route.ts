import type { PublishedPageDbClient, PublishedCustomPage } from "@/lib/fetch-published-page";
import {
  fetchPublishedPageBySlug,
  buildPublicCmsPageHtml,
  publishedLookupResult,
} from "@/lib/fetch-published-page";
import { loadRelatedChatRoomsForPage, type RelatedChatRoomLink } from "@/lib/pages-cms/related-chat-rooms";
import { loadExploreFeatureLinks, type ExploreFeatureLink } from "@/lib/explore-features-links";
import { allocatePublicLinkWidgets, countInBodyInternalLinks } from "@/lib/pages-cms/public-link-budget";
import { logger } from "@/lib/logger";

export type HydratedPublicCmsPage = PublishedCustomPage & {
  publicHtml: string;
  relatedChatRooms: RelatedChatRoomLink[];
  exploreFeatureLinks: ExploreFeatureLink[];
};

export type PublicSlugResolution =
  | { type: "missing" }
  | { type: "community"; slug: string }
  | { type: "page"; page: HydratedPublicCmsPage };

/** Existence check only — missing community is not an error. Query failures throw. */
export async function findActiveCommunitySlug(
  sb: PublishedPageDbClient,
  slug: string,
): Promise<string | null> {
  const { data, error } = await sb
    .from("communities")
    .select("slug")
    .eq("slug", slug)
    .in("status", ["active", "archived"])
    .maybeSingle();
  const row = publishedLookupResult(data as { slug: string } | null, error, "Failed to look up community");
  return row?.slug ?? null;
}

export async function hydratePublishedPageForPublic(
  sb: PublishedPageDbClient,
  page: PublishedCustomPage,
): Promise<HydratedPublicCmsPage> {
  const publicHtml = await buildPublicCmsPageHtml(sb, page);
  const { related: relatedMax, explore: exploreCount } = allocatePublicLinkWidgets(
    countInBodyInternalLinks(publicHtml),
  );
  let relatedChatRooms: RelatedChatRoomLink[] = [];
  let exploreFeatureLinks: ExploreFeatureLink[] = [];
  if (relatedMax > 0) {
    try {
      relatedChatRooms = await loadRelatedChatRoomsForPage(sb, page, { max: relatedMax });
    } catch (err) {
      logger.error("custom-page related chat rooms failed", err, { slug: page.slug });
    }
  }
  if (exploreCount > 0) {
    try {
      exploreFeatureLinks = await loadExploreFeatureLinks(sb, page.slug, { count: exploreCount });
    } catch (err) {
      logger.error("custom-page explore feature links failed", err, { slug: page.slug });
    }
  }
  return { ...page, publicHtml, relatedChatRooms, exploreFeatureLinks };
}

/**
 * SSR-safe top-level slug resolution using the service-role client.
 * Does not use createServerFn (POST server fns must not run inside GET loaders).
 */
export async function resolvePublicTopLevelSlug(
  sb: PublishedPageDbClient,
  rawSlug: string,
): Promise<PublicSlugResolution> {
  const communitySlug = await findActiveCommunitySlug(sb, rawSlug);
  if (communitySlug) return { type: "community", slug: communitySlug };

  const page = await fetchPublishedPageBySlug(sb, rawSlug);
  if (!page) return { type: "missing" };

  const hydrated = await hydratePublishedPageForPublic(sb, page);
  return { type: "page", page: hydrated };
}
