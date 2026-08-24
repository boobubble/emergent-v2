import { describe, it, expect } from "vitest";
import {
  HOME_SEO_CANONICAL,
  HOME_SEO_DESCRIPTION,
  HOME_SEO_TITLE,
  applyHomepageSeo,
  buildHomeJsonLd,
  homeOgImageFromLoader,
  homeRouteHead,
} from "./home-page";

describe("homepage SEO head", () => {
  it("forces the required title, description, canonical, and social meta", () => {
    const head = homeRouteHead({
      seo: applyHomepageSeo({
        title: "stale db title",
        description: "stale db description",
      }),
      global: {
        id: 1,
        site_name: "Yaarzo",
        site_tagline: null,
        default_title: "global title",
        default_description: "global description",
        default_keywords: null,
        canonical_domain: "https://yaarzo.com",
        robots: "index, follow",
        theme_color: null,
        author: null,
        language: "en",
        default_og_image: "/og/yaarzo-share.png",
        twitter_card: "summary_large_image",
        twitter_site: null,
        twitter_creator: null,
        facebook_app_id: null,
        google_verification: null,
        bing_verification: null,
        yandex_verification: null,
        baidu_verification: null,
      },
    });

    const titles = head.meta.filter((m) => m.title);
    const descriptions = head.meta.filter((m) => m.name === "description");
    const canonicals = head.links.filter((l) => l.rel === "canonical");

    expect(titles).toHaveLength(1);
    expect(titles[0]?.title).toBe(HOME_SEO_TITLE);
    expect(descriptions).toHaveLength(1);
    expect(descriptions[0]?.content).toBe(HOME_SEO_DESCRIPTION);
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0]?.href).toBe(HOME_SEO_CANONICAL);

    const ogTitle = head.meta.find((m) => m.property === "og:title");
    const ogDescription = head.meta.find((m) => m.property === "og:description");
    const ogUrl = head.meta.find((m) => m.property === "og:url");
    const ogType = head.meta.find((m) => m.property === "og:type");
    const ogImage = head.meta.find((m) => m.property === "og:image");
    const twitterCard = head.meta.find((m) => m.name === "twitter:card");

    expect(ogTitle?.content).toBe(HOME_SEO_TITLE);
    expect(ogDescription?.content).toBe(HOME_SEO_DESCRIPTION);
    expect(ogUrl?.content).toBe(HOME_SEO_CANONICAL);
    expect(ogType?.content).toBe("website");
    expect(ogImage?.content).toBe("https://yaarzo.com/og/yaarzo-share.png");
    expect(twitterCard?.content).toBe("summary_large_image");
    expect(head.meta.find((m) => m.name === "robots")?.content).toBe("index, follow");
  });

  it("emits one valid WebSite + Organization JSON-LD graph", () => {
    const jsonLd = buildHomeJsonLd();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@graph"]).toHaveLength(2);
    expect(jsonLd["@graph"][0]).toMatchObject({
      "@type": "WebSite",
      name: "Yaarzo",
      url: HOME_SEO_CANONICAL,
      description: HOME_SEO_DESCRIPTION,
    });
    expect(jsonLd["@graph"][1]).toMatchObject({
      "@type": "Organization",
      name: "Yaarzo",
      url: HOME_SEO_CANONICAL,
    });
    expect(JSON.stringify(jsonLd)).not.toContain("AggregateRating");
    expect(homeRouteHead().scripts).toHaveLength(1);
    expect(() => JSON.parse(homeRouteHead().scripts[0].children)).not.toThrow();
  });

  it("ignores stale admin seo_settings titles in the rendered head", () => {
    const head = homeRouteHead({
      seo: applyHomepageSeo({
        title: "Yaarzo – Chatrooms, Friends and Social Community",
        description: "Join public chatrooms, make friends, share posts, play games and explore communities on Yaarzo.",
      }),
      global: null,
    });
    expect(head.meta.find((m) => m.title)?.title).toBe(HOME_SEO_TITLE);
    expect(head.meta.find((m) => m.name === "description")?.content).toBe(HOME_SEO_DESCRIPTION);
    expect(head.links.filter((l) => l.rel === "canonical")).toHaveLength(1);
    expect(head.meta.filter((m) => m.name === "description")).toHaveLength(1);
  });

  it("reuses the configured OG image and does not invent one", () => {
    expect(homeOgImageFromLoader({ ogImage: "" }, { default_og_image: null })).toBe(
      "https://yaarzo.com/og/yaarzo-share.png",
    );
    expect(
      homeOgImageFromLoader(null, { default_og_image: "/og/yaarzo-share.png" }),
    ).toBe("https://yaarzo.com/og/yaarzo-share.png");
  });
});
