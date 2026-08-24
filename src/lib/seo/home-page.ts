/**
 * Homepage SEO source of truth.
 *
 * `homeRouteHead()` / `applyHomepageSeo()` are authoritative for `/`.
 * Admin `seo_settings` for page_key=home is kept in sync for the SEO UI,
 * but must not silently replace these strings in the rendered `<head>`.
 */
import { createSeoRouteHead } from "./route-head";
import type { ResolvedSeo, SeoGlobal } from "./types";
import type { RouteSeoLoaderData } from "./load-route-seo";

export const HOME_SEO_TITLE =
  "Yaarzo – Free Online Chatrooms, Make Friends & Communities";

export const HOME_SEO_DESCRIPTION =
  "Join Yaarzo for free online chatrooms, make new friends, share posts and discover communities. Explore conversations and start chatting today.";

export const HOME_SEO_CANONICAL = "https://yaarzo.com/";

export const HOME_SEO_H1 =
  "Free Online Chatrooms, Make Friends & Join Communities";

export const HOME_SEO_OG_IMAGE = "https://yaarzo.com/og/yaarzo-share.png";

export const HOME_SEO_FALLBACK: Partial<ResolvedSeo> = {
  title: HOME_SEO_TITLE,
  description: HOME_SEO_DESCRIPTION,
  ogTitle: HOME_SEO_TITLE,
  ogDescription: HOME_SEO_DESCRIPTION,
  twitterTitle: HOME_SEO_TITLE,
  twitterDescription: HOME_SEO_DESCRIPTION,
  canonical: HOME_SEO_CANONICAL,
  ogImage: HOME_SEO_OG_IMAGE,
  twitterImage: HOME_SEO_OG_IMAGE,
};

export function absolutizeYaarzoAsset(path: string): string {
  const raw = path.trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://yaarzo.com${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function homeOgImageFromLoader(
  seo?: { ogImage?: string } | null,
  global?: { default_og_image?: string | null } | null,
): string {
  return absolutizeYaarzoAsset(
    seo?.ogImage || global?.default_og_image || HOME_SEO_OG_IMAGE,
  );
}

export function buildHomeJsonLd(description = HOME_SEO_DESCRIPTION) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Yaarzo",
        url: HOME_SEO_CANONICAL,
        description,
      },
      {
        "@type": "Organization",
        name: "Yaarzo",
        url: HOME_SEO_CANONICAL,
      },
    ],
  };
}

export function applyHomepageSeo(
  base: Partial<ResolvedSeo> | undefined,
  global?: SeoGlobal | null,
): ResolvedSeo {
  const ogImage = homeOgImageFromLoader(base, global);
  const twitterCard = ogImage
    ? (global?.twitter_card || "summary_large_image")
    : "summary";

  return {
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
    keywords: base?.keywords ?? "",
    canonical: HOME_SEO_CANONICAL,
    robots: base?.robots || "index, follow",
    ogTitle: HOME_SEO_TITLE,
    ogDescription: HOME_SEO_DESCRIPTION,
    ogImage,
    ogType: "website",
    twitterCard,
    twitterTitle: HOME_SEO_TITLE,
    twitterDescription: HOME_SEO_DESCRIPTION,
    twitterImage: ogImage,
    jsonLd: null,
    noindex: false,
    nofollow: false,
  };
}

export function homeRouteHead(loaderData?: RouteSeoLoaderData | null) {
  const seo = applyHomepageSeo(loaderData?.seo, loaderData?.global);
  const base = createSeoRouteHead(seo, loaderData?.global);
  return {
    meta: base.meta,
    links: [{ rel: "canonical", href: HOME_SEO_CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(buildHomeJsonLd(HOME_SEO_DESCRIPTION)),
      },
    ],
  };
}
