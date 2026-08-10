import { describe, it, expect, beforeEach } from "vitest";
import { resolvePageSeo } from "@/lib/seo/resolve-seo";
import { createSeoRouteHead } from "@/lib/seo/route-head";
import { headFromRouteSeo, type RouteSeoLoaderData } from "@/lib/seo/load-route-seo";
import {
  applyBrandChromeToDocument,
  readRouteOwnedSeo,
  ROUTE_OWNED_SEO_KEYS,
} from "@/lib/seo/dynamic-brand-chrome";
import type { SeoGlobal } from "@/lib/seo/types";

const GLOBAL_TITLE = "Yaarzo – Dosti, Chatrooms and Social Community";

const globalSeo: SeoGlobal = {
  id: 1,
  site_name: "Yaarzo",
  site_tagline: "Dosti, Chatrooms and Social Community",
  default_title: GLOBAL_TITLE,
  default_description: "Yaarzo is a social community with chatrooms.",
  default_keywords: null,
  canonical_domain: "https://yaarzo.com",
  robots: "index, follow",
  theme_color: "#3B82F6",
  author: "Yaarzo",
  language: "en",
  default_og_image: "https://yaarzo.com/og.png",
  twitter_card: "summary_large_image",
  twitter_site: "@yaarzo",
  twitter_creator: null,
  facebook_app_id: null,
  google_verification: null,
  bing_verification: null,
  yandex_verification: null,
  baidu_verification: null,
};

const LAHORE_TITLE = "Lahore Chat Room | Free Online Lahore Chat Room on Yaarzo";
const LAHORE_DESC = "Join free Lahore chat rooms on Yaarzo.";
const LAHORE_CANONICAL = "https://yaarzo.com/lahore-chat-room";
const LAHORE_ROBOTS = "index, follow";

const PAKISTAN_TITLE = "Pakistan chat room | Free Online Chat on Yaarzo";
const INDIA_TITLE = "India chat room | Free Online Chat on Yaarzo";

/** Minimal Document stub — no jsdom in this environment. */
function makeDoc(seed: {
  title: string;
  description: string;
  robots: string;
  canonical: string;
  ogTitle?: string;
  keywords?: string;
}): Document {
  const metas = new Map<string, { attr: "name" | "property"; key: string; content: string }>();
  const links = new Map<string, { rel: string; href: string; type?: string }>();

  const putMeta = (attr: "name" | "property", key: string, content: string) => {
    metas.set(`${attr}:${key}`, { attr, key, content });
  };
  putMeta("name", "description", seed.description);
  putMeta("name", "robots", seed.robots);
  if (seed.keywords) putMeta("name", "keywords", seed.keywords);
  putMeta("property", "og:title", seed.ogTitle ?? seed.title);
  links.set("canonical", { rel: "canonical", href: seed.canonical });

  let title = seed.title;

  const head = {
    querySelector(selector: string) {
      const metaName = selector.match(/^meta\[name="([^"]+)"\]$/);
      if (metaName) {
        const row = metas.get(`name:${metaName[1]}`);
        if (!row) return null;
        return {
          getAttribute: (a: string) => (a === "content" ? row.content : null),
          setAttribute: (a: string, v: string) => {
            if (a === "content") row.content = v;
            if (a === "name" || a === "property") row.key = v;
          },
        };
      }
      const metaProp = selector.match(/^meta\[property="([^"]+)"\]$/);
      if (metaProp) {
        const row = metas.get(`property:${metaProp[1]}`);
        if (!row) return null;
        return {
          getAttribute: (a: string) => (a === "content" ? row.content : null),
          setAttribute: (a: string, v: string) => {
            if (a === "content") row.content = v;
          },
        };
      }
      const linkRel = selector.match(/^link\[rel="([^"]+)"\]$/);
      if (linkRel) {
        const row = links.get(linkRel[1]);
        if (!row) return null;
        return {
          getAttribute: (a: string) => (a === "href" ? row.href : null),
          set href(v: string) {
            row.href = v;
          },
          get href() {
            return row.href;
          },
          set type(v: string) {
            row.type = v;
          },
          get type() {
            return row.type ?? "";
          },
          set rel(v: string) {
            row.rel = v;
          },
          get rel() {
            return row.rel;
          },
        };
      }
      return null;
    },
    appendChild(el: {
      tagName?: string;
      getAttribute: (a: string) => string | null;
      setAttribute: (a: string, v: string) => void;
      rel?: string;
      href?: string;
      type?: string;
    }) {
      if (el.tagName === "META") {
        const name = el.getAttribute("name");
        const prop = el.getAttribute("property");
        const content = el.getAttribute("content") ?? "";
        if (name) putMeta("name", name, content);
        if (prop) putMeta("property", prop, content);
      }
      if (el.tagName === "LINK" && el.rel) {
        links.set(el.rel, { rel: el.rel, href: el.href ?? "", type: el.type });
      }
      return el;
    },
  };

  return {
    get title() {
      return title;
    },
    set title(v: string) {
      title = v;
    },
    head,
    createElement(tag: string) {
      const attrs: Record<string, string> = {};
      const el = {
        tagName: tag.toUpperCase(),
        getAttribute: (a: string) => attrs[a] ?? null,
        setAttribute: (a: string, v: string) => {
          attrs[a] = v;
        },
        rel: "",
        href: "",
        type: "",
      };
      return el;
    },
  } as unknown as Document;
}

