import type { ResolvedSeo } from "./types";
import { DEFAULT_SITE_ORIGIN, formatCanonicalUrl } from "./resolve-seo";
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

/** Hardcoded public routes that do not go through loadRouteSeo still need a self-canonical. */
export function staticPublicHead(input: {
  title: string;
  description: string;
  path: string;
  origin?: string;
}): {
  meta: Array<{ title?: string; name?: string; property?: string; content?: string }>;
  links: Array<{ rel: string; href: string }>;
} {
  const origin = (input.origin || DEFAULT_SITE_ORIGIN).replace(/\/$/, "");
  const canonical = formatCanonicalUrl(origin, input.path);
  return {
    meta: [
      { title: input.title },
      { name: "description", content: input.description },
      { property: "og:title", content: input.title },
      { property: "og:description", content: input.description },
      { property: "og:url", content: canonical },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
