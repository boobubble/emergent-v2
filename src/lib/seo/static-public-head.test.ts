import { describe, expect, it } from "vitest";
import { createSeoRouteHead, staticPublicHead } from "./route-head";
import { DEFAULT_SITE_ORIGIN } from "./resolve-seo";

describe("staticPublicHead", () => {
  it("emits a self-referencing canonical for hardcoded public routes", () => {
    const blog = staticPublicHead({
      title: "Blog — Yaarzo",
      description: "Tips on making friends online.",
      path: "/blog",
    });
    expect(blog.links).toEqual([{ rel: "canonical", href: `${DEFAULT_SITE_ORIGIN}/blog` }]);
    expect(blog.meta.some((m) => m.title === "Blog — Yaarzo")).toBe(true);

    expect(staticPublicHead({ title: "Achievements", description: "Badges.", path: "/achievements" }).links[0]?.href).toBe(
      `${DEFAULT_SITE_ORIGIN}/achievements`,
    );
    expect(
      staticPublicHead({ title: "Site Directory | Yaarzo", description: "Browse pages.", path: "/site-directory" }).links[0]
        ?.href,
    ).toBe(`${DEFAULT_SITE_ORIGIN}/site-directory`);
  });

  it("createSeoRouteHead still includes canonical from resolved SEO", () => {
    const head = createSeoRouteHead({
      title: "Feed",
      description: "Share posts.",
      keywords: "",
      canonical: "https://yaarzo.com/feed",
      robots: "index, follow",
      ogTitle: "Feed",
      ogDescription: "Share posts.",
      ogImage: "",
      ogType: "website",
      twitterCard: "summary_large_image",
      twitterTitle: "Feed",
      twitterDescription: "Share posts.",
      twitterImage: "",
      jsonLd: null,
      noindex: false,
      nofollow: false,
    });
    expect(head.links.some((l) => l.rel === "canonical" && l.href === "https://yaarzo.com/feed")).toBe(true);
  });
});
