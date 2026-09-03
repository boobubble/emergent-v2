/**
 * Combined cap across in-body CMS links + Related Chat Rooms + Explore Features.
 * Widgets yield first so already-published in-body HTML does not need a rewrite.
 */
import { extractInternalHrefs } from "@/lib/internal-linking-orphans";
import { RELATED_CHAT_ROOMS_MAX } from "@/lib/pages-cms/related-chat-rooms";
import { EXPLORE_FEATURES_BLOG_COUNT, EXPLORE_FEATURES_COUNT } from "@/lib/explore-features-links";

export const CMS_PUBLIC_LINK_BUDGET = 12;
export const BLOG_PUBLIC_LINK_BUDGET = 6;

export function countInBodyInternalLinks(html: string): number {
  return extractInternalHrefs(html || "").length;
}

export function allocatePublicLinkWidgets(
  inBodyCount: number,
  opts?: { budget?: number; relatedMax?: number; exploreMax?: number },
): { related: number; explore: number } {
  const budget = opts?.budget ?? CMS_PUBLIC_LINK_BUDGET;
  const relatedMax = Math.max(0, opts?.relatedMax ?? RELATED_CHAT_ROOMS_MAX);
  const exploreMax = Math.max(0, opts?.exploreMax ?? EXPLORE_FEATURES_COUNT);
  let remaining = Math.max(0, budget - Math.max(0, inBodyCount));
  const related = Math.min(relatedMax, remaining);
  remaining -= related;
  const explore = Math.min(exploreMax, remaining);
  return { related, explore };
}

export function allocateBlogExploreCount(inBodyCount: number): number {
  return allocatePublicLinkWidgets(inBodyCount, {
    budget: BLOG_PUBLIC_LINK_BUDGET,
    relatedMax: 0,
    exploreMax: EXPLORE_FEATURES_BLOG_COUNT,
  }).explore;
}
