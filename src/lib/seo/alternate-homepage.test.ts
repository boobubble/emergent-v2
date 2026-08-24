import { describe, it, expect } from "vitest";
import { applyAlternateHomepageRobots, ALTERNATE_HOMEPAGE_ROBOTS } from "./alternate-homepage";
import { headFromRouteSeo, type RouteSeoLoaderData } from "./load-route-seo";
import { applyHomepageSeo, homeRouteHead } from "./home-page";
import type { ResolvedSeo } from "./types";

const landingSeo: ResolvedSeo = {
  title: "Yaarzo – AI-Powered Chatrooms and Social Community",
  description:
    "Join live chatrooms, discover social posts, play games, earn rewards and connect with friends on Yaarzo.",
  keywords: "Yaarzo, chatrooms",
  canonical: "https://yaarzo.com/welcome",
  robots: "index, follow",
  ogTitle: "Yaarzo – AI-Powered Chatrooms and Social Community",
  ogDescription: "Live chatrooms, social feed, games, rewards and friends — all on Yaarzo.",
  ogImage: "https://yaarzo.com/og/yaarzo-share.png",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Yaarzo – AI-Powered Chatrooms and Social Community",
  twitterDescription: "Live chatrooms, social feed, games, rewards and friends — all on Yaarzo.",
  twitterImage: "https://yaarzo.com/og/yaarzo-share.png",
  jsonLd: { "@type": "WebSite" },
  noindex: false,
  nofollow: false,
};

describe("alternate homepage robots", () => {
  it("forces noindex, follow without changing title, description, canonical, or social meta", () => {
    const forced = applyAlternateHomepageRobots(landingSeo);

    expect(forced.robots).toBe(ALTERNATE_HOMEPAGE_ROBOTS);
    expect(forced.noindex).toBe(true);
    expect(forced.nofollow).toBe(false);
    expect(forced.title).toBe(landingSeo.title);
    expect(forced.description).toBe(landingSeo.description);
    expect(forced.canonical).toBe(landingSeo.canonical);
    expect(forced.keywords).toBe(landingSeo.keywords);
    expect(forced.ogTitle).toBe(landingSeo.ogTitle);
    expect(forced.ogDescription).toBe(landingSeo.ogDescription);
    expect(forced.ogImage).toBe(landingSeo.ogImage);
    expect(forced.ogType).toBe(landingSeo.ogType);
    expect(forced.twitterTitle).toBe(landingSeo.twitterTitle);
    expect(forced.twitterDescription).toBe(landingSeo.twitterDescription);
    expect(forced.twitterImage).toBe(landingSeo.twitterImage);
    expect(forced.jsonLd).toEqual(landingSeo.jsonLd);
  });

  it("wins over seo_settings index,follow in the rendered head", () => {
    const loaderData: RouteSeoLoaderData = {
      seo: applyAlternateHomepageRobots(landingSeo),
      global: null,
    };
    const head = headFromRouteSeo(loaderData);
    const robots = head.meta.filter((m) => m.name === "robots");
    expect(robots).toHaveLength(1);
    expect(robots[0]?.content).toBe("noindex, follow");
    expect(head.meta.find((m) => m.title)?.title).toBe(landingSeo.title);
    expect(head.meta.find((m) => m.name === "description")?.content).toBe(landingSeo.description);
  });

  it("does not change the primary homepage robots", () => {
    const head = homeRouteHead({
      seo: applyHomepageSeo({ robots: "index, follow" }),
      global: null,
    });
    expect(head.meta.find((m) => m.name === "robots")?.content).toBe("index, follow");
  });
});
