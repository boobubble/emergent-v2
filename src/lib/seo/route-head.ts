import type { ResolvedSeo } from "./types";
import { buildHeadLinks, buildHeadMeta, buildJsonLdScripts } from "./meta-builder";

/** TanStack Router head() helper for static pages using pre-resolved SEO. */
export function createSeoRouteHead(seo: ResolvedSeo, global?: Parameters<typeof buildHeadMeta>[1]) {
  return {
    meta: buildHeadMeta(seo, global),
    links: buildHeadLinks(seo),
    scripts: buildJsonLdScripts(seo.jsonLd as Record<string, string | number | boolean | null> | null),
  };
}

/** Default fallbacks when DB row is missing (SSR-safe). */
export function seoFallback(label: string, description?: string): Partial<ResolvedSeo> {
  return {
    title: label,
    description: description ?? `${label} on our community platform.`,
    ogTitle: label,
    ogDescription: description ?? `${label} on our community platform.`,
  };
}
