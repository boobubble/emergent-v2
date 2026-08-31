import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { ExploreFeaturesLinks } from "@/components/ExploreFeaturesLinks";
import { PublicCmsPageView } from "@/components/PublicCmsPageView";
import {
  exploreFeatureGraphLinks,
  isExploreFeatureTarget,
  pickExploreFeatureLinks,
  type ExploreFeatureTarget,
} from "@/lib/explore-features-links";
import { buildOrphanReport } from "@/lib/internal-linking-orphans";

const pool: ExploreFeatureTarget[] = [
  { url: "/games", title: "Games", type: "game", category: null },
  { url: "/leaderboard", title: "Leaderboard", type: "community_page", category: "Platform Feature" },
  { url: "/confessions", title: "Confessions", type: "community_page", category: null },
  { url: "/find-friends", title: "Find Friends", type: "community_page", category: null },
  { url: "/teen-chat-room", title: "Teen Chat Room for Ages 13–16: Safer Place", type: "seo_page", category: "type" },
  { url: "/desi-chat-room", title: "Desi Chat Room | Yaarzo", type: "seo_page", category: "type" },
  { url: "/p/group-chat-room", title: "Group Chat Room", type: "seo_page", category: "type" },
  { url: "/lahore-chat-room", title: "Lahore Chat Room", type: "seo_page", category: "pakistan_city" },
  { url: "/spain-chat-room", title: "Spain Chat Room", type: "seo_page", category: "country" },
  { url: "/privacy-policy", title: "Privacy Policy", type: "seo_page", category: "legal" },
];

describe("isExploreFeatureTarget", () => {
  it("includes platform types and topic seo_pages, excludes city/country/legal", () => {
    expect(isExploreFeatureTarget(pool[0]!)).toBe(true);
    expect(isExploreFeatureTarget(pool[4]!)).toBe(true);
    expect(isExploreFeatureTarget(pool[7]!)).toBe(false);
    expect(isExploreFeatureTarget(pool[8]!)).toBe(false);
    expect(isExploreFeatureTarget(pool[9]!)).toBe(false);
  });
});

describe("pickExploreFeatureLinks", () => {
  it("emits canonical /{slug} hrefs (never /p/) and skips the current page", () => {
    const links = pickExploreFeatureLinks("teen-chat-room", pool, { count: 4 });
    expect(links).toHaveLength(4);
    expect(links.every((l) => l.href.startsWith("/") && !l.href.startsWith("/p/"))).toBe(true);
    expect(links.some((l) => l.href === "/teen-chat-room")).toBe(false);
    expect(links.some((l) => l.href === "/group-chat-room")).toBe(true);
  });

  it("is deterministic per slug and varies across slugs", () => {
    const a = pickExploreFeatureLinks("lahore-chat-room", pool, { count: 4 });
    const a2 = pickExploreFeatureLinks("lahore-chat-room", pool, { count: 4 });
    const b = pickExploreFeatureLinks("spain-chat-room", pool, { count: 4 });
    const c = pickExploreFeatureLinks("karachi-chat-room", pool, { count: 4 });
    expect(a).toEqual(a2);
    const keys = [a, b, c].map((set) => set.map((l) => l.href).join(","));
    expect(new Set(keys).size).toBeGreaterThan(1);
  });
});

describe("ExploreFeaturesLinks SSR", () => {
  it("renders crawlable chips on a sample CMS page", () => {
    const links = pickExploreFeatureLinks("lahore-chat-room", pool, { count: 4 });
    const page = {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "lahore-chat-room",
      title: "Lahore Chat Room",
      h1: "Lahore Chat Room",
      content: "<p>Hello Lahore.</p>",
      publicHtml: "<p>Hello Lahore.</p>",
      excerpt: null,
      tags: [],
      layout: "boxed",
      sidebar_left: "none",
      sidebar_right: "none",
      views: 1,
      relatedChatRooms: [],
      exploreFeatureLinks: links,
    };
    const body = renderToString(React.createElement(PublicCmsPageView, { page: page as never }));
    expect(body).toContain("Explore more on Yaarzo");
    expect(body).toContain("explore-features-links");
    for (const link of links) {
      expect(body).toContain(`href="${link.href}"`);
    }
    const chipHtml = renderToString(React.createElement(ExploreFeaturesLinks, { links }));
    expect(chipHtml).toContain("<a");
    expect(chipHtml).not.toContain("/p/");
  });
});

describe("orphan report counts explore-feature graph links", () => {
  it("credits incoming to feature targets from the shared picker", () => {
    const tiny: ExploreFeatureTarget[] = [
      { url: "/games", title: "Games", type: "game", category: null },
      { url: "/leaderboard", title: "Leaderboard", type: "community_page", category: null },
    ];
    const graphLinks = exploreFeatureGraphLinks(
      [
        { slug: "lahore-chat-room", canonicalUrl: "/lahore-chat-room" },
        { slug: "spain-chat-room", canonicalUrl: "/spain-chat-room" },
      ],
      tiny,
      { count: 4 },
    );
    expect(graphLinks.filter((g) => g.targetUrl === "/games")).toHaveLength(2);
    const report = buildOrphanReport({
      targets: [
        { url: "/games", title: "Games", type: "game" },
        { url: "/lahore-chat-room", title: "Lahore", type: "seo_page" },
      ],
      documents: [{ canonicalUrl: "/lahore-chat-room", html: "<p>no feature hrefs</p>" }],
      graphLinks,
    });
    const games = [...report.orphans, ...report.lowLinks, ...report.wellLinked].find((r) => r.url === "/games");
    expect(games?.incoming).toBe(2);
    expect(report.orphans.some((o) => o.url === "/games")).toBe(false);
  });
});
