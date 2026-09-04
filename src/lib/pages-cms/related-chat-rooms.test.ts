import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import {
  selectRelatedChatRooms,
  slugFromTargetUrl,
  isCrossCountryGeoLeak,
  isPublicRelatedTarget,
  RELATED_CHAT_ROOMS_MAX,
  RELATED_CHAT_ROOMS_HEADING,
  type RelatedRoomTargetPage,
  type RelatedRoomInternalLink,
} from "./related-chat-rooms";
import { RelatedChatRooms } from "@/components/RelatedChatRooms";
import { PublicCmsPageView } from "@/components/PublicCmsPageView";

const PK = "country-pk";
const IN = "country-in";

function target(
  partial: Partial<RelatedRoomTargetPage> & Pick<RelatedRoomTargetPage, "id" | "slug" | "title">,
): RelatedRoomTargetPage {
  return {
    status: "published",
    noindex: false,
    page_type: "city",
    country_id: PK,
    h1: null,
    link_priority: 0,
    ...partial,
  };
}

const lahoreSource = {
  id: "lahore-id",
  slug: "lahore-chat-room",
  title: "Lahore Chat Rooms",
  page_type: "city",
  country_id: PK,
};

const pkTargets: RelatedRoomTargetPage[] = [
  target({
    id: "pk-hub",
    slug: "pakistan-chat-room",
    title: "Pakistan Chat Room",
    page_type: "country",
    country_id: PK,
    link_priority: 100,
  }),
  target({ id: "karachi", slug: "karachi-chat-room", title: "Karachi Chat Room", link_priority: 90 }),
  target({ id: "islamabad", slug: "islamabad-chat-room", title: "Islamabad Chat Room", link_priority: 85 }),
  target({ id: "rawalpindi", slug: "rawalpindi-chat-room", title: "Rawalpindi Chat Room", link_priority: 80 }),
  target({ id: "faisalabad", slug: "faisalabad-chat-room", title: "Faisalabad Chat Room", link_priority: 75 }),
  target({ id: "multan", slug: "multan-chat-room", title: "Multan Chat Room", link_priority: 70 }),
  target({
    id: "girls",
    slug: "girls-chat-room",
    title: "Girls Chat Room",
    page_type: "category",
    country_id: null,
    link_priority: 60,
  }),
  target({
    id: "friendship",
    slug: "friendship-chat-room",
    title: "Friendship Chat Room",
    page_type: "category",
    country_id: null,
    link_priority: 55,
  }),
  target({
    id: "dating",
    slug: "dating-chat-room",
    title: "Dating Chat Room",
    page_type: "category",
    country_id: null,
    link_priority: 50,
  }),
];

const indiaLeak = target({
  id: "delhi",
  slug: "delhi-chat-room",
  title: "Delhi Chat Room",
  page_type: "city",
  country_id: IN,
  link_priority: 99,
});

const indiaHub = target({
  id: "in-hub",
  slug: "india-chat-room",
  title: "India Chat Room",
  page_type: "country",
  country_id: IN,
  link_priority: 100,
});

const draftTarget = target({
  id: "draft-city",
  slug: "gujranwala-chat-room",
  title: "Gujranwala Chat Room",
  status: "draft",
});

const noindexTarget = target({
  id: "noindex-city",
  slug: "peshawar-chat-room",
  title: "Peshawar Chat Room",
  noindex: true,
});

function mapsFrom(targets: RelatedRoomTargetPage[]) {
  const targetsById = new Map(targets.map((t) => [t.id, t]));
  const targetsBySlug = new Map(targets.map((t) => [t.slug.toLowerCase(), t]));
  return { targetsById, targetsBySlug };
}

function lahoreLinks(): RelatedRoomInternalLink[] {
  return [
    { anchor_text: "Pakistan Chat Room", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 0 },
    { anchor_text: "Karachi Chat Room", target_url: "/karachi-chat-room", target_page_id: "karachi", sort_order: 1 },
    { anchor_text: "Islamabad Chat Room", target_url: "/islamabad-chat-room", target_page_id: "islamabad", sort_order: 2 },
    { anchor_text: "Explore Rawalpindi Chat", target_url: "/rawalpindi-chat-room", target_page_id: "rawalpindi", sort_order: 3 },
    { anchor_text: "Faisalabad Community Chat", target_url: "/faisalabad-chat-room", target_page_id: "faisalabad", sort_order: 4 },
    { anchor_text: "Multan Chat Room", target_url: "/multan-chat-room", target_page_id: "multan", sort_order: 5 },
    { anchor_text: "Girls Chat Room", target_url: "/girls-chat-room", target_page_id: "girls", sort_order: 6 },
    { anchor_text: "Friendship Chat Room", target_url: "/friendship-chat-room", target_page_id: "friendship", sort_order: 7 },
  ];
}

