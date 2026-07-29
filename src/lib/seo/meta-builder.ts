import type { ResolvedSeo, SeoGlobal } from "./types";

type HeadMeta = { title?: string; name?: string; property?: string; content?: string; charSet?: string };

export function buildHeadMeta(seo: ResolvedSeo, global?: SeoGlobal | null): HeadMeta[] {
  const meta: HeadMeta[] = [
    { title: seo.title },
    { name: "description", content: seo.description },
  ];
  if (seo.keywords) meta.push({ name: "keywords", content: seo.keywords });
  if (seo.robots) meta.push({ name: "robots", content: seo.robots });
  if (global?.author) meta.push({ name: "author", content: global.author });
  if (global?.theme_color) meta.push({ name: "theme-color", content: global.theme_color });
  if (global?.google_verification) meta.push({ name: "google-site-verification", content: global.google_verification });
  if (global?.bing_verification) meta.push({ name: "msvalidate.01", content: global.bing_verification });
  if (global?.yandex_verification) meta.push({ name: "yandex-verification", content: global.yandex_verification });
  if (global?.baidu_verification) meta.push({ name: "baidu-site-verification", content: global.baidu_verification });

  meta.push(
    { property: "og:title", content: seo.ogTitle },
    { property: "og:description", content: seo.ogDescription },
    { property: "og:type", content: seo.ogType },
  );
  if (seo.ogImage) meta.push({ property: "og:image", content: seo.ogImage });
  if (seo.canonical) meta.push({ property: "og:url", content: seo.canonical });

  meta.push({ name: "twitter:card", content: seo.twitterCard });
  meta.push({ name: "twitter:title", content: seo.twitterTitle });
  meta.push({ name: "twitter:description", content: seo.twitterDescription });
  if (seo.twitterImage) meta.push({ name: "twitter:image", content: seo.twitterImage });
  if (global?.twitter_site) meta.push({ name: "twitter:site", content: global.twitter_site });
  if (global?.twitter_creator) meta.push({ name: "twitter:creator", content: global.twitter_creator });
  if (global?.facebook_app_id) meta.push({ property: "fb:app_id", content: global.facebook_app_id });

  return meta;
}

export function buildHeadLinks(seo: ResolvedSeo): { rel: string; href: string }[] {
  if (!seo.canonical) return [];
  return [{ rel: "canonical", href: seo.canonical }];
}

export function buildJsonLdScripts(jsonLd: Record<string, string | number | boolean | null> | null | undefined): { type: string; children: string }[] {
  if (!jsonLd) return [];
  return [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }];
}
