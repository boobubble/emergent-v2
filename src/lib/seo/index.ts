export * from "./types";
export * from "./route-registry";
export * from "./resolve-seo";
export * from "./meta-builder";
export * from "./health";
export * from "./sitemap";

export { createSeoRouteHead, seoFallback, staticPublicHead } from "./route-head";
export {
  NOT_FOUND_SEO_TITLE,
  NOT_FOUND_ROBOTS,
  notFoundSeo,
  notFoundSeoHead,
} from "./not-found";
export { ADMIN_ROBOTS, ADMIN_SEO_TITLE, adminRouteHead } from "./admin-head";
export {
  applyBrandChromeToDocument,
  readRouteOwnedSeo,
  ROUTE_OWNED_SEO_KEYS,
} from "./dynamic-brand-chrome";
export {
  loadRouteSeo,
  loadRouteSeoWithDefaults,
  loadPrivateRouteSeo,
  loadDynamicRouteSeo,
  headFromRouteSeo,
  isPrivateSeoRoute,
  loadSeoSiteContext,
  type RouteSeoLoaderData,
  type DynamicRouteSeoInput,
} from "./load-route-seo";
export type { EntitySeoOverride } from "./resolve-seo";
export { formatCanonicalUrl } from "./resolve-seo";
export {
  HOME_SEO_TITLE,
  HOME_SEO_DESCRIPTION,
  HOME_SEO_CANONICAL,
  HOME_SEO_H1,
  HOME_SEO_FALLBACK,
  homeRouteHead,
  applyHomepageSeo,
  buildHomeJsonLd,
} from "./home-page";
export {
  ALTERNATE_HOMEPAGE_PATHS,
  ALTERNATE_HOMEPAGE_ROBOTS,
  applyAlternateHomepageRobots,
  isAlternateHomepagePath,
} from "./alternate-homepage";
export {
  buildCompetitionFallbackJsonLd,
  buildPoetryFallbackJsonLd,
  buildFeedPostFallbackJsonLd,
  buildCmsFallbackJsonLd,
  competitionOgImage,
} from "./load-route-seo";
export {
  sanitizeTemplateVars,
  stripUnresolvedTemplateVars,
  buildCompetitionSeoVars,
  buildCommunitySeoVars,
  buildPoetrySeoVars,
  buildFeedPostSeoVars,
  buildProfileSeoVars,
  buildGameSeoVars,
  buildCmsPageSeoVars,
} from "./meta-builder";