describe("related-chat-rooms selection", () => {
  it("selects up to 4 published related rooms for a Pakistan city page", () => {
    const all = [...pkTargets, indiaLeak, indiaHub, draftTarget, noindexTarget];
    const selected = selectRelatedChatRooms({
      source: lahoreSource,
      links: lahoreLinks(),
      ...mapsFrom(all),
      max: RELATED_CHAT_ROOMS_MAX,
    });
    expect(selected.length).toBe(4);
    expect(selected.map((l) => l.slug)).toEqual([
      "pakistan-chat-room",
      "karachi-chat-room",
      "islamabad-chat-room",
      "rawalpindi-chat-room",
    ]);
    expect(selected.every((l) => l.href.startsWith("/") && !l.href.startsWith("/p/"))).toBe(true);
  });

  it("excludes draft and noindex destinations", () => {
    const selected = selectRelatedChatRooms({
      source: lahoreSource,
      links: [
        ...lahoreLinks(),
        { anchor_text: "Gujranwala", target_url: "/gujranwala-chat-room", target_page_id: "draft-city", sort_order: 20 },
        { anchor_text: "Peshawar", target_url: "/peshawar-chat-room", target_page_id: "noindex-city", sort_order: 21 },
      ],
      ...mapsFrom([...pkTargets, draftTarget, noindexTarget]),
    });
    expect(selected.some((l) => l.slug === "gujranwala-chat-room")).toBe(false);
    expect(selected.some((l) => l.slug === "peshawar-chat-room")).toBe(false);
    expect(isPublicRelatedTarget(draftTarget)).toBe(false);
    expect(isPublicRelatedTarget(noindexTarget)).toBe(false);
  });

  it("never links to the current page and removes duplicate targets", () => {
    const selected = selectRelatedChatRooms({
      source: lahoreSource,
      links: [
        { anchor_text: "Self", target_url: "/lahore-chat-room", target_page_id: "lahore-id", sort_order: 0 },
        { anchor_text: "Karachi A", target_url: "/karachi-chat-room", target_page_id: "karachi", sort_order: 1 },
        { anchor_text: "Karachi B", target_url: "/karachi-chat-room", target_page_id: "karachi", sort_order: 2 },
        { anchor_text: "Pakistan Chat Room", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 3 },
      ],
      ...mapsFrom([
        ...pkTargets,
        target({ id: "lahore-id", slug: "lahore-chat-room", title: "Lahore Chat Rooms" }),
      ]),
    });
    expect(selected.some((l) => l.slug === "lahore-chat-room")).toBe(false);
    expect(selected.filter((l) => l.slug === "karachi-chat-room")).toHaveLength(1);
    expect(selected.find((l) => l.slug === "karachi-chat-room")?.label).toBe("Karachi A");
  });

  it("blocks India/Pakistan city cross-linking", () => {
    expect(isCrossCountryGeoLeak(lahoreSource, indiaLeak)).toBe(true);
    expect(isCrossCountryGeoLeak(lahoreSource, indiaHub)).toBe(true);
    expect(isCrossCountryGeoLeak(lahoreSource, pkTargets[0]!)).toBe(false);

    const selected = selectRelatedChatRooms({
      source: lahoreSource,
      links: [
        { anchor_text: "Delhi Chat Room", target_url: "/delhi-chat-room", target_page_id: "delhi", sort_order: 0 },
        { anchor_text: "India Chat Room", target_url: "/india-chat-room", target_page_id: "in-hub", sort_order: 1 },
        { anchor_text: "Pakistan Chat Room", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 2 },
        { anchor_text: "Karachi Chat Room", target_url: "/karachi-chat-room", target_page_id: "karachi", sort_order: 3 },
      ],
      ...mapsFrom([...pkTargets, indiaLeak, indiaHub]),
    });
    expect(selected.map((l) => l.slug)).toEqual(["pakistan-chat-room", "karachi-chat-room"]);
  });

  it("rejects /p/ URLs and multi-segment paths", () => {
    expect(slugFromTargetUrl("/p/lahore-chat-room")).toBe("");
    expect(slugFromTargetUrl("/hyderabad-chat-room")).toBe("hyderabad-chat-room");
    expect(slugFromTargetUrl("/hyderabad-india-chat-room")).toBe("hyderabad-india-chat-room");
    expect(slugFromTargetUrl("/a/b")).toBe("");
  });

  it("fills remaining slots from same-country published candidates without cross-country leakage", () => {
    const selected = selectRelatedChatRooms({
      source: lahoreSource,
      links: [
        { anchor_text: "Pakistan Chat Room", target_url: "/pakistan-chat-room", target_page_id: "pk-hub", sort_order: 0 },
        { anchor_text: "Karachi Chat Room", target_url: "/karachi-chat-room", target_page_id: "karachi", sort_order: 1 },
      ],
      ...mapsFrom(pkTargets),
      fillCandidates: [...pkTargets, indiaLeak, indiaHub, draftTarget],
      max: RELATED_CHAT_ROOMS_MAX,
    });
    expect(selected.length).toBe(RELATED_CHAT_ROOMS_MAX);
    expect(selected.some((l) => l.slug === "delhi-chat-room")).toBe(false);
    expect(selected.some((l) => l.slug === "india-chat-room")).toBe(false);
    expect(selected.some((l) => l.slug === "pakistan-chat-room")).toBe(true);
    expect(selected[0]?.kind).toBe("country");
  });
});

