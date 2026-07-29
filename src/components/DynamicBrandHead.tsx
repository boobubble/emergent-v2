import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useBrand } from "@/lib/branding";
import { getPublicSeoGlobal } from "@/lib/seo.functions";

/**
 * Applies centralized SEO global defaults + white-label branding to <head> at runtime.
 */
export function DynamicBrandHead() {
  const brand = useBrand();
  const fetchGlobal = useServerFn(getPublicSeoGlobal);
  const { data: seoGlobal } = useQuery({
    queryKey: ["seo-global-public"],
    queryFn: () => fetchGlobal({}),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const title = seoGlobal?.default_title || brand.metaTitle;
    const description = seoGlobal?.default_description || brand.metaDescription;
    const keywords = seoGlobal?.default_keywords || brand.metaKeywords;
    const ogImage = seoGlobal?.default_og_image || brand.ogImage;
    const themeColor = seoGlobal?.theme_color || brand.themeColor;

    if (title) document.title = title;

    const setMeta = (attr: "name" | "property", key: string, content: string) => {
      if (!content) return;
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("name", "theme-color", themeColor);
    setMeta("name", "apple-mobile-web-app-title", seoGlobal?.site_name || brand.shortName);
    if (seoGlobal?.author) setMeta("name", "author", seoGlobal.author);
    if (seoGlobal?.google_verification) setMeta("name", "google-site-verification", seoGlobal.google_verification);
    if (seoGlobal?.bing_verification) setMeta("name", "msvalidate.01", seoGlobal.bing_verification);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:site_name", seoGlobal?.site_name || brand.name);
    if (ogImage) setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", seoGlobal?.twitter_card || "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    if (seoGlobal?.twitter_site) setMeta("name", "twitter:site", seoGlobal.twitter_site);
    if (seoGlobal?.twitter_creator) setMeta("name", "twitter:creator", seoGlobal.twitter_creator);
    if (ogImage) setMeta("name", "twitter:image", ogImage);

    const setLink = (rel: string, href: string, type?: string) => {
      if (!href) return;
      let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
      if (type) el.type = type;
    };
    if (brand.favicon) setLink("icon", brand.favicon, brand.favicon.endsWith(".ico") ? "image/x-icon" : "image/png");
    if (brand.appleTouchIcon) setLink("apple-touch-icon", brand.appleTouchIcon);
  }, [brand, seoGlobal]);

  return null;
}
