export * from "./types";
export * from "./route-registry";
export * from "./resolve-seo";
export * from "./meta-builder";
export * from "./health";
export * from "./sitemap";

export { createSeoRouteHead, seoFallback } from "./route-head";
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
export {
  DEFAULT_SITE_ORIGIN,
} from "./resolve-seo";
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
