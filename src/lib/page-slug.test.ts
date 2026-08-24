import { describe, it, expect } from "vitest";
import {
  slugifyPageSlug,
  extractSlugInput,
  validatePageSlug,
  pagePublicPath,
} from "./page-slug";

describe("page-slug", () => {
  it("converts Indian Chat Room to indian-chat-room", () => {
    expect(slugifyPageSlug("Indian Chat Room")).toBe("indian-chat-room");
  });

  it("normalizes multiple spaces and underscores", () => {
    expect(slugifyPageSlug("Indian   Chat_Room")).toBe("indian-chat-room");
  });

  it("preserves numbers", () => {
    expect(slugifyPageSlug("Best Chat Room 2026")).toBe("best-chat-room-2026");
  });

  it("extracts slug from path and full URL", () => {
    expect(slugifyPageSlug("/indian-chat-room/")).toBe("indian-chat-room");
    expect(slugifyPageSlug("https://domain.com/indian-chat-room")).toBe("indian-chat-room");
    expect(slugifyPageSlug("domain.com/indian-chat-room")).toBe("indian-chat-room");
  });

  it("strips special characters", () => {
    expect(slugifyPageSlug("Hello! @World #2026")).toBe("hello-world-2026");
  });

  it("rejects reserved slugs", () => {
    expect(validatePageSlug("admin")).toMatch(/reserved/i);
    expect(validatePageSlug("welcome")).toMatch(/reserved/i);
    expect(validatePageSlug("competitions")).toMatch(/reserved/i);
  });

  it("requires slug when publishing", () => {
    expect(validatePageSlug("", { required: true })).toMatch(/required/i);
  });

  it("keeps hyphens in public path", () => {
    expect(pagePublicPath("indian-chat-room")).toBe("/indian-chat-room");
  });

  it("does not delete spaces without hyphenation (regression)", () => {
    const badPattern = "Indian Chat Room"
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    expect(badPattern).toBe("indianchatroom");
    expect(slugifyPageSlug("Indian Chat Room")).not.toBe("indianchatroom");
  });

  it("extractSlugInput handles bare slug", () => {
    expect(extractSlugInput("indian-chat-room")).toBe("indian-chat-room");
  });
});

import {
  applyTemplate,
  resolvePageSeo,
  siteOrigin,
  DEFAULT_SITE_ORIGIN,
  buildCanonicalUrl,
} from "./seo/resolve-seo";
import { stripUnresolvedTemplateVars } from "./seo/meta-builder";
import { buildHeadMeta, buildJsonLdScripts } from "./seo/meta-builder";
import { privateRouteDefaultForm } from "./seo/edit-form";
import { staticSitemapEntries, customPageSitemapEntries } from "./seo/sitemap";
import type { SeoGlobal, SeoPageRow } from "./seo/types";

const globalDefaults: SeoGlobal = {
  id: 1,
  site_name: "Yaarzo",
  site_tagline: "Community",
  default_title: "Yaarzo — Home",
  default_description: "Default site description",
  default_keywords: null,
  canonical_domain: "https://example.com",
  robots: "index,follow",
  theme_color: null,
  author: null,
  language: null,
  default_og_image: "/og/default.png",
  twitter_card: "summary_large_image",
  twitter_site: null,
  twitter_creator: null,
  facebook_app_id: null,
  google_verification: null,
  bing_verification: null,
  yandex_verification: null,
  baidu_verification: null,
};

