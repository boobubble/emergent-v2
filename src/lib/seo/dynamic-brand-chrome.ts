/**
 * Brand chrome applied client-side by DynamicBrandHead.
 *
 * Route `head()` (via headFromRouteSeo / createSeoRouteHead) is the canonical
 * owner of page SEO: title, description, keywords, robots, canonical, and
 * Open Graph / Twitter title+description+image.
 *
 * This module must never mutate those fields — doing so overwrote Custom Page
 * SSR titles after hydration (e.g. /lahore-chat-room → global Yaarzo title).
 */

export type BrandChromeInput = {
  themeColor?: string | null;
  siteName?: string | null;
  shortName?: string | null;
  author?: string | null;
  googleVerification?: string | null;
  bingVerification?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  favicon?: string | null;
  appleTouchIcon?: string | null;
};

/** Meta name/property keys that belong to route head() — never touch from brand chrome. */
export const ROUTE_OWNED_SEO_KEYS = [
  "description",
  "keywords",
  "robots",
  "og:title",
  "og:description",
  "og:image",
  "og:url",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:card",
] as const;

export type RouteOwnedSeoSnapshot = {
  title: string;
  description: string | null;
  robots: string | null;
  canonical: string | null;
  ogTitle: string | null;
  keywords: string | null;
};

function setMeta(
  doc: Document,
  attr: "name" | "property",
  key: string,
  content: string,
) {
  if (!content) return;
  const head = doc.head;
  let el = head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = doc.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("content", content);
    head.appendChild(el);
    return;
  }
  el.setAttribute("content", content);
}

function setLink(doc: Document, rel: string, href: string, type?: string) {
  if (!href) return;
  const head = doc.head;
  let el = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = doc.createElement("link");
    el.rel = rel;
    el.href = href;
    if (type) el.type = type;
    head.appendChild(el);
    return;
  }
  el.href = href;
  if (type) el.type = type;
}

export function readRouteOwnedSeo(doc: Document): RouteOwnedSeoSnapshot {
  const get = (attr: "name" | "property", key: string) =>
    doc.head.querySelector(`meta[${attr}="${key}"]`)?.getAttribute("content") ?? null;
  return {
    title: doc.title,
    description: get("name", "description"),
    robots: get("name", "robots"),
    canonical: doc.head.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    ogTitle: get("property", "og:title"),
    keywords: get("name", "keywords"),
  };
}

/**
 * Apply white-label / global brand chrome only.
 * Does not set document.title or any route-owned SEO fields.
 */
export function applyBrandChromeToDocument(doc: Document, chrome: BrandChromeInput): void {
  if (chrome.themeColor) setMeta(doc, "name", "theme-color", chrome.themeColor);
  const appTitle = chrome.siteName || chrome.shortName;
  if (appTitle) setMeta(doc, "name", "apple-mobile-web-app-title", appTitle);
  if (chrome.author) setMeta(doc, "name", "author", chrome.author);
  if (chrome.googleVerification) {
    setMeta(doc, "name", "google-site-verification", chrome.googleVerification);
  }
  if (chrome.bingVerification) setMeta(doc, "name", "msvalidate.01", chrome.bingVerification);
  if (chrome.siteName) setMeta(doc, "property", "og:site_name", chrome.siteName);
  if (chrome.twitterSite) setMeta(doc, "name", "twitter:site", chrome.twitterSite);
  if (chrome.twitterCreator) setMeta(doc, "name", "twitter:creator", chrome.twitterCreator);

  if (chrome.favicon) {
    setLink(
      doc,
      "icon",
      chrome.favicon,
      chrome.favicon.endsWith(".ico") ? "image/x-icon" : "image/png",
    );
  }
  if (chrome.appleTouchIcon) setLink(doc, "apple-touch-icon", chrome.appleTouchIcon);
}