function resolveCustomPageSeo(input: {
  slug: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  robots?: string;
  noindex?: boolean;
}) {
  const title = input.metaTitle || `Fallback ${input.slug}`;
  const description = input.metaDescription || `${input.slug} description`;
  const robots =
    input.robots ??
    `${input.noindex ? "noindex" : "index"}, follow`;
  return resolvePageSeo(null, globalSeo, {
    routePath: `/${input.slug}`,
    entityOverride: {
      title: input.metaTitle || undefined,
      description: input.metaDescription || undefined,
      canonical: input.canonical || undefined,
      robots,
      noindex: !!input.noindex,
      nofollow: false,
    },
    fallback: {
      title,
      description,
      canonical: input.canonical || `https://yaarzo.com/${input.slug}`,
      robots,
      noindex: !!input.noindex,
      nofollow: false,
    },
  });
}

describe("Custom Page document title ownership", () => {
  it("1. /lahore-chat-room resolves its page-specific SEO title", () => {
    const seo = resolveCustomPageSeo({
      slug: "lahore-chat-room",
      metaTitle: LAHORE_TITLE,
      metaDescription: LAHORE_DESC,
      canonical: LAHORE_CANONICAL,
      robots: LAHORE_ROBOTS,
    });
    expect(seo.title).toBe(LAHORE_TITLE);
    expect(seo.title).not.toBe(GLOBAL_TITLE);
  });

  it("2. root/global default_title does not win over page meta_title", () => {
    const seo = resolveCustomPageSeo({
      slug: "lahore-chat-room",
      metaTitle: LAHORE_TITLE,
      metaDescription: LAHORE_DESC,
      canonical: LAHORE_CANONICAL,
    });
    expect(seo.title).toBe(LAHORE_TITLE);
    expect(globalSeo.default_title).toBe(GLOBAL_TITLE);
    expect(seo.title).not.toContain("Dosti, Chatrooms and Social Community");
  });

  it("3. client hydration brand chrome preserves route-owned title/description/robots/canonical", () => {
    const seo = resolveCustomPageSeo({
      slug: "lahore-chat-room",
      metaTitle: LAHORE_TITLE,
      metaDescription: LAHORE_DESC,
      canonical: LAHORE_CANONICAL,
      robots: LAHORE_ROBOTS,
    });
    const head = createSeoRouteHead(seo, globalSeo);
    const titleMeta = head.meta.find((m) => "title" in m && m.title);
    expect(titleMeta?.title).toBe(LAHORE_TITLE);

    const doc = makeDoc({
      title: seo.title,
      description: seo.description,
      robots: seo.robots,
      canonical: seo.canonical,
      ogTitle: seo.ogTitle,
      keywords: seo.keywords || undefined,
    });
    const before = readRouteOwnedSeo(doc);

    // Simulates DynamicBrandHead after seo-global query resolves (hydration).
    applyBrandChromeToDocument(doc, {
      themeColor: globalSeo.theme_color,
      siteName: globalSeo.site_name,
      shortName: "Yaarzo",
      author: globalSeo.author,
      twitterSite: globalSeo.twitter_site,
      favicon: "/favicon-blue.png",
    });

    const after = readRouteOwnedSeo(doc);
    expect(after.title).toBe(before.title);
    expect(after.title).toBe(LAHORE_TITLE);
    expect(after.description).toBe(before.description);
    expect(after.robots).toBe(before.robots);
    expect(after.canonical).toBe(before.canonical);
    expect(after.ogTitle).toBe(before.ogTitle);
    expect(after.keywords).toBe(before.keywords);

    // Legacy bug: assigning global default_title would wipe the page title.
    const legacyOverwrite = globalSeo.default_title!;
    expect(legacyOverwrite).toBe(GLOBAL_TITLE);
    expect(after.title).not.toBe(legacyOverwrite);
  });

  it("4. client-side navigation between Custom Pages changes title correctly", () => {
    const lahore = resolveCustomPageSeo({
      slug: "lahore-chat-room",
      metaTitle: LAHORE_TITLE,
      metaDescription: LAHORE_DESC,
      canonical: LAHORE_CANONICAL,
    });
    const pakistan = resolveCustomPageSeo({
      slug: "pakistan-chat-room",
      metaTitle: PAKISTAN_TITLE,
      metaDescription: "Join free Pakistan chat rooms on Yaarzo.",
      canonical: "https://yaarzo.com/pakistan-chat-room",
    });
    const india = resolveCustomPageSeo({
      slug: "india-chat-room",
      metaTitle: INDIA_TITLE,
      metaDescription: "Join free India chat rooms on Yaarzo.",
      canonical: "https://yaarzo.com/india-chat-room",
    });

    expect(lahore.title).toBe(LAHORE_TITLE);
    expect(pakistan.title).toBe(PAKISTAN_TITLE);
    expect(india.title).toBe(INDIA_TITLE);
    expect(new Set([lahore.title, pakistan.title, india.title]).size).toBe(3);

    // headFromRouteSeo mirrors /$slug head() after each navigation loader.
    const lahoreHead = headFromRouteSeo({
      seo: lahore,
      global: globalSeo,
    } as RouteSeoLoaderData);
    const pakistanHead = headFromRouteSeo({
      seo: pakistan,
      global: globalSeo,
    } as RouteSeoLoaderData);
    expect(lahoreHead.meta.find((m) => m.title)?.title).toBe(LAHORE_TITLE);
    expect(pakistanHead.meta.find((m) => m.title)?.title).toBe(PAKISTAN_TITLE);

    const doc = makeDoc({
      title: lahore.title,
      description: lahore.description,
      robots: lahore.robots,
      canonical: lahore.canonical,
    });
    // Navigate Lahore → Pakistan (route head updates), then brand chrome re-applies.
    doc.title = pakistan.title;
    const desc = doc.head.querySelector('meta[name="description"]');
    desc?.setAttribute("content", pakistan.description);
    const canon = doc.head.querySelector('link[rel="canonical"]') as { href: string } | null;
    if (canon) canon.href = pakistan.canonical;

    applyBrandChromeToDocument(doc, {
      themeColor: globalSeo.theme_color,
      siteName: globalSeo.site_name,
    });
    expect(doc.title).toBe(PAKISTAN_TITLE);
    expect(readRouteOwnedSeo(doc).canonical).toBe("https://yaarzo.com/pakistan-chat-room");
  });

  it("5. routes without page-specific SEO may still use the global fallback title", () => {
    const seo = resolvePageSeo(null, globalSeo, {
      routePath: "/some-route-without-page-seo",
      fallback: {},
    });
    expect(seo.title).toBe(GLOBAL_TITLE);
  });

  it("canonical, description and robots remain owned by resolvePageSeo / route head", () => {
    const seo = resolveCustomPageSeo({
      slug: "girls-chat-room",
      metaTitle: "Girls Chat Room | Free Online Chat on Yaarzo",
      metaDescription: "Free girls chat rooms on Yaarzo.",
      canonical: "https://yaarzo.com/girls-chat-room",
      robots: "index, follow",
    });
    expect(seo.description).toBe("Free girls chat rooms on Yaarzo.");
    expect(seo.canonical).toBe("https://yaarzo.com/girls-chat-room");
    expect(seo.robots).toBe("index, follow");

    const head = createSeoRouteHead(seo, globalSeo);
    expect(head.links.some((l) => l.rel === "canonical" && l.href === seo.canonical)).toBe(true);
    expect(head.meta.some((m) => m.name === "description" && m.content === seo.description)).toBe(true);
    expect(head.meta.some((m) => m.name === "robots" && m.content === seo.robots)).toBe(true);

    expect(ROUTE_OWNED_SEO_KEYS).toContain("description");
    expect(ROUTE_OWNED_SEO_KEYS).toContain("robots");
    expect(ROUTE_OWNED_SEO_KEYS).toContain("og:title");
  });
});

describe("applyBrandChromeToDocument contract", () => {
  let doc: Document;

  beforeEach(() => {
    doc = makeDoc({
      title: LAHORE_TITLE,
      description: LAHORE_DESC,
      robots: LAHORE_ROBOTS,
      canonical: LAHORE_CANONICAL,
      ogTitle: LAHORE_TITLE,
    });
  });

  it("never assigns document.title from global default_title", () => {
    applyBrandChromeToDocument(doc, {
      siteName: "Yaarzo",
      themeColor: "#3B82F6",
    });
    expect(doc.title).toBe(LAHORE_TITLE);
  });

  it("may set theme-color and og:site_name without touching SEO title", () => {
    applyBrandChromeToDocument(doc, {
      themeColor: "#112233",
      siteName: "Yaarzo",
    });
    expect(doc.title).toBe(LAHORE_TITLE);
    expect(
      doc.head.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
    ).toBe("#112233");
    expect(
      doc.head.querySelector('meta[property="og:site_name"]')?.getAttribute("content"),
    ).toBe("Yaarzo");
  });
});