describe("seo runtime", () => {
  it("static route admin override wins over fallback", () => {
    const page: SeoPageRow = {
      page_key: "feed",
      route_path: "/feed",
      label: "Feed",
      enabled: true,
      title: "Admin Feed Title",
      description: "Admin feed description",
      keywords: null,
      canonical_url: "https://example.com/feed",
      og_title: "Admin OG Feed",
      og_description: "Admin OG desc",
      og_image: "/og/feed.png",
      twitter_card: null,
      twitter_title: null,
      twitter_description: null,
      twitter_image: null,
      robots: null,
      json_ld: null,
      sitemap_priority: 0.5,
      sitemap_changefreq: "weekly",
      sitemap_exclude: false,
      noindex: false,
      nofollow: false,
      is_dynamic: false,
      auto_discovered: false,
    };
    const resolved = resolvePageSeo(page, globalDefaults, {
      routePath: "/feed",
      fallback: { title: "Feed", description: "Route fallback" },
    });
    expect(resolved.title).toBe("Admin Feed Title");
    expect(resolved.ogImage).toBe("https://example.com/og/feed.png");
  });

  it("resolves competition template variables", () => {
    const resolved = resolvePageSeo(
      {
        page_key: "competition-detail",
        route_path: "/competitions/$slug",
        label: "Competition",
        enabled: true,
        title: "{{competition_name}} – Vote | {{site_name}}",
        description: "{{description}}",
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: null,
        json_ld: null,
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: false,
        noindex: false,
        nofollow: false,
        is_dynamic: true,
        auto_discovered: false,
      },
      globalDefaults,
      {
        routePath: "/competitions/summer-battle",
        vars: { competition_name: "Summer Battle", site_name: "Yaarzo", description: "Vote now" },
        fallback: { title: "Fallback", description: "Fallback desc" },
      },
    );
    expect(resolved.title).toBe("Summer Battle – Vote | Yaarzo");
  });

  it("resolves community template variables", () => {
    const resolved = resolvePageSeo(
      {
        page_key: "community-detail",
        route_path: "/community/$slug",
        label: "Community",
        enabled: true,
        title: "{{community_name}} on {{site_name}}",
        description: "{{description}}",
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: null,
        json_ld: null,
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: false,
        noindex: false,
        nofollow: false,
        is_dynamic: true,
        auto_discovered: false,
      },
      globalDefaults,
      {
        routePath: "/community/gamers",
        vars: { community_name: "Gamers", site_name: "Yaarzo", description: "Join us" },
        fallback: { title: "Community", description: "Join" },
      },
    );
    expect(resolved.title).toBe("Gamers on Yaarzo");
  });

  it("prefers entity poetry seo fields", () => {
    const resolved = resolvePageSeo(null, globalDefaults, {
      routePath: "/poetry/my-poem",
      entityOverride: { title: "Custom Poem Title", description: "Custom desc" },
      fallback: { title: "Poem · Poetry Hub", description: "Fallback" },
    });
    expect(resolved.title).toBe("Custom Poem Title");
  });

  it("resolves profile template variables", () => {
    const resolved = resolvePageSeo(
      {
        page_key: "profile",
        route_path: "/u/$username",
        label: "Profile",
        enabled: true,
        title: "{{name}} (@{{username}}) | {{site_name}}",
        description: "{{bio}}",
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: null,
        json_ld: null,
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: false,
        noindex: false,
        nofollow: false,
        is_dynamic: true,
        auto_discovered: false,
      },
      globalDefaults,
      {
        routePath: "/u/jane",
        vars: { name: "Jane Doe", username: "jane", site_name: "Yaarzo", bio: "Writer" },
        fallback: { title: "Jane", description: "Bio" },
      },
    );
    expect(resolved.title).toBe("Jane Doe (@jane) | Yaarzo");
  });

  it("uses route fallback when seo_settings disabled", () => {
    const resolved = resolvePageSeo(
      {
        page_key: "feed",
        route_path: "/feed",
        label: "Feed",
        enabled: false,
        title: "Should not use",
        description: null,
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: null,
        json_ld: null,
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: false,
        noindex: false,
        nofollow: false,
        is_dynamic: false,
        auto_discovered: false,
      },
      globalDefaults,
      { routePath: "/feed", fallback: { title: "Feed Fallback", description: "From route head()" }, routeDefaultsOnly: true },
    );
    expect(resolved.title).toBe("Feed Fallback");
  });

  it("routeDefaultsOnly keeps global canonical domain for origin", () => {
    const resolved = resolvePageSeo(
      null,
      globalDefaults,
      { routePath: "/", fallback: { title: "Home Fallback" }, routeDefaultsOnly: true },
    );
    expect(resolved.title).toBe("Home Fallback");
    expect(resolved.canonical).toBe("https://example.com/");
  });

  it("entity override beats template", () => {
    const resolved = resolvePageSeo(
      {
        page_key: "competition-detail",
        route_path: "/competitions/$slug",
        label: "Competition",
        enabled: true,
        title: "{{competition_name}} template",
        description: "template desc",
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: null,
        json_ld: null,
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: false,
        noindex: false,
        nofollow: false,
        is_dynamic: true,
        auto_discovered: false,
      },
      globalDefaults,
      {
        routePath: "/competitions/x",
        vars: { competition_name: "From Vars" },
        entityOverride: { title: "Entity Title" },
        fallback: { title: "Fallback Title" },
      },
    );
    expect(resolved.title).toBe("Entity Title");
  });

  it("strips unresolved template variables", () => {
    expect(stripUnresolvedTemplateVars("Hello {{missing}} world")).toBe("Hello world");
    expect(applyTemplate("{{known}} and {{missing}}", { known: "Yes" })).toBe("Yes and");
  });

  it("defaults private routes to noindex", () => {
    const defaults = privateRouteDefaultForm();
    const resolved = resolvePageSeo(null, null, {
      routePath: "/login",
      fallback: {
        title: "Login",
        description: "Sign in",
        noindex: defaults.index === false,
        nofollow: defaults.follow === false,
        robots: "noindex, nofollow",
      },
    });
    expect(resolved.robots).toContain("noindex");
  });

  it("builds absolute canonical urls", () => {
    expect(buildCanonicalUrl("https://example.com", "/feed/")).toBe("https://example.com/feed");
    expect(
      buildCanonicalUrl("https://example.com", "/competitions/foo", "https://example.com/competitions/foo?ref=abc"),
    ).toBe("https://example.com/competitions/foo");
  });

  it("normalizes legacy host-without-scheme and path-only CMS canonicals", () => {
    const origin = "https://yaarzo.com";
    expect(buildCanonicalUrl(origin, "/delhi-chat-room", "yaarzo.com/delhi-chat-room")).toBe(
      "https://yaarzo.com/delhi-chat-room",
    );
    expect(buildCanonicalUrl(origin, "/delhi-chat-room", "/delhi-chat-room")).toBe(
      "https://yaarzo.com/delhi-chat-room",
    );
    expect(buildCanonicalUrl(origin, "/delhi-chat-room", "https://yaarzo.com/delhi-chat-room")).toBe(
      "https://yaarzo.com/delhi-chat-room",
    );
    expect(buildCanonicalUrl(origin, "/foo", "yaarzo.com/foo")).toBe("https://yaarzo.com/foo");
    expect(buildCanonicalUrl(origin, "/foo", "/foo")).toBe("https://yaarzo.com/foo");
    expect(buildCanonicalUrl(origin, "/foo", "https://yaarzo.com/foo")).toBe("https://yaarzo.com/foo");
  });

  it("ignores title-text canonical overrides and lovable hosts", () => {
    expect(
      buildCanonicalUrl(
        "https://yaarzo.com",
        "/multan-chat-room",
        "Multan chat room | Free Online Chat on Yaarzo",
      ),
    ).toBe("https://yaarzo.com/multan-chat-room");
    expect(
      buildCanonicalUrl("https://yaarzo.com", "/missing", "https://holo-chat-quest.lovable.app/missing"),
    ).toBe("https://yaarzo.com/missing");
  });

  it("uses a trailing slash only for the homepage canonical", () => {
    expect(buildCanonicalUrl("https://yaarzo.com", "/")).toBe("https://yaarzo.com/");
    expect(buildCanonicalUrl("https://yaarzo.com", "/chatroom")).toBe("https://yaarzo.com/chatroom");
  });

  it("excludes private pages from sitemap", () => {
    const pages: SeoPageRow[] = [
      {
        page_key: "login",
        route_path: "/login",
        label: "Login",
        enabled: true,
        title: "Login",
        description: null,
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: "noindex,nofollow",
        json_ld: null,
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: true,
        noindex: true,
        nofollow: true,
        is_dynamic: false,
        auto_discovered: false,
      },
      {
        page_key: "feed",
        route_path: "/feed",
        label: "Feed",
        enabled: true,
        title: "Feed",
        description: null,
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: null,
        json_ld: null,
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: false,
        noindex: false,
        nofollow: false,
        is_dynamic: false,
        auto_discovered: false,
      },
    ];
    const staticEntries = staticSitemapEntries(pages, globalDefaults);
    expect(staticEntries.some((e) => e.loc.includes("/login"))).toBe(false);
    expect(staticEntries.some((e) => e.loc.endsWith("/feed"))).toBe(true);
  });

  it("excludes noindex CMS pages from sitemap", () => {
    const cms = customPageSitemapEntries(
      [{ slug: "hidden-page", noindex: true }, { slug: "public-page", noindex: false }],
      new Set(),
      globalDefaults,
    );
    expect(cms).toHaveLength(1);
  });

  it("outputs single JSON-LD block and prefers admin JSON-LD", () => {
    const fallback = resolvePageSeo(null, globalDefaults, {
      routePath: "/competitions/x",
      fallback: {
        title: "Event",
        description: "Desc",
        jsonLd: { "@context": "https://schema.org", "@type": "Event", name: "Fallback Event" },
      },
    });
    expect(buildJsonLdScripts(fallback.jsonLd)).toHaveLength(1);

    const admin = resolvePageSeo(
      {
        page_key: "competition-detail",
        route_path: "/competitions/$slug",
        label: "Competition",
        enabled: true,
        title: "Comp",
        description: "Desc",
        keywords: null,
        canonical_url: null,
        og_title: null,
        og_description: null,
        og_image: null,
        twitter_card: null,
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
        robots: null,
        json_ld: { "@context": "https://schema.org", "@type": "Event", name: "Admin Event" },
        sitemap_priority: 0.5,
        sitemap_changefreq: "weekly",
        sitemap_exclude: false,
        noindex: false,
        nofollow: false,
        is_dynamic: true,
        auto_discovered: false,
      },
      globalDefaults,
      {
        routePath: "/competitions/x",
        fallback: {
          title: "Comp",
          jsonLd: { "@context": "https://schema.org", "@type": "Event", name: "Fallback Event" },
        },
      },
    );
    expect(admin.jsonLd?.name).toBe("Admin Event");
  });

  it("includes social meta tags in head builder", () => {
    const resolved = resolvePageSeo(null, null, {
      routePath: "/feed",
      fallback: {
        title: "Feed",
        description: "Desc",
        ogTitle: "OG Feed",
        ogImage: "https://example.com/a.png",
        twitterImage: "https://example.com/a.png",
      },
      routeDefaultsOnly: true,
    });
    const meta = buildHeadMeta(resolved, globalDefaults);
    expect(meta.some((m) => m.property === "og:title" && m.content === "OG Feed")).toBe(true);
    expect(meta.some((m) => m.name === "twitter:image")).toBe(true);
  });

  it("uses DEFAULT_SITE_ORIGIN when global domain missing", () => {
    expect(siteOrigin(null)).toBe(DEFAULT_SITE_ORIGIN);
  });
});
