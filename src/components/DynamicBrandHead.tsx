import { useEffect } from "react";
import { useBrand } from "@/lib/branding";

/**
 * Applies white-label branding to <head> at runtime.
 *
 * The root route's static head() runs during SSR before app_settings loads,
 * so it ships defaults. This component mounts inside AppSettingsProvider and
 * overrides title, meta, theme-color, favicon, and OG tags once the buyer's
 * branding is resolved from the database.
 */
export function DynamicBrandHead() {
  const brand = useBrand();

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Title
    if (brand.metaTitle) document.title = brand.metaTitle;

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

    setMeta("name", "description", brand.metaDescription);
    setMeta("name", "keywords", brand.metaKeywords);
    setMeta("name", "theme-color", brand.themeColor);
    setMeta("name", "apple-mobile-web-app-title", brand.shortName);
    setMeta("property", "og:title", brand.metaTitle);
    setMeta("property", "og:description", brand.metaDescription);
    setMeta("property", "og:site_name", brand.name);
    if (brand.ogImage) setMeta("property", "og:image", brand.ogImage);
    setMeta("name", "twitter:title", brand.metaTitle);
    setMeta("name", "twitter:description", brand.metaDescription);
    if (brand.ogImage) setMeta("name", "twitter:image", brand.ogImage);

    // Favicon + apple touch
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
  }, [brand]);

  return null;
}