describe("RelatedChatRooms SSR markup", () => {
  const links = selectRelatedChatRooms({
    source: lahoreSource,
    links: lahoreLinks(),
    ...mapsFrom(pkTargets),
  });

  it("renders section heading and real <a href> anchors in SSR HTML", () => {
    const html = renderToString(React.createElement(RelatedChatRooms, { links }));
    expect(html).toContain(RELATED_CHAT_ROOMS_HEADING);
    expect(html).toContain("related-chat-rooms");
    expect(html.match(/<a\b/gi)?.length ?? 0).toBe(RELATED_CHAT_ROOMS_MAX);
    expect(html).toContain('href="/pakistan-chat-room"');
    expect(html).toContain('href="/karachi-chat-room"');
    expect(html).toContain('href="/islamabad-chat-room"');
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("/p/");
  });

  it("renders inside PublicCmsPageView below article content without altering body HTML", () => {
    const bodyContent =
      '<h2>About Lahore</h2><p>Talk in Lahore.</p><h2>FAQ</h2><h3>Is it free?</h3><p>Yes.</p>';
    const page = {
      id: "lahore-id",
      slug: "lahore-chat-room",
      title: "Lahore Chat Rooms",
      h1: "Lahore Chat Rooms",
      intro_content: null,
      content: bodyContent,
      publicHtml: bodyContent,
      excerpt: null,
      tags: [],
      layout: "boxed",
      sidebar_left: "none",
      sidebar_right: "none",
      meta_title: "Lahore Chat Room | Free Online Lahore Chat Room on Yaarzo",
      meta_description: "Join free Lahore chat rooms.",
      meta_keywords: null,
      og_title: null,
      og_description: null,
      og_image: null,
      canonical_url: "https://yaarzo.com/lahore-chat-room",
      noindex: false,
      nofollow: false,
      views: 1,
      published_at: "2026-08-01T00:00:00Z",
      redirectedFrom: null,
      relatedChatRooms: links,
    };

    const body = renderToString(React.createElement(PublicCmsPageView, { page }));
    const contentIdx = body.indexOf("custom-page-content");
    const relatedIdx = body.indexOf("related-chat-rooms");
    expect(contentIdx).toBeGreaterThan(-1);
    expect(relatedIdx).toBeGreaterThan(contentIdx);
    expect(body).toContain("About Lahore");
    expect(body).toContain("Is it free?");
    expect(body).toContain(RELATED_CHAT_ROOMS_HEADING);
    expect(body).toContain('href="/rawalpindi-chat-room"');
    // Body content unchanged (related not injected into publicHtml)
    expect(page.publicHtml).toBe(bodyContent);
    expect(page.publicHtml).not.toContain("related-chat-rooms");
  });

  it("renders nothing when there are no eligible links", () => {
    const html = renderToString(React.createElement(RelatedChatRooms, { links: [] }));
    expect(html).toBe("");
  });
});
