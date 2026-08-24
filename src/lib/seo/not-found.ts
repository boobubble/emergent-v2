import type { ResolvedSeo } from "./types";
import { createSeoRouteHead } from "./route-head";

export const NOT_FOUND_SEO_TITLE = "Page Not Found | Yaarzo";
export const NOT_FOUND_SEO_DESCRIPTION = "This page could not be found.";
export const NOT_FOUND_ROBOTS = "noindex, follow";

export function notFoundSeo(): ResolvedSeo {
  return {
    title: NOT_FOUND_SEO_TITLE,
    description: NOT_FOUND_SEO_DESCRIPTION,
    keywords: "",
    canonical: "",
    robots: NOT_FOUND_ROBOTS,
    ogTitle: NOT_FOUND_SEO_TITLE,
    ogDescription: NOT_FOUND_SEO_DESCRIPTION,
    ogImage: "",
    ogType: "website",
    twitterCard: "summary",
    twitterTitle: NOT_FOUND_SEO_TITLE,
    twitterDescription: NOT_FOUND_SEO_DESCRIPTION,
    twitterImage: "",
    jsonLd: null,
    noindex: true,
    nofollow: false,
  };
}

export function notFoundSeoHead() {
  return createSeoRouteHead(notFoundSeo());
}
